
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
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

const fetchCurrentSubscriptionData = async (userId: string | undefined): Promise<UserSubscription | null> => {
  if (!userId) return null;

  try {
    const subscription = await paymentsService.getCurrentSubscription();
    const hasActive = await paymentsService.hasActiveSubscription();
    
    return {
      subscribed: hasActive,
      subscription_type: subscription?.plan_id || 'free',
      subscription_end: subscription?.end_date
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: currentSubscription = null, isLoading: loading, refetch } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => fetchCurrentSubscriptionData(user?.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const fetchCurrentSubscription = () => refetch();

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error('User not authenticated');

      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan || planId === 'free') {
        throw new Error('Invalid plan selected');
      }

      // Initiate Razorpay payment
      await paymentsService.initiatePayment(planId);
    },
    onSuccess: () => {
      toast.success('Subscription activated successfully!');
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    },
    onError: (error: any) => {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Failed to start subscription process');
    }
  });

  const subscribeToPlan = async (planId: string) => {
    if (!user) {
      toast.error('Please login to subscribe');
      return { success: false };
    }

    try {
      await subscribeMutation.mutateAsync(planId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const isPremiumUser = (): boolean => {
    return currentSubscription?.subscription_type !== 'free' && currentSubscription?.subscribed === true;
  };

  const hasFeature = (_feature: string): boolean => {
    return isPremiumUser();
  };

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
