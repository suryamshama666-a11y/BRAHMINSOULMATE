/**
 * Payment-related type definitions
 * Provides strong typing for payment operations, orders, and subscriptions
 */

/**
 * Razorpay order data structure
 */
export interface RazorpayOrderData {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: 'created' | 'paid' | 'attempted';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Razorpay payment response from handler
 */
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Razorpay checkout options
 */
export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

/**
 * Payment plan definition
 */
export interface PaymentPlan {
  id: string;
  name: string;
  price: number; // in paise
  duration: number; // in days
  features: string[];
  popular?: boolean;
}

/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired';

/**
 * Subscription information
 */
export interface Subscription {
  subscription_type: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  subscription_status: SubscriptionStatus | null;
}

/**
 * Payment verification request
 */
export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Payment verification response
 */
export interface PaymentVerificationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Order creation request
 */
export interface OrderCreationRequest {
  plan_id: string;
  currency: string;
}

/**
 * Order creation response
 */
export interface OrderCreationResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Payment activity limits by plan
 */
export interface ActivityLimits {
  profile_views: number;
  interests_sent: number;
  messages: number;
}

/**
 * Plan limits mapping
 */
export type PlanLimitsMap = Record<string, ActivityLimits>;

/**
 * User activity record
 */
export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  date: string;
  count: number;
  updated_at: string;
}

/**
 * Payment error with context
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

/**
 * Type guard for Razorpay payment response
 */
export function isRazorpayPaymentResponse(
  obj: unknown
): obj is RazorpayPaymentResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'razorpay_payment_id' in obj &&
    'razorpay_order_id' in obj &&
    'razorpay_signature' in obj &&
    typeof (obj as Record<string, unknown>).razorpay_payment_id === 'string' &&
    typeof (obj as Record<string, unknown>).razorpay_order_id === 'string' &&
    typeof (obj as Record<string, unknown>).razorpay_signature === 'string'
  );
}

/**
 * Type guard for subscription
 */
export function isSubscription(obj: unknown): obj is Subscription {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('subscription_type' in obj || 'subscription_status' in obj)
  );
}

/**
 * Type guard for payment plan
 */
export function isPaymentPlan(obj: unknown): obj is PaymentPlan {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'price' in obj &&
    'duration' in obj &&
    'features' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).name === 'string' &&
    typeof (obj as Record<string, unknown>).price === 'number' &&
    typeof (obj as Record<string, unknown>).duration === 'number' &&
    Array.isArray((obj as Record<string, unknown>).features)
  );
}
