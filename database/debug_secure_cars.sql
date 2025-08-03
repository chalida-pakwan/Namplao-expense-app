-- ===========================================
-- 🔧 SECURE CARS DATABASE FIX & VERIFICATION
-- ===========================================

-- ขั้นตอนที่ 1: ตรวจสอบ tables ที่มีอยู่
SELECT 
    table_name,
    CASE WHEN table_name IN ('joint_cars', 'car_members', 'joint_car_notifications', 'joint_car_additional_expenses') 
         THEN '✅ Required' 
         ELSE '❓ Optional' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%joint_car%' OR table_name LIKE '%car_%'
ORDER BY table_name;

-- ขั้นตอนที่ 2: ตรวจสอบ columns ใน joint_cars  
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE WHEN column_name IN ('id', 'user_id', 'date', 'brand', 'model', 'car_code') 
         THEN '✅ Critical' 
         ELSE '✓ Normal' 
    END as importance
FROM information_schema.columns 
WHERE table_name = 'joint_cars'
ORDER BY ordinal_position;

-- ขั้นตอนที่ 3: แก้ไข/เพิ่ม car_code field (ถ้ายังไม่มี)
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

-- ขั้นตอนที่ 4: ตรวจสอบ RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd,
    CASE WHEN cmd = 'ALL' THEN '✅ Full Access' 
         WHEN cmd IN ('SELECT', 'INSERT', 'UPDATE') THEN '✓ ' || cmd
         ELSE '❓ ' || cmd 
    END as policy_type
FROM pg_policies 
WHERE tablename IN ('joint_cars', 'car_members', 'joint_car_notifications')
ORDER BY tablename, cmd;

-- ขั้นตอนที่ 5: Test query ที่ app ใช้
-- (แสดงตัวอย่างข้อมูลที่ app จะได้)
SELECT 
    'TEST QUERY RESULTS:' as info,
    COUNT(*) as total_cars,
    COUNT(CASE WHEN car_code IS NOT NULL THEN 1 END) as cars_with_code,
    COUNT(CASE WHEN car_code IS NULL THEN 1 END) as cars_without_code
FROM joint_cars;

-- ขั้นตอนที่ 6: ตัวอย่างข้อมูลจาก joint_cars (5 รายการล่าสุด)
SELECT 
    id,
    brand,
    model,
    car_code,
    user_id,
    status,
    created_at
FROM joint_cars 
ORDER BY created_at DESC 
LIMIT 5;

-- สรุปสถานะระบบ
DO $$
DECLARE
    car_count INTEGER;
    member_count INTEGER;
    notification_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO car_count FROM joint_cars;
    SELECT COUNT(*) INTO member_count FROM car_members;
    SELECT COUNT(*) INTO notification_count FROM joint_car_notifications;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 SECURE CARS SYSTEM STATUS:';
    RAISE NOTICE '   🚗 Total Cars: %', car_count;
    RAISE NOTICE '   👥 Total Members: %', member_count;
    RAISE NOTICE '   📢 Total Notifications: %', notification_count;
    RAISE NOTICE '';
    
    IF car_count > 0 AND member_count > 0 THEN
        RAISE NOTICE '✅ System is operational and has data';
    ELSIF car_count = 0 THEN
        RAISE NOTICE '⚠️  No cars found - create test data or check app functionality';
    ELSE
        RAISE NOTICE '⚠️  System setup incomplete';
    END IF;
END
$$;
