# 📱 การตั้งค่า Phone Authentication ใน Supabase

## ⚠️ ข้อกำหนดสำคัญ

### 1. เปิดใช้งาน Phone Auth
1. เข้า Supabase Dashboard: https://app.supabase.com/project/vceydzpvcuscbphleyhw
2. ไปที่ **Authentication > Settings**
3. ใน **Auth Providers** เปิดใช้งาน **Phone**

### 2. ตั้งค่า Twilio (สำหรับ Production)
สำหรับการใช้งานจริง ต้องตั้งค่า Twilio:

1. **ใน Supabase Dashboard:**
   - ไปที่ **Settings > Auth**
   - ใน **SMS Provider** เลือก **Twilio**
   - กรอก:
     - `Account SID`
     - `Auth Token` 
     - `Phone Number` (เบอร์ Twilio ที่ซื้อ)

2. **สำหรับ Development:**
   - Supabase ให้ใช้ทดสอบ OTP ได้โดยไม่ต้องตั้งค่า Twilio
   - แต่จะมีข้อจำกัดในจำนวนการส่ง

## 🧪 การทดสอบ

### ในหน้าเว็บ http://localhost:3000:

1. **เปิด Developer Console** (F12)
2. **กรอกเบอร์โทรศัพท์** รูปแบบใดรูปแบบหนึ่ง:
   - `0947251267` (จะแปลงเป็น +66947251267 อัตโนมัติ)
   - `947251267` (จะแปลงเป็น +66947251267 อัตโนมัติ)
   - `+66947251267` (รูปแบบที่ถูกต้องแล้ว)

3. **กดปุ่ม "ส่งรหัส OTP"**

4. **ตรวจสอบ Console** จะแสดง:
   ```
   📱 ส่ง OTP ไปที่: +66947251267
   📱 OTP Request Debug:
   Phone number: +66947251267
   Timestamp: 2024-XX-XXTXX:XX:XX.XXXZ
   ✅ OTP Data: {...}
   ```

### 📊 การ Debug

**ถ้าสำเร็จ:**
- Console จะแสดง "✅ ส่ง OTP สำเร็จ"
- หน้าเว็บจะแสดงช่องกรอก OTP
- SMS จะส่งไปที่เบอร์ที่กรอก (หากตั้งค่า Twilio แล้ว)

**ถ้าไม่สำเร็จ:**
- Console จะแสดง error message ที่ละเอียด
- ตรวจสอบ:
  1. การเชื่อมต่อ Supabase (URL + ANON_KEY)
  2. การเปิดใช้งาน Phone Auth ใน Dashboard
  3. การตั้งค่า Twilio (สำหรับ production)

## 🔧 Troubleshooting

### Error: "SMS Provider not configured"
- ต้องตั้งค่า Twilio ใน Supabase Dashboard

### Error: "Invalid phone number"
- ตรวจสอบรูปแบบเบอร์โทรศัพท์ (+66xxxxxxxxx)

### Error: "Rate limit exceeded" 
- Supabase จำกัดจำนวนการส่ง OTP ในช่วงเวลาหนึ่ง
- รอสักครู่แล้วลองใหม่

## 📱 เบอร์ทดสอบสำหรับ Development

สำหรับการทดสอบ สามารถใช้เบอร์ที่ไม่มีจริงได้ แต่:
- Supabase อาจไม่ส่ง SMS จริง
- ใช้เพื่อทดสอบ UI/UX และการ debug เท่านั้น
