
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

interface VDateStatsProps {
  upcomingCount: number;
  pendingCount: number;
  completedCount: number;
  totalCount: number;
}

export const VDateStats = ({ upcomingCount, pendingCount, completedCount, totalCount }: VDateStatsProps) => {
  const stats = [
    { label: 'Upcoming', value: upcomingCount, icon: Calendar, color: 'text-blue-600' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-amber-600' },
    { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Total', value: totalCount, icon: Users, color: 'text-purple-600' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.label} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <IconComponent className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
