console.log('🔗 Setting up Supabase connection...');

// แสดง SQL ที่ต้องรันใน Supabase SQL Editor
const sqlContent = `-- เพิ่มฟิลด์สำหรับหลักฐานสลิป/ใบเสร็จในค่าใช้จ่าย
-- เพิ่มฟิลด์สำหรับตาราง post_sale_expenses
ALTER TABLE post_sale_expenses 
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_path TEXT,
ADD COLUMN IF NOT EXISTS receipt_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- เพิ่มฟิลด์สำหรับตาราง joint_car_additional_expenses (Secure Cars)
ALTER TABLE joint_car_additional_expenses 
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_path TEXT,
ADD COLUMN IF NOT EXISTS receipt_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- สร้าง index สำหรับการค้นหาใบเสร็จ
CREATE INDEX IF NOT EXISTS idx_post_sale_expenses_receipt ON post_sale_expenses(receipt_path);
CREATE INDEX IF NOT EXISTS idx_joint_car_additional_expenses_receipt ON joint_car_additional_expenses(receipt_path);

-- เพิ่ม comment อธิบายการใช้งาน
COMMENT ON COLUMN post_sale_expenses.receipt_url IS 'URL สำหรับเข้าถึงไฟล์หลักฐานใบเสร็จ';
COMMENT ON COLUMN post_sale_expenses.receipt_path IS 'Path ไฟล์ในระบบ Storage';
COMMENT ON COLUMN joint_car_additional_expenses.receipt_url IS 'URL สำหรับเข้าถึงไฟล์หลักฐานใบเสร็จ';
COMMENT ON COLUMN joint_car_additional_expenses.receipt_path IS 'Path ไฟล์ในระบบ Storage';

-- Success message
SELECT 'Receipt support added to expense tracking! 📎📄' as status;`;

console.log('');
console.log('==== SQL TO EXECUTE IN SUPABASE ====');
console.log(sqlContent);
console.log('==== END SQL ====');
console.log('');
console.log('📋 วิธีการใช้งาน:');
console.log('1. คัดลอก SQL ข้างบนทั้งหมด');
console.log('2. ไปที่ Supabase Dashboard > SQL Editor');
console.log('3. วาง SQL และกดปุ่ม RUN');
console.log('4. ระบบจะเพิ่มฟิลด์สำหรับอัปโหลดใบเสร็จ');
console.log('');
console.log('✅ พร้อมใช้งานแล้ว!');
