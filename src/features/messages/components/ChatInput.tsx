import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Mic, Send, X } from 'lucide-react';
import { toast } from 'sonner';

export interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
  onSendVoiceMessage?: (blob: Blob) => Promise<void>;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onUploadFile,
  onSendVoiceMessage,
  isRecording,
  setIsRecording,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    onUploadFile(file).catch(err => {
      console.error('Error uploading file:', err);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle sending text message
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSendMessage(trimmedMessage).catch(err => {
      console.error('Error sending message:', err);
    });
    setMessage('');
  };

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Set up voice recording
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

        recorder.onstop = () => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          if (audioBlob.size > 0 && onSendVoiceMessage) {
            onSendVoiceMessage(audioBlob).catch(err => {
              console.error('Error sending voice message:', err);
            });
          }
        };

        setMediaRecorder(recorder);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast.error('Could not access microphone');
      }
    };

    setupRecording();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [onSendVoiceMessage]);

  // Handle starting/stopping voice recording
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

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="border-t p-3 bg-white">
      {isRecording ? (
        <div className="flex items-center justify-between p-2 bg-red-50 rounded-md mb-2">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
            <span>Recording... {formatTime(recordingTime)}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRecording}
            aria-label="Cancel recording"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[60px] resize-none"
              disabled={disabled}
            />
          </div>

          <div className="flex space-x-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,audio/*,application/pdf"
              disabled={disabled}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              aria-label="Attach file"
              className="text-[#FF4500] hover:text-[#FF4500] hover:bg-[#FF4500]/10 focus:outline-none"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRecording}
              disabled={disabled || !mediaRecorder}
              aria-label="Record voice message"
              className="text-[#FF4500] hover:text-[#FF4500] hover:bg-[#FF4500]/10 focus:outline-none"
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              onClick={handleSendMessage}
              disabled={disabled || !message.trim()}
              aria-label="Send message"
              className={`rounded-full focus:outline-none transition-all ${
                message.trim() && !disabled
                  ? 'bg-[#FF4500] hover:bg-[#FF4500]/90 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="h-5 w-5 mr-1" />
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
