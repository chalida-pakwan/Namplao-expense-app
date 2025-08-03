-- ตรวจสอบและสร้างตาราง notifications แบบปลอดภัย
DO $$
BEGIN
    -- ตรวจสอบว่ามี table joint_car_notifications หรือไม่
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'joint_car_notifications'
    ) THEN
        -- สร้างตาราง notifications
        CREATE TABLE joint_car_notifications (
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

        -- สร้าง indexes
        CREATE INDEX idx_notifications_car_id ON joint_car_notifications(car_id);
        CREATE INDEX idx_notifications_read ON joint_car_notifications(read);

        -- เปิด RLS
        ALTER TABLE joint_car_notifications ENABLE ROW LEVEL SECURITY;

        -- สร้าง policies
        CREATE POLICY "notifications_read_policy" ON joint_car_notifications
          FOR SELECT USING (true);

        CREATE POLICY "notifications_insert_policy" ON joint_car_notifications
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "notifications_update_policy" ON joint_car_notifications
          FOR UPDATE USING (true);

        RAISE NOTICE 'Table joint_car_notifications created successfully';
    ELSE
        RAISE NOTICE 'Table joint_car_notifications already exists';
    END IF;
END
$$;
