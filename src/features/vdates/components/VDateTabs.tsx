
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Calendar, Send, History } from 'lucide-react';

interface VDateTabsProps {
  upcomingCount: number;
  pendingInvitationsCount: number;
  pastCount: number;
  children: React.ReactNode[];
}

export const VDateTabs = ({ upcomingCount, pendingInvitationsCount, pastCount, children }: VDateTabsProps) => {
  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="upcoming" className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Upcoming ({upcomingCount})
        </TabsTrigger>
        <TabsTrigger value="schedule" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Schedule New
        </TabsTrigger>
        <TabsTrigger value="invitations" className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Invitations ({pendingInvitationsCount})
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          History ({pastCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-6">
        {children[0]}
      </TabsContent>

      <TabsContent value="schedule">
        {children[1]}
      </TabsContent>

      <TabsContent value="invitations">
        {children[2]}
      </TabsContent>

      <TabsContent value="history">
        {children[3]}
      </TabsContent>
    </Tabs>
  );
};
