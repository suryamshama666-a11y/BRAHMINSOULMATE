import React from 'react';
import { Button } from './button';
import { 
  Heart, Search, MessageCircle, Users, Calendar, Star, 
  Bell, Inbox, Frown 
} from 'lucide-react';
import { Link } from 'react-router-dom';

type EmptyStateVariant = 
  | 'no-matches' 
  | 'no-messages' 
  | 'no-favorites' 
  | 'no-interests' 
  | 'no-connections'
  | 'no-notifications'
  | 'no-events'
  | 'no-results'
  | 'error'
  | 'generic';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, {
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  defaultDescription: string;
  defaultAction?: { label: string; href: string };
  iconColor: string;
  bgColor: string;
}> = {
  'no-matches': {
    icon: Heart,
    defaultTitle: 'No Matches Yet',
    defaultDescription: 'Complete your profile to get personalized match recommendations based on your preferences.',
    defaultAction: { label: 'Complete Profile', href: '/profile' },
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-50'
  },
  'no-messages': {
    icon: MessageCircle,
    defaultTitle: 'No Messages',
    defaultDescription: 'Start a conversation with someone who caught your eye. Your messages will appear here.',
    defaultAction: { label: 'Browse Profiles', href: '/search' },
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  'no-favorites': {
    icon: Star,
    defaultTitle: 'No Favorites Saved',
    defaultDescription: 'Save profiles you like to easily find them later. Tap the heart icon on any profile to favorite.',
    defaultAction: { label: 'Discover Profiles', href: '/search' },
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50'
  },
  'no-interests': {
    icon: Heart,
    defaultTitle: 'No Interests Sent',
    defaultDescription: 'Express interest in profiles you like. It\'s the first step to making a connection!',
    defaultAction: { label: 'Find Your Match', href: '/matches' },
    iconColor: 'text-pink-500',
    bgColor: 'bg-pink-50'
  },
  'no-connections': {
    icon: Users,
    defaultTitle: 'No Connections Yet',
    defaultDescription: 'When someone accepts your interest or you accept theirs, you\'ll be connected here.',
    defaultAction: { label: 'View Matches', href: '/matches' },
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50'
  },
  'no-notifications': {
    icon: Bell,
    defaultTitle: 'All Caught Up!',
    defaultDescription: 'You\'ve seen all your notifications. New ones will appear here.',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50'
  },
  'no-events': {
    icon: Calendar,
    defaultTitle: 'No Events Available',
    defaultDescription: 'There are no upcoming events at the moment. Check back soon for community meetups!',
    iconColor: 'text-indigo-500',
    bgColor: 'bg-indigo-50'
  },
  'no-results': {
    icon: Search,
    defaultTitle: 'No Results Found',
    defaultDescription: 'Try adjusting your search filters to find more profiles that match your criteria.',
    iconColor: 'text-gray-500',
    bgColor: 'bg-gray-50'
  },
  'error': {
    icon: Frown,
    defaultTitle: 'Something Went Wrong',
    defaultDescription: 'We couldn\'t load this content. Please try refreshing the page.',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50'
  },
  'generic': {
    icon: Inbox,
    defaultTitle: 'Nothing Here',
    defaultDescription: 'There\'s nothing to show at the moment.',
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-50'
  }
};

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'generic',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = ''
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;
  
  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;
  const action = actionLabel && actionHref 
    ? { label: actionLabel, href: actionHref }
    : config.defaultAction;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {/* Animated Icon Container */}
      <div className={`${config.bgColor} p-6 rounded-full mb-6 animate-pulse-gentle`}>
        <Icon className={`h-12 w-12 ${config.iconColor}`} />
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {displayTitle}
      </h3>
      
      {/* Description */}
      <p className="text-gray-500 max-w-md mb-6 leading-relaxed">
        {displayDescription}
      </p>
      
      {/* Action Button */}
      {(action || onAction) && (
        action?.href ? (
          <Link to={action.href}>
            <Button 
              className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={onAction}
            >
              {actionLabel || action?.label}
            </Button>
          </Link>
        ) : (
          <Button 
            className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={onAction}
          >
            {actionLabel || 'Take Action'}
          </Button>
        )
      )}

    </div>
  );
};

export { EmptyState };
export type { EmptyStateProps, EmptyStateVariant };
