/**
 * Subscription and Plan related types
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  is_popular?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id?: string;
  plan?: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date?: string;
  end_date?: string;
  auto_renewal?: boolean;
  payment_id?: string;
}
