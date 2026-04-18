import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Check, CheckCheck, Download, Play, Pause, SmilePlus, Maximize2, X, MoreVertical, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Message, MessageReaction } from '@/features/messages/hooks/useMessages';
import { MessageReaction as ChatMessageReaction } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';

interface MessageBubbleProps {
  message: Message & { reactions?: MessageReaction[]; updated_at?: string | null };
  isOwnMessage: boolean;
  reactions?: MessageReaction[];
  searchQuery?: string;
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  currentUserId?: string;
}

// Helper to convert between MessageReaction types
const convertReactions = (reactions: MessageReaction[] | undefined): MessageReaction[] => {
  if (!reactions) return [];
  return reactions;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwnMessage, 
  searchQuery,
  onAddReaction,
  onRemoveReaction,
  onEdit,
  onDelete,
  currentUserId
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const REACTION_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  // Format the message timestamp
  const formattedTime = message.created_at
    ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
    : '';
  
  const fullTimestamp = message.created_at 
    ? format(new Date(message.created_at), 'PPP p')
    : '';

  const isEdited = !!(message as any).updated_at;

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  // Group reactions by emoji
  const reactionGroups = (message.reactions || []).reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || []);
    acc[curr.emoji].push(curr.user_id);
    return acc;
  }, {} as Record<string, string[]>);

  // Handle audio playback
  const toggleAudio = () => {
    if (!message.media_url) return;

    if (!audioElement) {
      const audio = new Audio(message.media_url);
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);
      setAudioElement(audio);
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        toast.error('Failed to play audio');
      });
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play().catch(err => {
          console.error('Error playing audio:', err);
          toast.error('Failed to play audio');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle file download
  const handleDownload = () => {
    if (!message.media_url) return;
    
    const link = document.createElement('a');
    link.href = message.media_url;
    link.download = message.content || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy message to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
  };

  // Determine message content based on type
  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="text-sm min-h-[60px] focus:ring-orange-400"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleEdit} className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white">
              Save
            </Button>
          </div>
        </div>
      );
    }

    switch (message.message_type) {
      case 'image':
        return (
          <>
            <div className="mt-1 rounded-md overflow-hidden relative group/img">
              <img 
                src={message.media_url || ''} 
                alt={message.content} 
                className="max-w-full max-h-60 object-contain rounded-md cursor-pointer transition-transform hover:scale-[1.02]"
                loading="lazy"
                onClick={() => setIsZoomed(true)}
              />
              <button 
                onClick={() => setIsZoomed(true)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {isZoomed && (
              <div 
                className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
                onClick={() => setIsZoomed(false)}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                  onClick={() => setIsZoomed(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
                <img 
                  src={message.media_url || ''} 
                  alt={message.content} 
                  className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-300"
                />
              </div>
            )}
          </>
        );
      
      case 'video':
        return (
          <div className="mt-1 rounded-md overflow-hidden">
            <video 
              src={message.media_url || ''} 
              controls 
              className="max-w-full max-h-60 rounded-md"
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center mt-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleAudio}
              className="h-8 w-8 rounded-full bg-gray-100"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="ml-2 text-sm text-gray-600">Voice message</div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDownload}
              className="h-6 w-6 ml-auto"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center mt-1 p-2 bg-gray-100 rounded-md">
            <div className="flex-1">
              <div className="text-sm font-medium truncate">{message.content}</div>
              <div className="text-xs text-gray-500">File</div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDownload}
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      
    default:
        if (searchQuery && typeof message.content === 'string') {
          const parts = message.content.split(new RegExp(`(${searchQuery})`, 'gi'));
          return (
            <div className="whitespace-pre-wrap break-words">
              {parts.map((part, i) => (
                part.toLowerCase() === searchQuery.toLowerCase() ? (
                  <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5">{part}</mark>
                ) : (
                  <span key={i}>{part}</span>
                )
              ))}
            </div>
          );
        }
        return <div className="whitespace-pre-wrap break-words">{message.content}</div>;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div
        className={`relative max-w-[80%] md:max-w-[70%] px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-amber-50 text-gray-800 border border-amber-200'
            : 'bg-white bg-opacity-90 backdrop-blur-sm border border-orange-100 text-gray-800 shadow-sm'
        }`}
      >
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 hover:bg-black/5"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'}>
              <DropdownMenuItem onClick={copyToClipboard}>
                Copy
              </DropdownMenuItem>
              {message.message_type === 'text' && isOwnMessage && (
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {message.media_url && (
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-3 w-3 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              {isOwnMessage && (
                <DropdownMenuItem 
                  className="text-red-600" 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this message?')) {
                      onDelete?.();
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {renderMessageContent()}

          <div
            className={`flex items-center text-[10px] mt-1 ${
              isOwnMessage ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            <span title={fullTimestamp}>{formattedTime}</span>
            {isEdited && <span className="ml-1 flex items-center"><CheckCircle2 className="h-2 w-2 mr-0.5" />Edited</span>}
            {isOwnMessage && (
              <span className="ml-1">
                {message.status === 'read' ? (
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </span>
            )}
          </div>

          {/* Reactions display */}
          {Object.keys(reactionGroups).length > 0 && (
            <div className={`absolute -bottom-3 ${isOwnMessage ? 'right-0' : 'left-0'} flex flex-wrap gap-0.5 z-10`}>
              {Object.entries(reactionGroups).map(([emoji, userIds]) => {
                const hasReacted = currentUserId && userIds.includes(currentUserId);
                return (
                  <button
                    key={emoji}
                    onClick={() => hasReacted ? onRemoveReaction?.(emoji) : onAddReaction?.(emoji)}
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[10px] transition-all
                      ${hasReacted 
                        ? 'bg-orange-100 border-orange-300 scale-110' 
                        : 'bg-white border-gray-200 hover:border-gray-300'}`}
                  >
                    <span>{emoji}</span>
                    {userIds.length > 1 && <span>{userIds.length}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Reaction picker trigger */}
          {!isOwnMessage && (
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-orange-100 text-gray-400 hover:text-orange-500">
                    <SmilePlus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="right" className="w-auto p-1 rounded-full shadow-lg border-gray-100">
                  <div className="flex gap-1">
                    {REACTION_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => onAddReaction?.(emoji)}
                        className="p-1 hover:bg-orange-50 rounded-full transition-transform hover:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
    );
};
