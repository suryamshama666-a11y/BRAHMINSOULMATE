-- Update messages table structure
ALTER TABLE public.messages
  -- Drop existing read column if it exists
  DROP COLUMN IF EXISTS read,
  -- Add new columns
  ADD COLUMN IF NOT EXISTS message_type TEXT CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file')) DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('sent', 'delivered', 'read')) DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id);

-- Create message_reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create typing_indicators table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for message_reactions
CREATE POLICY "Users can view message reactions" ON public.message_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can add reactions" ON public.message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions" ON public.message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for typing_indicators
CREATE POLICY "Users can view typing indicators" ON public.typing_indicators
  FOR SELECT USING (true);

CREATE POLICY "Users can update their typing status" ON public.typing_indicators
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(receiver_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation ON public.typing_indicators(conversation_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators; 