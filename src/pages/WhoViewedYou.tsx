import React, { useState, useEffect, useMemo } from 'react';
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
import { ListFilters } from '@/components/ListFilters';
import { Pagination } from '@/components/ui/pagination';

const WhoViewedYou = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [viewers, setViewers] = useState([]);
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
    const loadViewers = async () => {
      setLoading(true);
      
      try {
        const data = await profileViewsService.getWhoViewedMe(timeFilter as any);

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

    if (authLoading) return;

    if (user) {
      loadViewers();
      setCurrentPage(1); // Reset to first page on filter change
    } else {
      setLoading(false);
    }
  }, [user, authLoading, timeFilter]);

  const filteredAndSortedViewers = useMemo(() => {
    let result = [...viewers];

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
  }, [viewers, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedViewers.length / itemsPerPage);
  const currentViewers = filteredAndSortedViewers.slice(
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-md">
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
                <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold shadow-sm">
                  {filteredAndSortedViewers.length} {filteredAndSortedViewers.length === 1 ? 'View' : 'Views'}
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

        {filteredAndSortedViewers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentViewers.map((profile) => (
                <div key={profile.id} className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="bg-blue-100/90 text-blue-800 backdrop-blur-sm shadow-sm">
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
          <Card className="text-center py-16">
            <CardContent>
              <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No matches found' : 'No Profile Views Yet'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `We couldn't find any profile views matching "${searchTerm}". Try a different search term.`
                  : 'Complete your profile to attract more viewers and see who visits your page.'}
              </p>
              {searchTerm ? (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              ) : (
                <Link to="/profile/manage">
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                    Complete Your Profile
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WhoViewedYou;
