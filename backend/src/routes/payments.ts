import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { paymentLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';
import * as Sentry from '@sentry/node';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder'
});

// Subscription plans
export const PLANS: Record<string, { price: number; duration: number; name: string }> = {
  basic_monthly: { price: 99900, duration: 30, name: 'Basic Monthly' },
  premium_monthly: { price: 199900, duration: 30, name: 'Premium Monthly' },
  premium_quarterly: { price: 499900, duration: 90, name: 'Premium Quarterly' },
  premium_yearly: { price: 1499900, duration: 365, name: 'Premium Yearly' }
};

/**
 * Helper to record payment and update profile atomically (idempotent)
 */
async function processSuccessfulPayment(orderId: string, paymentId: string, amount: number, currency: string, plan: string, userId: string) {
  const planDetails = PLANS[plan];
  if (!planDetails) throw new Error(`Invalid plan: ${plan}`);

  // 1. Check for existing payment to ensure idempotency
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('payment_id', paymentId)
    .single();

  if (existingPayment) {
    console.log(`[Payment] Idempotency check: Payment ${paymentId} already processed.`);
    return { success: true, already_processed: true };
  }

  // 2. Perform updates via RPC if possible, or sequential with error handling
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + planDetails.duration);

  try {
    // Use RPC for atomic operation
    const { error: rpcError } = await supabase.rpc('handle_successful_payment', {
      p_user_id: userId,
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_amount: amount / 100,
      p_currency: currency,
      p_plan: plan,
      p_end_date: endDate.toISOString()
    });

    if (rpcError) {
      console.error('[Payment RPC Error]:', rpcError);
      throw rpcError;
    }
  } catch (error) {
    console.error('[Payment Processing Error]:', error);
    // Manual fallback if RPC isn't set up yet
    const { error: payErr } = await supabase.from('payments').insert({
      user_id: userId, order_id: orderId, payment_id: paymentId,
      amount: amount / 100, currency, plan, status: 'completed'
    });
    
    if (payErr) throw payErr;

    const { error: profErr } = await supabase.from('profiles').update({
      subscription_type: plan, subscription_status: 'active',
      subscription_start: new Date().toISOString(), subscription_end: endDate.toISOString()
    }).eq('user_id', userId);
    
    if (profErr) throw profErr;
  }

  return { success: true };
}

// Create order
router.post('/create-order', authMiddleware, paymentLimiter, asyncHandler(async (req, res) => {
  const { plan_id, currency } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });
  if (!PLANS[plan_id]) return res.status(400).json({ success: false, error: 'Invalid plan' });

  const planDetails = PLANS[plan_id];
  const order = await razorpay.orders.create({
    amount: planDetails.price,
    currency: currency || 'INR',
    receipt: `order_${userId}_${Date.now()}`,
    notes: { userId, plan: plan_id }
  });

  res.json(order);
}));

// Verify payment (Client-side trigger)
router.post('/verify', authMiddleware, paymentLimiter, asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user?.id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }

  const order = await razorpay.orders.fetch(razorpay_order_id);
  const plan = order.notes?.plan as string;

  const result = await processSuccessfulPayment(
    razorpay_order_id,
    razorpay_payment_id,
    order.amount as number,
    order.currency as string,
    plan,
    userId!
  );

  res.json(result);
}));

// Webhook for Razorpay (Server-to-Server trigger)
// IMPORTANT: Disable bodyParser.json() for this route if using raw-body for signature verification
router.post('/webhook', asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!secret || !signature) {
    return res.status(400).send('Missing secret or signature');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update((req as any).rawBody || '')
    .digest('hex');

  if (expectedSignature !== signature) {
    console.error('[Webhook] Invalid signature');
    return res.status(400).send('Invalid signature');
  }

  const event = req.body.event;
  const payment = req.body.payload.payment.entity;

  if (event === 'payment.captured') {
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const userId = payment.notes.userId;
    const plan = payment.notes.plan;

    try {
      await processSuccessfulPayment(
        orderId,
        paymentId,
        payment.amount,
        payment.currency,
        plan,
        userId
      );
      console.log(`[Webhook] Payment ${paymentId} processed successfully for user ${userId}`);
    } catch (err) {
      console.error(`[Webhook] Error processing payment ${paymentId}:`, err);
      Sentry.captureException(err);
      return res.status(500).send('Processing failed');
    }
  }

  res.json({ status: 'ok' });
}));

// Get subscription status
router.get('/subscription', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_type, subscription_start, subscription_end, subscription_status')
    .eq('user_id', userId)
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
    .eq('user_id', userId);

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

