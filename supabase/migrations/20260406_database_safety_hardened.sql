-- PRODUCTION HARDENING: DATABASE SAFETY PHASE
-- Implementation of Soft Deletes, Audit Logging, and Data Safety Guards

-- 1. Create Audit Log Table for High-Sensitivity Changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    actor_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit_logs (Admins Only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 2. Audit Trigger Function
CREATE OR REPLACE FUNCTION public.fn_audit_log_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, actor_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, actor_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, actor_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply Audit Logging to Sensitive Tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name 
             FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('profiles', 'payments', 'subscriptions', 'plans')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_audit_log_%I ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER tr_audit_log_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log_change()', t, t);
    END LOOP;
END;
$$;

-- 4. SOFT DELETE SYSTEM
-- Add deleted_at columns to major entities if they don't exist
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN VALUES ('profiles'), ('messages'), ('success_stories'), ('events')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ', t);
    END LOOP;
END;
$$;

-- Update RLS Policies to Respect Soft Deletes
-- This ensures that "deleted" profiles don't show up in search/discovery
-- Note: This requires updating existing policies. Since we can't easily iterate all policies in SQL strictly,
-- we'll apply a specific guard for profiles as an example of production hardening.

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (deleted_at IS NULL AND is_verified = TRUE);

-- 5. ACCIDENTAL DELETION GUARD
-- For payments and transactions, we use a trigger to block hard-deletes in production
CREATE OR REPLACE FUNCTION public.fn_prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION '❌ Hard deletion is restricted on this table in Production. Use Soft Delete (deleted_at) or contact Database Administrator.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_prevent_payment_deletion ON public.payments;
CREATE TRIGGER tr_prevent_payment_deletion BEFORE DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_hard_delete();

-- 6. INDEXING FOR PERFORMANCE (PRODUCTION OPTIMIZATION)
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_verified_status ON public.profiles(is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_location_search ON public.profiles(city, state, country);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
