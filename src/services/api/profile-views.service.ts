import { supabase } from '@/lib/supabase';
import { isDevBypassMode, getDevUser } from '@/config/dev';
import { Database } from '@/types/supabase';

type ProfileViewRow = any; // Database['public']['Tables']['profile_views']['Row'] is missing

export interface ProfileView extends ProfileViewRow {
  viewer?: unknown;
  viewed_profile?: unknown;
}

class ProfileViewsService {
  private readonly API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  private async getCurrentUser() {
    if (isDevBypassMode()) {
      return getDevUser();
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  private async fetchWithTimeout(url: string, options: any = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async trackView(viewedProfileId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      await this.trackViewDirect(user.id, viewedProfileId);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  private async trackViewDirect(viewerId: string, viewedProfileId: string): Promise<void> {
    if (viewerId === viewedProfileId) return;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: recentView } = await (supabase as any)
      .from('profile_views' as any)
      .select('id')
      .eq('viewer_id', viewerId)
      .eq('viewed_profile_id', viewedProfileId)
      .gte('viewed_at', oneDayAgo.toISOString())
      .single();

    if (recentView) return;

    await (supabase as any)
      .from('profile_views' as any)
      .insert({
        viewer_id: viewerId,
        viewed_profile_id: viewedProfileId,
        viewed_at: new Date().toISOString()
      });
  }

  async getWhoViewedMe(timeFilter: 'all' | 'today' | 'week' | 'month' = 'all'): Promise<ProfileView[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      let query = (supabase as any)
        .from('profile_views' as any)
        .select('*')
        .eq('viewed_profile_id', user.id)
        .order('viewed_at', { ascending: false });

      if (timeFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('viewed_at', today.toISOString());
      } else if (timeFilter === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('viewed_at', weekAgo.toISOString());
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte('viewed_at', monthAgo.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ProfileView[];
    } catch (error) {
      console.error('Error fetching viewers:', error);
      return [];
    }
  }

  async getIViewed(timeFilter: 'all' | 'today' | 'week' | 'month' = 'all'): Promise<ProfileView[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      let query = (supabase as any)
        .from('profile_views' as any)
        .select('*')
        .eq('viewer_id', user.id)
        .order('viewed_at', { ascending: false });

      if (timeFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('viewed_at', today.toISOString());
      } else if (timeFilter === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('viewed_at', weekAgo.toISOString());
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte('viewed_at', monthAgo.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ProfileView[];
    } catch (error) {
      console.error('Error fetching viewed profiles:', error);
      return [];
    }
  }

  async getViewCount(): Promise<number> {
    const user = await this.getCurrentUser();
    if (!user) return 0;

    try {
      const { count } = await (supabase as any)
        .from('profile_views' as any)
        .select('*', { count: 'exact', head: true })
        .eq('viewed_profile_id', user.id);

      return count || 0;
    } catch (error) {
      console.error('Error fetching view count:', error);
      return 0;
    }
  }
}

export const profileViewsService = new ProfileViewsService();
