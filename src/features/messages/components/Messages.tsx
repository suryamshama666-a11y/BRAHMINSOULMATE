import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';

interface MessagesProps {
  conversationId: string;
  receiverId: string;
}

export const Messages: React.FC<MessagesProps> = React.memo(({ conversationId, receiverId }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
  } = useMessages(conversationId);

  // Scroll to bottom on new messages if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Mark messages as read when they are viewed
  useEffect(() => {
    if (messages.length > 0 && receiverId) {
      const unreadMessages = messages.filter(
        (msg) => !msg.read_at && msg.sender_id === receiverId
      );
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg) => msg.id).join(',');
        markAsRead(messageIds);
      }
    }
  }, [messages, receiverId, markAsRead]);

  // Handle scroll events to determine if auto-scroll should be enabled
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  if (!user) {
    return null;
  }

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-4" 
      onScroll={handleScroll}
    >
      {/* Loading indicator when fetching more messages */}
      <div ref={loadMoreRef} className="flex justify-center py-2">
        {isLoading && (
          <div className="h-5 w-5 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
        )}
      </div>

      {/* Message list */}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwnMessage={message.sender_id === user.id}
        />
      ))}

      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center p-8 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Send a message to start the conversation
            </p>
          </div>
        </div>
      )}

      {/* Initial loading state */}
      {isLoading && messages.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <div className="h-8 w-8 border-4 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}); 