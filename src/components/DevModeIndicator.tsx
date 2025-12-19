import { isDevBypassMode } from '@/config/dev';
import { Shield } from 'lucide-react';

export const DevModeIndicator = () => {
  if (!isDevBypassMode()) return null;

    return (
      <div className="fixed bottom-4 left-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse opacity-80 hover:opacity-100 transition-opacity">
      <Shield className="h-5 w-5" />
      <div className="text-sm font-semibold">
        DEV MODE: Auth Bypassed
      </div>
    </div>
  );
};
