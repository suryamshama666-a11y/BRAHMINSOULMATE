import { getSupabase } from '@/lib/getSupabase';

interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  session_id: string;
  timestamp: string;
  properties: Record<string, any>;
  page_url: string;
  user_agent: string;
  ip_address?: string;
}

interface UserBehavior {
  user_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  metadata: Record<string, any>;
  timestamp: string;
}

interface ConversionFunnel {
  step: string;
  user_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private supabase = getSupabase();
  private sessionId: string;
  private userId?: string;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline = navigator.onLine;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
    this.setupEventListeners();
    this.startPeriodicFlush();
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize analytics session
  private async initializeSession() {
    try {
      const user = await this.supabase.auth.getUser();
      this.userId = user.data.user?.id;

      // Track session start
      this.track('session_start', {
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        referrer: document.referrer
      });
    } catch (error) {
      console.error('Failed to initialize analytics session:', error);
    }
  }

  // Setup event listeners for automatic tracking
  private setupEventListeners() {
    // Track page views
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Track session end
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        session_duration: Date.now() - parseInt(this.sessionId.split('-')[0])
      });
      this.flushEvents();
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden');
      } else {
        this.track('page_visible');
      }
    });
  }

  // Start periodic event flushing
  private startPeriodicFlush() {
    this.flushInterval = setInterval(() => {
      if (this.isOnline && this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, 30000); // Flush every 30 seconds
  }

  // Track custom event
  track(eventName: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      event_name: eventName,
      user_id: this.userId,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties,
      page_url: window.location.href,
      user_agent: navigator.userAgent
    };

    this.eventQueue.push(event);

    // Flush immediately for critical events
    const criticalEvents = ['purchase', 'subscription_activated', 'profile_created', 'interest_sent'];
    if (criticalEvents.includes(eventName) && this.isOnline) {
      this.flushEvents();
    }
  }

  // Track page view
  trackPageView(pageName?: string) {
    this.track('page_view', {
      page_name: pageName || document.title,
      page_path: window.location.pathname,
      page_search: window.location.search,
      page_hash: window.location.hash
    });
  }

  // Track user behavior
  async trackUserBehavior(action: string, targetType: string, targetId?: string, metadata: Record<string, any> = {}) {
    if (!this.userId) return;

    const behavior: UserBehavior = {
      user_id: this.userId,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata,
      timestamp: new Date().toISOString()
    };

    try {
      await this.supabase.from('user_behavior').insert(behavior);
    } catch (error) {
      console.error('Failed to track user behavior:', error);
    }
  }

  // Track conversion funnel step
  async trackConversionStep(step: string, metadata?: Record<string, any>) {
    if (!this.userId) return;

    const funnelStep: ConversionFunnel = {
      step,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
      metadata
    };

    try {
      await this.supabase.from('conversion_funnel').insert(funnelStep);
    } catch (error) {
      console.error('Failed to track conversion step:', error);
    }
  }

  // Track profile interactions
  trackProfileView(profileId: string, viewDuration?: number) {
    this.track('profile_view', {
      profile_id: profileId,
      view_duration: viewDuration
    });

    this.trackUserBehavior('view', 'profile', profileId, {
      view_duration: viewDuration
    });
  }

  trackProfileLike(profileId: string) {
    this.track('profile_like', { profile_id: profileId });
    this.trackUserBehavior('like', 'profile', profileId);
  }

  trackInterestSent(profileId: string, message?: string) {
    this.track('interest_sent', {
      profile_id: profileId,
      has_message: !!message,
      message_length: message?.length || 0
    });

    this.trackUserBehavior('interest_sent', 'profile', profileId, {
      has_message: !!message
    });

    this.trackConversionStep('interest_sent', { profile_id: profileId });
  }

  // Track messaging behavior
  trackMessageSent(receiverId: string, messageLength: number, messageType: string = 'text') {
    this.track('message_sent', {
      receiver_id: receiverId,
      message_length: messageLength,
      message_type: messageType
    });

    this.trackUserBehavior('message_sent', 'user', receiverId, {
      message_length: messageLength,
      message_type: messageType
    });
  }

  trackConversationStarted(receiverId: string) {
    this.track('conversation_started', { receiver_id: receiverId });
    this.trackConversionStep('conversation_started', { receiver_id: receiverId });
  }

  // Track search behavior
  trackSearch(query: string, filters: Record<string, any>, resultCount: number) {
    this.track('search_performed', {
      query,
      filters,
      result_count: resultCount,
      has_filters: Object.keys(filters).length > 0
    });

    this.trackUserBehavior('search', 'profiles', undefined, {
      query,
      filters,
      result_count: resultCount
    });
  }

  // Track subscription events
  trackSubscriptionUpgrade(planName: string, amount: number) {
    this.track('subscription_upgrade', {
      plan_name: planName,
      amount,
      currency: 'INR'
    });

    this.trackConversionStep('subscription_upgrade', {
      plan_name: planName,
      amount
    });
  }

  trackPaymentAttempt(planName: string, amount: number, paymentMethod: string) {
    this.track('payment_attempt', {
      plan_name: planName,
      amount,
      payment_method: paymentMethod,
      currency: 'INR'
    });
  }

  trackPaymentSuccess(planName: string, amount: number, transactionId: string) {
    this.track('payment_success', {
      plan_name: planName,
      amount,
      transaction_id: transactionId,
      currency: 'INR'
    });

    this.trackConversionStep('payment_success', {
      plan_name: planName,
      transaction_id: transactionId
    });
  }

  // Track feature usage
  trackFeatureUsage(featureName: string, metadata?: Record<string, any>) {
    this.track('feature_used', {
      feature_name: featureName,
      ...metadata
    });

    this.trackUserBehavior('feature_used', 'feature', featureName, metadata);
  }

  // Track errors
  trackError(errorType: string, errorMessage: string, errorStack?: string) {
    this.track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      error_stack: errorStack,
      page_url: window.location.href
    });
  }

  // Track performance metrics
  trackPerformance(metricName: string, value: number, unit: string = 'ms') {
    this.track('performance_metric', {
      metric_name: metricName,
      value,
      unit
    });
  }

  // Get user analytics data
  async getUserAnalytics(userId: string, dateRange: { start: string; end: string }) {
    try {
      const { data: events, error: eventsError } = await this.supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', dateRange.start)
        .lte('timestamp', dateRange.end)
        .order('timestamp', { ascending: false });

      if (eventsError) throw eventsError;

      const { data: behavior, error: behaviorError } = await this.supabase
        .from('user_behavior')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', dateRange.start)
        .lte('timestamp', dateRange.end)
        .order('timestamp', { ascending: false });

      if (behaviorError) throw behaviorError;

      return {
        events: events || [],
        behavior: behavior || []
      };
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return { events: [], behavior: [] };
    }
  }

  // Get platform analytics (admin only)
  async getPlatformAnalytics(dateRange: { start: string; end: string }) {
    try {
      // User registration trends
      const { data: registrations } = await this.supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      // Message volume
      const { data: messages } = await this.supabase
        .from('messages')
        .select('created_at, sender_id')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      // Interest activity
      const { data: interests } = await this.supabase
        .from('matches')
        .select('created_at, status')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      // Subscription conversions
      const { data: subscriptions } = await this.supabase
        .from('subscriptions')
        .select('created_at, plan, amount')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      return {
        registrations: registrations || [],
        messages: messages || [],
        interests: interests || [],
        subscriptions: subscriptions || []
      };
    } catch (error) {
      console.error('Failed to get platform analytics:', error);
      return {
        registrations: [],
        messages: [],
        interests: [],
        subscriptions: []
      };
    }
  }

  // Flush events to database
  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await this.supabase
        .from('analytics_events')
        .insert(eventsToFlush);

      if (error) {
        // Re-queue events if failed
        this.eventQueue.unshift(...eventsToFlush);
        throw error;
      }
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
    }
  }

  // Clean up
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents();
  }
}

// Create and export singleton instance
export const analyticsService = new AnalyticsService();

// React hook for analytics
export const useAnalytics = () => {
  return {
    track: analyticsService.track.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackProfileView: analyticsService.trackProfileView.bind(analyticsService),
    trackInterestSent: analyticsService.trackInterestSent.bind(analyticsService),
    trackMessageSent: analyticsService.trackMessageSent.bind(analyticsService),
    trackSearch: analyticsService.trackSearch.bind(analyticsService),
    trackFeatureUsage: analyticsService.trackFeatureUsage.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService)
  };
};

export default analyticsService;