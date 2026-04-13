/**
 * Feature flags system for gradual rollout and A/B testing
 */

export class FeatureFlags {
  // Feature flags from environment
  static readonly VIDEO_CALLS = import.meta.env.VITE_FEATURE_VIDEO_CALLS === 'true';
  static readonly AI_MATCHING = import.meta.env.VITE_FEATURE_AI_MATCHING === 'true';
  static readonly PREMIUM_FEATURES = import.meta.env.VITE_FEATURE_PREMIUM === 'true';
  static readonly ANALYTICS = import.meta.env.VITE_FEATURE_ANALYTICS !== 'false'; // Default true
  static readonly NOTIFICATIONS = import.meta.env.VITE_FEATURE_NOTIFICATIONS !== 'false'; // Default true
  static readonly SOCIAL_LOGIN = import.meta.env.VITE_FEATURE_SOCIAL_LOGIN === 'true';
  static readonly HOROSCOPE_MATCHING = import.meta.env.VITE_FEATURE_HOROSCOPE === 'true';
  static readonly COMMUNITY_FORUM = import.meta.env.VITE_FEATURE_FORUM === 'true';
  static readonly EVENTS = import.meta.env.VITE_FEATURE_EVENTS === 'true';

  /**
   * Check if a feature is enabled
   */
  static isEnabled(flag: keyof typeof FeatureFlags): boolean {
    return this[flag] === true;
  }

  /**
   * Get all enabled features
   */
  static getEnabledFeatures(): string[] {
    return Object.keys(this).filter(key => 
      typeof this[key as keyof typeof FeatureFlags] === 'boolean' && 
      this[key as keyof typeof FeatureFlags] === true
    );
  }

  /**
   * Check if user has access to feature (for gradual rollout)
   */
  static hasAccess(feature: string, userId?: string): boolean {
    // Check if feature is globally enabled
    if (!this.isEnabled(feature as keyof typeof FeatureFlags)) {
      return false;
    }

    // For gradual rollout, use user ID hash
    if (userId && this.isGradualRollout(feature)) {
      return this.isInRolloutGroup(userId, feature);
    }

    return true;
  }

  /**
   * Check if feature is in gradual rollout
   */
  private static isGradualRollout(feature: string): boolean {
    const rolloutFeatures = ['AI_MATCHING', 'VIDEO_CALLS'];
    return rolloutFeatures.includes(feature);
  }

  /**
   * Check if user is in rollout group (based on user ID hash)
   */
  private static isInRolloutGroup(userId: string, feature: string): boolean {
    // Simple hash-based rollout (10% of users)
    const hash = this.simpleHash(userId + feature);
    return hash % 100 < 10; // 10% rollout
  }

  /**
   * Simple string hash function
   */
  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

export default FeatureFlags;
