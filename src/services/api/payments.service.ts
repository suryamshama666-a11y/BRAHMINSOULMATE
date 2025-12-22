import { supabase } from '@/lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: number; // in days
  price: number;
  currency: string;
  features: string[];
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
  start_date: string;
  end_date: string;
  auto_renewal: boolean;
  payment_id?: string;
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

  // Subscription plans
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
      ]
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
      ]
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
      ]
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
        'Free profile verification',
        'Personalized matchmaking assistance'
      ]
    }
  ];

  // Get all subscription plans
  getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  // Get a specific plan
  getPlan(planId: string): SubscriptionPlan | undefined {
    return this.plans.find(p => p.id === planId);
  }

  // Create Razorpay order
  async createOrder(planId: string): Promise<RazorpayOrder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const plan = this.getPlan(planId);
    if (!plan) throw new Error('Invalid plan');

    // Call backend to create Razorpay order
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        plan_id: planId,
        amount: plan.price,
        currency: plan.currency
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return await response.json();
  }

  // Initialize Razorpay payment
  async initiatePayment(planId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const order = await this.createOrder(planId);
    const plan = this.getPlan(planId);

    if (!plan) throw new Error('Invalid plan');

    // Load Razorpay script
    await this.loadRazorpayScript();

    const options = {
      key: this.razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Brahmin Soulmate Connect',
      description: plan.name,
      order_id: order.id,
      handler: async (response: any) => {
        await this.verifyPayment(response);
      },
      prefill: {
        email: user.email,
      },
      theme: {
        color: '#D97706'
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  }

  // Load Razorpay script
  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  }

  // Verify payment
  async verifyPayment(response: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const verifyResponse = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      })
    });

    if (!verifyResponse.ok) {
      throw new Error('Payment verification failed');
    }

    const result = await verifyResponse.json();
    
    if (result.success) {
      // Activate subscription
      await this.activateSubscription(result.payment);
    }
  }

  // Activate subscription
  async activateSubscription(payment: Payment): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const plan = this.getPlan(payment.plan);
    if (!plan) throw new Error('Invalid plan');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // Insert subscription record
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: payment.plan,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renewal: true,
        payment_id: payment.payment_id
      });

    if (subError) throw subError;

    // Update user profile to premium
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_type: 'premium',
        subscription_end_date: endDate.toISOString()
      })
      .eq('user_id', user.id);

    if (profileError) throw profileError;
  }

  // Get current subscription
  async getCurrentSubscription(): Promise<Subscription | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Check if user has active subscription
  async hasActiveSubscription(): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription) return false;

    const endDate = new Date(subscription.end_date);
    return endDate > new Date();
  }

  // Cancel subscription
  async cancelSubscription(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('subscriptions')
      .update({
        auto_renewal: false,
        status: 'cancelled'
      })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (error) throw error;
  }

  // Get payment history
  async getPaymentHistory(): Promise<Payment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Check for expiring subscriptions (for reminders)
  async checkExpiringSubscriptions(): Promise<Subscription[]> {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .lte('end_date', sevenDaysFromNow.toISOString())
      .gte('end_date', new Date().toISOString());

    if (error) throw error;
    return data || [];
  }

  // Expire old subscriptions (to be called by cron job)
  async expireOldSubscriptions(): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('end_date', new Date().toISOString());

    if (error) throw error;

    // Update profiles to free tier
    const { data: expiredSubs } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'expired');

    if (expiredSubs && expiredSubs.length > 0) {
      const userIds = expiredSubs.map(s => s.user_id);
      await supabase
        .from('profiles')
        .update({
          subscription_type: 'free',
          subscription_end_date: null
        })
        .in('user_id', userIds);
    }
  }

  // Check subscription limits for a specific activity
  async checkSubscriptionLimits(userId: string, activityType: string): Promise<boolean> {
    // Get user's subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_type')
      .eq('user_id', userId)
      .single();

    const isPremium = profile?.subscription_type === 'premium';

    // Define daily limits based on subscription type
    const limits: Record<string, { free: number; premium: number }> = {
      interests_sent: { free: 5, premium: 50 },
      profile_views: { free: 20, premium: -1 }, // -1 = unlimited
      messages_sent: { free: 10, premium: -1 }
    };

    const limit = isPremium ? limits[activityType]?.premium : limits[activityType]?.free;
    
    // Unlimited
    if (limit === -1) return true;
    if (!limit) return true;

    // Check today's activity count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('user_activity')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .gte('created_at', today.toISOString());

    return (count || 0) < limit;
  }

  // Record user activity for limit tracking
  async recordActivity(userId: string, activityType: string): Promise<void> {
    const { error } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type: activityType,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to record activity:', error);
    }
  }
}

export const paymentsService = new PaymentsService();
