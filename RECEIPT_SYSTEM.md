# 📎 ระบบแนบหลักฐานสลิป/ใบเสร็จสำหรับค่าใช้จ่าย

## ✨ ฟีเจอร์ใหม่: Receipt Attachment System

เพิ่มฟีเจอร์การแนบหลักฐานสลิป/ใบเสร็จสำหรับค่าใช้จ่ายภายหลังของรถแต่ละคัน เพื่อความโปร่งใสในการจัดการเงิน

### 🎯 จุดประสงค์:
- เพิ่มความโปร่งใสในการจัดการค่าใช้จ่าย
- มีหลักฐานรองรับทุกรายการค่าใช้จ่าย
- ลดข้อพิพาทระหว่างผู้ลงทุน
- ตรวจสอบการใช้จ่ายได้อย่างชัดเจน

### 📋 ฟีเจอร์ที่เพิ่มเข้ามา:

#### 1. **ExpenseReceiptUpload Component**
- **ไฟล์:** `components/ExpenseReceiptUpload.tsx`
- **คุณสมบัติ:**
  - รองรับไฟล์รูปภาพ (JPG, PNG, WEBP) และ PDF
  - Drag & Drop interface
  - ขนาดไฟล์สูงสุด 5MB
  - Preview และลิงก์ดูไฟล์
  - UI สวยงามและใช้งานง่าย

#### 2. **อัปเดต AddExpenseModal**
- เพิ่มส่วนอัปโหลดหลักฐาน
- บันทึก URL และ Path ของไฟล์
- แสดงสถานะการอัปโหลด

#### 3. **อัปเดต PostSaleExpenseManager**
- รองรับการแนบหลักฐานค่าใช้จ่ายภายหลัง
- แสดงลิงก์ดูหลักฐานในรายการ
- อัปเดตฐานข้อมูลเพิ่มฟิลด์ใหม่

#### 4. **อัปเดต SecureCarExpenses**
- รองรับการแนบหลักฐานใน Secure Cars
- ใช้ ExpenseReceiptUpload component
- แสดงลิงก์ดูหลักฐาน

### 🗄️ การเปลี่ยนแปลงฐานข้อมูล:

```sql
-- เพิ่มฟิลด์ใหม่ในตาราง post_sale_expenses
ALTER TABLE post_sale_expenses 
ADD COLUMN receipt_url TEXT,
ADD COLUMN receipt_path TEXT,
ADD COLUMN receipt_uploaded_at TIMESTAMP WITH TIME ZONE;

-- เพิ่มฟิลด์ใหม่ในตาราง car_expenses  
ALTER TABLE car_expenses 
ADD COLUMN receipt_url TEXT,
ADD COLUMN receipt_path TEXT,
ADD COLUMN receipt_uploaded_at TIMESTAMP WITH TIME ZONE;
```

### 📦 โครงสร้างข้อมูล:

#### Joint Cars (additional_expenses JSONB):
```json
{
  "description": "[ซ่อมแซม] เปลี่ยนยางรถ",
  "amount": 2500,
  "date": "2024-01-15",
  "added_by": "user-uuid",
  "added_at": "2024-01-15T10:30:00Z",
  "receipt_url": "https://supabase-url/receipt.jpg",
  "receipt_path": "expense-receipts/user-id/filename.jpg"
}
```

#### Post Sale Expenses & Car Expenses:
- `receipt_url`: URL สำหรับเข้าถึงไฟล์
- `receipt_path`: Path ไฟล์ในระบบ Storage
- `receipt_uploaded_at`: วันที่อัปโหลด

### 🔒 ความปลอดภัย:

1. **File Validation:**
   - ตรวจสอบประเภทไฟล์ (รูปภาพ, PDF)
   - จำกัดขนาดไฟล์ (5MB)
   - ตั้งชื่อไฟล์แบบสุ่มป้องกันการชน

2. **Storage Security:**
   - เก็บไฟล์ใน Supabase Storage bucket 'files'
   - แยกโฟลเดอร์ตาม user_id
   - RLS policies ป้องกันการเข้าถึงไฟล์ของคนอื่น

3. **Database Security:**
   - เฉพาะเจ้าของเท่านั้นที่เห็นหลักฐาน
   - RLS policies ตามสิทธิ์การเข้าถึงรถ

### 🎨 UX/UI Features:

1. **Drag & Drop Interface:**
   - ลากไฟล์มาวางได้
   - แสดงสถานะการอัปโหลด
   - Preview ไฟล์ที่เลือก

2. **File Management:**
   - ดูไฟล์ในแท็บใหม่
   - ลบไฟล์และเลือกใหม่
   - แสดงชื่อไฟล์และสถานะ

3. **User Experience:**
   - คำแนะนำการใช้งาน
   - แสดงข้อผิดพลาดชัดเจน
   - Loading states และ feedback

### 📱 การใช้งาน:

#### สำหรับผู้ใช้:
1. เข้าไปเพิ่มค่าใช้จ่ายใน Joint Cars หรือ Secure Cars
2. กรอกรายละเอียดตามปกติ
3. ในส่วน "หลักฐานสลิป/ใบเสร็จ" ลากไฟล์มาวาง หรือคลิกเลือก
4. รอให้อัปโหลดเสร็จ (แสดงเครื่องหมายถูก)
5. บันทึกข้อมูล

#### การดูหลักฐาน:
1. ในรายการค่าใช้จ่าย จะมีลิงก์ "📎 ดูหลักฐานสลิป/ใบเสร็จ"
2. คลิกเพื่อเปิดไฟล์ในแท็บใหม่
3. สามารถดาวน์โหลดหรือพิมพ์ได้

### 🔧 Technical Implementation:

#### ไฟล์ที่สร้างใหม่:
- `components/ExpenseReceiptUpload.tsx` (216 บรรทัด)
- `database/add_receipt_support.sql` (SQL schema)

#### ไฟล์ที่แก้ไข:
- `components/modals/AddExpenseModal.tsx` - เพิ่มการอัปโหลด
- `components/PostSaleExpenseManager.tsx` - เพิ่มหลักฐาน  
- `components/SecureCarExpenses.tsx` - รองรับหลักฐาน

#### Dependencies ใหม่:
- ใช้ Supabase Storage API
- Lucide React icons เดิม
- ไม่ต้องติดตั้งแพ็กเกจเพิ่ม

### 🎉 ผลลัพธ์:

✅ **ความโปร่งใส:** ทุกรายจ่ายมีหลักฐานรองรับ  
✅ **ความน่าเชื่อถือ:** ลดข้อสงสัยระหว่างผู้ลงทุน  
✅ **การตรวจสอบ:** ง่ายต่อการ audit ย้อนหลัง  
✅ **มาตรฐาน:** เทียบเท่าระบบบัญชีทั่วไป  
✅ **UX ดี:** ใช้งานง่าย drag & drop  

### 🚀 การขยายผลต่อไป:

1. **OCR Integration:** อ่านข้อมูลจากใบเสร็จอัตโนมัติ
2. **Expense Categories:** จัดหมวดหมู่ตามประเภทใบเสร็จ
3. **Budget Tracking:** ติดตามงบประมาณตามหลักฐาน
4. **Tax Integration:** เชื่อมต่อระบบภาษี
5. **Mobile App:** อัปโหลดผ่านมือถือได้

---

**Status:** ✅ Production Ready | เสร็จสิ้น 100%  
**Last Updated:** 31 กรกฎาคม 2568  
**Version:** 1.0.0
