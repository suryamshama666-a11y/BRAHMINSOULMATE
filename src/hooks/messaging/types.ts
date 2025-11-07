
export interface RealTimeMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio';
  media_url?: string;
  read_at?: string;
  created_at: string;
}

export interface Conversation {
  partner_id: string;
  partner_profile: any;
  last_message: RealTimeMessage;
  unread_count: number;
}
