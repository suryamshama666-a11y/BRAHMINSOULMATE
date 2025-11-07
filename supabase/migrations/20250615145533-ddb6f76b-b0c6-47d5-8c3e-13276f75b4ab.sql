
-- Enhanced Events System with Registration and Categories
CREATE TYPE public.event_category AS ENUM ('matrimony_meetup', 'cultural_event', 'workshop', 'webinar', 'social_gathering', 'religious_ceremony');
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE public.registration_status AS ENUM ('registered', 'cancelled', 'attended', 'no_show');

-- Update events table with new columns
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS category event_category DEFAULT 'matrimony_meetup',
ADD COLUMN IF NOT EXISTS status event_status DEFAULT 'published',
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS contact_info JSONB;

-- Update event_registrations table
ALTER TABLE public.event_registrations 
ADD COLUMN IF NOT EXISTS status registration_status DEFAULT 'registered',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Community Forums System
CREATE TABLE public.forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.forum_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, reply_id),
    CHECK ((post_id IS NOT NULL) OR (reply_id IS NOT NULL)),
    CHECK (NOT (post_id IS NOT NULL AND reply_id IS NOT NULL))
);

-- Enhanced Success Stories
ALTER TABLE public.success_stories 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS engagement_date DATE,
ADD COLUMN IF NOT EXISTS how_they_met TEXT,
ADD COLUMN IF NOT EXISTS advice_for_others TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- User Following System
CREATE TABLE public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Community Groups
CREATE TABLE public.community_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('location', 'interest', 'profession', 'age_group')) NOT NULL,
    location TEXT,
    tags TEXT[],
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    member_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    banner_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- User Achievements and Badges
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_type TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced Notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Activity Feed
CREATE TABLE public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Forums
CREATE POLICY "Anyone can view forum categories" ON public.forum_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view forum replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can manage their likes" ON public.forum_likes FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Social Features
CREATE POLICY "Users can view follows" ON public.user_follows FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "Users can create follows" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their follows" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

CREATE POLICY "Anyone can view public groups" ON public.community_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Authenticated users can create groups" ON public.community_groups FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Group members can view memberships" ON public.group_memberships FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.group_memberships gm WHERE gm.group_id = group_memberships.group_id AND gm.user_id = auth.uid())
);
CREATE POLICY "Users can join groups" ON public.group_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public activities" ON public.user_activities FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category_id, created_at DESC);
CREATE INDEX idx_forum_replies_post ON public.forum_replies(post_id, created_at);
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_group_memberships_user ON public.group_memberships(user_id);
CREATE INDEX idx_user_activities_user ON public.user_activities(user_id, created_at DESC);

-- Insert default forum categories
INSERT INTO public.forum_categories (name, description, icon, sort_order) VALUES
('General Discussion', 'General matrimonial topics and discussions', 'message-square', 1),
('Success Stories', 'Share your success stories and experiences', 'star', 2),
('Advice & Tips', 'Marriage advice and relationship tips', 'users', 3),
('Cultural Events', 'Discuss cultural events and traditions', 'calendar', 4),
('Q&A', 'Questions and answers about matrimony', 'users-round', 5);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;
