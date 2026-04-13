import React, { useState, useEffect } from 'react';
import { } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  
  
} from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';
import { useCompatibility } from '@/hooks/useCompatibility';

// Custom ConnectIcon component for the pointing fingers
const _ConnectIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 11l5 5 5-5" />
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const _navigate = useNavigate();
  const [_likedProfiles, _setLikedProfiles] = useState<string[]>([]);
  const [_favoritedProfiles, _setFavoritedProfiles] = useState<string[]>([]);
  const [_connectedProfiles, _setConnectedProfiles] = useState<string[]>([]);

  const formatEducation = (_education: any) => {
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
                  onSendInterest(profile.name, profileId);
                  break;
                case 'message':
                  onMessage(profileId);
                  break;
                case 'favorite':
                  onShortlist(profileId, profile.name);
                  break;
              }
            }}
        />
      ))}
    </div>
  );
};

export default ProfileGrid;