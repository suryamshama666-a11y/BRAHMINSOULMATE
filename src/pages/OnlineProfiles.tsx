import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Clock, MapPin, Filter, Users, UserPlus } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/contexts/AuthContext';
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

        <div className="grid md:grid-cols-4 gap-6">
          {showFilters && (
            <Card className="md:col-span-1 h-fit">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-green-600">
                    Reset
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quick Filters</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <Checkbox checked={filterOnline} onCheckedChange={(c) => setFilterOnline(!!c)} />
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <Label className="text-sm cursor-pointer">Live Now</Label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                      <Checkbox checked={filterNewMember} onCheckedChange={(c) => setFilterNewMember(!!c)} />
                      <div className="flex items-center gap-1">
                        <UserPlus className="h-3 w-3 text-purple-600" />
                        <Label className="text-sm cursor-pointer">New Members</Label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                      <Checkbox checked={filterVerified} onCheckedChange={(c) => setFilterVerified(!!c)} />
                      <Label className="text-sm cursor-pointer">Verified Only</Label>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <Checkbox checked={filterWithPhoto} onCheckedChange={(c) => setFilterWithPhoto(!!c)} />
                      <Label className="text-sm cursor-pointer">With Photo</Label>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastActive">Last Active</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="profileComplete">Profile Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-3">
                  <Label className="text-sm font-medium">Browse By</Label>
                  <div className="mt-2 space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/new-members')}>
                      <UserPlus className="h-4 w-4 mr-2 text-purple-600" />
                      New Members
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/search')}>
                      <Users className="h-4 w-4 mr-2 text-orange-600" />
                      All Profiles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className={showFilters ? 'md:col-span-3' : 'md:col-span-4'}>
            {onlineProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Button className="bg-green-600 hover:bg-green-700">
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