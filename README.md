# Brahmin Soulmate Connect - Matrimonial Platform

A comprehensive, feature-rich matrimonial platform specifically designed for the Brahmin community, built with modern web technologies.

## 🌟 Features

### Core Matrimonial Features
- ✅ **Advanced Matching Algorithm** - 7-factor compatibility scoring
- ✅ **Gotra-Based Filtering** - Traditional compatibility checks
- ✅ **Horoscope Matching** - Vedic astrology compatibility (Moon sign, Nakshatra, Manglik)
- ✅ **Interest Management** - Send/receive interests with accept/decline
- ✅ **Real-time Messaging** - Instant chat with typing indicators
- ✅ **Advanced Search** - 10+ filter parameters

### Premium Features
- ✅ **Subscription Plans** - 4 tiers with Razorpay integration
- ✅ **Photo Management** - Privacy-controlled photo albums (max 10 photos)
- ✅ **Profile Verification** - Document verification with admin review
- ✅ **Video Dates (V-Dates)** - Jitsi Meet integration for virtual meetings

### Engagement Features
- ✅ **Multi-Channel Notifications** - Email, SMS, Push, In-app
- ✅ **Event Management** - Community events with registration
- ✅ **Success Stories** - Couple testimonials showcase
- ✅ **Community Forum** - Discussion boards with moderation

### Admin Features
- ✅ **User Management** - Role-based access control
- ✅ **Content Moderation** - Review and approve submissions
- ✅ **Analytics Dashboard** - User activity tracking
- ✅ **Verification Workflow** - Document review system

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Query** for data fetching
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Router** for navigation

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **Node.js/Express** for custom endpoints
- **Row Level Security** for data protection

### External Services
- **Razorpay** - Payment processing
- **SendGrid** - Email notifications
- **Twilio** - SMS notifications
- **Jitsi Meet** - Video conferencing

## 📊 Project Statistics

- **Services:** 17 complete API services
- **Database Tables:** 25+ with RLS
- **Storage Buckets:** 5 configured
- **Features:** 50+ major features
- **Lines of Code:** 10,000+

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Docker & Docker Compose (for production)
- Git

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd brahmin-matrimonial

# Install dependencies
npm install
npm run server:build  # Build backend

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npm run migrate:up

# Start development servers
npm run dev              # Frontend (port 8080)
npm run server:dev       # Backend (port 3001)
```

Visit `http://localhost:8080` to see the application.

### Production Deployment

#### Option 1: Docker Compose (Recommended)

```bash
# Pre-deployment check
bash scripts/pre-deploy-check.sh

# Start all services
npm run docker:compose:up

# Run migrations
npm run migrate:up

# Monitor health
npm run monitor
```

#### Option 2: Manual Deployment

```bash
# Build and start backend with PM2
npm run server:build
npm run server:start:pm2

# Deploy frontend to Vercel/Railway
npm run build
# Deploy dist/ folder to your hosting provider
```

#### Option 3: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Deploy
railway up
```

For detailed setup instructions, see [QUICK_START.md](./docs/QUICK_START.md)

## 📖 Documentation

- [Quick Start Guide](./docs/QUICK_START.md) - Get started with development
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Production deployment
- [Phase 2 Implementation](./docs/PHASE2_IMPLEMENTATION.md) - Core features
- [Phase 3 Implementation](./docs/PHASE3_IMPLEMENTATION.md) - Premium features
- [Phase 4 Implementation](./docs/PHASE4_IMPLEMENTATION.md) - Engagement features
- [Complete Summary](./docs/COMPLETE_IMPLEMENTATION_SUMMARY.md) - Full overview

## 🏗️ Project Structure

```
brahmin-matrimonial/
├── src/
│   ├── components/       # UI components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   └── lib/             # Libraries
├── backend/
│   └── src/
│       ├── routes/      # API routes
│       └── middleware/  # Express middleware
├── supabase/
│   └── migrations/      # Database migrations
├── docs/                # Documentation
└── public/             # Static assets
```

## 🔑 Key Services

### API Services (src/services/api/)
- `matching.service.ts` - Compatibility algorithm
- `messages.service.ts` - Real-time chat
- `interests.service.ts` - Interest management
- `payments.service.ts` - Subscriptions
- `photos.service.ts` - Photo management
- `horoscope.service.ts` - Horoscope matching
- `notifications.service.ts` - Multi-channel notifications
- `verification.service.ts` - Profile verification
- `events.service.ts` - Event management
- `vdates.service.ts` - Video dates
- `success-stories.service.ts` - Success stories
- `forum.service.ts` - Community forum

## 🔐 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ JWT authentication with token validation
- ✅ Role-based access control (admin, user)
- ✅ Input validation and sanitization
- ✅ Secure file storage
- ✅ Payment signature verification
- ✅ Rate limiting on sensitive endpoints
- ✅ PII scrubbing for logs/Sentry
- ✅ Content Security Policy (CSP) headers
- ✅ HTTP Strict Transport Security (HSTS)
- ✅ XSS protection headers

## 📱 Features by User Type

### Free Users
- Create profile
- Basic search (10 views/day)
- Send 5 interests/month
- View public photos
- Basic matching

### Premium Users
- Unlimited profile views
- Unlimited interests
- Advanced matching with horoscope
- View all photos
- Video dates
- Priority support
- Profile highlighting

### Admin Users
- User management
- Content moderation
- Verification review
- Analytics dashboard
- Event management

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚢 Deployment

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)

### Production Scripts

```bash
# Pre-deployment validation
npm run pre-deploy-check

# Database management
npm run migrate:up          # Run migrations
npm run migrate:down        # Rollback last migration
npm run migrate:status      # Check migration status

# Process management (PM2)
npm run server:start:pm2    # Start with PM2
npm run server:stop:pm2     # Stop PM2 processes
npm run server:restart:pm2  # Restart PM2 processes

# Docker operations
npm run docker:build        # Build Docker image
npm run docker:run          # Run Docker container
npm run docker:compose:up   # Start all services
npm run docker:compose:down # Stop all services

# Monitoring
npm run monitor             # Run health checks
```

### Environment Variables

**Critical for Production:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay secret (server-side only)
- `FRONTEND_URL` - Frontend application URL
- `SENTRY_DSN` - Sentry error tracking (optional)

**Never commit secrets to version control!**

## 📈 Roadmap

### Phase 5: Analytics & Polish (Planned)
- [ ] User analytics dashboard
- [ ] Profile optimization suggestions
- [ ] Performance monitoring
- [ ] Comprehensive testing
- [ ] Security audit

### Future Enhancements
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Advanced horoscope analysis
- [ ] Video profile introductions
- [ ] Wedding planning tools

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m 'feat: add amazing feature'

# Push to branch
git push origin feature/amazing-feature

# Open Pull Request
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Supabase for the amazing backend platform
- Shadcn/ui for beautiful components
- React Query for data management
- Jitsi Meet for video calling
- All open-source contributors

## 📞 Support

- **Documentation:** Check `/docs` folder
- **Issues:** GitHub Issues
- **Email:** support@brahminsoulmate.com
- **Community:** Discord (if available)

## 🌐 Links

- **Live Demo:** https://brahminsoulmate.com (when deployed)
- **Documentation:** https://docs.brahminsoulmate.com (when available)
- **API Docs:** https://api.brahminsoulmate.com/docs (when available)

## 📊 Status

- ✅ **Development:** Complete
- ✅ **Testing:** In Progress
- 🚀 **Deployment:** Ready
- 📱 **Production:** Pending Launch

---

**Built with ❤️ for the Brahmin community**

*Connecting hearts, honoring traditions* 🙏

## 🔒 SECURITY NOTES

### Development Mode
- **NEVER** enable `VITE_DEV_BYPASS_AUTH=true` in production
- Development bypass should only be used for local testing
- Always use proper authentication in staging and production

### Environment Variables
- Never commit secrets to version control
- Use `.env.local` and add it to `.gitignore`
- Rotate secrets regularly
- Use different credentials for each environment (dev/staging/prod)

### Deployment
- Always deploy to staging first
- Run security audit before production deployment
- Keep dependencies updated
- Monitor for security vulnerabilities
