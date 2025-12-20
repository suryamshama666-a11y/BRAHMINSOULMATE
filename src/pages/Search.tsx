import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ProfileCard from '@/components/ProfileCard';
import { Search as SearchIcon, Filter, Loader2, ChevronDown, ChevronUp, Save, MapPin, Briefcase, GraduationCap, Heart, Star, Users, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import LocationSearch from '@/components/search/LocationSearch';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { interestsService } from '@/services/api';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 6;

const COUNTRIES = [
  { value: 'india', label: 'India' },
  { value: 'usa', label: 'USA' },
  { value: 'uk', label: 'UK' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'new_zealand', label: 'New Zealand' },
  { value: 'ireland', label: 'Ireland' },
  { value: 'europe', label: 'Europe' },
];

const GOTRAS = [
  'Agastya', 'Angirasa', 'Atri', 'Bharadwaja', 'Bhargava', 'Bhrigu',
  'Dhanvantari', 'Gautama', 'Gritsamada', 'Jamadagni', 'Kaashyapa', 'Kaushika',
  'Kutsa', 'Maitreya', 'Marichi', 'Mudgala', 'Parashar', 'Pulaha',
  'Pulastya', 'Sankrithi', 'Shandilya', 'Upamanyu', 'Vasishtha', 'Vatsa',
  'Vishvamitra', 'Other'
];

const BRAHMIN_COMMUNITIES = [
  'Adi Gaur', 'Anavil', 'Andhra Brahmin', 'Babburu', 'Bardai', 'Barendra',
  'Bhatt', 'Bhumihar', 'Chitpavan', 'Dadhich', 'Daivadnya', 'Danua',
  'Deshastha', 'Devarukhe', 'Dhima', 'Dravida', 'Gaur', 'Gowd Saraswat',
  'Gurukkal', 'Havyaka', 'Hoysala', 'Iyer', 'Iyengar', 'Jangid', 'Jhadua',
  'Jyotish', 'Kanyakubja', 'Karhade', 'Kashmiri Pandit', 'Kokanastha',
  'Kota', 'Kulin', 'Maithil', 'Nagar', 'Namboodiri', 'Niyogi', 'Panda',
  'Rarhi', 'Rigvedi', 'Sakaldwipi', 'Sanadya', 'Sanketi', 'Saryuparin',
  'Smartha', 'Sri Vaishnava', 'Sthanika', 'Tyagi', 'Uriya', 'Vaidiki',
  'Velanadu', 'Viswa', 'Other'
];

const OCCUPATIONS = [
  { value: 'software_engineer', label: 'Software Engineer / IT' },
  { value: 'doctor', label: 'Doctor / Medical' },
  { value: 'engineer', label: 'Engineer (Non-IT)' },
  { value: 'ca_accountant', label: 'CA / Accountant' },
  { value: 'lawyer', label: 'Lawyer / Legal' },
  { value: 'teacher_professor', label: 'Teacher / Professor' },
  { value: 'government_employee', label: 'Government Employee' },
  { value: 'civil_services', label: 'Civil Services (IAS/IPS)' },
  { value: 'banker', label: 'Banker / Finance' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'scientist', label: 'Scientist / Researcher' },
  { value: 'defense', label: 'Defense / Armed Forces' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'manager', label: 'Manager / Executive' },
  { value: 'other', label: 'Other' },
];

const EDUCATION_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: 'Bachelors' },
  { value: 'masters', label: 'Masters' },
  { value: 'phd', label: 'PhD / Doctorate' },
  { value: 'professional', label: 'Professional (CA/CS/MBBS)' },
];

const MARRIAGE_TIMELINE = [
  { value: '3_months', label: 'Within 3 months' },
  { value: '6_months', label: 'Within 6 months' },
  { value: '1_year', label: 'Within 1 year' },
  { value: '2_years', label: 'Within 2 years' },
  { value: 'not_decided', label: 'Not Decided' },
  { value: 'flexible', label: 'Flexible' },
];

const INCOME_RANGES = {
  INR: [
    { value: '0-300000', label: 'Below 3 Lakhs' },
    { value: '300000-500000', label: '3-5 Lakhs' },
    { value: '500000-1000000', label: '5-10 Lakhs' },
    { value: '1000000-2000000', label: '10-20 Lakhs' },
    { value: '2000000-5000000', label: '20-50 Lakhs' },
    { value: '5000000-10000000', label: '50L - 1 Crore' },
    { value: '10000000+', label: 'Above 1 Crore' },
  ],
  USD: [
    { value: '0-30000', label: 'Below $30K' },
    { value: '30000-50000', label: '$30K - $50K' },
    { value: '50000-75000', label: '$50K - $75K' },
    { value: '75000-100000', label: '$75K - $100K' },
    { value: '100000-150000', label: '$100K - $150K' },
    { value: '150000-250000', label: '$150K - $250K' },
    { value: '250000+', label: 'Above $250K' },
  ],
  GBP: [
    { value: '0-25000', label: 'Below £25K' },
    { value: '25000-40000', label: '£25K - £40K' },
    { value: '40000-60000', label: '£40K - £60K' },
    { value: '60000-80000', label: '£60K - £80K' },
    { value: '80000+', label: 'Above £80K' },
  ],
};

const RASHIS = [
  'Aries (Mesh)', 'Taurus (Vrishabh)', 'Gemini (Mithun)', 'Cancer (Kark)',
  'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchik)',
  'Sagittarius (Dhanu)', 'Capricorn (Makar)', 'Aquarius (Kumbh)', 'Pisces (Meen)'
];

export default function Search() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [basicOpen, setBasicOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [occupationOpen, setOccupationOpen] = useState(false);
  const [horoscopeOpen, setHoroscopeOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const [ageRange, setAgeRange] = useState([21, 35]);
  const [heightRange, setHeightRange] = useState([150, 190]);
  const [maritalStatus, setMaritalStatus] = useState('any');
  const [marriageTimeline, setMarriageTimeline] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [recentlyActive, setRecentlyActive] = useState(false);

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedGotras, setSelectedGotras] = useState<string[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string[]>([]);
  
  const [incomeCurrency, setIncomeCurrency] = useState('INR');
  const [incomeRange, setIncomeRange] = useState('');

  const [manglikStatus, setManglikStatus] = useState('any');
  const [selectedRashi, setSelectedRashi] = useState('');

  const [gotraSearch, setGotraSearch] = useState('');
  const [communitySearch, setCommunitySearch] = useState('');
  const [occupationSearch, setOccupationSearch] = useState('');

  const [saveSearchName, setSaveSearchName] = useState('');

  const { data: sentInterests = [] } = useQuery({
    queryKey: ['interests', 'sent', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      return await interestsService.getSentInterests();
    },
    enabled: !!profile?.id
  });

  const handleProfileAction = (action: string, profileId: string) => {
    const targetProfile = profiles.find(p => p.id === profileId);
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

  const userGender = profile?.gender || 'male';
  const oppositeGender = userGender === 'male' ? 'female' : 'male';

  const mockProfiles = [
    { id: '1', name: oppositeGender === 'female' ? 'Priya Sharma' : 'Raj Sharma', age: 26, gender: oppositeGender, height: 165, location: 'Mumbai, Maharashtra', education: 'MBA', profession: 'Software Engineer', religion: 'Hindu', caste: 'Brahmin', gotra: 'Bharadwaja', subscription_type: 'premium', profile_picture: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: '2', name: oppositeGender === 'female' ? 'Anjali Patel' : 'Arjun Patel', age: 28, gender: oppositeGender, height: 162, location: 'Bangalore, Karnataka', education: 'M.Tech', profession: 'Data Scientist', religion: 'Hindu', caste: 'Brahmin', gotra: 'Kashyapa', subscription_type: 'premium', profile_picture: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: '3', name: oppositeGender === 'female' ? 'Kavya Iyer' : 'Karthik Iyer', age: 25, gender: oppositeGender, height: 160, location: 'Chennai, Tamil Nadu', education: 'CA', profession: 'Chartered Accountant', religion: 'Hindu', caste: 'Brahmin', gotra: 'Atri', subscription_type: 'free', profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/3.jpg` },
    { id: '4', name: oppositeGender === 'female' ? 'Rohini Gupta' : 'Rohit Gupta', age: 30, gender: oppositeGender, height: 175, location: 'Delhi, NCR', education: 'MBA', profession: 'Marketing Manager', religion: 'Hindu', caste: 'Brahmin', gotra: 'Vasishtha', subscription_type: 'premium', profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/4.jpg` },
    { id: '5', name: oppositeGender === 'female' ? 'Vidya Singh' : 'Vikram Singh', age: 29, gender: oppositeGender, height: 178, location: 'Jaipur, Rajasthan', education: 'B.Tech', profession: 'Software Developer', religion: 'Hindu', caste: 'Brahmin', gotra: 'Gautama', subscription_type: 'premium', profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/5.jpg` },
    { id: '6', name: oppositeGender === 'female' ? 'Deepika Nair' : 'Deepak Nair', age: 27, gender: oppositeGender, height: 164, location: 'Kochi, Kerala', education: 'MBBS', profession: 'Doctor', religion: 'Hindu', caste: 'Brahmin', gotra: 'Jamadagni', subscription_type: 'premium', profile_picture: `https://randomuser.me/api/portraits/${oppositeGender === 'female' ? 'women' : 'men'}/6.jpg` },
  ];

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    setLoading(true);
    setTimeout(() => {
      setProfiles(mockProfiles);
      setTotal(mockProfiles.length);
      setLoading(false);
    }, 500);
  };

  const searchProfiles = () => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = [...mockProfiles];
      filtered = filtered.filter(p => p.age >= ageRange[0] && p.age <= ageRange[1]);
      filtered = filtered.filter(p => p.height >= heightRange[0] && p.height <= heightRange[1]);
      if (verifiedOnly) filtered = filtered.filter(p => p.subscription_type === 'premium');
      if (withPhotosOnly) filtered = filtered.filter(p => p.profile_picture);
      if (selectedGotras.length > 0) filtered = filtered.filter(p => selectedGotras.includes(p.gotra));
      
      setProfiles(filtered);
      setTotal(filtered.length);
      setLoading(false);
      toast.success(`Found ${filtered.length} matching profiles`);
    }, 500);
  };

  const resetFilters = () => {
    setAgeRange([21, 35]);
    setHeightRange([150, 190]);
    setMaritalStatus('any');
    setMarriageTimeline('');
    setVerifiedOnly(false);
    setWithPhotosOnly(false);
    setOnlineOnly(false);
    setRecentlyActive(false);
    setSelectedCountries([]);
    setSelectedGotras([]);
    setSelectedCommunities([]);
    setSelectedOccupations([]);
    setSelectedEducation([]);
    setIncomeCurrency('INR');
    setIncomeRange('');
    setManglikStatus('any');
    setSelectedRashi('');
    setProfiles(mockProfiles);
    setTotal(mockProfiles.length);
  };

  const handleLocationSearch = (params: { location: string; distance: number; useCurrentLocation: boolean }) => {
    toast.success(`Searching within ${params.distance}km of ${params.location}`);
  };

  const toggleArrayItem = (arr: string[], setArr: (val: string[]) => void, value: string) => {
    if (arr.includes(value)) {
      setArr(arr.filter(item => item !== value));
    } else {
      setArr([...arr, value]);
    }
  };

  const saveSearch = () => {
    if (saveSearchName.trim()) {
      toast.success(`Search "${saveSearchName}" saved successfully!`);
      setSaveSearchName('');
    }
  };

  const filteredGotras = GOTRAS.filter(g => g.toLowerCase().includes(gotraSearch.toLowerCase()));
  const filteredCommunities = BRAHMIN_COMMUNITIES.filter(c => c.toLowerCase().includes(communitySearch.toLowerCase()));
  const filteredOccupations = OCCUPATIONS.filter(o => o.label.toLowerCase().includes(occupationSearch.toLowerCase()));
  const currentIncomeRanges = INCOME_RANGES[incomeCurrency as keyof typeof INCOME_RANGES] || INCOME_RANGES.INR;

  const FilterSection = ({ title, icon: Icon, open, setOpen, children }: { title: string; icon: any; open: boolean; setOpen: (val: boolean) => void; children: React.ReactNode }) => (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left font-medium text-gray-700 hover:text-[#FF4500]">
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

  const filteredProfiles = profiles.filter(p => {
    const searchLower = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower) ||
        p.profession.toLowerCase().includes(searchLower)
      );
    });

    const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
    const currentProfiles = filteredProfiles.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif text-[#FF4500] mb-2">Search Profiles</h1>
              <p className="text-gray-600">
                {loading ? 'Searching...' : `Found ${total} matching profiles`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow sm:w-64">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search name, location..."
                  className="pl-9 pr-9 h-10 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 h-10 whitespace-nowrap"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {/* Interest Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-green-100/50 shadow-sm bg-white/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                <h3 className="text-xl font-bold text-green-600">
                  {sentInterests.filter(i => i.status === 'accepted').length}
                </h3>
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Accepted</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-yellow-100/50 shadow-sm bg-white/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                <h3 className="text-xl font-bold text-yellow-600">
                  {sentInterests.filter(i => i.status === 'pending').length}
                </h3>
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Pending</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-red-100/50 shadow-sm bg-white/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                <h3 className="text-xl font-bold text-red-600">
                  {sentInterests.filter(i => i.status === 'declined').length}
                </h3>
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Declined</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {showFilters && (
              <Card className="md:col-span-1 h-fit">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-[#FF4500]">
                      Reset All
                    </Button>
                  </div>

                  <FilterSection title="Basic Filters" icon={Filter} open={basicOpen} setOpen={setBasicOpen}>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Age: {ageRange[0]} - {ageRange[1]}</Label>
                        <Slider min={18} max={60} step={1} value={ageRange} onValueChange={setAgeRange} className="mt-2" />
                      </div>
                      <div>
                        <Label className="text-sm">Height (cm): {heightRange[0]} - {heightRange[1]}</Label>
                        <Slider min={140} max={200} step={1} value={heightRange} onValueChange={setHeightRange} className="mt-2" />
                      </div>
                      <div>
                        <Label className="text-sm">Marital Status</Label>
                        <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="never_married">Never Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Marriage Timeline</Label>
                        <Select value={marriageTimeline} onValueChange={setMarriageTimeline}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select timeline" /></SelectTrigger>
                          <SelectContent>
                            {MARRIAGE_TIMELINE.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </FilterSection>

                  <div className="border-t pt-3">
                    <FilterSection title="Location" icon={MapPin} open={locationOpen} setOpen={setLocationOpen}>
                      <LocationSearch onSearch={handleLocationSearch} />
                      <Label className="text-sm mt-3 block">Country</Label>
                      <div className="max-h-32 overflow-y-auto border rounded p-2 mt-1 space-y-1">
                        {COUNTRIES.map(country => (
                          <div key={country.value} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedCountries.includes(country.value)}
                              onCheckedChange={() => toggleArrayItem(selectedCountries, setSelectedCountries, country.value)}
                            />
                            <Label className="text-sm cursor-pointer">{country.label}</Label>
                          </div>
                        ))}
                      </div>
                    </FilterSection>
                  </div>

                  <div className="border-t pt-3">
                    <FilterSection title="Community & Gotra" icon={Users} open={communityOpen} setOpen={setCommunityOpen}>
                      <div>
                        <Label className="text-sm">Gotra</Label>
                        <Input placeholder="Search gotra..." value={gotraSearch} onChange={e => setGotraSearch(e.target.value)} className="mt-1 h-8" />
                        <div className="max-h-32 overflow-y-auto border rounded p-2 mt-1 space-y-1">
                          {filteredGotras.map(gotra => (
                            <div key={gotra} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedGotras.includes(gotra)}
                                onCheckedChange={() => toggleArrayItem(selectedGotras, setSelectedGotras, gotra)}
                              />
                              <Label className="text-xs cursor-pointer">{gotra}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-sm">Brahmin Community</Label>
                        <Input placeholder="Search community..." value={communitySearch} onChange={e => setCommunitySearch(e.target.value)} className="mt-1 h-8" />
                        <div className="max-h-32 overflow-y-auto border rounded p-2 mt-1 space-y-1">
                          {filteredCommunities.map(community => (
                            <div key={community} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedCommunities.includes(community)}
                                onCheckedChange={() => toggleArrayItem(selectedCommunities, setSelectedCommunities, community)}
                              />
                              <Label className="text-xs cursor-pointer">{community}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FilterSection>
                  </div>

                  <div className="border-t pt-3">
                    <FilterSection title="Occupation & Income" icon={Briefcase} open={occupationOpen} setOpen={setOccupationOpen}>
                      <div>
                        <Label className="text-sm">Occupation</Label>
                        <Input placeholder="Search occupation..." value={occupationSearch} onChange={e => setOccupationSearch(e.target.value)} className="mt-1 h-8" />
                        <div className="max-h-32 overflow-y-auto border rounded p-2 mt-1 space-y-1">
                          {filteredOccupations.map(occ => (
                            <div key={occ.value} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedOccupations.includes(occ.value)}
                                onCheckedChange={() => toggleArrayItem(selectedOccupations, setSelectedOccupations, occ.value)}
                              />
                              <Label className="text-xs cursor-pointer">{occ.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-sm">Education</Label>
                        <div className="max-h-32 overflow-y-auto border rounded p-2 mt-1 space-y-1">
                          {EDUCATION_LEVELS.map(edu => (
                            <div key={edu.value} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedEducation.includes(edu.value)}
                                onCheckedChange={() => toggleArrayItem(selectedEducation, setSelectedEducation, edu.value)}
                              />
                              <Label className="text-xs cursor-pointer">{edu.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-sm">Annual Income</Label>
                        <div className="flex gap-2 mt-1">
                          <Select value={incomeCurrency} onValueChange={setIncomeCurrency}>
                            <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">₹ INR</SelectItem>
                              <SelectItem value="USD">$ USD</SelectItem>
                              <SelectItem value="GBP">£ GBP</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={incomeRange} onValueChange={setIncomeRange}>
                            <SelectTrigger className="flex-1 h-8"><SelectValue placeholder="Select range" /></SelectTrigger>
                            <SelectContent>
                              {currentIncomeRanges.map(r => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </FilterSection>
                  </div>

                  <div className="border-t pt-3">
                    <FilterSection title="Horoscope" icon={Star} open={horoscopeOpen} setOpen={setHoroscopeOpen}>
                      <div>
                        <Label className="text-sm">Manglik Status</Label>
                        <Select value={manglikStatus} onValueChange={setManglikStatus}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="manglik">Manglik</SelectItem>
                            <SelectItem value="non_manglik">Non-Manglik</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-3">
                        <Label className="text-sm">Rashi</Label>
                        <Select value={selectedRashi} onValueChange={setSelectedRashi}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select Rashi" /></SelectTrigger>
                          <SelectContent>
                            {RASHIS.map(rashi => (
                              <SelectItem key={rashi} value={rashi}>{rashi}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FilterSection>
                  </div>

                  <div className="border-t pt-3">
                    <FilterSection title="Preferences" icon={Heart} open={preferencesOpen} setOpen={setPreferencesOpen}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <Checkbox checked={onlineOnly} onCheckedChange={(c) => setOnlineOnly(!!c)} />
                          <Label className="text-sm cursor-pointer">Online Now</Label>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                          <Checkbox checked={verifiedOnly} onCheckedChange={(c) => setVerifiedOnly(!!c)} />
                          <Label className="text-sm cursor-pointer">Verified Only</Label>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                          <Checkbox checked={recentlyActive} onCheckedChange={(c) => setRecentlyActive(!!c)} />
                          <Label className="text-sm cursor-pointer">Active (7 days)</Label>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                          <Checkbox checked={withPhotosOnly} onCheckedChange={(c) => setWithPhotosOnly(!!c)} />
                          <Label className="text-sm cursor-pointer">With Photos Only</Label>
                        </div>
                      </div>
                    </FilterSection>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Save search as..."
                        value={saveSearchName}
                        onChange={e => setSaveSearchName(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button size="sm" variant="outline" onClick={saveSearch} disabled={!saveSearchName.trim()} className="h-8">
                        <Save className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      className="w-full bg-[#FF4500] hover:bg-[#E03E00] text-white"
                      onClick={searchProfiles}
                      disabled={loading}
                    >
                      {loading ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Searching...</>
                      ) : (
                        <><SearchIcon className="h-4 w-4 mr-2" />Search</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className={showFilters ? 'md:col-span-3' : 'md:col-span-4'}>
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#FF4500]" />
                  <p className="mt-4 text-gray-600">Loading profiles...</p>
                </div>
              ) : filteredProfiles.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No profiles found</h3>
                      <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
                      <Button variant="outline" onClick={() => { resetFilters(); setSearchTerm(''); }} className="text-[#FF4500]">Reset All</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className={cn(
                      "grid gap-4",
                      showFilters 
                        ? "grid-cols-1 lg:grid-cols-2" 
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    )}>
                      {currentProfiles.map(profile => (
                        <ProfileCard key={profile.id} profile={profile} showActions onAction={handleProfileAction} />
                      ))}
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}

            </div>
          </div>
        </main>
        <Footer />
      </div>
    );

}