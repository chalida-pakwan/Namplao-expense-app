'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    company: '',
    license_number: ''
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('กรุณาเข้าสู่ระบบ')
      return
    }

    setUser(user)

    // ดึงข้อมูลโปรไฟล์
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        company: profileData.company || '',
        license_number: profileData.license_number || ''
      })
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!user) {
      setMessage('กรุณาเข้าสู่ระบบ')
      setIsLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      })

    if (error) {
      setMessage('เกิดข้อผิดพลาดในการอัปเดตข้อมูล')
      console.error(error)
    } else {
      setMessage('อัปเดตข้อมูลสำเร็จ!')
    }

    setIsLoading(false)
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      setMessage('เกิดข้อผิดพลาดในการออกจากระบบ')
    } else {
      window.location.href = '/auth'
    }
  }

  const clearAllData = async () => {
    if (!user) return

    const confirmed = window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถยกเลิกได้')
    
    if (!confirmed) return

    setIsLoading(true)

    try {
      // ลบข้อมูลรายรับ
      await supabase.from('income').delete().eq('user_id', user.id)
      
      // ลบข้อมูลรายจ่าย
      await supabase.from('expense').delete().eq('user_id', user.id)

      setMessage('ลบข้อมูลทั้งหมดสำเร็จ!')
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการลบข้อมูล')
      console.error(error)
    }

    setIsLoading(false)
  }

  return (
    <div className="p-4 pb-20 bg-pastel-cream min-h-screen font-prompt">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-800 mb-2">⚙️ ตั้งค่า</h1>
          <p className="text-orange-700">จัดการข้อมูลส่วนตัวและการตั้งค่าต่างๆ</p>
        </div>

        {/* User Info */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลบัญชี</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-600">อีเมล:</span> 
              <span className="ml-2 font-medium">{user?.email}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">สมัครเมื่อ:</span> 
              <span className="ml-2 font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('th-TH') : '-'}
              </span>
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลส่วนตัว</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="ระบุชื่อ-นามสกุล"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="08x-xxx-xxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                บริษัท/ทีม
              </label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="ชื่อบริษัทหรือทีม"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เลขใบอนุญาต
              </label>
              <input
                type="text"
                value={profile.license_number}
                onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="เลขใบอนุญาตนายหน้า"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition duration-200 font-medium disabled:opacity-50"
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </form>
        </div>

        {/* App Settings */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">การตั้งค่าแอป</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">โหมดมืด</p>
                <p className="text-sm text-gray-600">เปลี่ยนธีมแอปเป็นโหมดมืด</p>
              </div>
              <button className="bg-gray-300 text-gray-600 px-3 py-1 rounded text-sm cursor-not-allowed">
                เร็วๆ นี้
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">การแจ้งเตือน</p>
                <p className="text-sm text-gray-600">แจ้งเตือนเมื่อมีรายการใหม่</p>
              </div>
              <button className="bg-gray-300 text-gray-600 px-3 py-1 rounded text-sm cursor-not-allowed">
                เร็วๆ นี้
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-red-200 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-4">⚠️ โซนอันตราย</h2>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800 mb-2">
                ลบข้อมูลทั้งหมด (รายรับ-รายจ่าย)
              </p>
              <button
                onClick={clearAllData}
                disabled={isLoading}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition duration-200 disabled:opacity-50"
              >
                {isLoading ? 'กำลังลบ...' : 'ลบข้อมูลทั้งหมด'}
              </button>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-800 mb-2">
                ออกจากระบบ
              </p>
              <button
                onClick={handleSignOut}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition duration-200"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg ${message.includes('สำเร็จ') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* App Info */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">เกี่ยวกับแอป</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>แอพ รายรับ-รายจ่าย สำหรับนายหน้า</p>
            <p>เวอร์ชัน 1.0.0</p>
            <p>พัฒนาด้วย Next.js + Supabase</p>
            <p className="text-xs pt-2 text-gray-500">
              © 2024 สำหรับนายหน้าอสังหาริมทรัพย์
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
