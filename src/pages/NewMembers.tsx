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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const NewMembers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newMembers, setNewMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  
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
...
            <div className={showFilters ? 'lg:col-span-2' : 'lg:col-span-3'}>
              {newMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newMembers.map((profile) => (
                  <ProfileCard 
                    key={profile.id}
                    profile={{
                      ...profile, 
                      joinedDate: profile.joinedDate,
                      gotra: profile.gotra || 'Gotra not specified'
                    }}
                    variant="new"
                    onAction={handleProfileAction}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <UserPlus className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No New Members This Week</h3>
                  <p className="text-gray-600 mb-6">Check back later for new profiles</p>
                  <Link to="/search">
                    <Button className="bg-purple-600 hover:bg-purple-700">
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