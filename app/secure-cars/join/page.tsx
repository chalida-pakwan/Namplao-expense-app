'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import JoinCarByCode from '@/components/JoinCarByCode'

export default function JoinCarPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)

    if (!user) {
      router.push('/auth')
    }
  }

  const handleJoinSuccess = (carId: string) => {
    router.push(`/secure-cars/${carId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🔐 เข้าร่วมรถ</h1>
            <p className="text-gray-600">
              ระบบหารรถแบบปลอดภัย - ต้องใช้รหัสเข้าร่วม
            </p>
          </div>

          <JoinCarByCode onSuccess={handleJoinSuccess} />

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              ← กลับไป Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
