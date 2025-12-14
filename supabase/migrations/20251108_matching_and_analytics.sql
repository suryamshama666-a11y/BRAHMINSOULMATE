-- Matches table for storing compatibility scores
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score INTEGER NOT NULL CHECK (compatibility_score BETWEEN 0 AND 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'interested')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- User analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_views INTEGER DEFAULT 0,
  interests_sent INTEGER DEFAULT 0,
  interests_received INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connections table (if not exists from previous migration)
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_user1 ON connections(user1_id);
CREATE INDEX IF NOT EXISTS idx_connections_user2 ON connections(user2_id);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matches
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert their own matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their own matches" ON matches
  FOR UPDATE USING (auth.uid() = user1_id);

-- RLS Policies for analytics
CREATE POLICY "Users can view their own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" ON user_analytics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics" ON user_analytics
  FOR INSERT WITH CHECK (true);

-- RLS Policies for connections
CREATE POLICY "Users can view their connections" ON connections
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create connections" ON connections
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Function to increment analytics
CREATE OR REPLACE FUNCTION increment_analytics(
  p_user_id UUID,
  p_field TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Insert or update analytics
  INSERT INTO user_analytics (user_id, profile_views, interests_sent, interests_received, messages_sent, messages_received)
  VALUES (
    p_user_id,
    CASE WHEN p_field = 'profile_views' THEN 1 ELSE 0 END,
    CASE WHEN p_field = 'interests_sent' THEN 1 ELSE 0 END,
    CASE WHEN p_field = 'interests_received' THEN 1 ELSE 0 END,
    CASE WHEN p_field = 'messages_sent' THEN 1 ELSE 0 END,
    CASE WHEN p_field = 'messages_received' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    profile_views = user_analytics.profile_views + CASE WHEN p_field = 'profile_views' THEN 1 ELSE 0 END,
    interests_sent = user_analytics.interests_sent + CASE WHEN p_field = 'interests_sent' THEN 1 ELSE 0 END,
    interests_received = user_analytics.interests_received + CASE WHEN p_field = 'interests_received' THEN 1 ELSE 0 END,
    messages_sent = user_analytics.messages_sent + CASE WHEN p_field = 'messages_sent' THEN 1 ELSE 0 END,
    messages_received = user_analytics.messages_received + CASE WHEN p_field = 'messages_received' THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_analytics
  SET last_active = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last active on message send
CREATE TRIGGER update_last_active_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_last_active();

-- Add responded_at column to interests if not exists
ALTER TABLE interests ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;

-- Update messages table to include status field
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Update interests status on response
CREATE OR REPLACE FUNCTION update_interest_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('accepted', 'declined') THEN
    NEW.responded_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interest_response_trigger
BEFORE UPDATE ON interests
FOR EACH ROW
EXECUTE FUNCTION update_interest_responded_at();
