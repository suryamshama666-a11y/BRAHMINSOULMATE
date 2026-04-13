
import React from 'react';
import { User } from 'lucide-react';
import { useUserProfile } from '@/hooks/forum/useUserProfile';

interface UserAvatarProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userId, 
  size = 'md', 
  showName = false,
  className = '' 
}) => {
  const { profile, loading } = useUserProfile(userId);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const displayName = profile?.display_name || 
    (profile ? `${profile.first_name} ${profile.last_name}` : 'Community Member');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`} />
        {showName && <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0`}>
        {profile?.profile_picture_url ? (
          <img
            src={profile.profile_picture_url}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load - XSS safe
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full bg-primary flex items-center justify-center';
                const span = document.createElement('span');
                span.className = `text-white font-medium ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'}`;
                span.textContent = getInitials(displayName); // Safe - no HTML parsing
                fallback.appendChild(span);
                parent.replaceChildren(fallback);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center">
            {profile ? (
              <span className={`text-white font-medium ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'}`}>
                {getInitials(displayName)}
              </span>
            ) : (
              <User className={`${iconSizes[size]} text-white`} />
            )}
          </div>
        )}
      </div>
      {showName && (
        <span className={`font-medium ${textSizes[size]} text-gray-700`}>
          {displayName}
        </span>
      )}
    </div>
  );
};
