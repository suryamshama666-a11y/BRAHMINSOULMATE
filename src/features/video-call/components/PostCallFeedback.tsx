
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Heart, MessageCircle } from 'lucide-react';
import { Profile } from '@/data/profiles';
import { toast } from 'sonner';

interface PostCallFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  callDuration: number;
}

export const PostCallFeedback = ({ isOpen, onClose, profile, callDuration }: PostCallFeedbackProps) => {
  const [rating, setRating] = useState<string>('');
  const [wouldMeetAgain, setWouldMeetAgain] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [interestedInProfile, setInterestedInProfile] = useState(false);

  const handleSubmit = () => {
    // Here you would typically send the feedback to your backend
    toast.success('Thank you for your feedback!');
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Call Feedback</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Call Summary */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Call with {profile.name} • {formatDuration(callDuration)}
            </p>
          </div>

          {/* Overall Rating */}
          <div className="space-y-3">
            <Label>How was your call experience?</Label>
            <RadioGroup value={rating} onValueChange={setRating}>
              {[
                { value: '5', label: 'Excellent', icon: '😊' },
                { value: '4', label: 'Good', icon: '🙂' },
                { value: '3', label: 'Average', icon: '😐' },
                { value: '2', label: 'Poor', icon: '🙁' },
                { value: '1', label: 'Very Poor', icon: '😞' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex items-center space-x-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Connection Quality */}
          <div className="space-y-3">
            <Label>Connection Quality</Label>
            <RadioGroup value={connectionQuality} onValueChange={setConnectionQuality}>
              {[
                { value: 'excellent', label: 'Excellent' },
                { value: 'good', label: 'Good' },
                { value: 'fair', label: 'Fair' },
                { value: 'poor', label: 'Poor' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`quality-${option.value}`} />
                  <Label htmlFor={`quality-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Interest Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="meet-again"
                checked={wouldMeetAgain}
                onCheckedChange={(checked) => setWouldMeetAgain(checked as boolean)}
              />
              <Label htmlFor="meet-again">I would like to meet {profile.name} again</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="interested"
                checked={interestedInProfile}
                onCheckedChange={(checked) => setInterestedInProfile(checked as boolean)}
              />
              <Label htmlFor="interested">I'm interested in this profile</Label>
            </div>
          </div>

          {/* Written Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Additional Comments (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts about the call..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleSubmit} className="w-full bg-red-600 hover:bg-red-700 text-white">
              Submit Feedback
            </Button>
            
            {interestedInProfile && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-1" />
                  Send Interest
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
