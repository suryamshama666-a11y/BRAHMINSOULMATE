import express from 'express';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// SendGrid configuration (optional - install @sendgrid/mail if needed)
let sgMail: any = null;
try {
  sgMail = require('@sendgrid/mail');
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
} catch (e) {
  console.log('SendGrid not installed. Email notifications will be disabled.');
}

// Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Email templates
const emailTemplates = {
  interestReceived: (senderName: string, profileUrl: string) => ({
    subject: `${senderName} is interested in your profile`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E30613;">New Interest Received!</h2>
        <p>Hi there,</p>
        <p><strong>${senderName}</strong> has expressed interest in your profile on Brahmin Soulmate Connect.</p>
        <p>
          <a href="${profileUrl}" style="background-color: #E30613; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Profile
          </a>
        </p>
        <p>Best regards,<br>Brahmin Soulmate Connect Team</p>
      </div>
    `
  }),
  interestAccepted: (receiverName: string, chatUrl: string) => ({
    subject: `${receiverName} accepted your interest!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E30613;">Interest Accepted!</h2>
        <p>Great news!</p>
        <p><strong>${receiverName}</strong> has accepted your interest. You can now start messaging each other.</p>
        <p>
          <a href="${chatUrl}" style="background-color: #E30613; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Start Conversation
          </a>
        </p>
        <p>Best regards,<br>Brahmin Soulmate Connect Team</p>
      </div>
    `
  }),
  newMessage: (senderName: string, messagePreview: string, chatUrl: string) => ({
    subject: `New message from ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E30613;">New Message</h2>
        <p><strong>${senderName}</strong> sent you a message:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0;">${messagePreview}</p>
        </div>
        <p>
          <a href="${chatUrl}" style="background-color: #E30613; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reply Now
          </a>
        </p>
        <p>Best regards,<br>Brahmin Soulmate Connect Team</p>
      </div>
    `
  }),
  subscriptionExpiring: (daysLeft: number, renewUrl: string) => ({
    subject: `Your subscription expires in ${daysLeft} days`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E30613;">Subscription Expiring Soon</h2>
        <p>Your premium subscription will expire in <strong>${daysLeft} days</strong>.</p>
        <p>Don't miss out on premium features like:</p>
        <ul>
          <li>Unlimited profile views</li>
          <li>Advanced matching algorithm</li>
          <li>Priority support</li>
          <li>Video dates</li>
        </ul>
        <p>
          <a href="${renewUrl}" style="background-color: #E30613; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Renew Subscription
          </a>
        </p>
        <p>Best regards,<br>Brahmin Soulmate Connect Team</p>
      </div>
    `
  })
};

// Get notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json({ success: true, notifications: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark as read
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark all as read
router.post('/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send email notification
router.post('/email', authMiddleware, async (req, res) => {
  try {
    const { to, subject, message, type } = req.body;

    if (!sgMail || !process.env.SENDGRID_API_KEY) {
      console.log('Email service not configured');
      return res.status(503).json({ success: false, error: 'Email service not configured' });
    }

    // Use template if type is provided
    let emailContent = { subject, html: message };
    
    if (type && emailTemplates[type as keyof typeof emailTemplates]) {
      const templateData = req.body.templateData || {};
      emailContent = (emailTemplates[type as keyof typeof emailTemplates] as any)(...Object.values(templateData));
    }

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@brahminsoulmate.com',
      subject: emailContent.subject,
      html: emailContent.html
    };

    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send SMS notification
router.post('/sms', authMiddleware, async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!twilioClient) {
      return res.status(503).json({ success: false, error: 'SMS service not configured' });
    }

    // Truncate message to 160 characters for SMS
    const smsMessage = message.length > 160 ? message.substring(0, 157) + '...' : message;

    await twilioClient.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('SMS send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update notification preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { email_notifications, sms_notifications, push_notifications } = req.body;

    const { error } = await supabase
      .from('profiles')
      .update({
        notification_preferences: {
          email: email_notifications,
          sms: sms_notifications,
          push: push_notifications
        }
      })
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
