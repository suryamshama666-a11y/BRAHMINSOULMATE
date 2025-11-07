
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star, Calendar, Clock, MessageCircle, Video, Heart } from 'lucide-react';
import { VDate } from '@/types/vdates';
import { Profile } from '@/types/profile';

interface VDateHistoryProps {
  pastVDates: VDate[];
  profiles: Profile[];
  currentUserId: string;
  onSubmitFeedback: (vdateId: string, rating: number, comment: string, wouldMeetAgain: boolean) => void;
}

export const VDateHistory = ({ pastVDates, profiles, currentUserId, onSubmitFeedback }: VDateHistoryProps) => {
  const [feedbackDialog, setFeedbackDialog] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [wouldMeetAgain, setWouldMeetAgain] = useState(false);

  const getProfileById = (id: string) => profiles.find(p => p.id === id);
  
  const getPartnerProfile = (vdate: VDate) => {
    const partnerId = vdate.participantIds.find(id => id !== currentUserId);
    return partnerId ? getProfileById(partnerId) : null;
  };

  const handleSubmitFeedback = (vdateId: string) => {
    if (rating === 0) return;
    
    onSubmitFeedback(vdateId, rating, comment, wouldMeetAgain);
    setFeedbackDialog(null);
    setRating(0);
    setComment('');
    setWouldMeetAgain(false);
  };

  const hasUserFeedback = (vdate: VDate) => {
    return vdate.feedback?.some(f => f.userId === currentUserId);
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="border-2 border-purple-100/50">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="text-xl text-purple-700 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          V-Date History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {pastVDates.length > 0 ? (
            pastVDates.map((vdate) => {
              const partnerProfile = getPartnerProfile(vdate);
              const userFeedback = vdate.feedback?.find(f => f.userId === currentUserId);
              
              if (!partnerProfile) return null;

              return (
                <Card key={vdate.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16 border-2 border-purple-200">
                        <AvatarImage src={partnerProfile.images[0]} alt={partnerProfile.name} />
                        <AvatarFallback>{partnerProfile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{partnerProfile.name}</h3>
                          <Badge className={
                            vdate.status === 'completed' 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                          }>
                            {vdate.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(vdate.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{vdate.time} ({vdate.duration} min)</span>
                          </div>
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-1" />
                            <span>{vdate.title}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            <span>{vdate.type}</span>
                          </div>
                        </div>
                        
                        {userFeedback ? (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-green-700">Your Rating:</span>
                              {renderStars(userFeedback.rating)}
                            </div>
                            {userFeedback.comment && (
                              <p className="text-sm text-green-600 italic">"{userFeedback.comment}"</p>
                            )}
                            {userFeedback.wouldMeetAgain && (
                              <div className="flex items-center gap-1 mt-2 text-green-600">
                                <Heart className="h-4 w-4 fill-current" />
                                <span className="text-sm">Would meet again</span>
                              </div>
                            )}
                          </div>
                        ) : vdate.status === 'completed' && (
                          <Dialog open={feedbackDialog === vdate.id} onOpenChange={(open) => setFeedbackDialog(open ? vdate.id : null)}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                              >
                                Leave Feedback
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rate your V-Date with {partnerProfile.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Overall Rating</label>
                                  {renderStars(rating, true, setRating)}
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
                                  <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your thoughts about this V-Date..."
                                    className="min-h-[100px]"
                                  />
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="wouldMeetAgain"
                                    checked={wouldMeetAgain}
                                    onChange={(e) => setWouldMeetAgain(e.target.checked)}
                                    className="rounded"
                                  />
                                  <label htmlFor="wouldMeetAgain" className="text-sm">
                                    I would like to meet this person again
                                  </label>
                                </div>
                                
                                <Button
                                  onClick={() => handleSubmitFeedback(vdate.id)}
                                  disabled={rating === 0}
                                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                >
                                  Submit Feedback
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full h-16 w-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-600 mb-2">No V-Date history</h3>
              <p className="text-gray-500">Your completed V-Dates will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
