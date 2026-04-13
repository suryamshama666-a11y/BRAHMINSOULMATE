import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type ForumPostRow = Database['public']['Tables']['forum_posts']['Row'];
type ForumCommentRow = Database['public']['Tables']['forum_comments']['Row'];

export interface ForumPost extends ForumPostRow {
  user?: unknown;
  comment_count?: number;
  is_liked?: boolean;
  views?: number;
  likes?: number;
}

export interface ForumComment extends ForumCommentRow {
  user?: unknown;
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

    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        user_id: user.id,
        category,
        title,
        content,
        view_count: 0,
        like_count: 0,
        is_locked: false
      } as unknown as Database['public']['Tables']['forum_posts']['Insert'])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as ForumPost;
  }

  // Get all posts
  async getPosts(
    category?: string,
    sortBy: 'recent' | 'popular' | 'views' = 'recent',
    limit: number = 20
  ): Promise<ForumPost[]> {
    const { data: { _user } } = await supabase.auth.getUser();

    let query = supabase
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

    return (data || []) as unknown as ForumPost[];
  }

  // Get post by ID
  async getPost(postId: string): Promise<ForumPost | null> {
    const { data: { _user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    // Increment view count
    await supabase
      .from('forum_posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', postId);

    // Get comment count
    const { count } = await supabase
      .from('forum_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    return {
      ...data,
      views: (data.view_count || 0) + 1,
      comment_count: count || 0,
      is_liked: false
    } as unknown as ForumPost;
  }

  // Update post
  async updatePost(postId: string, title: string, content: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
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

    const { error } = await supabase
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

    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        reply_count: 0
      } as unknown as Database['public']['Tables']['forum_comments']['Insert'])
      .select()
      .single();

    if (error) throw error;

    return data as unknown as ForumComment;
  }

  // Get comments for post
  async getComments(postId: string): Promise<ForumComment[]> {
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as ForumComment[];
  }

  // Delete comment
  async deleteComment(commentId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
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

    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as ForumPost[];
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

      await supabase.from('notifications').insert({
        user_id: userId,
        type: `forum_${type}`,
        title: 'Forum Activity',
        message,
        action_url: `/community/posts/${postId}`,
        read: false
      } as unknown as Database['public']['Tables']['notifications']['Insert']);
    } catch (error) {
      console.error('Failed to notify post author:', error);
    }
  }

  // Notify admins of report
  private async notifyAdminsOfReport(
    contentType: string,
    contentId: string,
    reason: string
  ): Promise<void> {
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      const notifications = admins.map(admin => ({
        user_id: admin.user_id,
        type: 'forum_report',
        title: 'Content Reported',
        message: `A ${contentType} has been reported: ${reason}`,
        action_url: `/admin/reports`,
        read: false
      }));

      await supabase.from('notifications').insert(notifications as unknown as Database['public']['Tables']['notifications']['Insert'][]);
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }
}

export const forumService = new ForumService();
