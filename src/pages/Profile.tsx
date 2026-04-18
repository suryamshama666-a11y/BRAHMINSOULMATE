import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Footer from '@/components/Footer';
import ProfileImageGallery from '@/features/profile/components/ProfileImageGallery';
import ProfileHeader from '@/features/profile/components/ProfileHeader';
import ProfileTabContent from '@/features/profile/components/ProfileTabContent';
import ProfileContactOptions from '@/features/profile/components/ProfileContactOptions';
import ProfileNotFound from '@/features/profile/components/ProfileNotFound';
import ProfileTrustIndicator from '@/features/profile/components/ProfileTrustIndicator';
import ProfileMainContent from '@/features/profile/components/ProfileMainContent';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isDevBypassMode, getDevProfile } from '@/config/dev';
import { Database } from '@/types/supabase';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch profile using React Query
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery<Database['public']['Tables']['profiles']['Row']>({
    queryKey: ['profile', id],
    queryFn: async () => {
      // Check if we're in dev bypass mode and no ID provided
      if (!id && isDevBypassMode()) {
        return getDevProfile() as any;
      }

      if (!id) {
        // If no ID and not in dev mode, redirect to search or show error
        throw new Error('Profile ID is required');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: true,
    refetchOnWindowFocus: false,
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
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

  // If profile not found and ID was provided, show not found page
  if (id && !profile) {
    return <ProfileNotFound />;
  }

  // If no profiles exist at all, show not found
  if (!profile) {
    return <ProfileNotFound />;
  }

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
        toast.success(`You liked ${(profile as any).name || (profile as any).first_name || 'this'}'s profile!`);
        break;
      case 'message':
        navigate(`/messages?partner=${(profile as any).user_id || (profile as any).id}`);
        break;
      case 'call':
        navigate(`/call/${(profile as any).id || (profile as any).user_id}`);
        break;
      case 'video':
        navigate(`/video-call/${(profile as any).id || (profile as any).user_id}`);
        break;
      case 'schedule':
        navigate('/v-dates');
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <main className="flex-grow container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              className="group hover:border-red-600 hover:bg-red-600"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1 group-hover:text-white" />
              <span className="group-hover:text-white">Back</span>
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

          <ProfileTrustIndicator />
          <ProfileMainContent profile={profile} />

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
};

export default ProfilePage;