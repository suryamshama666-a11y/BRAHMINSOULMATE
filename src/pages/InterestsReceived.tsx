import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Check, X, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const InterestsReceived = () => {
  const { user } = useAuth();
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReceivedInterests = async () => {
      setLoading(true);
      
      // Mock data for received interests
      const mockReceivedInterests = [
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
          status: 'pending',
          receivedDate: '1 day ago',
          lastActive: '30 minutes ago',
          message: 'Hi! I found your profile interesting and would love to connect with you.'
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
          status: 'pending',
          receivedDate: '3 hours ago',
          lastActive: '1 hour ago',
          message: 'Hello! Your profile caught my attention. I would like to know more about you.'
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
          status: 'accepted',
          receivedDate: '1 week ago',
          lastActive: '2 hours ago',
          message: 'Hi there! I think we might be a good match. Looking forward to hearing from you.'
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
          status: 'declined',
          receivedDate: '4 days ago',
          lastActive: '1 day ago',
          message: 'Hello! I am interested in getting to know you better.'
        }
      ];

      setTimeout(() => {
        setReceivedInterests(mockReceivedInterests);
        setLoading(false);
      }, 1000);
    };

    loadReceivedInterests();
  }, [user]);

  const handleAccept = (profileId) => {
    setReceivedInterests(interests => 
      interests.map(interest => 
        interest.id === profileId 
          ? { ...interest, status: 'accepted' }
          : interest
      )
    );
  };

  const handleDecline = (profileId) => {
    setReceivedInterests(interests => 
      interests.map(interest => 
        interest.id === profileId 
          ? { ...interest, status: 'declined' }
          : interest
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
                  <Heart className="h-8 w-8 mr-3" />
                  Interests Received
                </h1>
                <p className="text-blue-100">People who have shown interest in your profile</p>
              </div>
              <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold">
                {receivedInterests.filter(i => i.status === 'pending').length} New
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-blue-100/50">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-blue-600">
                {receivedInterests.filter(i => i.status === 'pending').length}
              </h3>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-100/50">
            <CardContent className="p-6 text-center">
              <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-green-600">
                {receivedInterests.filter(i => i.status === 'accepted').length}
              </h3>
              <p className="text-sm text-gray-600">Accepted</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-red-100/50">
            <CardContent className="p-6 text-center">
              <X className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-red-600">
                {receivedInterests.filter(i => i.status === 'declined').length}
              </h3>
              <p className="text-sm text-gray-600">Declined</p>
            </CardContent>
          </Card>
        </div>

        {/* Received Interests List */}
        {receivedInterests.length > 0 ? (
          <div className="space-y-6">
            {receivedInterests.map((profile) => (
              <Card key={profile.id} className="border-2 border-blue-100/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-20 w-20 border-2 border-blue-200">
                        <AvatarImage 
                          src={`https://randomuser.me/api/portraits/${profile.gender === 'male' ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`}
                          alt={profile.name}
                        />
                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-xl">{profile.name}</h3>
                          <Badge className={`text-xs ${getStatusColor(profile.status)}`}>
                            {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                          <p><strong>Age:</strong> {profile.age} years</p>
                          <p><strong>Height:</strong> {profile.height}cm</p>
                          <p><strong>Location:</strong> {profile.location}</p>
                          <p><strong>Profession:</strong> {profile.profession}</p>
                        </div>
                        
                        {profile.message && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-gray-700 italic">"{profile.message}"</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <Badge variant={profile.subscription_type === 'premium' ? 'default' : 'outline'} className="text-xs">
                              {profile.subscription_type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Received {profile.receivedDate}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">Active {profile.lastActive}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:w-48">
                      <Link to={`/profile/${profile.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      
                      {profile.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleAccept(profile.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleDecline(profile.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                      
                      {profile.status === 'accepted' && (
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Interests Received Yet</h3>
              <p className="text-gray-600 mb-6">Complete your profile to attract more interests</p>
              <Link to="/profile/manage">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Complete Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InterestsReceived;