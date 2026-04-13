-- GDPR Deletion Requests Tracking
-- Create a table to record account deletion requests for non-authenticated users

CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'cancelled')),
  ip_address TEXT,
  user_agent TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_deletion_requests_email ON deletion_requests(email);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);

-- Enable Row Level Security
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage deletion requests
CREATE POLICY "Admins can manage deletion requests" ON deletion_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- No public access (Insertion is handled by the Service Role in the backend)
