'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, BarChart3, History } from 'lucide-react'
import ImageUpload from '../../../components/SimpleImageUpload'
import JointCarCharts from '../../../components/JointCarCharts'
import NotificationSystem from '../../../components/NotificationSystem'
import PDFExport from '../../../components/PDFExport'
import PostSaleExpenseManager from '../../../components/PostSaleExpenseManager'
import UserPermissionManager, { useUserPermissions } from '../../../components/UserPermissionManager'
import AddExpenseModal from '../../../components/modals/AddExpenseModal'
import ChartModal from '../../../components/modals/ChartModal'
import EditLogModal from '../../../components/modals/EditLogModal'

interface JointCar {
  id: string
  date: string
  brand: string
  model: string
  year: number
  buy_price: number
  sell_price: number
  target_profit: number
  profit: number
  total_investment: number
  status: string
  created_by: string
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
  images: string[]
}

export default async function JointCarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <JointCarDetail carId={resolvedParams.id} />
}

function JointCarDetail({ carId }: { carId: string }) {
  const [car, setCar] = useState<JointCar | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Modal states
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [showChartModal, setShowChartModal] = useState(false)
  const [showEditLogModal, setShowEditLogModal] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { permissions, loading: permissionsLoading } = useUserPermissions(carId, currentUser?.id)

  useEffect(() => {
    getCurrentUser()
    fetchCarDetails()
  }, [carId])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchCarDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('joint_cars')
        .select('*')
        .eq('id', carId)
        .single()

      if (error) {
        console.error('Error fetching car details:', error)
        router.push('/joint-cars')
        return
      }

      setCar(data)
    } catch (error) {
      console.error('Error:', error)
      router.push('/joint-cars')
    } finally {
      setLoading(false)
    }
  }

  const updateCarStatus = async (newStatus: string) => {
    if (!car || !currentUser) return

    // ตรวจสอบสิทธิ์
    const isOwner = car.created_by === currentUser.id
    const canUpdate = permissions?.can_update_status || isOwner

    if (!canUpdate) {
      alert('คุณไม่มีสิทธิ์อัปเดตสถานะ')
      return
    }

    try {
      const { error } = await supabase
        .from('joint_cars')
        .update({ status: newStatus })
        .eq('id', car.id)

      if (error) throw error

      setCar(prev => prev ? { ...prev, status: newStatus } : null)
      alert('อัปเดตสถานะเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
    }
  }

  const handleImageUpload = async (imageUrls: string[]) => {
    if (!car) return

    try {
      const updatedImages = [...(car.images || []), ...imageUrls]
      
      const { error } = await supabase
        .from('joint_cars')
        .update({ images: updatedImages })
        .eq('id', car.id)

      if (error) throw error

      setCar(prev => prev ? { ...prev, images: updatedImages } : null)
    } catch (error) {
      console.error('Error updating images:', error)
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

  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลรถ</h1>
          <Link href="/joint-cars" className="text-orange-600 hover:text-orange-700">
            กลับไปหน้ารายการรถ
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = car.created_by === currentUser?.id
  const canEdit = permissions?.can_edit || isOwner
  const canViewFinances = permissions?.can_view_finances || isOwner

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/joint-cars"
                className="text-gray-600 hover:text-orange-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {car.brand} {car.model} ({car.year})
                </h1>
                <p className="text-gray-600">รหัส: {car.id.slice(0, 8)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <NotificationSystem userId={currentUser?.id} />
              
              {/* New Action Buttons - Updated Style */}
              <div className="flex justify-end gap-3">
                {canEdit && (
                  <button
                    onClick={() => setShowAddExpenseModal(true)}
                    className="bg-orange-300 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
                    title="เพิ่มค่าใช้จ่าย"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มค่าใช้จ่าย</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowChartModal(true)}
                  className="bg-white text-orange-500 border border-orange-300 hover:bg-orange-100 font-semibold py-2 px-4 rounded flex items-center space-x-2"
                  title="ดูกราฟกำไร"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>ดูกราฟ</span>
                </button>
                
                <button
                  onClick={() => setShowEditLogModal(true)}
                  className="bg-white text-orange-500 border border-orange-300 hover:bg-orange-100 font-semibold py-2 px-4 rounded flex items-center space-x-2"
                  title="ประวัติการแก้ไข"
                >
                  <History className="w-4 h-4" />
                  <span>ดูประวัติ</span>
                </button>
              </div>
              
              <div className={`px-4 py-2 rounded-lg border ${getStatusColor(car.status)}`}>
                {car.status}
              </div>
              
              {canEdit && (
                <select
                  onChange={(e) => updateCarStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  defaultValue=""
                >
                  <option value="" disabled>เปลี่ยนสถานะ</option>
                  <option value="กำลังหา">กำลังหา</option>
                  <option value="ซื้อแล้ว">ซื้อแล้ว</option>
                  <option value="ขายแล้ว">ขายแล้ว</option>
                  <option value="ยกเลิก">ยกเลิก</option>
                </select>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: '📋 ภาพรวม', icon: '📋' },
                { id: 'images', label: '📸 รูปภาพ', icon: '📸' },
                { id: 'charts', label: '📊 กราฟ', icon: '📊' },
                { id: 'expenses', label: '💰 ค่าใช้จ่าย', icon: '💰' },
                { id: 'export', label: '📄 ส่งออก', icon: '📄' },
                ...(isOwner ? [{ id: 'permissions', label: '👥 สิทธิ์', icon: '👥' }] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
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
          {/* Action Buttons Section */}
          <div className="flex justify-end gap-3 mb-4">
            {canEdit && (
              <button 
                onClick={() => setShowAddExpenseModal(true)}
                className="bg-orange-300 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded"
              >
                ➕ เพิ่มค่าใช้จ่าย
              </button>
            )}
            <button 
              onClick={() => setShowChartModal(true)}
              className="bg-white text-orange-500 border border-orange-300 hover:bg-orange-100 font-semibold py-2 px-4 rounded"
            >
              📈 ดูกราฟ
            </button>
            <button 
              onClick={() => setShowEditLogModal(true)}
              className="bg-white text-orange-500 border border-orange-300 hover:bg-orange-100 font-semibold py-2 px-4 rounded"
            >
              📝 ดูประวัติ
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ข้อมูลพื้นฐาน */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 ข้อมูลพื้นฐาน</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันที่เพิ่ม:</span>
                    <span className="font-medium">{new Date(car.date).toLocaleDateString('th-TH')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ราคาซื้อ:</span>
                    <span className="font-medium">{formatCurrency(car.buy_price)} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ราคาขาย:</span>
                    <span className="font-medium">{formatCurrency(car.sell_price)} บาท</span>
                  </div>
                  {canViewFinances && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">เงินลงทุนรวม:</span>
                        <span className="font-medium">{formatCurrency(car.total_investment)} บาท</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">กำไรเป้าหมาย:</span>
                        <span className="font-medium">{formatCurrency(car.target_profit)} บาท</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">กำไรจริง:</span>
                        <span className={`font-medium ${car.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(car.profit)} บาท
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ผู้ลงทุน */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 ผู้ลงทุน</h3>
                <div className="space-y-3">
                  {car.investors.map((investor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{investor.name}</div>
                        {investor.email && (
                          <div className="text-sm text-gray-600">{investor.email}</div>
                        )}
                      </div>
                      {canViewFinances && (
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(investor.amount)} บาท</div>
                          <div className="text-sm text-gray-600">{investor.share_percentage}%</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ค่าใช้จ่ายเพิ่มเติม */}
              {canViewFinances && car.additional_expenses && car.additional_expenses.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">💸 ค่าใช้จ่ายเพิ่มเติม</h3>
                  <div className="space-y-2">
                    {car.additional_expenses.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(expense.date).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                        <div className="font-medium text-red-600">
                          {formatCurrency(expense.amount)} บาท
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              {canEdit && (
                <ImageUpload
                  onImagesUploaded={handleImageUpload}
                  existingImages={car.images || []}
                />
              )}
              
              {/* แสดงรูปภาพที่มีอยู่ */}
              {car.images && car.images.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📸 รูปภาพรถ</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {car.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`รูปรถ ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => window.open(imageUrl, '_blank')}
                            className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium transition-opacity"
                          >
                            ดูขนาดเต็ม
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Charts Tab */}
          {activeTab === 'charts' && canViewFinances && (
            <JointCarCharts cars={[car]} />
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && car.status === 'ขายแล้ว' && (
            <PostSaleExpenseManager 
              car={car} 
              onExpenseAdded={fetchCarDetails}
            />
          )}

          {/* Export Tab */}
          {activeTab === 'export' && canViewFinances && (
            <PDFExport cars={[car]} />
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && isOwner && (
            <UserPermissionManager
              car={car}
              currentUserId={currentUser?.id}
              isOwner={isOwner}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        carId={carId}
        onExpenseAdded={fetchCarDetails}
      />

      <ChartModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        car={car}
      />

      <EditLogModal
        isOpen={showEditLogModal}
        onClose={() => setShowEditLogModal(false)}
        carId={carId}
      />
    </div>
  )
}
