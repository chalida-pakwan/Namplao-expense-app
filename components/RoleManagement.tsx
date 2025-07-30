'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

interface User {
  id: string
  email: string
  user_metadata: {
    role?: string
    full_name?: string
  }
}

interface RoleManagementProps {
  userId?: string
}

const ROLES = {
  admin: 'ผู้ดูแลระบบ',
  manager: 'ผู้จัดการ',
  investor: 'นักลงทุน',
  viewer: 'ผู้ดู'
}

const PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'manage_users', 'export_data'],
  manager: ['read', 'write', 'export_data'],
  investor: ['read', 'write_own'],
  viewer: ['read']
}

export default function RoleManagement({ userId }: RoleManagementProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
    fetchUsers()
  }, [])

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user as User)
    }
  }

  const fetchUsers = async () => {
    try {
      // In a real app, you'd have a users table with roles
      // For now, we'll simulate with auth metadata
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUsers([user as User])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // In a real implementation, you'd update a users table
      // For now, we'll update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { role: newRole }
      })

      if (error) throw error

      // Refresh users list
      fetchUsers()
      alert('อัปเดตบทบาทสำเร็จ')
    } catch (error) {
      console.error('Error updating role:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดตบทบาท')
    }
  }

  const hasPermission = (permission: string, userRole: string = 'viewer'): boolean => {
    const rolePermissions = PERMISSIONS[userRole as keyof typeof PERMISSIONS] || []
    return rolePermissions.includes(permission)
  }

  const getCurrentUserRole = (): string => {
    return currentUser?.user_metadata?.role || 'viewer'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const currentUserRole = getCurrentUserRole()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">จัดการสิทธิ์ผู้ใช้</h3>
      
      {/* Current User Role */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">บทบาทของคุณ</h4>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
            {ROLES[currentUserRole as keyof typeof ROLES] || 'ไม่ระบุ'}
          </span>
        </div>
        <div className="mt-2 text-sm text-blue-600">
          สิทธิ์: {PERMISSIONS[currentUserRole as keyof typeof PERMISSIONS]?.join(', ') || 'ไม่มีสิทธิ์'}
        </div>
      </div>

      {/* Users Management (only for admin) */}
      {hasPermission('manage_users', currentUserRole) && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3">จัดการผู้ใช้</h4>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">{user.user_metadata?.full_name || user.email}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <select
                  value={user.user_metadata?.role || 'viewer'}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  {Object.entries(ROLES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Descriptions */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-800 mb-3">คำอธิบายบทบาท</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(ROLES).map(([role, title]) => (
            <div key={role} className="p-3 border border-gray-200 rounded-lg">
              <div className="font-medium text-gray-800">{title}</div>
              <div className="text-sm text-gray-600 mt-1">
                {PERMISSIONS[role as keyof typeof PERMISSIONS]?.join(', ') || 'ไม่มีสิทธิ์'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Hook to check permissions
export const usePermissions = () => {
  const [userRole, setUserRole] = useState<string>('viewer')

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.role) {
        setUserRole(user.user_metadata.role)
      }
    }
    fetchUserRole()
  }, [])

  const hasPermission = (permission: string): boolean => {
    const rolePermissions = PERMISSIONS[userRole as keyof typeof PERMISSIONS] || []
    return rolePermissions.includes(permission)
  }

  return { userRole, hasPermission }
}
