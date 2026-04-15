-- ============================================
-- BRAHMIN SOULMATE CONNECT - DATABASE MIGRATION
-- Project: dotpqqfcamimrsdnvzor
-- Date: 2026-04-15
-- ============================================

-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/sql/new
-- 2. Copy this ENTIRE file
-- 3. Paste into the SQL Editor
-- 4. Click "RUN" button
-- 5. Wait for "Success" message
-- ============================================

-- Migration: Fix Schema Consistency
-- Purpose: Create all required tables, columns, indexes, and security policies

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS education_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS annual_income_range VARCHAR(50),
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS display_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[],
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending';

-- Add missing columns to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'text';

-- Add missing columns to matches table
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS compatibility_score INTEGER DEFAULT 0;

-- Create connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id_1 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    user_id_2 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2)
);

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    plan VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_created_at 
ON profiles(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_profiles_age_gender_verified
ON profiles(age, gender, verified);

CREATE INDEX IF NOT EXISTS idx_profiles_location_city
ON profiles USING GIN ((location->>'city'));

CREATE INDEX IF NOT EXISTS idx_messages_conversation
ON messages(sender_id, receiver_id, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_unread
ON messages(receiver_id, read, created_at);

CREATE INDEX IF NOT EXISTS idx_matches_user1_user2
ON matches(user1_id, user2_id);

CREATE INDEX IF NOT EXISTS idx_connections_user1_user2
ON connections(user_id_1, user_id_2);

CREATE INDEX IF NOT EXISTS idx_connections_status
ON connections(status);

CREATE INDEX IF NOT EXISTS idx_payments_user_id
ON payments(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_payment_id
ON payments(payment_id);

-- Add foreign key constraints
ALTER TABLE matches
DROP CONSTRAINT IF EXISTS fk_matches_user1;

ALTER TABLE matches
ADD CONSTRAINT fk_matches_user1 
FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE matches
DROP CONSTRAINT IF EXISTS fk_matches_user2;

ALTER TABLE matches
ADD CONSTRAINT fk_matches_user2 
FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_connections_updated_at ON connections;
CREATE TRIGGER update_connections_updated_at 
    BEFORE UPDATE ON connections
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add Row Level Security policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own connections" ON connections;
DROP POLICY IF EXISTS "Users can create own connections" ON connections;
DROP POLICY IF EXISTS "Users can update own connections" ON connections;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create own payments" ON payments;

-- Connections policies
CREATE POLICY "Users can view own connections" ON connections
    FOR SELECT USING (
        auth.uid() = user_id_1 OR auth.uid() = user_id_2
    );

CREATE POLICY "Users can create own connections" ON connections
    FOR INSERT WITH CHECK (
        auth.uid() = user_id_1 OR auth.uid() = user_id_2
    );

CREATE POLICY "Users can update own connections" ON connections
    FOR UPDATE USING (
        auth.uid() = user_id_1 OR auth.uid() = user_id_2
    );

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RPC function for handling successful payments
CREATE OR REPLACE FUNCTION handle_successful_payment(
    p_user_id UUID,
    p_order_id VARCHAR,
    p_payment_id VARCHAR,
    p_amount DECIMAL,
    p_currency VARCHAR,
    p_plan VARCHAR,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Insert payment record
    INSERT INTO payments (user_id, order_id, payment_id, amount, currency, plan, status)
    VALUES (p_user_id, p_order_id, p_payment_id, p_amount, p_currency, p_plan, 'completed')
    ON CONFLICT (payment_id) DO NOTHING;

    -- Update user subscription
    UPDATE profiles
    SET 
        subscription_type = p_plan,
        subscription_status = 'active',
        subscription_start = NOW(),
        subscription_end = p_end_date,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Next steps:
-- 1. Verify tables were created in the Table Editor
-- 2. Update your .env.local files with Supabase credentials
-- 3. Start your app: npm run dev
-- ============================================
