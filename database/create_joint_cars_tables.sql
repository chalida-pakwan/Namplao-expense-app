-- สร้างตาราง joint_cars สำหรับระบบการลงทุนรถร่วมกัน
CREATE TABLE IF NOT EXISTS joint_cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ข้อมูลรถ
  date DATE NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  
  -- ข้อมูลการเงิน
  buy_price DECIMAL(12,2) DEFAULT 0,
  sell_price DECIMAL(12,2) DEFAULT 0,
  total_cost DECIMAL(12,2) DEFAULT 0,
  profit DECIMAL(12,2) DEFAULT 0,
  total_investment DECIMAL(12,2) DEFAULT 0,
  
  -- สถานะ
  status VARCHAR(20) DEFAULT 'กำลังหา' CHECK (status IN ('กำลังหา', 'ซื้อแล้ว', 'ขายแล้ว', 'ยกเลิก')),
  
  -- ข้อมูลเพิ่มเติม
  notes TEXT,
  investors JSONB DEFAULT '[]'::jsonb,
  expenses JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  
  -- การติดตาม
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index
CREATE INDEX IF NOT EXISTS idx_joint_cars_user_id ON joint_cars(user_id);
CREATE INDEX IF NOT EXISTS idx_joint_cars_status ON joint_cars(status);
CREATE INDEX IF NOT EXISTS idx_joint_cars_date ON joint_cars(date);

-- สร้าง trigger สำหรับ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_joint_cars_updated_at ON joint_cars;
CREATE TRIGGER update_joint_cars_updated_at
    BEFORE UPDATE ON joint_cars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- สร้างตาราง joint_car_profit_sharing สำหรับการแบ่งกำไร
CREATE TABLE IF NOT EXISTS joint_car_profit_sharing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  joint_car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
  investor_name VARCHAR(100) NOT NULL,
  investment_amount DECIMAL(12,2) NOT NULL,
  profit_share DECIMAL(12,2) DEFAULT 0,
  profit_percentage DECIMAL(5,2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index สำหรับ profit sharing
CREATE INDEX IF NOT EXISTS idx_profit_sharing_joint_car_id ON joint_car_profit_sharing(joint_car_id);
CREATE INDEX IF NOT EXISTS idx_profit_sharing_investor ON joint_car_profit_sharing(investor_name);

-- สร้างตาราง joint_car_additional_expenses สำหรับค่าใช้จ่ายภายหลัง
CREATE TABLE IF NOT EXISTS joint_car_additional_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  joint_car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
  description VARCHAR(200) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  added_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index สำหรับ additional expenses
CREATE INDEX IF NOT EXISTS idx_additional_expenses_joint_car_id ON joint_car_additional_expenses(joint_car_id);
CREATE INDEX IF NOT EXISTS idx_additional_expenses_date ON joint_car_additional_expenses(expense_date);

-- สร้าง view สำหรับสถิติ
CREATE OR REPLACE VIEW joint_cars_statistics AS
SELECT 
  user_id,
  COUNT(*) as total_cars,
  COUNT(CASE WHEN status = 'ขายแล้ว' THEN 1 END) as sold_cars,
  COUNT(CASE WHEN status IN ('กำลังหา', 'ซื้อแล้ว') THEN 1 END) as active_cars,
  SUM(total_investment) as total_investment,
  SUM(CASE WHEN status = 'ขายแล้ว' THEN profit ELSE 0 END) as realized_profit,
  SUM(profit) as total_profit,
  AVG(CASE WHEN status = 'ขายแล้ว' THEN profit ELSE NULL END) as avg_profit_per_car
FROM joint_cars 
GROUP BY user_id;

-- สร้าง RLS (Row Level Security)
ALTER TABLE joint_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_car_profit_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_car_additional_expenses ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับ joint_cars
CREATE POLICY "Users can view their own joint cars" ON joint_cars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own joint cars" ON joint_cars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own joint cars" ON joint_cars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own joint cars" ON joint_cars
  FOR DELETE USING (auth.uid() = user_id);

-- Policy สำหรับ profit sharing
CREATE POLICY "Users can view profit sharing of their cars" ON joint_car_profit_sharing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM joint_cars 
      WHERE joint_cars.id = joint_car_profit_sharing.joint_car_id 
      AND joint_cars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage profit sharing of their cars" ON joint_car_profit_sharing
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM joint_cars 
      WHERE joint_cars.id = joint_car_profit_sharing.joint_car_id 
      AND joint_cars.user_id = auth.uid()
    )
  );

-- Policy สำหรับ additional expenses
CREATE POLICY "Users can view additional expenses of their cars" ON joint_car_additional_expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM joint_cars 
      WHERE joint_cars.id = joint_car_additional_expenses.joint_car_id 
      AND joint_cars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage additional expenses of their cars" ON joint_car_additional_expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM joint_cars 
      WHERE joint_cars.id = joint_car_additional_expenses.joint_car_id 
      AND joint_cars.user_id = auth.uid()
    )
  );

-- ตัวอย่างข้อมูล
INSERT INTO joint_cars (
  user_id, 
  date, 
  brand, 
  model, 
  year, 
  buy_price, 
  sell_price, 
  total_cost, 
  profit, 
  total_investment, 
  status, 
  notes,
  investors,
  expenses
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- จะต้องเปลี่ยนเป็น user_id จริง
  '2024-01-15',
  'Toyota',
  'Vios',
  2018,
  450000,
  520000,
  470000,
  50000,
  450000,
  'ขายแล้ว',
  'รถสภาพดี ขายได้เร็ว',
  '[
    {"name": "สมชาย", "amount": "200000"},
    {"name": "สมศักดิ์", "amount": "150000"},
    {"name": "สมใส", "amount": "100000"}
  ]'::jsonb,
  '[
    {"description": "ค่าซ่อม", "cost": "15000"},
    {"description": "ค่าส่ง", "cost": "3000"},
    {"description": "ค่านายหน้า", "cost": "2000"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;
