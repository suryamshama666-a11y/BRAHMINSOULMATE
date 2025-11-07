
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SocialFeedCardProps {
  activity: {
    id: string;
    user_id: string;
    activity_type: string;
    activity_data?: any;
    created_at: string;
  };
  userProfile?: {
    first_name?: string;
    last_name?: string;
    profile_picture_url?: string;
  };
}

export const SocialFeedCard: React.FC<SocialFeedCardProps> = ({
  activity,
  userProfile
}) => {
  const getActivityText = () => {
    switch (activity.activity_type) {
      case 'profile_update':
        return 'updated their profile';
      case 'photo_upload':
        return 'added new photos';
      case 'post_created':
        return 'created a new post';
      case 'event_created':
        return 'created an event';
      case 'group_joined':
        return 'joined a community group';
      default:
        return 'had some activity';
    }
  };

  const getUserName = () => {
    if (userProfile?.first_name) {
      return `${userProfile.first_name} ${userProfile.last_name || ''}`.trim();
    }
    return 'Anonymous User';
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar>
            <AvatarImage src={userProfile?.profile_picture_url} />
            <AvatarFallback>
              {getUserName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">{getUserName()}</span>
              <span className="text-gray-500 text-sm">{getActivityText()}</span>
            </div>
            
            <p className="text-gray-600 text-xs mt-1">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </p>
            
            {activity.activity_data?.content && (
              <p className="mt-2 text-sm text-gray-800">
                {activity.activity_data.content}
              </p>
            )}
            
            <div className="flex items-center space-x-4 mt-3">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                <Heart className="h-4 w-4 mr-1" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                <MessageCircle className="h-4 w-4 mr-1" />
                Comment
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
