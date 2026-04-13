
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, Search, UserCheck, UserX, MoreVertical, 
  ExternalLink, Shield, Mail, MapPin
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface Member {
  id: string;
  user_id: string;
  name: string;
  email: string;
  images: string[];
  verified: boolean;
  verification_status: string | null;
  subscription_type: string;
  role: string;
}

interface UserManagementTabProps {
  users: Member[];
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
  const navigate = useNavigate();
  
  const filteredUsers = users.filter((user: Member) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              Member Directory
            </CardTitle>
            <CardDescription>Manage and moderate all system users</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10 bg-gray-50 border-none focus-visible:ring-red-500 rounded-xl"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-red-50/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
                        <AvatarImage src={user.images?.[0] || ''} />
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                          {user.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={user.verified ? 'default' : 'secondary'}
                        className={user.verified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}
                      >
                        {user.verified ? (
                          <UserCheck className="h-3 w-3 mr-1" />
                        ) : (
                          <Shield className="h-3 w-3 mr-1" />
                        )}
                        {user.verification_status || (user.verified ? 'verified' : 'pending')}
                      </Badge>
                      <span className="text-[10px] text-gray-400 pl-1 capitalize">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="border-gray-200 text-gray-600 bg-gray-50 px-2 py-0.5 font-medium">
                      {user.subscription_type || 'free'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      India
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(`/profile/${user.user_id}`)}
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/profile/${user.user_id}`)}>
                            <Users className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-blue-600">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Verify User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 font-medium"
                            onClick={() => onModerateUser(user.user_id, 'suspend')}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Suspend Account
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onModerateUser(user.user_id, 'activate')}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Re-activate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Search className="h-10 w-10 mb-2 opacity-20" />
                      <p>No members found matching your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
