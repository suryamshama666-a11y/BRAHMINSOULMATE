
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Profile } from '@/data/profiles';
import { formatMessageTime, Message } from '../types';

interface ChatMessagesProps {
  conversationMessages: Message[];
  conversationPartner: Profile;
  userId?: string;
}

export const ChatMessages = ({
  conversationMessages,
  conversationPartner,
  userId
}: ChatMessagesProps) => {
  return (
    <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
      <div className="space-y-4">
        {conversationMessages.map(message => {
          const isOwn = message.senderId === userId;
          
          return (
            <div 
              key={message.id} 
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end">
                {!isOwn && (
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={conversationPartner.images[0]} alt={conversationPartner.name} />
                    <AvatarFallback className="bg-brahmin-primary text-white">
                      {conversationPartner.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`max-w-md rounded-t-lg ${
                    isOwn 
                      ? 'bg-brahmin-primary text-white rounded-bl-lg rounded-br-none' 
                      : 'bg-white rounded-br-lg rounded-bl-none'
                  } p-3 shadow-sm`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`text-xs mt-1 text-right ${isOwn ? 'text-gray-200' : 'text-gray-500'}`}>
                    {formatMessageTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
