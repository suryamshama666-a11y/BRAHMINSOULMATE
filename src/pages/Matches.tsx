import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Briefcase, GraduationCap, RefreshCw, SlidersHorizontal, MapPin as MapPinIcon, GraduationCap as EducationIcon, Briefcase as OccupationIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { MIN_AGE, GOTRAS } from '@/data/constants';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { matchingService, interestsService, paymentsService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pagination } from '@/components/ui/pagination';

export default function Matches() {
  const { user, profile: authProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'filters' | 'recalculate' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const [filters, setFilters] = useState({
    ageMin: authProfile?.gender === 'male' ? MIN_AGE.FEMALE.toString() : MIN_AGE.MALE.toString(),
    ageMax: '',
    location: 'all',
    gotra: 'all',
    sortBy: 'compatibility'
  });

  const { data: matches = [], isLoading: loading } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await matchingService.getMatches(user.id, 20);
    },
    enabled: !!user?.id
  });

  const filteredMatches = matches.filter((match: any) => {
    const profile = match.profile;
    if (!profile) return false;

    if (filters.ageMin && profile.age < parseInt(filters.ageMin)) return false;
    if (filters.ageMax && profile.age > parseInt(filters.ageMax)) return false;
    if (filters.location !== 'all' && profile.state !== filters.location) return false;
    if (filters.gotra !== 'all' && profile.gotra !== filters.gotra) return false;

    return true;
  }).sort((a: any, b: any) => {
    if (filters.sortBy === 'compatibility') {
      return (b.compatibility_score || 0) - (a.compatibility_score || 0);
    } else if (filters.sortBy === 'age_asc') {
      return (a.profile?.age || 0) - (b.profile?.age || 0);
    } else if (filters.sortBy === 'age_desc') {
      return (b.profile?.age || 0) - (a.profile?.age || 0);
    } else if (filters.sortBy === 'recent') {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);
  const currentMatches = filteredMatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const recalculateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      await matchingService.calculateMatches(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Matches recalculated successfully!');
    },
    onError: () => {
      toast.error('Failed to recalculate matches');
      setActiveTab(null);
    }
  });

  const sendInterestMutation = useMutation({
    mutationFn: async ({ profileId, message }: { profileId: string; message: string }) => {
      await interestsService.sendInterest(profileId, message);
    },
    onSuccess: () => {
      toast.success('Interest sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send interest');
    }
  });

  const handleSendInterest = async (profileId: string) => {
    if (!user?.id) return;
    
    try {
      const canSend = await paymentsService.checkSubscriptionLimits(user.id, 'interests_sent');
      if (!canSend) {
        toast.error('Daily limit reached. Please upgrade your plan to send more interests.');
        navigate('/plans');
        return;
      }

      sendInterestMutation.mutate({
        profileId,
        message: 'Hi! I found your profile interesting and would like to connect.'
      });
      
      await paymentsService.recordActivity(user.id, 'interests_sent');
    } catch (error) {
      toast.error('Error checking limits');
    }
  };

  const handleRecalculate = () => {
    recalculateMutation.mutate();
  };

  const resetFilters = () => {
    setFilters({
      ageMin: authProfile?.gender === 'male' ? MIN_AGE.FEMALE.toString() : MIN_AGE.MALE.toString(),
      ageMax: '',
      location: 'all',
      gotra: 'all',
      sortBy: 'compatibility'
    });
  };

  const formatHeightInch = (cm: number) => {
    if (!cm) return "";
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}' ${inches} inch`;
  };

  const uniqueLocations = Array.from(new Set(matches.map((m: any) => m.profile?.state).filter(Boolean))) as string[];

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
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Your Matches</h1>
            <p className="text-gray-600">
              {filteredMatches.length} profiles matched based on your preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'filters' ? 'default' : 'outline'}
              className={activeTab === 'filters' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
              onClick={() => {
                setShowFilters(!showFilters);
                if (!showFilters) setActiveTab('filters');
                else if (activeTab === 'filters') setActiveTab(null);
              }}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              onClick={() => {
                setActiveTab('recalculate');
                setShowFilters(false);
                handleRecalculate();
              }}
              disabled={recalculateMutation.isPending}
              variant={activeTab === 'recalculate' ? 'default' : 'outline'}
              className={activeTab === 'recalculate' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
              Recalculate Matches
            </Button>
          </div>
        </div>

        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent>
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Min Age</Label>
                    <Input
                      type="number"
                      min={authProfile?.gender === 'male' ? MIN_AGE.FEMALE : MIN_AGE.MALE}
                      placeholder={authProfile?.gender === 'male' ? MIN_AGE.FEMALE.toString() : MIN_AGE.MALE.toString()}
                      value={filters.ageMin}
                      onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Max Age</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={filters.ageMax}
                      onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Location</Label>
                    <Select value={filters.location} onValueChange={(v) => setFilters({ ...filters, location: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {uniqueLocations.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Gotra</Label>
                    <Select value={filters.gotra} onValueChange={(v) => setFilters({ ...filters, gotra: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Gotras" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Gotras</SelectItem>
                        {GOTRAS.map((gotra) => (
                          <SelectItem key={gotra} value={gotra}>{gotra}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                    <Select value={filters.sortBy} onValueChange={(v) => setFilters({ ...filters, sortBy: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compatibility">Compatibility Score</SelectItem>
                        <SelectItem value="age_asc">Age (Low to High)</SelectItem>
                        <SelectItem value="age_desc">Age (High to Low)</SelectItem>
                        <SelectItem value="recent">Recently Added</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" onClick={resetFilters}>Reset Filters</Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {filteredMatches.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No matches found yet.</p>
              <Button onClick={handleRecalculate}>Calculate Matches</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentMatches.map((match: any) => (
                <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {match.compatibility_score}% Match
                      </Badge>
                    </div>
                    
                    {match.profile && (
                      <div className="space-y-4">
                          <div className="mb-4">
                            <h3 className="text-xl font-semibold mb-0.5">{match.profile.full_name}</h3>
                            <div className="flex flex-col">
                              <p className="text-gray-600 text-sm font-medium">
                                {match.profile.age} years • {formatHeightInch(match.profile.height)}
                              </p>
                              <p className="text-red-500 text-xs font-semibold">
                                {match.profile.occupation || 'Professional'}
                              </p>
                            </div>
                          </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {match.profile.city}, {match.profile.state}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <EducationIcon className="h-4 w-4 mr-2" />
                            {match.profile.education}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <OccupationIcon className="h-4 w-4 mr-2" />
                            {match.profile.occupation}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Badge variant="outline" className="font-normal">
                              Gotra: {match.profile.gotra || 'Not specified'}
                            </Badge>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleSendInterest(match.profile.user_id)}
                          disabled={sendInterestMutation.isPending}
                          className="w-full"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Send Interest
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
