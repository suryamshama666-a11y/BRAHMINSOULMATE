
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, X } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoiceMessage,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Unable to access microphone');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    setRecordingTime(0);
  }, [isRecording, stopRecording]);

  const sendVoiceMessage = useCallback(() => {
    if (audioBlob) {
      onSendVoiceMessage(audioBlob, recordingTime);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  }, [audioBlob, recordingTime, onSendVoiceMessage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob) {
    return (
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
        <audio controls className="flex-1">
          <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
        </audio>
        <span className="text-sm text-gray-600">{formatTime(recordingTime)}</span>
        <Button size="sm" onClick={sendVoiceMessage} className="bg-green-500 hover:bg-green-600">
          <Send className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={cancelRecording}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-red-100 rounded-lg p-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-600">Recording...</span>
          <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
        </div>
        <Button size="sm" onClick={stopRecording} className="bg-red-500 hover:bg-red-600">
          <MicOff className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={cancelRecording}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={startRecording}
      disabled={disabled}
      className="h-8 w-8 p-0"
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
};
