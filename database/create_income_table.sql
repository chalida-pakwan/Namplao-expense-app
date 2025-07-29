-- สร้างตาราง income สำหรับแอพรายรับ-รายจ่าย นายหน้า
CREATE TABLE public.income (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index สำหรับ performance
CREATE INDEX idx_income_user_id ON public.income(user_id);
CREATE INDEX idx_income_date ON public.income(date);
CREATE INDEX idx_income_category ON public.income(category);

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

-- สร้าง policy เพื่อให้ user เห็นเฉพาะข้อมูลของตัวเอง
CREATE POLICY "Users can view their own income records" 
ON public.income 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records" 
ON public.income 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records" 
ON public.income 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records" 
ON public.income 
FOR DELETE 
USING (auth.uid() = user_id);

-- เพิ่มคอมเมนต์อธิบายตาราง
COMMENT ON TABLE public.income IS 'ตารางเก็บข้อมูลรายได้ของนายหน้า';
COMMENT ON COLUMN public.income.id IS 'รหัสรายการรายได้ (UUID)';
COMMENT ON COLUMN public.income.user_id IS 'รหัสผู้ใช้งาน (เชื่อมกับ auth.users)';
COMMENT ON COLUMN public.income.date IS 'วันที่รับรายได้';
COMMENT ON COLUMN public.income.amount IS 'จำนวนเงินรายได้';
COMMENT ON COLUMN public.income.category IS 'หมวดหมู่รายได้ เช่น ขายรถ, ค่าคอม';
COMMENT ON COLUMN public.income.description IS 'รายละเอียดเพิ่มเติมของรายได้';
COMMENT ON COLUMN public.income.created_at IS 'วันเวลาที่สร้างรายการ';