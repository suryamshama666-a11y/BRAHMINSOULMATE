import express from 'express';
import { supabase } from '../config/supabase';
import twilio from 'twilio';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { communicationLimiter } from '../middleware/rateLimiter';
import { preventHardDelete } from '../middleware/softDelete';
import { logger } from '../utils/logger';

const router = express.Router();

// ✅ NEW: Prevent hard deletes on notifications
router.use(preventHardDelete);

// Helper function to get error message
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

// SendGrid mail interface
interface SendGridMail {
  setApiKey: (key: string) => void;
  send: (msg: { to: string; from: string; subject: string; html: string }) => Promise<void>;
}

// SendGrid configuration (optional - install @sendgrid/mail if needed)
let sgMail: SendGridMail | null = null;

// Initialize SendGrid asynchronously using dynamic import with string literal
const initSendGrid = async (): Promise<void> => {
  try {
    // Use string variable to prevent TypeScript from checking the module
    const moduleName = '@sendgrid/mail';
    const sendgridModule = await (Function('moduleName', 'return import(moduleName)')(moduleName) as Promise<{ default: SendGridMail }>).catch(() => null);
    if (sendgridModule && process.env.SENDGRID_API_KEY) {
      sendgridModule.default.setApiKey(process.env.SENDGRID_API_KEY);
      sgMail = sendgridModule.default;
    }
  } catch {
    logger.info('SendGrid not installed. Email notifications will be disabled.');
  }
};

// Initialize on module load
initSendGrid();

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
      .select('id, user_id, type, title, message, read, action_url, sender_id, created_at')
      .eq('user_id', userId)
      .is('deleted_at', null)  // Filter out deleted notifications
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json({ success: true, notifications: data });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
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
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
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
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Send email notification - RESTRICTED TO INTERNAL/ADMIN USE ONLY
router.post('/email', authMiddleware, adminMiddleware, communicationLimiter, async (req, res) => {
  try {
    const { to, subject, message, type } = req.body;

    if (!sgMail || !process.env.SENDGRID_API_KEY) {
      logger.warn('Email service not configured');
      return res.status(503).json({ success: false, error: 'Email service not configured' });
    }

    // Use template if type is provided
    let emailContent = { subject, html: message };
    
    if (type && emailTemplates[type as keyof typeof emailTemplates]) {
      const templateData = req.body.templateData || {};
      // Call template function based on type
      if (type === 'interestReceived') {
        const { senderName = '', profileUrl = '' } = templateData as { senderName?: string; profileUrl?: string };
        emailContent = emailTemplates.interestReceived(senderName, profileUrl);
      } else if (type === 'interestAccepted') {
        const { receiverName = '', chatUrl = '' } = templateData as { receiverName?: string; chatUrl?: string };
        emailContent = emailTemplates.interestAccepted(receiverName, chatUrl);
      } else if (type === 'newMessage') {
        const { senderName = '', messagePreview = '', chatUrl = '' } = templateData as { senderName?: string; messagePreview?: string; chatUrl?: string };
        emailContent = emailTemplates.newMessage(senderName, messagePreview, chatUrl);
      } else if (type === 'subscriptionExpiring') {
        const { daysLeft = 0, renewUrl = '' } = templateData as { daysLeft?: number; renewUrl?: string };
        emailContent = emailTemplates.subscriptionExpiring(daysLeft, renewUrl);
      }
    }

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@brahminsoulmate.com',
      subject: emailContent.subject,
      html: emailContent.html
    };

    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    logger.error('Email send error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Send SMS notification - RESTRICTED TO INTERNAL/ADMIN USE ONLY
router.post('/sms', authMiddleware, adminMiddleware, communicationLimiter, async (req, res) => {
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
  } catch (error) {
    logger.error('SMS send error:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
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
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

export default router;
