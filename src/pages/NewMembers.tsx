import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, UserPlus, Calendar, MapPin } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const NewMembers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newMembers, setNewMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNewMembers = async () => {
      setLoading(true);
      
      // Mock data for new members
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

  const getProfileCompletionColor = (completion) => {
    if (completion >= 80) return 'text-green-600 bg-green-100';
    if (completion >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
                  <UserPlus className="h-8 w-8 mr-3" />
                  New Members
                </h1>
                <p className="text-purple-100">Recently joined members looking for their perfect match</p>
              </div>
              <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold">
                {newMembers.length} New This Week
              </Badge>
            </div>
          </div>
        </div>

        {/* New Member Info */}
        <div className="mb-6">
          <Card className="border-2 border-purple-100/50 bg-purple-50/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-purple-700">
                <UserPlus className="h-5 w-5" />
                <p className="text-sm font-medium">
                  Be among the first to connect with these new members and make a great first impression!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Members Grid */}
        {newMembers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  );
};

export default NewMembers;