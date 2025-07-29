'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PageFixed() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main page
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-orange-600">Redirecting...</p>
      </div>
    </div>
  )
}