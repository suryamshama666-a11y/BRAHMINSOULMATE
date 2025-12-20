import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder'
});

// Subscription plans
const PLANS: Record<string, { price: number; duration: number; name: string }> = {
  basic_monthly: { price: 99900, duration: 30, name: 'Basic Monthly' },
  premium_monthly: { price: 199900, duration: 30, name: 'Premium Monthly' },
  premium_quarterly: { price: 499900, duration: 90, name: 'Premium Quarterly' },
  premium_yearly: { price: 1499900, duration: 365, name: 'Premium Yearly' }
};

// Create order
router.post('/create-order', authMiddleware, asyncHandler(async (req, res) => {
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
}));

// Verify payment
router.post('/verify', authMiddleware, asyncHandler(async (req, res) => {
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

  // Fetch order details
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
      amount: (order.amount as number) / 100,
      currency: order.currency,
      plan,
      status: 'completed'
    })
    .select()
    .single();

  if (paymentError) throw paymentError;

  // Update profile subscription status
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + planDetails.duration);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_type: plan,
      subscription_status: 'active',
      subscription_start: new Date().toISOString(),
      subscription_end: endDate.toISOString()
    })
    .eq('id', userId);

  if (profileError) throw profileError;

  res.json({ success: true, payment });
}));

// Get subscription status
router.get('/subscription', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_type, subscription_start, subscription_end, subscription_status')
    .eq('id', userId)
    .single();

  if (error) throw error;
  res.json({ success: true, subscription: data });
}));

// Cancel subscription
router.post('/cancel', authMiddleware, asyncHandler(async (req, res) => {
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
}));

// Payment history
router.get('/history', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  res.json({ success: true, payments: data });
}));

export default router;
