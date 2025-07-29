// ไฟล์สำหรับ debug การตั้งค่า Supabase และ OTP
export const debugSupabaseConfig = () => {
  console.log('🔧 Supabase Configuration:')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)
}

export const debugOtpRequest = (phone: string, error?: any, data?: any) => {
  console.log('📱 OTP Request Debug:')
  console.log('Phone number:', phone)
  console.log('Timestamp:', new Date().toISOString())
  
  if (error) {
    console.error('❌ OTP Error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      details: error
    })
  }
  
  if (data) {
    console.log('✅ OTP Data:', data)
  }
}

export const formatThaiPhone = (phone: string): string => {
  let formatted = phone.trim()
  
  // ลบ spaces และ dashes
  formatted = formatted.replace(/[\s-]/g, '')
  
  // แปลง 0 เป็น +66
  if (formatted.startsWith('0')) {
    formatted = '+66' + formatted.substring(1)
  } else if (!formatted.startsWith('+66')) {
    formatted = '+66' + formatted
  }
  
  return formatted
}

export const validateThaiPhone = (phone: string): { isValid: boolean; message: string } => {
  const formatted = formatThaiPhone(phone)
  
  // ตรวจสอบรูปแบบ +66xxxxxxxxx (9 หลัก)
  const phoneRegex = /^\+66[0-9]{9}$/
  
  if (!phoneRegex.test(formatted)) {
    return {
      isValid: false,
      message: 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นเบอร์ไทย 10 หลัก)'
    }
  }
  
  return {
    isValid: true,
    message: 'เบอร์โทรศัพท์ถูกต้อง'
  }
}
