-- ===========================================
-- 🚀 COMPLETE DATABASE SETUP FOR SECURE CARS
-- ===========================================
-- รันไฟล์นี้ใน Supabase SQL Editor เพื่อ setup ทุกอย่าง

-- ขั้นตอนที่ 1: ตรวจสอบ table หลัก
DO $$
BEGIN
    -- ตรวจสอบ joint_cars table
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'joint_cars'
    ) THEN
        RAISE EXCEPTION '❌ Table joint_cars not found. Please run create_joint_cars_tables.sql first';
    ELSE
        RAISE NOTICE '✅ Table joint_cars exists';
    END IF;
END
$$;

-- ขั้นตอนที่ 2: เพิ่ม car_code field ถ้ายังไม่มี
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
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

-- ขั้นตอนที่ 3: สร้าง car_members table
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

-- ขั้นตอนที่ 4: สร้าง notifications table
CREATE TABLE IF NOT EXISTS joint_car_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
  investor_name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  amount_owed DECIMAL(15,2) DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ขั้นตอนที่ 5: สร้าง indexes
CREATE INDEX IF NOT EXISTS idx_car_members_car_id ON car_members(car_id);
CREATE INDEX IF NOT EXISTS idx_car_members_user_id ON car_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_car_id ON joint_car_notifications(car_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON joint_car_notifications(read);

-- ขั้นตอนที่ 6: เปิด RLS
ALTER TABLE car_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_car_notifications ENABLE ROW LEVEL SECURITY;

-- ขั้นตอนที่ 7: สร้าง RLS Policies
DO $$
BEGIN
    -- ลบ policies เดิม (ถ้ามี)
    DROP POLICY IF EXISTS "car_members_read_policy" ON car_members;
    DROP POLICY IF EXISTS "car_members_insert_policy" ON car_members;
    DROP POLICY IF EXISTS "notifications_read_policy" ON joint_car_notifications;
    DROP POLICY IF EXISTS "notifications_insert_policy" ON joint_car_notifications;
    DROP POLICY IF EXISTS "notifications_update_policy" ON joint_car_notifications;

    -- Car Members Policies
    CREATE POLICY "car_members_read_policy" ON car_members
      FOR SELECT USING (true);

    CREATE POLICY "car_members_insert_policy" ON car_members
      FOR INSERT WITH CHECK (true);

    -- Notifications Policies
    CREATE POLICY "notifications_read_policy" ON joint_car_notifications
      FOR SELECT USING (true);

    CREATE POLICY "notifications_insert_policy" ON joint_car_notifications
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "notifications_update_policy" ON joint_car_notifications
      FOR UPDATE USING (true);

    RAISE NOTICE '✅ All RLS policies created successfully';
END
$$;

-- ขั้นตอนที่ 8: แสดงสถานะ
DO $$
BEGIN
    RAISE NOTICE '🎉 SETUP COMPLETE! ';
    RAISE NOTICE '📋 Tables created:';
    RAISE NOTICE '   ✅ joint_cars (with car_code field)';
    RAISE NOTICE '   ✅ car_members';
    RAISE NOTICE '   ✅ joint_car_notifications';
    RAISE NOTICE '🔒 RLS policies enabled for all tables';
    RAISE NOTICE '📊 All indexes created for performance';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to use Secure Cars system!';
END
$$;
