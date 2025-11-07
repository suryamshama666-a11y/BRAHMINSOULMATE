import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in months
  features: string[];
  popular?: boolean;
}

export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 999,
    duration: 1,
    features: [
      'View up to 50 profiles per day',
      'Send up to 10 interests per day',
      'Basic search filters',
      'Standard customer support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2499,
    duration: 3,
    features: [
      'Unlimited profile views',
      'Unlimited interests',
      'Advanced search filters',
      'See who viewed your profile',
      'Priority customer support',
      'Video calling feature'
    ],
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 4999,
    duration: 6,
    features: [
      'All Premium features',
      'Profile highlighting',
      'Dedicated relationship manager',
      'Horoscope matching',
      'Priority in search results',
      'Exclusive events access'
    ]
  }
];

export class PaymentService {
  // Create Razorpay order
  static async createOrder(planId: string, userId: string): Promise<any> {
    try {
      const plan = PAYMENT_PLANS.find(p => p.id === planId);
      if (!plan) throw new Error('Invalid plan selected');

      // In a real implementation, you would call your backend API
      // which would create a Razorpay order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.price * 100, // Razorpay expects amount in paise
          currency: 'INR',
          planId,
          userId
        })
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      const orderData = await response.json();
      return orderData;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  // Process payment success
  static async processPaymentSuccess(
    orderId: string,
    paymentId: string,
    signature: string,
    planId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Verify payment signature (should be done on backend)
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          paymentId,
          signature,
          planId,
          userId
        })
      });

      if (!response.ok) throw new Error('Payment verification failed');

      const plan = PAYMENT_PLANS.find(p => p.id === planId);
      if (!plan) throw new Error('Invalid plan');

      // Create subscription record
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: planId,
          status: 'active',
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          cancel_at_period_end: false
        });

      if (subscriptionError) throw subscriptionError;

      // Update user profile subscription type
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_type: planId,
          subscription_expiry: endDate.toISOString()
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Create notification
      await this.createNotification(
        userId,
        'subscription_activated',
        'Subscription Activated!',
        `Your ${plan.name} subscription has been activated successfully.`,
        '/account'
      );

      return true;
    } catch (error) {
      console.error('Process payment success error:', error);
      return false;
    }
  }

  // Get user's current subscription
  static async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Get current subscription error:', error);
      return null;
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return false;
    }
  }

  // Reactivate subscription
  static async reactivateSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Reactivate subscription error:', error);
      return false;
    }
  }

  // Check if user has active subscription
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      if (!subscription) return false;

      const now = new Date();
      const endDate = new Date(subscription.current_period_end);
      
      return endDate > now && subscription.status === 'active';
    } catch (error) {
      console.error('Check active subscription error:', error);
      return false;
    }
  }

  // Get subscription history
  static async getSubscriptionHistory(userId: string): Promise<Subscription[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get subscription history error:', error);
      return [];
    }
  }

  // Check subscription limits
  static async checkSubscriptionLimits(userId: string, action: string): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      const plan = subscription ? PAYMENT_PLANS.find(p => p.id === subscription.plan) : null;

      // If no active subscription, apply free tier limits
      if (!plan) {
        switch (action) {
          case 'view_profile':
            return await this.checkDailyLimit(userId, 'profile_views', 10);
          case 'send_interest':
            return await this.checkDailyLimit(userId, 'interests_sent', 5);
          case 'send_message':
            return false; // Free users can't message
          default:
            return false;
        }
      }

      // Premium users have different limits based on their plan
      switch (plan.id) {
        case 'basic':
          switch (action) {
            case 'view_profile':
              return await this.checkDailyLimit(userId, 'profile_views', 50);
            case 'send_interest':
              return await this.checkDailyLimit(userId, 'interests_sent', 10);
            case 'send_message':
              return true;
            default:
              return true;
          }
        case 'premium':
        case 'elite':
          return true; // Unlimited for premium and elite
        default:
          return false;
      }
    } catch (error) {
      console.error('Check subscription limits error:', error);
      return false;
    }
  }

  // Check daily limit for specific action
  private static async checkDailyLimit(userId: string, action: string, limit: number): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_activity')
        .select('count')
        .eq('user_id', userId)
        .eq('action', action)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      const currentCount = data?.count || 0;
      return currentCount < limit;
    } catch (error) {
      console.error('Check daily limit error:', error);
      return false;
    }
  }

  // Record user activity for limit tracking
  static async recordActivity(userId: string, action: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try to increment existing record
      const { data: existing } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('action', action)
        .eq('date', today)
        .single();

      if (existing) {
        await supabase
          .from('user_activity')
          .update({ count: existing.count + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_activity')
          .insert({
            user_id: userId,
            action,
            date: today,
            count: 1
          });
      }
    } catch (error) {
      console.error('Record activity error:', error);
    }
  }

  // Create notification helper
  private static async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    actionUrl?: string
  ) {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          action_url: actionUrl,
          read: false,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Create notification error:', error);
    }
  }

  // Initialize Razorpay
  static initializeRazorpay(): Promise<any> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve((window as any).Razorpay);
      };
      document.body.appendChild(script);
    });
  }

  // Open Razorpay checkout
  static async openCheckout(orderData: any, onSuccess: (response: any) => void, onError: (error: any) => void) {
    try {
      const Razorpay = await this.initializeRazorpay();
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your Razorpay key ID
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Brahmin Soulmate Connect',
        description: 'Subscription Payment',
        order_id: orderData.id,
        handler: onSuccess,
        prefill: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          contact: orderData.customerPhone
        },
        theme: {
          color: '#E30613'
        },
        modal: {
          ondismiss: () => {
            onError(new Error('Payment cancelled by user'));
          }
        }
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      onError(error);
    }
  }
}