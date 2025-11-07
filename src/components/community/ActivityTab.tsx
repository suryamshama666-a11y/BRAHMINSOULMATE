
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialFeedCard } from './SocialFeedCard';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';
import { Loader2 } from 'lucide-react';

export const ActivityTab: React.FC = () => {
  const { activities, loading, fetchActivities } = useSocialFeatures();

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Community Activity Feed</CardTitle>
          <CardDescription>
            Stay updated with the latest activities from the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No activities to show yet.</p>
              <p className="text-sm mt-1">Be the first to create some activity!</p>
            </div>
          ) : (
            <div className="space-y-0">
              {activities.map((activity) => (
                <SocialFeedCard
                  key={activity.id}
                  activity={activity}
                  userProfile={{
                    first_name: 'Community',
                    last_name: 'Member'
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
