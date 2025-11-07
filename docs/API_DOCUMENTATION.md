# Brahmin Soulmate Connect - API Documentation

## Overview

This document provides comprehensive documentation for the Brahmin Soulmate Connect API layer. The API is built using Supabase as the backend service with a custom TypeScript API client for the frontend.

## Base Configuration

```typescript
// API Base URL
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Supabase Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
```

## Authentication

All protected endpoints require authentication via Supabase Auth. The API uses Row Level Security (RLS) policies to ensure data access control.

### Authentication Headers
```typescript
Authorization: Bearer <supabase_jwt_token>
```

## API Client (`/src/lib/api.ts`)

The main API client provides centralized data access with caching and error handling.

### Core Features
- **Caching System**: 5-minute TTL for most endpoints
- **Error Handling**: Graceful fallbacks with user notifications
- **Type Safety**: Full TypeScript support
- **Request Timeout**: 8-second timeout for all requests

## Endpoints

### 1. Profiles API

#### Get Profiles
```typescript
api.getProfiles(options?: {
  page?: number;           // Default: 1
  limit?: number;          // Default: 20
  filter?: ProfileFilter;  // Optional filters
  searchTerm?: string;     // Search query
  useCache?: boolean;      // Default: true
})
```

**ProfileFilter Interface:**
```typescript
interface ProfileFilter {
  gender?: string;           // 'male' | 'female'
  religion?: string;         // e.g., 'Hindu'
  marital_status?: string;   // e.g., 'never_married'
  subscription_type?: string; // 'free' | 'premium'
  height_min?: number;       // Minimum height in cm
  height_max?: number;       // Maximum height in cm
  caste?: string;           // Specific caste filter
}
```

**Response:**
```typescript
Profile[] | []
```

**Example Usage:**
```typescript
// Get all profiles
const profiles = await api.getProfiles();

// Get filtered profiles
const maleProfiles = await api.getProfiles({
  filter: { gender: 'male', religion: 'Hindu' },
  page: 1,
  limit: 10
});

// Search profiles
const searchResults = await api.getProfiles({
  searchTerm: 'engineer',
  filter: { subscription_type: 'premium' }
});
```

#### Get Profile by ID
```typescript
api.getProfileById(id: string, useCache?: boolean)
```

**Response:**
```typescript
Profile | null
```

**Example:**
```typescript
const profile = await api.getProfileById('uuid-here');
```

#### Update Profile
```typescript
api.updateProfile(userId: string, updates: Partial<Profile>)
```

**Example:**
```typescript
const updatedProfile = await api.updateProfile('user-id', {
  bio: 'Updated bio text',
  height: 175,
  preferences: { age_min: 25, age_max: 35 }
});
```

### 2. Matches API

#### Get Matches
```typescript
api.getMatches(userId: string, useCache?: boolean)
```

**Algorithm Logic:**
- Filters by opposite gender
- Same religion preference
- Excludes current user
- Limits to 20 results

**Response:**
```typescript
Profile[] | []
```

**Example:**
```typescript
const matches = await api.getMatches('current-user-id');
```

### 3. Messages API

#### Send Message
```typescript
api.sendMessage(message: {
  sender_id: string;
  receiver_id: string;
  content: string;
})
```

**Response:**
```typescript
Message[] | null
```

**Example:**
```typescript
const sentMessage = await api.sendMessage({
  sender_id: 'sender-uuid',
  receiver_id: 'receiver-uuid',
  content: 'Hello! I would like to connect.'
});
```

#### Get Conversation
```typescript
api.getConversation(user1Id: string, user2Id: string, useCache?: boolean)
```

**Features:**
- Retrieves all messages between two users
- Ordered by creation time (ascending)
- 30-second cache TTL for real-time feel

**Response:**
```typescript
Message[] | []
```

**Example:**
```typescript
const conversation = await api.getConversation('user1-id', 'user2-id');
```

### 4. Dashboard API

#### Get Dashboard Stats
```typescript
api.getDashboardStats(userId: string)
```

**Response:**
```typescript
{
  profileViews: number;      // Mock data: 100-600
  interestsSent: number;     // Mock data: 5-25
  messageCount: number;      // Real count from messages table
  matchesCount: number;      // Real count from matches
  vDatesCount: number;       // Mock data: 1-6
}
```

**Example:**
```typescript
const stats = await api.getDashboardStats('user-id');
console.log(`You have ${stats.messageCount} messages`);
```

### 5. Events API

#### Get Events
```typescript
api.getEvents(useCache?: boolean)
```

**Fallback System:**
- Attempts to fetch from `events` table
- Falls back to mock data if table unavailable
- Mock events include cultural meets, spiritual sessions, workshops

**Response:**
```typescript
Event[] | []
```

**Event Interface:**
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;           // ISO date string
  time: string;           // HH:MM format
  location: string;
  max_participants?: number;
  event_type?: string;
  created_at: string;
}
```

**Example:**
```typescript
const events = await api.getEvents();
```

### 6. Cache Management

#### Clear Cache
```typescript
api.clearCache(key?: string)
```

**Examples:**
```typescript
// Clear specific cache entry
api.clearCache('profiles_1_20_{}');

// Clear all cache
api.clearCache();
```

## Database Schema

### Core Tables

#### profiles
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- name (VARCHAR)
- age (INTEGER)
- gender (VARCHAR)
- religion (VARCHAR)
- caste (VARCHAR)
- marital_status (VARCHAR)
- height (INTEGER)
- subscription_type (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### messages
```sql
- id (UUID, Primary Key)
- sender_id (UUID, Foreign Key to profiles)
- receiver_id (UUID, Foreign Key to profiles)
- content (TEXT)
- read (BOOLEAN)
- created_at (TIMESTAMP)
```

#### matches
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to profiles)
- match_id (UUID, Foreign Key to profiles)
- status (ENUM: pending, accepted, declined)
- created_at (TIMESTAMP)
```

#### events
```sql
- id (UUID, Primary Key)
- title (VARCHAR)
- description (TEXT)
- date (DATE)
- time (TIME)
- location (VARCHAR)
- max_participants (INTEGER)
- created_at (TIMESTAMP)
```

## Error Handling

### Error Types
1. **Network Errors**: Connection timeouts, server unavailable
2. **Authentication Errors**: Invalid tokens, expired sessions
3. **Validation Errors**: Invalid data format, missing required fields
4. **Permission Errors**: RLS policy violations, unauthorized access

### Error Response Format
```typescript
{
  error: {
    message: string;
    code?: string;
    details?: any;
  }
}
```

### Common Error Codes
- `PGRST301`: Row Level Security violation
- `23505`: Unique constraint violation
- `23503`: Foreign key constraint violation
- `42P01`: Table does not exist

## Rate Limiting

### Current Limits
- **Profile Queries**: No explicit limit (cached responses)
- **Message Sending**: Limited by Supabase RLS policies
- **Search Requests**: Cached for 5 minutes

### Best Practices
1. Use caching when possible (`useCache: true`)
2. Implement debouncing for search inputs
3. Batch multiple operations when feasible
4. Handle rate limit errors gracefully

## Performance Optimization

### Caching Strategy
```typescript
// Cache TTL by endpoint
const CACHE_TTL = {
  profiles: 5 * 60 * 1000,      // 5 minutes
  messages: 30 * 1000,          // 30 seconds
  matches: 5 * 60 * 1000,       // 5 minutes
  events: 5 * 60 * 1000,        // 5 minutes
};
```

### Query Optimization
1. **Pagination**: Always use `limit` and `offset`
2. **Selective Fields**: Use `select()` to fetch only needed columns
3. **Indexes**: Database indexes on frequently queried columns
4. **Filtering**: Apply filters at database level, not client-side

## Security Considerations

### Row Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only access their own data
- Profile visibility based on verification status
- Message access limited to conversation participants

### Data Validation
- Input sanitization on all user inputs
- Type checking with TypeScript
- Schema validation with Zod (where implemented)

### Authentication
- JWT tokens with expiration
- Automatic token refresh
- Secure session management

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### API Testing
```typescript
// Example test
describe('API Client', () => {
  it('should fetch profiles with filters', async () => {
    const profiles = await api.getProfiles({
      filter: { gender: 'male' },
      limit: 5
    });
    expect(profiles).toHaveLength(5);
    expect(profiles[0].gender).toBe('male');
  });
});
```

## Migration Guide

### From v1.0 to v2.0
1. Update import paths for API client
2. Replace direct Supabase calls with API client methods
3. Update error handling to use new error format
4. Implement caching where beneficial

### Breaking Changes
- `getProfile()` renamed to `getProfileById()`
- Filter interface updated with new fields
- Cache keys format changed

## Support

### Common Issues
1. **Cache not updating**: Call `api.clearCache()` after data mutations
2. **RLS errors**: Ensure user is authenticated and has proper permissions
3. **Timeout errors**: Check network connection and server status

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('api_debug', 'true');
```

### Contact
- Technical Issues: Create GitHub issue
- API Questions: Check this documentation first
- Feature Requests: Submit via project roadmap

---

**Last Updated**: December 2024  
**API Version**: 2.0  
**Documentation Version**: 1.0