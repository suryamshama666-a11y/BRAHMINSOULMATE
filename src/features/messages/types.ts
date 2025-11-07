
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  message_type?: 'text' | 'image' | 'video' | 'audio';
  media_url?: string;
}

// Transform function to convert RealTimeMessage to Message
export const transformRealTimeMessage = (rtMessage: any): Message => {
  return {
    id: rtMessage.id,
    senderId: rtMessage.sender_id,
    receiverId: rtMessage.receiver_id,
    content: rtMessage.content,
    timestamp: new Date(rtMessage.created_at),
    read: !!rtMessage.read_at,
    message_type: rtMessage.message_type,
    media_url: rtMessage.media_url,
  };
};

// Format message time for display
export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  
  // If the message is from today, show time
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If the message is from yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // If the message is from this week
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (messageDate > weekAgo) {
    return messageDate.toLocaleDateString([], { weekday: 'short' });
  }
  
  // For older messages, show date
  return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
