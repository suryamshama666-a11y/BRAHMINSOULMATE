import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, Heart } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          toast.error('Network error: Unable to connect. Please check your internet connection.');
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes("Email not confirmed")) {
          toast.error('Please verify your email before logging in.');
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
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

  return (
    <div className="min-h-screen w-full flex items-start sm:items-center justify-center pt-[100px] pb-4 sm:py-8 px-3 sm:px-4 relative bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-rose-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-rose-100/30 to-orange-100/30 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mandala" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-orange-900"/>
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-orange-900"/>
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-orange-900"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mandala)" />
        </svg>
      </div>
      
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl relative z-10 backdrop-blur-sm bg-white/90 my-2 sm:my-4 -mt-16 sm:mt-4">
        <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-rose-50 border-b border-primary/20 py-3 sm:py-4 md:py-6">
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary mr-1.5 sm:mr-2 flex-shrink-0" />
            <h1 className="text-base sm:text-lg md:text-2xl font-serif font-bold text-primary">
              BrahminSoulmate
            </h1>
          </div>
          <CardTitle className="text-red-700 text-lg sm:text-xl md:text-2xl">Welcome Back</CardTitle>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Sign in to continue your journey</p>
        </CardHeader>
        
        <CardContent className="p-3 sm:p-4 md:p-6">
          <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-4 md:space-y-6">
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

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg transform hover:scale-105 transition-all duration-300 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-3 sm:mt-4 md:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 md:mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                variant="outline"
                className="w-full border-red-200 hover:bg-red-50 transform hover:scale-105 transition-all duration-300 text-xs sm:text-sm py-2 h-auto"
              >
                {googleLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">Connecting...</span>
                  </div>
                ) : (
                  <>
                    <img
                      src="/google.svg"
                      alt="Google"
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2"
                    />
                    <span>Google</span>
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                onClick={handleFacebookLogin}
                disabled={facebookLoading}
                variant="outline"
                className="w-full border-red-200 hover:bg-red-50 transform hover:scale-105 transition-all duration-300 text-xs sm:text-sm py-2 h-auto"
              >
                {facebookLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">Connecting...</span>
                  </div>
                ) : (
                  <>
                    <img
                      src="/facebook.svg"
                      alt="Facebook"
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2"
                    />
                    <span>Facebook</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 md:mt-6 text-center pb-1 sm:pb-2">
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
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