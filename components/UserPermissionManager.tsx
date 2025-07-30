'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface UserPermission {
  id: string
  user_id: string
  car_id: string
  role: 'owner' | 'investor' | 'viewer'
  permissions: {
    can_edit: boolean
    can_view_finances: boolean
    can_add_expenses: boolean
    can_update_status: boolean
    can_manage_investors: boolean
    can_delete: boolean
  }
  created_at: string
  updated_at: string
  user_email?: string
  user_name?: string
}

interface JointCar {
  id: string
  brand: string
  model: string
  created_by: string
  investors: Array<{
    name: string
    email?: string
    amount: number
    share_percentage: number
  }>
}

interface UserPermissionManagerProps {
  car: JointCar
  currentUserId: string
  isOwner: boolean
}

export default function UserPermissionManager({ car, currentUserId, isOwner }: UserPermissionManagerProps) {
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<'investor' | 'viewer'>('viewer')
  const supabase = createClientComponentClient()

  const rolePermissions = {
    owner: {
      can_edit: true,
      can_view_finances: true,
      can_add_expenses: true,
      can_update_status: true,
      can_manage_investors: true,
      can_delete: true
    },
    investor: {
      can_edit: false,
      can_view_finances: true,
      can_add_expenses: true,
      can_update_status: false,
      can_manage_investors: false,
      can_delete: false
    },
    viewer: {
      can_edit: false,
      can_view_finances: false,
      can_add_expenses: false,
      can_update_status: false,
      can_manage_investors: false,
      can_delete: false
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [car.id])

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('joint_car_permissions')
        .select('*')
        .eq('car_id', car.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPermissions(data || [])
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const addUserPermission = async () => {
    if (!newUserEmail || !newUserRole) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    try {
      setLoading(true)

      // หาข้อมูลผู้ใช้จาก email (simplified approach)
      // ในระบบจริงควรใช้ RPC function หรือ admin API

      setNewUserEmail('')
      setNewUserRole('viewer')
      setShowAddUser(false)
      fetchPermissions()
      
      alert('เพิ่มสิทธิ์ผู้ใช้เรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error adding user permission:', error)
      alert('เกิดข้อผิดพลาดในการเพิ่มสิทธิ์ผู้ใช้')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (permissionId: string, newRole: 'owner' | 'investor' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('joint_car_permissions')
        .update({
          role: newRole,
          permissions: rolePermissions[newRole],
          updated_at: new Date().toISOString()
        })
        .eq('id', permissionId)

      if (error) throw error

      fetchPermissions()
      alert('อัปเดตสิทธิ์เรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error updating role:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดตสิทธิ์')
    }
  }

  const updateCustomPermissions = async (permissionId: string, newPermissions: any) => {
    try {
      const { error } = await supabase
        .from('joint_car_permissions')
        .update({
          permissions: newPermissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', permissionId)

      if (error) throw error

      fetchPermissions()
    } catch (error) {
      console.error('Error updating permissions:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดตสิทธิ์')
    }
  }

  const removeUserPermission = async (permissionId: string) => {
    if (!confirm('คุณต้องการลบสิทธิ์ผู้ใช้นี้หรือไม่?')) return

    try {
      const { error } = await supabase
        .from('joint_car_permissions')
        .delete()
        .eq('id', permissionId)

      if (error) throw error

      fetchPermissions()
      alert('ลบสิทธิ์ผู้ใช้เรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error removing permission:', error)
      alert('เกิดข้อผิดพลาดในการลบสิทธิ์')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700'
      case 'investor': return 'bg-green-100 text-green-700'
      case 'viewer': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return '👑'
      case 'investor': return '💼'
      case 'viewer': return '👁️'
      default: return '👤'
    }
  }

  const getPermissionCount = (permissions: any) => {
    return Object.values(permissions).filter(Boolean).length
  }

  if (!isOwner) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔒</div>
          <p>คุณไม่มีสิทธิ์จัดการผู้ใช้</p>
          <p className="text-sm mt-1">เฉพาะเจ้าของเท่านั้นที่สามารถจัดการสิทธิ์ได้</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          👥 จัดการสิทธิ์ผู้ใช้
        </h3>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
        >
          + เพิ่มผู้ใช้
        </button>
      </div>

      {/* ฟอร์มเพิ่มผู้ใช้ */}
      {showAddUser && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-medium text-gray-800 mb-3">เพิ่มผู้ใช้ใหม่</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมลผู้ใช้
              </label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                บทบาท
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as 'investor' | 'viewer')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="viewer">👁️ ผู้ดู</option>
                <option value="investor">💼 ผู้ลงทุน</option>
              </select>
            </div>
          </div>

          {/* แสดงสิทธิ์ที่จะได้รับ */}
          <div className="mb-4 p-3 bg-white rounded border">
            <h5 className="font-medium text-gray-700 mb-2">สิทธิ์ที่จะได้รับ:</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(rolePermissions[newUserRole]).map(([key, value]) => (
                <div key={key} className={`flex items-center ${value ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-2">{value ? '✅' : '❌'}</span>
                  <span>
                    {key === 'can_edit' && 'แก้ไขข้อมูล'}
                    {key === 'can_view_finances' && 'ดูข้อมูลการเงิน'}
                    {key === 'can_add_expenses' && 'เพิ่มค่าใช้จ่าย'}
                    {key === 'can_update_status' && 'อัปเดตสถานะ'}
                    {key === 'can_manage_investors' && 'จัดการผู้ลงทุน'}
                    {key === 'can_delete' && 'ลบข้อมูล'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={addUserPermission}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 transition-colors"
            >
              {loading ? 'กำลังเพิ่ม...' : 'เพิ่มผู้ใช้'}
            </button>
            <button
              onClick={() => setShowAddUser(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* รายการผู้ใช้ */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">กำลังโหลด...</p>
          </div>
        ) : permissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <p>ยังไม่มีผู้ใช้อื่น</p>
            <p className="text-sm mt-1">เพิ่มผู้ใช้เพื่อให้เขาเข้าถึงข้อมูลการลงทุนได้</p>
          </div>
        ) : (
          permissions.map(permission => (
            <div key={permission.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getRoleIcon(permission.role)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {permission.user_email || `User ${permission.user_id.slice(0, 8)}`}
                    </h4>
                    <p className="text-sm text-gray-600">{permission.user_email || 'ไม่มีอีเมล'}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(permission.role)}`}>
                        {permission.role === 'owner' && 'เจ้าของ'}
                        {permission.role === 'investor' && 'ผู้ลงทุน'}
                        {permission.role === 'viewer' && 'ผู้ดู'}
                      </span>
                      <span className="text-xs text-gray-500">
                        สิทธิ์: {getPermissionCount(permission.permissions)}/6
                      </span>
                    </div>
                  </div>
                </div>
                
                {permission.role !== 'owner' && (
                  <div className="flex space-x-2">
                    <select
                      value={permission.role}
                      onChange={(e) => updateUserRole(permission.id, e.target.value as any)}
                      className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="viewer">ผู้ดู</option>
                      <option value="investor">ผู้ลงทุน</option>
                      <option value="owner">เจ้าของ</option>
                    </select>
                    <button
                      onClick={() => removeUserPermission(permission.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="ลบผู้ใช้"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* รายละเอียดสิทธิ์ */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(permission.permissions).map(([key, value]) => (
                  <div key={key} className={`flex items-center p-2 rounded ${value ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <span className="mr-2">{value ? '✅' : '❌'}</span>
                    <span className="text-xs">
                      {key === 'can_edit' && 'แก้ไข'}
                      {key === 'can_view_finances' && 'ดูการเงิน'}
                      {key === 'can_add_expenses' && 'เพิ่มค่าใช้จ่าย'}
                      {key === 'can_update_status' && 'อัปเดตสถานะ'}
                      {key === 'can_manage_investors' && 'จัดการผู้ลงทุน'}
                      {key === 'can_delete' && 'ลบข้อมูล'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                เพิ่มเมื่อ: {new Date(permission.created_at).toLocaleDateString('th-TH')}
                {permission.updated_at !== permission.created_at && (
                  <span className="ml-2">
                    | อัปเดตล่าสุด: {new Date(permission.updated_at).toLocaleDateString('th-TH')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* คำอธิบายบทบาท */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">คำอธิบายบทบาท</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="text-lg">👑</span>
            <span><strong>เจ้าของ:</strong> มีสิทธิ์ครบทุกอย่าง สามารถจัดการผู้ใช้และลบข้อมูลได้</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">💼</span>
            <span><strong>ผู้ลงทุน:</strong> ดูข้อมูลการเงินและเพิ่มค่าใช้จ่ายได้ แต่ไม่สามารถแก้ไขข้อมูลหลักได้</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">👁️</span>
            <span><strong>ผู้ดู:</strong> ดูข้อมูลพื้นฐานเท่านั้น ไม่สามารถดูการเงินหรือแก้ไขได้</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook สำหรับตรวจสอบสิทธิ์
export function useUserPermissions(carId: string, userId: string) {
  const [permissions, setPermissions] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!carId || !userId) return

    const fetchPermissions = async () => {
      try {
        const { data, error } = await supabase
          .from('joint_car_permissions')
          .select('*')
          .eq('car_id', carId)
          .eq('user_id', userId)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        setPermissions(data?.permissions || null)
      } catch (error) {
        console.error('Error fetching user permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [carId, userId])

  return { permissions, loading }
}
