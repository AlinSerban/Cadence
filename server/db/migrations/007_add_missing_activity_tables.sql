-- Add missing activity tables that the code expects
-- This migration creates the activity system tables that exist locally but are missing in production

-- Create custom_activities table
CREATE TABLE IF NOT EXISTS custom_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(10) DEFAULT '🎯',
  category VARCHAR(50),
  target_duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create activity_goals table
CREATE TABLE IF NOT EXISTS activity_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES custom_activities(id) ON DELETE CASCADE,
  goal_type VARCHAR(10) CHECK (goal_type IN ('daily', 'weekly', 'monthly')),
  target_frequency INTEGER NOT NULL,
  target_duration INTEGER,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES custom_activities(id) ON DELETE CASCADE,
  goal_id INTEGER REFERENCES activity_goals(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL,
  notes TEXT,
  entry_date DATE NOT NULL,
  entry_timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_activities_user_id ON custom_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_activities_active ON custom_activities(is_active);
CREATE INDEX IF NOT EXISTS idx_activity_goals_user_id ON activity_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_goals_activity_id ON activity_goals(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_goals_completed ON activity_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_id ON activity_logs(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entry_date ON activity_logs(entry_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entry_timestamp ON activity_logs(entry_timestamp);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activity_goals_updated_at 
    BEFORE UPDATE ON activity_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
