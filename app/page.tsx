'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-orange-800 mb-2">BrokerPro</h1>
        <p className="text-orange-700">กำลังเปลี่ยนเส้นทาง...</p>
      </div>
    </div>
  )
}
