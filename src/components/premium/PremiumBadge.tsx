
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';

interface PremiumBadgeProps {
  type: 'basic' | 'premium' | 'vip';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ 
  type, 
  size = 'md', 
  showIcon = true 
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'premium':
        return {
          className: 'bg-primary text-white',
          icon: <Star className="h-3 w-3" />,
          text: 'Premium'
        };
      case 'vip':
        return {
          className: 'bg-primary text-white',
          icon: <Crown className="h-3 w-3" />,
          text: 'VIP'
        };
      case 'basic':
        return {
          className: 'bg-gray-500 text-white',
          icon: <Crown className="h-3 w-3" />,
          text: 'Basic'
        };
      default:
        return {
          className: 'bg-primary text-white',
          icon: <Star className="h-3 w-3" />,
          text: 'Premium'
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-2' : 'text-xs px-2 py-1';

  return (
    <Badge className={`${config.className} ${sizeClass} flex items-center gap-1`}>
      {showIcon && config.icon}
      {config.text}
    </Badge>
  );
};
