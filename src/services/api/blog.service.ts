import { supabase } from '@/lib/supabase';

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category: 'relationship-tips' | 'wedding-planning' | 'traditions' | 'success-tips' | 'announcements';
  author_name: string;
  is_published: boolean;
  is_featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'update' | 'promotion' | 'maintenance';
  is_active: boolean;
  priority: number;
  starts_at: string;
  ends_at?: string;
  created_at: string;
}

export const blogCategories = [
  { value: 'relationship-tips', label: 'Relationship Tips' },
  { value: 'wedding-planning', label: 'Wedding Planning' },
  { value: 'traditions', label: 'Traditions & Culture' },
  { value: 'success-tips', label: 'Success Tips' },
  { value: 'announcements', label: 'Announcements' }
] as const;

class BlogService {
  // Get all published articles
  async getArticles(category?: string, limit: number = 20): Promise<BlogArticle[]> {
    let query = (supabase as any)
      .from('blog_articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as BlogArticle[];
  }

  // Get featured articles
  async getFeaturedArticles(limit: number = 3): Promise<BlogArticle[]> {
    const { data, error } = await (supabase as any)
      .from('blog_articles')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as BlogArticle[];
  }

  // Get single article by slug
  async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    const { data, error } = await (supabase as any)
      .from('blog_articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    // Increment view count
    (supabase as any)
      .from('blog_articles')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', data.id);

    return data as BlogArticle;
  }

  // Get active announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await (supabase as any)
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Announcement[];
  }

  // Get latest announcement (for banner display)
  async getLatestAnnouncement(): Promise<Announcement | null> {
    const { data, error } = await (supabase as any)
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Announcement | null;
  }
}

export const blogService = new BlogService();
