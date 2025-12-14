-- Photos table for profile photo management
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_profile_picture BOOLEAN DEFAULT false,
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'premium', 'connections')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Horoscope data table
CREATE TABLE IF NOT EXISTS horoscopes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_place TEXT NOT NULL,
  moon_sign TEXT,
  nakshatra TEXT,
  rashi TEXT,
  manglik_status TEXT CHECK (manglik_status IN ('yes', 'no', 'anshik', 'unknown')),
  horoscope_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_photos_user ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_profile_picture ON photos(is_profile_picture);
CREATE INDEX IF NOT EXISTS idx_photos_privacy ON photos(privacy);
CREATE INDEX IF NOT EXISTS idx_horoscopes_user ON horoscopes(user_id);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE horoscopes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for photos
CREATE POLICY "Users can view their own photos" ON photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" ON photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON photos
  FOR DELETE USING (auth.uid() = user_id);

-- Public photos are visible to everyone
CREATE POLICY "Public photos are visible to all" ON photos
  FOR SELECT USING (privacy = 'public');

-- RLS Policies for horoscopes
CREATE POLICY "Users can view their own horoscope" ON horoscopes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own horoscope" ON horoscopes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own horoscope" ON horoscopes
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to ensure only one profile picture per user
CREATE OR REPLACE FUNCTION ensure_single_profile_picture()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_profile_picture = true THEN
    UPDATE photos
    SET is_profile_picture = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_profile_picture = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_profile_picture_trigger
BEFORE INSERT OR UPDATE ON photos
FOR EACH ROW
EXECUTE FUNCTION ensure_single_profile_picture();

-- Function to update horoscope updated_at
CREATE OR REPLACE FUNCTION update_horoscope_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER horoscope_updated_at_trigger
BEFORE UPDATE ON horoscopes
FOR EACH ROW
EXECUTE FUNCTION update_horoscope_updated_at();
