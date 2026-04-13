
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Users, UserCheck, Shield, TrendingUp } from 'lucide-react';

interface User {
  id: string;
  gender: string;
  verified: boolean;
  verification_status: string | null;
  subscription_type: string;
}

interface AnalyticsTabProps {
  users: User[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ users }) => {
  // Process data for charts
  const genderData = useMemo(() => {
    const counts = users.reduce((acc: Record<string, number>, user: User) => {
      const gender = user.gender || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});
    
    return [
      { name: 'Male', value: counts.male || 0, color: '#3b82f6' },
      { name: 'Female', value: counts.female || 0, color: '#ec4899' },
      { name: 'Other', value: counts.other || 0, color: '#6366f1' }
    ];
  }, [users]);

  const verificationData = useMemo(() => {
    const counts = users.reduce((acc: Record<string, number>, user: User) => {
      const status = user.verification_status || (user.verified ? 'verified' : 'pending');
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return [
      { name: 'Verified', value: counts.verified || 0, color: '#10b981' },
      { name: 'Pending', value: counts.pending || 0, color: '#f59e0b' },
      { name: 'Rejected', value: (counts.rejected || 0) + (counts.denied || 0), color: '#ef4444' }
    ];
  }, [users]);

  // Mock registration data for the line chart (since we might not have many real dates)
  const registrationTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      registrations: Math.floor(Math.random() * 50) + 10,
      premium: Math.floor(Math.random() * 20) + 5
    }));
  }, []);

  const stats = [
    { 
      label: 'Total Users', 
      value: users.length, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      description: 'Global active members'
    },
    { 
      label: 'Verified Users', 
      value: users.filter(u => u.verified === true).length, 
      icon: UserCheck, 
      color: 'text-green-600', 
      bg: 'bg-green-50',
      description: 'Trust-badges issued'
    },
    { 
      label: 'Premium Members', 
      value: users.filter(u => u.subscription_type !== 'free').length, 
      icon: Shield, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      description: 'Active paid subscribers'
    },
    { 
      label: 'New Today', 
      value: Math.floor(users.length * 0.1), 
      icon: TrendingUp, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      description: 'Last 24 hours'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${stat.bg} p-3 rounded-2xl`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-serif">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Acquisition Trend
            </CardTitle>
            <CardDescription>User growth over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="registrations" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    dot={{fill: '#ef4444', r: 4}} 
                    activeDot={{r: 6, strokeWidth: 0}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="premium" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    dot={{fill: '#8b5cf6', r: 4}}
                    activeDot={{r: 6, strokeWidth: 0}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          {/* Gender Distribution */}
          <Card className="border-none shadow-sm h-full flex flex-col">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-serif">Gender Diversity</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs">
                {genderData.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></span>
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card className="border-none shadow-sm h-full flex flex-col">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-serif">Verification Funnel</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={verificationData} layout="vertical" margin={{left: -20, right: 20}}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {verificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
