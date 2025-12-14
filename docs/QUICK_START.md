# Quick Start Guide - Brahmin Soulmate Connect

## For Developers

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- Supabase account
- Code editor (VS Code recommended)

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd brahmin-matrimonial
```

### 2. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Environment Configuration

Create `.env.local` file in root:
```env
# Supabase (Get from https://supabase.com/dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Razorpay Test Mode
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Optional for full functionality
SENDGRID_API_KEY=SG.xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
```

Create `backend/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_SECRET=your_test_secret
SENDGRID_API_KEY=SG.xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Database Setup

#### Option A: Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### Option B: Manual Setup
1. Go to Supabase Dashboard > SQL Editor
2. Run migrations in order:
   - `supabase/migrations/20251107_brahmin_matrimonial_schema.sql`
   - `supabase/migrations/20251108_complete_features.sql`
   - `supabase/migrations/20251108_matching_and_analytics.sql`
   - `supabase/migrations/20251108_photos_and_horoscope.sql`
   - `supabase/migrations/20251108_notifications_and_verification.sql`
   - `supabase/migrations/20251108_vdates_stories_forum.sql`

### 5. Create Storage Buckets

Go to Supabase Dashboard > Storage > Create Bucket:
- `profile-photos` (Public)
- `horoscope-files` (Private)
- `verification-documents` (Private)
- `success-stories` (Public)

### 6. Start Development Servers

```bash
# Terminal 1: Frontend
npm run dev
# Runs on http://localhost:5173

# Terminal 2: Backend
cd backend
npm run dev
# Runs on http://localhost:3000
```

### 7. Create Test User

```bash
# Register via UI at http://localhost:5173/register
# Or create directly in Supabase Dashboard > Authentication
```

### 8. Set Admin Role (Optional)

```sql
-- Run in Supabase SQL Editor
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Project Structure

```
brahmin-matrimonial/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   │   └── api/           # All service files
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Libraries (Supabase, etc.)
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── backend/
│   └── src/
│       ├── routes/        # API routes
│       └── middleware/    # Express middleware
├── supabase/
│   └── migrations/        # Database migrations
├── docs/                  # Documentation
└── public/               # Static assets
```

## Key Services

### Frontend Services (src/services/api/)
- `auth.service.ts` - Authentication
- `profiles.service.ts` - User profiles
- `matching.service.ts` - Match algorithm
- `messages.service.ts` - Real-time messaging
- `interests.service.ts` - Interest management
- `payments.service.ts` - Subscriptions
- `photos.service.ts` - Photo management
- `horoscope.service.ts` - Horoscope matching
- `notifications.service.ts` - Notifications
- `verification.service.ts` - Profile verification
- `events.service.ts` - Event management
- `vdates.service.ts` - Video dates
- `success-stories.service.ts` - Success stories
- `forum.service.ts` - Community forum

### Backend Routes (backend/src/routes/)
- `/api/payments` - Payment processing
- `/api/notifications` - Email/SMS sending
- `/api/admin` - Admin operations
- `/api/vdates` - Video date management
- `/api/messages` - Message handling
- `/api/matching` - Match calculations

## Common Development Tasks

### Add New Feature
```bash
# 1. Create service file
touch src/services/api/new-feature.service.ts

# 2. Export from index
# Add to src/services/api/index.ts

# 3. Create page component
touch src/pages/NewFeature.tsx

# 4. Add route
# Update src/App.tsx

# 5. Create database table (if needed)
# Add migration in supabase/migrations/
```

### Test Payment Flow
```bash
# Use Razorpay test cards
# Card: 4111 1111 1111 1111
# CVV: Any 3 digits
# Expiry: Any future date
```

### Debug Real-time Features
```bash
# Open browser console
# Check Supabase Realtime connection
# Monitor WebSocket messages
```

### Run Database Queries
```bash
# Use Supabase SQL Editor
# Or connect via psql:
psql $DATABASE_URL
```

## Testing

### Run Tests (When Implemented)
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Profile creation and editing
- [ ] Photo upload
- [ ] Search with filters
- [ ] Send/receive interests
- [ ] Real-time messaging
- [ ] Match calculation
- [ ] Payment flow (test mode)
- [ ] Event registration
- [ ] Forum post creation

## Troubleshooting

### Frontend Not Starting
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error
```bash
# Check Supabase URL and keys
# Verify project is not paused
# Check RLS policies
```

### Real-time Not Working
```bash
# Check Supabase Realtime is enabled
# Verify channel subscriptions
# Check browser console for errors
```

### Payment Test Failing
```bash
# Verify Razorpay test keys
# Check backend is running
# Review payment logs
```

## Useful Commands

```bash
# Format code
npm run format

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview

# Generate types from Supabase
supabase gen types typescript --local > src/types/supabase.ts

# Reset database (CAUTION!)
supabase db reset
```

## Development Tips

### Hot Reload
- Frontend: Vite provides instant HMR
- Backend: Use `nodemon` for auto-restart

### Debug Mode
```typescript
// Enable debug logs
localStorage.setItem('debug', 'true');
```

### Mock Data
```typescript
// Use mock data for development
const MOCK_MODE = import.meta.env.DEV;
```

### Browser Extensions
- React Developer Tools
- Redux DevTools (if using Redux)
- Supabase DevTools

## API Documentation

### Generate API Docs
```bash
# Install Swagger
npm install swagger-jsdoc swagger-ui-express

# Generate docs
npm run docs:generate

# View at http://localhost:3000/api-docs
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

## Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Razorpay Docs](https://razorpay.com/docs)

### Community
- GitHub Issues
- Discord Server (if available)
- Stack Overflow

## Getting Help

### Common Issues
1. Check documentation in `/docs`
2. Search GitHub issues
3. Review error logs
4. Ask in community channels

### Report Bugs
```bash
# Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots
- Environment details
```

## Next Steps

1. ✅ Complete local setup
2. ✅ Run the application
3. ✅ Create test data
4. 📖 Read feature documentation
5. 🔨 Start building!

Happy coding! 🚀

For deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
