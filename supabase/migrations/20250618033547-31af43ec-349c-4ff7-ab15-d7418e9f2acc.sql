
-- Add compatibility tracking table
CREATE TABLE public.compatibility_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overall_score INTEGER NOT NULL DEFAULT 0,
  guna_milan_score INTEGER DEFAULT 0,
  rashi_compatibility INTEGER DEFAULT 0,
  nakshatra_compatibility INTEGER DEFAULT 0,
  dosha_compatibility INTEGER DEFAULT 0,
  compatibility_details JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Add admin roles and permissions
CREATE TABLE public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'moderator',
  permissions JSONB DEFAULT '{}',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- Add admin activity logs
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.compatibility_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for compatibility matches
CREATE POLICY "Users can view their own compatibility matches" 
  ON public.compatibility_matches 
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can insert compatibility matches" 
  ON public.compatibility_matches 
  FOR INSERT 
  WITH CHECK (true);

-- RLS policies for admin roles
CREATE POLICY "Admins can view admin roles" 
  ON public.admin_roles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar 
      WHERE ar.user_id = auth.uid() AND ar.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admin roles" 
  ON public.admin_roles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar 
      WHERE ar.user_id = auth.uid() 
      AND ar.role = 'super_admin' 
      AND ar.is_active = true
    )
  );

-- RLS policies for admin logs
CREATE POLICY "Admins can view admin logs" 
  ON public.admin_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar 
      WHERE ar.user_id = auth.uid() AND ar.is_active = true
    )
  );

CREATE POLICY "System can insert admin logs" 
  ON public.admin_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_id = $1 
    AND is_active = true
  );
$$;

-- Function to calculate horoscope compatibility
CREATE OR REPLACE FUNCTION public.calculate_compatibility(user1_id UUID, user2_id UUID)
RETURNS INTEGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  profile1 RECORD;
  profile2 RECORD;
  guna_score INTEGER := 0;
  rashi_score INTEGER := 0;
  nakshatra_score INTEGER := 0;
  dosha_score INTEGER := 0;
  total_score INTEGER := 0;
BEGIN
  -- Get profiles
  SELECT * INTO profile1 FROM public.profiles WHERE profiles.user_id = $1;
  SELECT * INTO profile2 FROM public.profiles WHERE profiles.user_id = $2;
  
  IF profile1 IS NULL OR profile2 IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Basic compatibility scoring (simplified)
  -- Rashi compatibility (out of 25 points)
  IF profile1.rashi IS NOT NULL AND profile2.rashi IS NOT NULL THEN
    CASE 
      WHEN profile1.rashi = profile2.rashi THEN rashi_score := 25;
      WHEN profile1.rashi IN ('Aries (Mesh)', 'Leo (Simha)', 'Sagittarius (Dhanu)') 
           AND profile2.rashi IN ('Aries (Mesh)', 'Leo (Simha)', 'Sagittarius (Dhanu)') THEN rashi_score := 20;
      WHEN profile1.rashi IN ('Taurus (Vrishabh)', 'Virgo (Kanya)', 'Capricorn (Makar)') 
           AND profile2.rashi IN ('Taurus (Vrishabh)', 'Virgo (Kanya)', 'Capricorn (Makar)') THEN rashi_score := 20;
      ELSE rashi_score := 10;
    END CASE;
  END IF;
  
  -- Nakshatra compatibility (out of 25 points)
  IF profile1.nakshatra IS NOT NULL AND profile2.nakshatra IS NOT NULL THEN
    nakshatra_score := 15; -- Simplified scoring
  END IF;
  
  -- Manglik compatibility (out of 25 points)
  IF profile1.manglik = profile2.manglik THEN
    dosha_score := 25;
  ELSIF profile1.manglik IS FALSE AND profile2.manglik IS FALSE THEN
    dosha_score := 25;
  ELSE
    dosha_score := 5;
  END IF;
  
  -- Additional factors (out of 25 points)
  guna_score := 15; -- Simplified, would need complex Ashtakoot calculation
  
  total_score := rashi_score + nakshatra_score + dosha_score + guna_score;
  
  -- Insert or update compatibility record
  INSERT INTO public.compatibility_matches (
    user1_id, user2_id, overall_score, guna_milan_score, 
    rashi_compatibility, nakshatra_compatibility, dosha_compatibility,
    compatibility_details
  ) VALUES (
    $1, $2, total_score, guna_score, 
    rashi_score, nakshatra_score, dosha_score,
    jsonb_build_object(
      'calculated_factors', jsonb_build_object(
        'rashi_match', profile1.rashi = profile2.rashi,
        'manglik_match', profile1.manglik = profile2.manglik,
        'both_non_manglik', profile1.manglik IS FALSE AND profile2.manglik IS FALSE
      )
    )
  ) ON CONFLICT (user1_id, user2_id) 
  DO UPDATE SET 
    overall_score = EXCLUDED.overall_score,
    guna_milan_score = EXCLUDED.guna_milan_score,
    rashi_compatibility = EXCLUDED.rashi_compatibility,
    nakshatra_compatibility = EXCLUDED.nakshatra_compatibility,
    dosha_compatibility = EXCLUDED.dosha_compatibility,
    compatibility_details = EXCLUDED.compatibility_details,
    calculated_at = now();
    
  RETURN total_score;
END;
$$;
