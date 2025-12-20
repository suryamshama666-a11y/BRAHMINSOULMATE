import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { interestsService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProfileCard from '@/components/ProfileCard';
import { ListFilters } from '@/components/ListFilters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const InterestsReceived = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'status', label: 'By Status' },
  ];

  // Fetch received interests
  const { data: interests = [], isLoading: loading } = useQuery({
    queryKey: ['interests', 'received', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await interestsService.getReceivedInterests();
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
          i.sender?.full_name?.toLowerCase().includes(term) ||
          i.sender?.occupation?.toLowerCase().includes(term) ||
          i.sender?.city?.toLowerCase().includes(term)
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

  // Accept interest mutation
  const acceptMutation = useMutation({
    mutationFn: async (interestId: string) => {
      await interestsService.acceptInterest(interestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
      toast.success('Interest accepted! You can now message each other.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept interest');
    }
  });

  // Decline interest mutation
  const declineMutation = useMutation({
    mutationFn: async (interestId: string) => {
      await interestsService.declineInterest(interestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
      toast.success('Interest declined');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to decline interest');
    }
  });

  const handleAction = (action: string, interestId: string) => {
    if (action === 'accept') {
      acceptMutation.mutate(interestId);
    } else if (action === 'decline') {
      declineMutation.mutate(interestId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const pendingInterests = interests.filter(i => i.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-amber-50/40">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
                  <Heart className="h-8 w-8 mr-3" />
                  Interests Received
                </h1>
                <p className="text-red-100">People who are interested in your profile</p>
              </div>
              <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold shadow-sm">
                {filteredAndSortedInterests.length} {filteredAndSortedInterests.length === 1 ? 'Interest' : 'Interests'}
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

          {filteredAndSortedInterests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedInterests.map((interest) => (
                interest.sender && (
                  <div key={interest.id} className="relative">
                    <ProfileCard 
                      profile={{
                        ...interest.sender,
                        id: interest.id,
                        name: interest.sender.full_name,
                        status: interest.status,
                        message: interest.message,
                        receivedDate: new Date(interest.created_at).toLocaleDateString()
                      }}
                      variant="received"
                      onAction={(action) => handleAction(action, interest.id)}
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
                {searchTerm ? 'No matches found' : 'No Interests Yet'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `We couldn't find any interests matching "${searchTerm}". Try a different search term.`
                  : "You haven't received any interests yet. Keep your profile updated to attract matches!"}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InterestsReceived;
