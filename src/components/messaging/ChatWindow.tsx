import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Send, Phone, Video, MoreVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { messagesService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ChatWindowProps {
  partnerId: string;
  partnerName: string;
  partnerImage?: string;
}

export const ChatWindow = ({ partnerId, partnerName, partnerImage }: ChatWindowProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['conversation', partnerId],
    queryFn: async () => {
      return await messagesService.getConversation(partnerId);
    },
    refetchInterval: 3000 // Poll every 3 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await messagesService.sendMessage(partnerId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', partnerId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0) {
      messagesService.markAsRead(partnerId);
    }
  }, [messages, partnerId]);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = messagesService.subscribeToMessages((message) => {
      if (message.sender_id === partnerId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', partnerId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    });

    return unsubscribe;
  }, [partnerId, queryClient]);

  // Subscribe to typing indicators
  useEffect(() => {
    const unsubscribe = messagesService.subscribeToTyping(partnerId, (typing) => {
      setIsTyping(typing);
    });

    return unsubscribe;
  }, [partnerId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    messagesService.sendTypingIndicator(partnerId, value.length > 0);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar src={partnerImage} fallback={partnerName[0]} className="h-10 w-10" />
          <div>
            <h3 className="font-semibold">{partnerName}</h3>
            {isTyping ? (
              <p className="text-xs text-blue-600">typing...</p>
            ) : (
              <p className="text-xs text-green-600">Online</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === user?.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            disabled={sendMessageMutation.isPending}
          />
          <Button onClick={sendMessage} disabled={sendMessageMutation.isPending || !newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
