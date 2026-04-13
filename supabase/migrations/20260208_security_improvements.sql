-- Migration: 20260208_security_improvements.sql
-- Description: Fix RLS vulnerabilities, harden security policies, and create missing tables

-- ==============================================================================
-- 1. Fix Notifications Table Security
-- ==============================================================================

-- Drop insecure policies that allow anyone to insert/update entries
DROP POLICY IF EXISTS "System can insert notifications." ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Ensure users can only view/update their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications." ON notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications." ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 2. Fix Subscriptions Table Security
-- ==============================================================================

-- Drop insecure policies
DROP POLICY IF EXISTS "System can insert subscriptions." ON subscriptions;
DROP POLICY IF EXISTS "System can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "System can update subscriptions." ON subscriptions;
DROP POLICY IF EXISTS "System can update subscriptions" ON subscriptions;

-- Users view own
DROP POLICY IF EXISTS "Users can view their own subscriptions." ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create their own subscriptions (Supporting frontend payment flow)
CREATE POLICY "Users can create their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own subscriptions (e.g. cancel)
CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 3. Fix V-Date Reminders Table Security
-- ==============================================================================

-- Drop insecure "Service role" policy that allowed public access
DROP POLICY IF EXISTS "Service role can manage reminders" ON vdate_reminders;

-- Re-implement View Policy
DROP POLICY IF EXISTS "Users can view their own reminders" ON vdate_reminders;
CREATE POLICY "Users can view their own reminders" ON vdate_reminders
  FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Implement Insert/Update/Delete Policies
CREATE POLICY "Users can create their own reminders" ON vdate_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can update their own reminders" ON vdate_reminders
  FOR UPDATE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can delete their own reminders" ON vdate_reminders
  FOR DELETE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- ==============================================================================
-- 4. Fix Matches Table Security
-- ==============================================================================

-- matches table uses user1_id (initiator) and user2_id (target)
-- Allow VIEW for both parties
DROP POLICY IF EXISTS "Users can view their own matches." ON matches;
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
CREATE POLICY "Users can view their own matches_v2" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Allow INSERT/UPDATE for the initator (user1_id) to support frontend matching service
DROP POLICY IF EXISTS "Users can insert matches" ON matches;
CREATE POLICY "Users can insert their own matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

DROP POLICY IF EXISTS "Users can update their own matches" ON matches;
CREATE POLICY "Users can update their own matches" ON matches
  FOR UPDATE USING (auth.uid() = user1_id);

-- ==============================================================================
-- 5. Create and Secure User Activity Table (Missing from previous migrations)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_type_date 
  ON user_activity(user_id, activity_type, created_at);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity;
CREATE POLICY "Users can view their own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can record their own activity" ON user_activity;
CREATE POLICY "Users can record their own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 6. Trigger Functions Permissions
-- ==============================================================================

-- Make these functions SECURITY DEFINER so they can update user_analytics 
-- even when triggered by another user (e.g. A views B -> B's analytics update)
ALTER FUNCTION increment_profile_views() SECURITY DEFINER;
ALTER FUNCTION update_interest_analytics() SECURITY DEFINER;

-- ==============================================================================
-- 7. Fix Payments Table Security
-- ==============================================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own payment history
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);
