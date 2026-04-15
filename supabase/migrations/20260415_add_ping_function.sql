-- Add ping function for health checks
CREATE OR REPLACE FUNCTION public.ping()
RETURNS boolean AS $$
BEGIN
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
