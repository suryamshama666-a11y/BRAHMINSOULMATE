
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GroupCard } from './GroupCard';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';

interface GroupsTabProps {
  onCreateGroup: () => void;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({ onCreateGroup }) => {
  const { communityGroups, fetchCommunityGroups } = useSocialFeatures();

  useEffect(() => {
    fetchCommunityGroups();
  }, [fetchCommunityGroups]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Community Groups</CardTitle>
            <CardDescription>
              Join groups based on interests, location, profession, or age
            </CardDescription>
          </div>
            <Button onClick={onCreateGroup} variant="destructive">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
        </CardHeader>
        <CardContent>
          {communityGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No community groups found.</p>
              <p className="text-sm mt-1">Be the first to create a group!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={(groupId) => console.log('Join group:', groupId)}
                  onLeave={(groupId) => console.log('Leave group:', groupId)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
