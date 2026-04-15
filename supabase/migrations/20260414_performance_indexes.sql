-- ============================================================
-- Add Missing Performance Indexes
-- Fixes: H5 (No database indexes on critical columns)
-- ============================================================

-- Messages table
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON public.messages(receiver_id, read);

-- Profile views table
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON public.profile_views(created_at DESC);

-- Notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Matches table
CREATE INDEX IF NOT EXISTS idx_matches_user_status ON public.matches(user_id, status);

-- Profiles table (for fast search sorting and filtering)
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;
