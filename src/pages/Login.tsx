import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting login with:", email);
      
      // First test direct connectivity to auth endpoint
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        try {
          console.log("Testing auth endpoint before login...");
          const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            },
            mode: 'cors',
          });
          
          console.log("Auth endpoint status:", response.status);
          if (response.status === 400) {
            console.log("Auth endpoint is accessible (400 is expected)");
          } else {
            console.warn("Unexpected status from auth endpoint:", response.status);
          }
        } catch (fetchError) {
          console.error("Auth endpoint test failed:", fetchError);
          // Continue with login attempt anyway
        }
      }
      
      // Now try to sign in
      await signIn(email, password);
      toast.success('Logged in successfully');
      console.log("Navigation to dashboard");
      navigate('/dashboard');
    } catch (error) {
      console.error("Login error details:", error);
      
      // Check for network errors
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          toast.error('Network error: Unable to connect to authentication service. Please check your internet connection and ensure Supabase services are available.');
          console.error("Network error during login:", error);
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes("Email not confirmed")) {
          toast.error('Please verify your email before logging in.');
        } else if (error.message.includes("CORS")) {
          toast.error('CORS error: The authentication service is blocking requests from this origin. This is a configuration issue.');
          console.error("CORS error during login:", error);
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
      } else {
        toast.error('Failed to log in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestLoading(true);
    try {
      console.log("Testing Supabase connection...");
      
      // First test direct fetch to the Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl) {
        try {
          console.log("Testing direct fetch to Supabase health endpoint...");
          console.log("Supabase URL:", supabaseUrl);
          console.log("Supabase Key available:", !!supabaseKey);
          
          const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey || '',
            },
            mode: 'cors',
          });
          
          console.log("Health endpoint status:", response.status);
          if (response.ok) {
            const data = await response.json();
            console.log("Health endpoint data:", data);
            toast.success("Direct connection to Supabase successful");
          } else {
            console.error("Health endpoint error:", response.statusText);
            toast.error(`Direct connection failed: ${response.status} ${response.statusText}`);
          }
        } catch (fetchError) {
          console.error("Direct fetch error:", fetchError);
          toast.error(`Direct fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        }
      }
      
      // Then test through the Supabase client
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Supabase connection error:", error);
        toast.error(`Connection test failed: ${error.message}`);
      } else {
        console.log("Supabase connection successful:", data);
        toast.success('Connection test successful');
      }
    } catch (error) {
      console.error("Connection test error:", error);
      if (error instanceof Error) {
        toast.error(`Connection test failed: ${error.message}`);
      } else {
        toast.error('Connection test failed with unknown error');
      }
    } finally {
      setTestLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // The page will be redirected by signInWithGoogle
    } catch (error) {
      console.error("Google login error:", error);
      setGoogleLoading(false);
      if (error instanceof Error) {
        toast.error(`Google login failed: ${error.message}`);
      } else {
        toast.error('Failed to log in with Google');
      }
    }
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    try {
      await signInWithFacebook();
      // The page will be redirected by signInWithFacebook
    } catch (error) {
      console.error("Facebook login error:", error);
      setFacebookLoading(false);
      if (error instanceof Error) {
        toast.error(`Facebook login failed: ${error.message}`);
      } else {
        toast.error('Failed to log in with Facebook');
      }
    }
  };

  const testDirectLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      console.log("Testing direct login with Supabase client...");
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log("Supabase URL:", supabaseUrl);
      console.log("Supabase Key available:", !!supabaseKey);
      
      // Try direct API call first
      try {
        console.log("Testing direct API call to auth endpoint...");
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey || '',
          },
          body: JSON.stringify({
            email,
            password,
          }),
          mode: 'cors',
        });
        
        console.log("Direct auth response status:", response.status);
        const data = await response.json();
        console.log("Direct auth response:", data);
        
        if (response.ok) {
          toast.success("Direct API login successful");
        } else {
          console.error("Direct API login failed:", data.error || data.message);
          toast.error(`Direct API login failed: ${data.error || data.message}`);
        }
      } catch (directError) {
        console.error("Direct API call failed:", directError);
      }
      
      // Now try with Supabase client
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Client login error:", error);
        toast.error(`Client login failed: ${error.message}`);
      } else {
        console.log("Client login successful:", data);
        toast.success('Client login successful');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Test login error:", error);
      if (error instanceof Error) {
        toast.error(`Test login failed: ${error.message}`);
      } else {
        toast.error('Test login failed with unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50/30 p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
        <CardHeader className="text-center bg-orange-50 border-b border-primary/20">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-serif font-bold text-primary">
              BrahminSoulmate
            </h1>
          </div>
          <CardTitle className="text-red-700">Welcome Back</CardTitle>
          <p className="text-gray-600">Sign in to continue your journey</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <FormField label="Email" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 border-red-200 focus:border-red-400"
                  required
                />
              </div>
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 border-red-200 focus:border-red-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </FormField>

            <div className="flex justify-between items-center">
              <Link
                to="/forgot-password"
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Forgot Password?
              </Link>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={testLoading}
                className="text-xs"
              >
                {testLoading ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Button 
              type="button" 
              onClick={testDirectLogin} 
              disabled={loading} 
              className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Test Direct Login
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                variant="outline"
                className="w-full border-red-200 hover:bg-red-50 transform hover:scale-105 transition-all duration-300"
              >
                {googleLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <>
                    <img
                      src="/google.svg"
                      alt="Google"
                      className="w-5 h-5 mr-2"
                    />
                    Google
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                onClick={handleFacebookLogin}
                disabled={facebookLoading}
                variant="outline"
                className="w-full border-red-200 hover:bg-red-50 transform hover:scale-105 transition-all duration-300"
              >
                {facebookLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <>
                    <img
                      src="/facebook.svg"
                      alt="Facebook"
                      className="w-5 h-5 mr-2"
                    />
                    Facebook
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
