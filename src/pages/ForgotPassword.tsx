import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Mail, Heart } from 'lucide-react';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
      toast.success('Password reset instructions have been sent to your email');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
            <CardTitle className="text-red-700">Check Your Email</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to your email address. Please check your inbox and follow the instructions to reset your password.
            </p>
            <p className="text-gray-600">
              Didn't receive the email?{' '}
              <button
                onClick={() => setSubmitted(false)}
                className="text-red-600 hover:text-red-700 font-semibold hover:underline"
              >
                Try again
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="text-red-700">Reset Password</CardTitle>
          <p className="text-gray-600">Enter your email to receive reset instructions</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Email Address" required>
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
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-red-600 hover:text-red-700 font-semibold hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
