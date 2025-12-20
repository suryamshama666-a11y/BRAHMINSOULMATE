import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Clock, MapPin, Filter, Users, UserPlus } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const OnlineProfiles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onlineProfiles, setOnlineProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  
  const [filterOnline, setFilterOnline] = useState(true);
  const [filterNewMember, setFilterNewMember] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterWithPhoto, setFilterWithPhoto] = useState(false);
  const [sortBy, setSortBy] = useState('lastActive');

  useEffect(() => {
    const loadOnlineProfiles = async () => {
      setLoading(true);
      
      const mockOnlineProfiles = [
        {
          id: '1',
          name: 'Priya Sharma',
          age: 26,
          gender: 'female',
          height: 165,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Mumbai, Maharashtra',
          education: 'MBA',
          profession: 'Software Engineer',
          subscription_type: 'premium',
          onlineStatus: 'Online now',
          lastSeen: 'Active now'
        },
        {
          id: '2',
          name: 'Arjun Patel',
          age: 29,
          gender: 'male',
          height: 178,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Bangalore, Karnataka',
          education: 'M.Tech',
          profession: 'Data Scientist',
          subscription_type: 'premium',
          onlineStatus: 'Online now',
          lastSeen: 'Active now'
        },
        {
          id: '3',
          name: 'Kavya Iyer',
          age: 24,
          gender: 'female',
          height: 160,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Chennai, Tamil Nadu',
          education: 'CA',
          profession: 'Chartered Accountant',
          subscription_type: 'free',
          onlineStatus: 'Online now',
          lastSeen: 'Active 2 min ago'
        },
        {
          id: '4',
          name: 'Rohit Gupta',
          age: 31,
          gender: 'male',
          height: 175,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Delhi, NCR',
          education: 'MBA',
          profession: 'Marketing Manager',
          subscription_type: 'premium',
          onlineStatus: 'Online now',
          lastSeen: 'Active 5 min ago'
        },
        {
          id: '5',
          name: 'Ananya Reddy',
          age: 25,
          gender: 'female',
          height: 162,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Hyderabad, Telangana',
          education: 'M.Sc',
          profession: 'Research Scientist',
          subscription_type: 'premium',
          onlineStatus: 'Online now',
          lastSeen: 'Active 1 min ago'
        },
        {
          id: '6',
          name: 'Vikram Singh',
          age: 30,
          gender: 'male',
          height: 180,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Jaipur, Rajasthan',
          education: 'CA',
          profession: 'Financial Analyst',
          subscription_type: 'free',
          onlineStatus: 'Online now',
          lastSeen: 'Active 3 min ago'
        }
      ];

      setTimeout(() => {
        setOnlineProfiles(mockOnlineProfiles);
        setLoading(false);
      }, 1000);
    };

    loadOnlineProfiles();
  }, [user]);

  const handleProfileAction = (action: string, profileId: string) => {
    const targetProfile = onlineProfiles.find(p => p.id === profileId);
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
    setFilterOnline(true);
    setFilterNewMember(false);
    setFilterVerified(false);
    setFilterWithPhoto(false);
    setSortBy('lastActive');
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
            <h1 className="text-3xl font-serif text-green-600 mb-2 flex items-center">
              <div className="h-4 w-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              Online Profiles
            </h1>
            <p className="text-gray-600">
              {onlineProfiles.length} members online now
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
                      <h3 className="font-semibold text-lg text-green-700">Filters</h3>
                      <Button variant="ghost" size="sm" onClick={resetFilters} className="text-green-600 h-8 px-2 hover:bg-green-50">
                        Reset
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-green-50/50 rounded-lg border border-green-100">
                        <Label htmlFor="online" className="text-sm font-medium cursor-pointer">Online Now</Label>
                        <Checkbox 
                          id="online" 
                          checked={filterOnline} 
                          onCheckedChange={(checked) => setFilterOnline(!!checked)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                          <Label htmlFor="new" className="text-sm cursor-pointer">New Members</Label>
                          <Checkbox 
                            id="new" 
                            checked={filterNewMember} 
                            onCheckedChange={(checked) => setFilterNewMember(!!checked)}
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
                          <SelectItem value="lastActive">Last Active</SelectItem>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="age">Age: Low to High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
                <div className={cn(showFilters ? 'lg:col-span-2' : 'lg:col-span-3')}>
                {onlineProfiles.length > 0 ? (
                  <div className={cn("grid grid-cols-1 gap-4", showFilters ? "md:grid-cols-2" : "md:grid-cols-3")}>
                {onlineProfiles.map((profile) => (
                  <ProfileCard 
                    key={profile.id}
                    profile={{
                      ...profile, 
                      lastSeen: profile.lastSeen,
                      gotra: profile.gotra || 'Gotra not specified'
                    }}
                    variant="online"
                    onAction={handleProfileAction}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No One Online Right Now</h3>
                  <p className="text-gray-600 mb-6">Check back later or browse all profiles</p>
                    <Link to="/search">
                      <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md">
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

export default OnlineProfiles;