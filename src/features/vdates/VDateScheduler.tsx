
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Clock, Video, Coffee, ChefHat, Film, Gamepad2, Crown } from 'lucide-react';
import { VDateTemplate } from '@/types/vdates';
import { Profile } from '@/types/profile';
import { cn } from '@/lib/utils';

interface VDateSchedulerProps {
  profiles: Profile[];
  templates: VDateTemplate[];
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedTemplate: VDateTemplate | null;
  availableTimeSlots: string[];
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  onTemplateSelect: (template: VDateTemplate) => void;
  onSchedule: (profileId: string, template: VDateTemplate, message?: string) => void;
}

export const VDateScheduler = ({
  profiles,
  templates,
  selectedDate,
  selectedTime,
  selectedTemplate,
  availableTimeSlots,
  onDateSelect,
  onTimeSelect,
  onTemplateSelect,
  onSchedule
}: VDateSchedulerProps) => {
  const [selectedProfile, setSelectedProfile] = React.useState<Profile | null>(null);
  const [message, setMessage] = React.useState('');

  const getTemplateIcon = (type: string) => {
    const icons = {
      video: Video,
      coffee: Coffee,
      cooking: ChefHat,
      movie: Film,
      game: Gamepad2,
      activity: Video
    };
    return icons[type as keyof typeof icons] || Video;
  };

  const handleSchedule = () => {
    if (selectedProfile && selectedTemplate) {
      onSchedule(selectedProfile.id, selectedTemplate, message);
      setSelectedProfile(null);
      setMessage('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Date & Time Selection */}
      <Card className="border-2 border-amber-100/50">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-red-50">
          <CardTitle className="text-xl text-amber-700 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Select Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              disabled={(date) => date < new Date() || date < new Date(Date.now() - 86400000)}
              className="rounded-md border"
            />
          </div>

          {selectedDate && (
            <div>
              <h3 className="font-semibold mb-4 text-amber-700">Available Time Slots</h3>
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.map((time) => (
                  <Button
                    key={time}
                    size="sm"
                    className={selectedTime === time
                      ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white border-2 border-amber-500 hover:from-amber-600 hover:to-red-600'
                      : 'bg-white text-amber-600 border-2 border-amber-400 hover:!bg-white hover:!text-amber-600 hover:!border-amber-400'
                    }
                    onClick={() => onTimeSelect(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              {availableTimeSlots.length === 0 && (
                <p className="text-gray-500 text-sm">No available time slots for this date</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* V-Date Templates */}
      <Card className="border-2 border-red-100/50">
        <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50">
          <CardTitle 
            className="text-xl"
            style={{ color: '#E30613' }}
          >
            Choose V-Date Type
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {templates.map((template) => {
              const IconComponent = getTemplateIcon(template.type);
              return (
                <div
                  key={template.id}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-colors",
                    selectedTemplate?.id === template.id
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => onTemplateSelect(template)}
                >
                  <div className="flex items-start space-x-3">
                    <IconComponent className="h-6 w-6 mt-1" style={{ color: '#E30613' }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold" style={{ color: '#E30613' }}>{template.name}</h4>
                        {template.isPremium && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {template.duration} minutes
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Profile Selection & Scheduling */}
      {selectedDate && selectedTime && selectedTemplate && (
        <Card className="lg:col-span-2 border-2 border-green-100/50">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="text-xl text-green-700">Send V-Date Invitation</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Select Profile to Invite</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.slice(0, 6).map((profile) => (
                  <div
                    key={profile.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-colors",
                      selectedProfile?.id === profile.id
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.images[0]} alt={profile.name} />
                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{profile.name}</h4>
                        <p className="text-sm text-gray-600">{profile.age} yrs • {profile.location.city}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedProfile && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Personal Message (Optional)</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message to your V-Date invitation..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">V-Date Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>With:</strong> {selectedProfile.name}</p>
                    <p><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Type:</strong> {selectedTemplate.name}</p>
                    <p><strong>Duration:</strong> {selectedTemplate.duration} minutes</p>
                  </div>
                </div>

                <Button 
                  onClick={handleSchedule}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white"
                >
                  Send V-Date Invitation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
