// ฟังก์ชันสำหรับทดสอบ OTP ใน browser console

window.testOtp = {
  // ทดสอบส่ง OTP
  async sendOtp(phone = '+66947251267') {
    console.log('📱 ทดสอบส่ง OTP ไปที่:', phone)
    
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      })
      
      const result = await response.json()
      console.log('📊 ผลลัพธ์:', result)
      return result
    } catch (error) {
      console.error('❌ Error:', error)
      return { success: false, error }
    }
  },

  // ทดสอบยืนยัน OTP
  async verifyOtp(phone = '+66947251267', code = '123456') {
    console.log('🔐 ทดสอบยืนยัน OTP:', code, 'สำหรับเบอร์:', phone)
    
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code })
      })
      
      const result = await response.json()
      console.log('📊 ผลลัพธ์:', result)
      return result
    } catch (error) {
      console.error('❌ Error:', error)
      return { success: false, error }
    }
  },

  // ทดสอบ workflow ทั้งหมด
  async testWorkflow(phone = '+66947251267') {
    console.log('🧪 เริ่มทดสอบ OTP workflow สำหรับ:', phone)
    
    // ส่ง OTP
    const sendResult = await this.sendOtp(phone)
    if (!sendResult.success) {
      console.error('❌ ส่ง OTP ไม่สำเร็จ:', sendResult.message)
      return
    }
    
    console.log('✅ ส่ง OTP สำเร็จ! ตอนนี้ลองยืนยันด้วยรหัสปลอม...')
    
    // ยืนยัน OTP (ด้วยรหัสปลอม)
    const verifyResult = await this.verifyOtp(phone, '123456')
    console.log('📋 สรุป workflow:', {
      send: sendResult.success,
      verify: verifyResult.success,
      message: verifyResult.message
    })
  }
}

console.log('🧪 ฟังก์ชันทดสอบ OTP พร้อมใช้งาน!')
console.log('📖 วิธีใช้:')
console.log('  testOtp.sendOtp("+66947251267")')
console.log('  testOtp.verifyOtp("+66947251267", "123456")')
console.log('  testOtp.testWorkflow("+66947251267")')
