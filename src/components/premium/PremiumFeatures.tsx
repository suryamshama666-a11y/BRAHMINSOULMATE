
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, Phone, MessageSquare, Eye, Zap, Crown, 
  Star, Users, Calendar, Heart, Shield, Sparkles 
} from 'lucide-react';

const premiumFeatures = [
  {
    icon: <Video className="h-6 w-6" />,
    title: 'Video Calls',
    description: 'Connect face-to-face with unlimited video calls',
    tier: 'premium'
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: 'Voice Calls',
    description: 'Unlimited voice calling with crystal clear quality',
    tier: 'premium'
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'Priority Messaging',
    description: 'Your messages appear first in their inbox',
    tier: 'vip'
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: 'Profile Views',
    description: 'See who viewed your profile and when',
    tier: 'premium'
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Profile Boost',
    description: 'Appear 3x more in search results',
    tier: 'vip'
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Advanced Filters',
    description: 'Filter by income, family background, and more',
    tier: 'premium'
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: 'V-Date Priority',
    description: 'Get priority booking for popular time slots',
    tier: 'vip'
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Unlimited Interests',
    description: 'Send unlimited interest requests',
    tier: 'premium'
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Privacy Controls',
    description: 'Advanced privacy settings and profile protection',
    tier: 'vip'
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Exclusive Events',
    description: 'Access to premium matrimonial events',
    tier: 'vip'
  }
];

export const PremiumFeatures = () => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'from-purple-500 to-indigo-500';
      case 'vip':
        return 'from-yellow-400 to-amber-500';
      case 'basic':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Star className="h-3 w-3" />;
      case 'vip':
        return <Crown className="h-3 w-3" />;
      case 'basic':
        return <Crown className="h-3 w-3" />;
      default:
        return <Zap className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">
          Premium Features
        </h2>
        <p className="text-gray-600">Unlock the full potential of your matrimonial journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-primary text-white`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <Badge className="bg-primary text-white">
                  {getTierIcon(feature.tier)}
                  {feature.tier}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
