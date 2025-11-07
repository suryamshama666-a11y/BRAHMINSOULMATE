import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import ProfileCard from '@/components/ProfileCard';
import { Search as SearchIcon, Filter, X, Save, Loader2 } from 'lucide-react';
import { SearchService, SearchFilters } from '@/services/api/search.service';
import { UserProfile } from '@/types';
import { toast } from 'sonner';
import Footer from '@/components/Footer';

export default function Search() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    ageMin: 21,
    ageMax: 35,
    heightMin: 150,
    heightMax: 190,
    limit: 20,
    offset: 0,
    sortBy: 'recent',
    excludeSameGotra: true,
  });
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    cities: [] as string[],
    states: [] as string[],
    educationLevels: [] as string[],
    occupations: [] as string[],
    gotras: [] as string[],
    subcastes: [] as string[],
  });

  // Load filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    const { data, error } = await SearchService.getFilterOptions();
    if (data) {
      setFilterOptions(data);
    }
  };

  // Search profiles
  const searchProfiles = async (resetOffset = true) => {
    setLoading(true);
    
    const searchFilters = resetOffset ? { ...filters, offset: 0 } : filters;
    
    const { data, error } = await SearchService.searchProfiles(searchFilters);
    
    if (error) {
      toast.error('Search failed: ' + error.message);
      setLoading(false);
      return;
    }
    
    if (data) {
      if (resetOffset) {
        setProfiles(data.profiles);
      } else {
        setProfiles([...profiles, ...data.profiles]);
      }
      setTotal(data.total);
      setHasMore(data.hasMore);
    }
    
    setLoading(false);
  };

  // Load more profiles
  const loadMore = () => {
    setFilters({ ...filters, offset: (filters.offset || 0) + (filters.limit || 20) });
    searchProfiles(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      ageMin: 21,
      ageMax: 35,
      heightMin: 150,
      heightMax: 190,
      limit: 20,
      offset: 0,
      sortBy: 'recent',
      excludeSameGotra: true,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-[#FF4500] mb-2">Search Profiles</h1>
            <p className="text-gray-600">
              {total > 0 ? `Found ${total} matching profiles` : 'Find your perfect match'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <Card className="md:col-span-1 h-fit">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-[#FF4500]"
                  >
                    Reset
                  </Button>
                </div>

                {/* Age Range */}
                <div className="space-y-2">
                  <Label>Age Range: {filters.ageMin} - {filters.ageMax}</Label>
                  <Slider
                    min={18}
                    max={60}
                    step={1}
                    value={[filters.ageMin || 21, filters.ageMax || 35]}
                    onValueChange={([min, max]) => setFilters({ ...filters, ageMin: min, ageMax: max })}
                  />
                </div>

                {/* Height Range */}
                <div className="space-y-2">
                  <Label>Height (cm): {filters.heightMin} - {filters.heightMax}</Label>
                  <Slider
                    min={140}
                    max={200}
                    step={1}
                    value={[filters.heightMin || 150, filters.heightMax || 190]}
                    onValueChange={([min, max]) => setFilters({ ...filters, heightMin: min, heightMax: max })}
                  />
                </div>

                {/* Marital Status */}
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select
                    value={filters.maritalStatus?.[0] || ''}
                    onValueChange={(value) => setFilters({ ...filters, maritalStatus: value ? [value] : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="never_married">Never Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gotra */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excludeGotra"
                      checked={filters.excludeSameGotra}
                      onCheckedChange={(checked) => setFilters({ ...filters, excludeSameGotra: !!checked })}
                    />
                    <Label htmlFor="excludeGotra" className="text-sm">
                      Exclude same Gotra
                    </Label>
                  </div>
                </div>

                {/* Verified Only */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verifiedOnly}
                      onCheckedChange={(checked) => setFilters({ ...filters, verifiedOnly: !!checked })}
                    />
                    <Label htmlFor="verified" className="text-sm">
                      Verified profiles only
                    </Label>
                  </div>
                </div>

                {/* With Photos Only */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="photos"
                      checked={filters.withPhotosOnly}
                      onCheckedChange={(checked) => setFilters({ ...filters, withPhotosOnly: !!checked })}
                    />
                    <Label htmlFor="photos" className="text-sm">
                      With photos only
                    </Label>
                  </div>
                </div>

                {/* Search Button */}
                <Button
                  className="w-full bg-[#FF4500] hover:bg-[#E03E00]"
                  onClick={() => searchProfiles(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <div className={showFilters ? 'md:col-span-3' : 'md:col-span-4'}>
            {profiles.length === 0 && !loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No profiles found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your filters to see more results
                  </p>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="text-[#FF4500]"
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      showActions
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                      className="min-w-[200px]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
