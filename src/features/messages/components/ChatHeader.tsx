import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, MoreVertical, Phone, Video, Flag, UserX, Star, StarOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConversations } from '../hooks/useConversations';

interface ChatHeaderProps {
  receiverId: string;
  onBack?: () => void;
  onPhoneCall?: () => void;
  onVideoCall?: () => void;
}

// Extended user profile interface
interface ReceiverProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  location: string;
  profile_image: string;
  verified?: boolean;
  last_active?: string;
  online?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  receiverId, 
  onBack, 
  onPhoneCall,
  onVideoCall 
}) => {
  useAuth();
  const { 
    blockUser, 
    unblockUser, 
    toggleShortlist, 
    reportUser, 
    conversations 
  } = useConversations();
  
  // Find the conversation with this receiver
  const conversation = conversations.find(c => c.partner_id === receiverId);
  
  // Get the receiver's profile from the conversation
  const receiverProfile = conversation?.partner_profile as ReceiverProfile | undefined;
  
  // In a real implementation, these would be stored in the database
  // For now, we'll just use dummy values
  const isBlocked = false;
  const isShortlisted = false;

  // Generate a fallback avatar letter safely
  const getAvatarFallback = () => {
    if (receiverProfile?.name && typeof receiverProfile.name === 'string' && receiverProfile.name.length > 0) {
      return receiverProfile.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleBlock = () => {
    if (isBlocked) {
      unblockUser(receiverId);
    } else {
      blockUser(receiverId);
    }
  };

  const handleShortlist = () => {
    toggleShortlist(receiverId);
  };

  const handleReport = () => {
    reportUser({ 
      partnerId: receiverId, 
      reason: 'Inappropriate behavior' 
    });
  };

  return (
    <div className="flex items-center justify-between p-3 border-b bg-white shadow-sm" role="region" aria-label="Chat header">
      <div className="flex items-center space-x-3">
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="md:hidden" 
            aria-label="Back to conversation list"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar 
          src={receiverProfile?.profile_image}
          alt={receiverProfile?.name || 'User'}
          fallback={getAvatarFallback()}
          className="h-10 w-10"
        />
        <div>
          <div className="flex items-center">
            <h2 className="text-xs font-medium text-gray-900">{receiverProfile?.name || 'User'}</h2>
            {receiverProfile?.verified && (
              <span 
                className="ml-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full" 
                title="Verified Profile"
                aria-label="Verified user"
              >
                ✓
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500" aria-live="polite">
            {receiverProfile?.last_active 
              ? `Last active ${new Date(receiverProfile.last_active).toLocaleString()}` 
              : 'Offline'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onPhoneCall}
          aria-label="Voice call"
          title="Voice call"
        >
          <Phone className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onVideoCall}
          aria-label="Video call"
          title="Video call"
        >
          <Video className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              aria-label="More options"
              title="More options"
            >
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
  );
};