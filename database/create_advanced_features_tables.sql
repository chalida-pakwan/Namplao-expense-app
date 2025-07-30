-- เพิ่มตารางสำหรับการแจ้งเตือน
CREATE TABLE IF NOT EXISTS joint_car_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
  investor_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('profit_share', 'expense_share', 'reminder')),
  message TEXT NOT NULL,
  amount_owed DECIMAL(15,2) DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เพิ่มตารางสำหรับค่าใช้จ่ายภายหลังการขาย
CREATE TABLE IF NOT EXISTS post_sale_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_by TEXT NOT NULL,
  split_method TEXT NOT NULL CHECK (split_method IN ('equal', 'percentage', 'custom')),
  expense_splits JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เพิ่มตารางสำหรับการจัดการสิทธิ์ผู้ใช้
CREATE TABLE IF NOT EXISTS joint_car_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'investor', 'viewer')),
  permissions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

-- เพิ่ม indexes สำหรับประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_notifications_car_id ON joint_car_notifications(car_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON joint_car_notifications(read);
CREATE INDEX IF NOT EXISTS idx_post_sale_expenses_car_id ON post_sale_expenses(car_id);
CREATE INDEX IF NOT EXISTS idx_permissions_user_car ON joint_car_permissions(user_id, car_id);

-- เพิ่ม RLS policies สำหรับตารางใหม่
ALTER TABLE joint_car_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_sale_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_car_permissions ENABLE ROW LEVEL SECURITY;

-- Policies สำหรับ notifications
CREATE POLICY "Users can view their notifications" ON joint_car_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM joint_cars 
      WHERE joint_cars.id = joint_car_notifications.car_id 
      AND (
        joint_cars.user_id = auth.uid() 
        OR joint_cars.investors @> json_build_array(json_build_object('name', joint_car_notifications.investor_name))::jsonb
      )
    )
  );

CREATE POLICY "Users can update their notifications" ON joint_car_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM joint_cars 
      WHERE joint_cars.id = joint_car_notifications.car_id 
      AND (
        joint_cars.user_id = auth.uid() 
        OR joint_cars.investors @> json_build_array(json_build_object('name', joint_car_notifications.investor_name))::jsonb
      )
    )
  );

CREATE POLICY "Car owners can manage notifications" ON joint_car_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM joint_cars 
      WHERE joint_cars.id = joint_car_notifications.car_id 
      AND joint_cars.user_id = auth.uid()
    )
  );

-- Policies สำหรับ post_sale_expenses
CREATE POLICY "Users can view expenses for their cars" ON post_sale_expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM joint_cars 
      WHERE joint_cars.id = post_sale_expenses.car_id 
      AND (
        joint_cars.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM joint_car_permissions
          WHERE joint_car_permissions.car_id = joint_cars.id
          AND joint_car_permissions.user_id = auth.uid()
          AND (joint_car_permissions.permissions->>'can_view_finances')::boolean = true
        )
      )
    )
  );

CREATE POLICY "Authorized users can manage expenses" ON post_sale_expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM joint_cars 
      WHERE joint_cars.id = post_sale_expenses.car_id 
      AND (
        joint_cars.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM joint_car_permissions
          WHERE joint_car_permissions.car_id = joint_cars.id
          AND joint_car_permissions.user_id = auth.uid()
          AND (joint_car_permissions.permissions->>'can_add_expenses')::boolean = true
        )
      )
    )
  );

-- Policies สำหรับ permissions
CREATE POLICY "Car owners can manage permissions" ON joint_car_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM joint_cars 
      WHERE joint_cars.id = joint_car_permissions.car_id 
      AND joint_cars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own permissions" ON joint_car_permissions
  FOR SELECT USING (user_id = auth.uid());

-- เพิ่มฟังก์ชันสำหรับอัปเดต updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- เพิ่ม triggers สำหรับการอัปเดต updated_at
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON joint_car_notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_sale_expenses_updated_at 
  BEFORE UPDATE ON post_sale_expenses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at 
  BEFORE UPDATE ON joint_car_permissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
