-- Add Badges Table and Update User Badges
-- This migration creates the badges table and updates user_badges to match expected schema

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  category VARCHAR(50) DEFAULT 'general',
  requirement_value INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update user_badges table to match expected schema
-- Rename earned_at to unlocked_at (only if earned_at exists and unlocked_at doesn't)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_badges' AND column_name = 'earned_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_badges' AND column_name = 'unlocked_at') THEN
        ALTER TABLE user_badges RENAME COLUMN earned_at TO unlocked_at;
    END IF;
END $$;

-- Add missing columns to user_badges
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS unlocked BOOLEAN DEFAULT true;
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_badges_key ON badges(key);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_user_badges_unlocked ON user_badges(unlocked);

-- Insert default badges
INSERT INTO badges (key, name, description, icon_url, category, requirement_value) VALUES
('first_activity', 'First Steps', 'Complete your first activity', '👶', 'general', 1),
('streak_7', 'Streak Master', 'Complete activities for 7 days in a row', '🔥', 'streak', 7),
('xp_1000', 'XP Collector', 'Earn 1000 XP', '💎', 'level', 1000),
('activities_100', 'Activity Addict', 'Complete 100 activities', '🎯', 'activity', 100),
('level_10', 'Level Up', 'Reach level 10', '⭐', 'level', 10)
ON CONFLICT (key) DO NOTHING;
