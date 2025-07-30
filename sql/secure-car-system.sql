-- Secure Car Joint Investment System Database Schema

-- 1. เพิ่มฟิลด์ car_code ในตาราง joint_cars
ALTER TABLE joint_cars ADD COLUMN car_code VARCHAR(8) UNIQUE;

-- สร้าง index สำหรับ car_code
CREATE INDEX idx_joint_cars_car_code ON joint_cars(car_code);

-- 2. สร้างตาราง car_members สำหรับจัดการสมาชิกในแต่ละรถ
CREATE TABLE IF NOT EXISTS car_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID REFERENCES auth.users(id),
    UNIQUE(car_id, user_id)
);

-- 3. สร้างตาราง car_expenses สำหรับรายจ่ายของแต่ละรถ
CREATE TABLE IF NOT EXISTS car_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    receipt_image TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index สำหรับการค้นหา
CREATE INDEX idx_car_expenses_car_id ON car_expenses(car_id);
CREATE INDEX idx_car_expenses_user_id ON car_expenses(user_id);
CREATE INDEX idx_car_expenses_created_by ON car_expenses(created_by);

-- 4. เพิ่ม RLS (Row Level Security) policies

-- Policy สำหรับ joint_cars
ALTER TABLE joint_cars ENABLE ROW LEVEL SECURITY;

-- เฉพาะสมาชิกของรถคันนั้นเท่านั้นที่ดูได้
CREATE POLICY "Members can view car details" ON joint_cars
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM car_members WHERE car_id = joint_cars.id
        )
    );

-- เฉพาะเจ้าของรถที่แก้ไขได้
CREATE POLICY "Owners can update cars" ON joint_cars
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM car_members 
            WHERE car_id = joint_cars.id AND role = 'owner'
        )
    );

-- Policy สำหรับ car_members
ALTER TABLE car_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view car members" ON car_members
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM car_members cm2 WHERE cm2.car_id = car_members.car_id
        )
    );

CREATE POLICY "Owners can manage members" ON car_members
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM car_members 
            WHERE car_id = car_members.car_id AND role = 'owner'
        )
    );

-- Policy สำหรับ car_expenses
ALTER TABLE car_expenses ENABLE ROW LEVEL SECURITY;

-- สมาชิกสามารถดูรายจ่ายทั้งหมดของรถคันนั้น
CREATE POLICY "Members can view car expenses" ON car_expenses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM car_members WHERE car_id = car_expenses.car_id
        )
    );

-- สมาชิกสามารถเพิ่มรายจ่าย
CREATE POLICY "Members can add expenses" ON car_expenses
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM car_members WHERE car_id = car_expenses.car_id
        ) AND auth.uid() = user_id AND auth.uid() = created_by
    );

-- สมาชิกสามารถแก้ไขเฉพาะรายจ่ายของตัวเอง
CREATE POLICY "Users can update own expenses" ON car_expenses
    FOR UPDATE USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- สมาชิกสามารถลบเฉพาะรายจ่ายของตัวเอง
CREATE POLICY "Users can delete own expenses" ON car_expenses
    FOR DELETE USING (auth.uid() = created_by);

-- 5. Function สำหรับสร้าง car_code อัตโนมัติ
CREATE OR REPLACE FUNCTION generate_car_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- สร้างรหัส 6 หลัก (ตัวอักษรและตัวเลข)
        new_code := UPPER(
            SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)
        );
        
        -- ตรวจสอบว่ารหัสนี้มีอยู่แล้วหรือไม่
        SELECT EXISTS(
            SELECT 1 FROM joint_cars WHERE car_code = new_code
        ) INTO code_exists;
        
        -- ถ้าไม่มี ให้ออกจาก loop
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger สำหรับสร้าง car_code อัตโนมัติเมื่อเพิ่มรถใหม่
CREATE OR REPLACE FUNCTION set_car_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.car_code IS NULL THEN
        NEW.car_code := generate_car_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_car_code_trigger
    BEFORE INSERT ON joint_cars
    FOR EACH ROW EXECUTE FUNCTION set_car_code();

-- 7. Function สำหรับเข้าร่วมรถด้วยรหัส
CREATE OR REPLACE FUNCTION join_car_with_code(
    p_car_code TEXT,
    p_user_email TEXT DEFAULT NULL,
    p_user_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    car_record joint_cars%ROWTYPE;
    user_record auth.users%ROWTYPE;
    result JSON;
BEGIN
    -- หารถจาก car_code
    SELECT * INTO car_record 
    FROM joint_cars 
    WHERE car_code = UPPER(p_car_code);
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'ไม่พบรถที่มีรหัสนี้'
        );
    END IF;
    
    -- ตรวจสอบผู้ใช้ปัจจุบัน
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE id = auth.uid();
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'กรุณาเข้าสู่ระบบก่อน'
        );
    END IF;
    
    -- ตรวจสอบว่าเป็นสมาชิกอยู่แล้วหรือไม่
    IF EXISTS(
        SELECT 1 FROM car_members 
        WHERE car_id = car_record.id AND user_id = auth.uid()
    ) THEN
        RETURN json_build_object(
            'success', true,
            'message', 'คุณเป็นสมาชิกของรถคันนี้อยู่แล้ว',
            'car_id', car_record.id
        );
    END IF;
    
    -- เพิ่มเป็นสมาชิก
    INSERT INTO car_members (
        car_id, 
        user_id, 
        user_email, 
        user_name, 
        role
    ) VALUES (
        car_record.id,
        auth.uid(),
        COALESCE(p_user_email, user_record.email),
        COALESCE(p_user_name, user_record.raw_user_meta_data->>'full_name', user_record.email),
        'member'
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'เข้าร่วมรถเรียบร้อยแล้ว',
        'car_id', car_record.id,
        'car_info', json_build_object(
            'brand', car_record.brand,
            'model', car_record.model,
            'year', car_record.year
        )
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'message', 'เกิดข้อผิดพลาด: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
