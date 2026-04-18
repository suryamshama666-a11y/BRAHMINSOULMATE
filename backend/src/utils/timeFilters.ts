/**
 * Centralized time filtering utilities
 * Consolidates duplicate time filter logic across routes
 */

export type TimeFilter = 'all' | 'today' | 'week' | 'month';

/**
 * Get date threshold for time filter
 * @param filter - Time filter type
 * @returns ISO date string for the filter threshold
 */
export const getTimeFilterDate = (filter: TimeFilter): string | null => {
  switch (filter) {
    case 'today': {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today.toISOString();
    }
    case 'week': {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return weekAgo.toISOString();
    }
    case 'month': {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return monthAgo.toISOString();
    }
    case 'all':
    default:
      return null;
  }
};

/**
 * Apply time filter to a Supabase query
 * @param query - Supabase query builder
 * @param timeFilter - Time filter type
 * @param columnName - Column name to filter on (default: 'created_at')
 * @returns Modified query with time filter applied
 */
export const applyTimeFilter = <T>(
  query: T,
  timeFilter: TimeFilter,
  columnName: string = 'created_at'
): T => {
  const filterDate = getTimeFilterDate(timeFilter);
  
  if (filterDate && typeof query === 'object' && query !== null && 'gte' in query) {
    return (query as any).gte(columnName, filterDate);
  }
  
  return query;
};
