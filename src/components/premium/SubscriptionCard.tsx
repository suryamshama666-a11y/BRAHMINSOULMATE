
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
  type: 'free' | 'basic' | 'premium' | 'vip';
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  currentPlan?: string;
  onSelect: (planId: string) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  currentPlan,
  onSelect
}) => {
  const isCurrentPlan = currentPlan === plan.id;
  
  const getIcon = () => {
    switch (plan.type) {
      case 'premium':
        return <Star className="h-5 w-5 text-purple-500" />;
      case 'vip':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'basic':
        return <Crown className="h-5 w-5 text-gray-500" />;
      default:
        return <Zap className="h-5 w-5 text-blue-500" />;
    }
  };

  const getGradient = () => {
    switch (plan.type) {
      case 'premium':
        return 'from-purple-50 to-indigo-50';
      case 'vip':
        return 'from-yellow-50 to-amber-50';
      case 'basic':
        return 'from-gray-50 to-slate-50';
      default:
        return 'from-blue-50 to-cyan-50';
    }
  };

  return (
    <Card className={`relative overflow-hidden ${plan.isPopular ? 'ring-2 ring-red-500' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
      {plan.isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-2 text-sm font-medium">
          Most Popular
        </div>
      )}
      
      <CardHeader className={`bg-orange-50 ${plan.isPopular ? 'pt-12' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-xl">{plan.name}</CardTitle>
          </div>
          {isCurrentPlan && (
            <Badge className="bg-green-500 text-white">Current</Badge>
          )}
        </div>
        <div className="mt-4">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">₹{plan.price}</span>
            <span className="text-gray-600 ml-2">/{plan.duration}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          onClick={() => onSelect(plan.id)}
          disabled={isCurrentPlan}
          className={`w-full ${
            isCurrentPlan 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : plan.type === 'vip'
              ? 'bg-primary hover:bg-primary-dark'
              : plan.type === 'basic'
              ? 'bg-gray-500 hover:bg-gray-600'
              : 'bg-primary hover:bg-primary-dark'
          } text-white`}
        >
          {isCurrentPlan ? 'Current Plan' : 'Choose Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};
