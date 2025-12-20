
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly';
  features: PlanFeature[];
  popularPlan?: boolean;
  savingsPercentage?: number;
}

interface PaymentPlansProps {
  category?: 'all' | 'consultations' | 'matching' | 'charts';
}

export default function PaymentPlans({ category = 'all' }: PaymentPlansProps) {
  const { isAuthenticated } = useAuth();
  
  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 499,
      billingPeriod: 'monthly',
      features: [
        { name: 'Basic Birth Chart', included: true },
        { name: 'Simple Kundali Analysis', included: true },
        { name: 'Limited Chat Support', included: true },
        { name: 'Access to Public Profiles', included: true },
        { name: 'View Basic Profile Details', included: true },
        { name: 'Basic Dosha Check', included: false },
        { name: 'Comprehensive Matching', included: false },
        { name: 'Video Consultations', included: false },
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1499,
      originalPrice: 1999,
      billingPeriod: 'monthly',
      features: [
        { name: 'Advanced Birth Chart', included: true },
        { name: 'Complete Kundali Analysis', included: true },
        { name: 'Unlimited Chat Support', included: true },
        { name: 'Full Access to All Profiles', included: true },
        { name: 'View All Profile Details', included: true },
        { name: 'Full Dosha Check & Analysis', included: true },
        { name: 'Comprehensive Matching', included: true },
        { name: 'Video Consultations (2/month)', included: true },
      ],
      popularPlan: true,
      savingsPercentage: 25,
    },
    {
      id: 'yearly',
      name: 'Annual Plan',
      price: 9999,
      originalPrice: 17988,
      billingPeriod: 'yearly',
      features: [
        { name: 'Advanced Birth Chart', included: true },
        { name: 'Complete Kundali Analysis', included: true },
        { name: 'Priority Chat Support', included: true },
        { name: 'Full Access to All Profiles', included: true },
        { name: 'View All Profile Details', included: true },
        { name: 'Full Dosha Check & Analysis', included: true },
        { name: 'Comprehensive Matching', included: true },
        { name: 'Video Consultations (Unlimited)', included: true },
      ],
      savingsPercentage: 45,
    },
  ];

  // Filter plans based on category if needed
  const displayedPlans = category === 'all' ? plans : plans.filter(p => {
    if (category === 'consultations') return p.id === 'premium' || p.id === 'yearly';
    if (category === 'matching') return true; // All plans have some matching features
    if (category === 'charts') return true; // All plans have some chart features
    return true;
  });

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to subscribe to a plan");
      return;
    }
    
    // In a real implementation, this would initiate the payment flow
    toast.success(`Initiating subscription to ${planId} plan`);
    // Here you would redirect to a payment page or show a payment modal
  };

  const formatPrice = (price: number) => {
    return `₹${(price / 100).toLocaleString('en-IN')}`;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`flex flex-col ${plan.popularPlan ? 'border-brahmin-primary ring-2 ring-brahmin-primary ring-opacity-50' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {plan.billingPeriod === 'monthly' 
                      ? 'Billed monthly' 
                      : plan.billingPeriod === 'quarterly' 
                        ? 'Billed quarterly'
                        : 'Billed annually'}
                  </CardDescription>
                </div>
                {plan.popularPlan && (
                  <div className="inline-flex bg-brahmin-primary text-white text-xs font-medium px-2 py-1 rounded-full items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-0 flex-grow">
              <div className="mb-4">
                <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                {plan.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    {formatPrice(plan.originalPrice)}
                  </span>
                )}
                {plan.savingsPercentage && (
                  <span className="ml-2 text-sm text-green-600 font-medium">
                    Save {plan.savingsPercentage}%
                  </span>
                )}
              </div>
              
              <div className="space-y-2.5">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`rounded-full p-1 mr-2 ${feature.included ? 'text-green-500' : 'text-gray-300'}`}>
                      <Check className="h-4 w-4" />
                    </div>
                    <span className={`text-sm ${!feature.included ? 'text-muted-foreground' : ''}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4 mt-auto">
              <Button 
                className={`w-full ${plan.popularPlan ? 'bg-brahmin-primary hover:bg-brahmin-dark' : ''}`}
                onClick={() => handleSubscribe(plan.id)}
              >
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
