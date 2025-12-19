import { supabase } from '@/lib/supabase';
import { isDevBypassMode, getDevUser } from '@/config/dev';

export interface ProfileView {
  id: string;
  viewer_id: string;
  viewed_profile_id: string;
  viewed_at: string;
  viewer?: any;
  viewed_profile?: any;
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

  async trackView(viewedProfileId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const response = await fetch(`${this.API_URL}/profile-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ viewedProfileId })
      });

      if (!response.ok) {
        console.warn('Failed to track profile view via API, falling back to direct Supabase');
        await this.trackViewDirect(user.id, viewedProfileId);
      }
    } catch (error) {
      console.error('Error tracking view via API:', error);
      await this.trackViewDirect(user.id, viewedProfileId);
    }
  }

  private async trackViewDirect(viewerId: string, viewedProfileId: string): Promise<void> {
    if (viewerId === viewedProfileId) return;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: recentView } = await supabase
      .from('profile_views')
      .select('id')
      .eq('viewer_id', viewerId)
      .eq('viewed_profile_id', viewedProfileId)
      .gte('viewed_at', oneDayAgo.toISOString())
      .single();

    if (recentView) return;

    await supabase
      .from('profile_views')
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
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const response = await fetch(`${this.API_URL}/profile-views/who-viewed-me?timeFilter=${timeFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.views || [];
      }

      console.warn('Failed to fetch viewers via API, falling back to direct Supabase');
      return await this.getWhoViewedMeDirect(user.id, timeFilter);
    } catch (error) {
      console.error('Error fetching viewers via API:', error);
      return await this.getWhoViewedMeDirect(user.id, timeFilter);
    }
  }

  private async getWhoViewedMeDirect(userId: string, timeFilter: 'all' | 'today' | 'week' | 'month'): Promise<ProfileView[]> {
    let query = supabase
      .from('profile_views')
      .select(`
        id,
        viewed_at,
        viewer:viewer_id(
          id,
          user_id,
          full_name,
          age,
          gender,
          height,
          religion,
          caste,
          gotra,
          city,
          state,
          education,
          occupation,
          subscription_type,
          last_active,
          avatar_url,
          profile_picture
        )
      `)
      .eq('viewed_profile_id', userId)
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
    return data || [];
  }

  async getIViewed(timeFilter: 'all' | 'today' | 'week' | 'month' = 'all'): Promise<ProfileView[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const response = await fetch(`${this.API_URL}/profile-views/i-viewed?timeFilter=${timeFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.views || [];
      }

      console.warn('Failed to fetch viewed profiles via API, falling back to direct Supabase');
      return await this.getIViewedDirect(user.id, timeFilter);
    } catch (error) {
      console.error('Error fetching viewed profiles via API:', error);
      return await this.getIViewedDirect(user.id, timeFilter);
    }
  }

  private async getIViewedDirect(userId: string, timeFilter: 'all' | 'today' | 'week' | 'month'): Promise<ProfileView[]> {
    let query = supabase
      .from('profile_views')
      .select(`
        id,
        viewed_at,
        viewed_profile:viewed_profile_id(
          id,
          user_id,
          full_name,
          age,
          gender,
          height,
          religion,
          caste,
          gotra,
          city,
          state,
          education,
          occupation,
          subscription_type,
          last_active,
          avatar_url,
          profile_picture
        )
      `)
      .eq('viewer_id', userId)
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
    return data || [];
  }

  async getViewCount(): Promise<number> {
    const user = await this.getCurrentUser();
    if (!user) return 0;

    try {
      const { count } = await supabase
        .from('profile_views')
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

