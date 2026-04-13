import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip, Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from './MessageBubble';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ChatBoxProps {
  conversationId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  onBack: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  conversationId,
  partnerId,
  partnerName,
  partnerAvatar,
  onBack,
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    uploadMedia,
  } = useMessages(conversationId);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && partnerId) {
      const unreadMessages = messages.filter(
        (msg) => !msg.read_at && msg.sender_id === partnerId
      );
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg) => msg.id).join(',');
        markAsRead(messageIds);
      }
    }
  }, [messages, partnerId, markAsRead]);

  useEffect(() => {
    const setupRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);

        recorder.onstart = () => {
          audioChunks.current = [];
          setRecordingTime(0);
          timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
          }, 1000);
        };

        recorder.ondataavailable = (e) => {
          audioChunks.current.push(e.data);
        };

        recorder.onstop = async () => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          if (audioBlob.size > 0) {
            try {
              const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
              const mediaUrl = await uploadMedia(audioFile);
              sendMessage({
                content: 'Voice message',
                receiver_id: partnerId,
                message_type: 'audio',
                media_url: mediaUrl,
              });
            } catch {
              toast.error('Failed to send voice message');
            }
          }
        };

        setMediaRecorder(recorder);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };

    setupRecording();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [partnerId, sendMessage, uploadMedia]);

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !user) return;

    sendMessage({
      content: trimmedMessage,
      receiver_id: partnerId,
      message_type: 'text',
    });
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    try {
      let messageType: 'image' | 'video' | 'audio' | 'file' = 'file';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('video/')) messageType = 'video';
      else if (file.type.startsWith('audio/')) messageType = 'audio';

      const mediaUrl = await uploadMedia(file);
      sendMessage({
        content: file.name,
        receiver_id: partnerId,
        message_type: messageType,
        media_url: mediaUrl,
      });
    } catch {
      toast.error('Failed to upload file');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleRecording = () => {
    if (!mediaRecorder) return;

    if (isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20 md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="relative">
            {partnerAvatar ? (
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="h-10 w-10 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold text-lg">
                {partnerName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h2 className="font-semibold text-lg">{partnerName}</h2>
            <p className="text-xs text-white/80">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-orange-50 to-amber-50">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="h-8 w-8 border-4 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center mb-4">
              <Send className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Start a Conversation</h3>
            <p className="text-gray-500 max-w-xs">
              Say hello to {partnerName} and begin your journey together!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.sender_id === user.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 bg-white">
        {isRecording ? (
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-red-600 font-medium">Recording... {formatTime(recordingTime)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  mediaRecorder?.stop();
                  setIsRecording(false);
                }}
                className="text-green-600 hover:bg-green-50"
              >
                <Send className="h-4 w-4 mr-1" /> Send
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setIsRecording(false);
                  audioChunks.current = [];
                }}
                className="text-red-600 hover:bg-red-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,audio/*,application/pdf"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <Textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[48px] max-h-[120px] resize-none border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                rows={1}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRecording}
              disabled={!mediaRecorder}
              className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className={`rounded-full px-5 ${
                message.trim()
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
