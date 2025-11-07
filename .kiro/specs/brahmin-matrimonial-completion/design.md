# Design Document

## Overview

This design document outlines the technical architecture and implementation strategy for completing the Brahmin Soulmate Connect matrimonial platform. The system will integrate with Supabase for backend services, implement real-time features, and provide a comprehensive matrimonial experience with matching algorithms, messaging, and payment processing.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Profile  │  │ Search   │  │ Messages │  │ Payments │   │
│  │ Pages    │  │ & Match  │  │ & Chat   │  │ & Plans  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (React Query)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Profile  │  │ Matching │  │ Messages │  │ Payments │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Database │  │ Storage  │  │ Auth     │  │ Realtime │   │
│  │ (Postgres│  │ (Files)  │  │ (JWT)    │  │ (WebSock)│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Razorpay │  │ SendGrid │  │ Twilio   │  │ Jitsi    │   │
│  │ (Payment)│  │ (Email)  │  │ (SMS)    │  │ (Video)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- React Router for navigation
- React Query for data fetching and caching
- Tailwind CSS for styling
- Shadcn/ui for component library
- Zustand for state management
- Socket.io-client for real-time messaging

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth (JWT-based authentication)
- Supabase Storage (file uploads)
- Supabase Realtime (WebSocket connections)
- Edge Functions for serverless logic

**External Services:**
- Razorpay for payment processing
- SendGrid for email notifications
- Twilio for SMS notifications
- Jitsi Meet for video conferencing

## Components and Interfaces

### 1. Backend Integration Layer

**Services Structure:**
```typescript
// src/services/api/
├── profiles.service.ts      // Profile CRUD operations
├── matching.service.ts       // Match calculation and retrieval
├── messages.service.ts       // Real-time messaging
├── interests.service.ts      // Interest management
├── payments.service.ts       // Subscription and payments
├── notifications.service.ts  // Email/SMS notifications
├── storage.service.ts        // File upload/download
└── analytics.service.ts      // User analytics
```

**Key Interfaces:**
```typescript
interface ProfileService {
  getProfile(userId: string): Promise<UserProfile>
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<void>
  uploadPhoto(userId: string, file: File): Promise<string>
  deletePhoto(userId: string, photoId: string): Promise<void>
}

interface MatchingService {
  calculateMatches(userId: string): Promise<Match[]>
  getMatchScore(user1Id: string, user2Id: string): Promise<number>
  getRecommendations(userId: string, limit: number): Promise<UserProfile[]>
}

interface MessagingService {
  sendMessage(senderId: string, receiverId: string, content: string): Promise<Message>
  getConversation(user1Id: string, user2Id: string): Promise<Message[]>
  markAsRead(messageId: string): Promise<void>
  subscribeToMessages(userId: string, callback: (message: Message) => void): () => void
}
```

### 2. Matching Algorithm Component

**Algorithm Flow:**
```
1. Retrieve user preferences
2. Query database for potential matches
3. Calculate compatibility score:
   - Age compatibility (20%)
   - Height compatibility (10%)
   - Location proximity (15%)
   - Education level (15%)
   - Occupation compatibility (10%)
   - Gotra compatibility (20%)
   - Horoscope compatibility (10%)
4. Sort by score and return top matches
```

**Implementation:**
```typescript
class MatchingAlgorithm {
  calculateCompatibility(user: UserProfile, candidate: UserProfile): number {
    const scores = {
      age: this.calculateAgeScore(user, candidate),
      height: this.calculateHeightScore(user, candidate),
      location: this.calculateLocationScore(user, candidate),
      education: this.calculateEducationScore(user, candidate),
      occupation: this.calculateOccupationScore(user, candidate),
      gotra: this.calculateGotraScore(user, candidate),
      horoscope: this.calculateHoroscopeScore(user, candidate)
    };
    
    return (
      scores.age * 0.20 +
      scores.height * 0.10 +
      scores.location * 0.15 +
      scores.education * 0.15 +
      scores.occupation * 0.10 +
      scores.gotra * 0.20 +
      scores.horoscope * 0.10
    );
  }
}
```

### 3. Real-time Messaging Component

**Message Flow:**
```
User A sends message
    ↓
Frontend validates and sends to API
    ↓
API stores in database
    ↓
Supabase Realtime broadcasts to User B
    ↓
User B receives notification
    ↓
Message displayed in chat
```

**Implementation:**
```typescript
// Real-time subscription
const subscribeToMessages = (userId: string, callback: (message: Message) => void) => {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    }, (payload) => {
      callback(payload.new as Message);
    })
    .subscribe();
    
  return () => channel.unsubscribe();
};
```

### 4. Payment Integration Component

**Payment Flow:**
```
User selects plan
    ↓
Frontend creates Razorpay order
    ↓
Razorpay payment modal opens
    ↓
User completes payment
    ↓
Webhook receives payment confirmation
    ↓
Backend activates subscription
    ↓
User status updated to premium
```

**Implementation:**
```typescript
interface PaymentService {
  createOrder(planId: string, userId: string): Promise<RazorpayOrder>
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean>
  activateSubscription(userId: string, planId: string): Promise<void>
  handleWebhook(event: RazorpayWebhookEvent): Promise<void>
}
```

### 5. Search and Filter Component

**Search Architecture:**
```typescript
interface SearchFilters {
  ageRange: { min: number; max: number };
  heightRange: { min: number; max: number };
  locations: string[];
  educationLevels: string[];
  occupations: string[];
  gotras: string[];
  subcastes: string[];
  maritalStatus: string[];
  excludeSameGotra: boolean;
}

class SearchService {
  async search(filters: SearchFilters): Promise<UserProfile[]> {
    let query = supabase
      .from('profiles')
      .select('*')
      .gte('age', filters.ageRange.min)
      .lte('age', filters.ageRange.max);
      
    if (filters.excludeSameGotra && filters.gotras.length > 0) {
      query = query.not('gotra', 'in', `(${filters.gotras.join(',')})`);
    }
    
    // Apply other filters...
    
    const { data, error } = await query;
    return data || [];
  }
}
```

## Data Models

### Enhanced Database Schema

```sql
-- Profiles table (already exists, add missing fields)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gotra VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subcaste VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS horoscope_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_documents JSONB;

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(user_id),
  user2_id UUID REFERENCES profiles(user_id),
  compatibility_score DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Interests table
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(user_id),
  receiver_id UUID REFERENCES profiles(user_id),
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  UNIQUE(sender_id, receiver_id)
);

-- Messages table (enhance existing)
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  plan_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  auto_renewal BOOLEAN DEFAULT true,
  payment_id VARCHAR(100),
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table (enhance existing)
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP;

-- Event registrations table
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES profiles(user_id),
  status VARCHAR(20) DEFAULT 'registered',
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Success stories table
CREATE TABLE success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(user_id),
  user2_id UUID REFERENCES profiles(user_id),
  story_text TEXT,
  marriage_date DATE,
  photos TEXT[],
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP
);

-- Analytics table
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  profile_views INTEGER DEFAULT 0,
  interests_sent INTEGER DEFAULT 0,
  interests_received INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

### Error Handling Strategy

```typescript
class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number
  ) {
    super(message);
  }
}

// Error codes
enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  UPLOAD_FAILED = 'UPLOAD_FAILED'
}

// Error handling middleware
const handleAPIError = (error: any): APIError => {
  if (error.code === 'PGRST116') {
    return new APIError(ErrorCode.NOT_FOUND, 'Resource not found', 404);
  }
  if (error.message?.includes('JWT')) {
    return new APIError(ErrorCode.AUTH_ERROR, 'Authentication failed', 401);
  }
  return new APIError(ErrorCode.NETWORK_ERROR, 'Network error occurred', 500);
};
```

## Testing Strategy

### Testing Approach

**Unit Tests:**
- Matching algorithm calculations
- Data validation functions
- Utility functions
- Service layer methods

**Integration Tests:**
- API endpoint responses
- Database operations
- File upload/download
- Payment processing flow

**End-to-End Tests:**
- User registration and login
- Profile creation and editing
- Search and match discovery
- Sending and receiving interests
- Messaging between users
- Subscription purchase flow

**Testing Tools:**
- Vitest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests
- MSW for API mocking

### Test Coverage Goals

- Unit tests: 80% coverage
- Integration tests: 70% coverage
- E2E tests: Critical user flows

## Performance Considerations

### Optimization Strategies

**Database:**
- Index frequently queried fields (age, location, gotra)
- Use database views for complex match queries
- Implement pagination for large result sets
- Cache match calculations for 24 hours

**Frontend:**
- Lazy load images with progressive loading
- Implement virtual scrolling for large lists
- Use React Query for data caching
- Debounce search inputs
- Code splitting for route-based chunks

**Real-time:**
- Limit WebSocket connections per user
- Batch notifications for better performance
- Use presence channels efficiently

## Security Considerations

### Security Measures

**Authentication:**
- JWT tokens with short expiry (1 hour)
- Refresh token rotation
- Secure HTTP-only cookies
- Multi-factor authentication for premium users

**Data Protection:**
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Sanitize user inputs
- Implement rate limiting on APIs

**Privacy:**
- Enforce photo visibility rules
- Hide contact information based on settings
- Implement profile blocking feature
- GDPR-compliant data deletion

**Payment Security:**
- Never store card details
- Use Razorpay's secure checkout
- Verify webhook signatures
- Log all payment transactions

## Deployment Strategy

### Deployment Pipeline

```
Development → Staging → Production

1. Development:
   - Local Supabase instance
   - Test payment gateway
   - Mock external services

2. Staging:
   - Supabase staging project
   - Razorpay test mode
   - Real external services (test accounts)

3. Production:
   - Supabase production project
   - Razorpay live mode
   - Production external services
   - CDN for static assets
   - Monitoring and logging
```

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Razorpay
VITE_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# SendGrid
SENDGRID_API_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Jitsi
JITSI_APP_ID=
```

## Monitoring and Analytics

### Monitoring Setup

**Application Monitoring:**
- Error tracking with Sentry
- Performance monitoring with Web Vitals
- User analytics with Google Analytics
- Custom event tracking for key actions

**Infrastructure Monitoring:**
- Supabase dashboard metrics
- API response times
- Database query performance
- Storage usage

**Business Metrics:**
- User registrations
- Profile completions
- Match success rate
- Subscription conversions
- Message engagement
- Event participation

## Migration Plan

### Phased Implementation

**Phase 1: Backend Foundation (Week 1-2)**
- Set up Supabase tables and relationships
- Implement authentication flow
- Create API service layer
- Set up file storage

**Phase 2: Core Features (Week 3-4)**
- Implement matching algorithm
- Build search and filter functionality
- Create interest management system
- Develop messaging system

**Phase 3: Premium Features (Week 5-6)**
- Integrate payment gateway
- Implement subscription management
- Add horoscope matching
- Build video date functionality

**Phase 4: Engagement Features (Week 7-8)**
- Implement notifications (email/SMS)
- Create event management
- Build community forum
- Add success stories

**Phase 5: Polish and Launch (Week 9-10)**
- Comprehensive testing
- Performance optimization
- Security audit
- Production deployment
