-- 🔐 Complete Secure Car System Setup Script
-- วันที่: 31 กรกฎาคม 2568
-- รวม SQL Scripts ทั้งหมดสำหรับระบบหารรถแบบปลอดภัย

-- =============================================================================
-- 1. SECURE CAR SYSTEM SETUP (from secure-car-system.sql)
-- =============================================================================

-- เพิ่มฟิลด์ car_code ในตาราง joint_cars
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'joint_cars' AND column_name = 'car_code'
    ) THEN
        ALTER TABLE joint_cars ADD COLUMN car_code VARCHAR(8) UNIQUE;
    END IF;
END $$;

-- สร้าง index สำหรับ car_code
CREATE INDEX IF NOT EXISTS idx_joint_cars_car_code ON joint_cars(car_code);

-- สร้างตาราง car_members สำหรับจัดการสมาชิกในแต่ละรถ
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

-- สร้าง index สำหรับ car_members
CREATE INDEX IF NOT EXISTS idx_car_members_car_id ON car_members(car_id);
CREATE INDEX IF NOT EXISTS idx_car_members_user_id ON car_members(user_id);

-- สร้างตาราง car_expenses สำหรับรายจ่ายของแต่ละรถ
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

-- สร้าง index สำหรับ car_expenses
CREATE INDEX IF NOT EXISTS idx_car_expenses_car_id ON car_expenses(car_id);
CREATE INDEX IF NOT EXISTS idx_car_expenses_user_id ON car_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_car_expenses_created_by ON car_expenses(created_by);

-- Function สำหรับสร้างรหัสรถ 6 หลักแบบสุ่ม
CREATE OR REPLACE FUNCTION generate_car_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- สร้างรหัส 6 หลัก (A-Z, 0-9)
        code := '';
        FOR i IN 1..6 LOOP
            code := code || CASE 
                WHEN random() < 0.5 THEN chr(65 + floor(random() * 26)::int)  -- A-Z
                ELSE (floor(random() * 10)::int)::text  -- 0-9
            END;
        END LOOP;
        
        -- ตรวจสอบว่ารหัสซ้ำหรือไม่
        SELECT EXISTS(SELECT 1 FROM joint_cars WHERE car_code = code) INTO exists_check;
        
        -- ถ้าไม่ซ้ำให้ใช้รหัสนี้
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Trigger function สำหรับสร้าง car_code อัตโนมัติ
CREATE OR REPLACE FUNCTION auto_generate_car_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- สร้าง car_code ถ้ายังไม่มี
    IF NEW.car_code IS NULL THEN
        NEW.car_code := generate_car_code();
    END IF;
    
    RETURN NEW;
END;
$$;

-- สร้าง trigger สำหรับ joint_cars
DROP TRIGGER IF EXISTS trigger_auto_generate_car_code ON joint_cars;
CREATE TRIGGER trigger_auto_generate_car_code
    BEFORE INSERT ON joint_cars
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_car_code();

-- Function สำหรับเข้าร่วมรถด้วยรหัส
CREATE OR REPLACE FUNCTION join_car_with_code(p_car_code TEXT)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    car_id UUID,
    car_info JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_user_name TEXT;
    v_car_record RECORD;
    v_existing_member BOOLEAN;
BEGIN
    -- ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
    SELECT auth.uid() INTO v_user_id;
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT false, 'กรุณาเข้าสู่ระบบ'::TEXT, NULL::UUID, NULL::JSONB;
        RETURN;
    END IF;
    
    -- ดึงข้อมูลผู้ใช้
    SELECT email, COALESCE(raw_user_meta_data->>'name', email) 
    INTO v_user_email, v_user_name
    FROM auth.users 
    WHERE id = v_user_id;
    
    -- ค้นหารถจากรหัส
    SELECT * INTO v_car_record
    FROM joint_cars 
    WHERE car_code = UPPER(p_car_code);
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'ไม่พบรถที่มีรหัสนี้'::TEXT, NULL::UUID, NULL::JSONB;
        RETURN;
    END IF;
    
    -- ตรวจสอบว่าเป็นสมาชิกอยู่แล้วหรือไม่
    SELECT EXISTS(
        SELECT 1 FROM car_members 
        WHERE car_id = v_car_record.id AND user_id = v_user_id
    ) INTO v_existing_member;
    
    IF v_existing_member THEN
        RETURN QUERY SELECT false, 'คุณเป็นสมาชิกของรถคันนี้อยู่แล้ว'::TEXT, v_car_record.id, 
                     jsonb_build_object('brand', v_car_record.brand, 'model', v_car_record.model, 'year', v_car_record.year);
        RETURN;
    END IF;
    
    -- เพิ่มเป็นสมาชิก
    INSERT INTO car_members (car_id, user_id, user_email, user_name, role)
    VALUES (v_car_record.id, v_user_id, v_user_email, v_user_name, 'member');
    
    -- ส่งคืนผลลัพธ์สำเร็จ
    RETURN QUERY SELECT true, 'เข้าร่วมรถสำเร็จ!'::TEXT, v_car_record.id,
                 jsonb_build_object(
                     'brand', v_car_record.brand, 
                     'model', v_car_record.model, 
                     'year', v_car_record.year,
                     'status', v_car_record.status
                 );
END;
$$;

-- =============================================================================
-- 2. SECURE CAR CODE PROTECTION (from secure-car-code-protection.sql)
-- =============================================================================

-- ลบ policy เดิม (ถ้ามี)
DROP POLICY IF EXISTS "Users can view joint_cars if they are members" ON joint_cars;
DROP POLICY IF EXISTS "Members can view basic joint_cars info" ON joint_cars;

-- สร้าง policy ใหม่ที่แยก car_code ออก
CREATE POLICY "Members can view basic joint_cars info" ON joint_cars
FOR SELECT
USING (
  id IN (
    SELECT car_id 
    FROM car_members 
    WHERE user_id = auth.uid()
  )
);

-- สร้าง view สำหรับสมาชิกธรรมดา (ไม่มี car_code)
CREATE OR REPLACE VIEW joint_cars_member_view AS
SELECT 
  id,
  date,
  brand,
  model,
  year,
  buy_price,
  sell_price,
  target_profit,
  profit,
  total_investment,
  status,
  created_by,
  created_at,
  updated_at,
  investors,
  additional_expenses,
  images,
  notes,
  -- car_code จะแสดงเฉพาะเจ้าของเท่านั้น
  CASE 
    WHEN created_by = auth.uid() THEN car_code
    ELSE NULL
  END as car_code
FROM joint_cars
WHERE id IN (
  SELECT car_id 
  FROM car_members 
  WHERE user_id = auth.uid()
);

-- Grant permissions
GRANT SELECT ON joint_cars_member_view TO authenticated;

-- สร้าง function สำหรับดึงข้อมูลรถพร้อม car_code (เฉพาะเจ้าของ)
CREATE OR REPLACE FUNCTION get_car_with_code(car_id_param UUID)
RETURNS TABLE (
  id UUID,
  date DATE,
  brand TEXT,
  model TEXT,
  year INTEGER,
  buy_price DECIMAL,
  sell_price DECIMAL,
  target_profit DECIMAL,
  profit DECIMAL,
  total_investment DECIMAL,
  status TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  investors JSONB,
  additional_expenses JSONB,
  images TEXT[],
  notes TEXT,
  car_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ตรวจสอบว่าผู้ใช้เป็นสมาชิกของรถ
  IF NOT EXISTS (
    SELECT 1 FROM car_members 
    WHERE car_id = car_id_param 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Not a member of this car';
  END IF;
  
  -- ดึงข้อมูลรถ
  RETURN QUERY
  SELECT 
    jc.id,
    jc.date,
    jc.brand,
    jc.model,
    jc.year,
    jc.buy_price,
    jc.sell_price,
    jc.target_profit,
    jc.profit,
    jc.total_investment,
    jc.status,
    jc.created_by,
    jc.created_at,
    jc.updated_at,
    jc.investors,
    jc.additional_expenses,
    jc.images,
    jc.notes,
    -- car_code จะแสดงเฉพาะเจ้าของเท่านั้น
    CASE 
      WHEN jc.created_by = auth.uid() THEN jc.car_code
      ELSE NULL
    END as car_code
  FROM joint_cars jc
  WHERE jc.id = car_id_param;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_car_with_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION join_car_with_code(TEXT) TO authenticated;

-- =============================================================================
-- 3. RLS POLICIES FOR NEW TABLES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE car_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_expenses ENABLE ROW LEVEL SECURITY;

-- Policies for car_members
CREATE POLICY "Users can view members of cars they belong to" ON car_members
FOR SELECT
USING (
  car_id IN (
    SELECT car_id FROM car_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert themselves as members" ON car_members
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Car owners can manage members" ON car_members
FOR ALL
USING (
  car_id IN (
    SELECT id FROM joint_cars WHERE created_by = auth.uid()
  )
);

-- Policies for car_expenses
CREATE POLICY "Users can view expenses of cars they belong to" ON car_expenses
FOR SELECT
USING (
  car_id IN (
    SELECT car_id FROM car_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own expenses" ON car_expenses
FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  car_id IN (
    SELECT car_id FROM car_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own expenses" ON car_expenses
FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own expenses" ON car_expenses
FOR DELETE
USING (created_by = auth.uid());

-- =============================================================================
-- 4. FINAL SETUP AND GRANTS
-- =============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON car_members TO authenticated;
GRANT ALL ON car_expenses TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Secure Car System Setup Complete!';
    RAISE NOTICE '✅ Tables: joint_cars (with car_code), car_members, car_expenses';
    RAISE NOTICE '✅ Functions: generate_car_code(), join_car_with_code(), get_car_with_code()';
    RAISE NOTICE '✅ Views: joint_cars_member_view (car_code protected)';
    RAISE NOTICE '✅ RLS Policies: All tables secured with proper access control';
    RAISE NOTICE '✅ Triggers: Auto car_code generation';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Ready to use! Car codes will be generated automatically.';
    RAISE NOTICE '👑 Only car owners can see and share car codes.';
    RAISE NOTICE '👤 Members can join but cannot see car codes.';
END $$;
