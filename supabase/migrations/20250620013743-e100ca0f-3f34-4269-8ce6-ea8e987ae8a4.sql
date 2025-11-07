
-- Create user_follows table for following system
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Add RLS policies for user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can create follows" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their follows" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Create community_groups table
CREATE TABLE public.community_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL,
  is_private BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for community_groups
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public groups" ON public.community_groups FOR SELECT USING (NOT is_private OR creator_id = auth.uid());
CREATE POLICY "Users can create groups" ON public.community_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Group creators can update their groups" ON public.community_groups FOR UPDATE USING (auth.uid() = creator_id);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Add RLS policies for group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group members" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  creator_id UUID NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public events" ON public.events FOR SELECT USING (NOT is_private OR creator_id = auth.uid());
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Event creators can update their events" ON public.events FOR UPDATE USING (auth.uid() = creator_id);

-- Create event_participants table
CREATE TABLE public.event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Add RLS policies for event_participants
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view event participants" ON public.event_participants FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON public.event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their participation" ON public.event_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave events" ON public.event_participants FOR DELETE USING (auth.uid() = user_id);

-- Create success_stories table
CREATE TABLE public.success_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  wedding_date DATE,
  is_published BOOLEAN DEFAULT false,
  admin_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for success_stories
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view published stories" ON public.success_stories FOR SELECT USING (is_published AND admin_approved);
CREATE POLICY "Users can create their own stories" ON public.success_stories FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can update their own stories" ON public.success_stories FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create user_activities table for activity feed
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('profile_update', 'photo_upload', 'post_created', 'event_created', 'group_joined')),
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities" ON public.user_activities FOR SELECT USING (true);
CREATE POLICY "Users can create their own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add subscription_type column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'gold'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_community_groups_updated_at BEFORE UPDATE ON public.community_groups FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_success_stories_updated_at BEFORE UPDATE ON public.success_stories FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
