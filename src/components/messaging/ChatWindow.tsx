import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Send, Phone, Video, MoreVertical, Image, FileText, Star, StarOff, UserX, Flag, X, Mic } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { messagesService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showPhoneCall, setShowPhoneCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Fetch conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['conversation', partnerId],
    queryFn: async () => {
      return await messagesService.getConversation(partnerId);
    },
    refetchInterval: 3000
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size exceeds 10MB limit');
      return;
    }
    
    toast.success(`Image "${file.name}" selected for upload`);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Document size exceeds 10MB limit');
      return;
    }
    
    toast.success(`Document "${file.name}" selected for upload`);
    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  const handlePhoneCall = () => {
    setShowPhoneCall(true);
    toast.info(`Starting voice call with ${partnerName}...`);
  };

  const handleVideoCall = () => {
    setShowVideoCall(true);
    toast.info(`Starting video call with ${partnerName}...`);
  };

  const handleShortlist = () => {
    setIsShortlisted(!isShortlisted);
    toast.success(isShortlisted ? 'Removed from shortlist' : 'Added to shortlist');
  };

  const handleBlock = () => {
    setIsBlocked(!isBlocked);
    toast.success(isBlocked ? 'User unblocked' : 'User blocked');
  };

  const handleReport = () => {
    toast.success('Report submitted. We will review this profile.');
  };

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Phone Call Modal */}
      {showPhoneCall && (
        <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center rounded-lg">
          <Avatar src={partnerImage} fallback={partnerName[0]} className="h-24 w-24 mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">{partnerName}</h3>
          <p className="text-gray-300 mb-6">Calling...</p>
          <Button 
            variant="destructive" 
            className="rounded-full h-14 w-14"
            onClick={() => setShowPhoneCall(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Video Call Modal */}
      {showVideoCall && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center rounded-lg">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">Your camera</span>
            </div>
            <div className="text-center">
              <Avatar src={partnerImage} fallback={partnerName[0]} className="h-24 w-24 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">{partnerName}</h3>
              <p className="text-gray-300 mb-6">Connecting video...</p>
            </div>
            <div className="absolute bottom-8 flex gap-4">
              <Button variant="ghost" className="rounded-full h-14 w-14 bg-gray-700 text-white hover:bg-gray-600">
                <Mic className="h-6 w-6" />
              </Button>
              <Button 
                variant="destructive" 
                className="rounded-full h-14 w-14"
                onClick={() => setShowVideoCall(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              <Button variant="ghost" className="rounded-full h-14 w-14 bg-gray-700 text-white hover:bg-gray-600">
                <Video className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      )}

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
          <Button variant="ghost" size="icon" onClick={handlePhoneCall} title="Voice call">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleVideoCall} title="Video call">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="More options">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShortlist}>
                {isShortlisted ? (
                  <>
                    <StarOff className="h-4 w-4 mr-2" />
                    <span>Remove from Shortlist</span>
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    <span>Add to Shortlist</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBlock}>
                <UserX className="h-4 w-4 mr-2" />
                <span>{isBlocked ? 'Unblock User' : 'Block User'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                <span>Report User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <div className="flex gap-2 items-center">
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
          <input
            type="file"
            ref={documentInputRef}
            onChange={handleDocumentUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => imageInputRef.current?.click()}
            title="Upload image"
            className="text-[#FF4500] hover:text-[#FF4500] hover:bg-[#FF4500]/10"
          >
            <Image className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => documentInputRef.current?.click()}
            title="Upload document"
            className="text-[#FF4500] hover:text-[#FF4500] hover:bg-[#FF4500]/10"
          >
            <FileText className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={sendMessageMutation.isPending || !newMessage.trim()}
            className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};