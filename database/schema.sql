-- Brahmin Soulmate Connect Database Schema
-- Run this script in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE notification_type AS ENUM ('new_message', 'interest_received', 'interest_accepted', 'profile_view', 'subscription_activated', 'system');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic Information
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    images TEXT[] DEFAULT '{}',
    bio TEXT DEFAULT '',
    
    -- Location
    location JSONB DEFAULT '{}',
    
    -- Religious Information
    religion VARCHAR(50) NOT NULL DEFAULT 'Hindu',
    caste VARCHAR(50),
    subcaste VARCHAR(50),
    gotra VARCHAR(50),
    
    -- Personal Details
    marital_status VARCHAR(20) NOT NULL DEFAULT 'never_married',
    height INTEGER NOT NULL CHECK (height >= 100 AND height <= 250), -- in cm
    weight INTEGER CHECK (weight >= 30 AND weight <= 200), -- in kg
    complexion VARCHAR(20),
    
    -- Education & Career
    education JSONB DEFAULT '{}',
    employment JSONB DEFAULT '{}',
    annual_income INTEGER,
    
    -- Family Information
    family JSONB DEFAULT '{}',
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    
    -- Horoscope
    horoscope JSONB DEFAULT '{}',
    birth_time TIME,
    birth_place VARCHAR(100),
    
    -- Subscription
    subscription_type VARCHAR(20) DEFAULT 'free',
    subscription_expiry TIMESTAMP WITH TIME ZONE,
    
    -- Additional
    interests TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Privacy settings
    privacy_settings JSONB DEFAULT '{"show_last_active": true, "show_profile_views": true}'
);

-- Matches table (for interests and connections)
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status match_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT, -- Optional message when sending interest
    
    UNIQUE(user_id, match_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file
    attachment_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action_url TEXT,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan VARCHAR(50) NOT NULL,
    status subscription_status DEFAULT 'pending',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    payment_id VARCHAR(100),
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    image TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    price INTEGER DEFAULT 0,
    organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event participants table
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_status VARCHAR(20) DEFAULT 'pending',
    
    UNIQUE(event_id, user_id)
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, profile_id)
);

-- Profile views table
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    viewed_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(viewer_id, viewed_profile_id, DATE(viewed_at))
);

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    blocked_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, blocked_user_id)
);

-- User activity table (for tracking limits)
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    count INTEGER DEFAULT 1,
    
    UNIQUE(user_id, action, date)
);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    new_messages BOOLEAN DEFAULT TRUE,
    new_interests BOOLEAN DEFAULT TRUE,
    profile_views BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- V-Dates (Video Dates) table
CREATE TABLE IF NOT EXISTS vdates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, completed, cancelled
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success stories table
CREATE TABLE IF NOT EXISTS success_stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    story TEXT NOT NULL,
    wedding_date DATE,
    images TEXT[] DEFAULT '{}',
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);

CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_match_id ON matches(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_profile_id ON profile_views(viewed_profile_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vdates_updated_at BEFORE UPDATE ON vdates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE vdates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view verified profiles" ON profiles
    FOR SELECT USING (verified = true OR auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view own matches" ON matches
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = matches.user_id
            UNION
            SELECT user_id FROM profiles WHERE id = matches.match_id
        )
    );

CREATE POLICY "Users can create matches" ON matches
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = matches.user_id)
    );

CREATE POLICY "Users can update own matches" ON matches
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = matches.user_id
            UNION
            SELECT user_id FROM profiles WHERE id = matches.match_id
        )
    );

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = messages.sender_id
            UNION
            SELECT user_id FROM profiles WHERE id = messages.receiver_id
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = messages.sender_id)
    );

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = messages.sender_id)
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('profile-images', 'profile-images', true),
    ('event-images', 'event-images', true),
    ('success-story-images', 'success-story-images', true);

-- Storage policies
CREATE POLICY "Users can upload profile images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view profile images" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update own profile images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own profile images" ON storage.objects
    FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);