
-- Create enum types for matrimonial data
CREATE TYPE public.marital_status AS ENUM ('never_married', 'divorced', 'widowed', 'separated');
CREATE TYPE public.religion AS ENUM ('hindu', 'muslim', 'christian', 'sikh', 'buddhist', 'jain', 'other');
CREATE TYPE public.caste AS ENUM ('brahmin', 'kshatriya', 'vaishya', 'shudra', 'other');
CREATE TYPE public.subcaste AS ENUM ('aiyar', 'aiyangar', 'smartha', 'madhva', 'other');
CREATE TYPE public.education_level AS ENUM ('high_school', 'diploma', 'bachelors', 'masters', 'phd', 'other');
CREATE TYPE public.occupation_type AS ENUM ('software', 'doctor', 'engineer', 'teacher', 'business', 'government', 'other');
CREATE TYPE public.family_type AS ENUM ('nuclear', 'joint');
CREATE TYPE public.subscription_type AS ENUM ('free', 'basic', 'premium', 'vip');
CREATE TYPE public.message_type AS ENUM ('text', 'image', 'video', 'audio');
CREATE TYPE public.call_type AS ENUM ('video', 'audio');
CREATE TYPE public.call_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled', 'missed');
CREATE TYPE public.event_type AS ENUM ('wedding', 'engagement', 'cultural', 'meetup', 'webinar');
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- User profiles table with comprehensive matrimonial information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Basic Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    
    -- Contact Information
    phone_number TEXT,
    email TEXT,
    address JSONB, -- {street, city, state, country, pincode}
    
    -- Matrimonial Information
    marital_status marital_status NOT NULL DEFAULT 'never_married',
    religion religion NOT NULL,
    caste caste,
    subcaste subcaste,
    mother_tongue TEXT,
    languages_known TEXT[], -- array of languages
    
    -- Education & Career
    education_level education_level,
    education_details TEXT,
    occupation occupation_type,
    company_name TEXT,
    annual_income INTEGER,
    
    -- Family Information
    family_type family_type DEFAULT 'nuclear',
    father_name TEXT,
    father_occupation TEXT,
    mother_name TEXT,
    mother_occupation TEXT,
    siblings INTEGER DEFAULT 0,
    family_location TEXT,
    
    -- Horoscope Information
    birth_time TIME,
    birth_place TEXT,
    rashi TEXT,
    nakshatra TEXT,
    manglik BOOLEAN DEFAULT false,
    kundali_url TEXT,
    
    -- Preferences
    about_me TEXT,
    partner_preferences JSONB,
    hobbies TEXT[],
    
    -- Profile Settings
    profile_visibility TEXT CHECK (profile_visibility IN ('public', 'premium_only', 'private')) DEFAULT 'public',
    show_contact_info BOOLEAN DEFAULT false,
    verified verification_status DEFAULT 'pending',
    
    -- Subscription
    subscription_type subscription_type DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Profile Images
    profile_picture_url TEXT,
    gallery_images TEXT[], -- array of image URLs
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
    profile_completion_percentage INTEGER DEFAULT 0
);

-- Messages table for real-time chat
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    media_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Prevent users from messaging themselves
    CHECK (sender_id != receiver_id)
);

-- Interests/Likes system
CREATE TABLE public.interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('sent', 'accepted', 'declined')) DEFAULT 'sent',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Unique constraint to prevent duplicate interests
    UNIQUE(sender_id, receiver_id),
    -- Prevent users from sending interest to themselves
    CHECK (sender_id != receiver_id)
);

-- Video dates (V-dates) table
CREATE TABLE public.vdates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    call_type call_type DEFAULT 'video',
    status call_status DEFAULT 'scheduled',
    meeting_url TEXT,
    feedback JSONB, -- {organizer_rating, participant_rating, comments}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CHECK (organizer_id != participant_id),
    CHECK (scheduled_at > now())
);

-- Events table for community events
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    is_virtual BOOLEAN DEFAULT false,
    meeting_url TEXT,
    max_participants INTEGER,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    banner_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CHECK (event_date > now())
);

-- Event registrations
CREATE TABLE public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    attended BOOLEAN DEFAULT false,
    
    UNIQUE(event_id, user_id)
);

-- Success stories
CREATE TABLE public.success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_user_1 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    couple_user_2 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    wedding_date DATE,
    images TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Subscription plans
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type subscription_type NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE CASCADE NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    payment_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vdates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view public profiles" ON public.profiles
    FOR SELECT USING (
        profile_visibility = 'public' OR 
        user_id = auth.uid() OR
        (profile_visibility = 'premium_only' AND EXISTS (
            SELECT 1 FROM public.user_subscriptions 
            WHERE user_id = auth.uid() AND is_active = true
        ))
    );

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their sent messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- RLS Policies for interests
CREATE POLICY "Users can view their interests" ON public.interests
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send interests" ON public.interests
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can respond to interests" ON public.interests
    FOR UPDATE USING (receiver_id = auth.uid());

-- RLS Policies for vdates
CREATE POLICY "Users can view their vdates" ON public.vdates
    FOR SELECT USING (organizer_id = auth.uid() OR participant_id = auth.uid());

CREATE POLICY "Users can create vdates" ON public.vdates
    FOR INSERT WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Users can update their vdates" ON public.vdates
    FOR UPDATE USING (organizer_id = auth.uid() OR participant_id = auth.uid());

-- RLS Policies for events
CREATE POLICY "Anyone can view active events" ON public.events
    FOR SELECT USING (event_date > now());

CREATE POLICY "Users can create events" ON public.events
    FOR INSERT WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update their events" ON public.events
    FOR UPDATE USING (organizer_id = auth.uid());

-- RLS Policies for event registrations
CREATE POLICY "Users can view their registrations" ON public.event_registrations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can register for events" ON public.event_registrations
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for success stories
CREATE POLICY "Anyone can view published stories" ON public.success_stories
    FOR SELECT USING (is_published = true);

-- RLS Policies for subscription plans
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- RLS Policies for user subscriptions
CREATE POLICY "Users can view their subscriptions" ON public.user_subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_religion_caste ON public.profiles(religion, caste);
CREATE INDEX idx_profiles_age ON public.profiles(date_of_birth);
CREATE INDEX idx_profiles_location ON public.profiles USING GIN(address);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at);
CREATE INDEX idx_messages_unread ON public.messages(receiver_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_interests_receiver ON public.interests(receiver_id, status);
CREATE INDEX idx_vdates_participant ON public.vdates(participant_id, scheduled_at);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, type, price, duration_months, features) VALUES
('Free Plan', 'free', 0, 1, '{"profile_views": 10, "messages": 5, "interests": 3, "video_calls": 0}'),
('Basic Plan', 'basic', 999, 1, '{"profile_views": 100, "messages": 50, "interests": 20, "video_calls": 5}'),
('Premium Plan', 'premium', 1999, 1, '{"profile_views": -1, "messages": -1, "interests": -1, "video_calls": 20, "priority_support": true}'),
('VIP Plan', 'vip', 4999, 1, '{"profile_views": -1, "messages": -1, "interests": -1, "video_calls": -1, "dedicated_manager": true, "profile_boost": true}');

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
