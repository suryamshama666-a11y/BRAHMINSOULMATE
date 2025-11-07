
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Video, Clock, Users } from 'lucide-react';

export const VDateTips = () => {
  const tips = [
    { icon: Heart, text: 'Be yourself and stay relaxed during the conversation' },
    { icon: Video, text: 'Test your camera and audio beforehand' },
    { icon: Clock, text: 'Be punctual and dress appropriately' },
    { icon: Users, text: 'Prepare interesting topics to discuss' }
  ];

  return (
    <Card className="border-2 border-amber-100/50">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-red-50">
        <CardTitle className="text-lg text-amber-700">V-Date Tips</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3 text-sm">
          {tips.map((tip, index) => {
            const IconComponent = tip.icon;
            return (
              <div key={index} className="flex items-start space-x-2">
                <IconComponent className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>{tip.text}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
