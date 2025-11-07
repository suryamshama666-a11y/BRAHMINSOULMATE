
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Video, CheckCircle } from 'lucide-react';
import { VDate } from '@/types/vdates';
import { Profile } from '@/types/profile';

interface UpcomingVDatesProps {
  upcomingVDates: VDate[];
  profiles: Profile[];
  onJoinVDate: (vdateId: string) => void;
  onCancelVDate: (vdateId: string) => void;
}

export const UpcomingVDates = ({ upcomingVDates, profiles, onJoinVDate, onCancelVDate }: UpcomingVDatesProps) => {
  const getPartnerProfile = (vdate: VDate) => {
    return profiles.find(p => vdate.participantIds.includes(p.id) && p.id !== 'user-1');
  };

  return (
    <Card className="border-2 border-red-100/50">
      <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50">
        <CardTitle className="text-xl text-red-700 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Upcoming V-Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {upcomingVDates.length > 0 ? (
            upcomingVDates.map((vdate) => {
              const partnerProfile = getPartnerProfile(vdate);
              if (!partnerProfile) return null;

              return (
                <div key={vdate.id} className="flex items-center space-x-4 p-4 rounded-lg border border-red-100 hover:bg-red-50/50 transition-colors">
                  <Avatar className="h-16 w-16 border-2 border-red-200">
                    <AvatarImage src={partnerProfile.images[0]} alt={partnerProfile.name} />
                    <AvatarFallback>{partnerProfile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{partnerProfile.name}</h3>
                      <Badge className={
                        vdate.status === 'confirmed' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                      }>
                        {vdate.status === 'confirmed' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmed
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-1 text-red-500" />
                      <span className="mr-4">{new Date(vdate.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      <Clock className="h-4 w-4 mr-1 text-amber-500" />
                      <span>{vdate.time} ({vdate.duration} min)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Video className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{vdate.title}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {vdate.status === 'confirmed' && vdate.meetingLink && (
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        onClick={() => onJoinVDate(vdate.id)}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Join Call
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-white text-red-600 border-2 border-red-400 hover:!bg-white hover:!text-red-600 hover:!border-red-400 transition-all duration-300 transform hover:scale-105 font-medium"
                      onClick={() => onCancelVDate(vdate.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full h-16 w-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-600 mb-2">No upcoming V-Dates</h3>
              <p className="text-gray-500">Schedule your first V-Date to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
