# 📱 การตั้งค่า Twilio Verify API

## 🔧 ขั้นตอนการตั้งค่า Twilio

### 1. สร้างบัญชี Twilio
1. ไปที่ https://www.twilio.com/
2. สมัครบัญชีใหม่ หรือ Login
3. ยืนยันเบอร์โทรศัพท์

### 2. หา Credentials
จาก Twilio Console Dashboard:

**Account SID & Auth Token:**
- ไปที่ **Dashboard**
- คัดลอก `Account SID` และ `Auth Token`

**Service SID (Verify):**
- ไปที่ **Verify > Services**  
- สร้าง Service ใหม่ หรือใช้ที่มีอยู่
- คัดลอก `Service SID`

### 3. อัปเดต Environment Variables

แก้ไขไฟล์ `.env.local`:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_actual_auth_token_here  
TWILIO_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **แทนที่ค่าด้วย credentials จริงจาก Twilio Console**

## 🧪 การทดสอบ

### ทดสอบด้วย curl:

```bash
# ส่ง OTP
curl 'http://localhost:3000/api/send-otp' \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+66947251267"}'

# ยืนยัน OTP  
curl 'http://localhost:3000/api/verify-otp' \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+66947251267","code":"123456"}'
```

### ทดสอบในเว็บ:

1. **เปิด http://localhost:3000**
2. **เปิด Developer Console (F12)**
3. **กรอกเบอร์โทรศัพท์ และกด "ส่งรหัส OTP"**

**ตรวจสอบ Console:**
```
📱 ส่ง OTP ไปที่: +66947251267
🔵 ใช้ Twilio Verify API  // หากมี Twilio config
🟢 ใช้ Supabase Auth (fallback)  // หากไม่มี Twilio config
```

## 📊 Logic การทำงาน

**1. การส่ง OTP (`/api/send-otp`):**
```
✅ มี Twilio config ครบ → ใช้ Twilio Verify API
❌ ไม่มี Twilio config → ใช้ Supabase Auth (fallback)
```

**2. การยืนยัน OTP (`/api/verify-otp`):**
```
✅ มี Twilio config ครบ → ใช้ Twilio Verify API
❌ ไม่มี Twilio config → ใช้ Supabase Auth (fallback)  
```

## 🔀 Fallback System

**ระบบจะทำงานแบบ fallback:**

1. **ลองใช้ Twilio ก่อน** (ถ้ามี config ครบ)
2. **ถ้าไม่มี Twilio ใช้ Supabase** (fallback)
3. **ทั้งสองวิธีใช้ API เดียวกัน**

## 💰 ค่าใช้จ่าย Twilio

**Twilio Verify Pricing:**
- **SMS OTP:** ~$0.05 ต่อข้อความ
- **Voice OTP:** ~$0.30 ต่อสาย
- **WhatsApp OTP:** ~$0.005 ต่อข้อความ

**สำหรับ Development:**
- Twilio ให้เครดิตฟรี $15 สำหรับทดสอบ
- สามารถส่ง OTP ได้ประมาณ 300 ข้อความ

## 🔒 Security Best Practices

**1. เก็บ Credentials อย่างปลอดภัย:**
- ไม่เก็บใน code
- ใช้ environment variables
- ไม่ commit `.env.local` ลง git

**2. จำกัดการใช้งาน:**
- ตั้ง rate limiting
- ตรวจสอบเบอร์โทรศัพท์ก่อนส่ง
- จำกัดจำนวนครั้งในการลองยืนยัน

**3. Monitoring:**
- ติดตาม usage ใน Twilio Console
- ตั้ง alerts สำหรับ unusual activity

## 🐛 Troubleshooting

**Error: "Invalid credentials"**
- ตรวจสอบ `TWILIO_ACCOUNT_SID` และ `TWILIO_AUTH_TOKEN`

**Error: "Service not found"**  
- ตรวจสอบ `TWILIO_SERVICE_SID`

**Error: "Invalid phone number"**
- ตรวจสอบรูปแบบเบอร์ (+66xxxxxxxxx)

**ไม่ได้รับ SMS:**
- ตรวจสอบว่าเบอร์ถูกต้อง
- ตรวจสอบ Twilio Console Logs
- ตรวจสอบ blocked numbers
