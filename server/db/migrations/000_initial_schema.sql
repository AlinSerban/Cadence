-- Initial Database Schema
-- This migration creates the basic tables needed for the application

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  token_id VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Create activity cards table
CREATE TABLE IF NOT EXISTS activity_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  label VARCHAR(50) DEFAULT 'other',
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'done')),
  date DATE NOT NULL,
  column_id INTEGER,
  xp_value INTEGER DEFAULT 25,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create activity columns table
CREATE TABLE IF NOT EXISTS activity_columns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  date DATE NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create badges table (needed before user_badges)
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

-- Create user badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);


-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_id ON refresh_tokens(token_id);
CREATE INDEX IF NOT EXISTS idx_activity_cards_user_id ON activity_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_cards_date ON activity_cards(date);
CREATE INDEX IF NOT EXISTS idx_activity_cards_status ON activity_cards(status);
CREATE INDEX IF NOT EXISTS idx_activity_columns_user_id ON activity_columns(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_columns_date ON activity_columns(date);
CREATE INDEX IF NOT EXISTS idx_badges_key ON badges(key);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_cards_updated_at 
    BEFORE UPDATE ON activity_cards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_columns_updated_at 
    BEFORE UPDATE ON activity_columns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();