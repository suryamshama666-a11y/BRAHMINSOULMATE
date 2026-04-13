
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllProfiles } from '@/data/profiles';
import Navbar from '@/components/Navbar';
import { VideoCallControls } from '../VideoCallControls';
import { VideoCallHeader } from './VideoCallHeader';
import { VideoCallMainArea } from './VideoCallMainArea';
import { VideoCallSelfView } from './VideoCallSelfView';
import { VideoCallSidePanels } from './VideoCallSidePanels';
import { MatrimonialProfileOverlay } from './MatrimonialProfileOverlay';
import { SafetyControls } from './SafetyControls';
import { PostCallFeedback } from './PostCallFeedback';
import { MatrimonialBackgrounds } from './MatrimonialBackgrounds';
import { useVideoCall } from '../useVideoCall';
import { toast } from 'sonner';

export default function VideoCallPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profiles = getAllProfiles();
  
  // Enhanced profile lookup to check both id and userId fields
  const profile = profiles.find(p => 
    p.id === id || 
    p.userId === id ||
    (p.id && p.id.toString() === id) ||
    (p.userId && p.userId.toString() === id)
  );
  
  const {
    callState,
    audioEnabled,
    videoEnabled,
    callDuration,
    connectionQuality,
    isScreenSharing,
    participants,
    chatMessages,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    endCall,
    sendChatMessage,
    changeBackground
  } = useVideoCall(id!, profile);

  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showProfileOverlay, setShowProfileOverlay] = useState(false);
  const [showSafetyControls, setShowSafetyControls] = useState(false);
  const [showPostCallFeedback, setShowPostCallFeedback] = useState(false);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [_callEnded, setCallEnded] = useState(false);

  // Auto-show profile overlay briefly at start
  useEffect(() => {
    if (callState === 'connected' && profile) {
      setShowProfileOverlay(true);
      const timer = setTimeout(() => setShowProfileOverlay(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [callState, profile]);

  // Show safety controls for longer calls
  useEffect(() => {
    if (callDuration > 900) { // 15 minutes
      setShowSafetyControls(true);
    }
  }, [callDuration]);

  const handleEndCall = () => {
    endCall();
    setCallEnded(true);
    setShowPostCallFeedback(true);
  };

  const handleEmergencyEnd = () => {
    toast.error('Emergency call end - Session reported for review');
    endCall();
    navigate(-1);
  };

  const handleReportUser = () => {
    toast.success('User reported. Thank you for helping keep our community safe.');
  };

  const handleProfileInterest = () => {
    toast.success(`Interest sent to ${profile?.name}!`);
    setShowProfileOverlay(false);
  };

  const handleProfileMessage = () => {
    navigate(`/messages?partner=${profile?.userId || profile?.id}`);
  };

  const handlePostCallFeedbackClose = () => {
    setShowPostCallFeedback(false);
    navigate(-1);
  };

  const handleBackgroundSelect = (background: string) => {
    changeBackground(background);
    setShowBackgrounds(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto py-8 flex-grow">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">User not found</p>
              <Button 
                className="mt-4 mx-auto block" 
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-900">
        <Navbar />
        <div className="flex-grow flex flex-col relative">
          {/* Main Video Area */}
          <div className="flex-grow relative bg-black overflow-hidden">
            <VideoCallHeader
              connectionQuality={connectionQuality}
              callDuration={callDuration}
              showParticipants={showParticipants}
              showChat={showChat}
              showSettings={showSettings}
              onToggleParticipants={() => setShowParticipants(!showParticipants)}
              onToggleChat={() => setShowChat(!showChat)}
              onToggleSettings={() => setShowSettings(!showSettings)}
              onEndCall={handleEndCall}
            />

            <VideoCallMainArea
              callState={callState}
              videoEnabled={videoEnabled}
              profile={profile}
              meetingUrl={meetingUrl}
            />

            <VideoCallSelfView
              videoEnabled={videoEnabled}
              audioEnabled={audioEnabled}
            />

            {/* Matrimonial Profile Overlay */}
            <MatrimonialProfileOverlay
              profile={profile}
              isVisible={showProfileOverlay}
              onClose={() => setShowProfileOverlay(false)}
              onInterest={handleProfileInterest}
              onMessage={handleProfileMessage}
            />

            {/* Safety Controls */}
            {showSafetyControls && (
              <SafetyControls
                onEmergencyEnd={handleEmergencyEnd}
                onReportUser={handleReportUser}
                callDuration={callDuration}
              />
            )}

            {/* Matrimonial Backgrounds */}
            <MatrimonialBackgrounds
              isOpen={showBackgrounds}
              onClose={() => setShowBackgrounds(false)}
              onSelectBackground={handleBackgroundSelect}
            />

            {/* Mobile Controls Overlay */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 md:hidden">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-black/50 text-white border-white/20"
                  onClick={() => setShowProfileOverlay(!showProfileOverlay)}
                >
                  Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-black/50 text-white border-white/20"
                  onClick={() => setShowBackgrounds(!showBackgrounds)}
                >
                  Background
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-black/50 text-white border-white/20"
                  onClick={() => setShowSafetyControls(!showSafetyControls)}
                >
                  Safety
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <VideoCallControls
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            isScreenSharing={isScreenSharing}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
            onEndCall={handleEndCall}
          />

          {/* Side Panels */}
          <VideoCallSidePanels
            showSettings={showSettings}
            showChat={showChat}
            showParticipants={showParticipants}
            chatMessages={chatMessages}
            participants={participants}
            onCloseSettings={() => setShowSettings(false)}
            onCloseChat={() => setShowChat(false)}
            onCloseParticipants={() => setShowParticipants(false)}
            onSendMessage={sendChatMessage}
            onChangeBackground={handleBackgroundSelect}
          />
        </div>
      </div>

      {/* Post Call Feedback Modal */}
      <PostCallFeedback
        isOpen={showPostCallFeedback}
        onClose={handlePostCallFeedbackClose}
        profile={profile}
        callDuration={callDuration}
      />
    </>
  );
}
