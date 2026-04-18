import { supabase } from '@/lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: number; // in days
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
}

export interface Payment {
  id: string;
  user_id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  currency: string;
  plan: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

class PaymentsService {
  private razorpayKeyId: string;

  constructor() {
    this.razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
  }

  private plans: SubscriptionPlan[] = [
    {
      id: 'basic_monthly',
      name: 'Basic Monthly',
      duration: 30,
      price: 999,
      currency: 'INR',
      features: [
        'View unlimited profiles',
        'Send 10 interests per month',
        'Basic matching algorithm',
        'Email support'
      ],
      popular: false
    },
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      duration: 30,
      price: 1999,
      currency: 'INR',
      features: [
        'All Basic features',
        'Unlimited interests',
        'Advanced matching with horoscope',
        'View contact details',
        'Priority customer support',
        'Profile highlighting'
      ],
      popular: true
    },
    {
      id: 'premium_quarterly',
      name: 'Premium Quarterly',
      duration: 90,
      price: 4999,
      currency: 'INR',
      features: [
        'All Premium features',
        '3 months validity',
        'Save 17%',
        'Dedicated relationship manager'
      ],
      popular: false
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      duration: 365,
      price: 14999,
      currency: 'INR',
      features: [
        'All Premium features',
        '12 months validity',
        'Save 37%',
        'Priority access to new features'
      ],
      popular: false
    }
  ];

  getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.plans.find(p => p.id === planId);
  }

  async createOrder(planId: string): Promise<RazorpayOrder> {
    const plan = this.getPlanById(planId);
    if (!plan) throw new Error('Invalid plan selection');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          planId,
          amount: plan.price,
          currency: plan.currency
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Order creation failed:', error);
      throw error;
    }
  }

  async verifyPayment(
    paymentData: {
      orderId: string;
      paymentId: string;
      signature: string;
      planId: string;
    }
  ): Promise<{ success: boolean; subscription?: Subscription }> {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  async getActiveSubscription(): Promise<Subscription | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data as (Subscription | null);
  }

  async getPaymentHistory(): Promise<Payment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Payment[];
  }

  async getSubscriptions(): Promise<Subscription[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Subscription[];
  }

  async hasFeature(feature: string): Promise<boolean> {
    const sub = await this.getActiveSubscription();
    if (!sub) return false;

    const plan = this.getPlanById(sub.plan_id);
    return plan?.features.includes(feature) || false;
  }
}

export const paymentsService = new PaymentsService();
