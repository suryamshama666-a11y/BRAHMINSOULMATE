
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send } from 'lucide-react';
import { ChatMessage } from './useVideoCall';

interface VideoCallChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

export const VideoCallChat = ({ messages, onSendMessage, onClose }: VideoCallChatProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="absolute right-4 top-16 z-20 w-80 h-96">
      <Card className="border-gray-700 bg-gray-800 text-white h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Chat</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-2">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`p-2 rounded max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-blue-600 ml-auto text-right'
                      : 'bg-gray-600 mr-auto'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs text-gray-300 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
