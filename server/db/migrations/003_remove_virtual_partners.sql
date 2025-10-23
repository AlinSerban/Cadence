-- Remove Virtual Partners Feature
-- This migration removes the virtual partners table and related data

-- Drop the virtual_partners table if it exists
DROP TABLE IF EXISTS virtual_partners CASCADE;

-- Drop the partner_interactions table if it exists
DROP TABLE IF EXISTS partner_interactions CASCADE;

-- Remove any indexes related to virtual partners
DROP INDEX IF EXISTS idx_virtual_partners_user_id;
DROP INDEX IF EXISTS idx_partner_interactions_user_id;
