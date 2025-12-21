
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '@/data/profiles';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Video, Lock, MapPin, Shield, Phone, Star, Sparkles } from 'lucide-react';
import { useProfileInteractions } from '@/features/profile/hooks/useProfileInteractions';
import { formatHeight, formatLocation } from '@/features/profile/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type ProfileCardProps = {
  profile: Profile;
  showActions?: boolean;
};

export default function ProfileCardEnhanced({ profile, showActions = true }: ProfileCardProps) {
  const [liked, setLiked] = useState(false);
  const { handleMessage, handleVideoCall, handlePhone } = useProfileInteractions(profile);
  const { isPremium } = useAuth();
  
  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      toast.success(`You liked ${profile.name}'s profile!`, {
        position: "top-center",
        duration: 2000,
      });
    } else {
      toast.info(`You unliked ${profile.name}'s profile`, {
        position: "top-center",
        duration: 2000,
      });
    }
  };
  
  // Format the name according to visibility rules
  const formatName = (name: string): string => {
    if (isPremium) return name;
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return `${name[0]}.`;
    
    // First name initial + full last name
    const firstNameInitial = nameParts[0][0] + '.';
    const lastName = nameParts[nameParts.length - 1];
    
    return `${firstNameInitial} ${lastName}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col bg-white border-2 border-primary/20 hover:border-primary/50 group rounded-3xl">
      <div className="relative pb-[60%] overflow-hidden bg-orange-50">
        <Link to={`/profile/${profile.id}`}>
          <img
            src={profile.images[0] || '/placeholder.svg'}
            alt={profile.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        </Link>
        
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start">
          {profile.isVerified && (
            <Badge variant="secondary" className="bg-primary text-white backdrop-blur-sm flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full shadow-lg border-0">
              <Shield className="h-3.5 w-3.5 fill-white" /> Verified
            </Badge>
          )}
          <Badge variant="secondary" className="bg-primary text-white backdrop-blur-sm text-xs px-3 py-1.5 rounded-full shadow-lg border-0 font-semibold">
            {profile.age} yrs
          </Badge>
        </div>

        {/* Premium Match Badge */}
        <div className="absolute bottom-4 right-4 bg-primary text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 font-semibold">
          <Sparkles className="h-3 w-3 fill-white" />
          95% Match
        </div>
      </div>
      
      <CardContent className="pt-5 px-5 flex-grow">
        <Link to={`/profile/${profile.id}`}>
          <h3 className="text-xl font-semibold font-serif text-foreground hover:text-brahmin-primary transition-colors flex items-center group/title mb-3">
            {formatName(profile.name)}
            {!isPremium && (
              <Lock className="ml-2 h-4 w-4 text-amber-500" />
            )}
            <span className="ml-auto opacity-0 group-hover/title:opacity-100 transition-opacity text-sm text-brahmin-primary font-medium">
              View Profile →
            </span>
          </h3>
        </Link>
        
        <div className="flex items-center text-muted-foreground text-sm mb-4">
          <MapPin className="h-4 w-4 mr-2 text-brahmin-primary" />
          <span className="font-medium">{formatLocation(profile.location)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4 bg-orange-50 rounded-2xl p-4 border border-primary/20">
          <div>
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Profession:</span>
            <p className="font-bold text-brahmin-dark mt-0.5">{profile.employment.profession}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Education:</span>
            <p className="font-bold text-brahmin-dark mt-0.5">{profile.education[0]?.degree}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Gotra:</span>
            <p className="font-bold text-brahmin-dark mt-0.5">{profile.family.gotra || 'Not specified'}</p>
          </div>
            <div>
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Community:</span>
              <p className="font-bold text-brahmin-dark mt-0.5">{profile.family?.community || 'Brahmin'}</p>
            </div>
        </div>
        
        {/* Mini Horoscope Preview */}
        {profile.horoscope && (
          <div className="bg-orange-50 rounded-xl p-3 mb-4 border border-primary/20">
            <p className="text-xs font-bold mb-2 text-brahmin-primary flex items-center">
              <Star className="h-3 w-3 mr-1.5 fill-brahmin-primary" />
              Horoscope Highlights:
            </p>
            <div className="flex justify-between text-xs font-medium">
              <span>Rashi: <span className="font-bold text-brahmin-dark">{profile.horoscope.rashi || 'N/A'}</span></span>
              <span>Nakshatra: <span className="font-bold text-brahmin-dark">{profile.horoscope.nakshatra || 'N/A'}</span></span>
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-700 line-clamp-2 italic font-medium">{profile.about}</p>
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-between border-t-2 border-primary/20 pt-5 pb-5 bg-orange-50 gap-3 px-5">
          <Button 
            onClick={handleLike} 
            ripple={true}
            className={`rounded-full p-3 transition-all duration-300 transform hover:scale-125 shadow-lg 
              ${liked 
                ? 'text-white bg-primary hover:bg-primary-dark shadow-primary/30' 
                : 'text-gray-600 bg-gray-100 hover:bg-orange-50 hover:text-primary border-2 border-gray-300 hover:border-primary/30'}`}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-white animate-heartBeat' : ''}`} />
          </Button>
          
          <Button 
            onClick={handleMessage} 
            ripple={true}
            className="rounded-full p-3 transition-all duration-300 transform hover:scale-125 
              text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          <Button 
            onClick={handlePhone} 
            ripple={true}
            className="rounded-full p-3 transition-all duration-300 transform hover:scale-125 
              text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30"
          >
            <Phone className="h-5 w-5" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
