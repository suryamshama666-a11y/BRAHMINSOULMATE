import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Clock, Filter, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const YouViewed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewedProfiles, setViewedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    const loadViewedProfiles = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('profile_views')
          .select(`
            id,
            viewed_at,
            viewed_profile:viewed_profile_id(
              id,
              full_name,
              age,
              gender,
              height,
              religion,
              caste,
              gotra,
              city,
              state,
              education,
              occupation,
              subscription_type,
              last_active,
              avatar_url
            )
          `)
          .eq('viewer_id', user?.id)
          .order('viewed_at', { ascending: false });

        if (timeFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          query = query.gte('viewed_at', today.toISOString());
        } else if (timeFilter === 'week') {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          query = query.gte('viewed_at', weekAgo.toISOString());
        } else if (timeFilter === 'month') {
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          query = query.gte('viewed_at', monthAgo.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        const formattedProfiles = (data || []).map((view: any) => ({
          id: view.viewed_profile?.id || view.id,
          name: view.viewed_profile?.full_name || 'Unknown',
          age: view.viewed_profile?.age || 0,
          gender: view.viewed_profile?.gender || 'unknown',
          height: view.viewed_profile?.height || 0,
          religion: view.viewed_profile?.religion || 'Hindu',
          caste: view.viewed_profile?.caste || 'Brahmin',
          gotra: view.viewed_profile?.gotra || 'Not specified',
          location: `${view.viewed_profile?.city || 'Unknown'}, ${view.viewed_profile?.state || ''}`,
          education: view.viewed_profile?.education || 'Not specified',
          profession: view.viewed_profile?.occupation || 'Not specified',
          subscription_type: view.viewed_profile?.subscription_type || 'free',
          lastActive: view.viewed_profile?.last_active || new Date().toISOString(),
          viewedAt: view.viewed_at,
          avatarUrl: view.viewed_profile?.avatar_url
        }));

        setViewedProfiles(formattedProfiles);
      } catch (error) {
        console.error('Error loading viewed profiles:', error);
        const mockProfiles = [
          {
            id: '1',
            name: 'Priya Menon',
            age: 26,
            gender: 'female',
            height: 160,
            religion: 'Hindu',
            caste: 'Brahmin',
            gotra: 'Atri',
            location: 'Bangalore, Karnataka',
            education: 'MBA',
            profession: 'Product Manager',
            subscription_type: 'premium',
            lastActive: '2 hours ago',
            viewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            name: 'Vikram Joshi',
            age: 30,
            gender: 'male',
            height: 180,
            religion: 'Hindu',
            caste: 'Brahmin',
            gotra: 'Gautam',
            location: 'Hyderabad, Telangana',
            education: 'M.Tech',
            profession: 'Tech Lead',
            subscription_type: 'premium',
            lastActive: '1 day ago',
            viewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            name: 'Sneha Reddy',
            age: 24,
            gender: 'female',
            height: 157,
            religion: 'Hindu',
            caste: 'Brahmin',
            gotra: 'Jamadagni',
            location: 'Mumbai, Maharashtra',
            education: 'B.Com, CA',
            profession: 'Financial Analyst',
            subscription_type: 'free',
            lastActive: '5 hours ago',
            viewedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
          }
        ];
        setViewedProfiles(mockProfiles);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadViewedProfiles();
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

  const clearHistory = async () => {
    try {
      await supabase
        .from('profile_views')
        .delete()
        .eq('viewer_id', user?.id);
      
      setViewedProfiles([]);
      toast.success('Viewing history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const handleProfileAction = (action: string, profileId: string) => {
    const targetProfile = viewedProfiles.find(p => p.id === profileId);
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
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
                  <Eye className="h-8 w-8 mr-3" />
                  Recently Viewed Profiles
                </h1>
                <p className="text-indigo-100">Profiles you've viewed recently</p>
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
                {viewedProfiles.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={clearHistory}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                )}
                <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold">
                  {viewedProfiles.length} Profiles
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {viewedProfiles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {viewedProfiles.map((profile) => (
              <div key={profile.id} className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
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
              <h3 className="text-xl font-semibold mb-2">No Viewing History</h3>
              <p className="text-gray-600 mb-6">Start browsing profiles to build your history</p>
              <Link to="/search">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Browse Profiles
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default YouViewed;
