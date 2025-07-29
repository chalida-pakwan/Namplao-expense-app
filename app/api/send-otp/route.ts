import { NextRequest, NextResponse } from 'next/server'
import { sendOtpViaTwilio, sendOtpViaSupabase } from '@/utils/otpService'
import { formatThaiPhone, validateThaiPhone } from '@/utils/supabaseDebug'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()
    
    // ตรวจสอบเบอร์โทรศัพท์
    const validation = validateThaiPhone(phone)
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: validation.message
      }, { status: 400 })
    }
    
    const formattedPhone = formatThaiPhone(phone)
    console.log('📱 API: ส่ง OTP ไปที่', formattedPhone)
    
    // ลองส่งผ่าน Twilio ก่อน (ถ้ามีการตั้งค่า)
    const twilioConfig = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      serviceSid: process.env.TWILIO_SERVICE_SID || ''
    }
    
    let result
    
    // ถ้ามี Twilio config ให้ใช้ Twilio
    if (twilioConfig.accountSid && twilioConfig.authToken && twilioConfig.serviceSid) {
      console.log('🔵 ใช้ Twilio Verify API')
      result = await sendOtpViaTwilio(formattedPhone, twilioConfig)
      
      // ถ้า Twilio ไม่สำเร็จ (เช่น trial account) ให้ fallback ไป Supabase
      if (!result.success) {
        console.log('⚠️ Twilio ไม่สำเร็จ, fallback ไป Supabase:', result.message)
        result = await sendOtpViaSupabase(formattedPhone, supabase)
      }
    } else {
      console.log('🟢 ใช้ Supabase Auth (fallback)')
      result = await sendOtpViaSupabase(formattedPhone, supabase)
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        phone: formattedPhone
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
      message: 'เกิดข้อผิดพลาดในการส่ง OTP'
    }, { status: 500 })
  }
}
