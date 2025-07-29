-- สร้างตาราง expense สำหรับแอพรายรับ-รายจ่าย นายหน้า
CREATE TABLE public.expense (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index สำหรับ performance
CREATE INDEX idx_expense_user_id ON public.expense(user_id);
CREATE INDEX idx_expense_date ON public.expense(date);
CREATE INDEX idx_expense_category ON public.expense(category);

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.expense ENABLE ROW LEVEL SECURITY;

-- สร้าง policy เพื่อให้ user เห็นเฉพาะข้อมูลของตัวเอง
CREATE POLICY "Users can view their own expense records" 
ON public.expense 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expense records" 
ON public.expense 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense records" 
ON public.expense 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expense records" 
ON public.expense 
FOR DELETE 
USING (auth.uid() = user_id);

-- เพิ่มคอมเมนต์อธิบายตาราง
COMMENT ON TABLE public.expense IS 'ตารางเก็บข้อมูลรายจ่ายของนายหน้า';
COMMENT ON COLUMN public.expense.id IS 'รหัสรายการรายจ่าย (UUID)';
COMMENT ON COLUMN public.expense.user_id IS 'รหัสผู้ใช้งาน (เชื่อมกับ auth.users)';
COMMENT ON COLUMN public.expense.date IS 'วันที่ใช้จ่าย';
COMMENT ON COLUMN public.expense.amount IS 'จำนวนเงินรายจ่าย';
COMMENT ON COLUMN public.expense.category IS 'หมวดหมู่รายจ่าย เช่น ค่าล้างรถ, ค่าโฆษณา';
COMMENT ON COLUMN public.expense.description IS 'รายละเอียดเพิ่มเติมของรายจ่าย';
COMMENT ON COLUMN public.expense.created_at IS 'วันเวลาที่สร้างรายการ';
