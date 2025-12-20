import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Star, HeartOff } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ListFilters } from '@/components/ListFilters';
import { Pagination } from '@/components/ui/pagination';

const MyFavorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const sortOptions = [
    { value: 'newest', label: 'Newest Added' },
    { value: 'age-asc', label: 'Age: Youngest First' },
    { value: 'age-desc', label: 'Age: Oldest First' },
    { value: 'active', label: 'Recently Active' },
  ];

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      
      // Mock data for favorites - generating more for pagination demo
      const mockFavorites = Array.from({ length: 25 }, (_, i) => ({
        id: (i + 1).toString(),
        name: i % 2 === 0 ? `Priya Sharma ${i + 1}` : `Arjun Patel ${i + 1}`,
        age: 22 + (i % 15),
        gender: i % 2 === 0 ? 'female' : 'male',
        height: 160 + (i % 20),
        religion: 'Hindu',
        caste: 'Brahmin',
        location: i % 3 === 0 ? 'Mumbai, Maharashtra' : i % 3 === 1 ? 'Bangalore, Karnataka' : 'Chennai, Tamil Nadu',
        education: i % 4 === 0 ? 'MBA' : i % 4 === 1 ? 'M.Tech' : i % 4 === 2 ? 'CA' : 'MBBS',
        profession: i % 4 === 0 ? 'Software Engineer' : i % 4 === 1 ? 'Data Scientist' : i % 4 === 2 ? 'Chartered Accountant' : 'Doctor',
        subscription_type: i % 5 === 0 ? 'premium' : 'free',
        lastActive: new Date(Date.now() - (i * 2 * 60 * 60 * 1000)).toISOString(),
        addedToFavorites: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString()
      }));

      setTimeout(() => {
        setFavorites(mockFavorites);
        setLoading(false);
      }, 1000);
    };

    loadFavorites();
  }, [user]);

  const filteredAndSortedFavorites = useMemo(() => {
    let result = [...favorites];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term) ||
          p.profession.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'age-asc':
          return a.age - b.age;
        case 'age-desc':
          return b.age - a.age;
        case 'active':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        case 'newest':
        default:
          return new Date(b.addedToFavorites).getTime() - new Date(a.addedToFavorites).getTime();
      }
    });

    return result;
  }, [favorites, searchTerm, sortBy]);

  const paginatedFavorites = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedFavorites.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedFavorites, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedFavorites.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, itemsPerPage]);

  const removeFavorite = (profileId) => {
    setFavorites(favorites.filter(fav => fav.id !== profileId));
    toast.success('Removed from favorites');
  };

  const handleProfileAction = (action: string, profileId: string) => {
    const targetProfile = favorites.find(p => p.id === profileId);
    const profileName = targetProfile?.name || 'User';
    
    switch(action) {
      case 'removeFavorite':
        removeFavorite(profileId);
        break;
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
      case 'report':
        toast.success(`Report submitted for ${profileName}. Our team will review.`);
        break;
      case 'block':
        toast.success(`${profileName} has been blocked`);
        break;
      case 'unblock':
        toast.success(`${profileName} has been unblocked`);
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
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
                    <Heart className="h-8 w-8 mr-3" />
                    My Favorites
                  </h1>
                  <p className="text-red-100">Profiles you've marked as favorites</p>
                </div>
                <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold shadow-sm">
                  {filteredAndSortedFavorites.length} {filteredAndSortedFavorites.length === 1 ? 'Favorite' : 'Favorites'}
                </Badge>
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

          {/* Favorites Grid */}
            {paginatedFavorites.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {paginatedFavorites.map((profile) => (
                    <ProfileCard 
                      key={profile.id}
                      profile={{
                        ...profile, 
                        addedToFavorites: profile.addedToFavorites,
                        gotra: profile.gotra || 'Gotra not specified'
                      }}
                      variant="favorite"
                      onAction={handleProfileAction}
                    />
                  ))}
                </div>
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  className="mt-8"
                />
              </>
            ) : (
            <Card className="text-center py-16">
              <CardContent>
                <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'No matches found' : 'No Favorites Yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? `We couldn't find any profiles matching "${searchTerm}". Try a different search term.`
                    : 'Start adding profiles to your favorites to see them here.'}
                </p>
                {searchTerm ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                ) : (
                  <Link to="/search">
                    <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md">
                      Browse Profiles
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

export default MyFavorites;