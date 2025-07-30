-- เพิ่มฟิลด์สำหรับหลักฐานสลิป/ใบเสร็จในค่าใช้จ่าย
-- สำหรับ joint_cars.additional_expenses (JSONB)
-- ตัวอย่างโครงสร้างใหม่:
/*
{
  "description": "[ซ่อมแซม] เปลี่ยนยางรถ",
  "amount": 2500,
  "date": "2024-01-15",
  "added_by": "user-uuid",
  "added_at": "2024-01-15T10:30:00Z",
  "receipt_url": "https://supabase-url/receipt.jpg",
  "receipt_path": "expense-receipts/user-id/filename.jpg"
}
*/

-- เพิ่มฟิลด์สำหรับตาราง post_sale_expenses
ALTER TABLE post_sale_expenses 
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_path TEXT,
ADD COLUMN IF NOT EXISTS receipt_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- เพิ่มฟิลด์สำหรับตาราง car_expenses (Secure Cars)
ALTER TABLE car_expenses 
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_path TEXT,
ADD COLUMN IF NOT EXISTS receipt_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- สร้าง index สำหรับการค้นหาใบเสร็จ
CREATE INDEX IF NOT EXISTS idx_post_sale_expenses_receipt ON post_sale_expenses(receipt_path);
CREATE INDEX IF NOT EXISTS idx_car_expenses_receipt ON car_expenses(receipt_path);

-- เพิ่ม comment อธิบายการใช้งาน
COMMENT ON COLUMN post_sale_expenses.receipt_url IS 'URL สำหรับเข้าถึงไฟล์หลักฐานใบเสร็จ';
COMMENT ON COLUMN post_sale_expenses.receipt_path IS 'Path ไฟล์ในระบบ Storage';
COMMENT ON COLUMN car_expenses.receipt_url IS 'URL สำหรับเข้าถึงไฟล์หลักฐานใบเสร็จ';
COMMENT ON COLUMN car_expenses.receipt_path IS 'Path ไฟล์ในระบบ Storage';

-- สร้าง policy สำหรับ Storage bucket 'files' (ถ้ายังไม่มี)
-- ให้ผู้ใช้สามารถอัปโหลดและดูไฟล์ของตัวเองได้

-- เพิ่ม RLS policy สำหรับ expense receipts
-- Policy สำหรับ post_sale_expenses
CREATE POLICY IF NOT EXISTS "Users can view post sale expense receipts for their cars" 
ON post_sale_expenses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM joint_cars 
    WHERE joint_cars.id = post_sale_expenses.car_id 
    AND (
      joint_cars.user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(joint_cars.investors) AS inv 
        WHERE (inv->>'email')::text = auth.email()
      )
    )
  )
);

-- Policy สำหรับ car_expenses  
CREATE POLICY IF NOT EXISTS "Users can view car expense receipts for their cars"
ON car_expenses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM car_members cm
    JOIN secure_cars sc ON sc.id = cm.car_id
    WHERE cm.car_id = car_expenses.car_id 
    AND cm.user_id = auth.uid()
  )
);

-- Success message
SELECT 'Receipt support added to expense tracking! 📎📄' as status;
