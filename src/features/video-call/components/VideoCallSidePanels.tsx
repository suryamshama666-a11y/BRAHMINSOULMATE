
import React from 'react';
import { VideoCallSettings } from '../VideoCallSettings';
import { VideoCallChat } from '../VideoCallChat';
import { VideoCallParticipants } from '../VideoCallParticipants';
import { ChatMessage, Participant } from '../useVideoCall';

interface VideoCallSidePanelsProps {
  showSettings: boolean;
  showChat: boolean;
  showParticipants: boolean;
  chatMessages: ChatMessage[];
  participants: Participant[];
  onCloseSettings: () => void;
  onCloseChat: () => void;
  onCloseParticipants: () => void;
  onSendMessage: (message: string) => void;
  onChangeBackground: (background: string) => void;
}

export const VideoCallSidePanels = ({
  showSettings,
  showChat,
  showParticipants,
  chatMessages,
  participants,
  onCloseSettings,
  onCloseChat,
  onCloseParticipants,
  onSendMessage,
  onChangeBackground
}: VideoCallSidePanelsProps) => {
  return (
    <>
      {showSettings && (
        <VideoCallSettings
          onClose={onCloseSettings}
          onChangeBackground={onChangeBackground}
        />
      )}

      {showChat && (
        <VideoCallChat
          messages={chatMessages}
          onSendMessage={onSendMessage}
          onClose={onCloseChat}
        />
      )}

      {showParticipants && (
        <VideoCallParticipants
          participants={participants}
          onClose={onCloseParticipants}
        />
      )}
    </>
  );
};
