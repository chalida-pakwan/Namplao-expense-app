-- Create audit_logs table for tracking all changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view files" ON storage.objects
    FOR SELECT USING (bucket_id = 'files');

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to automatically create audit logs
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id, user_email)
        VALUES (TG_TABLE_NAME, OLD.id::text, TG_OP, to_jsonb(OLD), auth.uid(), auth.email());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id, user_email)
        VALUES (TG_TABLE_NAME, NEW.id::text, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid(), auth.email());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id, user_email)
        VALUES (TG_TABLE_NAME, NEW.id::text, TG_OP, to_jsonb(NEW), auth.uid(), auth.email());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for existing tables (example for income table)
DROP TRIGGER IF EXISTS audit_trigger_income ON income;
CREATE TRIGGER audit_trigger_income
    AFTER INSERT OR UPDATE OR DELETE ON income
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Create triggers for expense table
DROP TRIGGER IF EXISTS audit_trigger_expense ON expense;
CREATE TRIGGER audit_trigger_expense
    AFTER INSERT OR UPDATE OR DELETE ON expense
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Add role column to user metadata (this would be handled in your application)
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "viewer"}' 
-- WHERE raw_user_meta_data->>'role' IS NULL;
