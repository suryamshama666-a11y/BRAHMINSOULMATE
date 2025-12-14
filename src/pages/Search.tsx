import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import ProfileCard from '@/components/ProfileCard';
import { Search as SearchIcon, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function Search() {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Filter state
  const [ageRange, setAgeRange] = useState([21, 35]);
  const [heightRange, setHeightRange] = useState([150, 190]);
  const [maritalStatus, setMaritalStatus] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);

  // Determine opposite gender
  const userGender = profile?.gender || 'male';
  const oppositeGender = userGender === 'male' ? 'female' : 'male';

  // Mock profiles data - all opposite gender
  const mockProfiles = [
    {
      id: '1',
      name: oppositeGender === 'female' ? 'Priya Sharma' : 'Raj Sharma',
      age: 26,
      gender: oppositeGender,
      height: 165,
      location: 'Mumbai, Maharashtra',
      education: 'MBA',
      profession: 'Software Engineer',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Bharadwaja',
      subscription_type: 'premium',
      profile_picture: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      id: '2',
      name: oppositeGender === 'female' ? 'Anjali Patel' : 'Arjun Patel',
      age: 28,
      gender: oppositeGender,
      height: 162,
      location: 'Bangalore, Karnataka',
      education: 'M.Tech',
      profession: 'Data Scientist',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Kashyapa',
      subscription_type: 'premium',
      profile_picture: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: '3',
      name: oppositeGender === 'female' ? 'Kavya Iyer' : 'Karthik Iyer',
      age: 25,
      gender: oppositeGender,
      height: 160,
      location: 'Chennai, Tamil Nadu',
      education: 'CA',
      profession: 'Chartered Accountant',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Atri',
      subscription_type: 'free',
      profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/3.jpg`
    },
    {
      id: '4',
      name: oppositeGender === 'female' ? 'Rohini Gupta' : 'Rohit Gupta',
      age: 30,
      gender: oppositeGender,
      height: 175,
      location: 'Delhi, NCR',
      education: 'MBA',
      profession: 'Marketing Manager',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Vasishtha',
      subscription_type: 'premium',
      profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/4.jpg`
    },
    {
      id: '5',
      name: oppositeGender === 'female' ? 'Vidya Singh' : 'Vikram Singh',
      age: 29,
      gender: oppositeGender,
      height: 178,
      location: 'Jaipur, Rajasthan',
      education: 'B.Tech',
      profession: 'Software Developer',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Gautama',
      subscription_type: 'premium',
      profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/5.jpg`
    },
    {
      id: '6',
      name: oppositeGender === 'female' ? 'Deepika Nair' : 'Deepak Nair',
      age: 27,
      gender: oppositeGender,
      height: 164,
      location: 'Kochi, Kerala',
      education: 'MBBS',
      profession: 'Doctor',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Jamadagni',
      subscription_type: 'premium',
      profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/6.jpg`
    },
    {
      id: '7',
      name: oppositeGender === 'female' ? 'Aruna Reddy' : 'Arjun Reddy',
      age: 31,
      gender: oppositeGender,
      height: 180,
      location: 'Hyderabad, Telangana',
      education: 'M.Sc',
      profession: 'Research Scientist',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Vishwamitra',
      subscription_type: 'free',
      profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/7.jpg`
    },
    {
      id: '8',
      name: oppositeGender === 'female' ? 'Meera Joshi' : 'Mohan Joshi',
      age: 24,
      gender: oppositeGender,
      height: 158,
      location: 'Pune, Maharashtra',
      education: 'B.Com',
      profession: 'Accountant',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Angirasa',
      subscription_type: 'premium',
      profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/8.jpg`
    },
    {
      id: '9',
      name: oppositeGender === 'female' ? 'Kavita Menon' : 'Karthik Menon',
      age: 33,
      gender: oppositeGender,
      height: 176,
      location: 'Coimbatore, Tamil Nadu',
      education: 'MBA',
      profession: 'Business Analyst',
      religion: 'Hindu',
      caste: 'Brahmin',
      gotra: 'Bhrigu',
      subscription_type: 'premium',
      profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/9.jpg`
    }
  ];

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProfiles(mockProfiles);
      setTotal(mockProfiles.length);
      setLoading(false);
    }, 500);
  };

  // Search/Filter profiles
  const searchProfiles = () => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = [...mockProfiles];
      
      // Apply age filter
      filtered = filtered.filter(p => p.age >= ageRange[0] && p.age <= ageRange[1]);
      
      // Apply height filter
      filtered = filtered.filter(p => p.height >= heightRange[0] && p.height <= heightRange[1]);
      
      // Apply marital status filter
      if (maritalStatus) {
        // In real app, would filter by marital status
      }
      
      // Apply verified filter
      if (verifiedOnly) {
        filtered = filtered.filter(p => p.subscription_type === 'premium');
      }
      
      // Apply photos filter
      if (withPhotosOnly) {
        filtered = filtered.filter(p => p.profile_picture);
      }
      
      setProfiles(filtered);
      setTotal(filtered.length);
      setLoading(false);
      
      toast.success(`Found ${filtered.length} matching profiles`);
    }, 500);
  };

  // Reset filters
  const resetFilters = () => {
    setAgeRange([21, 35]);
    setHeightRange([150, 190]);
    setMaritalStatus('');
    setVerifiedOnly(false);
    setWithPhotosOnly(false);
    setProfiles(mockProfiles);
    setTotal(mockProfiles.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-[#FF4500] mb-2">Search Profiles</h1>
            <p className="text-gray-600">
              {loading ? 'Searching...' : `Found ${total} matching profiles`}
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
                  <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
                  <Slider
                    min={18}
                    max={60}
                    step={1}
                    value={ageRange}
                    onValueChange={setAgeRange}
                  />
                </div>

                {/* Height Range */}
                <div className="space-y-2">
                  <Label>Height (cm): {heightRange[0]} - {heightRange[1]}</Label>
                  <Slider
                    min={140}
                    max={200}
                    step={1}
                    value={heightRange}
                    onValueChange={setHeightRange}
                  />
                </div>

                {/* Marital Status */}
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="never_married">Never Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Verified Only */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="verified" 
                      checked={verifiedOnly}
                      onCheckedChange={(checked) => setVerifiedOnly(!!checked)}
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
                      checked={withPhotosOnly}
                      onCheckedChange={(checked) => setWithPhotosOnly(!!checked)}
                    />
                    <Label htmlFor="photos" className="text-sm">
                      With photos only
                    </Label>
                  </div>
                </div>

                {/* Search Button */}
                <Button
                  className="w-full bg-[#FF4500] hover:bg-[#E03E00] text-white"
                  onClick={searchProfiles}
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
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#FF4500]" />
                <p className="mt-4 text-gray-600">Loading profiles...</p>
              </div>
            ) : profiles.length === 0 ? (
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    showActions
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}