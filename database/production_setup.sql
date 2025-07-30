-- =========================================
-- Complete Database Setup for Production
-- =========================================

-- 1. Enable Row Level Security for existing tables
ALTER TABLE income_expense ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_cars ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies for income_expense
CREATE POLICY "Users can view own expenses" ON income_expense
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON income_expense
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON income_expense
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON income_expense
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Create RLS Policies for joint_cars
CREATE POLICY "Users can view own cars" ON joint_cars
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cars" ON joint_cars
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cars" ON joint_cars
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cars" ON joint_cars
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Create related tables with RLS
CREATE TABLE IF NOT EXISTS car_investors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    share_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE car_investors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view related investors" ON car_investors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM joint_cars 
            WHERE joint_cars.id = car_investors.car_id 
            AND joint_cars.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage related investors" ON car_investors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM joint_cars 
            WHERE joint_cars.id = car_investors.car_id 
            AND joint_cars.user_id = auth.uid()
        )
    );

-- 5. Create additional_expenses table
CREATE TABLE IF NOT EXISTS additional_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE additional_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view related expenses" ON additional_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage related expenses" ON additional_expenses
    FOR ALL USING (auth.uid() = user_id);

-- 6. Create post_sale_expenses table
CREATE TABLE IF NOT EXISTS post_sale_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES joint_cars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE post_sale_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view related post expenses" ON post_sale_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage related post expenses" ON post_sale_expenses
    FOR ALL USING (auth.uid() = user_id);

-- 7. Add profit analysis fields to joint_cars
ALTER TABLE joint_cars 
ADD COLUMN IF NOT EXISTS is_profit BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS final_profit DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS post_sale_expenses_total DECIMAL(15,2) DEFAULT 0.00;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_joint_cars_user_id ON joint_cars(user_id);
CREATE INDEX IF NOT EXISTS idx_joint_cars_profit ON joint_cars(is_profit);
CREATE INDEX IF NOT EXISTS idx_joint_cars_status ON joint_cars(status);
CREATE INDEX IF NOT EXISTS idx_joint_cars_date ON joint_cars(date);
CREATE INDEX IF NOT EXISTS idx_income_expense_user_id ON income_expense(user_id);
CREATE INDEX IF NOT EXISTS idx_income_expense_date ON income_expense(date);

-- 9. Profit calculation function
CREATE OR REPLACE FUNCTION calculate_final_profit(car_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    base_profit DECIMAL(15,2);
    post_expenses DECIMAL(15,2);
    final_profit DECIMAL(15,2);
BEGIN
    -- Get base profit
    SELECT profit INTO base_profit 
    FROM joint_cars 
    WHERE id = car_id;
    
    -- Calculate post sale expenses
    SELECT COALESCE(SUM(amount), 0) INTO post_expenses
    FROM post_sale_expenses 
    WHERE car_id = calculate_final_profit.car_id;
    
    -- Calculate final profit
    final_profit := base_profit - post_expenses;
    
    -- Update table
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

-- 10. Trigger to auto-calculate profit when expenses change
CREATE OR REPLACE FUNCTION trigger_calculate_profit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_final_profit(OLD.car_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_final_profit(NEW.car_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profit_on_post_expense
    AFTER INSERT OR UPDATE OR DELETE ON post_sale_expenses
    FOR EACH ROW EXECUTE FUNCTION trigger_calculate_profit();

-- Success message
SELECT 'Database setup completed successfully! 🎉' as status;
