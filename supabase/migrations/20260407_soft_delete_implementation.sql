-- Soft Delete Implementation
-- Migration: soft_delete_implementation.sql
-- Description: Add deleted_at columns for data recovery and GDPR compliance

-- Add deleted_at column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_at column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_at column to notifications table
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_at column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_at column to success_stories table
ALTER TABLE public.success_stories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create indexes for deleted_at columns (for performance)
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_deleted_at ON notifications(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_success_stories_deleted_at ON success_stories(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update RLS policies to exclude soft-deleted records
-- Note: These policies should be updated in existing RLS setup

-- Function to soft delete a profile (for GDPR compliance)
CREATE OR REPLACE FUNCTION public.soft_delete_profile(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Mark profile as deleted
  UPDATE public.profiles
  SET deleted_at = NOW()
  WHERE user_id = user_id_param;

  -- Soft delete related data
  UPDATE public.messages
  SET deleted_at = NOW()
  WHERE sender_id IN (SELECT id FROM profiles WHERE user_id = user_id_param)
     OR receiver_id IN (SELECT id FROM profiles WHERE user_id = user_id_param);

  UPDATE public.notifications
  SET deleted_at = NOW()
  WHERE user_id = user_id_param;

  UPDATE public.profile_views
  SET deleted_at = NOW()
  WHERE viewer_id IN (SELECT id FROM profiles WHERE user_id = user_id_param)
     OR viewed_id IN (SELECT id FROM profiles WHERE user_id = user_id_param);

  -- Log the deletion for audit purposes
  INSERT INTO public.deletion_requests (
    email,
    status,
    ip_address,
    user_agent,
    processed_at
  ) VALUES (
    (SELECT email FROM profiles WHERE user_id = user_id_param),
    'processed',
    'system',
    'GDPR compliance',
    NOW()
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;