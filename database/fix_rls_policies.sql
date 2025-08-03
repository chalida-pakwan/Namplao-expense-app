-- ตรวจสอบและแก้ไข RLS Policies สำหรับ joint_cars
-- รันไฟล์นี้ใน Supabase SQL Editor

-- ขั้นตอนที่ 1: ตรวจสอบ RLS status
SELECT schemaname, tablename, rowsecurity, forcerls 
FROM pg_tables 
WHERE tablename = 'joint_cars';

-- ขั้นตอนที่ 2: ดู policies ปัจจุบัน  
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'joint_cars';

-- ขั้นตอนที่ 3: ลบ policies เดิม และสร้างใหม่แบบง่าย
DO $$
BEGIN
    -- ลบ policies เดิมทั้งหมด
    DROP POLICY IF EXISTS "Users can manage their own cars" ON joint_cars;
    DROP POLICY IF EXISTS "Users can view cars they're involved in" ON joint_cars;
    DROP POLICY IF EXISTS "joint_cars_read_policy" ON joint_cars;
    DROP POLICY IF EXISTS "joint_cars_insert_policy" ON joint_cars;
    DROP POLICY IF EXISTS "joint_cars_update_policy" ON joint_cars;
    DROP POLICY IF EXISTS "joint_cars_delete_policy" ON joint_cars;

    -- สร้าง policies ใหม่แบบง่าย (ให้ authenticated users ทำทุกอย่างได้)
    CREATE POLICY "joint_cars_full_access" ON joint_cars
      FOR ALL 
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');

    RAISE NOTICE '✅ Joint cars policies updated successfully';
END
$$;

-- ขั้นตอนที่ 4: ตรวจสอบ policies ใหม่
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'joint_cars';
