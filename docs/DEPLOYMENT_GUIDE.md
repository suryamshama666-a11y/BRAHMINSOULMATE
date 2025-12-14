# Deployment Guide - Brahmin Soulmate Connect

## Pre-Deployment Checklist

### 1. Environment Setup

#### Production Supabase Project
```bash
# Create production project at https://supabase.com
# Note down:
- Project URL
- Anon Key
- Service Role Key
```

#### Environment Variables
Create `.env.production` file:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay (Live Mode)
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_live_secret

# SendGrid
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@brahminsoulmate.com

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# App Config
VITE_APP_URL=https://brahminsoulmate.com
NODE_ENV=production
```

### 2. Database Setup

#### Run Migrations
```bash
# Connect to production Supabase
cd supabase

# Run migrations in order
supabase db push

# Or manually via Supabase SQL Editor:
# 1. 20251107_brahmin_matrimonial_schema.sql
# 2. 20251108_complete_features.sql
# 3. 20251108_matching_and_analytics.sql
# 4. 20251108_photos_and_horoscope.sql
# 5. 20251108_notifications_and_verification.sql
# 6. 20251108_vdates_stories_forum.sql
```

#### Create Storage Buckets
```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-photos', 'profile-photos', true),
  ('horoscope-files', 'horoscope-files', false),
  ('verification-documents', 'verification-documents', false),
  ('success-stories', 'success-stories', true);
```

#### Set Storage Policies
```sql
-- Profile Photos (Public Read)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');

-- Verification Documents (Private)
CREATE POLICY "Owner Access" ON storage.objects FOR SELECT 
  USING (bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Similar policies for other buckets...
```

### 3. External Services Setup

#### Razorpay
1. Create account at https://razorpay.com
2. Complete KYC verification
3. Switch to Live mode
4. Get Live API keys from Dashboard > Settings > API Keys
5. Set up webhooks:
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events: `payment.captured`, `subscription.charged`

#### SendGrid
1. Create account at https://sendgrid.com
2. Verify sender email/domain
3. Create API key with Mail Send permissions
4. Set up domain authentication (SPF, DKIM, DMARC)
5. Create email templates in SendGrid dashboard

#### Twilio
1. Create account at https://twilio.com
2. Purchase phone number
3. Get Account SID and Auth Token
4. Configure messaging service
5. Set up compliance (if required for your region)

### 4. Frontend Deployment

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Option C: Custom Server (Nginx)
```bash
# Build
npm run build

# Copy dist folder to server
scp -r dist/* user@server:/var/www/brahminsoulmate

# Nginx config
server {
    listen 80;
    server_name brahminsoulmate.com;
    root /var/www/brahminsoulmate;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 5. Backend Deployment

#### Option A: Vercel Serverless
```bash
# Deploy backend as serverless functions
cd backend
vercel --prod
```

#### Option B: Railway/Render
```bash
# Connect GitHub repo
# Set environment variables
# Deploy automatically on push
```

#### Option C: VPS (PM2)
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start src/index.ts --name brahmin-backend

# Save PM2 config
pm2 save
pm2 startup
```

### 6. Domain & SSL

#### Domain Setup
```bash
# Point domain to deployment
# A Record: @ -> Your server IP
# CNAME: www -> your-app.vercel.app
```

#### SSL Certificate
```bash
# Using Certbot (Let's Encrypt)
sudo certbot --nginx -d brahminsoulmate.com -d www.brahminsoulmate.com

# Or use Cloudflare for free SSL
```

### 7. Cron Jobs Setup

#### Option A: Vercel Cron
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/expire-subscriptions",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/event-reminders",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/check-missed-vdates",
      "schedule": "0 * * * *"
    }
  ]
}
```

#### Option B: System Cron
```bash
# Edit crontab
crontab -e

# Add jobs
0 0 * * * curl https://your-domain.com/api/cron/expire-subscriptions
0 8 * * * curl https://your-domain.com/api/cron/event-reminders
0 * * * * curl https://your-domain.com/api/cron/check-missed-vdates
```

### 8. Monitoring Setup

#### Sentry (Error Tracking)
```bash
npm install @sentry/react @sentry/tracing

# Initialize in main.tsx
Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

#### Google Analytics
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

#### Uptime Monitoring
- Use UptimeRobot or Pingdom
- Monitor: Homepage, API endpoints, Database

### 9. Security Hardening

#### Rate Limiting
```typescript
// Add to backend
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### CORS Configuration
```typescript
app.use(cors({
  origin: 'https://brahminsoulmate.com',
  credentials: true
}));
```

#### Security Headers
```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 10. Performance Optimization

#### CDN Setup
```bash
# Use Cloudflare CDN
# Or configure Vercel Edge Network
```

#### Image Optimization
```bash
# Install sharp for image processing
npm install sharp

# Configure in storage service
```

#### Database Optimization
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_profiles_location ON profiles(city, state);
CREATE INDEX idx_matches_score ON matches(compatibility_score DESC);
```

## Post-Deployment Tasks

### 1. Create Admin User
```sql
-- Update a user to admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@brahminsoulmate.com';
```

### 2. Test Critical Flows
- [ ] User registration and login
- [ ] Profile creation
- [ ] Search and filtering
- [ ] Send/receive interests
- [ ] Messaging
- [ ] Payment flow (test mode first!)
- [ ] Photo upload
- [ ] Event registration
- [ ] V-Date scheduling

### 3. Configure Email Templates
- [ ] Welcome email
- [ ] Interest received
- [ ] Interest accepted
- [ ] New message
- [ ] Subscription expiry
- [ ] Event reminders

### 4. Set Up Backup Strategy
```bash
# Supabase automatic backups (included)
# Additional backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 5. Legal Pages
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Refund Policy
- [ ] Cookie Policy

## Rollback Plan

### If Issues Occur
```bash
# 1. Revert to previous deployment
vercel rollback

# 2. Restore database backup
psql $DATABASE_URL < backup_YYYYMMDD.sql

# 3. Check error logs
vercel logs
supabase logs

# 4. Notify users via status page
```

## Maintenance

### Daily Tasks
- Monitor error logs
- Check payment transactions
- Review user reports

### Weekly Tasks
- Database performance review
- Storage usage check
- Security updates

### Monthly Tasks
- Backup verification
- Performance optimization
- Feature usage analytics

## Support Contacts

### Technical Issues
- Supabase: support@supabase.io
- Vercel: support@vercel.com
- Razorpay: support@razorpay.com
- SendGrid: support@sendgrid.com
- Twilio: support@twilio.com

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check Supabase status
# Verify connection string
# Check RLS policies
```

**Payment Not Processing**
```bash
# Verify Razorpay keys
# Check webhook configuration
# Review payment logs
```

**Emails Not Sending**
```bash
# Verify SendGrid API key
# Check domain authentication
# Review email logs
```

**Images Not Loading**
```bash
# Check storage bucket policies
# Verify CORS configuration
# Check CDN cache
```

## Success Metrics

### Track These KPIs
- User registrations per day
- Profile completion rate
- Match acceptance rate
- Message response rate
- Subscription conversion rate
- Event attendance rate
- User retention (30-day)

## Conclusion

Your Brahmin Soulmate Connect platform is now deployed and ready to serve users! 🎉

For ongoing support and updates, refer to:
- Technical documentation in `/docs`
- API documentation (generate with Swagger)
- User guides and FAQs
- Admin dashboard

**Remember:** Start with a soft launch to a limited audience, gather feedback, and iterate before full public launch.

Good luck! 🚀
