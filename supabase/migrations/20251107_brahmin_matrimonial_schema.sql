-- Brahmin Matrimonial Platform - Complete Database Schema
-- Migration: 20251107_brahmin_matrimonial_schema.sql

-- ============================================
-- 1. Enhance Profiles Table
-- ============================================

-- Add missing fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gotra VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subcaste VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS horoscope_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_documents JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_gotra ON profiles(gotra);
CREATE INDEX IF NOT EXISTS idx_profiles_subcaste ON profiles(subcaste);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles((location->>'city'), (location->>'state'));

-- ============================================
-- 2. Create Matches Table
-- ============================================

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  compatibility_score DECIMAL(5,2) NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Indexes for matches
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id, compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id, compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- ============================================
-- 3. Create Interests Table
-- ============================================

CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Indexes for interests
CREATE INDEX IF NOT EXISTS idx_interests_sender ON interests(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interests_receiver ON interests(receiver_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interests_status ON interests(status);

-- ============================================
-- 4. Enhance Messages Table
-- ============================================

-- Add indexes for better message query performance
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read_status ON messages(receiver_id, read_at) WHERE read_at IS NULL;

-- ============================================
-- 5. Create Subscriptions Table
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP NOT NULL,
  auto_renewal BOOLEAN DEFAULT true,
  payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date) WHERE status = 'active';

-- ============================================
-- 6. Enhance Events Table
-- ============================================

-- Add missing fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_premium_only BOOLEAN DEFAULT false;

-- Add index for event queries
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

-- ============================================
-- 7. Create Event Registrations Table
-- ============================================

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
  registered_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- Indexes for event registrations
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id, registered_at DESC);

-- ============================================
-- 8. Create Success Stories Table
-- ============================================

CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  story_text TEXT NOT NULL,
  marriage_date DATE NOT NULL,
  photos TEXT[],
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES profiles(user_id),
  CHECK (user1_id != user2_id)
);

-- Indexes for success stories
CREATE INDEX IF NOT EXISTS idx_success_stories_status ON success_stories(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_success_stories_featured ON success_stories(is_featured, approved_at DESC) WHERE status = 'approved';

-- ============================================
-- 9. Create User Analytics Table
-- ============================================

CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  profile_views INTEGER DEFAULT 0,
  interests_sent INTEGER DEFAULT 0,
  interests_received INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  connections_count INTEGER DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_user_analytics_user ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_last_active ON user_analytics(last_active DESC);

-- ============================================
-- 10. Create Connections Table
-- ============================================

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'removed')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Indexes for connections
CREATE INDEX IF NOT EXISTS idx_connections_user1 ON connections(user1_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_user2 ON connections(user2_id, status);

-- ============================================
-- 11. Create Notifications Table
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('match', 'interest', 'message', 'profile_view', 'event', 'system')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  related_user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  related_entity_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ============================================
-- 12. Create Profile Views Table
-- ============================================

CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  viewed_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  CHECK (viewer_id != viewed_id)
);

-- Indexes for profile views
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id, viewed_at DESC);

-- ============================================
-- 13. Create Saved Searches Table
-- ============================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  search_name VARCHAR(100) NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW()
);

-- Index for saved searches
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id, last_used DESC);

-- ============================================
-- 14. Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 15. Create RLS Policies
-- ============================================

-- Matches policies
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Interests policies
CREATE POLICY "Users can view interests they sent or received" ON interests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send interests" ON interests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update interests they received" ON interests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Event registrations policies
CREATE POLICY "Users can view their own registrations" ON event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their registrations" ON event_registrations
  FOR UPDATE USING (auth.uid() = user_id);

-- User analytics policies
CREATE POLICY "Users can view their own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Connections policies
CREATE POLICY "Users can view their connections" ON connections
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Profile views policies
CREATE POLICY "Users can view who viewed their profile" ON profile_views
  FOR SELECT USING (auth.uid() = viewed_id);

CREATE POLICY "Users can record profile views" ON profile_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Saved searches policies
CREATE POLICY "Users can manage their saved searches" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 16. Create Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at BEFORE UPDATE ON user_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_analytics
  SET profile_views = profile_views + 1,
      updated_at = NOW()
  WHERE user_id = NEW.viewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profile views
CREATE TRIGGER on_profile_view AFTER INSERT ON profile_views
  FOR EACH ROW EXECUTE FUNCTION increment_profile_views();

-- Function to update analytics on interest
CREATE OR REPLACE FUNCTION update_interest_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment interests_sent for sender
  UPDATE user_analytics
  SET interests_sent = interests_sent + 1,
      updated_at = NOW()
  WHERE user_id = NEW.sender_id;
  
  -- Increment interests_received for receiver
  UPDATE user_analytics
  SET interests_received = interests_received + 1,
      updated_at = NOW()
  WHERE user_id = NEW.receiver_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for interests
CREATE TRIGGER on_interest_sent AFTER INSERT ON interests
  FOR EACH ROW EXECUTE FUNCTION update_interest_analytics();

-- ============================================
-- 17. Insert Default Data
-- ============================================

-- Insert default analytics for existing users
INSERT INTO user_analytics (user_id)
SELECT user_id FROM profiles
WHERE user_id NOT IN (SELECT user_id FROM user_analytics)
ON CONFLICT (user_id) DO NOTHING;

-- Migration complete
