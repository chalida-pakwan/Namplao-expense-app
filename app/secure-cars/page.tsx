'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'

interface SecureCar {
  id: string
  car_code: string
  brand: string
  model: string
  year: number
  buy_price: number
  sell_price: number | null
  status: string
  user_id: string  // ✅ แก้จาก created_by เป็น user_id ตาม database schema
  created_at: string
  member_count?: number
  total_expenses?: number
  my_expenses?: number
}

export default function SecureCarsPage() {
  const [cars, setCars] = useState<SecureCar[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth')
        return
      }

      setCurrentUser(user)
      await loadSecureCars(user.id)
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/auth')
    }
  }

  const loadSecureCars = async (userId: string) => {
    try {
      setLoading(true)
      console.log('🔍 Loading secure cars for user:', userId)

      // ดึงรถที่ผู้ใช้เป็นสมาชิก ผ่าน car_members table
      const { data: memberData, error: memberError } = await supabase
        .from('car_members')
        .select('car_id')
        .eq('user_id', userId)

      if (memberError) {
        console.error('Error fetching member data:', memberError)
        toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก')
        return
      }

      console.log('👥 Member data:', memberData)

      const carIds = memberData?.map(member => member.car_id) || []
      
      if (carIds.length === 0) {
        console.log('📦 No cars found for user')
        setCars([])
        return
      }

      // ดึงข้อมูลรถจาก joint_cars table
      const { data: carsData, error: carsError } = await supabase
        .from('joint_cars')
        .select(`
          id,
          car_code,
          brand,
          model,
          year,
          buy_price,
          sell_price,
          status,
          user_id,
          created_at
        `)
        .in('id', carIds)
        .order('created_at', { ascending: false })

      if (carsError) {
        console.error('Error fetching cars:', carsError)
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลรถ')
        return
      }

      console.log('🚗 Cars data:', carsData)

      if (!carsData || carsData.length === 0) {
        setCars([])
        return
      }

      // ดึงสถิติเพิ่มเติมสำหรับแต่ละรถ
      const carsWithStats = await Promise.all(
        carsData.map(async (car) => {
          // นับจำนวนสมาชิก
          const { count: memberCount } = await supabase
            .from('car_members')
            .select('*', { count: 'exact' })
            .eq('car_id', car.id)

          // รวมค่าใช้จ่ายทั้งหมด (ใช้ joint_car_additional_expenses ตาม schema หลัก)
          const { data: totalExpenses } = await supabase
            .from('joint_car_additional_expenses')
            .select('amount')
            .eq('joint_car_id', car.id)

          const totalAmount = totalExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0

          // รวมค่าใช้จ่ายของผู้ใช้ (ใช้ joint_car_additional_expenses)  
          const { data: myExpenses } = await supabase
            .from('joint_car_additional_expenses')
            .select('amount')
            .eq('joint_car_id', car.id)
            .eq('added_by', userId)

          const myAmount = myExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0

          return {
            ...car,
            member_count: memberCount || 0,
            total_expenses: totalAmount,
            my_expenses: myAmount
          }
        })
      )

      setCars(carsWithStats)
      console.log('✅ Secure cars loaded successfully:', carsWithStats.length)
    } catch (error) {
      console.error('Error fetching cars:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
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

  // Filter cars based on search and status
  const filteredCars = cars.filter(car => {
    const matchesSearch = (
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.car_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const matchesStatus = statusFilter === 'all' || car.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">🚗 กำลังโหลดข้อมูลรถ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-blue-600">🔐</span>
                ระบบหารรถแบบปลอดภัย
              </h1>
              <p className="text-gray-600 mt-1">รถที่คุณเป็นสมาชิก • ระบบรหัสเฉพาะ</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/secure-cars/new"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <span>🆕</span>
              สร้างรถใหม่
            </Link>
            <Link
              href="/secure-cars/join"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <span>🔓</span>
              เข้าร่วมรถด้วยรหัส
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="ค้นหารถ (ยี่ห้อ, รุ่น, รหัส)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="กำลังหา">กำลังหา</option>
              <option value="ซื้อแล้ว">ซื้อแล้ว</option>
              <option value="ขายแล้ว">ขายแล้ว</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>
          </div>
        </div>

        {/* Cars Grid */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {cars.length === 0 ? 'ยังไม่มีรถที่เข้าร่วม' : 'ไม่พบรถที่ค้นหา'}
            </h3>
            <p className="text-gray-500 mb-6">
              {cars.length === 0 
                ? 'เข้าร่วมรถด้วยรหัสเฉพาะ หรือรอให้เจ้าของรถเชิญคุณเข้าร่วม'
                : 'ลองเปลี่ยนคำค้นหาหรือตัวกรองดู'
              }
            </p>
            {cars.length === 0 && (
              <Link
                href="/secure-cars/join"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>🔓</span>
                เข้าร่วมรถด้วยรหัส
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <div key={car.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  {/* Car Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🔐</span>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-sm text-gray-500">ปี {car.year}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg border text-sm ${getStatusColor(car.status)}`}>
                      {car.status}
                    </div>
                  </div>

                  {/* Car Code */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">รหัสรถ</span>
                      <span className="font-mono font-bold text-blue-600 text-lg">
                        {car.car_code}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-gray-600">สมาชิก</div>
                      <div className="font-semibold text-blue-600">
                        {car.member_count || 0} คน
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-gray-600">ค่าใช้จ่ายรวม</div>
                      <div className="font-semibold text-green-600 text-sm">
                        {formatCurrency(car.total_expenses || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ราคาซื้อ:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(car.buy_price)} บาท
                      </span>
                    </div>
                    {car.sell_price && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ราคาขาย:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(car.sell_price)} บาท
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ค่าใช้จ่ายของฉัน:</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(car.my_expenses || 0)} บาท
                      </span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-gray-500 mb-4">
                    สร้างเมื่อ {new Date(car.created_at).toLocaleDateString('th-TH')}
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/secure-cars/${car.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    เข้าสู่รถ →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {cars.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปภาพรวม</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{cars.length}</div>
                <div className="text-sm text-gray-600">รถที่เข้าร่วม</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {cars.filter(c => c.status === 'ซื้อแล้ว').length}
                </div>
                <div className="text-sm text-gray-600">ซื้อแล้ว</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {cars.filter(c => c.status === 'กำลังหา').length}
                </div>
                <div className="text-sm text-gray-600">กำลังหา</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(cars.reduce((sum, car) => sum + (car.my_expenses || 0), 0))}
                </div>
                <div className="text-sm text-gray-600">ค่าใช้จ่ายรวม (บาท)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
