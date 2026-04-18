/**
 * Analytics tracking system for user behavior and conversion tracking
 * Tracks events, page views, conversions, and errors
 */

import { logger } from './logger';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  sessionId: string;
  page: string;
  userAgent: string;
}

export class Analytics {
  private static enabled = false;
  private static sessionId: string;
  private static userId?: string;
  private static eventQueue: AnalyticsEvent[] = [];
  private static flushInterval: NodeJS.Timeout | null = null;
  private static ga4Id = import.meta.env.VITE_GA4_ID;

  /**
   * Initialize analytics
   */
  static init(): void {
    this.sessionId = this.getOrCreateSessionId();
    this.startFlushInterval();
    
    // Load GA4 if ID is present
    if (this.ga4Id && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.ga4Id}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      const gtag = (...args: unknown[]): void => {
        if (window.dataLayer && Array.isArray(window.dataLayer)) {
          window.dataLayer.push(args);
        }
      };
      gtag('js', new Date());
      gtag('config', this.ga4Id, {
        send_page_view: false, // We handle it manually
        user_id: this.userId,
      });
    }

    if (typeof window !== 'undefined') {
      this.trackPageView(window.location.pathname);
      window.addEventListener('popstate', () => {
        this.trackPageView(window.location.pathname);
      });
    }
  }

  /**
   * Track custom event
   */
  static track(event: string, properties?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        screen_resolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
        language: typeof navigator !== 'undefined' ? navigator.language : '',
        platform: typeof navigator !== 'undefined' ? navigator.platform : '',
      },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    this.eventQueue.push(eventData);
    
    // Also track in GA4 if available
    if (this.ga4Id && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...eventData.properties,
        user_id: this.userId,
        session_id: this.sessionId,
      });
    }

    if (import.meta.env.DEV) {
      logger.debug('📊 Analytics:', eventData);
    }

    if (this.eventQueue.length >= 10) {
      this.flush();
    }
  }

  /**
   * Track page view
   */
  static trackPageView(page: string): void {
    this.track('page_view', { 
      page_path: page,
      page_title: document.title,
    });
  }

  /**
   * Track conversion
   */
  static trackConversion(type: string, value?: number, metadata?: Record<string, unknown>): void {
    this.track('conversion', {
      conversion_type: type,
      value,
      currency: 'INR',
      ...metadata
    });
    
    // Special GA4 conversion events
    if (this.ga4Id && typeof window !== 'undefined' && window.gtag) {
      const gaEventMap: Record<string, string> = {
        'registration': 'sign_up',
        'payment_success': 'purchase',
        'match_interest': 'generate_lead'
      };
      
      const gaEventName = gaEventMap[type] || `conversion_${type}`;
      window.gtag('event', gaEventName, {
        value,
        currency: 'INR',
        ...metadata
      });
    }
  }

  /**
   * Track error
   */
  static trackError(error: Error, context?: unknown): void {
    this.track('exception', {
      description: error.message,
      fatal: false,
      context
    });
  }

  /**
   * Set user ID for cross-device tracking
   */
  static setUserId(userId: string): void {
    this.userId = userId;
    if (this.ga4Id && typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', this.ga4Id, {
        'user_id': userId
      });
    }
  }

  /**
   * Clear user ID
   */
  static clearUserId(): void {
    this.userId = undefined;
  }

  /**
   * Enable analytics (Consent given)
   */
  static enable(): void {
    this.enabled = true;
    logger.info('Analytics enabled');
    if (this.ga4Id && typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  }

  /**
   * Disable analytics (Consent denied)
   */
  static disable(): void {
    this.enabled = false;
    this.eventQueue = [];
    logger.info('Analytics disabled');
    if (this.ga4Id && typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
  }

  /**
   * Flush events to server
   */
  private static async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { supabase } = await import('@/services/api/base');
      
      const { error } = await (supabase as any)
        .from('analytics_events')
        .insert(events.map(e => ({
          user_id: e.userId || null,
          event_name: e.event,
          properties: e.properties || {},
          page_path: e.page,
          session_id: e.sessionId,
          user_agent: e.userAgent,
          created_at: e.timestamp
        })));

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to send analytics:', error);
      if (this.eventQueue.length < 50) {
        this.eventQueue.unshift(...events);
      }
    }
  }

  /**
   * Start automatic flush interval
   */
  private static startFlushInterval(): void {
    if (this.flushInterval) return;
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }

  /**
   * Get or create session ID
   */
  private static getOrCreateSessionId(): string {
    const stored = sessionStorage.getItem('analytics_session_id');
    if (stored) return stored;

    const newId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', newId);
    return newId;
  }
}


// Auto-initialize
if (typeof window !== 'undefined') {
  Analytics.init();
}

export default Analytics;
