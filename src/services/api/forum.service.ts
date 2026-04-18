import { supabase } from '@/lib/supabase';

export interface ForumPost {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  view_count: number;
  like_count: number;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  user?: any;
  comment_count?: number;
  is_liked?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  reply_count: number;
  created_at: string;
  updated_at: string;
  user?: any;
}

export interface ForumReport {
  id: string;
  post_id?: string;
  comment_id?: string;
  reporter_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

class ForumService {
  // Forum categories
  readonly categories = [
    'General Discussion',
    'Wedding Planning',
    'Relationship Advice',
    'Cultural Traditions',
    'Success Stories',
    'Questions & Answers',
    'Events & Meetups'
  ];

  // Create post
  async createPost(
    category: string,
    title: string,
    content: string
  ): Promise<ForumPost> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Validate category
    if (!this.categories.includes(category)) {
      throw new Error('Invalid category');
    }

    // Validate content
    if (title.length < 5 || title.length > 200) {
      throw new Error('Title must be between 5 and 200 characters');
    }

    if (content.length < 10 || content.length > 5000) {
      throw new Error('Content must be between 10 and 5000 characters');
    }

    const { data, error } = await (supabase as any)
      .from('forum_posts')
      .insert({
        user_id: user.id,
        category,
        title,
        content,
        view_count: 0,
        like_count: 0,
        is_locked: false
      })
      .select()
      .single();

    if (error) throw error;
    return data as ForumPost;
  }

  // Get all posts
  async getPosts(
    category?: string,
    sortBy: 'recent' | 'popular' | 'views' = 'recent',
    limit: number = 20
  ): Promise<ForumPost[]> {
    let query = (supabase as any)
      .from('forum_posts')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('like_count', { ascending: false });
        break;
      case 'views':
        query = query.order('view_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []) as ForumPost[];
  }

  // Get post by ID
  async getPost(postId: string): Promise<ForumPost | null> {
    const { data, error } = await (supabase as any)
      .from('forum_posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    // Increment view count (fire and forget)
    (supabase as any)
      .from('forum_posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', postId);

    // Get comment count
    const { count } = await (supabase as any)
      .from('forum_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    return {
      ...data,
      comment_count: count || 0,
      is_liked: false
    } as ForumPost;
  }

  // Update post
  async updatePost(postId: string, title: string, content: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('forum_posts')
      .update({
        title,
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Delete post
  async deletePost(postId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('forum_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Add comment
  async addComment(postId: string, content: string): Promise<ForumComment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (content.length < 1 || content.length > 1000) {
      throw new Error('Comment must be between 1 and 1000 characters');
    }

    const { data, error } = await (supabase as any)
      .from('forum_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        reply_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    return data as ForumComment;
  }

  // Get comments for post
  async getComments(postId: string): Promise<ForumComment[]> {
    const { data, error } = await (supabase as any)
      .from('forum_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as ForumComment[];
  }

  // Delete comment
  async deleteComment(commentId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('forum_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Get my posts
  async getMyPosts(): Promise<ForumPost[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('forum_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ForumPost[];
  }

  // Notify post author
  private async notifyPostAuthor(
    userId: string,
    type: 'like' | 'comment',
    postId: string
  ): Promise<void> {
    try {
      const message = type === 'like'
        ? 'Someone liked your forum post'
        : 'Someone commented on your forum post';

      await (supabase as any).from('notifications').insert({
        user_id: userId,
        type: `forum_${type}`,
        title: 'Forum Activity',
        message,
        action_url: `/community/posts/${postId}`,
        read: false
      });
    } catch (error) {
      // Silently fail notification
    }
  }

  private async notifyAdminsOfReport(
    contentType: string,
    contentId: string,
    reason: string
  ): Promise<void> {
    try {
      const { data: admins } = await (supabase as any)
        .from('profiles')
        .select('user_id')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      const notifications = admins.map((admin: any) => ({
        user_id: admin.user_id,
        type: 'forum_report',
        title: 'Content Reported',
        message: `A ${contentType} has been reported: ${reason}`,
        action_url: `/admin/reports`,
        read: false
      }));

      await (supabase as any).from('notifications').insert(notifications);
    } catch (error) {
      // Silently fail admin notification
    }
  }
}

export const forumService = new ForumService();
