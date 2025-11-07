-- Brahmin Soulmate Connect - Supabase Database Schema
-- This schema defines the database structure for the application

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Setup storage for profile images
INSERT INTO storage.buckets (id, name) VALUES ('profile-images', 'Profile Images')
ON CONFLICT DO NOTHING;

-- Set public policies for profile-images bucket
CREATE POLICY "Public profiles are viewable by everyone." ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = 'public');

CREATE POLICY "Users can upload their own profile images." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can update their own profile images." ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  bio TEXT DEFAULT '',
  location JSONB NOT NULL,
  religion TEXT NOT NULL,
  caste TEXT,
  subcaste TEXT,
  marital_status TEXT NOT NULL,
  height INTEGER NOT NULL,
  education JSONB NOT NULL,
  employment JSONB NOT NULL,
  family JSONB,
  preferences JSONB,
  horoscope JSONB,
  subscription_type TEXT DEFAULT 'free',
  subscription_expiry TIMESTAMPTZ,
  interests TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMPTZ
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  match_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  action_url TEXT,
  sender_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  image TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0 NOT NULL,
  price NUMERIC,
  organizer_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create event_participants table
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create views
CREATE OR REPLACE VIEW public.online_users AS
SELECT id, name, age, gender, location, images, last_active
FROM profiles
WHERE last_active > NOW() - INTERVAL '15 minutes';

-- Enable row level security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Matches Policies
CREATE POLICY "Users can view their own matches." ON public.matches
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = user_id
    UNION
    SELECT user_id FROM public.profiles WHERE id = match_id
  ));

CREATE POLICY "Users can insert matches." ON public.matches
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id));

CREATE POLICY "Users can update their own matches." ON public.matches
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = user_id
    UNION
    SELECT user_id FROM public.profiles WHERE id = match_id
  ));

-- Messages Policies
CREATE POLICY "Users can view their own messages." ON public.messages
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = sender_id
    UNION
    SELECT user_id FROM public.profiles WHERE id = receiver_id
  ));

CREATE POLICY "Users can insert messages." ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = sender_id));

CREATE POLICY "Users can update their own messages." ON public.messages
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = sender_id));

-- Notifications Policies
CREATE POLICY "Users can view their own notifications." ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications." ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications." ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Events Policies
CREATE POLICY "Events are viewable by everyone." ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Users can insert events." ON public.events
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = organizer_id));

CREATE POLICY "Users can update their own events." ON public.events
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = organizer_id));

-- Event Participants Policies
CREATE POLICY "Users can view event participants." ON public.event_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can insert event participants." ON public.event_participants
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id));

CREATE POLICY "Users can update their own participation." ON public.event_participants
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = user_id));

-- Subscriptions Policies
CREATE POLICY "Users can view their own subscriptions." ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions." ON public.subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update subscriptions." ON public.subscriptions
  FOR UPDATE USING (true);

-- Functions
-- Function to update last_active timestamp
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_active = NOW()
  WHERE user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating last_active
CREATE TRIGGER update_last_active_trigger
AFTER INSERT OR UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_last_active();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 