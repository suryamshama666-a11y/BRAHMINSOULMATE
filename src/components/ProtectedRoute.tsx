/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { isDevBypassMode } from '@/config/dev';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
  requireVerified?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requirePremium = false,
  requireVerified = false 
}: ProtectedRouteProps) {
  const { user, profile, loading, updateLastActive } = useAuth();
  const location = useLocation();
  const devMode = isDevBypassMode();

  // Update last active timestamp when user navigates (skip in dev mode)
  useEffect(() => {
    if (user && !devMode) {
      updateLastActive();
    }
  }, [location.pathname, user, updateLastActive, devMode]);

  // DEV MODE: Bypass authentication if enabled
  if (devMode) {
    console.log('🔓 DEV MODE: Authentication bypassed');
    return <>{children}</>;
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FF4500] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check premium requirement
  if (requirePremium && profile?.subscription_type === 'free') {
    return <Navigate to="/plans" state={{ message: 'This feature requires a premium subscription' }} replace />;
  }

  // Check verification requirement
  if (requireVerified && (profile as any)?.verification_status !== 'verified') {
    return <Navigate to="/profile" state={{ message: 'Please verify your profile to access this feature' }} replace />;
  }

  // Render protected content
  return <>{children}</>;
}