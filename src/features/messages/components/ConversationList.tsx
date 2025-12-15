import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

// Define a simplified conversation type for this component
interface ConversationItem {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar?: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
    read: boolean;
  };
  unread_count: number;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedConversation: string | null;
  onSelect: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelect,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;
    if (!conversation.partner_name) return false;
    
    return conversation.partner_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort conversations by last message time (most recent first)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
    const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
    return bTime - aTime;
  });

  // Format the last message time
  const formatMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  // Get avatar fallback letter safely
  const getAvatarFallback = (name: string) => {
    if (name && typeof name === 'string' && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations"
            className="pl-9 bg-gray-100 border-none focus:ring-1 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-gray-500">No conversations found</p>
            {searchQuery && (
              <Button 
                variant="link" 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-amber-500"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          sortedConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelect(conversation.partner_id)}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                selectedConversation === conversation.partner_id ? 'bg-amber-50' : ''
              }`}
            >
              {/* Avatar */}
              <Avatar
                src={conversation.partner_avatar}
                alt={conversation.partner_name || 'User'}
                fallback={getAvatarFallback(conversation.partner_name)}
                className="h-10 w-10 mr-3"
              />

              {/* Conversation details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                    <h3 className="text-[11px] font-medium text-gray-900 truncate">
                      {conversation.partner_name || 'User'}
                    </h3>
                    <span className="text-[10px] text-green-500">Online</span>
                  </div>
                  {conversation.last_message && (
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(conversation.last_message.created_at)}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  {conversation.last_message ? (
                    <p className="text-sm text-gray-500 truncate max-w-[180px]">
                      {conversation.last_message.sender_id === user?.id ? 'You: ' : ''}
                      {conversation.last_message.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No messages yet</p>
                  )}
                  
                  {conversation.unread_count > 0 && (
                    <span className="ml-2 bg-amber-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Mark as read</DropdownMenuItem>
                  <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete conversation</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  );
};