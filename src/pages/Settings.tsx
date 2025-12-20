import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useAuth();

  const handleDeleteAccount = () => {
    toast.error('This feature is not yet implemented');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-red-700">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                <a href="#profile" className="block p-2 hover:bg-red-50 rounded text-red-600">Profile Settings</a>
                <a href="#privacy" className="block p-2 hover:bg-red-50 rounded text-red-600">Privacy</a>
                <a href="#notifications" className="block p-2 hover:bg-red-50 rounded text-red-600">Notifications</a>
                <a href="#subscription" className="block p-2 hover:bg-red-50 rounded text-red-600">Subscription</a>
                <a href="#danger" className="block p-2 hover:bg-red-50 rounded text-red-600">Danger Zone</a>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-8">
          <Card id="profile">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage your profile information and visibility.</p>
              <div className="mt-4">
                <Button variant="outline" className="border-red-200 hover:bg-red-50">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card id="privacy">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Control who can see your profile and contact you.</p>
              <div className="mt-4">
                <Button variant="outline" className="border-red-200 hover:bg-red-50">
                  Manage Privacy
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card id="notifications">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Choose how and when you receive notifications.</p>
              <div className="mt-4">
                <Button variant="outline" className="border-red-200 hover:bg-red-50">
                  Configure Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card id="subscription">
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View and manage your subscription details.</p>
              <div className="mt-4">
                <Button variant="outline" className="border-red-200 hover:bg-red-50">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card id="danger" className="border-red-100">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">These actions are permanent and cannot be undone.</p>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings; 