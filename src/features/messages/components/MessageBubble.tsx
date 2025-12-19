import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Download, Play, Pause } from 'lucide-react';
import { Message } from '@/features/messages/hooks/useMessages';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  searchQuery?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, searchQuery }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Format the message timestamp
  const formattedTime = message.created_at
    ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
    : '';

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
    switch (message.message_type) {
      case 'image':
        return (
          <div className="mt-1 rounded-md overflow-hidden">
            <img 
              src={message.media_url || ''} 
              alt={message.content} 
              className="max-w-full max-h-60 object-contain rounded-md"
              loading="lazy"
            />
          </div>
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
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`relative max-w-[80%] md:max-w-[70%] px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-amber-50 text-gray-800 border border-amber-200'
            : 'bg-white bg-opacity-90 backdrop-blur-sm border border-orange-100 text-gray-800 shadow-sm'
        }`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'}>
            <DropdownMenuItem onClick={copyToClipboard}>Copy</DropdownMenuItem>
            {message.media_url && (
              <DropdownMenuItem onClick={handleDownload}>Download</DropdownMenuItem>
            )}
            {isOwnMessage && <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>

        {renderMessageContent()}

        <div
          className={`flex items-center text-xs mt-1 ${
            isOwnMessage ? 'text-gray-600' : 'text-gray-500'
          }`}
        >
          <span>{formattedTime}</span>
          {isOwnMessage && (
            <span className="ml-1">
              {message.status === 'read' ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
