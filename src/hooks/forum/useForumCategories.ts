
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export const useForumCategories = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load forum categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    fetchCategories
  };
};
