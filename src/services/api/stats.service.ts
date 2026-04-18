import { supabase, apiCall, APIResponse } from './base';
import { matchingService } from './matching.service';

export interface DashboardStats {
  profileViews: number;
  interestsSent: number;
  messageCount: number;
  matchesCount: number;
  vDatesCount: number;
}

export class StatsService {
  /**
   * Get dashboard stats for a user
   * Returns actual counts from database
   */
  static async getDashboardStats(userId: string): Promise<APIResponse<DashboardStats>> {
    return apiCall(async () => {
      // Get actual message count
      const { count: messageCount, error: msgError } = await (supabase as any)
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      if (msgError) throw msgError;

      // Get matches count
      const matchesRes = await matchingService.getMatches(userId);
      const matchesCount = matchesRes.data?.length || 0;

      // Get profile views count
      const { count: profileViewsCount, error: viewsError } = await (supabase as any)
        .from('profile_views' as any)
        .select('*', { count: 'exact', head: true })
        .eq('viewed_profile_id', userId);

      if (viewsError) throw viewsError;

      // Get interests count
      const { count: interestsCount, error: intError } = await (supabase as any)
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('user1_id', userId);

      if (intError) throw intError;

      // Get v-dates count
      const { count: vDatesCount, error: vError } = await (supabase as any)
        .from('vdates')
        .select('*', { count: 'exact', head: true })
        .or(`organizer_id.eq.${userId},participant_id.eq.${userId}`);

      if (vError && vError.code !== 'PGRST116') throw vError;

      return {
        data: {
          profileViews: profileViewsCount || 0,
          interestsSent: interestsCount || 0,
          messageCount: messageCount || 0,
          matchesCount: matchesCount,
          vDatesCount: vDatesCount || 0
        },
        error: null
      };
    });
  }
}

export default StatsService;
