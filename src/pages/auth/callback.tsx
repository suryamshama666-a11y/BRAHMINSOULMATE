import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract the hash from the URL
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const code = params.get('code') || new URLSearchParams(window.location.search).get('code');
    
    const handleCallback = async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error exchanging code for session:', error);
            toast.error('Authentication failed');
            navigate('/login');
            return;
          }
          
          toast.success('Successfully authenticated');
          navigate('/dashboard');
        } else {
          // If no code is present, something went wrong
          console.error('No authentication code found in URL');
          toast.error('Authentication failed');
          navigate('/login');
        }
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