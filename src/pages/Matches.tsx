import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Heart, Filter, MapPin, ChevronDown, ChevronUp, SlidersHorizontal, Users } from 'lucide-react';
import { MIN_AGE, GOTRAS } from '@/data/constants';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { matchingService, interestsService, paymentsService } from '@/services/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Pagination } from '@/components/ui/pagination';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const COUNTRIES = [
  { value: 'India', label: 'India' },
  { value: 'USA', label: 'USA' },
  { value: 'UK', label: 'UK' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'UAE', label: 'UAE' },
  { value: 'Singapore', label: 'Singapore' },
];

// States/regions by country
const STATES_BY_COUNTRY: Record<string, string[]> = {
  'India': [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
  ],
  'USA': [
    'California', 'Texas', 'New York', 'Florida', 'Illinois',
    'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan',
    'New Jersey', 'Virginia', 'Washington', 'Arizona', 'Massachusetts',
    'Tennessee', 'Indiana', 'Maryland', 'Minnesota', 'Colorado'
  ],
  'UK': [
    'England', 'Scotland', 'Wales', 'Northern Ireland',
    'London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow'
  ],
  'Canada': [
    'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba',
    'Saskatchewan', 'Nova Scotia', 'New Brunswick'
  ],
  'Australia': [
    'New South Wales', 'Victoria', 'Queensland', 'Western Australia',
    'South Australia', 'Tasmania', 'Northern Territory', 'Australian Capital Territory'
  ],
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah'],
  'Singapore': ['Singapore']
};

export default function Matches() {
  const { user, profile: authProfile } = useAuth();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Filter section states
  const [basicOpen, setBasicOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(false);
  const [gotraOpen, setGotraOpen] = useState(false);

  // Filter values
  const minAge = authProfile?.gender === 'male' ? MIN_AGE.FEMALE : MIN_AGE.MALE;
  const [ageRange, setAgeRange] = useState([minAge, 45]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedGotra, setSelectedGotra] = useState('all');
  const [sortBy, setSortBy] = useState('compatibility');

  // Get available states based on selected country
  const availableStates = selectedCountry !== 'all' ? STATES_BY_COUNTRY[selectedCountry] || [] : [];

  const { data: matches = [], isLoading: loading } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const results = await matchingService.getMatches(user.id, 50);
      
      // Auto-calculate matches if none exist
      if (results.length === 0) {
        await matchingService.calculateMatches(user.id);
        return await matchingService.getMatches(user.id, 50);
      }
      
      return results;
    },
    enabled: !!user?.id
  });

  // Apply filters
  const filteredMatches = matches.filter((match: any) => {
    const profile = match.profile;
    if (!profile) return false;

    if (profile.age < ageRange[0] || profile.age > ageRange[1]) return false;
    if (selectedCountry !== 'all' && profile.country !== selectedCountry) return false;
    if (selectedState !== 'all' && profile.state !== selectedState) return false;
    if (selectedGotra !== 'all' && profile.gotra !== selectedGotra) return false;

    return true;
  }).sort((a: any, b: any) => {
    if (sortBy === 'compatibility') {
      return (b.compatibility_score || 0) - (a.compatibility_score || 0);
    } else if (sortBy === 'age_asc') {
      return (a.profile?.age || 0) - (b.profile?.age || 0);
    } else if (sortBy === 'age_desc') {
      return (b.profile?.age || 0) - (a.profile?.age || 0);
    } else if (sortBy === 'recent') {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);
  const currentMatches = filteredMatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        toast.error('Daily limit reached. Please upgrade your plan.');
        navigate('/plans');
        return;
      }

      sendInterestMutation.mutate({
        profileId,
        message: 'Hi! I found your profile interesting and would like to connect.'
      });
      
      await paymentsService.recordActivity(user.id, 'interests_sent');
    } catch {
      toast.error('Error checking limits');
    }
  };

  const resetFilters = () => {
    setAgeRange([minAge, 45]);
    setSelectedCountry('all');
    setSelectedState('all');
    setSelectedGotra('all');
    setSortBy('compatibility');
  };

  const formatHeight = (cm: number) => cm ? `${cm} cm` : '';

  // Collapsible filter section component
  const FilterSection = ({ 
    title, 
    icon: Icon, 
    open, 
    setOpen, 
    children 
  }: { 
    title: string; 
    icon: any; 
    open: boolean; 
    setOpen: (val: boolean) => void; 
    children: React.ReactNode 
  }) => (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left font-medium text-gray-700 hover:text-red-600">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-5 w-64 bg-gray-100 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          
          {/* Grid Layout Skeleton */}
          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar Skeleton */}
            <div className="md:col-span-1 space-y-4">
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-40 w-full bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-32 w-full bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Profile Cards Skeleton */}
            <div className="md:col-span-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProfileCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-red-600 mb-2">Your Matches</h1>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${filteredMatches.length} profiles matched based on your preferences`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <Card className="md:col-span-1 h-fit sticky top-4">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-600">
                    Reset All
                  </Button>
                </div>

                {/* Basic Filters */}
                <FilterSection title="Basic Filters" icon={SlidersHorizontal} open={basicOpen} setOpen={setBasicOpen}>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">Age: {ageRange[0]} - {ageRange[1]}</Label>
                      <Slider 
                        min={minAge} 
                        max={60} 
                        step={1} 
                        value={ageRange} 
                        onValueChange={setAgeRange} 
                        className="mt-2" 
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
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
                </FilterSection>

                {/* Location Filter */}
                <div className="border-t pt-3">
                  <FilterSection title="Location" icon={MapPin} open={locationOpen} setOpen={setLocationOpen}>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Country</Label>
                        <Select 
                          value={selectedCountry} 
                          onValueChange={(val) => {
                            setSelectedCountry(val);
                            setSelectedState('all'); // Reset state when country changes
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="All Countries" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedCountry !== 'all' && availableStates.length > 0 && (
                        <div>
                          <Label className="text-sm">State / Region</Label>
                          <Select value={selectedState} onValueChange={setSelectedState}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="All States" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All States</SelectItem>
                              {availableStates.map((state) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </FilterSection>
                </div>

                {/* Gotra Filter */}
                <div className="border-t pt-3">
                  <FilterSection title="Gotra" icon={Users} open={gotraOpen} setOpen={setGotraOpen}>
                    <div>
                      <Label className="text-sm">Select Gotra</Label>
                      <Select value={selectedGotra} onValueChange={setSelectedGotra}>
                        <SelectTrigger className="mt-1">
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
                  </FilterSection>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Matches Grid */}
          <div className={showFilters ? 'md:col-span-3' : 'md:col-span-4'}>
            {filteredMatches.length === 0 ? (
              <Card className="bg-white rounded-2xl shadow-sm">
                <CardContent className="p-0">
                  <EmptyState 
                    variant="no-matches"
                    title="No Matches Found"
                    description="Try adjusting your filters to see more profiles that match your preferences."
                    actionLabel="Reset Filters"
                    onAction={resetFilters}
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                <div className={`grid gap-6 ${showFilters ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {currentMatches.map((match: any) => (
                    <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {match.compatibility_score}% Match
                          </Badge>
                        </div>
                        
                        {match.profile && (
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-lg font-semibold">{match.profile.full_name}</h3>
                              <p className="text-gray-600 text-sm">
                                {match.profile.age} years • {formatHeight(match.profile.height)}
                              </p>
                              <p className="text-red-500 text-xs font-medium">
                                {match.profile.occupation || 'Professional'}
                              </p>
                            </div>

                            <div className="space-y-1.5 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" />
                                {match.profile.city}, {match.profile.state}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs">🎓</span>
                                {match.profile.education}
                              </div>
                              <Badge variant="outline" className="font-normal text-xs">
                                Gotra: {match.profile.gotra || 'Not specified'}
                              </Badge>
                            </div>

                            <Button
                              onClick={() => handleSendInterest(match.profile.user_id)}
                              disabled={sendInterestMutation.isPending}
                              className="w-full bg-red-600 hover:bg-red-700"
                              size="sm"
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

                {/* Pagination */}
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
                    itemsPerPageOptions={showFilters ? [8, 16, 24] : [9, 18, 27]}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
