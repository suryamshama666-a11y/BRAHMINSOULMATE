import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle } from 'lucide-react';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { messagesService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<string | null>(
    searchParams.get('user')
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Mock conversations for development
  const mockConversations = [
    {
      user_id: 'user-1',
      full_name: 'Priya Sharma',
      profile_picture: 'https://randomuser.me/api/portraits/women/1.jpg',
      last_message: 'Hi! Thanks for showing interest in my profile.',
      last_message_at: new Date().toISOString(),
      unread_count: 2
    },
    {
      user_id: 'user-2',
      full_name: 'Anjali Patel',
      profile_picture: 'https://randomuser.me/api/portraits/women/2.jpg',
      last_message: 'Would love to connect and know more about you.',
      last_message_at: new Date(Date.now() - 3600000).toISOString(),
      unread_count: 0
    },
    {
      user_id: 'user-3',
      full_name: 'Kavya Iyer',
      profile_picture: 'https://randomuser.me/api/portraits/women/3.jpg',
      last_message: 'Looking forward to our V-Date!',
      last_message_at: new Date(Date.now() - 7200000).toISOString(),
      unread_count: 1
    }
  ];

  // Fetch conversations
  const { data: conversations = mockConversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      try {
        const data = await messagesService.getConversations();
        return data.length > 0 ? data : mockConversations;
      } catch (error) {
        return mockConversations;
      }
    },
    enabled: !!user?.id,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.user_id === selectedUser);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-red-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-amber-50/40">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2 flex items-center">
            <MessageCircle className="h-8 w-8 mr-3 text-amber-600" />
            Messages
          </h1>
          <p className="text-gray-600">Chat with your connections</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.user_id}
                      onClick={() => setSelectedUser(conversation.user_id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser === conversation.user_id
                          ? 'bg-amber-100'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Avatar 
                        src={conversation.profile_picture} 
                        fallback={conversation.full_name[0]} 
                        className="h-10 w-10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold truncate">{conversation.full_name}</h4>
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-red-600 text-white">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.last_message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedUser && selectedConversation ? (
              <ChatWindow
                partnerId={selectedUser}
                partnerName={selectedConversation.full_name}
                partnerImage={selectedConversation.profile_picture}
              />
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start chatting</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
