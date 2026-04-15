# 🚀 Backend Setup Guide

## Quick Start

### Option 1: Use Mock Mode (No Supabase Required)

The backend now runs in **mock mode** automatically when Supabase credentials are missing.

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:3001` with mock data.

### Option 2: Real Supabase Connection

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for project to be ready (~2 minutes)

2. **Get Credentials**
   - Go to Project Settings → API
   - Copy:
     - Project URL → `SUPABASE_URL`
     - anon key → `VITE_SUPABASE_ANON_KEY`
     - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

3. **Configure Environment**
   ```bash
   # Edit .env.local with your credentials
   SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run Migrations**
   ```bash
   npx ts-node scripts/migrate.ts up
   ```

5. **Start Server**
   ```bash
   npm run dev
   ```

## Environment Variables

Required:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

Optional:
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:8080)
- `NODE_ENV` - Environment (development/production)
- `RAZORPAY_KEY_ID` - Razorpay payment key
- `RAZORPAY_KEY_SECRET` - Razorpay payment secret
- `SENTRY_DSN` - Sentry error tracking

## Available Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run migrations
npx ts-node scripts/migrate.ts up

# Rollback migrations
npx ts-node scripts/migrate.ts down

# Check migration status
npx ts-node scripts/migrate.ts status

# Run tests
npm run test

# Lint code
npm run lint
```

## API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /ready` - Readiness probe
- `GET /health/circuit-breakers` - Circuit breaker status

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Profile
- `GET /api/profile/me` - Get own profile
- `GET /api/profile/:id` - Get profile by ID
- `PUT /api/profile` - Update own profile
- `GET /api/profile/search/all` - Search profiles

### Matching
- `POST /api/matching/interest` - Send interest
- `GET /api/matching/interests/sent` - Get sent interests
- `GET /api/matching/interests/received` - Get received interests
- `POST /api/matching/interest/:id/accept` - Accept interest
- `POST /api/matching/interest/:id/decline` - Decline interest

### Messages
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/conversations` - Get all conversations
- `POST /api/messages/mark-read/:userId` - Mark as read
- `DELETE /api/messages/:messageId` - Delete message

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/subscription` - Get subscription status
- `POST /api/payments/cancel` - Cancel subscription
- `GET /api/payments/history` - Get payment history

## Database Schema

The database uses Supabase with the following main tables:
- `profiles` - User profiles
- `messages` - Chat messages
- `interests` - Match interests
- `subscriptions` - User subscriptions
- `payments` - Payment records
- `notifications` - User notifications
- `events` - Community events
- `vdates` - Video dates
- `success_stories` - Success stories

## Security

- All routes use authentication middleware
- Rate limiting on sensitive endpoints
- Input validation with Zod schemas
- SQL injection prevention
- XSS protection
- CSRF protection

## Monitoring

- Sentry error tracking
- Health check endpoints
- Circuit breaker pattern
- Request logging

## Support

For issues, check:
- `SETUP_GUIDE.md` - Full setup guide
- `QUICK_START.md` - Quick start
- `PROJECT_RATING_AND_REVIEW.md` - Project overview
