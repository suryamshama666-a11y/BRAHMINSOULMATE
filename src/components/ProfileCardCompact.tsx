import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserRound, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  MessageSquare, 
  CheckCircle, 
  Star,
  Phone
} from 'lucide-react';
import { Button } from './ui/button';

// Create a more flexible type that accepts either our standard Profile or a simplified structure
interface ProfileCardData {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  age?: number | string;
  profilePicture?: string;
  location?: any; // Accept either string or ProfileLocation
  city?: string;
  occupation?: string;
  education_level?: string;
  gotra?: string;
  rashi?: string;
  is_verified?: boolean;
  subscriptionStatus?: string;
  [key: string]: any; // Allow other properties
}

interface ProfileCardCompactProps {
  profile: ProfileCardData;
  onLike?: (profileId: string) => void;
  onMessage?: (profileId: string) => void;
}

export const ProfileCardCompact: React.FC<ProfileCardCompactProps> = ({ 
  profile,
  onLike,
  onMessage
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike(profile.id);
  };

  const handleMessage = () => {
    if (onMessage) onMessage(profile.id);
  };

  // Helper function to get location string
  const getLocationDisplay = () => {
    if (typeof profile.location === 'string') return profile.location;
    if (profile.city) return profile.city;
    if (profile.location?.city) return profile.location.city;
    return 'Location';
  };

  return (
    <div className="flex gap-4 p-4 border rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white">
      {/* Left: Profile Image with Premium badge if applicable */}
      <div className="relative">
        <img 
          src={profile.profilePicture || '/placeholder.svg'} 
          alt={profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`}
          className="w-20 h-24 object-cover rounded-xl" 
        />
        {profile.subscriptionStatus && profile.subscriptionStatus !== 'free' && (
          <span className="absolute -top-2 -right-2 bg-amber-400 text-white rounded-full p-1">
            <Star className="w-3 h-3" />
          </span>
        )}
      </div>
      
      {/* Right: Profile Details */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-base">
            {profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`}, {profile.age || '30'} 
            {profile.is_verified && <CheckCircle className="inline-block w-4 h-4 ml-1 text-blue-500" />}
          </h3>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1 my-1">
          <p className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {getLocationDisplay()}
          </p>
          <p className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> {profile.occupation || profile.employment?.profession || 'Profession'}
          </p>
          <p className="flex items-center gap-1 text-xs">
            <GraduationCap className="w-3 h-3" /> 
            {profile.education_level || 'Education'} 
            {profile.gotra && ` | ${profile.gotra}`} 
            {profile.rashi && ` | ${profile.rashi}`}
          </p>
        </div>
        
        {/* Action Buttons - Updated with gradient styles */}
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleLike}
            size="sm"
            className={`text-xs flex items-center gap-1 px-3 py-1 h-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md
              ${isLiked
              ? 'bg-white text-[#800000] border-2 border-[#800000]'
              : 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white'}`}
          >
            <Heart className={`w-3 h-3 transition-colors duration-300 ${isLiked ? 'fill-[#800000] text-[#800000]' : 'fill-red-400 text-red-400'}`} /> Like
          </Button>
          
          <Button
            onClick={handleMessage}
            size="sm"
            className="text-xs flex items-center gap-1 px-3 py-1 h-8 rounded-full bg-white border-2 border-red-400 text-red-600 hover:!bg-white hover:!text-red-600 hover:!border-red-400 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <MessageSquare className="w-3 h-3 text-red-600" /> Message
          </Button>
          
          <Link to={`/profile/${profile.id}`} className="ml-auto">
            <Button 
              size="sm"
              className="text-xs flex items-center gap-1 px-3 py-1 h-8 rounded-full bg-primary text-white transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <UserRound className="w-3 h-3" /> Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileCardCompact; 