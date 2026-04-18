
export interface ForumPost {
  id: string;
  category_id: string | null;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  like_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumSearchFilters {
  categoryId?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'replies';
  timeRange?: 'today' | 'week' | 'month' | 'all';
  hasReplies?: boolean;
  isPinned?: boolean;
}
