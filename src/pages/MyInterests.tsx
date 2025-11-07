import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Heart, Clock, CheckCircle, XCircle } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/contexts/AuthContext';

const MyInterests = () => {
  const { user } = useAuth();
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInterests = async () => {
      setLoading(true);
      
      // Mock data for sent interests
      const mockInterests = [
        {
          id: '1',
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
          status: 'pending',
          sentDate: '2 days ago',
          lastActive: '1 hour ago'
        },
        {
          id: '2',
          name: 'Rohit Gupta',
          age: 28,
          gender: 'male',
          height: 175,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Delhi, NCR',
          education: 'MBA',
          profession: 'Marketing Manager',
          subscription_type: 'premium',
          status: 'accepted',
          sentDate: '1 week ago',
          lastActive: '3 hours ago'
        },
        {
          id: '3',
          name: 'Meera Joshi',
          age: 27,
          gender: 'female',
          height: 158,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Pune, Maharashtra',
          education: 'B.Tech',
          profession: 'UI/UX Designer',
          subscription_type: 'free',
          status: 'declined',
          sentDate: '3 days ago',
          lastActive: '2 days ago'
        },
        {
          id: '4',
          name: 'Vikram Singh',
          age: 30,
          gender: 'male',
          height: 180,
          religion: 'Hindu',
          caste: 'Brahmin',
          location: 'Jaipur, Rajasthan',
          education: 'CA',
          profession: 'Financial Analyst',
          subscription_type: 'premium',
          status: 'pending',
          sentDate: '5 days ago',
          lastActive: '6 hours ago'
        }
      ];

      setTimeout(() => {
        setInterests(mockInterests);
        setLoading(false);
      }, 1000);
    };

    loadInterests();
  }, [user]);



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
          <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
                  <Heart className="h-8 w-8 mr-3" />
                  My Interests
                </h1>
                <p className="text-amber-100">Interests you've sent to other profiles</p>
              </div>
              <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold">
                {interests.length} Sent
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-green-100/50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-green-600">
                {interests.filter(i => i.status === 'accepted').length}
              </h3>
              <p className="text-sm text-gray-600">Accepted</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-yellow-100/50">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-yellow-600">
                {interests.filter(i => i.status === 'pending').length}
              </h3>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-red-100/50">
            <CardContent className="p-6 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-red-600">
                {interests.filter(i => i.status === 'declined').length}
              </h3>
              <p className="text-sm text-gray-600">Declined</p>
            </CardContent>
          </Card>
        </div>

        {/* Interests Grid */}
        {interests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interests.map((profile) => (
              <ProfileCard 
                key={profile.id}
                profile={{
                  ...profile, 
                  sentDate: profile.sentDate,
                  gotra: profile.gotra || 'Gotra not specified'
                }}
                variant="interest"
                onAction={(action, profileId) => {
                  if (action === 'expressInterest') {
                    console.log('Express interest for profile:', profileId);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Interests Sent Yet</h3>
              <p className="text-gray-600 mb-6">Start expressing interest in profiles you like</p>
              <Link to="/search">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Browse Profiles
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyInterests;
