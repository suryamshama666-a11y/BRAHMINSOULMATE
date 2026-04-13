-- SECURITY HARDENING: RPC & RLS REINFORCEMENT
-- Migration: 20260406_security_rls_hardening.sql
-- Description: Create atomic payment RPC and harden RLS to prevent direct client manipulation

-- 1. Create the Missing handle_successful_payment RPC
-- This ensures all payment steps (Recording payment, Updating profile, History) happen in one transaction.
CREATE OR REPLACE FUNCTION public.handle_successful_payment(
    p_user_id UUID,
    p_order_id TEXT,
    p_payment_id TEXT,
    p_amount DECIMAL,
    p_currency TEXT,
    p_plan TEXT,
    p_end_date TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
    -- Record the payment
    INSERT INTO public.payments (user_id, order_id, payment_id, amount, currency, plan, status)
    VALUES (p_user_id, p_order_id, p_payment_id, p_amount, p_currency, p_plan, 'completed')
    ON CONFLICT (payment_id) DO NOTHING; -- Idempotency

    -- Update the profile subscription status
    UPDATE public.profiles
    SET 
        subscription_type = p_plan,
        subscription_status = 'active',
        subscription_start = NOW(),
        subscription_end = p_end_date,
        updated_at = NOW(),
        is_premium = true -- Extra safeguard
    WHERE user_id = p_user_id;

    -- Also record in the separate subscriptions table for historical tracking
    INSERT INTO public.subscriptions (user_id, plan_id, status, start_date, end_date, payment_id)
    VALUES (p_user_id, p_plan, 'active', NOW(), p_end_date, p_payment_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. HARDEN SUBSCRIPTIONS RLS
-- Pre-Migration: Permissive INSERT/UPDATE allowed anyone to self-grant premium access.
-- Post-Migration: Only SELECT is allowed for users. Modifications only via backend (Service Role).
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "System can insert subscriptions" ON public.subscriptions;

-- 3. HARDEN PAYMENTS RLS
DROP POLICY IF EXISTS "Users can insert payments" ON public.payments;
-- Result: Users can only SELECT their own payments.

-- 4. HARDEN PROFILES RLS: COLUMN-LEVEL GUARD
-- We use a trigger to block non-admins from changing system-critical columns directly via client-side Supabase API.
CREATE OR REPLACE FUNCTION public.fn_guard_profile_system_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the current user is an admin. If not, block changes to sensitive columns.
    -- We use a nested check to avoid recursion if profiles table itself is queried.
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
        IF (NEW.role IS DISTINCT FROM OLD.role) OR
           (NEW.verified IS DISTINCT FROM OLD.verified) OR
           (NEW.is_verified IS DISTINCT FROM OLD.is_verified) OR
           (NEW.subscription_type IS DISTINCT FROM OLD.subscription_type) OR
           (NEW.subscription_status IS DISTINCT FROM OLD.subscription_status) OR
           (NEW.account_status IS DISTINCT FROM OLD.account_status) OR
           (NEW.is_banned IS DISTINCT FROM OLD.is_banned)
        THEN
            RAISE EXCEPTION '❌ SECURITY VIOLATION: Unauthorized attempt to update restricted system-controlled columns.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_guard_profile_system_columns ON public.profiles;
CREATE TRIGGER tr_guard_profile_system_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_guard_profile_system_columns();

-- 5. APPLY PERMISSIVE SELECT FOR ADMINS ACROSS ALL TABLES
-- This ensures admins can always manage data regardless of other limited policies.
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'subscriptions', 'payments', 'verification_requests', 'analytics_events')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admins can manage %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Admins can manage %I" ON public.%I FOR ALL TO authenticated USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = ''admin'')
        )', t, t);
    END LOOP;
END;
$$;
