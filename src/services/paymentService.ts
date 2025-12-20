import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Subscription = {
  subscription_type: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  subscription_status: string | null;
};

export interface PaymentPlan {
  id: string;
  name: string;
  price: number; // in paise
  duration: number; // in days
  features: string[];
  popular?: boolean;
}

export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'basic_monthly',
    name: 'Basic Monthly',
    price: 99900,
    duration: 30,
    features: [
      'View up to 50 profiles per day',
      'Send up to 10 interests per day',
      'Basic search filters',
      'Standard customer support'
    ]
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 199900,
    duration: 30,
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
    id: 'premium_quarterly',
    name: 'Premium Quarterly',
    price: 499900,
    duration: 90,
    features: [
      'All Premium features',
      '3 months validity',
      'Save ₹998 compared to monthly',
      'Advanced search filters',
      'Video calling feature'
    ]
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 1499900,
    duration: 365,
    features: [
      'All Premium features',
      'Dedicated relationship manager',
      'Profile highlighting',
      'Save ₹8989 compared to monthly',
      'Exclusive events access'
    ]
  }
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export class PaymentService {
  // Create Razorpay order via backend
  static async createOrder(planId: string, userId: string): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          plan_id: planId,
          currency: 'INR'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  // Verify payment via backend
  static async verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment verification failed');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Verify payment error:', error);
      return false;
    }
  }

  // Get user's current subscription from backend/profile
  static async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const response = await fetch(`${API_BASE_URL}/api/payments/subscription`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) return null;
      
      const result = await response.json();
      return result.subscription;
    } catch (error) {
      console.error('Get current subscription error:', error);
      return null;
    }
  }

  // Cancel subscription via backend
  static async cancelSubscription(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const response = await fetch(`${API_BASE_URL}/api/payments/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) return false;
      return true;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return false;
    }
  }

  // Check subscription limits using user_activity table
  static async checkSubscriptionLimits(userId: string, action: string): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      const planId = subscription?.subscription_status === 'active' ? subscription.subscription_type : 'free';

      const limits: Record<string, Record<string, number>> = {
        free: { profile_views: 10, interests_sent: 5, messages: 0 },
        basic_monthly: { profile_views: 50, interests_sent: 10, messages: 100 },
        premium_monthly: { profile_views: 999999, interests_sent: 999999, messages: 999999 },
        premium_quarterly: { profile_views: 999999, interests_sent: 999999, messages: 999999 },
        premium_yearly: { profile_views: 999999, interests_sent: 999999, messages: 999999 },
      };

      const currentPlanLimits = limits[planId || 'free'] || limits.free;
      const limit = currentPlanLimits[action];

      if (limit === undefined) return true;
      if (limit === 0) return false;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_activity')
        .select('count')
        .eq('user_id', userId)
        .eq('action', action)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return (data?.count || 0) < limit;
    } catch (error) {
      console.error('Check subscription limits error:', error);
      return false;
    }
  }

  // Record activity
  static async recordActivity(userId: string, action: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing, error: fetchError } = await supabase
        .from('user_activity')
        .select('id, count')
        .eq('user_id', userId)
        .eq('action', action)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_activity')
          .update({ 
            count: (existing.count || 0) + 1,
            updated_at: new Date().toISOString()
          })
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

  // Initialize Razorpay script
  static initializeRazorpay(): Promise<any> {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve((window as any).Razorpay);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve((window as any).Razorpay);
      script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
      document.body.appendChild(script);
    });
  }

  // Open Razorpay checkout
  static async openCheckout(
    orderData: any, 
    onSuccess: (response: any) => void, 
    onError: (error: any) => void
  ) {
    try {
      const RazorpaySDK = await this.initializeRazorpay();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Brahmin Soulmate Connect',
        description: `Subscription: ${orderData.notes?.plan || 'Premium'}`,
        order_id: orderData.id,
        handler: onSuccess,
        prefill: {
          name: '', // Will be filled if user profile exists
          email: '',
          contact: ''
        },
        theme: {
          color: '#E30613'
        },
        modal: {
          ondismiss: () => onError(new Error('Payment cancelled by user'))
        }
      };

      const rzp = new RazorpaySDK(options);
      rzp.open();
    } catch (error) {
      onError(error);
    }
  }
}
