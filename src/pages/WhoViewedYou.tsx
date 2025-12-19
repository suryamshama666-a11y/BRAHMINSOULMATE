import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, MessageCircle, Heart, Clock, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/contexts/AuthContext';
import { profileViewsService } from '@/services/api';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const WhoViewedYou = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    const loadViewers = async () => {
      setLoading(true);
      
      try {
        const data = await profileViewsService.getWhoViewedMe(timeFilter);

        const formattedViewers = (data || []).map((view: any) => ({
          id: view.viewer?.id || view.id,
          name: view.viewer?.full_name || 'Unknown',
          age: view.viewer?.age || 0,
          gender: view.viewer?.gender || 'unknown',
          height: view.viewer?.height || 0,
          religion: view.viewer?.religion || 'Hindu',
          caste: view.viewer?.caste || 'Brahmin',
          gotra: view.viewer?.gotra || 'Not specified',
          location: `${view.viewer?.city || 'Unknown'}, ${view.viewer?.state || ''}`,
          education: view.viewer?.education || 'Not specified',
          profession: view.viewer?.occupation || 'Not specified',
          subscription_type: view.viewer?.subscription_type || 'free',
          lastActive: view.viewer?.last_active || new Date().toISOString(),
          viewedAt: view.viewed_at,
          avatarUrl: view.viewer?.avatar_url || view.viewer?.profile_picture
        }));

        setViewers(formattedViewers);
      } catch (error) {
        console.error('Error loading viewers:', error);
        // Fallback to mock data in development if table/API fails
        if (import.meta.env.DEV) {
          const mockViewers = [
            {
              id: 'm1',
              name: 'Anjali Sharma',
              age: 25,
              gender: 'female',
              height: 165,
              religion: 'Hindu',
              caste: 'Brahmin',
              location: 'Delhi, Delhi',
              profession: 'Software Engineer',
              subscription_type: 'premium',
              viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'm2',
              name: 'Rahul Iyer',
              age: 29,
              gender: 'male',
              height: 178,
              religion: 'Hindu',
              caste: 'Brahmin',
              location: 'Chennai, Tamil Nadu',
              profession: 'Data Scientist',
              subscription_type: 'free',
              viewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          setViewers(mockViewers);
        } else {
          setViewers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadViewers();
    }
  }, [user, timeFilter]);

  const formatViewTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleProfileAction = (action: string, profileId: string) => {
    const targetProfile = viewers.find(p => p.id === profileId);
    const profileName = targetProfile?.name || 'User';
    
    switch(action) {
      case 'view':
        navigate(`/profile/${profileId}`);
        break;
      case 'message':
        navigate(`/messages?partnerId=${profileId}&partnerName=${encodeURIComponent(profileName)}`);
        toast.success(`Opening chat with ${profileName}`);
        break;
      case 'expressInterest':
        toast.success(`Interest expressed to ${profileName}!`);
        break;
      case 'addFavorite':
        toast.success(`${profileName} added to favorites!`);
        break;
      case 'report':
        toast.success(`Report submitted for ${profileName}`);
        break;
      case 'block':
        toast.success(`${profileName} has been blocked`);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-amber-50/40">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
                  <Eye className="h-8 w-8 mr-3" />
                  Who Viewed Your Profile
                </h1>
                <p className="text-blue-100">See who's interested in your profile</p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold">
                  {viewers.length} Views
                </Badge>
              </div>
            </div>
          </div>
        </div>

          {viewers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {viewers.map((profile) => (
              <div key={profile.id} className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Viewed {formatViewTime(profile.viewedAt)}
                  </Badge>
                </div>
                <ProfileCard 
                  profile={profile}
                  variant="default"
                  onAction={handleProfileAction}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Eye className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Profile Views Yet</h3>
              <p className="text-gray-600 mb-6">Complete your profile to attract more viewers</p>
              <Link to="/profile/manage">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Complete Your Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WhoViewedYou;
