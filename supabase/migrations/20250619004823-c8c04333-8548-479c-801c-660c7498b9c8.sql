
-- Create saved_searches table
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  search_criteria JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID REFERENCES auth.users NOT NULL,
  blocked_id UUID REFERENCES auth.users NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create shortlists table
CREATE TABLE public.shortlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  shortlisted_user_id UUID REFERENCES auth.users NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shortlisted_user_id)
);

-- Create user_reports table
CREATE TABLE public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users NOT NULL,
  reported_id UUID REFERENCES auth.users NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_reactions table for emoji reactions
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create typing_indicators table for real-time typing
CREATE TABLE public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  is_typing BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Add status column to messages table if it doesn't exist
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));

-- Add reply_to_id column for message threading
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages;

-- Create storage bucket for message files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-files',
  'message-files',
  true,
  10485760, -- 10MB limit
  ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Enable RLS on all tables
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_searches
CREATE POLICY "Users can view their own saved searches" ON public.saved_searches
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own saved searches" ON public.saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saved searches" ON public.saved_searches
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved searches" ON public.saved_searches
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for blocked_users
CREATE POLICY "Users can view their blocked users" ON public.blocked_users
  FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can block other users" ON public.blocked_users
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can unblock users they blocked" ON public.blocked_users
  FOR DELETE USING (auth.uid() = blocker_id);

-- RLS policies for shortlists
CREATE POLICY "Users can view their shortlists" ON public.shortlists
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create shortlists" ON public.shortlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their shortlists" ON public.shortlists
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from their shortlists" ON public.shortlists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_reports
CREATE POLICY "Users can view their reports" ON public.user_reports
  FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON public.user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- RLS policies for message_reactions
CREATE POLICY "Users can view reactions on messages they can see" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages 
      WHERE messages.id = message_reactions.message_id 
      AND (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
    )
  );
CREATE POLICY "Users can add reactions to messages" ON public.message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own reactions" ON public.message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for typing_indicators
CREATE POLICY "Users can view typing indicators for their conversations" ON public.typing_indicators
  FOR SELECT USING (true); -- Allow viewing typing indicators
CREATE POLICY "Users can update their own typing status" ON public.typing_indicators
  FOR ALL USING (auth.uid() = user_id);

-- Storage policies for message files
CREATE POLICY "Users can upload message files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'message-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view message files" ON storage.objects
  FOR SELECT USING (bucket_id = 'message-files');
CREATE POLICY "Users can delete their own message files" ON storage.objects
  FOR DELETE USING (bucket_id = 'message-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for typing indicators and message reactions
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
