import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Eye, Clock, Filter, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/hooks/useAuth';
import { profileViewsService } from '@/services/api';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { ListFilters } from '@/components/ListFilters';
import { Pagination } from '@/components/ui/pagination';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface ViewedProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  height: number;
  religion: string;
  caste: string;
  gotra: string;
  location: string;
  education: string;
  profession: string;
  subscription_type: string;
  lastActive: string;
  viewedAt: string;
  avatarUrl?: string;
  profile_picture?: string;
}

const YouViewed = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [viewedProfiles, setViewedProfiles] = useState<ViewedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);


  const sortOptions = [
    { value: 'newest', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'age-asc', label: 'Age: Youngest First' },
  ];

  useEffect(() => {
    const loadViewedProfiles = async () => {
      setLoading(true);
      
      try {
        const data = await profileViewsService.getIViewed(timeFilter as any);

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
          avatarUrl: view.viewed_profile?.avatar_url || view.viewed_profile?.profile_picture
        }));

        setViewedProfiles(formattedProfiles);
      } catch (error) {
        console.error('Error loading viewed profiles:', error);
        if (import.meta.env.DEV) {
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
            }
          ];
          setViewedProfiles(mockProfiles);
        } else {
          setViewedProfiles([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (authLoading) return;

    if (user) {
      loadViewedProfiles();
      setCurrentPage(1);
    } else {
      setLoading(false);
    }
  }, [user, authLoading, timeFilter]);

  const filteredAndSortedProfiles = useMemo(() => {
    let result = [...viewedProfiles];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(term) ||
          v.location.toLowerCase().includes(term) ||
          v.profession.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.viewedAt).getTime() - new Date(b.viewedAt).getTime();
        case 'age-asc':
          return a.age - b.age;
        case 'newest':
        default:
          return new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime();
      }
    });

    return result;
  }, [viewedProfiles, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProfiles.length / itemsPerPage);
  const currentProfiles = filteredAndSortedProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    } catch {
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
        logger.log('Unknown action:', action);
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100 p-8">
          <div className="container mx-auto">
            <div className="h-40 w-full bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl animate-pulse mb-8"></div>
            <div className="flex gap-4 mb-4">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProfileCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-amber-50/40">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-md">
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
                <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold shadow-sm">
                  {filteredAndSortedProfiles.length} {filteredAndSortedProfiles.length === 1 ? 'Profile' : 'Profiles'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <ListFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={sortOptions}
        />

        {filteredAndSortedProfiles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentProfiles.map((profile) => (
                <div key={profile.id} className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="bg-indigo-100/90 text-indigo-800 backdrop-blur-sm shadow-sm">
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

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(val) => {
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                    itemsPerPageOptions={[9, 15, 21]}
                />

          </>
        ) : (
          <Card className="py-8 border-dashed border-2 shadow-none bg-white/50">
            <CardContent className="p-0">
              <EmptyState 
                variant={searchTerm ? "no-results" : "no-notifications"}
                title={searchTerm ? "No Matches Found" : "No Viewing History"}
                description={
                  searchTerm 
                    ? `We couldn't find any profile views matching "${searchTerm}". Try a different search term.` 
                    : "Start browsing profiles to build your history and see them here."
                }
                actionLabel={searchTerm ? "Clear Search" : "Browse Profiles"}
                onAction={searchTerm ? () => setSearchTerm('') : undefined}
                actionHref={searchTerm ? undefined : "/search"}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default YouViewed;
