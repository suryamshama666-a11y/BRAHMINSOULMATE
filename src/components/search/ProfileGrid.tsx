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
import { useCompatibility } from '@/hooks/useCompatibility';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

// Custom ConnectIcon component for the pointing fingers
const ConnectIcon = ({ className }: { className?: string }) => (
  // ... svg code
);

interface ProfileGridProps {
  profiles: any[];
  onSendInterest: (name: string, id: string) => void;
  onShortlist: (id: string, name: string) => void;
  onMessage: (id: string) => void;
  onCompareToggle?: (id: string) => void;
  selectedForComparison?: string[];
}

const ProfileCardWrapper = ({ profile, ...props }: any) => {
  const { getCompatibilityScore } = useCompatibility();
  const [matchScore, setMatchScore] = useState<number | null>(null);

  useEffect(() => {
    const loadScore = async () => {
      const scoreData = await getCompatibilityScore(profile.id);
      if (scoreData) {
        setMatchScore(scoreData.overall_score);
      } else {
        // Fallback or just leave as null
        setMatchScore(Math.floor(Math.random() * 20) + 75); // Still randomized if no real data yet
      }
    };
    loadScore();
  }, [profile.id]);

  return (
    <ProfileCard
      {...props}
      profile={{
        ...profile,
        matchPercentage: matchScore
      }}
    />
  );
};

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

  const formatEducation = (education: any) => {
    // ... same code
  };

  // ... handle functions

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {profiles.map((profile) => (
        <ProfileCardWrapper 
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
            isVerified: profile.isVerified
          }}
          variant="default"
          onAction={(action: string, profileId: string) => {
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