
import React from 'react';

interface TypingIndicatorProps {
  typingUsers: string[];
  profiles: any[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  profiles
}) => {
  if (typingUsers.length === 0) return null;

  const getTypingNames = () => {
    const names = typingUsers.map(userId => {
      const profile = profiles.find(p => p.user_id === userId);
      return profile ? profile.first_name : 'Someone';
    });

    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else {
      return `${names[0]} and ${names.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 italic">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {getTypingNames()}
    </div>
  );
};
