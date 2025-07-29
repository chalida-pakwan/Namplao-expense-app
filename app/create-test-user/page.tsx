'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'

export default function CreateTestUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const createTestUser = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Test user created successfully!')
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-600">
          Create Test User
        </h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            This will create a test user with:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <p><strong>Email:</strong> test@example.com</p>
            <p><strong>Password:</strong> testpassword123</p>
          </div>
        </div>

        <button
          onClick={createTestUser}
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {isLoading ? 'Creating...' : 'Create Test User'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-lg text-center ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/auth')}
            className="text-orange-500 hover:text-orange-600 underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}