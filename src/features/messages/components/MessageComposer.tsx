import React, { useState } from 'react';
import { useMessages, MessageType } from '../hooks/useMessages';
import { ChatInput } from './ChatInput';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MessageComposerProps {
  conversationId: string;
  receiverId: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  conversationId,
  receiverId,
}) => {
  const { user } = useAuth();
  const { sendMessage, isLoading, uploadMedia } = useMessages(conversationId);
  const [isRecording, setIsRecording] = useState(false);
  const [_recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Handle sending text messages
  const handleSendMessage = async (text: string): Promise<void> => {
    if (!text.trim() || !user) return Promise.resolve();
    
    return new Promise<void>((resolve, reject) => {
      sendMessage({
        content: text,
        receiver_id: receiverId,
        message_type: 'text',
      }, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error)
      });
    });
  };

  // Handle file upload
  const handleFileUpload = async (file: File): Promise<void> => {
    if (!user) return Promise.resolve();
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return Promise.resolve();
    }

    try {
      // Determine message type based on file mime type
      let messageType: MessageType = 'file';
      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
      } else if (file.type.startsWith('audio/')) {
        messageType = 'audio';
      }

      // Upload the file and send the message
      const mediaUrl = await uploadMedia(file);
      
      return new Promise<void>((resolve, reject) => {
        sendMessage({
          content: file.name,
          receiver_id: receiverId,
          message_type: messageType,
          media_url: mediaUrl,
        }, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error)
        });
      });
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Error uploading file:', error);
      return Promise.reject(error);
    }
  };

  // Start voice recording
  const _startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      setAudioChunks([]);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      recorder.addEventListener('dataavailable', (event) => {
        setAudioChunks(prev => [...prev, event.data]);
      });
      
      recorder.addEventListener('stop', () => {
        clearInterval(timer);
        stream.getTracks().forEach(track => track.stop());
      });
      
      recorder.start(1000);
      setMediaRecorder(recorder);
    } catch (error) {
      toast.error('Failed to access microphone');
      console.error('Error accessing microphone:', error);
    }
  };

  // Stop voice recording and send the audio message
  const _stopRecording = async () => {
    if (!mediaRecorder || !isRecording) return;
    
    mediaRecorder.stop();
    setIsRecording(false);
    
    // Create audio blob and file
    setTimeout(async () => {
      try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
        
        // Upload audio and send message
        await handleFileUpload(audioFile);
      } catch (error) {
        toast.error('Failed to process voice message');
        console.error('Error processing voice message:', error);
      }
    }, 500);
  };

  // Format recording time as MM:SS
  const _formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <ChatInput
      onSendMessage={handleSendMessage}
      onUploadFile={handleFileUpload}
      onSendVoiceMessage={async (blob) => {
        const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' });
        return handleFileUpload(file);
      }}
      isRecording={isRecording}
      setIsRecording={setIsRecording}
      disabled={isLoading}
    />
  );
}; 