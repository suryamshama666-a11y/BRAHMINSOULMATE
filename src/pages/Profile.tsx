import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileImageGallery from '@/features/profile/components/ProfileImageGallery';
import ProfileHeader from '@/features/profile/components/ProfileHeader';
import ProfileTabContent from '@/features/profile/components/ProfileTabContent';
import ProfileContactOptions from '@/features/profile/components/ProfileContactOptions';
import ProfileNotFound from '@/features/profile/components/ProfileNotFound';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Share2, Heart, MessageCircle, Phone, Video, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { profiles } from '@/data/profiles';
import { toast } from 'sonner';

const ProfilePage = () => {
  console.log('ProfilePage component rendering');
  console.log('Available profiles:', profiles);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  console.log('Profile ID from params:', id);

  // If no ID is provided, use the first profile as default (simulating current user)
  const defaultProfile = profiles[0];
  console.log('Default profile:', defaultProfile);

  const [profile, setProfile] = useState(
    id ? profiles.find(p => p.id === id) : defaultProfile
  );

  console.log('Current profile state:', profile);

  useEffect(() => {
    console.log('Profile useEffect triggered, ID:', id);

    // Update profile if ID changes (useful for direct navigation or link sharing)
    if (id) {
      const foundProfile = profiles.find(p => p.id === id);
      console.log('Found profile by ID:', foundProfile);
      setProfile(foundProfile);
    } else {
      // If no ID, show the first profile as the user's own profile
      console.log('No ID provided, using default profile');
      setProfile(defaultProfile);
    }

    // Scroll to top when profile changes
    window.scrollTo(0, 0);
  }, [id, defaultProfile]);

  const handleShare = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    toast.success('Profile link copied to clipboard!', {
      position: "top-center",
      duration: 2000,
    });
  };

  const handleQuickAction = (action: string) => {
    switch(action) {
      case 'like':
        toast.success(`You liked ${profile?.name}'s profile!`);
        break;
      case 'message':
        navigate(`/messages?partner=${profile?.userId || profile?.id}`);
        break;
      case 'call':
        navigate(`/call/${profile?.id || profile?.userId}`);
        break;
      case 'video':
        navigate(`/video-call/${profile?.id || profile?.userId}`);
        break;
      case 'schedule':
        navigate('/v-dates');
        break;
    }
  };

  // If profile not found and ID was provided, show not found page
  if (id && !profile) {
    console.log('Profile not found for ID:', id);
    return <ProfileNotFound />;
  }

  // If no profiles exist at all, show not found
  if (!profile) {
    console.log('No profile available at all');
    return <ProfileNotFound />;
  }

  console.log('Rendering profile page for:', profile.name);

  console.log('Rendering profile page for:', profile.name);

  try {
    return (
      <div className="min-h-screen flex flex-col bg-orange-50/30">
        <main className="flex-grow container mx-auto px-4 py-6 md:py-10">
          <div className="mb-6">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                className="group hover:border-red-600"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1 group-hover:text-red-600" />
                <span className="group-hover:text-red-600">Back</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-1 hover:border-red-600"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>

            {/* Quick Actions Bar - Mobile Only */}
            <div className="lg:hidden mb-4">
              <div className="flex justify-center gap-2 bg-white rounded-lg p-3 shadow-sm border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('like')}
                  className="flex-1 max-w-[80px]"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('message')}
                  className="flex-1 max-w-[80px]"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('call')}
                  className="flex-1 max-w-[80px]"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('video')}
                  className="flex-1 max-w-[80px]"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('schedule')}
                  className="flex-1 max-w-[80px]"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Trust Indicator */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-800 flex items-center justify-center">
              <Shield className="h-4 w-4 mr-2" />
              <span className="font-medium">100% Verified Profiles</span>
              <span className="mx-2">•</span>
              <span>Your data is secure & private</span>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Image Gallery & Contact Options */}
              <div className="lg:col-span-1">
                <div className="space-y-6 lg:sticky lg:top-20">
                  <ProfileImageGallery profile={profile} />
                  <div className="hidden lg:block">
                    <ProfileContactOptions profile={profile} />
                  </div>
                </div>
              </div>
              
              {/* Right Column - Profile Details */}
              <div className="lg:col-span-2 space-y-6">
                <ProfileHeader profile={profile} />
                
                {/* Profile Details Tabs */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <Tabs defaultValue="personal" className="w-full">
                    <div className="border-b">
                      <TabsList className="w-full justify-start rounded-none h-auto bg-transparent p-0">
                        {["personal", "professional", "family", "preferences", "horoscope"].map((tab) => (
                          <TabsTrigger
                            key={tab}
                            value={tab}
                            className="flex-1 py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-red-600 rounded-none capitalize data-[state=active]:text-red-600 text-sm"
                          >
                            {tab === "horoscope" ? "Horoscope" : tab}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                    
                    <ProfileTabContent profile={profile} />
                  </Tabs>
                </div>

                {/* Contact Options for Mobile */}
                <div className="lg:hidden">
                  <ProfileContactOptions profile={profile} />
                </div>
              </div>
            </div>

            {/* Additional Profile Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 hover:border-red-600"
              >
                <span>View More Profiles</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/matches')}
                className="flex items-center gap-2 hover:border-red-600"
              >
                <span>My Matches</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/connections/interests')}
                className="flex items-center gap-2 hover:border-red-600"
              >
                <span>My Connections</span>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error rendering ProfilePage:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h1>
          <p className="text-gray-600 mb-4">There was an error loading the profile page.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }
};

export default ProfilePage;
