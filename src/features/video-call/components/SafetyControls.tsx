
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield, Clock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SafetyControlsProps {
  onEmergencyEnd: () => void;
  onReportUser: () => void;
  callDuration: number;
}

export const SafetyControls = ({ onEmergencyEnd, onReportUser, callDuration }: SafetyControlsProps) => {
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [autoEndTimer, setAutoEndTimer] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-20 left-4 z-20">
      <Card className="bg-white/95 backdrop-blur-sm w-72">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <Shield className="h-4 w-4 mr-2 text-green-600" />
            Safety Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Call Duration Warning */}
          {callDuration > 1800 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Call duration: {formatTime(callDuration)}
                </span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Consider taking a break for safety
              </p>
            </div>
          )}

          {/* Recording Consent */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="recording" className="text-sm">Call Recording</Label>
              <p className="text-xs text-gray-600">For safety and quality</p>
            </div>
            <Switch
              id="recording"
              checked={recordingConsent}
              onCheckedChange={setRecordingConsent}
            />
          </div>

          {/* Auto End Timer */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-end" className="text-sm">Auto-end (30 min)</Label>
              <p className="text-xs text-gray-600">Automatic safety cutoff</p>
            </div>
            <Switch
              id="auto-end"
              checked={autoEndTimer}
              onCheckedChange={setAutoEndTimer}
            />
          </div>

          {/* Emergency Controls */}
          <div className="space-y-2 pt-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency End Call
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Emergency End Call</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately end the call and report the session for review. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onEmergencyEnd} className="bg-red-600">
                    End & Report
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onReportUser}
            >
              Report User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
