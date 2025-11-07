
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsTabProps {
  users: any[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ users }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Total Users</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-3xl font-bold text-blue-600">{users.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Verified Users</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {users.filter(u => u.verified === 'verified').length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Premium Users</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {users.filter(u => u.subscription_type === 'premium').length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
