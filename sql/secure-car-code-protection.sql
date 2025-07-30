-- อัปเดต RLS Policy สำหรับตาราง joint_cars เพื่อปกป้อง car_code
-- เฉพาะเจ้าของรถเท่านั้นที่เห็น car_code ได้

-- ลบ policy เดิม (ถ้ามี)
DROP POLICY IF EXISTS "Users can view joint_cars if they are members" ON joint_cars;

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
