
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Heart, MessageCircle, Video, Phone, MapPin, Briefcase,
  GraduationCap, Clock
} from 'lucide-react';
import { Profile } from '@/data/profiles';

interface OnlineProfileCardProps {
  profile: Profile;
  onStartChat: (profileId: string, profileName: string) => void;
  onVideoCall: (profileId: string, profileName: string) => void;
  onPhoneCall: (profileId: string, profileName: string) => void;
  onSendInterest: (profileName: string) => void;
}

export const OnlineProfileCard = ({
  profile,
  onStartChat,
  onVideoCall,
  onPhoneCall,
  onSendInterest
}: OnlineProfileCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-red-100/50 hover:border-red-300/50 group">
      <div className="relative">
        <Link to={`/profile/${profile.id}`}>
          <div className="aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-red-50/50">
            <img 
              src={profile.images[0]} 
              alt={profile.name}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
        
        <div className="absolute top-4 left-4">
          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
            Online
          </Badge>
        </div>

        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 flex items-center text-xs text-gray-600">
            <Clock className="h-3 w-3 mr-1" />
            Active now
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <Link to={`/profile/${profile.id}`}>
          <h3 className="font-bold text-xl hover:text-red-600 transition-colors mb-2">
            {profile.name}, {profile.age}
          </h3>
        </Link>
        
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-red-500" />
            <span>{profile.location.city}, {profile.location.state}</span>
          </div>
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-amber-500" />
            <span className="font-medium">{profile.employment.profession}</span>
          </div>
          <div className="flex items-center">
            <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
            <span>{profile.education[0]?.degree}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="text-xs border-red-200 text-red-600">
            {profile.family.gotra || 'Gotra: N/A'}
          </Badge>
          {profile.horoscope?.rashi && (
            <Badge variant="outline" className="text-xs border-amber-200 text-amber-600">
              {profile.horoscope.rashi}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              onStartChat(profile.id, profile.name);
            }}
            className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          
          <Button 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              onVideoCall(profile.id, profile.name);
            }}
            className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white transition-all duration-300 transform hover:scale-105"
          >
            <Video className="h-4 w-4" />
          </Button>

          <Button 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              onPhoneCall(profile.id, profile.name);
            }}
            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white transition-all duration-300 transform hover:scale-105"
          >
            <Phone className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3">
          <Button 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              onSendInterest(profile.name);
            }}
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 transition-all duration-300"
          >
            <Heart className="h-4 w-4 mr-1" />
            Send Interest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
