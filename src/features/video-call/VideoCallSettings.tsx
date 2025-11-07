
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

interface VideoCallSettingsProps {
  onClose: () => void;
  onChangeBackground: (background: string) => void;
}

export const VideoCallSettings = ({ onClose, onChangeBackground }: VideoCallSettingsProps) => {
  const backgrounds = [
    { id: 'none', name: 'No Background' },
    { id: 'blur', name: 'Blur Background' },
    { id: 'office', name: 'Office' },
    { id: 'home', name: 'Home Library' },
    { id: 'nature', name: 'Nature Scene' }
  ];

  return (
    <div className="absolute right-4 top-16 z-20 w-80">
      <Card className="border-gray-700 bg-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Call Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Camera</Label>
            <Select defaultValue="default">
              <SelectTrigger>
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Camera</SelectItem>
                <SelectItem value="external">External Camera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Microphone</Label>
            <Select defaultValue="default">
              <SelectTrigger>
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Microphone</SelectItem>
                <SelectItem value="headset">Headset Microphone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Background</Label>
            <Select onValueChange={onChangeBackground}>
              <SelectTrigger>
                <SelectValue placeholder="Select background" />
              </SelectTrigger>
              <SelectContent>
                {backgrounds.map(bg => (
                  <SelectItem key={bg.id} value={bg.id}>
                    {bg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="noise-cancellation" />
            <Label htmlFor="noise-cancellation">Noise Cancellation</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="auto-adjust" />
            <Label htmlFor="auto-adjust">Auto-adjust for low light</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
