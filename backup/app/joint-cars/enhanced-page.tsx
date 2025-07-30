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
  profit: number
  final_profit: number
  total_investment: number
  status: string
  is_profit: boolean
  profit_margin: number
  post_sale_expenses_total: number
  investors: Array<{
    name: string
    email?: string
    amount: number
    share_percentage: number
  }>
  additional_expenses: Array<{
    description: string
    amount: number
    date: string
  }>
  images?: string[]
}

export default function JointCarsPage() {
  const [cars, setCars] = useState<JointCar[]>([])
  const [filteredCars, setFilteredCars] = useState<JointCar[]>([])
  const [selectedCars, setSelectedCars] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'dashboard' | 'list' | 'export'>('dashboard')
  const [searchFilters, setSearchFilters] = useState<any>({})
  const router = useRouter()

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('joint_cars')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching cars:', error)
        return
      }

      setCars(data || [])
      setFilteredCars(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilteredCars: JointCar[]) => {
    setFilteredCars(newFilteredCars)
  }

  const handleFiltersApply = (filters: any) => {
    setSearchFilters(filters)
  }

  const toggleCarSelection = (carId: string) => {
    setSelectedCars(prev => 
      prev.includes(carId)
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    )
  }

  const selectAllCars = () => {
    setSelectedCars(filteredCars.map(car => car.id))
  }

  const clearSelection = () => {
    setSelectedCars([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'กำลังหา': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'ซื้อแล้ว': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'ขายแล้ว': return 'bg-green-100 text-green-700 border-green-300'
      case 'ยกเลิก': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH').format(amount)
  }

  const getCarStats = () => {
    return {
      total: filteredCars.length,
      selected: selectedCars.length,
      profitable: filteredCars.filter(car => car.is_profit).length,
      loss: filteredCars.filter(car => !car.is_profit && car.status === 'ขายแล้ว').length
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🚗 ระบบการลงทุนร่วมซื้อรถ</h1>
            <p className="text-gray-600">จัดการและติดตามการลงทุนรถยนต์แบบครบวงจร</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Link
              href="/joint-cars/new"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              + เพิ่มรถใหม่
            </Link>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {[
              { id: 'dashboard', label: '📊 แดชบอร์ด', icon: '📊' },
              { id: 'list', label: '📋 รายการ', icon: '📋' },
              { id: 'export', label: '📁 ส่งออก', icon: '📁' }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === view.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <EnhancedDashboard />
        )}

        {/* List View */}
        {activeView === 'list' && (
          <div className="space-y-6">
            {/* Advanced Search */}
            <AdvancedSearch 
              onFiltersChange={handleFiltersChange}
              onFiltersApply={handleFiltersApply}
            />

            {/* Selection Controls */}
            {filteredCars.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <span className="text-sm text-gray-600">
                      แสดง {getCarStats().total} รายการ
                      {selectedCars.length > 0 && (
                        <span className="ml-2 font-medium text-orange-600">
                          (เลือก {selectedCars.length} รายการ)
                        </span>
                      )}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={selectAllCars}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        เลือกทั้งหมด
                      </button>
                      {selectedCars.length > 0 && (
                        <button
                          onClick={clearSelection}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          ยกเลิกการเลือก
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600">
                      กำไร: {getCarStats().profitable}
                    </span>
                    <span className="text-red-600">
                      ขาดทุน: {getCarStats().loss}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Car List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <div 
                  key={car.id} 
                  className={`bg-white p-6 rounded-xl shadow-md border-2 transition-all hover:shadow-lg ${
                    selectedCars.includes(car.id) 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedCars.includes(car.id)}
                        onChange={() => toggleCarSelection(car.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-sm text-gray-600">ปี {car.year}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(car.status)}`}>
                      {car.status}
                    </div>
                  </div>

                  {/* Car Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">วันที่:</span>
                      <span className="font-medium">{new Date(car.date).toLocaleDateString('th-TH')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ราคาซื้อ:</span>
                      <span className="font-medium">{formatCurrency(car.buy_price)} บาท</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ราคาขาย:</span>
                      <span className="font-medium">{formatCurrency(car.sell_price)} บาท</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">กำไรสุทธิ:</span>
                      <span className={`font-medium ${(car.final_profit || car.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(car.final_profit || car.profit)} บาท
                      </span>
                    </div>
                    {car.profit_margin && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">อัตรากำไร:</span>
                        <span className={`font-medium ${car.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {car.profit_margin.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Investors Summary */}
                  {car.investors && car.investors.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">ผู้ลงทุน ({car.investors.length} คน)</div>
                      <div className="space-y-1">
                        {car.investors.slice(0, 2).map((investor, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span>{investor.name}</span>
                            <span>{investor.share_percentage}%</span>
                          </div>
                        ))}
                        {car.investors.length > 2 && (
                          <div className="text-xs text-gray-500">
                            และอีก {car.investors.length - 2} คน...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/joint-cars/${car.id}`}
                      className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors text-center text-sm font-medium"
                    >
                      ดูรายละเอียด
                    </Link>
                    <Link
                      href={`/joint-cars/${car.id}/edit`}
                      className="bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-center text-sm font-medium"
                    >
                      แก้ไข
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredCars.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่พบรายการรถ</h3>
                <p className="text-gray-600 mb-6">
                  {searchFilters.searchQuery || Object.values(searchFilters).some(v => v && (Array.isArray(v) ? v.length > 0 : true))
                    ? 'ลองปรับตัวกรองหรือเปลี่ยนคำค้นหา'
                    : 'เริ่มต้นการลงทุนร่วมซื้อรถครั้งแรกของคุณ'
                  }
                </p>
                <Link
                  href="/joint-cars/new"
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  + เพิ่มรถใหม่
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Export View */}
        {activeView === 'export' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataExport 
              cars={filteredCars} 
              selectedCars={selectedCars}
            />
            <PDFExport 
              cars={filteredCars} 
              selectedCars={selectedCars}
            />
          </div>
        )}
      </div>
    </div>
  )
}
