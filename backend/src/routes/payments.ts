import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Razorpay lazily or with fallbacks to prevent crash if env vars are missing during startup
const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder'
  });
};

const razorpay = getRazorpay();

// Subscription plans
const PLANS: Record<string, { price: number; duration: number; name: string }> = {
  basic_monthly: { price: 99900, duration: 30, name: 'Basic Monthly' },
  premium_monthly: { price: 199900, duration: 30, name: 'Premium Monthly' },
  premium_quarterly: { price: 499900, duration: 90, name: 'Premium Quarterly' },
  premium_yearly: { price: 1499900, duration: 365, name: 'Premium Yearly' }
};

// Create order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { plan_id, amount, currency } = req.body;
    const userId = req.user?.id;

    if (!PLANS[plan_id]) {
      return res.status(400).json({ success: false, error: 'Invalid plan' });
    }

    const planDetails = PLANS[plan_id];
    
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: currency || 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId,
        plan: plan_id,
        duration: planDetails.duration
      }
    });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify payment
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?.id;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // Fetch order details to get plan info
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const plan = order.notes?.plan as string;
    const planDetails = plan ? PLANS[plan] : null;

    if (!planDetails) {
      return res.status(400).json({ success: false, error: 'Invalid plan in order' });
    }

    // Record payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        amount: (order.amount as number) / 100, // Convert from paise
        currency: order.currency,
        plan,
        status: 'completed'
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get subscription status
router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_type, subscription_start, subscription_end, subscription_status')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json({ success: true, subscription: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel subscription
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_end: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Payment history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, payments: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
