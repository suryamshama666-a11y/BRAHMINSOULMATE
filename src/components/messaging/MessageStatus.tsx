
import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({ status, timestamp }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <Check className="h-3 w-3 text-gray-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
      <span>{formatTime(timestamp)}</span>
      {getStatusIcon()}
    </div>
  );
};
