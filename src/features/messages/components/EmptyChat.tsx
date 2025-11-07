
import React from 'react';

export const EmptyChat = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50">
      <div className="text-center p-8">
        <h3 className="text-xl font-serif font-semibold mb-2">Select a conversation</h3>
        <p className="text-muted-foreground">
          Choose a conversation from the list to start chatting
        </p>
      </div>
    </div>
  );
};
