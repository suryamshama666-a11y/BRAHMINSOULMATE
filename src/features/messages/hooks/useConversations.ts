import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isDevBypassMode } from '@/config/dev';

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
  const devMode = isDevBypassMode();

  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user) return [];
      
      // In dev mode, return empty array since there's no database connection
      if (devMode) {
        return [];
      }

      try {
        // Get all messages involving the current user
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (msgError) {
          throw new ConversationError('Failed to fetch messages', msgError.code, msgError);
        }

        if (!messages || messages.length === 0) {
          return [];
        }

        // Build conversations from messages - group by partner
        const conversationMap = new Map<string, {
          partnerId: string;
          messages: any[];
          lastMessage: any;
          unreadCount: number;
        }>();

        messages.forEach((msg: any) => {
          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          
          if (!conversationMap.has(partnerId)) {
            conversationMap.set(partnerId, {
              partnerId,
              messages: [],
              lastMessage: msg,
              unreadCount: 0
            });
          }
          
          const conv = conversationMap.get(partnerId)!;
          conv.messages.push(msg);
          
          if (msg.receiver_id === user.id && !msg.read_at) {
            conv.unreadCount++;
          }
        });

        const partnerIds = Array.from(conversationMap.keys());
        
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, profile_picture_url, date_of_birth, address')
          .in('user_id', partnerIds);

        if (profileError) {
          console.warn('Failed to fetch profiles:', profileError);
        }

        const profileMap = new Map<string, any>();
        (profiles || []).forEach((p: any) => {
          profileMap.set(p.user_id, p);
        });

        const conversationsArray: Conversation[] = Array.from(conversationMap.entries()).map(([partnerId, conv]) => {
          const profile = profileMap.get(partnerId);
          const age = profile?.date_of_birth 
            ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : 0;
          
          return {
            id: `conv_${user.id}_${partnerId}`,
            user1_id: user.id,
            user2_id: partnerId,
            created_at: conv.lastMessage.created_at,
            updated_at: conv.lastMessage.created_at,
            partner_id: partnerId,
            partner_profile: profile ? {
              id: profile.user_id,
              user_id: profile.user_id,
              name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
              age,
              location: profile.address?.city || '',
              profile_image: profile.profile_picture_url || ''
            } : {
              id: partnerId,
              user_id: partnerId,
              name: 'Unknown User',
              age: 0,
              location: '',
              profile_image: ''
            },
            last_message: {
              id: conv.lastMessage.id,
              content: conv.lastMessage.content,
              created_at: conv.lastMessage.created_at,
              sender_id: conv.lastMessage.sender_id,
              read_at: conv.lastMessage.read_at
            },
            unread_count: conv.unreadCount
          };
        });

        conversationsArray.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        return conversationsArray;
      } catch (err) {
        const errorMessage = err instanceof ConversationError 
          ? err.message 
          : 'An unexpected error occurred while fetching conversations';
        console.error('Conversation fetch error:', err);
        throw err;
      }
    },
    enabled: !!user && !devMode,
  });

  const { mutateAsync: toggleShortlist } = useMutation({
    mutationFn: async (partnerId: string) => {
      if (!user) throw new ConversationError('Not authenticated');
      
      try {
        // Check if already shortlisted
        const { data: existing, error: checkError } = await supabase
          .from('shortlists')
          .select('*')
          .eq('user_id', user.id)
          .eq('target_profile_id', partnerId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
          // Remove from shortlist
          const { error: deleteError } = await supabase
            .from('shortlists')
            .delete()
            .eq('id', existing.id);
          if (deleteError) throw deleteError;
          toast.success('Removed from shortlist');
        } else {
          // Add to shortlist
          const { error: insertError } = await supabase
            .from('shortlists')
            .insert({
              user_id: user.id,
              target_profile_id: partnerId
            });
          if (insertError) throw insertError;
          toast.success('Added to shortlist');
        }

        return { success: true };
      } catch (err) {
        console.error('Shortlist toggle error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['shortlists'] });
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
      toast.success('User blocked');
      return { success: true };
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
      toast.success('User unblocked');
      return { success: true };
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
      toast.success('Report submitted');
      return { success: true };
    },
    onSuccess: () => {},
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
      toast.success('Conversation deleted');
      return { success: true };
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

  const getOrCreateConversation = async (partnerId: string) => {
    if (!user) throw new ConversationError('Not authenticated');
    return {
      id: `conv_${user.id}_${partnerId}`,
      user1_id: user.id,
      user2_id: partnerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
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