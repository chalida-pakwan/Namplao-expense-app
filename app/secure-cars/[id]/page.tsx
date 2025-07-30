'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabaseClient'
import SecureCarExpenses from '@/components/SecureCarExpenses'
import CarMembersManager from '@/components/CarMembersManager'

interface SecureCarDetail {
  id: string
  car_code: string
  brand: string
  model: string
  year: number
  buy_price: number
  sell_price?: number
  status: string
  created_by: string
  created_at: string
}

export default async function SecureCarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <SecureCarDetail carId={resolvedParams.id} />
}

function SecureCarDetail({ carId }: { carId: string }) {
  const [car, setCar] = useState<SecureCarDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('expenses')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMember, setIsMember] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    checkAccess()
  }, [carId])

  const checkAccess = async () => {
    try {
      // ตรวจสอบผู้ใช้ปัจจุบัน
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth')
        return
      }

      setCurrentUser(user)

      // ตรวจสอบว่าเป็นสมาชิกของรถคันนี้หรือไม่
      const { data: memberData, error: memberError } = await supabase
        .from('car_members')
        .select('role')
        .eq('car_id', carId)
        .eq('user_id', user.id)
        .single()

      if (memberError || !memberData) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      setIsMember(true)
      setIsOwner(memberData.role === 'owner')

      // ดึงข้อมูลรถพร้อม car_code (ปกป้องแล้ว)
      const { data: carData, error: carError } = await supabase
        .rpc('get_car_with_code', { car_id_param: carId })
        .single()

      if (carError) {
        console.error('Error fetching car:', carError)
        setAccessDenied(true)
        return
      }

      setCar(carData as SecureCarDetail)
    } catch (error) {
      console.error('Error checking access:', error)
      setAccessDenied(true)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">🔍 กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    )
  }

  if (accessDenied || !isMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600 mb-6">
            คุณไม่ได้เป็นสมาชิกของรถคันนี้ หรือไม่มีสิทธิ์ในการดูข้อมูล
          </p>
          <div className="space-y-3">
            <Link
              href="/secure-cars/join"
              className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔓 เข้าร่วมรถด้วยรหัส
            </Link>
            <Link
              href="/dashboard"
              className="block text-gray-600 hover:text-gray-700 underline"
            >
              ← กลับไป Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลรถ</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            กลับไปหน้าหลัก
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🔐</span>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {car.brand} {car.model} ({car.year})
                  </h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>รหัส: {car.car_code}</span>
                  <span>•</span>
                  <span>ID: {car.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-lg border ${getStatusColor(car.status)}`}>
                {car.status}
              </div>
              
              {isOwner && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-sm font-medium">
                  👑 เจ้าของ
                </span>
              )}
            </div>
          </div>

          {/* Car Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600">ราคาซื้อ</div>
              <div className="text-lg font-semibold text-blue-600">
                {formatCurrency(car.buy_price)} บาท
              </div>
            </div>
            {car.sell_price && (
              <div className="text-center">
                <div className="text-sm text-gray-600">ราคาขาย</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(car.sell_price)} บาท
                </div>
              </div>
            )}
            <div className="text-center">
              <div className="text-sm text-gray-600">สร้างเมื่อ</div>
              <div className="text-lg font-medium text-gray-800">
                {new Date(car.created_at).toLocaleDateString('th-TH')}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mt-6">
            <nav className="flex space-x-8">
              {[
                { id: 'expenses', label: '💸 รายจ่าย', icon: '💸' },
                { id: 'members', label: '👥 สมาชิก', icon: '👥' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'expenses' && (
            <SecureCarExpenses 
              carId={carId} 
              currentUserId={currentUser?.id}
            />
          )}

          {activeTab === 'members' && (
            <CarMembersManager
              carId={carId}
              carCode={car.car_code}
              currentUserId={currentUser?.id}
              isOwner={isOwner}
            />
          )}
        </div>
      </div>
    </div>
  )
}
