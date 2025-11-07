
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface MatrimonialBackgroundsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBackground: (background: string) => void;
}

export const MatrimonialBackgrounds = ({ isOpen, onClose, onSelectBackground }: MatrimonialBackgroundsProps) => {
  const backgrounds = [
    { id: 'none', name: 'No Background', preview: 'bg-gray-200' },
    { id: 'blur', name: 'Blur Background', preview: 'bg-gradient-to-br from-blue-100 to-purple-100' },
    { id: 'traditional-home', name: 'Traditional Home', preview: 'bg-gradient-to-br from-amber-100 to-orange-200' },
    { id: 'elegant-room', name: 'Elegant Room', preview: 'bg-gradient-to-br from-purple-100 to-pink-100' },
    { id: 'professional', name: 'Professional', preview: 'bg-gradient-to-br from-gray-100 to-blue-100' },
    { id: 'cultural-setting', name: 'Cultural Setting', preview: 'bg-gradient-to-br from-red-100 to-yellow-100' },
    { id: 'garden-view', name: 'Garden View', preview: 'bg-gradient-to-br from-green-100 to-emerald-100' },
    { id: 'family-home', name: 'Family Home', preview: 'bg-gradient-to-br from-pink-100 to-rose-100' }
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 right-4 z-30">
      <Card className="w-80 bg-white/95 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg">Choose Background</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {backgrounds.map((bg) => (
              <Button
                key={bg.id}
                variant="outline"
                className="h-20 p-2 flex flex-col items-center justify-center"
                onClick={() => onSelectBackground(bg.id)}
              >
                <div className={`w-12 h-8 rounded ${bg.preview} mb-1`} />
                <span className="text-xs text-center">{bg.name}</span>
              </Button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 Choose backgrounds that present you professionally for matrimonial meetings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
