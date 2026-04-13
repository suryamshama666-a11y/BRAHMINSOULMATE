
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import type { ReactionSummary } from '@/types/index';
import { Smile, Plus } from 'lucide-react';

interface MessageReactionsProps {
  messageId: string;
  reactions: ReactionSummary[];
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions
}) => {
  const { addReaction, removeReaction } = useMessageReactions();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReactionClick = async (emoji: string, hasUserReacted: boolean) => {
    if (hasUserReacted) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    await addReaction(messageId, emoji);
    setShowEmojiPicker(false);
  };

  if (reactions.length === 0) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Smile className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              {COMMON_EMOJIS.map(emoji => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {reactions.map(reaction => (
        <Button
          key={reaction.emoji}
          variant={reaction.hasUserReacted ? "secondary" : "outline"}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => handleReactionClick(reaction.emoji, reaction.hasUserReacted || false)}
        >
          {reaction.emoji} {reaction.count}
        </Button>
      ))}
      
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-4 gap-1">
            {COMMON_EMOJIS.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
