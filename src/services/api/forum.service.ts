import { supabase } from '@/lib/supabase';

export interface ForumPost {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  views: number;
  likes: number;
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
  created_at: string;
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

    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        user_id: user.id,
        category,
        title,
        content,
        views: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all posts
  async getPosts(
    category?: string,
    sortBy: 'recent' | 'popular' | 'views' = 'recent',
    limit: number = 20
  ): Promise<ForumPost[]> {
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        user:user_id (
          user_id,
          full_name,
          profile_picture
        )
      `);

    if (category) {
      query = query.eq('category', category);
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('likes', { ascending: false });
        break;
      case 'views':
        query = query.order('views', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    // Get comment counts and like status
    const postsWithDetails = await Promise.all(
      (data || []).map(async (post) => {
        // Get comment count
        const { count } = await supabase
          .from('forum_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Check if user liked the post
        let isLiked = false;
        if (user) {
          const { data: like } = await supabase
            .from('forum_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();

          isLiked = !!like;
        }

        return {
          ...post,
          comment_count: count || 0,
          is_liked: isLiked
        };
      })
    );

    return postsWithDetails;
  }

  // Get post by ID
  async getPost(postId: string): Promise<ForumPost | null> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        user:user_id (
          user_id,
          full_name,
          profile_picture
        )
      `)
      .eq('id', postId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    // Increment view count
    await supabase
      .from('forum_posts')
      .update({ views: data.views + 1 })
      .eq('id', postId);

    // Get comment count
    const { count } = await supabase
      .from('forum_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    // Check if user liked the post
    let isLiked = false;
    if (user) {
      const { data: like } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      isLiked = !!like;
    }

    return {
      ...data,
      views: data.views + 1,
      comment_count: count || 0,
      is_liked: isLiked
    };
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

  // Like/Unlike post
  async toggleLike(postId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('forum_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('forum_likes')
        .delete()
        .eq('id', existingLike.id);

      // Decrement like count
      await supabase.rpc('decrement_post_likes', { post_id: postId });

      return false;
    } else {
      // Like
      await supabase
        .from('forum_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      // Increment like count
      await supabase.rpc('increment_post_likes', { post_id: postId });

      // Notify post author
      const { data: post } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (post && post.user_id !== user.id) {
        await this.notifyPostAuthor(post.user_id, 'like', postId);
      }

      return true;
    }
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
        content
      })
      .select()
      .single();

    if (error) throw error;

    // Notify post author
    const { data: post } = await supabase
      .from('forum_posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (post && post.user_id !== user.id) {
      await this.notifyPostAuthor(post.user_id, 'comment', postId);
    }

    return data;
  }

  // Get comments for post
  async getComments(postId: string): Promise<ForumComment[]> {
    const { data, error } = await supabase
      .from('forum_comments')
      .select(`
        *,
        user:user_id (
          user_id,
          full_name,
          profile_picture
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
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

  // Report post or comment
  async reportContent(
    contentType: 'post' | 'comment',
    contentId: string,
    reason: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const reportData = contentType === 'post'
      ? { post_id: contentId, reporter_id: user.id, reason, status: 'pending' as const }
      : { comment_id: contentId, reporter_id: user.id, reason, status: 'pending' as const };

    const { error } = await supabase
      .from('forum_reports')
      .insert(reportData);

    if (error) throw error;

    // Notify admins
    await this.notifyAdminsOfReport(contentType, contentId, reason);
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
    return data || [];
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
      });
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

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }
}

export const forumService = new ForumService();
