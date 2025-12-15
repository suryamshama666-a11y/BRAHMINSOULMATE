import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Star, HeartOff } from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MyFavorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      
      // Mock data for favorites
      const mockFavorites = [
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
          lastActive: '2 hours ago',
          addedToFavorites: '3 days ago'
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
          lastActive: '1 day ago',
          addedToFavorites: '1 week ago'
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
          lastActive: '5 hours ago',
          addedToFavorites: '2 days ago'
        }
      ];

      setTimeout(() => {
        setFavorites(mockFavorites);
        setLoading(false);
      }, 1000);
    };

    loadFavorites();
  }, [user]);

  const removeFavorite = (profileId) => {
    setFavorites(favorites.filter(fav => fav.id !== profileId));
    toast.success('Removed from favorites');
  };

  const handleProfileAction = (action: string, profileId: string) => {
    const targetProfile = favorites.find(p => p.id === profileId);
    const profileName = targetProfile?.name || 'User';
    
    switch(action) {
      case 'removeFavorite':
        removeFavorite(profileId);
        break;
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
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
                  <Heart className="h-8 w-8 mr-3" />
                  My Favorites
                </h1>
                <p className="text-red-100">Profiles you've marked as favorites</p>
              </div>
              <Badge className="bg-white text-gray-800 px-4 py-2 font-semibold">
                {favorites.length} Favorites
              </Badge>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {favorites.map((profile) => (
              <ProfileCard 
                key={profile.id}
                profile={{
                  ...profile, 
                  addedToFavorites: profile.addedToFavorites,
                  gotra: profile.gotra || 'Gotra not specified'
                }}
                variant="favorite"
                onAction={handleProfileAction}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Favorites Yet</h3>
              <p className="text-gray-600 mb-6">Start adding profiles to your favorites to see them here</p>
              <Link to="/search">
                <Button className="bg-red-600 hover:bg-red-700">
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

export default MyFavorites;