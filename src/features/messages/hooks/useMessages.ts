import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Define specific error types for better error handling
export class MessageError extends Error {
  constructor(message: string, public code?: string, public details?: unknown) {
    super(message);
    this.name = 'MessageError';
  }
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  content: string;
  created_at: string | null;
  media_url: string | null;
  message_type: MessageType;
  content_type?: MessageType; // For compatibility with existing code
  read: boolean;
  receiver_id: string;
  sender_id: string;
  status: MessageStatus;
  read_at?: string | null;
  conversation_id?: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface SendMessageParams {
  content: string;
  message_type: MessageType;
  media_url?: string;
  receiver_id: string;
}

export interface UploadFileParams {
  file: File;
  receiver_id: string;
}

export interface SendVoiceMessageParams {
  audio: Blob;
  receiver_id: string;
}

export interface ReactionParams {
  messageId: string;
  emoji: string;
}

const MESSAGES_PER_PAGE = 20;

export function useMessages(conversationId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { 
    data, 
    isLoading, 
    error
  } = useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      if (!user || !conversationId) return [];

      try {
        let query = supabase
          .from('messages')
          .select(`
            *,
            message_reactions (*)
          `)
          .order('created_at', { ascending: false })
          .range(pageParam, pageParam + MESSAGES_PER_PAGE - 1);

        // If it's a generated conversation ID (conv_user1_user2), extract partner ID
        if (conversationId.startsWith('conv_')) {
          const parts = conversationId.split('_');
          const partnerId = parts.find(p => p !== 'conv' && p !== user.id);
          if (partnerId) {
            query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`);
          }
        } else {
          // Fallback if it's a real UUID
          query = query.eq('conversation_id', conversationId);
        }

        const { data: messages, error } = await query;

        if (error) {
          throw new MessageError('Failed to fetch messages', error.code, error);
        }

        return (messages || []).map((message: any): Message & { reactions?: MessageReaction[] } => {
          const processedMessage: Message & { reactions?: MessageReaction[] } = {
            id: message.id || '',
            content: message.content || '',
            created_at: message.created_at || null,
            media_url: message.media_url || null,
            message_type: (message.message_type || 'text') as MessageType,
            content_type: (message.message_type || 'text') as MessageType,
            read: !!message.read_at,
            receiver_id: message.receiver_id || '',
            sender_id: message.sender_id || '',
            status: message.read_at ? 'read' : 
                   message.receiver_id === user.id ? 'delivered' : 'sent',
            read_at: message.read_at || null,
            reactions: message.message_reactions || []
          };

          return processedMessage;
        });
      } catch (err) {
        console.error('Message fetch error:', err);
        throw err;
      }
    },
    getNextPageParam: (lastPage: Message[], allPages: Message[][]) => {
      return lastPage.length === MESSAGES_PER_PAGE ? allPages.length * MESSAGES_PER_PAGE : undefined;
    },
    initialPageParam: 0,
    enabled: !!user && !!conversationId,
  });

  const messages = data?.pages.flatMap(page => page).reverse() || [];

  // Real-time subscription
  useEffect(() => {
    if (!user || !conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes for better real-time (reactions, read status, etc)
          schema: 'public',
          table: 'messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationId, queryClient]);

  const { mutate: sendMessage } = useMutation({
    mutationFn: async (params: SendMessageParams) => {
      if (!user) throw new MessageError('Not authenticated');

      try {
        const messageData = {
          sender_id: user.id,
          receiver_id: params.receiver_id,
          content: params.content,
          message_type: params.message_type || 'text',
          media_url: params.media_url || null,
          created_at: new Date().toISOString(),
          conversation_id: conversationId // Add conversation_id if available
        };

        const { data, error } = await supabase
          .from('messages')
          .insert(messageData)
          .select();

        if (error) throw new MessageError('Failed to send message', error.code, error);
        return data;
      } catch (err) {
        console.error('Send message error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const { mutate: _editMessage } = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      if (!user) throw new MessageError('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw new MessageError('Failed to edit message', error.code, error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to edit message');
    }
  });

  const { mutate: _deleteMessage } = useMutation({
    mutationFn: async (messageId: string) => {
      if (!user) throw new MessageError('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw new MessageError('Failed to delete message', error.code, error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete message');
    }
  });

  const { mutate: uploadFile } = useMutation({
    mutationFn: async ({ file, receiver_id }: UploadFileParams) => {
      if (!user) throw new MessageError('Not authenticated');

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const messageType = file.type.startsWith('image/') ? 'image' as MessageType :
                           file.type.startsWith('video/') ? 'video' as MessageType :
                           file.type.startsWith('audio/') ? 'audio' as MessageType : 'file' as MessageType;

        const { error: uploadError } = await supabase.storage
          .from('messages')
          .upload(fileName, file);

        if (uploadError) throw new MessageError('Failed to upload file', uploadError.message, uploadError);

        const { data: { publicUrl } } = supabase.storage
          .from('messages')
          .getPublicUrl(fileName);

        const messageData: SendMessageParams = {
          content: file.name,
          message_type: messageType,
          media_url: publicUrl,
          receiver_id,
        };

        return sendMessage(messageData);
      } catch (err) {
        console.error('File upload error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success('File uploaded and sent');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof MessageError 
        ? error.message 
        : 'Failed to upload file';
      toast.error(errorMessage);
    },
  });

  // Add a dedicated function for uploading media files and returning the URL
  const uploadMedia = async (file: File): Promise<string> => {
    if (!user) throw new MessageError('Not authenticated');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('messages')
        .upload(fileName, file);

      if (uploadError) throw new MessageError('Failed to upload file', uploadError.message, uploadError);

      const { data: { publicUrl } } = supabase.storage
        .from('messages')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Media upload error:', err);
      throw err;
    }
  };

  const { mutate: sendVoiceMessage } = useMutation({
    mutationFn: async ({ audio: blob, receiver_id }: SendVoiceMessageParams) => {
      if (!user) throw new MessageError('Not authenticated');

      try {
        const fileName = `${user.id}/${Date.now()}.webm`;

        const { error: uploadError } = await supabase.storage
          .from('messages')
          .upload(fileName, blob);

        if (uploadError) throw new MessageError('Failed to upload voice message', uploadError.message, uploadError);

        const { data: { publicUrl } } = supabase.storage
          .from('messages')
          .getPublicUrl(fileName);

        const messageData: SendMessageParams = {
          content: 'Voice message',
          message_type: 'audio',
          media_url: publicUrl,
          receiver_id,
        };

        return sendMessage(messageData);
      } catch (err) {
        console.error('Voice message error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success('Voice message sent');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof MessageError 
        ? error.message 
        : 'Failed to send voice message';
      toast.error(errorMessage);
    },
  });

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (messageIds: string) => {
      if (!user) throw new MessageError('Not authenticated');

      try {
        const idList = messageIds.split(',');
        const { error } = await supabase
          .from('messages')
          .update({
            read: true
          })
          .in('id', idList)
          .eq('receiver_id', user.id);

        if (error) throw new MessageError('Failed to mark messages as read', error.code, error);
      } catch (err) {
        console.error('Mark as read error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof MessageError 
        ? error.message 
        : 'Failed to mark message as read';
      toast.error(errorMessage);
    },
  });

  // Implement reactions feature
  const { mutate: addReaction } = useMutation({
    mutationFn: async ({ messageId, emoji }: ReactionParams) => {
      if (!user) throw new MessageError('Not authenticated');
      
      try {
        const { error } = await (supabase as any)
          .from('message_reactions')
          .upsert({ 
            message_id: messageId, 
            user_id: user.id, 
            emoji 
          }, { 
            onConflict: 'message_id,user_id,emoji' 
          });

        if (error) throw new MessageError('Failed to add reaction', error.code, error);
        return { success: true };
      } catch (err) {
        console.error('Add reaction error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof MessageError 
        ? error.message 
        : 'Failed to add reaction';
      toast.error(errorMessage);
    },
  });

  const { mutate: removeReaction } = useMutation({
    mutationFn: async ({ messageId, emoji }: ReactionParams) => {
      if (!user) throw new MessageError('Not authenticated');
      
      try {
        const { error } = await (supabase as any)
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);

        if (error) throw new MessageError('Failed to remove reaction', error.code, error);
        return { success: true };
      } catch (err) {
        console.error('Remove reaction error:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof MessageError 
        ? error.message 
        : 'Failed to remove reaction';
      toast.error(errorMessage);
    },
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    uploadFile,
    uploadMedia,
    sendVoiceMessage,
    markAsRead,
    addReaction,
    removeReaction,
  };
} 