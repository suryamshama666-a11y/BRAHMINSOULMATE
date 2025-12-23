-- V-Date Reminders table for scheduling reminder notifications
CREATE TABLE IF NOT EXISTS vdate_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vdate_id UUID NOT NULL REFERENCES vdates(id) ON DELETE CASCADE,
  user_id_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24_hours', '1_hour', '15_minutes')),
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_vdate_reminders_pending ON vdate_reminders(sent, reminder_time) WHERE sent = false;
CREATE INDEX IF NOT EXISTS idx_vdate_reminders_vdate ON vdate_reminders(vdate_id);

-- Enable Row Level Security
ALTER TABLE vdate_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reminders" ON vdate_reminders
  FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Service role can manage all reminders (for background jobs)
CREATE POLICY "Service role can manage reminders" ON vdate_reminders
  FOR ALL USING (true);

-- Add notification type 'vdate' if not already in the check constraint
-- This is handled by altering the notifications table check constraint
DO $$
BEGIN
  -- Try to add vdate to the notification types if not present
  ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
  ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('match', 'interest', 'message', 'profile_view', 'event', 'system', 'vdate', 'verification', 'payment'));
EXCEPTION
  WHEN others THEN
    -- Constraint might already include vdate, ignore error
    NULL;
END $$;
