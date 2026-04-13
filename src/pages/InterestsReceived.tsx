import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Clock, CheckCircle, XCircle, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { interestsService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProfileCard from '@/components/ProfileCard';
import { ListFilters } from '@/components/ListFilters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

type StatusFilter = 'all' | 'accepted' | 'pending' | 'declined';
type DateFilter = 'all' | '7days' | '30days' | '90days';

const InterestsReceived = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

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
      const data = await interestsService.getReceivedInterests();
      // Mock data for testing pagination in dev
      if (data && data.length > 0 && data.length < 10 && import.meta.env.DEV) {
        return Array.from({ length: 20 }, (_, i) => ({
          ...data[0],
          id: `mock-rec-${i}`,
          sender: { ...data[0].sender, full_name: `${data[0].sender.full_name} ${i+1}` },
          created_at: new Date(Date.now() - i * 3600000).toISOString(),
          status: i % 3 === 0 ? 'accepted' : i % 3 === 1 ? 'declined' : 'pending'
        }));
      }
      return data;
    },
    enabled: !!user?.id
  });

  const filteredAndSortedInterests = useMemo(() => {
    let result = [...interests];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
      const cutoffDate = new Date(now.getTime() - daysMap[dateFilter] * 24 * 60 * 60 * 1000);
      result = result.filter(i => new Date(i.created_at) >= cutoffDate);
    }

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
  }, [interests, searchTerm, sortBy, statusFilter, dateFilter]);

  // Counts for tabs
  const counts = useMemo(() => ({
    all: interests.length,
    accepted: interests.filter(i => i.status === 'accepted').length,
    pending: interests.filter(i => i.status === 'pending').length,
    declined: interests.filter(i => i.status === 'declined').length,
  }), [interests]);

  const totalPages = Math.ceil(filteredAndSortedInterests.length / itemsPerPage);
  const paginatedInterests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedInterests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedInterests, currentPage, itemsPerPage]);

  // Page reset is handled inline in filter change handlers below

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

  // Reset page when filters change (inline instead of useEffect)
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value: DateFilter) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  if (loading) {
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100 p-8">
        <div className="container mx-auto">
          <div className="h-40 w-full bg-gradient-to-r from-red-200 to-amber-200 rounded-2xl animate-pulse mb-8"></div>
          <div className="flex gap-4 mb-4">
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
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
  }

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
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
          />

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilterChange('all')}
              className={statusFilter === 'all' ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-700'}
            >
              <Users className="h-4 w-4 mr-1.5" />
              All ({counts.all})
            </Button>
            <Button
              variant={statusFilter === 'accepted' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilterChange('accepted')}
              className={statusFilter === 'accepted' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700'}
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Accepted ({counts.accepted})
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilterChange('pending')}
              className={statusFilter === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700'}
            >
              <Clock className="h-4 w-4 mr-1.5" />
              Pending ({counts.pending})
            </Button>
            <Button
              variant={statusFilter === 'declined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilterChange('declined')}
              className={statusFilter === 'declined' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700'}
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Declined ({counts.declined})
            </Button>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 mr-1">Time:</span>
            {[
              { value: 'all', label: 'All Time' },
              { value: '7days', label: 'Last 7 Days' },
              { value: '30days', label: 'Last 30 Days' },
              { value: '90days', label: 'Last 90 Days' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={dateFilter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateFilterChange(option.value as DateFilter)}
                className={dateFilter === option.value ? 'bg-amber-600 hover:bg-amber-700 text-white h-7 text-xs' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-700 h-7 text-xs'}
              >
                {option.label}
              </Button>
            ))}
          </div>

            {/* Interests Grid */}
            {paginatedInterests.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {paginatedInterests.map((interest) => (
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
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  className="mt-8"
                />
              </>
            ) : (
          <Card className="py-8 border-dashed border-2 shadow-none bg-white/50">
            <CardContent className="p-0">
              <EmptyState 
                variant={searchTerm ? "no-results" : "no-notifications"}
                title={searchTerm ? "No Matches Found" : "No Interests Yet"}
                description={
                  searchTerm 
                    ? `We couldn't find any interests matching "${searchTerm}". Try a different search term.` 
                    : "You haven't received any interests yet. Keep your profile updated to attract matches!"
                }
                actionLabel={searchTerm ? "Clear Search" : undefined}
                onAction={searchTerm ? () => setSearchTerm('') : undefined}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InterestsReceived;
