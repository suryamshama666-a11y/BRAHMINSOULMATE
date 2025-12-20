
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, X, Heart, MessageCircle } from 'lucide-react';
import { Profile } from '@/data/profiles';

interface MatrimonialProfileOverlayProps {
  profile: Profile;
  isVisible: boolean;
  onClose: () => void;
  onInterest: () => void;
  onMessage: () => void;
}

export const MatrimonialProfileOverlay = ({
  profile,
  isVisible,
  onClose,
  onInterest,
  onMessage
}: MatrimonialProfileOverlayProps) => {
  if (!isVisible) return null;

  // Format location from ProfileLocation object
  const formatLocation = (location: typeof profile.location) => {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    return parts.join(', ') || 'Not specified';
  };

  // Format education from ProfileEducation array
  const formatEducation = (education: typeof profile.education) => {
    if (!education || education.length === 0) return 'Not specified';
    const latest = education[0]; // Show the first/latest education
    return latest.degree || 'Not specified';
  };

  // Get profession from employment object
  const getProfession = () => {
    return profile.employment?.profession || 'Not specified';
  };

  return (
    <div className="absolute top-4 left-4 z-30 w-80">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/20">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarImage src={profile.images[0]} alt={profile.name} />
                <AvatarFallback className="bg-brahmin-primary text-white">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-600">{profile.age} years</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {profile.isVerified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-gray-700 mb-4">
            <p><span className="font-medium">Profession:</span> {getProfession()}</p>
            <p><span className="font-medium">Location:</span> {formatLocation(profile.location)}</p>
            <p><span className="font-medium">Education:</span> {formatEducation(profile.education)}</p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={onInterest}
            >
              <Heart className="h-4 w-4 mr-1" />
              Interest
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onMessage}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
