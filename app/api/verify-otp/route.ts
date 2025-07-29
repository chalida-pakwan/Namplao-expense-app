import { NextRequest, NextResponse } from 'next/server'
import { verifyOtpViaTwilio, verifyOtpViaSupabase } from '@/utils/otpService'
import { formatThaiPhone } from '@/utils/supabaseDebug'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()
    
    if (!phone || !code) {
      return NextResponse.json({
        success: false,
        message: 'กรุณากรอกเบอร์โทรศัพท์และรหัส OTP'
      }, { status: 400 })
    }
    
    const formattedPhone = formatThaiPhone(phone)
    console.log('🔐 API: ยืนยัน OTP', code, 'สำหรับเบอร์', formattedPhone)
    
    // ใช้ config เดียวกับการส่ง OTP
    const twilioConfig = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      serviceSid: process.env.TWILIO_SERVICE_SID || ''
    }
    
    let result
    
    // ถ้ามี Twilio config ให้ใช้ Twilio
    if (twilioConfig.accountSid && twilioConfig.authToken && twilioConfig.serviceSid) {
      console.log('🔵 ยืนยันผ่าน Twilio Verify API')
      result = await verifyOtpViaTwilio(formattedPhone, code, twilioConfig)
      
      // ถ้า Twilio ไม่สำเร็จ ให้ fallback ไป Supabase
      if (!result.success) {
        console.log('⚠️ Twilio verify ไม่สำเร็จ, fallback ไป Supabase:', result.message)
        result = await verifyOtpViaSupabase(formattedPhone, code, supabase)
      }
    } else {
      console.log('🟢 ยืนยันผ่าน Supabase Auth (fallback)')
      result = await verifyOtpViaSupabase(formattedPhone, code, supabase)
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        error: result.error
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยืนยัน OTP'
    }, { status: 500 })
  }
}
