import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Camera, Settings, Eye, BarChart3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileCompletionIndicator from '@/features/profile/components/ProfileCompletionIndicator';
import PhotoManager from '@/features/profile/components/PhotoManager';
import Footer from '@/components/Footer';

type Photo = {
  id: string;
  url: string;
  isProfilePicture: boolean;
  uploadedAt: Date;
};

export default function ProfileManagement() {
  const navigate = useNavigate();
  
  // Mock profile completion data - in real app, this would come from API
  const [profileCompletion] = useState({
    basicInfo: true,
    photos: true,
    aboutMe: false,
    family: true,
    educationCareer: false,
    preferences: false,
    contactPreferences: true
  });

  // Mock photos data - in real app, this would come from API
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      url: 'https://randomuser.me/api/portraits/men/32.jpg',
      isProfilePicture: true,
      uploadedAt: new Date()
    },
    {
      id: '2',
      url: 'https://randomuser.me/api/portraits/men/33.jpg',
      isProfilePicture: false,
      uploadedAt: new Date()
    }
  ]);

  // Mock profile stats
  const profileStats = {
    views: 247,
    interests: 12,
    matches: 8,
    messages: 15,
    profileStrength: 75
  };

  const handlePhotoUpload = (files: FileList) => {
    // Mock photo upload - in real app, this would upload to server
    Array.from(files).forEach((file, index) => {
      const newPhoto: Photo = {
        id: `photo-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        isProfilePicture: photos.length === 0 && index === 0,
        uploadedAt: new Date()
      };
      setPhotos(prev => [...prev, newPhoto]);
    });
  };

  const handlePhotoDelete = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleSetProfilePicture = (photoId: string) => {
    setPhotos(prev => prev.map(p => ({
      ...p,
      isProfilePicture: p.id === photoId
    })));
  };

  const handlePhotoReorder = (reorderedPhotos: Photo[]) => {
    setPhotos(reorderedPhotos);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
              <p className="text-gray-600">Manage your profile information and settings</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/profile')}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button onClick={() => navigate('/profile/setup')}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{profileStats.views}</div>
                <div className="text-sm text-gray-600">Profile Views</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{profileStats.interests}</div>
                <div className="text-sm text-gray-600">Interests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{profileStats.matches}</div>
                <div className="text-sm text-gray-600">Matches</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{profileStats.messages}</div>
                <div className="text-sm text-gray-600">Messages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{profileStats.profileStrength}%</div>
                <div className="text-sm text-gray-600">Profile Strength</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Completion */}
          <div className="lg:col-span-1">
            <ProfileCompletionIndicator 
              profileData={profileCompletion}
              onSectionClick={(sectionId) => {
                // Navigate to specific section in setup wizard
                const sectionMap: { [key: string]: number } = {
                  basicInfo: 0, photos: 1, aboutMe: 2, family: 3, 
                  educationCareer: 4, preferences: 5, contactPreferences: 6
                };
                navigate(`/profile/setup?step=${sectionMap[sectionId]}`);
              }}
            />
          </div>

          {/* Right Column - Management Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="photos" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="photos" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Photos
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="photos" className="mt-6">
                <PhotoManager
                  photos={photos}
                  onUpload={handlePhotoUpload}
                  onDelete={handlePhotoDelete}
                  onSetProfilePicture={handleSetProfilePicture}
                  onReorder={handlePhotoReorder}
                  maxPhotos={10}
                />
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/profile/setup?step=0')}
                        className="h-20 flex-col"
                      >
                        <User className="h-6 w-6 mb-2" />
                        Basic Information
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/profile/setup?step=2')}
                        className="h-20 flex-col"
                      >
                        <User className="h-6 w-6 mb-2" />
                        About Me
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/profile/setup?step=3')}
                        className="h-20 flex-col"
                      >
                        <User className="h-6 w-6 mb-2" />
                        Family Details
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/profile/setup?step=4')}
                        className="h-20 flex-col"
                      >
                        <User className="h-6 w-6 mb-2" />
                        Education & Career
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/profile/setup?step=6')}
                        className="w-full justify-start"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Contact Preferences
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/settings/privacy')}
                        className="w-full justify-start"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Profile Visibility
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/settings/notifications')}
                        className="w-full justify-start"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Notification Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">{profileStats.views}</div>
                          <div className="text-sm text-blue-800">Total Views</div>
                          <div className="text-xs text-blue-600 mt-1">+12 this week</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600">{profileStats.interests}</div>
                          <div className="text-sm text-green-800">Interests Received</div>
                          <div className="text-xs text-green-600 mt-1">+3 this week</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Recent Activity</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">Profile viewed by Priya S.</span>
                            <span className="text-xs text-gray-500">2 hours ago</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">Interest received from Anjali M.</span>
                            <span className="text-xs text-gray-500">1 day ago</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">Profile viewed by Kavya R.</span>
                            <span className="text-xs text-gray-500">2 days ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
