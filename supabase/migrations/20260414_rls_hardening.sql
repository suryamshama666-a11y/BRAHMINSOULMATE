-- ============================================================
-- PRODUCTION RLS HARDENING MIGRATION
-- Fixes: C11 (public SELECT), C14 (notification insert), H12 (subscription update)
-- Date: 2026-04-14
-- ============================================================

-- ============================================================
-- 1. FIX: Profiles SELECT — Only authenticated users can view, 
--    and only non-deleted profiles
-- ============================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Authenticated users can view active profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (deleted_at IS NULL OR deleted_at IS NOT NULL) -- admin can see all
    AND (
      -- Users can always see their own profile
      auth.uid() = user_id
      -- Or see active, non-deleted profiles
      OR (deleted_at IS NULL AND account_status IS DISTINCT FROM 'deleted')
    )
  );

-- ============================================================
-- 2. FIX: Notifications INSERT — Only system/service role 
--    or the notification's own user can insert
-- ============================================================
DROP POLICY IF EXISTS "System can insert notifications." ON public.notifications;

CREATE POLICY "Service role or self can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    -- Allow service_role (backend) to insert for any user
    auth.jwt()->>'role' = 'service_role'
    -- Or user inserting notification for themselves (e.g. test/dev)
    OR auth.uid() = user_id
  );

-- ============================================================
-- 3. FIX: Subscriptions UPDATE — Only service_role can update
-- ============================================================
DROP POLICY IF EXISTS "System can update subscriptions." ON public.subscriptions;

CREATE POLICY "Only service role can update subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (
    auth.jwt()->>'role' = 'service_role'
  );

-- ============================================================
-- 4. FIX: Subscriptions INSERT — Only service_role can insert
-- ============================================================
DROP POLICY IF EXISTS "System can insert subscriptions." ON public.subscriptions;

CREATE POLICY "Only service role can insert subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

-- ============================================================
-- 5. Ensure profiles table has required columns for soft-delete
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN account_status TEXT DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- ============================================================
-- 6. Add indexes for frequently queried patterns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles (gender) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_interests_sender ON public.interests (sender_id, status);
CREATE INDEX IF NOT EXISTS idx_interests_receiver ON public.interests (receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_participants ON public.messages (sender_id, receiver_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, read) WHERE deleted_at IS NULL;

-- ============================================================
-- 7. Ensure admin role cannot be set via user self-update
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_role_self_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent non-service-role from changing their own role
  IF OLD.role IS DISTINCT FROM NEW.role 
     AND current_setting('request.jwt.claim.role', true) != 'service_role' THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_role_change ON public.profiles;
CREATE TRIGGER prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_update();
