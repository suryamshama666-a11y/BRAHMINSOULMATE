import React, { useState, useMemo } from 'react';
import ProfileCard from '@/components/ProfileCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { interestsService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { ListFilters } from '@/components/ListFilters';

const MyInterests = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'status', label: 'By Status' },
  ];

  // Fetch sent interests
  const { data: interests = [], isLoading: loading } = useQuery({
    queryKey: ['interests', 'sent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await interestsService.getSentInterests();
    },
    enabled: !!user?.id
  });

  const filteredAndSortedInterests = useMemo(() => {
    let result = [...interests];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.receiver?.full_name?.toLowerCase().includes(term) ||
          i.receiver?.occupation?.toLowerCase().includes(term) ||
          i.receiver?.city?.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [interests, searchTerm, sortBy]);

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
            <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
                    <Heart className="h-8 w-8 mr-3" />
                    My Interests
                  </h1>
                  <p className="text-amber-100">Interests you've sent to other profiles</p>
                </div>
                <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold shadow-sm">
                  {filteredAndSortedInterests.length} Sent
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

          {/* Stats Cards */}
          {!searchTerm && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-2 border-green-100/50 shadow-sm">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-green-600">
                    {interests.filter(i => i.status === 'accepted').length}
                  </h3>
                  <p className="text-sm text-gray-600">Accepted</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-yellow-100/50 shadow-sm">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-yellow-600">
                    {interests.filter(i => i.status === 'pending').length}
                  </h3>
                  <p className="text-sm text-gray-600">Pending</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-red-100/50 shadow-sm">
                <CardContent className="p-6 text-center">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-red-600">
                    {interests.filter(i => i.status === 'declined').length}
                  </h3>
                  <p className="text-sm text-gray-600">Declined</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Interests Grid */}
          {filteredAndSortedInterests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedInterests.map((interest) => (
                interest.receiver && (
                  <div key={interest.id} className="relative">
                    <ProfileCard 
                      profile={{
                        ...interest.receiver,
                        name: interest.receiver.full_name,
                        status: interest.status,
                        sentDate: new Date(interest.created_at).toLocaleDateString()
                      }} 
                      variant="interest"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <Badge 
                        variant={
                          interest.status === 'accepted' ? 'default' : 
                          interest.status === 'declined' ? 'destructive' : 
                          'secondary'
                        }
                        className={
                          interest.status === 'accepted' ? 'bg-green-500 text-white shadow-lg' :
                          interest.status === 'declined' ? 'bg-red-500 text-white shadow-lg' :
                          'bg-yellow-500 text-white shadow-lg'
                        }
                      >
                        {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <Card className="text-center py-16">
              <CardContent>
                <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'No matches found' : 'No Interests Sent Yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? `We couldn't find any interests matching "${searchTerm}". Try a different search term.`
                    : 'Start expressing interest in profiles you like to see them here.'}
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
                    <Button className="bg-amber-600 hover:bg-amber-700 shadow-md">
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

export default MyInterests;
