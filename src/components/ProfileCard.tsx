import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Heart, MessageCircle, Eye, MapPin, Clock, Calendar, 
  HeartOff, Check, X, Star, Crown, UserPlus, Briefcase, GraduationCap,
  Flag, Shield
} from 'lucide-react';

interface ProfileCardProps {
  profile: any;
  variant?: 'default' | 'online' | 'new' | 'match' | 'favorite' | 'interest' | 'received';
  onAction?: (action: string, profileId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  variant = 'default', 
  onAction,
  showActions = true,
  compact = false 
}) => {
  const [isInterestExpressed, setIsInterestExpressed] = React.useState(false);
  const [isBlocked, setIsBlocked] = React.useState(false);
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'online':
        return {
          borderColor: 'border-2 border-red-100/50',
          bgColor: 'bg-white',
          badgeColor: 'bg-green-100 text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          indicator: <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
        };
      case 'new':
        return {
          borderColor: 'border-2 border-red-100/50',
          bgColor: 'bg-white',
          badgeColor: 'bg-purple-100 text-purple-800',
          buttonColor: 'bg-purple-600 hover:bg-purple-700',
          indicator: <UserPlus className="h-4 w-4 text-purple-600" />
        };
      case 'match':
        return {
          borderColor: 'border-2 border-red-100/50',
          bgColor: 'bg-white',
          badgeColor: 'bg-amber-100 text-amber-800',
          buttonColor: 'bg-amber-600 hover:bg-amber-700',
          indicator: <Star className="h-4 w-4 text-amber-600" />
        };
      case 'favorite':
        return {
          borderColor: 'border-2 border-red-100/50',
          bgColor: 'bg-white',
          badgeColor: 'bg-red-100 text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          indicator: <Heart className="h-4 w-4 text-red-600 fill-current" />
        };
      default:
        return {
          borderColor: 'border-2 border-red-100/50',
          bgColor: 'bg-white',
          badgeColor: 'bg-gray-100 text-gray-800',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          indicator: null
        };
    }
  };

  const styles = getVariantStyles();

  const getStatusBadge = () => {
    switch (variant) {
      case 'online':
        return (
          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">Online</span>
          </div>
        );
      case 'new':
        return (
          <div className="bg-purple-100 px-2 py-1 rounded-full">
            <span className="text-xs text-purple-700 font-medium">NEW</span>
          </div>
        );
      case 'match':
        return (
          <Badge className="bg-primary text-white border-0 text-xs">
            {profile.matchPercentage || Math.floor(Math.random() * 20) + 80}% Match
          </Badge>
        );
      case 'interest':
        const statusColors: Record<string, string> = {
          accepted: 'bg-green-100 text-green-800',
          declined: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800'
        };
        return (
          <Badge className={`text-xs ${statusColors[profile.status] || statusColors.pending}`}>
            {profile.status?.charAt(0).toUpperCase() + profile.status?.slice(1) || 'Pending'}
          </Badge>
        );
      default:
        if (profile.matchPercentage) {
          return (
            <Badge className="bg-[#FF4500] text-white border-0 text-xs">
              {profile.matchPercentage}% Match
            </Badge>
          );
        }
        return null;
    }
  };

  const getContextualInfo = () => {
    switch (variant) {
      case 'online':
        return (
          <div className="flex items-center text-xs text-green-600">
            <Clock className="h-3 w-3 mr-1" />
            {profile.lastSeen || 'Active now'}
          </div>
        );
      case 'new':
        return (
          <div className="flex items-center text-xs text-purple-600">
            <Calendar className="h-3 w-3 mr-1" />
            Joined {profile.joinedDate || 'recently'}
          </div>
        );
      case 'favorite':
        return (
          <div className="flex items-center text-xs text-gray-500">
            <Heart className="h-3 w-3 mr-1" />
            Added {profile.addedToFavorites || 'recently'}
          </div>
        );
      case 'interest':
        return (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Sent {profile.sentDate || 'recently'}
          </div>
        );
      case 'received':
        return (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Received {profile.receivedDate || 'recently'}
          </div>
        );
      default:
        return profile.lastActive ? (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Active {profile.lastActive}
          </div>
        ) : null;
    }
  };

  return (
    <Card className={`${styles.borderColor} ${styles.bgColor} hover:shadow-lg transition-all duration-300 relative overflow-hidden`}>
      {/* Status Badge - Top Right */}
      <div className="absolute top-2 right-2 z-10">
        {getStatusBadge()}
      </div>

      <CardContent className="p-0">
        {/* Horizontal Layout */}
        <div className="flex flex-row">
          {/* Profile Picture */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-full min-h-[200px] overflow-hidden bg-gray-100">
              <img
                src={`https://randomuser.me/api/portraits/${profile.gender === 'male' ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Premium Crown */}
            {profile.subscription_type === 'premium' && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1 rounded-full">
                <Crown className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 p-3">
            {/* Header */}
            <div className="mb-2">
              <h3 className="font-semibold text-base text-gray-900 leading-tight truncate">
                {profile.name}
              </h3>
              <p className="text-sm text-gray-600">{profile.age} yrs, {profile.height}cm</p>
            </div>

            {/* Key Details */}
            <div className="space-y-1 text-xs mb-3">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-3 w-3 mr-1 text-red-500 flex-shrink-0" />
                <span className="truncate">{profile.location}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <GraduationCap className="h-3 w-3 mr-1 text-blue-500 flex-shrink-0" />
                <span className="truncate">{profile.education}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Briefcase className="h-3 w-3 mr-1 text-amber-500 flex-shrink-0" />
                <span className="truncate">{profile.profession || profile.occupation || 'Not specified'}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Caste:</span> {profile.caste}
              </div>
            </div>

            {/* Subscription & Contextual Info */}
            <div className="flex items-center justify-between mb-3">
              <Badge 
                variant={profile.subscription_type === 'premium' ? 'default' : 'outline'} 
                className="text-xs bg-amber-50 text-amber-800 border-amber-200"
              >
                {profile.subscription_type}
              </Badge>
              {variant !== 'default' && getContextualInfo()}
            </div>
            
            {/* Action Buttons */}
            {showActions && (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Link to={`/profile/${profile.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button size="sm" className={`flex-1 text-xs h-8 ${styles.buttonColor} text-white`}>
                    <MessageCircle className="h-3 w-3 mr-1 text-white" />
                    Message
                  </Button>
                </div>
                
                {!isBlocked && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`w-full text-xs h-8 transition-all duration-300 ${
                      isInterestExpressed 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                    onClick={() => {
                      setIsInterestExpressed(!isInterestExpressed);
                      onAction?.('expressInterest', profile.id);
                    }}
                  >
                    <Heart className={`h-3 w-3 mr-1 transition-all duration-300 ${
                      isInterestExpressed ? 'fill-red-600 text-red-600' : ''
                    }`} />
                    {isInterestExpressed ? 'Interest Sent' : 'Express Interest'}
                  </Button>
                )}

                {/* Report/Block Row */}
                <div className="flex justify-center gap-2 pt-1 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-orange-600 hover:bg-orange-50"
                    onClick={() => onAction?.('report', profile.id)}
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    Report
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 px-2 text-xs ${isBlocked ? 'text-gray-600 hover:bg-gray-100' : 'text-red-600 hover:bg-red-50'}`}
                    onClick={() => {
                      setIsBlocked(!isBlocked);
                      onAction?.(isBlocked ? 'unblock' : 'block', profile.id);
                    }}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {isBlocked ? 'Unblock' : 'Block'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;