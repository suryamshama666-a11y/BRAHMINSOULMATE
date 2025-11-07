import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Define specific error types for better error handling
export class ConversationError extends Error {
  constructor(message: string, public code?: string, public details?: unknown) {
    super(message);
    this.name = 'ConversationError';
  }
}

// Define types for the conversation and partner profile
export interface PartnerProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  location: string;
  profile_image: string;
}

export interface LastMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  read_at: string | null;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  partner_id?: string;
  partner_profile?: PartnerProfile;
  last_message?: LastMessage;
  unread_count: number;
}

interface ReportUserParams {
  partnerId: string;
  reason: string;
  details?: string;
}

export function useConversations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            partner_profile:profiles!partner_id(*)
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (error) {
          throw new ConversationError('Failed to fetch conversations', error.code, error);
        }

        // Process the conversations to add the partner_id field
        return (data || []).map((conversation: any): Conversation => {
          // Determine who the partner is
          const partnerId = conversation.user1_id === user.id 
            ? conversation.user2_id 
            : conversation.user1_id;
          
          // Add the partner_id to the conversation
          return {
            ...conversation,
            partner_id: partnerId,
            unread_count: conversation.unread_count || 0,
          };
        });
      } catch (err) {
        const errorMessage = err instanceof ConversationError 
          ? err.message 
          : 'An unexpected error occurred while fetching conversations';
        console.error('Conversation fetch error:', err);
        toast.error(errorMessage);
        throw err;
      }
    },
    enabled: !!user,
  });

  const { mutateAsync: toggleShortlist } = useMutation({
    mutationFn: async (partnerId: string) => {
      if (!user) throw new ConversationError('Not authenticated');

      try {
        // In a real app, this would update a shortlist table in the database
        toast.success('Shortlist status updated');
        return { success: true };
      } catch (err) {
        console.error('Shortlist error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof ConversationError 
        ? error.message 
        : 'Failed to update shortlist';
      toast.error(errorMessage);
    },
  });

  const { mutateAsync: blockUser } = useMutation({
    mutationFn: async (partnerId: string) => {
      if (!user) throw new ConversationError('Not authenticated');

      try {
        // In a real app, this would update a blocked_users table in the database
        toast.success('User blocked');
        return { success: true };
      } catch (err) {
        console.error('Block user error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof ConversationError 
        ? error.message 
        : 'Failed to block user';
      toast.error(errorMessage);
    },
  });

  const { mutateAsync: unblockUser } = useMutation({
    mutationFn: async (partnerId: string) => {
      if (!user) throw new ConversationError('Not authenticated');

      try {
        // In a real app, this would update a blocked_users table in the database
        toast.success('User unblocked');
        return { success: true };
      } catch (err) {
        console.error('Unblock user error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof ConversationError 
        ? error.message 
        : 'Failed to unblock user';
      toast.error(errorMessage);
    },
  });

  const { mutateAsync: reportUser } = useMutation({
    mutationFn: async ({ partnerId, reason, details }: ReportUserParams) => {
      if (!user) throw new ConversationError('Not authenticated');

      try {
        // In a real app, this would create a report in the database
        toast.success('Report submitted');
        return { success: true };
      } catch (err) {
        console.error('Report user error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      // No need to invalidate queries here as reporting doesn't change the conversation list
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof ConversationError 
        ? error.message 
        : 'Failed to submit report';
      toast.error(errorMessage);
    },
  });

  const { mutateAsync: deleteConversation } = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new ConversationError('Not authenticated');

      try {
        // In a real app, this would delete the conversation from the database
        toast.success('Conversation deleted');
        return { success: true };
      } catch (err) {
        console.error('Delete conversation error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof ConversationError 
        ? error.message 
        : 'Failed to delete conversation';
      toast.error(errorMessage);
    },
  });

  // Function to get or create a conversation with a user
  const getOrCreateConversation = async (partnerId: string) => {
    if (!user) throw new ConversationError('Not authenticated');

    try {
      // First check if a conversation already exists
      const { data: existingConversations, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${user.id})`)
        .limit(1);

      if (fetchError) {
        throw new ConversationError('Failed to check for existing conversation', fetchError.code, fetchError);
      }

      if (existingConversations && existingConversations.length > 0) {
        return existingConversations[0];
      }

      // If no conversation exists, create a new one
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: partnerId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw new ConversationError('Failed to create conversation', createError.code, createError);
      }

      // Invalidate the conversations query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      return newConversation;
    } catch (err) {
      console.error('Get or create conversation error:', err);
      throw err;
    }
  };

  return {
    conversations,
    isLoading,
    error,
    toggleShortlist,
    blockUser,
    unblockUser,
    reportUser,
    deleteConversation,
    getOrCreateConversation,
  };
} 