import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, UserPlus, Calendar, MapPin, Filter, Users, Clock } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

const NewMembers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newMembers, setNewMembers] = useState([]);
  const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);
    
    const itemsPerPageOptions = [9, 15, 21];

    useEffect(() => {
      if (!itemsPerPageOptions.includes(itemsPerPage)) {
        setItemsPerPage(itemsPerPageOptions[0]);
      }
    }, []);

    
    const [filterOnline, setFilterOnline] = useState(false);
  const [filterNewMember, setFilterNewMember] = useState(true);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterWithPhoto, setFilterWithPhoto] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const loadNewMembers = async () => {
      setLoading(true);
      
      const mockNewMembers = [
        {
          id: '1',
          name: 'Sita Agarwal',
          age: 24,
          gender: 'female',
          height: 160,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Kolkata, West Bengal',
          education: 'M.A',
          profession: 'Teacher',
          subscription_type: 'premium',
          joinedDate: '2 days ago',
          profileCompletion: 85,
          lastActive: '1 hour ago'
        },
        {
          id: '2',
          name: 'Rajesh Kumar',
          age: 31,
          gender: 'male',
          height: 177,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Lucknow, Uttar Pradesh',
          education: 'M.Tech',
          profession: 'Civil Engineer',
          subscription_type: 'premium',
          joinedDate: '1 day ago',
          profileCompletion: 92,
          lastActive: '30 minutes ago'
        },
        {
          id: '3',
          name: 'Deepika Nair',
          age: 26,
          gender: 'female',
          height: 164,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Kochi, Kerala',
          education: 'MBBS',
          profession: 'Doctor',
          subscription_type: 'premium',
          joinedDate: '3 hours ago',
          profileCompletion: 78,
          lastActive: '15 minutes ago'
        },
        {
          id: '4',
          name: 'Amit Sharma',
          age: 29,
          gender: 'male',
          height: 172,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Indore, Madhya Pradesh',
          education: 'CA',
          profession: 'Chartered Accountant',
          subscription_type: 'free',
          joinedDate: '1 week ago',
          profileCompletion: 65,
          lastActive: '2 hours ago'
        },
        {
          id: '5',
          name: 'Pooja Mishra',
          age: 27,
          gender: 'female',
          height: 158,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Varanasi, Uttar Pradesh',
          education: 'M.Sc',
          profession: 'Lab Technician',
          subscription_type: 'free',
          joinedDate: '4 days ago',
          profileCompletion: 70,
          lastActive: '1 day ago'
        },
        {
          id: '6',
          name: 'Karthik Raman',
          age: 28,
          gender: 'male',
          height: 176,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Coimbatore, Tamil Nadu',
          education: 'B.E',
          profession: 'Software Developer',
          subscription_type: 'premium',
          joinedDate: '5 days ago',
          profileCompletion: 88,
          lastActive: '4 hours ago'
        }
      ];

      setTimeout(() => {
        setNewMembers(mockNewMembers);
        setLoading(false);
      }, 1000);
    };

    loadNewMembers();
  }, [user]);

    const formatHeightInch = (cm: number) => {
      if (!cm) return "";
      return `${cm} cm`;
    };

    const filteredMembers = newMembers.filter((profile) => {
    if (filterOnline && profile.lastActive !== 'Online') {
      // Logic for online check if available
    }
    return true;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleProfileAction = (action: string, profileId: string) => {
    const targetProfile = newMembers.find(p => p.id === profileId);
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

  const resetFilters = () => {
    setFilterOnline(false);
    setFilterNewMember(true);
    setFilterVerified(false);
    setFilterWithPhoto(false);
    setSortBy('newest');
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-purple-600 mb-2 flex items-center">
              <UserPlus className="h-8 w-8 mr-3" />
              New Members
            </h1>
            <p className="text-gray-600">
              {newMembers.length} new members this week
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

            <div className="grid lg:grid-cols-3 gap-6">
              {showFilters && (
                <Card className="lg:col-span-1 h-fit">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-purple-700">Filters</h3>
                      <Button variant="ghost" size="sm" onClick={resetFilters} className="text-purple-600 h-8 px-2 hover:bg-purple-50">
                        Reset
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                        <Label htmlFor="new" className="text-sm font-medium cursor-pointer">Joined Recently</Label>
                        <Checkbox 
                          id="new" 
                          checked={filterNewMember} 
                          onCheckedChange={(checked) => setFilterNewMember(!!checked)}
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 [&_svg]:text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                          <Label htmlFor="online" className="text-sm cursor-pointer">Online Now</Label>
                          <Checkbox 
                            id="online" 
                            checked={filterOnline} 
                            onCheckedChange={(checked) => setFilterOnline(!!checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                          <Label htmlFor="verified" className="text-sm cursor-pointer">Verified Only</Label>
                          <Checkbox 
                            id="verified" 
                            checked={filterVerified} 
                            onCheckedChange={(checked) => setFilterVerified(!!checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                          <Label htmlFor="photo" className="text-sm cursor-pointer">With Photo</Label>
                          <Checkbox 
                            id="photo" 
                            checked={filterWithPhoto} 
                            onCheckedChange={(checked) => setFilterWithPhoto(!!checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <Label className="text-sm font-semibold mb-2 block text-gray-700">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="profileCompletion">Profile Completion</SelectItem>
                          <SelectItem value="age">Age: Low to High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
                  <div className={showFilters ? 'lg:col-span-2' : 'lg:col-span-3'}>
                  {filteredMembers.length > 0 ? (
                    <>
                            <div className={cn(
                              "grid gap-4",
                              showFilters 
                                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" 
                                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                            )}>
                              {currentMembers.map((profile) => {
                                return (
                                  <ProfileCard 
                                    key={profile.id}
                                    profile={{
                                      ...profile, 
                                      joinedDate: profile.joinedDate,
                                      height: formatHeightInch(profile.height),
                                      gotra: profile.gotra || 'Gotra not specified'
                                    }}
                                    variant="new"
                                    onAction={handleProfileAction}
                                  />
                                )
                              })}

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
                            itemsPerPageOptions={itemsPerPageOptions}
                          />
                        </div>

                    </>
                ) : (

              <Card className="text-center py-16">
                <CardContent>
                  <UserPlus className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No New Members This Week</h3>
                  <p className="text-gray-600 mb-6">Check back later for new profiles</p>
                    <Link to="/search">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                        Browse All Profiles
                      </Button>
                    </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMembers;