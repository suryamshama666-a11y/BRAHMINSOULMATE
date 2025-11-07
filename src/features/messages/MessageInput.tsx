
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

type MessageInputProps = {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
};

export const MessageInput = ({ newMessage, setNewMessage, handleSendMessage }: MessageInputProps) => {
  return (
    <div className="p-4 border-t bg-white">
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <Input 
          placeholder="Type a message..." 
          className="flex-grow rounded-full"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button 
          type="submit" 
          className="rounded-full bg-gradient-matrimony text-white hover:opacity-90"
          disabled={!newMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
