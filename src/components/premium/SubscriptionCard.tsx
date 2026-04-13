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

  const _getGradient = () => {
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
    <Card className={`relative overflow-hidden border-2 transition-all hover:shadow-lg flex flex-col h-full ${
      plan.isPopular 
        ? 'border-red-500 shadow-lg' 
        : isCurrentPlan 
        ? 'border-green-500' 
        : 'border-gray-200'
    }`}>
      {plan.isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-amber-600 text-white text-center py-2 text-sm font-semibold">
          Most Popular
        </div>
      )}
      
      <CardHeader className={`bg-white border-b border-gray-100 ${plan.isPopular ? 'pt-12' : 'pt-6'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
          </div>
          {isCurrentPlan && (
            <Badge className="bg-green-500 text-white">Current</Badge>
          )}
        </div>
        <div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
            <span className="text-gray-500 ml-2 text-sm">/{plan.duration}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 bg-white flex-1 flex flex-col">
        <ul className="space-y-3 mb-6 flex-1">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          onClick={() => onSelect(plan.id)}
          disabled={isCurrentPlan}
          variant="outline"
          className={`w-full border-2 transition-all ${
            isCurrentPlan 
              ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed' 
              : plan.isPopular
              ? 'border-red-500 text-red-600 hover:bg-red-50 hover:text-red-600 font-semibold'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' : 'Choose Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};