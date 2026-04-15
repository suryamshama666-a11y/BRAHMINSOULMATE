-- ============================================================
-- Profile Creation Trigger
-- Fixes: H14 - Resolves race conditions and RLS violations
-- Automatically creates a profile when a new user signs up
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    display_name,
    email,
    role,
    account_status,
    profile_completion,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(split_part(NEW.raw_user_meta_data->>'first_name', ' ', 1), split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)) || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    'user',
    'active',
    10, -- Basic profile completion score
    now(),
    now()
  )
  -- Do nothing if already existing (e.g. created by backend)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
