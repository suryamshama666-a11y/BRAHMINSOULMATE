
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentsService } from '@/services/api/payments.service';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'free' | 'basic' | 'premium' | 'vip';
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

export interface UserSubscription {
  subscribed: boolean;
  subscription_type: string;
  subscription_end?: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  // Get plans from payments service
  const plans = paymentsService.getPlans();
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      duration: 'forever',
      type: 'free',
      features: [
        'Basic profile creation',
        'Limited profile views (10/day)',
        '5 interests per month',
        'Basic search filters',
        'Email support'
      ]
    },
    ...plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      duration: plan.duration === 30 ? 'month' : plan.duration === 90 ? '3 months' : 'year',
      type: (plan.id.includes('premium') ? 'premium' : 'basic') as 'free' | 'basic' | 'premium' | 'vip',
      features: plan.features,
      isPopular: plan.id === 'premium_monthly'
    }))
  ];

  const fetchCurrentSubscription = useCallback(async () => {
    if (!user) return;

    try {
      const subscription = await paymentsService.getCurrentSubscription();
      const hasActive = await paymentsService.hasActiveSubscription();
      
      setCurrentSubscription({
        subscribed: hasActive,
        subscription_type: subscription?.plan_id || 'free',
        subscription_end: subscription?.end_date
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  }, [user]);

  const subscribeToPlan = async (planId: string) => {
    if (!user) {
      toast.error('Please login to subscribe');
      return { success: false };
    }

    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan || planId === 'free') {
      toast.error('Invalid plan selected');
      return { success: false };
    }

    try {
      setLoading(true);
      
      // Initiate Razorpay payment
      await paymentsService.initiatePayment(planId);
      
      // Refresh subscription after payment
      await fetchCurrentSubscription();
      
      toast.success('Subscription activated successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Failed to start subscription process');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const isPremiumUser = (): boolean => {
    return currentSubscription?.subscription_type !== 'free' && currentSubscription?.subscribed === true;
  };

  const hasFeature = (feature: string): boolean => {
    return isPremiumUser();
  };

  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user, fetchCurrentSubscription]);

  return {
    subscriptionPlans,
    currentSubscription,
    loading,
    subscribeToPlan,
    hasFeature,
    isPremiumUser,
    fetchCurrentSubscription
  };
};
