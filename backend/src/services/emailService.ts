import nodemailer from 'nodemailer';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Brahmin Soulmate Connect" <${process.env.EMAIL_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      await this.transporter.sendMail(mailOptions);
      await this.logEmail(emailData);
      return true;
    } catch (error) {
      logger.error('Email sending failed:', error);
      return false;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const template = this.getWelcomeTemplate(userName);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendVerificationEmail(userEmail: string, verificationToken: string): Promise<boolean> {
    const template = this.getVerificationTemplate(verificationToken);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const template = this.getPasswordResetTemplate(resetToken);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendInterestNotification(userEmail: string, senderName: string): Promise<boolean> {
    const template = this.getInterestNotificationTemplate(senderName);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendMessageNotification(userEmail: string, senderName: string): Promise<boolean> {
    const template = this.getMessageNotificationTemplate(senderName);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendSubscriptionConfirmation(userEmail: string, planName: string, expiryDate: Date): Promise<boolean> {
    const template = this.getSubscriptionTemplate(planName, expiryDate);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendVDateReminder(userEmail: string, partnerName: string, dateTime: Date): Promise<boolean> {
    const template = this.getVDateReminderTemplate(partnerName, dateTime);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  private getWelcomeTemplate(userName: string): EmailTemplate {
    return {
      subject: 'Welcome to Brahmin Soulmate Connect! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E30613, #FF6B32); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Brahmin Soulmate Connect!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #E30613;">Hello ${userName}! 👋</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Welcome to India's most trusted Brahmin matrimonial platform! We're excited to help you find your perfect life partner.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #E30613; margin-top: 0;">Get Started:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Complete your profile with photos</li>
                <li>Set your partner preferences</li>
                <li>Browse compatible matches</li>
                <li>Send interests to profiles you like</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/profile-setup" 
                 style="background: #E30613; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Complete Your Profile
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Need help? Contact our support team at support@brahminsoulmate.com
            </p>
          </div>
        </div>
      `,
      text: `Welcome to Brahmin Soulmate Connect, ${userName}! Complete your profile to start finding matches.`
    };
  }

  private getVerificationTemplate(token: string): EmailTemplate {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    return {
      subject: 'Verify Your Email - Brahmin Soulmate Connect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #E30613; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Email Verification</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">
              Please click the button below to verify your email address:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #E30613; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                Verify Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link: ${verificationUrl}
            </p>
          </div>
        </div>
      `,
      text: `Verify your email: ${verificationUrl}`
    };
  }

  private getPasswordResetTemplate(token: string): EmailTemplate {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return {
      subject: 'Reset Your Password - Brahmin Soulmate Connect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #E30613; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">
              You requested a password reset. Click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #E30613; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `Reset your password: ${resetUrl}`
    };
  }

  private getInterestNotificationTemplate(senderName: string): EmailTemplate {
    return {
      subject: `${senderName} sent you an interest! 💕`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E30613, #FF6B32); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Interest Received! 💕</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">
              Great news! <strong>${senderName}</strong> has expressed interest in your profile.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/interests-received" 
                 style="background: #E30613; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                View Interest
              </a>
            </div>
          </div>
        </div>
      `,
      text: `${senderName} sent you an interest! View it on Brahmin Soulmate Connect.`
    };
  }

  private getMessageNotificationTemplate(senderName: string): EmailTemplate {
    return {
      subject: `New message from ${senderName} 💬`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #E30613; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Message! 💬</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">
              You have a new message from <strong>${senderName}</strong>.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/messages" 
                 style="background: #E30613; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                Read Message
              </a>
            </div>
          </div>
        </div>
      `,
      text: `New message from ${senderName}. Check your messages on Brahmin Soulmate Connect.`
    };
  }

  private getSubscriptionTemplate(planName: string, expiryDate: Date): EmailTemplate {
    return {
      subject: `${planName} Subscription Activated! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E30613, #FF6B32); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Subscription Activated! 🎉</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">
              Your <strong>${planName}</strong> subscription has been successfully activated!
            </p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Valid Until:</strong> ${expiryDate.toLocaleDateString()}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" 
                 style="background: #E30613; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                Start Exploring
              </a>
            </div>
          </div>
        </div>
      `,
      text: `Your ${planName} subscription is now active until ${expiryDate.toLocaleDateString()}.`
    };
  }

  private getVDateReminderTemplate(partnerName: string, dateTime: Date): EmailTemplate {
    return {
      subject: `V-Date Reminder: Meeting with ${partnerName} 📅`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #E30613; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">V-Date Reminder 📅</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">
              Don't forget! You have a V-Date scheduled with <strong>${partnerName}</strong>.
            </p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Date & Time:</strong> ${dateTime.toLocaleString()}</p>
              <p><strong>Partner:</strong> ${partnerName}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/v-dates" 
                 style="background: #E30613; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                Join V-Date
              </a>
            </div>
          </div>
        </div>
      `,
      text: `V-Date reminder: Meeting with ${partnerName} on ${dateTime.toLocaleString()}.`
    };
  }

  private async logEmail(emailData: EmailData): Promise<void> {
    try {
      await supabase
        .from('email_logs')
        .insert({
          to_email: emailData.to,
          subject: emailData.subject,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      logger.error('Failed to log email:', error);
    }
  }
}

export const emailService = new EmailService();
export default emailService;