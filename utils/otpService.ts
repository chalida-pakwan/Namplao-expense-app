// Twilio Verify API Integration
export interface TwilioConfig {
  accountSid: string
  authToken: string
  serviceSid: string
}

export interface OtpVerificationResult {
  success: boolean
  message: string
  data?: any
  error?: any
}

// ส่ง OTP ผ่าน Twilio Verify API
export const sendOtpViaTwilio = async (
  phone: string, 
  config: TwilioConfig
): Promise<OtpVerificationResult> => {
  try {
    const url = `https://verify.twilio.com/v2/Services/${config.serviceSid}/Verifications`
    
    const formData = new URLSearchParams()
    formData.append('To', phone)
    formData.append('Channel', 'sms')
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to send OTP',
        error: data
      }
    }
    
    return {
      success: true,
      message: 'OTP sent successfully via Twilio',
      data
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error when sending OTP',
      error
    }
  }
}

// ยืนยัน OTP ผ่าน Twilio Verify API
export const verifyOtpViaTwilio = async (
  phone: string, 
  code: string, 
  config: TwilioConfig
): Promise<OtpVerificationResult> => {
  try {
    const url = `https://verify.twilio.com/v2/Services/${config.serviceSid}/VerificationCheck`
    
    const formData = new URLSearchParams()
    formData.append('To', phone)
    formData.append('Code', code)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to verify OTP',
        error: data
      }
    }
    
    // ตรวจสอบว่า OTP ถูกต้องหรือไม่
    if (data.status === 'approved') {
      return {
        success: true,
        message: 'OTP verified successfully',
        data
      }
    } else {
      return {
        success: false,
        message: 'Invalid OTP code',
        data
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error when verifying OTP',
      error
    }
  }
}

// ส่ง OTP ผ่าน Supabase (fallback)
export const sendOtpViaSupabase = async (phone: string, supabase: any): Promise<OtpVerificationResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({ phone })
    
    if (error) {
      return {
        success: false,
        message: error.message,
        error
      }
    }
    
    return {
      success: true,
      message: 'OTP sent successfully via Supabase',
      data
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error sending OTP via Supabase',
      error
    }
  }
}

// ยืนยัน OTP ผ่าน Supabase (fallback)
export const verifyOtpViaSupabase = async (
  phone: string, 
  token: string, 
  supabase: any
): Promise<OtpVerificationResult> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({ 
      phone, 
      token, 
      type: 'sms' 
    })
    
    if (error) {
      return {
        success: false,
        message: error.message,
        error
      }
    }
    
    return {
      success: true,
      message: 'OTP verified successfully via Supabase',
      data
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error verifying OTP via Supabase',
      error
    }
  }
}
