-- Forum likes table
CREATE TABLE IF NOT EXISTS forum_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Forum reports table
CREATE TABLE IF NOT EXISTS forum_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Add likes column to forum_posts if not exists
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_likes_post ON forum_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON forum_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reports_status ON forum_reports(status);
CREATE INDEX IF NOT EXISTS idx_vdates_status ON vdates(status);
CREATE INDEX IF NOT EXISTS idx_vdates_scheduled ON vdates(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_success_stories_status ON success_stories(status);

-- Enable Row Level Security
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_likes
CREATE POLICY "Users can view all likes" ON forum_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON forum_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON forum_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for forum_reports
CREATE POLICY "Users can view their own reports" ON forum_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON forum_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports" ON forum_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Functions for forum post likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_posts
  SET likes = likes + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_posts
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update forum post updated_at
CREATE OR REPLACE FUNCTION update_forum_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forum_post_updated_at_trigger
BEFORE UPDATE ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_forum_post_updated_at();

-- Add storage buckets (run via Supabase dashboard or storage API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('success-stories', 'success-stories', true);

-- Update vdates table to add room_name if not exists
ALTER TABLE vdates ADD COLUMN IF NOT EXISTS room_name TEXT;

-- Update success_stories table to add image_url if not exists
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS marriage_date DATE;
