# Server Configuration - Backup

## วันที่เซฟ
31 กรกฎาคม 2568

## การตั้งค่า Server ปัจจุบัน
- **Port:** 3000
- **Framework:** Next.js 15.4.4
- **Environment:** Development
- **Local URL:** http://localhost:3000
- **Network URL:** http://192.168.1.131:3000

## สถานะ Server
✅ Server ทำงานปกติ
✅ Port 3000 ใช้งานได้
✅ Environment file (.env.local) โหลดได้

## คำสั่งสำหรับรัน Server
```bash
npm run dev
```

## การแก้ไขปัญหา Port ที่เกิดขึ้น
1. หยุด process ที่ใช้ port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

2. ตรวจสอบ Next.js process:
```bash
ps aux | grep -v grep | grep next
```

3. เริ่ม server ใหม่:
```bash
npm run dev
```

## Warning ที่เกิดขึ้น (ไม่กระทบการทำงาน)
```
⚠ Invalid next.config.js options detected: 
⚠     Unrecognized key(s) in object: 'allowedOrigins' at "experimental"
```

## Terminal ID ปัจจุบัน
- Active Server Terminal: 3ffaf01c-edff-4957-9f5a-11b4b6f74b74

## หมายเหตุ
- Server พร้อมใช้งานแล้ว
- ไม่ต้องใช้ port อื่นนอกจาก 3000
- การตั้งค่าทั้งหมดทำงานปกติ

---

## 🚀 ฟีเจอร์ที่สามารถต่อยอดได้ทันที

### 1. 📤 Export PDF รายงานเฉพาะของตัวเอง
- **จุดประสงค์:** ให้ผู้ใช้สามารถออกรายงานเฉพาะส่วนของตัวเองได้
- **การทำงาน:** Filter ข้อมูลตาม user_id แล้วสร้าง PDF 
- **ไฟล์ที่เกี่ยวข้อง:** `components/PDFExport.tsx`
- **ระดับความยาก:** ⭐⭐⭐ (ปานกลาง)

### 2. 🧮 คำนวณกำไรแบบส่วนตัว
- **จุดประสงค์:** แสดงกำไรที่ผู้ใช้แต่ละคนจะได้รับตามสัดส่วนการลงทุน
- **ตัวอย่าง:** นาย A ลงทุน 30% จากทุน 100,000 บาท → กำไร 15,000 บาท → ได้รับ 4,500 บาท
- **ไฟล์ที่เกี่ยวข้อง:** `components/JointCarCharts.tsx`, `app/joint-cars/[id]/page.tsx`
- **ระดับความยาก:** ⭐⭐ (ง่าย)

### 3. 🕵️‍♀️ ประวัติการแก้ไข (Edit Logs)
- **จุดประสงค์:** ติดตามว่าใครแก้ไขอะไร เมื่อไหร่
- **การทำงาน:** เพิ่ม audit_logs table ใน Supabase + triggers
- **ข้อมูลที่บันทึก:** user_id, action, old_value, new_value, timestamp
- **ระดับความยาก:** ⭐⭐⭐⭐ (ยาก)

### 4. 🛎 ระบบแจ้งเตือน (Notifications)
- **จุดประสงค์:** แจ้งเตือนเมื่อมีการเปลี่ยนแปลงข้อมูลในรถที่เกี่ยวข้อง
- **ตัวอย่าง:** "มีคนเพิ่มรายจ่าย 5,000 บาท ในรถ Toyota Camry"
- **เทคโนโลยี:** Supabase Realtime + Push Notifications
- **ไฟล์ที่เกี่ยวข้อง:** `components/NotificationSystem.tsx`
- **ระดับความยาก:** ⭐⭐⭐⭐⭐ (ยากมาก)

### 5. 🔎 ค้นหาขั้นสูง (Advanced Search)
- **จุดประสงค์:** ค้นหาข้อมูลแบบละเอียด เช่น ตามหมวดหมู่, วันที่, จำนวนเงิน
- **ตัวอย่าง:** "ดูเฉพาะรายจ่ายซ่อม เดือนมิถุนายน มากกว่า 10,000 บาท"
- **การทำงาน:** สร้าง Advanced Filter Component
- **ระดับความยาก:** ⭐⭐⭐ (ปานกลาง)

### 6. 🌐 ระบบหลายภาษา (Multi-language)
- **จุดประสงค์:** รองรับภาษาอังกฤษเพื่อขยายฐานผู้ใช้
- **เทคโนโลยี:** next-i18next หรือ react-i18next
- **ไฟล์ใหม่:** `locales/th.json`, `locales/en.json`
- **ระดับความยาก:** ⭐⭐⭐ (ปานกลาง)

---

## 📋 แผนการพัฒนาที่แนะนำ

### Phase 1: ฟีเจอร์พื้นฐาน (1-2 สัปดาห์)
1. คำนวณกำไรส่วนตัว (ง่ายที่สุด)
2. Export PDF รายงานส่วนตัว

### Phase 2: ฟีเจอร์ขั้นกลาง (2-3 สัปดาห์)  
3. ค้นหาขั้นสูง
4. ระบบหลายภาษา

### Phase 3: ฟีเจอร์ขั้นสูง (3-4 สัปดาห์)
5. ประวัติการแก้ไข
6. ระบบแจ้งเตือนแบบ real-time

---

## 💡 ข้อแนะนำในการพัฒนา
- เริ่มจากฟีเจอร์ที่ใช้งานได้ทันทีและให้ผลลัพธ์ชัดเจน
- ทดสอบกับผู้ใช้จริงก่อนทำฟีเจอร์ที่ซับซ้อน
- สำรองข้อมูลก่อนเพิ่มฟีเจอร์ใหม่ทุกครั้ง

---

## ✅ แผนงานต่อไป (Next Action Plan)

### Phase 1: UI Enhancement & Interface (1-2 วัน)
#### 🎨 1. แก้หน้า UI → เพิ่มปุ่มและอินเตอร์เฟซ
- ✅ **ปุ่มเพิ่มค่าใช้จ่าย** พร้อมไอคอน 💰
- ✅ **ปุ่มดูกราฟผลกำไร-ต้นทุนรายคัน** 📊  
- ✅ **ปุ่มดูบันทึกการแก้ไข** (Edit Log) 🕵️‍♀️

**ไฟล์ที่ต้องแก้:**
- `app/joint-cars/[id]/page.tsx` - เพิ่มปุ่มในส่วน header
- `app/secure-cars/[id]/page.tsx` - เพิ่มปุ่มในส่วน navigation tabs

### Phase 2: Chart System Implementation (2-3 วัน)
#### 📊 2. เพิ่มระบบแสดงผลกราฟ (Chart.js)
- 📈 **กราฟเส้น:** ต้นทุนรวม vs ราคาขาย
- 📊 **กราฟแท่ง:** เปรียบเทียบรายได้-รายจ่าย  
- 🥧 **กราฟวงกลม:** แสดงสัดส่วนผู้ลงทุน

**Dependencies ที่ต้องติดตั้ง:**
```bash
npm install chart.js react-chartjs-2
```

**ไฟล์ใหม่ที่จะสร้าง:**
- `components/charts/LineChart.tsx` - กราฟเส้น
- `components/charts/BarChart.tsx` - กราฟแท่ง  
- `components/charts/PieChart.tsx` - กราฟวงกลม
- `components/charts/ChartContainer.tsx` - Container หลัก

### Phase 3: API & Backend (2-3 วัน)
#### 🔌 3. เขียน API สำหรับบันทึกการแก้ไข
- 📝 **POST /api/edit-logs** → บันทึกใครแก้ไขอะไร เมื่อไหร่
- 📋 **GET /api/edit-logs?carId=xxxx** → ดูประวัติการเปลี่ยนแปลงในแต่ละคัน

**Database Schema ที่ต้องเพิ่ม:**
```sql
CREATE TABLE edit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID REFERENCES joint_cars(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  field_name TEXT, -- 'status', 'price', 'expenses'
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**ไฟล์ API ใหม่:**
- `app/api/edit-logs/route.ts` - Main API endpoint
- `app/api/edit-logs/[carId]/route.ts` - Get logs by car
- `lib/audit-logger.ts` - Utility functions

### 🎯 Timeline Summary
- **Week 1:** UI Buttons & Interface Enhancement
- **Week 2:** Chart.js Integration & Visualization  
- **Week 3:** Edit Logs API & Database Implementation

### 🔧 Technical Requirements
```json
{
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.263.1"
}
```

### 📋 Success Metrics
- ⏱️ ใช้เวลาดูข้อมูลลดลง 50%
- 📊 ผู้ใช้เปิดดูกราฟเพิ่มขึ้น 80%
- 🔍 ตรวจสอบประวัติการแก้ไขได้ 100%
- 😊 ความพึงพอใจ UI/UX เพิ่มขึ้น

### 🚀 Ready to Start
ต้องการเริ่มจากไหนก่อนครับ?
1. **UI Enhancement** (ง่ายที่สุด, ให้ผลเร็ว)
2. **Chart Integration** (ผลลัพธ์ชัดเจน)  
3. **Edit Logs API** (Foundation สำคัญ)
