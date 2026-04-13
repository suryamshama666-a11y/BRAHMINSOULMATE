
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const BillingPlans = () => {
  const { upgradeSubscription, profile } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      status: profile?.subscriptionStatus === 'free' ? 'current' : 'available',
      features: ['5 profile views per day', 'Basic search filters', 'Send 3 interests']
    },
    {
      name: 'Premium',
      price: '₹1,999',
      period: 'month',
      status: profile?.subscriptionStatus === 'premium' ? 'current' : 'available',
      features: ['Unlimited profile views', 'Advanced search filters', 'Unlimited messaging', 'Video calls', 'Priority support']
    },
    {
      name: 'VIP',
      price: '₹4,999',
      period: 'month',
      status: profile?.subscriptionStatus === 'vip' ? 'current' : 'available',
      features: ['All Premium features', 'Profile boost', 'Dedicated relationship manager', 'Exclusive events access', 'Horoscope matching']
    }
  ];

  const handleUpgrade = async (planType: string) => {
    try {
      await upgradeSubscription(planType);
      navigate('/account');
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Subscription Plans</h3>
        <p className="text-gray-600">Choose the plan that best fits your needs</p>
      </div>

      {/* Current subscription status */}
      {profile && (
        <Card className="border-l-4 border-l-brahmin-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Current Plan: {profile.subscriptionStatus?.charAt(0).toUpperCase()}{profile.subscriptionStatus?.slice(1)}</h4>
                {profile.subscriptionExpiryDate && (
                  <p className="text-sm text-gray-600">
                    Expires on: {new Date(profile.subscriptionExpiryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Badge variant={profile.subscriptionStatus === 'free' ? 'secondary' : 'default'}>
                {profile.subscriptionStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card key={index} className="border-2 border-red-100/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {plan.name === 'VIP' && <Crown className="h-5 w-5 text-yellow-500" />}
                {plan.name === 'Premium' && <Star className="h-5 w-5 text-blue-500" />}
              </CardTitle>
              <CardDescription>
                {plan.status === 'current' ? 'Your current plan' : 'Upgrade to unlock more features'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">{plan.price}</div>
              <p className="text-gray-600">per {plan.period}</p>
              <ul className="list-disc pl-4 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.status === 'current' ? (
                <Button variant="secondary" disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button className="w-full bg-primary hover:bg-primary-dark text-white" onClick={() => handleUpgrade(plan.name.toLowerCase())}>
                  Upgrade to {plan.name}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
