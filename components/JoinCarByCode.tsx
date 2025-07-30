'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'

interface JoinCarProps {
  onSuccess?: (carId: string) => void
}

export default function JoinCarByCode({ onSuccess }: JoinCarProps) {
  const [carCode, setCarCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const joinCar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!carCode.trim()) {
      setError('กรุณาใส่รหัสรถ')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // เรียกใช้ function ที่สร้างไว้ใน database
      const { data, error } = await supabase.rpc('join_car_with_code', {
        p_car_code: carCode.trim().toUpperCase()
      })

      if (error) throw error

      const result = data as { success: boolean; message: string; car_id?: string; car_info?: any }

      if (result.success) {
        setSuccess(result.message)
        if (result.car_id) {
          setTimeout(() => {
            if (onSuccess) {
              onSuccess(result.car_id!)
            } else {
              router.push(`/secure-cars/${result.car_id}`)
            }
          }, 1500)
        }
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      console.error('Error joining car:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าร่วม')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">เข้าร่วมรถ</h2>
        <p className="text-gray-600 text-sm">
          ใส่รหัสรถที่ได้รับจากเจ้าของรถ
        </p>
      </div>

      <form onSubmit={joinCar} className="space-y-4">
        <div>
          <label htmlFor="carCode" className="block text-sm font-medium text-gray-700 mb-2">
            รหัสรถ (6 หลัก)
          </label>
          <input
            type="text"
            id="carCode"
            value={carCode}
            onChange={(e) => setCarCode(e.target.value.toUpperCase())}
            placeholder="ใส่รหัสรถ เช่น ABC123"
            maxLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono tracking-widest"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !carCode.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              กำลังเข้าร่วม...
            </div>
          ) : (
            '🔓 เข้าร่วมรถ'
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-gray-500 text-xs">
          💡 รหัสรถจะได้รับจากเจ้าของรถหรือสมาชิกที่เชิญคุณ
        </p>
      </div>
    </div>
  )
}
