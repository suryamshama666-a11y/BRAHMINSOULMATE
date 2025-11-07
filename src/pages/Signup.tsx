import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, User, Heart } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push('Password must be at least 8 characters long');
    if (!hasUpperCase) errors.push('Include at least one uppercase letter');
    if (!hasLowerCase) errors.push('Include at least one lowercase letter');
    if (!hasNumbers) errors.push('Include at least one number');
    if (!hasSpecialChar) errors.push('Include at least one special character');

    return errors;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      passwordErrors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, { firstName, lastName });
      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/login');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sign up with Google');
      }
    }
  };

  const handleFacebookSignup = async () => {
    try {
      await signInWithFacebook();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sign up with Facebook');
      }
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
          <CardTitle className="text-red-700">Create Account</CardTitle>
          <p className="text-gray-600">Join our community and find your soulmate</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleEmailSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" required>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="pl-10 border-red-200 focus:border-red-400"
                    required
                  />
                </div>
              </FormField>

              <FormField label="Last Name" required>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="pl-10 border-red-200 focus:border-red-400"
                    required
                  />
                </div>
              </FormField>
            </div>

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
                  placeholder="Create password"
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

            <FormField label="Confirm Password" required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="pl-10 pr-10 border-red-200 focus:border-red-400"
                  required
                />
              </div>
            </FormField>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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
                onClick={handleGoogleSignup}
                variant="outline"
                className="w-full border-red-200 hover:bg-red-50 transform hover:scale-105 transition-all duration-300"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Google
              </Button>
              
              <Button
                type="button"
                onClick={handleFacebookSignup}
                variant="outline"
                className="w-full border-red-200 hover:bg-red-50 transform hover:scale-105 transition-all duration-300"
              >
                <img
                  src="https://www.facebook.com/favicon.ico"
                  alt="Facebook"
                  className="w-5 h-5 mr-2"
                />
                Facebook
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup; 