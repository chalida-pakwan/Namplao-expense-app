-- เพิ่มฟิลด์ car_code สำหรับระบบ Secure Cars
ALTER TABLE joint_cars 
ADD COLUMN IF NOT EXISTS car_code VARCHAR(6);

-- สร้าง index สำหรับ car_code
CREATE INDEX IF NOT EXISTS idx_joint_cars_car_code ON joint_cars(car_code);

-- สร้าง unique constraint สำหรับ car_code (ยกเว้น NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_joint_cars_car_code_unique 
ON joint_cars(car_code) 
WHERE car_code IS NOT NULL;

-- เพิ่ม comment
COMMENT ON COLUMN joint_cars.car_code IS 'รหัสปลอดภัย 6 หลักสำหรับเชิญสมาชิก (Secure Cars เท่านั้น)';
