import express from 'express';
import multer from 'multer';
import { getSupabase } from '../config/supabase';
import crypto from 'crypto';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// File upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-images') // Using the bucket from env
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ success: false, error: 'Upload failed' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    // Log upload activity
    const userId = req.user?.id || req.user?.user_id;
    if (userId) {
      await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'file_uploaded',
          activity_data: {
            filename: req.file.originalname,
            file_path: filePath,
            file_size: req.file.size,
            mime_type: req.file.mimetype
          }
        });
    }

    return res.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: req.file.size
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// Send email (placeholder - would integrate with email service)
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, message, template } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'to, subject, and message are required'
      });
    }

    // In a real implementation, integrate with:
    // - SendGrid
    // - Nodemailer with SMTP
    // - AWS SES
    // - Mailgun

    console.log('Email would be sent:', {
      to,
      subject,
      message,
      template,
      from: process.env.FROM_EMAIL || 'noreply@brahminsoulmate.com'
    });

    // Log email activity
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from('user_activities')
        .insert({
          user_id: req.user?.id || 'system',
          activity_type: 'email_sent',
          activity_data: {
            to,
            subject,
            template,
            sent_at: new Date().toISOString()
          }
        });
    }

    return res.json({
      success: true,
      message: 'Email sent successfully (placeholder)'
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// Send SMS (placeholder - would integrate with Twilio)
router.post('/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'to and message are required'
      });
    }

    // In a real implementation, integrate with Twilio:
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: to
    // });

    console.log('SMS would be sent:', {
      to,
      message,
      from: process.env.VITE_TWILIO_PHONE_NUMBER || '+1234567890'
    });

    // Log SMS activity
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from('user_activities')
        .insert({
          user_id: req.user?.id || 'system',
          activity_type: 'sms_sent',
          activity_data: {
            to,
            message: message.substring(0, 100), // Store first 100 chars for privacy
            sent_at: new Date().toISOString()
          }
        });
    }

    return res.json({
      success: true,
      message: 'SMS sent successfully (placeholder)'
    });
  } catch (error: any) {
    console.error('Send SMS error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send SMS' });
  }
});

// Generate report
router.post('/generate-report', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { report_type, filters, format = 'json' } = req.body;

    if (!report_type) {
      return res.status(400).json({
        success: false,
        error: 'report_type is required'
      });
    }

    const reportId = `rpt_${crypto.randomUUID()}`;
    let reportData: any = {};

    // Generate different types of reports
    switch (report_type) {
      case 'user_activity':
        const { data: activities } = await supabase
          .from('user_activities')
          .select('*')
          .gte('created_at', filters?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .lte('created_at', filters?.end_date || new Date().toISOString())
          .limit(1000);

        reportData = {
          type: 'user_activity',
          total_activities: activities?.length || 0,
          activities: activities || []
        };
        break;

      case 'matches_summary':
        const { count: totalMatches } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true });

        const { data: matchesByStatus } = await supabase
          .from('matches')
          .select('status');

        const statusBreakdown = matchesByStatus?.reduce((acc: any, match) => {
          acc[match.status] = (acc[match.status] || 0) + 1;
          return acc;
        }, {}) || {};

        reportData = {
          type: 'matches_summary',
          total_matches: totalMatches || 0,
          status_breakdown: statusBreakdown
        };
        break;

      case 'events_summary':
        const { data: events } = await supabase
          .from('events')
          .select('*, event_participants(count)')
          .gte('event_date', new Date().toISOString());

        reportData = {
          type: 'events_summary',
          upcoming_events: events?.length || 0,
          events: events || []
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report_type'
        });
    }

    // Log report generation
    await supabase
      .from('user_activities')
      .insert({
        user_id: req.user?.id || 'system',
        activity_type: 'report_generated',
        activity_data: {
          report_id: reportId,
          report_type,
          filters,
          generated_by: req.user?.id,
          generated_at: new Date().toISOString()
        }
      });

    return res.json({
      success: true,
      reportId,
      data: reportData,
      generated_at: new Date().toISOString(),
      format
    });
  } catch (error: any) {
    console.error('Generate report error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
});

export default router;

