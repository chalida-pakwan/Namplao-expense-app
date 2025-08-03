-- ตรวจสอบสถานะ Database สำหรับระบบรหัสปลอดภัย

-- 1. ตรวจสอบว่าตาราง joint_cars มีฟิลด์ car_code หรือไม่
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'joint_cars' 
AND column_name = 'car_code';

-- 2. ตรวจสอบฟังก์ชั่น generate_car_code
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'generate_car_code';

-- 3. ดูข้อมูลตัวอย่างในตาราง joint_cars
SELECT id, brand, model, car_code, created_at 
FROM joint_cars 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. ตรวจสอบตาราง car_members
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'car_members';

-- 5. ทดสอบสร้างรหัสปลอดภัยด้วย SQL
SELECT LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0') as test_security_code;
