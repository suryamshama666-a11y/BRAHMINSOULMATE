
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  adminRole?: { role: string } | null;
  isMobile: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ adminRole, isMobile }) => {
  return (
    <div className="relative mb-8 p-8 bg-white border border-red-50 rounded-3xl shadow-xl shadow-red-50/50 overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50" />
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-red-600 to-orange-600 p-4 rounded-2xl shadow-lg shadow-red-200">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className={`font-serif font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                Control Center
              </h1>
              <Badge variant="default" className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border-none">
                {adminRole?.role || 'Super Admin'}
              </Badge>
            </div>
            <p className="text-gray-500 font-medium">Brahmin Soulmate Connect • Platform Governance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-xl border-gray-100 h-11 w-11 hover:bg-red-50 hover:text-red-600 transition-all">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-gray-100 h-11 w-11 hover:bg-red-50 hover:text-red-600 transition-all">
            <SettingsIcon className="h-5 w-5" />
          </Button>
          {!isMobile && (
            <div className="h-10 w-[1px] bg-gray-100 mx-2" />
          )}
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Admin User</p>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">System Online</p>
            </div>
            <div className="h-11 w-11 bg-gray-100 rounded-xl border-2 border-white shadow-sm overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
