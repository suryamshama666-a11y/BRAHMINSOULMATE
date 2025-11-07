
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface AdminHeaderProps {
  adminRole?: { role: string } | null;
  isMobile: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ adminRole, isMobile }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className={`font-bold text-blue-600 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          Admin Panel
        </h1>
        <Badge variant="default" className="bg-blue-600">
          {adminRole?.role || 'Admin'}
        </Badge>
      </div>
      <p className="text-gray-600">Manage users, content, and platform operations</p>
    </div>
  );
};
