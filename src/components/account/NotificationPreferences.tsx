import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Heart, Calendar, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const NotificationPreferences = () => {
  const isMobile = useIsMobile();
  const { user } = useSupabaseAuth();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newMatches: true,
    messages: true,
    profileViews: false,
    interests: true,
    events: true,
    newsletter: false,
    promotions: false
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      // Save preferences to database (simplified)
      toast.success('Notification preferences updated successfully!');
      
      // Send a test notification email if email notifications are enabled
      if (preferences.emailNotifications && user) {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            userId: user.id,
            type: 'preferences_updated',
            title: 'Notification Preferences Updated',
            message: 'Your notification preferences have been successfully updated. You will now receive notifications according to your chosen settings.',
            actionUrl: `${window.location.origin}/account`
          }
        });
        toast.success('Test notification email sent!');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const notificationTypes = [
    { key: 'emailNotifications' as const, label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
    { key: 'smsNotifications' as const, label: 'SMS Notifications', icon: MessageSquare, description: 'Receive notifications via SMS' },
    { key: 'pushNotifications' as const, label: 'Push Notifications', icon: Bell, description: 'Browser push notifications' },
  ];

  const eventTypes = [
    { key: 'newMatches' as const, label: 'New Matches', icon: Heart, description: 'When new profiles match your preferences' },
    { key: 'messages' as const, label: 'New Messages', icon: MessageSquare, description: 'When you receive new messages' },
    { key: 'profileViews' as const, label: 'Profile Views', icon: Bell, description: 'When someone views your profile' },
    { key: 'interests' as const, label: 'Interests Received', icon: Heart, description: 'When someone shows interest in your profile' },
    { key: 'events' as const, label: 'Event Reminders', icon: Calendar, description: 'Matrimonial events and meetups' },
    { key: 'newsletter' as const, label: 'Newsletter', icon: Mail, description: 'Monthly newsletter with tips and success stories' },
    { key: 'promotions' as const, label: 'Promotions', icon: Bell, description: 'Special offers and premium features' },
  ];

  return (
    <Card className="border-2 border-primary/20 bg-white">
      <CardHeader className="bg-orange-50 border-b border-primary/20">
        <CardTitle className={`text-red-700 flex items-center ${
          isMobile ? 'text-lg' : 'text-xl'
        }`}>
          <Bell className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-4 md:space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
        <div>
          <h3 className={`font-semibold text-red-700 mb-3 md:mb-4 ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>
            Communication Methods
          </h3>
          <div className="space-y-3 md:space-y-4">
            {notificationTypes.map(({ key, label, icon: Icon, description }) => (
              <div key={key} className={`flex items-center justify-between bg-red-50/50 rounded-lg border border-red-200 ${
                isMobile ? 'p-3' : 'p-4'
              }`}>
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Icon className={`text-red-600 flex-shrink-0 ${
                    isMobile ? 'h-4 w-4' : 'h-5 w-5'
                  }`} />
                  <div className="min-w-0">
                    <div className={`font-medium text-gray-900 ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      {label}
                    </div>
                    <div className={`text-gray-600 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      {description}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences[key]}
                  onCheckedChange={() => handleToggle(key)}
                  className="flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className={`font-semibold text-red-700 mb-3 md:mb-4 ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>
            Event Types
          </h3>
          <div className="space-y-3 md:space-y-4">
            {eventTypes.map(({ key, label, icon: Icon, description }) => (
              <div key={key} className={`flex items-center justify-between bg-amber-50/50 rounded-lg border border-amber-200 ${
                isMobile ? 'p-3' : 'p-4'
              }`}>
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Icon className={`text-amber-600 flex-shrink-0 ${
                    isMobile ? 'h-4 w-4' : 'h-5 w-5'
                  }`} />
                  <div className="min-w-0">
                    <div className={`font-medium text-gray-900 ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      {label}
                    </div>
                    <div className={`text-gray-600 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      {description}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences[key]}
                  onCheckedChange={() => handleToggle(key)}
                  className="flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSave}
          className={`bg-primary hover:bg-primary-dark text-white w-full md:w-auto ${
            isMobile ? 'h-12' : 'h-10'
          }`}
        >
          <Save className={`mr-2 ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};
