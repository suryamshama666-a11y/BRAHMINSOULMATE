import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Heart, MessageCircle, Star, Shield, Sparkles,
  GraduationCap, Briefcase, MapPin
} from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';

// Custom ConnectIcon component for the pointing fingers
const ConnectIcon = ({ className }: { className?: string }) => (
  <svg
    width="18"
    height="14"
    viewBox="0 0 24 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} transition-all duration-300`}
  >
    {/* Left Hand - Index Finger */}
    <path
      d="M2,8 L9,8"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M9,5.5 C9,5.5 9,7 9,8 C9,9 9,10.5 9,10.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Right Hand - Index Finger */}
    <path
      d="M22,8 L15,8"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M15,5.5 C15,5.5 15,7 15,8 C15,9 15,10.5 15,10.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Lightning/Spark between fingers - more visible */}
    <path
      d="M12,8 L10.5,5.5 L13.5,8 L10.5,10.5 L12,8 Z"
      fill="#FFD700"
      stroke="#FFA500"
      strokeWidth="1"
      className="drop-shadow-sm"
    />
  </svg>
);

interface ProfileGridProps {
  profiles: any[];
  onSendInterest: (name: string, id: string) => void;
  onShortlist: (id: string, name: string) => void;
  onMessage: (id: string) => void;
  onCompareToggle?: (id: string) => void;
  selectedForComparison?: string[];
}

const ProfileGrid = ({
  profiles,
  onSendInterest,
  onShortlist,
  onMessage,
  onCompareToggle,
  selectedForComparison = []
}: ProfileGridProps) => {
  const navigate = useNavigate();
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [favoritedProfiles, setFavoritedProfiles] = useState<string[]>([]);
  const [connectedProfiles, setConnectedProfiles] = useState<string[]>([]);

  const getMatchPercentage = () => Math.floor(Math.random() * 30) + 70;

  const formatEducation = (education: any) => {
    if (!education) return 'Education details not provided';
    if (typeof education === 'string') return education;
    if (typeof education === 'object') {
      if (education.degree && education.institution) {
        return `${education.degree} from ${education.institution}${education.year ? ` (${education.year})` : ''}`;
      }
      return education.degree || education.institution || 'Education details not provided';
    }
    return 'Education details not provided';
  };

  const handleLike = (name: string, id: string) => {
    const isLiked = likedProfiles.includes(id);
    
    if (!isLiked) {
      setLikedProfiles(prev => [...prev, id]);
      toast.success(`${name} added to your liked list`, {
        description: "A notification has been sent to the profile member",
      });
    } else {
      setLikedProfiles(prev => prev.filter(profileId => profileId !== id));
      toast.info(`${name} removed from your liked list`);
    }
  };

  const handleConnect = (name: string, id: string) => {
    const isConnected = connectedProfiles.includes(id);
    
    if (!isConnected) {
      setConnectedProfiles(prev => [...prev, id]);
      onSendInterest(name, id);
      toast.success(`Interest sent to ${name}`, {
        description: "Your interest has been sent. You'll be notified when they respond.",
        action: {
          label: "View Sent Interests",
          onClick: () => navigate('/dashboard/interests')
        }
      });
    } else {
      setConnectedProfiles(prev => prev.filter(profileId => profileId !== id));
      toast.info(`Interest withdrawn from ${name}`);
    }
  };

  const handleFavorite = (id: string, name: string) => {
    const isFavorited = favoritedProfiles.includes(id);
    if (isFavorited) {
      setFavoritedProfiles(prev => prev.filter(profileId => profileId !== id));
      toast.info(`${name} removed from favorites`);
    } else {
      setFavoritedProfiles(prev => [...prev, id]);
      toast.success(`${name} added to favorites`, {
        description: "You can find all your favorite profiles in your dashboard",
        action: {
          label: "View Favorites",
          onClick: () => navigate('/favorites')
        }
      });
    }
    onShortlist(id, name);
  };

  const handleMessageClick = (id: string, name: string) => {
    onMessage(id);
    toast.success(`Opening chat with ${name}`, {
      description: "You can now start a conversation"
    });
    navigate('/messages', { state: { profileId: id } });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <ProfileCard 
          key={profile.id}
          profile={{
            id: profile.id,
            name: profile.name,
            age: profile.age,
            gender: profile.gender || 'male',
            height: profile.height || 170,
            religion: profile.religion || 'Hindu',
            caste: profile.caste || 'Brahmin',
            gotra: profile.gotra || profile.rashi,
            location: profile.location?.city || 'Location not specified',
            education: formatEducation(profile.education),
            profession: profile.profession || 'Profession details not provided',
            subscription_type: profile.subscription_type || 'free',
            lastActive: profile.lastActive || '1 hour ago',
            matchPercentage: getMatchPercentage(),
            isVerified: profile.isVerified
          }}
          variant="default"
          onAction={(action, profileId) => {
            switch (action) {
              case 'expressInterest':
                handleConnect(profile.name, profileId);
                break;
              case 'message':
                handleMessageClick(profileId, profile.name);
                break;
              case 'favorite':
                handleFavorite(profileId, profile.name);
                break;
            }
          }}
        />
      ))}
    </div>
  );
};

export default ProfileGrid; 