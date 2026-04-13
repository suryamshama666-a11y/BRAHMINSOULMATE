import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

const AuthCallback = () => {
  const navigate = useNavigate();

  // effect:audited — OAuth callback handler for token exchange
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // PKCE flow: exchange code from URL query params
        const code = new URLSearchParams(window.location.search).get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code for session:', error);
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
            return;
          }
          toast.success('Successfully signed in');
          navigate('/dashboard');
          return;
        }

        // Implicit flow fallback: check for access_token in hash
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        if (hashParams.get('access_token')) {
          // Supabase client auto-detects hash tokens via detectSessionInUrl
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            toast.success('Successfully signed in');
            navigate('/dashboard');
            return;
          }
        }

        // Check for error in URL (e.g., OAuth denial)
        const errorParam = new URLSearchParams(window.location.search).get('error_description')
          || new URLSearchParams(window.location.hash.replace('#', '')).get('error_description');
        if (errorParam) {
          toast.error(errorParam);
          navigate('/login');
          return;
        }

        // No code or token found
        console.error('No authentication code or token found in URL');
        toast.error('Authentication failed');
        navigate('/login');
      } catch (err) {
        console.error('Error during authentication callback:', err);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50/50 via-white to-amber-50/50 p-4">
      <Card className="w-full max-w-md border-2 border-red-100/50 shadow-2xl">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse mb-4">
            <div className="h-8 w-8 bg-red-500/50 rounded-full mx-auto"></div>
          </div>
          <h1 className="text-xl font-medium text-gray-700 mb-2">Authenticating...</h1>
          <p className="text-gray-500">Please wait while we complete your sign-in.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback; 