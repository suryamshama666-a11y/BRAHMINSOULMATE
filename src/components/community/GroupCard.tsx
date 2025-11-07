
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Lock, Globe } from 'lucide-react';
import { CommunityGroup } from '@/hooks/social/useCommunityGroups';

interface GroupCardProps {
  group: CommunityGroup;
  onJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
  isJoined?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onJoin,
  onLeave,
  isJoined = false
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <CardDescription className="mt-1">
              {group.description || 'No description available'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {group.is_private ? (
              <Lock className="h-4 w-4 text-gray-500" />
            ) : (
              <Globe className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">            
            {isJoined ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLeave?.(group.id)}
                className="text-red-600 hover:text-red-700"
              >
                Leave
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onJoin?.(group.id)}
                disabled={group.is_private}
              >
                {group.is_private ? 'Private' : 'Join'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
