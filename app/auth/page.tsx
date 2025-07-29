'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import { debugSupabaseConfig, debugOtpRequest, formatThaiPhone, validateThaiPhone } from '@/utils/supabaseDebug'

export default function AuthPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const [message, setMessage] = useState('')

  useEffect(() => {
    debugSupabaseConfig() // Debug การตั้งค่า Supabase
    
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) router.push('/dashboard')
    }
    checkUser()
  }, [])

  const handleEmailAuth = async () => {
    setMessage('')
    console.log('🔐 Email Auth attempt:', { isLogin, email })
    
    try {
      if (isLogin) {
        console.log('📧 Attempting login...')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        
        if (error) {
          console.error('❌ Login error:', error)
          setMessage(`❌ ${error.message}`)
        } else {
          console.log('✅ Login successful:', data)
          setMessage('✅ เข้าสู่ระบบสำเร็จ!')
          router.push('/dashboard')
        }
      } else {
        console.log('📧 Attempting signup...')
        const { data, error } = await supabase.auth.signUp({ email, password })
        
        if (error) {
          console.error('❌ Signup error:', error)
          setMessage(`❌ ${error.message}`)
        } else {
          console.log('✅ Signup successful:', data)
          setMessage('✅ สมัครสมาชิกสำเร็จ! โปรดตรวจสอบอีเมล')
        }
      }
    } catch (err: any) {
      console.error('💥 Email Auth Exception:', err)
      setMessage(`❌ เกิดข้อผิดพลาด: ${err.message}`)
    }
  }

  const handleRequestOtp = async () => {
    setMessage('')
    
    // ตรวจสอบและจัดรูปแบบเบอร์โทรศัพท์
    const validation = validateThaiPhone(phone)
    if (!validation.isValid) {
      setMessage(`❌ ${validation.message}`)
      return
    }
    
    const formattedPhone = formatThaiPhone(phone)
    
    console.log('📱 ส่ง OTP ไปที่:', formattedPhone)
    setMessage('⏳ กำลังส่งรหัส OTP...')
    
    try {
      // ใช้ API route แทนการเรียก Supabase โดยตรง
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formattedPhone })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ ส่ง OTP สำเร็จ')
        setPhone(result.phone) // ใช้เบอร์ที่ format แล้วจาก API
        setOtpSent(true)
        setMessage('✅ ส่งรหัส OTP แล้ว! โปรดตรวจสอบ SMS')
      } else {
        console.error('❌ Error ส่ง OTP:', result)
        setMessage(`❌ ${result.message}`)
      }
    } catch (err) {
      console.error('💥 Exception ส่ง OTP:', err)
      setMessage('❌ เกิดข้อผิดพลาดในการส่ง OTP')
    }
  }

  const handleVerifyOtp = async () => {
    setMessage('')
    
    if (!otp) {
      setMessage('❌ กรุณากรอกรหัส OTP')
      return
    }
    
    if (otp.length !== 6) {
      setMessage('❌ รหัส OTP ต้องมี 6 หลัก')
      return
    }
    
    setIsVerifying(true)
    console.log('🔐 ยืนยัน OTP:', otp, 'สำหรับเบอร์:', phone)
    setMessage('⏳ กำลังยืนยันรหัส OTP...')
    
    try {
      // ใช้ API route แทนการเรียก Supabase โดยตรง  
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code: otp })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ ยืนยัน OTP สำเร็จ')
        setMessage('✅ เข้าสู่ระบบสำเร็จ! กำลังเข้าสู่หน้าหลัก...')
        
        // รอสักครู่ให้ผู้ใช้เห็นข้อความ
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
        
      } else {
        console.error('❌ Error ยืนยัน OTP:', result)
        setMessage(`❌ ${result.message}`)
      }
    } catch (err) {
      console.error('💥 Exception ยืนยัน OTP:', err)
      setMessage('❌ เกิดข้อผิดพลาดในการยืนยัน OTP')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // เฉพาะตัวเลข
    if (value.length <= 6) {
      setOtp(value)
    }
  }

  const handleSocial = async (provider: 'google' | 'facebook') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'http://localhost:3000/dashboard',
      },
    })
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">เข้าสู่ระบบ / สมัครสมาชิก</h1>

      {/* Social Login */}
      <div className="space-y-2">
        <button
          onClick={() => handleSocial('google')}
          className="w-full bg-white border py-2 rounded shadow"
        >
          � เข้าสู่ระบบด้วย Google
        </button>
        <button
          onClick={() => handleSocial('facebook')}
          className="w-full bg-white border py-2 rounded shadow"
        >
          � เข้าสู่ระบบด้วย Facebook
        </button>
      </div>

      <hr className="my-4" />

      {/* Email / Password */}
      <div className="space-y-2">
        <p className="font-semibold">🔐 Email + รหัสผ่าน</p>
        <input
          type="email"
          value={email}
          placeholder="อีเมล"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          value={password}
          placeholder="รหัสผ่าน"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleEmailAuth}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </button>
        <p className="text-sm text-center text-gray-600">
          {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?'}{' '}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 underline cursor-pointer"
          >
            {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </span>
        </p>
      </div>

      <hr className="my-4" />

      {/* Phone Login */}
      <div className="space-y-2">
        <p className="font-semibold">📲 เบอร์โทร + OTP</p>
        <input
          type="tel"
          value={phone}
          placeholder="เบอร์โทร เช่น +669xxxxxxxx"
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded"
        />
        {!otpSent ? (
          <button
            onClick={handleRequestOtp}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            ส่งรหัส OTP
          </button>
        ) : (
          <div>
            <label htmlFor="otp" className="block text-sm font-medium mb-1">
              🔐 กรอกรหัส OTP (ที่ได้รับใน SMS)
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              placeholder="กรอกรหัส OTP (6 หลัก)"
              onChange={handleOtpChange}
              className="w-full border p-2 rounded mb-2 text-center text-lg font-mono"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <p className="text-sm text-gray-500 mb-2">
              📲 ตรวจสอบ SMS ที่เบอร์: {phone}
            </p>
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-green-600 text-white py-2 rounded mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? '⏳ กำลังยืนยัน...' : 'ยืนยันรหัส OTP'}
            </button>
            <button
              onClick={() => {
                setOtpSent(false)
                setOtp('')
                setMessage('')
              }}
              className="w-full bg-gray-500 text-white py-2 rounded text-sm"
            >
              🔄 ส่งรหัสใหม่
            </button>
          </div>
        )}
      </div>

      {message && <p className="text-center text-red-500">{message}</p>}
      
      <div className="text-center mt-4 space-y-2">
        <button
          onClick={async () => {
            setMessage('⏳ กำลังล็อกอินผู้ใช้ทดสอบ...')
            try {
              const { data, error } = await supabase.auth.signInWithPassword({
                email: 'test@broker.com',
                password: 'test123456'
              })
              if (error) {
                setMessage(`❌ ${error.message}`)
              } else {
                setMessage('✅ ล็อกอินสำเร็จ!')
                router.push('/dashboard')
              }
            } catch (err: any) {
              setMessage(`❌ ${err.message}`)
            }
          }}
          className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 text-sm"
        >
          🚀 ทดสอบล็อกอินด่วน (test@broker.com)
        </button>
        
        <a 
          href="/test" 
          className="block text-blue-600 hover:text-blue-800 underline text-sm"
        >
          🧪 หน้าทดสอบระบบ
        </a>
        
        <a 
          href="/create-test-user" 
          className="block text-gray-600 hover:text-gray-800 underline text-sm"
        >
          👤 สร้างผู้ใช้ทดสอบ
        </a>
      </div>
    </main>
  )
}
