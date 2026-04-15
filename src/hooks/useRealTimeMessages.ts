import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type?: string;
  attachment_url?: string;
  read: boolean;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
}

interface UseRealTimeMessagesProps {
  userId: string;
  conversationUserId?: string;
  onNewMessage?: (message: Message) => void;
  onMessageUpdate?: (message: Message) => void;
  onTypingUpdate?: (userId: string, isTyping: boolean) => void;
}

interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

export const useRealTimeMessages = ({
  userId,
  conversationUserId,
  onNewMessage,
  onMessageUpdate,
  onTypingUpdate
}: UseRealTimeMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesChannelRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial messages for conversation
  const loadMessages = useCallback(async () => {
    if (!conversationUserId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${conversationUserId}),and(sender_id.eq.${conversationUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      logger.error('Error loading messages:', error);
      // Silently retry on network error if online
      if (navigator.onLine) {
         setTimeout(loadMessages, 3000);
      }
    }
  }, [userId, conversationUserId]);

  // Get unread count
  const getUnreadCount = useCallback(async () => {
    if (!userId) return 0;
    
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('read', false);
        
      if (error) throw error;
      setUnreadCount(count || 0);
      return count || 0;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      return 0;
    }
  }, [userId]);

  // Send message
  const sendMessage = useCallback(async (content: string, receiverId?: string) => {
    const targetId = receiverId || conversationUserId;
    if (!targetId || !content.trim()) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: targetId,
          content: content.trim(),
          read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error sending message:', error);
      toast.error('Failed to send message');
      return null;
    }
  }, [userId, conversationUserId]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      logger.error('Error marking message as read:', error);
    }
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!conversationUserId) return;
    
    try {
      await supabase
        .channel(`typing:${userId}:${conversationUserId}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId, isTyping, timestamp: Date.now() }
        });
    } catch (error) {
      logger.error('Error sending typing indicator:', error);
    }
  }, [userId, conversationUserId]);

  // Delete message (soft delete)
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      logger.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, []);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: newContent,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent, edited_at: new Date().toISOString() } : msg
      ));
      toast.success('Message updated');
    } catch (error) {
      logger.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  }, []);

  // effect:audited — Real-time Supabase subscription for messages and typing indicators
  useEffect(() => {
    if (!userId) return;

    const setupChannels = () => {
      // Cleanup previous subscriptions
      if (messagesChannelRef.current) supabase.removeChannel(messagesChannelRef.current);
      if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);

      // Subscribe to new messages
      messagesChannelRef.current = supabase
        .channel(`messages:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          },
          (payload) => {
            const newMessage = payload.new as Message;
            
            if (!conversationUserId || 
                newMessage.sender_id === conversationUserId || 
                newMessage.receiver_id === conversationUserId) {
              setMessages(prev => [...prev, newMessage]);
            }

            setUnreadCount(prev => prev + 1);
            onNewMessage?.(newMessage);

            if (conversationUserId !== newMessage.sender_id) {
              toast.info('New message received');
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const updatedMessage = payload.new as Message;
            
            if (updatedMessage.sender_id === userId || updatedMessage.receiver_id === userId) {
              setMessages(prev => prev.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              ));
              onMessageUpdate?.(updatedMessage);
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });

      // Subscribe to typing indicators
      if (conversationUserId) {
        typingChannelRef.current = supabase
          .channel(`typing:${conversationUserId}:${userId}`)
          .on('broadcast', { event: 'typing' }, (payload) => {
            const { userId: typingUserId, isTyping, timestamp } = payload.payload;
            
            if (typingUserId !== userId) {
              setTypingUsers(prev => {
                const filtered = prev.filter(t => t.userId !== typingUserId);
                if (isTyping) {
                  return [...filtered, { userId: typingUserId, isTyping, timestamp }];
                }
                return filtered;
              });
              onTypingUpdate?.(typingUserId, isTyping);
            }
          })
          .subscribe();
      }
    };

    setupChannels();
    loadMessages();
    getUnreadCount();

    const handleOnline = () => {
      logger.log('Network back online, reconnecting channels...');
      setupChannels();
      loadMessages();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      if (messagesChannelRef.current) supabase.removeChannel(messagesChannelRef.current);
      if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      window.removeEventListener('online', handleOnline);
    };
  }, [userId, conversationUserId, loadMessages, getUnreadCount, onNewMessage, onMessageUpdate, onTypingUpdate]);


  // effect:audited — Interval for cleaning up stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => prev.filter(t => now - t.timestamp < 5000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    messages: messages.filter(msg => !msg.deleted_at),
    isConnected,
    unreadCount,
    typingUsers,
    sendMessage,
    markAsRead,
    sendTypingIndicator,
    deleteMessage,
    editMessage,
    loadMessages,
    getUnreadCount
  };
};
