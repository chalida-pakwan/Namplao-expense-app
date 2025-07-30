'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

interface CarMember {
  id: string
  user_id: string
  user_email: string
  user_name: string
  role: 'owner' | 'member'
  joined_at: string
}

interface CarMembersManagerProps {
  carId: string
  carCode: string
  currentUserId: string
  isOwner: boolean
}

export default function CarMembersManager({ carId, carCode, currentUserId, isOwner }: CarMembersManagerProps) {
  const [members, setMembers] = useState<CarMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [carId])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('car_members')
        .select('*')
        .eq('car_id', carId)
        .order('joined_at', { ascending: true })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyCarCode = () => {
    // ตรวจสอบสิทธิ์ก่อนคัดลอก
    if (!isOwner) {
      alert('🚫 เฉพาะเจ้าของรถเท่านั้นที่สามารถคัดลอกรหัสได้')
      return
    }
    
    navigator.clipboard.writeText(carCode)
    alert('📋 คัดลอกรหัสรถแล้ว!')
  }

  const shareCarCode = () => {
    // ตรวจสอบสิทธิ์ก่อนแชร์
    if (!isOwner) {
      alert('🚫 เฉพาะเจ้าของรถเท่านั้นที่สามารถแชร์รหัสได้')
      return
    }
    
    const message = `🚗 เชิญเข้าร่วมรถร่วมลงทุน\n\nรหัสรถ: ${carCode}\n\nคลิกลิงก์เพื่อเข้าร่วม: ${window.location.origin}/secure-cars/join?code=${carCode}`
    
    if (navigator.share) {
      navigator.share({
        title: 'เชิญเข้าร่วมรถร่วมลงทุน',
        text: message
      })
    } else {
      navigator.clipboard.writeText(message)
      alert('📋 คัดลอกข้อความเชิญแล้ว!')
    }
  }

  const removeMember = async (memberId: string, memberEmail: string) => {
    if (!isOwner) {
      alert('เฉพาะเจ้าของรถเท่านั้นที่สามารถลบสมาชิกได้')
      return
    }

    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบ ${memberEmail} ออกจากรถคันนี้?`)) return

    try {
      const { error } = await supabase
        .from('car_members')
        .delete()
        .eq('id', memberId)
        .eq('car_id', carId)

      if (error) throw error

      await fetchMembers()
      alert('ลบสมาชิกเรียบร้อยแล้ว')
    } catch (error: any) {
      console.error('Error removing member:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    }
  }

  const getRoleIcon = (role: string) => {
    return role === 'owner' ? '👑' : '👤'
  }

  const getRoleText = (role: string) => {
    return role === 'owner' ? 'เจ้าของ' : 'สมาชิก'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">👥 สมาชิกรถ</h3>
          <p className="text-sm text-gray-600">
            รวม {members.length} คน
          </p>
        </div>
        
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={shareCarCode}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              📤 แชร์รหัส
            </button>
          </div>
        )}
      </div>

      {/* Car Code Section - เฉพาะเจ้าของเท่านั้น */}
      {isOwner && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-800 mb-1">🔐 รหัสรถ</h4>
              <div className="text-2xl font-mono font-bold text-blue-900 tracking-widest">
                {carCode}
              </div>
              <p className="text-sm text-blue-600 mt-1">
                ใช้รหัสนี้เพื่อเชิญคนอื่นเข้าร่วม
              </p>
            </div>
            <button
              onClick={copyCarCode}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              📋 คัดลอก
            </button>
          </div>
        </div>
      )}

      {/* ข้อความสำหรับสมาชิกธรรมดา */}
      {!isOwner && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-medium text-gray-700 mb-1">รหัสรถเป็นความลับ</h4>
            <p className="text-sm text-gray-600">
              เฉพาะเจ้าของรถเท่านั้นที่สามารถดูและแชร์รหัสได้
            </p>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg">{getRoleIcon(member.role)}</span>
              </div>
              <div>
                <div className="font-medium text-gray-800">{member.user_name}</div>
                <div className="text-sm text-gray-600">{member.user_email}</div>
                <div className="text-xs text-gray-500">
                  {getRoleText(member.role)} • เข้าร่วมเมื่อ {new Date(member.joined_at).toLocaleDateString('th-TH')}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {member.role === 'owner' && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-xs font-medium">
                  👑 เจ้าของ
                </span>
              )}
              
              {isOwner && member.role !== 'owner' && member.user_id !== currentUserId && (
                <button
                  onClick={() => removeMember(member.id, member.user_email)}
                  className="text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 text-sm"
                >
                  🗑️ ลบ
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">💡 วิธีเชิญสมาชิกใหม่</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>1. 📋 คัดลอกรหัสรถ: <code className="bg-white px-2 py-1 rounded font-mono">{carCode}</code></div>
            <div>2. 📤 ส่งรหัสให้คนที่ต้องการเชิญ</div>
            <div>3. 🔓 ให้เขาไปที่หน้า "เข้าร่วมรถ" และใส่รหัสนี้</div>
          </div>
        </div>
      </div>
    </div>
  )
}
