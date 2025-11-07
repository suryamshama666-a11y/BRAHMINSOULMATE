
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
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
  const { user } = useSupabaseAuth();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      duration: 'forever',
      type: 'free',
      features: [
        'Basic profile creation',
        'Limited profile views',
        '5 interests per month',
        'Basic search filters',
        'Email support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99900, // ₹999 in paisa
      duration: 'month',
      type: 'premium',
      isPopular: true,
      features: [
        'Unlimited profile views',
        'Video & voice calls',
        'Unlimited interests',
        'Advanced search filters',
        'Priority support',
        'Profile verification badge'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 299900, // ₹2999 in paisa
      duration: '3 months',
      type: 'basic',
      features: [
        'All Premium features',
        'Profile boost (3x visibility)',
        'Priority messaging',
        'V-Date priority booking',
        'Enhanced matchmaker support',
        'Advanced privacy controls'
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 499900, // ₹4999 in paisa
      duration: '6 months',
      type: 'vip',
      features: [
        'All Basic features',
        'Personal relationship manager',
        'Exclusive premium events',
        'Background verification assistance',
        'Compatibility score insights',
        'Marriage consultant sessions'
      ]
    }
  ];

  const fetchCurrentSubscription = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setCurrentSubscription(data);
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

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: plan.id,
          planName: plan.name,
          planPrice: plan.price,
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      return { success: true };
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start subscription process');
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
