import { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabase } from '@/lib/getSupabase';
import { toast } from 'sonner';

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
  
  const supabase = getSupabase();
  const subscriptionRef = useRef<any>(null);
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
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  }, [userId, conversationUserId, supabase]);

  // Send message
  const sendMessage = useCallback(async (content: string, messageType: string = 'text', attachmentUrl?: string) => {
    if (!conversationUserId || !content.trim()) return null;

    try {
      const messageData = {
        sender_id: userId,
        receiver_id: conversationUserId,
        content: content.trim(),
        message_type: messageType,
        attachment_url: attachmentUrl,
        read: false
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Stop typing indicator
      await sendTypingIndicator(false);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return null;
    }
  }, [userId, conversationUserId, supabase]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds)
        .eq('receiver_id', userId);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [userId, supabase]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!conversationUserId) return;

    try {
      // Use Supabase realtime to broadcast typing status
      const channel = supabase.channel(`typing:${userId}:${conversationUserId}`);
      
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId,
          isTyping,
          timestamp: Date.now()
        }
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Auto-stop typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingIndicator(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [userId, conversationUserId, supabase]);

  // Get unread message count
  const getUnreadCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  }, [userId, supabase]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', userId); // Only sender can delete

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, deleted_at: new Date().toISOString() } : msg
      ));

      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, [userId, supabase]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: newContent.trim(),
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', userId); // Only sender can edit

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent.trim(), edited_at: new Date().toISOString() }
          : msg
      ));

      toast.success('Message updated');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  }, [userId, supabase]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages')
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
          
          // Add to messages if it's part of current conversation
          if (!conversationUserId || 
              newMessage.sender_id === conversationUserId || 
              newMessage.receiver_id === conversationUserId) {
            setMessages(prev => [...prev, newMessage]);
          }

          // Update unread count
          setUnreadCount(prev => prev + 1);

          // Call callback
          onNewMessage?.(newMessage);

          // Show notification if not in current conversation
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
          table: 'messages',
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          ));

          onMessageUpdate?.(updatedMessage);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${conversationUserId}:${userId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId: typingUserId, isTyping, timestamp } = payload.payload;
        
        setTypingUsers(prev => {
          const filtered = prev.filter(t => t.userId !== typingUserId);
          if (isTyping) {
            return [...filtered, { userId: typingUserId, isTyping, timestamp }];
          }
          return filtered;
        });

        onTypingUpdate?.(typingUserId, isTyping);
      })
      .subscribe();

    subscriptionRef.current = { messagesChannel, typingChannel };

    // Load initial data
    loadMessages();
    getUnreadCount();

    // Cleanup
    return () => {
      messagesChannel.unsubscribe();
      typingChannel.unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId, conversationUserId, loadMessages, getUnreadCount, onNewMessage, onMessageUpdate, onTypingUpdate, supabase]);

  // Clean up old typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => prev.filter(t => now - t.timestamp < 5000)); // 5 second timeout
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    messages: messages.filter(msg => !msg.deleted_at), // Filter out deleted messages
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