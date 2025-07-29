'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'

export default function TestPage() {
  const router = useRouter()
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test Supabase connection
      const { data, error } = await supabase.from('profiles').select('*').limit(1)
      
      if (error) {
        setError(error.message)
        setConnectionStatus('error')
      } else {
        setConnectionStatus('success')
      }

      // Check current user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setConnectionStatus('error')
    }
  }

  const statusColor = {
    testing: 'text-yellow-600 bg-yellow-100',
    success: 'text-green-600 bg-green-100', 
    error: 'text-red-600 bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
            System Test Page
          </h1>

          {/* Connection Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
            <div className={`p-4 rounded-lg ${statusColor[connectionStatus]}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Status: {connectionStatus.toUpperCase()}
                </span>
                <button
                  onClick={testConnection}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Test Again
                </button>
              </div>
              {error && (
                <div className="mt-2 text-sm">
                  Error: {error}
                </div>
              )}
            </div>
          </div>

          {/* User Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              {user ? (
                <div>
                  <p className="text-green-600 font-medium">✓ User Authenticated</p>
                  <p className="text-sm text-gray-600 mt-1">Email: {user.email}</p>
                  <p className="text-sm text-gray-600">ID: {user.id}</p>
                </div>
              ) : (
                <p className="text-gray-600">No authenticated user</p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/auth')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}