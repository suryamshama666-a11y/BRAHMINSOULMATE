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
        console.error('Error loading messages:', error);
        // Silently retry on network error if online
        if (navigator.onLine) {
           setTimeout(loadMessages, 3000);
        }
      }
    }, [userId, conversationUserId, supabase]);

    // Setup real-time subscriptions
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
        console.log('Network back online, reconnecting channels...');
        setupChannels();
        loadMessages();
      };

      window.addEventListener('online', handleOnline);

      return () => {
        if (messagesChannelRef.current) supabase.removeChannel(messagesChannelRef.current);
        if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        window.removeEventListener('online', handleOnline);
      };
    }, [userId, conversationUserId, loadMessages, getUnreadCount, onNewMessage, onMessageUpdate, onTypingUpdate, supabase]);


  // Clean up old typing indicators
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
