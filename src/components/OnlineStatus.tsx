import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Circle, MessageCircle, Heart, Eye, Clock, 
  MapPin, GraduationCap, Briefcase 
} from 'lucide-react';
import { Link } from 'react-router-dom';

type OnlineProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  education: string;
  profession: string;
  profilePicture: string;
  lastSeen: string;
  isOnline: boolean;
  isPremium: boolean;
  compatibility: number;
};

type OnlineStatusProps = {
  profiles?: OnlineProfile[];
  showAll?: boolean;
  maxProfiles?: number;
};

const mockOnlineProfiles: OnlineProfile[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    age: 28,
    location: 'Mumbai, Maharashtra',
    education: 'MBA',
    profession: 'Software Engineer',
    profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
    lastSeen: 'Online now',
    isOnline: true,
    isPremium: true,
    compatibility: 95
  },
  {
    id: '2',
    name: 'Anjali Patel',
    age: 26,
    location: 'Bangalore, Karnataka',
    education: 'M.Tech',
    profession: 'Data Scientist',
    profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastSeen: 'Online now',
    isOnline: true,
    isPremium: false,
    compatibility: 88
  },
  {
    id: '3',
    name: 'Kavya Iyer',
    age: 25,
    location: 'Chennai, Tamil Nadu',
    education: 'CA',
    profession: 'Chartered Accountant',
    profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
    lastSeen: '2 minutes ago',
    isOnline: false,
    isPremium: true,
    compatibility: 92
  },
  {
    id: '4',
    name: 'Meera Gupta',
    age: 29,
    location: 'Delhi, NCR',
    education: 'MBBS',
    profession: 'Doctor',
    profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
    lastSeen: 'Online now',
    isOnline: true,
    isPremium: true,
    compatibility: 90
  },
  {
    id: '5',
    name: 'Riya Joshi',
    age: 27,
    location: 'Pune, Maharashtra',
    education: 'M.Sc',
    profession: 'Research Scientist',
    profilePicture: 'https://randomuser.me/api/portraits/women/5.jpg',
    lastSeen: '5 minutes ago',
    isOnline: false,
    isPremium: false,
    compatibility: 85
  }
];

export default function OnlineStatus({ 
  profiles = mockOnlineProfiles, 
  showAll = false,
  maxProfiles = 4 
}: OnlineStatusProps) {
  const displayProfiles = showAll ? profiles : profiles.slice(0, maxProfiles);
  const onlineCount = profiles.filter(p => p.isOnline).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Circle className="h-5 w-5 text-green-500 fill-current" />
              <div className="absolute inset-0 animate-ping">
                <Circle className="h-5 w-5 text-green-400 fill-current opacity-75" />
              </div>
            </div>
            Online Members
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {onlineCount} online
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayProfiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center space-x-4 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {/* Profile Picture with Online Indicator */}
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.profilePicture} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {profile.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
                {profile.isPremium && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">★</span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{profile.name}</h4>
                  <span className="text-sm text-gray-500">({profile.age})</span>
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {profile.compatibility}% match
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <GraduationCap className="h-3 w-3" />
                    <span className="truncate">{profile.education}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate">{profile.profession}</span>
                  </div>
                </div>

                {/* Last Seen */}
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className={`text-xs ${profile.isOnline ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {profile.lastSeen}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1">
                <Link to={`/profile/${profile.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* View All Button */}
          {!showAll && profiles.length > maxProfiles && (
            <div className="text-center pt-4 border-t">
              <Link to="/online">
                <Button variant="outline" className="w-full">
                  View All Online Members ({profiles.length})
                </Button>
              </Link>
            </div>
          )}

          {/* Online Stats */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-800 font-medium">
                {onlineCount} members online now
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-xs">Live updates</span>
              </div>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Best time to connect and get instant responses!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
