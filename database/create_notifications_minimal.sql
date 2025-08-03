-- ตรวจสอบและสร้างตาราง notifications แบบปลอดภัย
-- ขั้นตอนที่ 1: ตรวจสอบว่ามี table joint_cars อยู่หรือไม่
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'joint_cars'
    ) THEN
        RAISE EXCEPTION 'Table joint_cars does not exist. Please create it first.';
    END IF;
END
$$;

-- ขั้นตอนที่ 2: สร้างตาราง notifications
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

-- ขั้นตอนที่ 3: สร้าง indexes (ใช้ IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_notifications_car_id ON joint_car_notifications(car_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON joint_car_notifications(read);

-- ขั้นตอนที่ 4: เปิด RLS
ALTER TABLE joint_car_notifications ENABLE ROW LEVEL SECURITY;

-- ขั้นตอนที่ 5: จัดการ policies แบบปลอดภัย
DO $$
BEGIN
    -- ลบ policies เดิม (ถ้ามี)
    DROP POLICY IF EXISTS "Allow read notifications" ON joint_car_notifications;
    DROP POLICY IF EXISTS "Allow insert notifications" ON joint_car_notifications;
    DROP POLICY IF EXISTS "Allow update notifications" ON joint_car_notifications;
    DROP POLICY IF EXISTS "notifications_read_policy" ON joint_car_notifications;
    DROP POLICY IF EXISTS "notifications_insert_policy" ON joint_car_notifications;
    DROP POLICY IF EXISTS "notifications_update_policy" ON joint_car_notifications;

    -- สร้าง policies ใหม่
    CREATE POLICY "notifications_read_policy" ON joint_car_notifications
      FOR SELECT USING (true);

    CREATE POLICY "notifications_insert_policy" ON joint_car_notifications
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "notifications_update_policy" ON joint_car_notifications
      FOR UPDATE USING (true);

    RAISE NOTICE 'Notification policies created successfully';
END
$$;
