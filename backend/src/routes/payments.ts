import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getSupabase } from '../config/supabase';
import { validatePayment } from '../middleware/validation';

const router = express.Router();

// Lazy supabase client for type-checks; CI does not call these routes
const supabase = getSupabase()!;


// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Payment plans
const PLANS = {
  basic: { price: 99900, duration: 1, name: 'Basic' }, // ₹999
  premium: { price: 249900, duration: 3, name: 'Premium' }, // ₹2499
  elite: { price: 499900, duration: 6, name: 'Elite' }, // ₹4999
};

// Create Razorpay order
router.post('/create-order', validatePayment.createOrder, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan selected'
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: plan.price, // amount in paise
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId,
        planId,
        planName: plan.name
      }
    });

    // Store order in database
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase not configured' });
    }

    const { error: dbError } = await supabase
      .from('payment_orders')
      .insert({
        id: order.id,
        user_id: userId,
        plan_id: planId,
        amount: plan.price,
        currency: 'INR',
        status: 'created'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create order record'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planName: plan.name
      }
    });

  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
});

// Verify payment
router.post('/verify-payment', validatePayment.verifyPayment, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId
    } = req.body;
    const userId = req.user.id;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        error: 'Payment not captured'
      });
    }

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan'
      });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    // Create subscription record
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan: planId,
        status: 'active',
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
        payment_id: razorpay_payment_id,
        amount: plan.price,
        currency: 'INR'
      });

    if (subscriptionError) {
      console.error('Subscription creation error:', subscriptionError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create subscription'
      });
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_type: planId,
        subscription_expiry: endDate.toISOString()
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Update payment order status
    await supabase
      .from('payment_orders')
      .update({
        status: 'completed',
        payment_id: razorpay_payment_id
      })
      .eq('id', razorpay_order_id);

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'subscription_activated',
        title: 'Subscription Activated!',
        message: `Your ${plan.name} subscription has been activated successfully.`,
        read: false
      });

    // Send confirmation email
    try {
      await sendSubscriptionConfirmationEmail(userId, plan.name, endDate);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the payment for email errors
    }

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      data: {
        subscriptionType: planId,
        expiryDate: endDate.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed'
    });
  }
});

// Get current subscription
router.get('/subscription', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      success: true,
      data: subscription
    });

  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Mark subscription for cancellation at period end
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      throw updateError;
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'subscription_cancelled',
        title: 'Subscription Cancelled',
        message: 'Your subscription will be cancelled at the end of the current billing period.',
        read: false
      });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period'
    });

  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

// Get payment history
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const { data: payments, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: payments
    });

  } catch (error: any) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment history'
    });
  }
});

// Webhook for payment status updates
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body.toString());

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions
async function sendSubscriptionConfirmationEmail(userId: string, planName: string, expiryDate: Date) {
  // Implementation depends on your email service (SendGrid, Nodemailer, etc.)
  // This is a placeholder
  console.log(`Sending subscription confirmation email to user ${userId}`);
}

async function handlePaymentCaptured(payment: any) {
  console.log('Payment captured:', payment.id);
  // Update payment status in database
}

async function handlePaymentFailed(payment: any) {
  console.log('Payment failed:', payment.id);
  // Handle failed payment
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log('Subscription cancelled:', subscription.id);
  // Handle subscription cancellation
}

export default router;