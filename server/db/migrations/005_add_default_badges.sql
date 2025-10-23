-- Add Default Badges
-- This migration adds the default badge data to the badges table

INSERT INTO badges (key, name, description, icon_url, category, requirement_value) VALUES
('first_activity', 'First Steps', 'Complete your first activity', '👶', 'general', 1),
('streak_7', 'Streak Master', 'Complete activities for 7 days in a row', '🔥', 'streak', 7),
('xp_1000', 'XP Collector', 'Earn 1000 XP', '💎', 'level', 1000),
('activities_100', 'Activity Addict', 'Complete 100 activities', '🎯', 'activity', 100),
('level_10', 'Level Up', 'Reach level 10', '⭐', 'level', 10),
('streak_30', 'Consistency King', 'Complete activities for 30 days in a row', '👑', 'streak', 30),
('xp_5000', 'XP Master', 'Earn 5000 XP', '💎', 'level', 5000),
('activities_500', 'Productivity Pro', 'Complete 500 activities', '🚀', 'activity', 500),
('level_25', 'Elite Achiever', 'Reach level 25', '🏆', 'level', 25),
('perfect_week', 'Perfect Week', 'Complete all activities for 7 consecutive days', '✨', 'streak', 7)
ON CONFLICT (key) DO NOTHING;
