import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdmin } from '@/hooks/useAdmin';
import { useIsMobile } from '@/hooks/use-mobile';
import Footer from '@/components/Footer';
import { AdminHeader } from './admin/components/AdminHeader';
import { UserManagementTab } from './admin/components/UserManagementTab';
import { AnalyticsTab } from './admin/components/AnalyticsTab';
import { EventsManagementTab } from './admin/components/EventsManagementTab';
import { ContentModerationTab } from './admin/components/ContentModerationTab';
import {
  Shield, Users, FileText, Activity,
  Calendar
} from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, adminRole, loading, getAllUsers, moderateUser, getAdminLogs } = useAdmin();
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadData = async () => {
    const [usersData, logsData] = await Promise.all([
      getAllUsers(),
      getAdminLogs()
    ]);
    setUsers(usersData);
    setLogs(logsData);
  };

  const handleModerateUser = async (userId: string, action: 'suspend' | 'activate') => {
    const success = await moderateUser(userId, action as any);
    if (success) {
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className={`flex-grow container mx-auto py-6 ${isMobile ? 'px-4' : 'px-6'}`}>
        <AdminHeader adminRole={adminRole} isMobile={isMobile} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {!isMobile && 'Users'}
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {!isMobile && 'Events'}
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {!isMobile && 'Content'}
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {!isMobile && 'Activity'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {!isMobile && 'Analytics'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagementTab
              users={users}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onModerateUser={handleModerateUser}
            />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <EventsManagementTab />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentModerationTab />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Admin Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{log.action.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-sm text-gray-600">
                          Target: {log.target_type} | {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline">{log.target_type}</Badge>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4" />
                      <p>No activity logs yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab users={users} />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
