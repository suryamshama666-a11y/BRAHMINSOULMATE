import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Settings, Shield, Bell, Crown, 
  CreditCard, Key, Mail, Phone, Globe,
  UserPlus, Eye, Lock, History
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';

export default function Account() {
  const { user, profile } = useAuth();

  const sections = [
    {
      id: 'profile',
      label: 'Profile Privacy',
      icon: User,
      items: [
        { label: 'Profile Visibility', value: 'All Members', action: 'Change' },
        { label: 'Contact Info Visibility', value: 'Premium Members', action: 'Change' },
        { label: 'Photo Privacy', value: 'Connections Only', action: 'Change' },
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Email Notifications', value: 'Enabled', action: 'Configure' },
        { label: 'SMS Alerts', value: 'Disabled', action: 'Enable' },
        { label: 'Match Alerts', value: 'Daily Digest', action: 'Change' },
      ]
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      items: [
        { label: 'Two-Factor Auth', value: 'Disabled', action: 'Enable' },
        { label: 'Login History', value: 'View Recent', action: 'View' },
        { label: 'Connected Devices', value: '2 Active', action: 'Manage' },
      ]
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: Crown,
      items: [
        { label: 'Current Plan', value: 'Premium', action: 'Upgrade' },
        { label: 'Auto-Renewal', value: 'On', action: 'Manage' },
        { label: 'Next Billing', value: 'March 15, 2024', action: 'View' },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-[#FF4500] mb-2">Account Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences, privacy, and security settings
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Sidebar - Quick Stats */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-[#FFF1E6] flex items-center justify-center">
                  <User className="h-6 w-6 text-[#FF4500]" />
                </div>
                <div>
                  <div className="font-medium">{profile?.name || user?.email}</div>
                  <div className="text-sm text-gray-500">Member since Jan 2024</div>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Status</span>
                  <Badge className="bg-green-500 text-white">Verified</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Membership</span>
                  <Badge className="bg-[#FF4500]">Premium</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="text-sm font-medium">347</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Content - Settings Sections */}
          <div className="md:col-span-2 space-y-6">
            {sections.map((section) => (
              <Card key={section.id}>
                <CardHeader className="flex flex-row items-center space-x-4">
                  <section.icon className="h-5 w-5 text-[#FF4500]" />
                  <CardTitle>{section.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-gray-500">{item.value}</div>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-[#FF4500] hover:text-[#FF4500] hover:bg-[#FFF1E6]"
                        >
                          {item.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Deactivate Account</div>
                    <div className="text-sm text-gray-500">
                      Temporarily hide your profile
                    </div>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    Deactivate
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Delete Account</div>
                    <div className="text-sm text-gray-500">
                      Permanently delete your account and data
                    </div>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
