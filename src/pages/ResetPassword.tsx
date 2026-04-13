import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ResetPassword = () => {
  const [setAccessToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // effect:audited — URL token parsing for password reset
  useEffect(() => {
    // Check for access_token in hash or query string
    const hash = window.location.hash;
    let token = '';
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''));
      token = params.get('access_token') || '';
    } else {
      const params = new URLSearchParams(window.location.search);
      token = params.get('access_token') || '';
    }
    if (token) {
      setAccessToken(token);
      setShowResetForm(true);
    }
  }, [setAccessToken]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast.error('Error resetting password: ' + error.message);
    } else {
      toast.success('Password reset successful! You can now log in.');
      navigate('/login');
    }
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50/30 p-4">
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center bg-orange-50 border-b border-primary/20">
            <CardTitle className="text-red-700">Set New Password</CardTitle>
            <p className="text-gray-600">Enter your new password below.</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleReset} className="space-y-6">
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary-dark">
                {loading ? 'Resetting...' : 'Set New Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // fallback: show a message
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50/30 p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
        <CardHeader className="text-center bg-orange-50 border-b border-primary/20">
          <CardTitle className="text-primary">Invalid or Expired Link</CardTitle>
          <p className="text-gray-600">Please request a new password reset link.</p>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ResetPassword; 