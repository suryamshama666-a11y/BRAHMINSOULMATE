
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, UserCheck, UserX } from 'lucide-react';

interface UserManagementTabProps {
  users: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onModerateUser: (userId: string, action: 'suspend' | 'activate') => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  searchTerm,
  onSearchChange,
  onModerateUser
}) => {
  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management ({users.length})
          </div>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {user.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt={user.first_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={user.verified === 'verified' ? 'default' : 'secondary'}>
                      {user.verified || 'pending'}
                    </Badge>
                    <Badge variant="outline">
                      {user.subscription_type || 'free'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onModerateUser(user.user_id, 'suspend')}
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Suspend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onModerateUser(user.user_id, 'activate')}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Activate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
