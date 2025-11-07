import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from './LoadingScreen';
import { toast } from 'sonner';
import { Button } from './ui/button';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

// Development bypass only in dev builds
const DEVELOPMENT_BYPASS = import.meta.env.DEV;

/**
 * ProtectedRoute component that restricts access to authenticated users only
 * Optionally can restrict to admin users only
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [bypassEnabled, setBypassEnabled] = useState(false);
  
  // Check for bypass mode in local storage
  useEffect(() => {
    const storedBypass = localStorage.getItem('dev_auth_bypass');
    if (storedBypass === 'true') {
      setBypassEnabled(true);
    }
  }, []);

  // Enable bypass mode
  const enableBypass = () => {
    localStorage.setItem('dev_auth_bypass', 'true');
    setBypassEnabled(true);
    toast.success('Development bypass enabled - authentication is now skipped');
  };
  
  // Show loading state while authentication state is being determined
  if (loading && !bypassEnabled) {
    return <LoadingScreen />;
  }
  
  // Handle auth bypass for development
  if (DEVELOPMENT_BYPASS && !user && !bypassEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <h1 className="text-2xl font-bold text-center mb-6 text-red-800">Authentication Required</h1>
          
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              <strong>Development Mode Notice:</strong> Supabase authentication service appears to be unavailable.
            </p>
          </div>
          
          <p className="mb-4 text-gray-600">
            This page requires authentication, but you can bypass login in development mode to access site features.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={enableBypass} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Enable Development Bypass
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/login'} 
              variant="outline" 
              className="w-full border-red-200"
            >
              Try Login Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // If not authenticated and bypass is not enabled, redirect to login
  if (!user && !bypassEnabled) {
    // Save the current location for redirecting back after login
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    
    // Show a toast message
    toast.error('Please log in to access this page', {
      id: 'auth-required',
      duration: 3000
    });
    
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }
  
  // If adminOnly and user is not admin (and bypass is not enabled), redirect to dashboard
  if (adminOnly && user?.role !== 'admin' && !bypassEnabled) {
    toast.error('Admin access required', {
      id: 'admin-required',
      duration: 3000
    });
    
    return <Navigate to="/dashboard" replace />;
  }
  
  // If authenticated or bypass is enabled, render children
  return <>{children}</>;
};

export default ProtectedRoute;
