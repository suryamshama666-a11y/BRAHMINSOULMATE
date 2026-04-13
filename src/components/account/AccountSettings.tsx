
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Shield, User, CreditCard, LogOut } from 'lucide-react';
import { PersonalDetailsForm } from './PersonalDetailsForm';
import { SecuritySettings } from './SecuritySettings';
import { NotificationPreferences } from './NotificationPreferences';
import { BillingPlans } from './BillingPlans';
import { useAuth } from '@/hooks/useAuth';

export const AccountSettings = () => {
  const { setNameVisibility, profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'personal' | 'security' | 'notifications' | 'billing'>('overview');
  const [showPersonalDetailsForm, setShowPersonalDetailsForm] = useState(false);

  const _handleNameVisibilityChange = async (visible: boolean) => {
    try {
      await setNameVisibility(visible);
    } catch (error) {
      console.error('Failed to update name visibility:', error);
    }
  };

  const _currentNameVisibility = profile?.profileNameVisibility || false;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Button variant="outline" className="justify-start" onClick={() => setShowPersonalDetailsForm(true)}>
            <User className="mr-2 h-4 w-4" />
            Personal Details
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => setActiveSection('security')}>
            <Shield className="mr-2 h-4 w-4" />
            Security Settings
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => setActiveSection('notifications')}>
            <Bell className="mr-2 h-4 w-4" />
            Notification Preferences
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => setActiveSection('billing')}>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing &amp; Plans
          </Button>
          <Button variant="destructive" className="justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>

      {showPersonalDetailsForm ? (
        <PersonalDetailsForm onCancel={() => setShowPersonalDetailsForm(false)} />
      ) : activeSection === 'personal' ? (
        <PersonalDetailsForm onCancel={() => setActiveSection('overview')} />
      ) : activeSection === 'security' ? (
        <SecuritySettings />
      ) : activeSection === 'notifications' ? (
        <NotificationPreferences />
      ) : activeSection === 'billing' ? (
        <BillingPlans />
      ) : null}
    </div>
  );
};
