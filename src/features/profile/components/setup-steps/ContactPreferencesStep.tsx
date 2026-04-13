import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Bell, Eye, MessageCircle } from 'lucide-react';

type ContactPreferencesStepProps = {
  data: {
    profileVisibility: string;
    contactPermissions: {
      allowMessages: boolean;
      allowCalls: boolean;
      allowVideoChat: boolean;
      allowInterestRequests: boolean;
    };
    notifications: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      pushNotifications: boolean;
      matchAlerts: boolean;
      messageAlerts: boolean;
      profileViewAlerts: boolean;
    };
    privacy: {
      hideContactInfo: boolean;
      hideLastSeen: boolean;
      hideProfileViews: boolean;
      allowPhotoDownload: boolean;
    };
    responseTime: string;
    preferredContactMethod: string;
  };
  onUpdate: (data: any) => void;
  onComplete: (isCompleted: boolean) => void;
};

export default function ContactPreferencesStep({ data, onUpdate, onComplete }: ContactPreferencesStepProps) {
  const [preferences, setPreferences] = useState(data);

  const updatePreferences = (updates: any) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    onUpdate(newPreferences);
    
    // This step is optional, so always mark as complete
    onComplete(true);
  };

  const updateContactPermissions = (field: string, value: boolean) => {
    const newPermissions = { ...preferences.contactPermissions, [field]: value };
    updatePreferences({ contactPermissions: newPermissions });
  };

  const updateNotifications = (field: string, value: boolean) => {
    const newNotifications = { ...preferences.notifications, [field]: value };
    updatePreferences({ notifications: newNotifications });
  };

  const updatePrivacy = (field: string, value: boolean) => {
    const newPrivacy = { ...preferences.privacy, [field]: value };
    updatePreferences({ privacy: newPrivacy });
  };

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Profile Visibility</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Who can see your profile?</Label>
              <RadioGroup
                value={preferences.profileVisibility}
                onValueChange={(value) => updatePreferences({ profileVisibility: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="everyone" id="everyone" />
                  <Label htmlFor="everyone" className="flex-1">
                    <div>
                      <div className="font-medium">Everyone</div>
                      <div className="text-sm text-gray-500">All registered users can view your profile</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="premium" id="premium" />
                  <Label htmlFor="premium" className="flex-1">
                    <div>
                      <div className="font-medium">Premium Members Only</div>
                      <div className="text-sm text-gray-500">Only premium members can view your profile</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="verified" id="verified" />
                  <Label htmlFor="verified" className="flex-1">
                    <div>
                      <div className="font-medium">Verified Members Only</div>
                      <div className="text-sm text-gray-500">Only verified members can view your profile</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Permissions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Contact Permissions</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Messages</Label>
                <p className="text-sm text-gray-500">Let others send you messages</p>
              </div>
              <Switch
                checked={preferences.contactPermissions.allowMessages}
                onCheckedChange={(checked) => updateContactPermissions('allowMessages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Phone Calls</Label>
                <p className="text-sm text-gray-500">Let others call you directly</p>
              </div>
              <Switch
                checked={preferences.contactPermissions.allowCalls}
                onCheckedChange={(checked) => updateContactPermissions('allowCalls', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Video Chat</Label>
                <p className="text-sm text-gray-500">Enable video calling feature</p>
              </div>
              <Switch
                checked={preferences.contactPermissions.allowVideoChat}
                onCheckedChange={(checked) => updateContactPermissions('allowVideoChat', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Interest Requests</Label>
                <p className="text-sm text-gray-500">Let others express interest in your profile</p>
              </div>
              <Switch
                checked={preferences.contactPermissions.allowInterestRequests}
                onCheckedChange={(checked) => updateContactPermissions('allowInterestRequests', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <Switch
                checked={preferences.notifications.emailNotifications}
                onCheckedChange={(checked) => updateNotifications('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-gray-500">Receive updates via SMS</p>
              </div>
              <Switch
                checked={preferences.notifications.smsNotifications}
                onCheckedChange={(checked) => updateNotifications('smsNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive app notifications</p>
              </div>
              <Switch
                checked={preferences.notifications.pushNotifications}
                onCheckedChange={(checked) => updateNotifications('pushNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Match Alerts</Label>
                <p className="text-sm text-gray-500">Get notified about new matches</p>
              </div>
              <Switch
                checked={preferences.notifications.matchAlerts}
                onCheckedChange={(checked) => updateNotifications('matchAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Message Alerts</Label>
                <p className="text-sm text-gray-500">Get notified about new messages</p>
              </div>
              <Switch
                checked={preferences.notifications.messageAlerts}
                onCheckedChange={(checked) => updateNotifications('messageAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Profile View Alerts</Label>
                <p className="text-sm text-gray-500">Get notified when someone views your profile</p>
              </div>
              <Switch
                checked={preferences.notifications.profileViewAlerts}
                onCheckedChange={(checked) => updateNotifications('profileViewAlerts', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Privacy Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Hide Contact Information</Label>
                <p className="text-sm text-gray-500">Hide phone number and email from profile</p>
              </div>
              <Switch
                checked={preferences.privacy.hideContactInfo}
                onCheckedChange={(checked) => updatePrivacy('hideContactInfo', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Hide Last Seen</Label>
                <p className="text-sm text-gray-500">Don't show when you were last active</p>
              </div>
              <Switch
                checked={preferences.privacy.hideLastSeen}
                onCheckedChange={(checked) => updatePrivacy('hideLastSeen', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Hide Profile Views</Label>
                <p className="text-sm text-gray-500">Don't show who viewed your profile</p>
              </div>
              <Switch
                checked={preferences.privacy.hideProfileViews}
                onCheckedChange={(checked) => updatePrivacy('hideProfileViews', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Photo Download</Label>
                <p className="text-sm text-gray-500">Let others download your photos</p>
              </div>
              <Switch
                checked={preferences.privacy.allowPhotoDownload}
                onCheckedChange={(checked) => updatePrivacy('allowPhotoDownload', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Preferences */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Response Preferences</h3>

            <div>
              <Label>Expected Response Time</Label>
              <Select 
                value={preferences.responseTime} 
                onValueChange={(value) => updatePreferences({ responseTime: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select response time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Within few hours</SelectItem>
                  <SelectItem value="daily">Within a day</SelectItem>
                  <SelectItem value="weekly">Within a week</SelectItem>
                  <SelectItem value="flexible">No specific timeframe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Preferred Contact Method</Label>
              <RadioGroup
                value={preferences.preferredContactMethod}
                onValueChange={(value) => updatePreferences({ preferredContactMethod: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="messages" id="messages" />
                  <Label htmlFor="messages">Messages on platform</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone">Phone calls</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video">Video calls</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Privacy & Safety</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your privacy and safety are our top priorities</li>
          <li>• You can change these settings anytime from your account</li>
          <li>• We never share your contact information without permission</li>
          <li>• Report any inappropriate behavior immediately</li>
        </ul>
      </div>
    </div>
  );
}
