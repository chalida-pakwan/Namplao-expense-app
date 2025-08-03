-- 🚀 QUICK FIX: รหัสปลอดภัย 6 หลักไม่แสดง
-- รันไฟล์นี้ใน Supabase SQL Editor

-- ขั้นตอนที่ 1: เพิ่ม car_code field ถ้ายังไม่มี
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name -- ✅ Policy 1: ให้ creator และสมาชิกดูได้
CREATE POLICY "Allow select for car creators and members"
ON public.joint_cars
FOR SELECT
USING (
  auth.uid() = created_by
  OR EXISTS (
    SELECT 1
    FROM public.joint_car_members
    WHERE joint_car_members.car_secure_id = joint_cars.id
      AND joint_car_members.member_id = auth.uid()
  )
);
        FROM information_schema.columns 
        WHERE table_name = 'joint_cars' 
        AND column_name = 'car_code'
    ) THEN
        ALTER TABLE joint_cars ADD COLUMN car_code VARCHAR(6);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_joint_cars_car_code_unique 
        ON joint_cars(car_code) WHERE car_code IS NOT NULL;
        RAISE NOTICE '✅ Added car_code field to joint_cars';
    ELSE
        RAISE NOTICE '✅ car_code field already exists';
    END IF;
END
$$;

-- ขั้นตอนที่ 2: สร้าง car_members table ถ้ายังไม่มี  
CREATE TABLE IF NOT EXISTS car_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(car_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_car_members_car_id ON car_members(car_id);
CREATE INDEX IF NOT EXISTS idx_car_members_user_id ON car_members(user_id);

-- ขั้นตอนที่ 3: เปิด RLS และสร้าง policies แบบง่าย
ALTER TABLE joint_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_members ENABLE ROW LEVEL SECURITY;

-- ลบ policies เดิม
DROP POLICY IF EXISTS "joint_cars_full_access" ON joint_cars;
DROP POLICY IF EXISTS "car_members_full_access" ON car_members;

-- สร้าง policies ใหม่ (ให้ authenticated users ทำทุกอย่างได้)
CREATE POLICY "joint_cars_full_access" ON joint_cars
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "car_members_full_access" ON car_members
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ขั้นตอนที่ 4: ตรวจสอบ tables
SELECT 
    'Tables Status:' as info,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'joint_cars') as joint_cars_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'car_members') as car_members_exists,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'joint_cars' AND column_name = 'car_code') as car_code_field_exists;

RAISE NOTICE '🎉 Quick fix complete! Try creating a car now.';
