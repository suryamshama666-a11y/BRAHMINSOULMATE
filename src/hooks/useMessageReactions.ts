// Stub for useMessageReactions hook
import type { ReactionSummary } from '@/types/index';

export const useMessageReactions = () => {
  const reactions: Record<string, ReactionSummary[]> = {};
  
  const addReaction = async (messageId: string, emoji: string) => {
    console.log('Adding reaction:', messageId, emoji);
  };
  
  const removeReaction = async (messageId: string, emoji: string) => {
    console.log('Removing reaction:', messageId, emoji);
  };
  
  return {
    reactions,
    addReaction,
    removeReaction,
  };
};

export type { ReactionSummary };
