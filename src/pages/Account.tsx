import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  User, Shield, Bell, Crown, Eye, Mail, Phone, Lock, Calendar, CreditCard, LogOut, Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Footer from '@/components/Footer';

export default function Account() {
  const { user, profile } = useAuth();
  
  // State management
  const [profileVisibility, setProfileVisibility] = useState('all');
  const [contactVisibility, setContactVisibility] = useState('premium');
  const [photoPrivacy, setPhotoPrivacy] = useState('connections');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [matchAlerts, setMatchAlerts] = useState('daily');
  const [profileViewNotif, setProfileViewNotif] = useState(true);
  const [messageNotif, setMessageNotif] = useState(true);
  const [interestNotif, setInterestNotif] = useState(true);
  const [eventNotif, setEventNotif] = useState(false);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState(true);
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handleSave = (setting: string) => {
    toast.success(`${setting} updated successfully!`);
  };

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully!');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEmailChange = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    toast.success('Verification email sent to ' + newEmail);
    setShowEmailModal(false);
    setNewEmail('');
  };

  const handlePhoneChange = () => {
    if (!newPhone || newPhone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    toast.success('Phone number updated successfully!');
    setShowPhoneModal(false);
    setNewPhone('');
  };

  const handlePaymentUpdate = () => {
    if (!cardNumber || !cardExpiry || !cardCvv) {
      toast.error('Please fill all card details');
      return;
    }
    toast.success('Payment method updated successfully!');
    setShowPaymentModal(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  const loginHistory = [
    { device: 'Chrome on Windows', location: 'Mumbai, India', time: '2 hours ago', current: true },
    { device: 'Safari on iPhone', location: 'Mumbai, India', time: '1 day ago', current: false },
    { device: 'Chrome on Android', location: 'Pune, India', time: '3 days ago', current: false },
  ];

  const connectedDevices = [
    { name: 'Chrome on Windows', lastActive: '2 hours ago', current: true },
    { name: 'Safari on iPhone', lastActive: '1 day ago', current: false },
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
                  <Badge className="bg-[#FF4500] text-white">Premium</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="text-sm font-medium">347</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Completion</span>
                  <span className="text-sm font-medium">{profile?.profile_completion || 85}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Content - Settings Sections */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Privacy */}
            <Card>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Eye className="h-5 w-5 text-[#FF4500]" />
                <CardTitle>Profile Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Profile Visibility</div>
                    <div className="text-sm text-gray-500">Who can see your profile</div>
                  </div>
                  <Select value={profileVisibility} onValueChange={(val) => {
                    setProfileVisibility(val);
                    handleSave('Profile Visibility');
                  }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="premium">Premium Only</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Contact Info Visibility</div>
                    <div className="text-sm text-gray-500">Who can see your phone/email</div>
                  </div>
                  <Select value={contactVisibility} onValueChange={(val) => {
                    setContactVisibility(val);
                    handleSave('Contact Visibility');
                  }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium Members</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                      <SelectItem value="none">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Photo Privacy</div>
                    <div className="text-sm text-gray-500">Who can view your photos</div>
                  </div>
                  <Select value={photoPrivacy} onValueChange={(val) => {
                    setPhotoPrivacy(val);
                    handleSave('Photo Privacy');
                  }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="premium">Premium Only</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Bell className="h-5 w-5 text-[#FF4500]" />
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-500">Receive updates via email</div>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={(checked) => {
                      setEmailNotifications(checked);
                      handleSave('Email Notifications');
                    }}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">SMS Alerts</div>
                    <div className="text-sm text-gray-500">Get SMS for important updates</div>
                  </div>
                  <Switch 
                    checked={smsAlerts}
                    onCheckedChange={(checked) => {
                      setSmsAlerts(checked);
                      handleSave('SMS Alerts');
                    }}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Match Alerts</div>
                    <div className="text-sm text-gray-500">How often to receive match notifications</div>
                  </div>
                  <Select value={matchAlerts} onValueChange={(val) => {
                    setMatchAlerts(val);
                    handleSave('Match Alerts');
                  }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Profile View Notifications</div>
                    <div className="text-sm text-gray-500">Get notified when someone views your profile</div>
                  </div>
                  <Switch 
                    checked={profileViewNotif}
                    onCheckedChange={(checked) => {
                      setProfileViewNotif(checked);
                      handleSave('Profile View Notifications');
                    }}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Message Notifications</div>
                    <div className="text-sm text-gray-500">Get notified for new messages</div>
                  </div>
                  <Switch 
                    checked={messageNotif}
                    onCheckedChange={(checked) => {
                      setMessageNotif(checked);
                      handleSave('Message Notifications');
                    }}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Interest Notifications</div>
                    <div className="text-sm text-gray-500">Get notified when someone shows interest</div>
                  </div>
                  <Switch 
                    checked={interestNotif}
                    onCheckedChange={(checked) => {
                      setInterestNotif(checked);
                      handleSave('Interest Notifications');
                    }}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Event Notifications</div>
                    <div className="text-sm text-gray-500">Get notified about upcoming events</div>
                  </div>
                  <Switch 
                    checked={eventNotif}
                    onCheckedChange={(checked) => {
                      setEventNotif(checked);
                      handleSave('Event Notifications');
                    }}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Promotional Emails</div>
                    <div className="text-sm text-gray-500">Receive offers and promotional content</div>
                  </div>
                  <Switch 
                    checked={promotionalEmails}
                    onCheckedChange={(checked) => {
                      setPromotionalEmails(checked);
                      handleSave('Promotional Emails');
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Shield className="h-5 w-5 text-[#FF4500]" />
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-500">Add extra security to your account</div>
                  </div>
                  <Switch 
                    checked={twoFactorAuth}
                    onCheckedChange={(checked) => {
                      setTwoFactorAuth(checked);
                      handleSave('Two-Factor Auth');
                    }}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Change Password</div>
                    <div className="text-sm text-gray-500">Update your account password</div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-[#FF4500] hover:bg-[#FFF1E6]"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Login History</div>
                    <div className="text-sm text-gray-500">View recent login activity</div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-[#FF4500] hover:bg-[#FFF1E6]"
                    onClick={() => setShowLoginHistory(true)}
                  >
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Connected Devices</div>
                    <div className="text-sm text-gray-500">{connectedDevices.length} devices currently active</div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-[#FF4500] hover:bg-[#FFF1E6]"
                    onClick={() => setShowDevices(true)}
                  >
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Crown className="h-5 w-5 text-[#FF4500]" />
                <CardTitle>Subscription & Billing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Plan Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium">Current Plan</div>
                      <div className="text-sm text-gray-500">Premium - ₹999/month</div>
                    </div>
                    <Badge className="bg-[#FF4500] text-white">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium">Auto-Renewal</div>
                      <div className="text-sm text-gray-500">Automatically renew subscription</div>
                    </div>
                    <Switch 
                      checked={autoRenewal}
                      onCheckedChange={(checked) => {
                        setAutoRenewal(checked);
                        handleSave('Auto-Renewal');
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium">Next Billing Date</div>
                      <div className="text-sm text-gray-500">December 15, 2025</div>
                    </div>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium">Payment Method</div>
                      <div className="text-sm text-gray-500">•••• •••• •••• 4242</div>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-[#FF4500] hover:bg-[#FFF1E6]"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      Update
                    </Button>
                  </div>
                </div>

                {/* Upgrade Options */}
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-4">Upgrade Your Plan</h3>
                  <div className="flex flex-wrap gap-4">
                    {/* Gold Plan Card */}
                    <div className="relative overflow-hidden rounded-lg border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 to-orange-50/50 backdrop-blur-sm p-4 hover:shadow-lg transition-all flex-1 min-w-[280px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-5 w-5 text-amber-500" />
                        <h4 className="font-semibold text-lg">Gold Plan</h4>
                        <Badge className="bg-amber-500 text-white">Popular</Badge>
                      </div>
                      <p className="text-2xl font-bold text-[#FF4500] mb-2">₹1,999<span className="text-sm font-normal text-gray-600">/month</span></p>
                      <ul className="space-y-1 text-sm text-gray-600 mb-3">
                        <li>✓ Unlimited profile views</li>
                        <li>✓ Priority customer support</li>
                        <li>✓ Advanced search filters</li>
                        <li>✓ Profile highlighting</li>
                      </ul>
                      <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => {
                          toast.success('Redirecting to upgrade...');
                          window.location.href = '/plans';
                        }}
                      >
                        Upgrade to Gold
                      </Button>
                    </div>

                    {/* Platinum Plan Card */}
                    <div className="relative overflow-hidden rounded-lg border-2 border-purple-400 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm p-4 hover:shadow-lg transition-all flex-1 min-w-[280px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-5 w-5 text-purple-500" />
                        <h4 className="font-semibold text-lg">Platinum Plan</h4>
                        <Badge className="bg-purple-500 text-white">Best Value</Badge>
                      </div>
                      <p className="text-2xl font-bold text-[#FF4500] mb-2">₹2,999<span className="text-sm font-normal text-gray-600">/month</span></p>
                      <ul className="space-y-1 text-sm text-gray-600 mb-3">
                        <li>✓ All Gold features</li>
                        <li>✓ Dedicated relationship manager</li>
                        <li>✓ Horoscope matching service</li>
                        <li>✓ Profile verification badge</li>
                      </ul>
                      <Button 
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                        onClick={() => {
                          toast.success('Redirecting to upgrade...');
                          window.location.href = '/plans';
                        }}
                      >
                        Upgrade to Platinum
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Preferences */}
            <Card>
              <CardHeader className="flex flex-row items-center space-x-4">
                <Mail className="h-5 w-5 text-[#FF4500]" />
                <CardTitle>Contact Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Email Address</div>
                    <div className="text-sm text-gray-500">{user?.email || 'Not set'}</div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-[#FF4500] hover:bg-[#FFF1E6]"
                    onClick={() => setShowEmailModal(true)}
                  >
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Phone Number</div>
                    <div className="text-sm text-gray-500">{profile?.phone || 'Not set'}</div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-[#FF4500] hover:bg-[#FFF1E6]"
                    onClick={() => setShowPhoneModal(true)}
                  >
                    {profile?.phone ? 'Change' : 'Add'}
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                      Temporarily hide your profile from searches
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Are you sure you want to deactivate your account?')) {
                        toast.success('Account deactivated');
                      }
                    }}
                  >
                    Deactivate
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Delete Account</div>
                    <div className="text-sm text-gray-500">
                      Permanently delete your account and all data
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Are you sure? This action cannot be undone!')) {
                        toast.error('Account deletion initiated');
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Password Change Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <Lock className="h-5 w-5 text-[#FF4500]" />
                Change Password
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Enter your current password and choose a new one
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-gray-900 font-medium">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-900 font-medium">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-900 font-medium">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button className="bg-[#FF4500] hover:bg-[#E03E00] text-white" onClick={handlePasswordChange}>
                Update Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Change Modal */}
        <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <Mail className="h-5 w-5 text-[#FF4500]" />
                Change Email Address
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Enter your new email address. We'll send a verification link.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-email" className="text-gray-900 font-medium">New Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailModal(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button className="bg-[#FF4500] hover:bg-[#E03E00] text-white" onClick={handleEmailChange}>
                Send Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Phone Change Modal */}
        <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <Phone className="h-5 w-5 text-[#FF4500]" />
                {profile?.phone ? 'Change' : 'Add'} Phone Number
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Enter your phone number with country code
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-phone" className="text-gray-900 font-medium">Phone Number</Label>
                <Input
                  id="new-phone"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPhoneModal(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button className="bg-[#FF4500] hover:bg-[#E03E00] text-white" onClick={handlePhoneChange}>
                Update Phone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Method Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <CreditCard className="h-5 w-5 text-[#FF4500]" />
                Update Payment Method
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Enter your new card details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="card-number" className="text-gray-900 font-medium">Card Number</Label>
                <Input
                  id="card-number"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-expiry" className="text-gray-900 font-medium">Expiry Date</Label>
                  <Input
                    id="card-expiry"
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-cvv" className="text-gray-900 font-medium">CVV</Label>
                  <Input
                    id="card-cvv"
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    maxLength={3}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button className="bg-[#FF4500] hover:bg-[#E03E00] text-white" onClick={handlePaymentUpdate}>
                Update Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Login History Modal */}
        <Dialog open={showLoginHistory} onOpenChange={setShowLoginHistory}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <Shield className="h-5 w-5 text-[#FF4500]" />
                Login History
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Recent login activity on your account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
              {loginHistory.map((login, index) => (
                <div key={index} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg bg-white">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{login.device}</div>
                      {login.current && (
                        <Badge className="bg-green-500 text-white text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{login.location}</div>
                    <div className="text-xs text-gray-500 mt-1">{login.time}</div>
                  </div>
                  {!login.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => toast.success('Session terminated')}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLoginHistory(false)} className="border-gray-300">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Connected Devices Modal */}
        <Dialog open={showDevices} onOpenChange={setShowDevices}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <Shield className="h-5 w-5 text-[#FF4500]" />
                Connected Devices
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Manage devices that have access to your account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {connectedDevices.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{device.name}</div>
                      {device.current && (
                        <Badge className="bg-green-500 text-white text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Last active: {device.lastActive}</div>
                  </div>
                  {!device.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => toast.success('Device removed')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDevices(false)} className="border-gray-300">
                Close
              </Button>
              <Button 
                variant="outline" 
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => {
                  if (confirm('Remove all other devices?')) {
                    toast.success('All other devices removed');
                  }
                }}
              >
                Remove All Others
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
}
