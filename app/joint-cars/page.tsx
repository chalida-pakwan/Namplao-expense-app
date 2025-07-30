'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import Link from 'next/link'
import EnhancedDashboard from '../../components/EnhancedDashboard'
import AdvancedSearch from '../../components/AdvancedSearch'
import DataExport from '../../components/DataExport'
import PDFExport from '../../components/PDFExport'

interface JointCar {
  id: string
  date: string
  brand: string
  model: string
  year: number
  buy_price: number
  sell_price: number
  total_cost: number
  profit: number
  total_investment: number
  status: string
  notes: string
  investors: any[]
  expenses: any[]
  created_at: string
}

export default function JointCarsPage() {
  const router = useRouter()
  const [cars, setCars] = useState<JointCar[]>([])
  const [filteredCars, setFilteredCars] = useState<JointCar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด')
  const [searchTerm, setSearchTerm] = useState('')

  const statusOptions = ['ทั้งหมด', 'กำลังหา', 'ซื้อแล้ว', 'ขายแล้ว', 'ยกเลิก']
  const statusEmojis: { [key: string]: string } = {
    'กำลังหา': '🔍',
    'ซื้อแล้ว': '✅',
    'ขายแล้ว': '💰',
    'ยกเลิก': '❌'
  }

  useEffect(() => {
    fetchCars()
  }, [])

  useEffect(() => {
    filterCars()
  }, [cars, filterStatus, searchTerm])

  const fetchCars = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data, error } = await supabase
        .from('joint_cars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching cars:', error)
      } else {
        setCars(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterCars = () => {
    let filtered = cars

    // Filter by status
    if (filterStatus !== 'ทั้งหมด') {
      filtered = filtered.filter(car => car.status === filterStatus)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(car => 
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.notes.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCars(filtered)
  }

  // คำนวณสถิติ
  const calculateStats = () => {
    const totalInvestment = cars.reduce((sum, car) => sum + car.total_investment, 0)
    const totalProfit = cars.reduce((sum, car) => sum + car.profit, 0)
    const soldCars = cars.filter(car => car.status === 'ขายแล้ว').length
    const activeCars = cars.filter(car => car.status === 'กำลังหา' || car.status === 'ซื้อแล้ว').length

    return { totalInvestment, totalProfit, soldCars, activeCars }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="p-4 pb-20 bg-pastel-cream min-h-screen font-prompt">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
              <p className="text-orange-700">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-20 bg-pastel-cream min-h-screen font-prompt">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-orange-800 mb-2">🚗 รถร่วมลงทุน</h1>
            <p className="text-orange-700">จัดการการลงทุนซื้อรถร่วมกัน</p>
          </div>
          <Link
            href="/joint-cars/new"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-200 font-medium"
          >
            + เพิ่มรถใหม่
          </Link>
        </div>

        {/* สถิติ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md border border-orange-100">
            <div className="text-center">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-lg font-bold text-gray-800">{stats.totalInvestment.toLocaleString()}</div>
              <div className="text-sm text-gray-600">เงินลงทุนรวม</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md border border-green-100">
            <div className="text-center">
              <div className="text-2xl mb-1">📈</div>
              <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalProfit.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">กำไรรวม</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md border border-blue-100">
            <div className="text-center">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-lg font-bold text-gray-800">{stats.soldCars}</div>
              <div className="text-sm text-gray-600">ขายแล้ว</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md border border-yellow-100">
            <div className="text-center">
              <div className="text-2xl mb-1">🔄</div>
              <div className="text-lg font-bold text-gray-800">{stats.activeCars}</div>
              <div className="text-sm text-gray-600">กำลังดำเนินการ</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-orange-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 ค้นหายี่ห้อ, รุ่น, หมายเหตุ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full md:w-auto p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cars List */}
        {filteredCars.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md border border-orange-100 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">ยังไม่มีข้อมูลรถ</h3>
            <p className="text-gray-600 mb-4">เริ่มต้นการลงทุนร่วมกันด้วยการเพิ่มรถคันแรก</p>
            <Link
              href="/joint-cars/new"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-200 font-medium"
            >
              + เพิ่มรถใหม่
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <div key={car.id} className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {car.brand} {car.model}
                      </h3>
                      {car.year && (
                        <p className="text-gray-600">ปี {car.year}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      {statusEmojis[car.status]} {car.status}
                    </span>
                  </div>

                  {/* Financial Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ราคาซื้อ:</span>
                      <span>{car.buy_price.toLocaleString()} บาท</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ราคาขาย:</span>
                      <span>{car.sell_price.toLocaleString()} บาท</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ต้นทุนรวม:</span>
                      <span>{car.total_cost.toLocaleString()} บาท</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t pt-2">
                      <span className="text-gray-600">กำไร:</span>
                      <span className={car.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {car.profit.toLocaleString()} บาท
                      </span>
                    </div>
                  </div>

                  {/* Investors */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">ผู้ลงทุน ({car.investors.length} คน):</p>
                    <div className="space-y-1">
                      {car.investors.slice(0, 3).map((investor, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-gray-600">{investor.name}</span>
                          <span>{parseFloat(investor.amount).toLocaleString()} บาท</span>
                        </div>
                      ))}
                      {car.investors.length > 3 && (
                        <p className="text-xs text-gray-500">และอีก {car.investors.length - 3} คน</p>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-gray-500 mb-4">
                    📅 {new Date(car.date).toLocaleDateString('th-TH')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/joint-cars/${car.id}`}
                      className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition duration-200 text-center text-sm font-medium"
                    >
                      ดูรายละเอียด
                    </Link>
                    <Link
                      href={`/joint-cars/${car.id}/edit`}
                      className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition duration-200 text-sm"
                    >
                      ✏️
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
