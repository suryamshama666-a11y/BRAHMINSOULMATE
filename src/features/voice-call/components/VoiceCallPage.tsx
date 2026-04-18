import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllProfiles } from '@/data/profiles';
import { VoiceCallControls } from './VoiceCallControls';
import { VoiceCallHeader } from './VoiceCallHeader';
import { VoiceCallMainArea } from './VoiceCallMainArea';
import { MatrimonialProfileOverlay } from '../../video-call/components/MatrimonialProfileOverlay';
import { SafetyControls } from '../../video-call/components/SafetyControls';
import { PostCallFeedback } from '../../video-call/components/PostCallFeedback';
import { useVoiceCall } from '../useVoiceCall';
import { toast } from 'sonner';

export default function VoiceCallPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profiles = getAllProfiles();
  
  const profile = profiles.find(p => 
    p.id === id || 
    p.userId === id ||
    (p.id && p.id.toString() === id) ||
    (p.userId && p.userId.toString() === id)
  );
  
  const {
    callState,
    audioEnabled,
    callDuration,
    connectionQuality,
    participants,
    chatMessages,
    meetingUrl,
    toggleAudio,
    endCall,
    sendChatMessage,
    recordingEnabled,
    toggleRecording
  } = useVoiceCall(id!, profile);

  const [showProfileOverlay, setShowProfileOverlay] = useState(false);
  const [showSafetyControls, setShowSafetyControls] = useState(false);
  const [showPostCallFeedback, setShowPostCallFeedback] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Auto-show profile overlay briefly at start
  useEffect(() => {
    if (callState === 'connected' && profile) {
      setShowProfileOverlay(true);
      const timer = setTimeout(() => setShowProfileOverlay(false), 4000);
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

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="flex-grow flex flex-col relative">
          {/* Main Voice Call Area */}
          <div className="flex-grow relative overflow-hidden">
            <VoiceCallHeader
              connectionQuality={connectionQuality}
              callDuration={callDuration}
              showChat={showChat}
              onToggleChat={() => setShowChat(!showChat)}
              onEndCall={handleEndCall}
              recordingEnabled={recordingEnabled}
            />

            <VoiceCallMainArea
              callState={callState}
              audioEnabled={audioEnabled}
              profile={profile}
              recordingEnabled={recordingEnabled}
              meetingUrl={meetingUrl}
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

            {/* Mobile Controls Overlay */}
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 md:hidden">
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
                  onClick={() => setShowSafetyControls(!showSafetyControls)}
                >
                  Safety
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-black/50 text-white border-white/20"
                  onClick={toggleRecording}
                >
                  {recordingEnabled ? 'Stop Recording' : 'Record'}
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <VoiceCallControls
            audioEnabled={audioEnabled}
            recordingEnabled={recordingEnabled}
            onToggleAudio={toggleAudio}
            onToggleRecording={toggleRecording}
            onEndCall={handleEndCall}
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
