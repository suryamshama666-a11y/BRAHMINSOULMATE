/**
 * Extended Window interface for global browser APIs
 * Provides type safety for third-party libraries and global objects
 */

/**
 * Google Analytics 4 (GA4) types
 */
interface GTagEvent {
  event: string;
  [key: string]: unknown;
}

interface GTagConfig {
  send_page_view?: boolean;
  user_id?: string;
  [key: string]: unknown;
}

interface GTagConsent {
  analytics_storage?: 'granted' | 'denied';
  [key: string]: unknown;
}

type GTagFunction = (
  command: 'js' | 'config' | 'event' | 'consent',
  ...args: unknown[]
) => void;

/**
 * Razorpay SDK types
 */
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  [key: string]: unknown;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckout {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: 'payment.failed', callback: (response: { error: { description: string } }) => void): void;
}

/**
 * Extended Window interface
 */
declare global {
  interface Window {
    /**
     * Google Analytics 4 data layer
     */
    dataLayer?: unknown[];

    /**
     * Google Analytics 4 gtag function
     */
    gtag?: GTagFunction;

    /**
     * Razorpay checkout SDK
     */
    Razorpay?: RazorpayCheckout;

    /**
     * Additional global properties
     */
    [key: string]: unknown;
  }
}

export {};
