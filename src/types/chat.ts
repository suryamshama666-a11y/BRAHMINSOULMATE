/**
 * Messaging and Chat related types
 */
import { UserProfile } from './user';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  media_url?: string | null;
  created_at: string;
  read_at?: string | null;
  status?: 'sent' | 'delivered' | 'read';
}

export interface MessageReaction {
  id: string;
  emoji: string;
  count: number;
  users?: string[];
}

export interface MessageWithReactions extends Message {
  reactions?: MessageReaction[];
  updated_at?: string;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  user_ids: string[];
  hasUserReacted?: boolean;
}

export interface EnhancedMessage extends Message {
  reactions?: Record<string, ReactionSummary>;
  is_own?: boolean;
}

export interface Conversation {
  id: string;
  // Legacy schema
  user1_id?: string;
  user2_id?: string;
  // New schema
  user_id?: string;
  partner_id?: string;
  partner_name?: string;
  partner_avatar?: string | null;
  // Common fields
  last_message_id?: string;
  last_message_content?: string;
  last_message?: string | null;
  last_message_time?: string;
  last_message_at?: string | null;
  unread_count?: number;
  totalUnread?: number;
  created_at: string;
  updated_at?: string;
  partner_profile?: UserProfile;
}

export interface ChatContextType {
  conversations: Conversation[];
  contacts: {
    id: string;
    name: string;
    profile_image?: string;
    status: 'online' | 'offline';
  }[];
  isLoading: boolean;
  isLoadingContacts: boolean;
  error: Error | null;
  totalUnread: number;
  refreshConversations: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  getOrCreateConversation: (partnerId: string) => Promise<Conversation>;
}
