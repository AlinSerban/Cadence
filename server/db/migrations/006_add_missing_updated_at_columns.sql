-- Add missing updated_at columns to activity tables
-- This migration fixes the schema mismatch between initial schema and code expectations

-- Add updated_at to activity_columns table
ALTER TABLE activity_columns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add updated_at to activity_cards table  
ALTER TABLE activity_cards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for activity tables
CREATE TRIGGER update_activity_cards_updated_at 
    BEFORE UPDATE ON activity_cards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_columns_updated_at 
    BEFORE UPDATE ON activity_columns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
