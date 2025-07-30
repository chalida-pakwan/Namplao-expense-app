-- เพิ่มฟิลด์สำหรับการวิเคราะห์กำไร/ขาดทุน
ALTER TABLE joint_cars 
ADD COLUMN IF NOT EXISTS is_profit BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS final_profit DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS post_sale_expenses_total DECIMAL(15,2) DEFAULT 0.00;

-- เพิ่ม index สำหรับการค้นหา
CREATE INDEX IF NOT EXISTS idx_joint_cars_profit ON joint_cars(is_profit);
CREATE INDEX IF NOT EXISTS idx_joint_cars_profit_margin ON joint_cars(profit_margin);
CREATE INDEX IF NOT EXISTS idx_joint_cars_brand_model ON joint_cars(brand, model);
CREATE INDEX IF NOT EXISTS idx_joint_cars_status_date ON joint_cars(status, date);

-- ฟังก์ชันคำนวณกำไรสุทธิ (รวมค่าใช้จ่ายภายหลัง)
CREATE OR REPLACE FUNCTION calculate_final_profit(car_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    base_profit DECIMAL(15,2);
    post_expenses DECIMAL(15,2);
    final_profit DECIMAL(15,2);
BEGIN
    -- ดึงกำไรฐาน
    SELECT profit INTO base_profit 
    FROM joint_cars 
    WHERE id = car_id;
    
    -- คำนวณค่าใช้จ่ายภายหลัง
    SELECT COALESCE(SUM(amount), 0) INTO post_expenses
    FROM post_sale_expenses 
    WHERE car_id = calculate_final_profit.car_id;
    
    -- คำนวณกำไรสุทธิ
    final_profit := base_profit - post_expenses;
    
    -- อัปเดตข้อมูลในตาราง
    UPDATE joint_cars 
    SET 
        final_profit = calculate_final_profit.final_profit,
        post_sale_expenses_total = post_expenses,
        is_profit = (calculate_final_profit.final_profit > 0),
        profit_margin = CASE 
            WHEN total_investment > 0 THEN (calculate_final_profit.final_profit / total_investment) * 100 
            ELSE 0 
        END
    WHERE id = car_id;
    
    RETURN final_profit;
END;
$$ LANGUAGE plpgsql;

-- Trigger เพื่ออัปเดตกำไรอัตโนมัติเมื่อมีค่าใช้จ่ายเพิ่ม
CREATE OR REPLACE FUNCTION update_final_profit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_final_profit(NEW.car_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- สร้าง trigger สำหรับ post_sale_expenses
DROP TRIGGER IF EXISTS trigger_update_final_profit ON post_sale_expenses;
CREATE TRIGGER trigger_update_final_profit
    AFTER INSERT OR UPDATE OR DELETE ON post_sale_expenses
    FOR EACH ROW EXECUTE FUNCTION update_final_profit_trigger();

-- อัปเดตข้อมูลที่มีอยู่
DO $$
DECLARE
    car_record RECORD;
BEGIN
    FOR car_record IN SELECT id FROM joint_cars LOOP
        PERFORM calculate_final_profit(car_record.id);
    END LOOP;
END $$;
