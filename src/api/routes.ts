// API Routes Configuration
// These would typically be implemented in your backend (Node.js/Express, Python/FastAPI, etc.)

export const API_ROUTES = {
  // Authentication
  AUTH: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    REFRESH: '/api/auth/refresh',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },

  // Profile Management
  PROFILE: {
    GET: '/api/profile/:id',
    UPDATE: '/api/profile/:id',
    SEARCH: '/api/profiles/search',
    UPLOAD_IMAGE: '/api/profile/upload-image',
    DELETE_IMAGE: '/api/profile/delete-image',
    GET_STATS: '/api/profile/:id/stats',
  },

  // Matching & Interests
  MATCHING: {
    SEND_INTEREST: '/api/matches/send-interest',
    ACCEPT_INTEREST: '/api/matches/accept/:id',
    DECLINE_INTEREST: '/api/matches/decline/:id',
    GET_SENT: '/api/matches/sent',
    GET_RECEIVED: '/api/matches/received',
    GET_CONNECTIONS: '/api/matches/connections',
    GET_RECOMMENDATIONS: '/api/matches/recommendations',
    ADD_FAVORITE: '/api/favorites/add',
    REMOVE_FAVORITE: '/api/favorites/remove',
    GET_FAVORITES: '/api/favorites',
  },

  // Messaging
  MESSAGES: {
    SEND: '/api/messages/send',
    GET_CONVERSATION: '/api/messages/conversation/:userId',
    GET_CONVERSATIONS: '/api/messages/conversations',
    MARK_READ: '/api/messages/mark-read',
    DELETE: '/api/messages/:id',
    BLOCK_USER: '/api/messages/block',
    UNBLOCK_USER: '/api/messages/unblock',
  },

  // Payments
  PAYMENTS: {
    CREATE_ORDER: '/api/payments/create-order',
    VERIFY_PAYMENT: '/api/payments/verify-payment',
    GET_SUBSCRIPTION: '/api/payments/subscription',
    CANCEL_SUBSCRIPTION: '/api/payments/cancel-subscription',
    GET_HISTORY: '/api/payments/history',
  },

  // Notifications
  NOTIFICATIONS: {
    GET: '/api/notifications',
    MARK_READ: '/api/notifications/:id/read',
    MARK_ALL_READ: '/api/notifications/mark-all-read',
    DELETE: '/api/notifications/:id',
    GET_PREFERENCES: '/api/notifications/preferences',
    UPDATE_PREFERENCES: '/api/notifications/preferences',
    SUBSCRIBE_PUSH: '/api/notifications/subscribe-push',
  },

  // Events
  EVENTS: {
    GET_ALL: '/api/events',
    GET: '/api/events/:id',
    CREATE: '/api/events',
    UPDATE: '/api/events/:id',
    DELETE: '/api/events/:id',
    REGISTER: '/api/events/:id/register',
    UNREGISTER: '/api/events/:id/unregister',
  },

  // V-Dates
  VDATES: {
    SCHEDULE: '/api/vdates/schedule',
    GET_UPCOMING: '/api/vdates/upcoming',
    GET_HISTORY: '/api/vdates/history',
    ACCEPT: '/api/vdates/:id/accept',
    DECLINE: '/api/vdates/:id/decline',
    CANCEL: '/api/vdates/:id/cancel',
    GET_MEETING_LINK: '/api/vdates/:id/meeting-link',
  },

  // Admin
  ADMIN: {
    GET_USERS: '/api/admin/users',
    VERIFY_PROFILE: '/api/admin/verify-profile/:id',
    SUSPEND_USER: '/api/admin/suspend-user/:id',
    GET_REPORTS: '/api/admin/reports',
    GET_ANALYTICS: '/api/admin/analytics',
    SEND_NOTIFICATION: '/api/admin/send-notification',
  },

  // Utility
  UTILITY: {
    UPLOAD_FILE: '/api/upload',
    SEND_EMAIL: '/api/send-email',
    SEND_SMS: '/api/send-sms',
    GENERATE_REPORT: '/api/generate-report',
  }
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Common API Headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;