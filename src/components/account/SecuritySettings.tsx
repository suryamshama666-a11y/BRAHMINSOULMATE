
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Eye, EyeOff, Smartphone, Key, Save } from 'lucide-react';
import { toast } from 'sonner';

export const SecuritySettings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    profileVisibility: 'members', // 'public', 'members', 'premium'
    contactInfoVisibility: 'premium'
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const toggleSetting = (key: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({ 
      ...prev, 
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key] 
    }));
  };

  const handleEnable2FA = () => {
    toast.success('Two-factor authentication setup initiated. Check your email for instructions.');
  };

  return (
    <Card className="border-2 border-primary/20 bg-white">
      <CardHeader className="bg-orange-50 border-b border-primary/20">
        <CardTitle className="text-red-700 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Privacy & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* Password Change */}
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Change Password
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Current Password" required>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="border-red-200 focus:border-red-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormField>
              
              <div></div>
              
              <FormField label="New Password" required>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="border-red-200 focus:border-red-400"
                />
              </FormField>
              
              <FormField label="Confirm New Password" required>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="border-red-200 focus:border-red-400"
                />
              </FormField>
            </div>
            
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="border-t border-red-200 pt-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Two-Factor Authentication
          </h3>
          <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-lg border border-red-200">
            <div>
              <div className="font-medium text-gray-900">Enable 2FA</div>
              <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={() => toggleSetting('twoFactorAuth')}
              />
              {!securitySettings.twoFactorAuth && (
                <Button onClick={handleEnable2FA} size="sm" variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Setup
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="border-t border-red-200 pt-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-lg border border-amber-200">
              <div>
                <div className="font-medium text-gray-900">Login Notifications</div>
                <div className="text-sm text-gray-600">Get notified when someone logs into your account</div>
              </div>
              <Switch
                checked={securitySettings.loginNotifications}
                onCheckedChange={() => toggleSetting('loginNotifications')}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
