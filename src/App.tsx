import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleNavbar from '@/components/SimpleNavbar';
import { DevModeIndicator } from '@/components/DevModeIndicator';
import { CollapsibleChatWidget } from '@/components/CollapsibleChatWidget';
import { CookieConsent } from '@/components/CookieConsent';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Analytics } from '@/utils/analytics';
import { TransactionRecovery } from '@/utils/transactionRecovery';
import { HelmetProvider } from 'react-helmet-async';
import SEO from '@/components/SEO';


// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy loaded pages
const LazyOriginalNavbar = React.lazy(() => import('@/components/OriginalNavbar'));

// Auth pages loaded together to prevent flash when navigating between them
const authPagesPromise = Promise.all([
  import('@/pages/Login'),
  import('@/pages/Register'),
  import('@/pages/ForgotPassword'),
  import('@/pages/ResetPassword'),
]);

const Login = React.lazy(() => authPagesPromise.then(([login]) => login));
const Register = React.lazy(() => authPagesPromise.then(([, register]) => register));
const ForgotPassword = React.lazy(() => authPagesPromise.then(([, , forgot]) => forgot));
const ResetPassword = React.lazy(() => authPagesPromise.then(([, , , reset]) => reset));

const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const ProfileManagement = React.lazy(() => import('@/pages/ProfileManagement'));
const ProfileSetupWizard = React.lazy(() => import('@/features/profile/components/ProfileSetupWizard'));
const Messages = React.lazy(() => import('@/pages/Messages'));
const Matches = React.lazy(() => import('@/pages/Matches'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const AuthCallback = React.lazy(() => import('@/pages/auth/callback'));
const Search = React.lazy(() => import('@/pages/Search'));
const VDates = React.lazy(() => import('@/pages/VDates'));
const Community = React.lazy(() => import('@/pages/Community'));

const MyFavorites = React.lazy(() => import('@/pages/MyFavorites'));
const MyInterests = React.lazy(() => import('@/pages/MyInterests'));
const InterestsReceived = React.lazy(() => import('@/pages/InterestsReceived'));
const WhoViewedYou = React.lazy(() => import('@/pages/WhoViewedYou'));
const YouViewed = React.lazy(() => import('@/pages/YouViewed'));

const OnlineProfiles = React.lazy(() => import('@/pages/OnlineProfiles'));
const NewMembers = React.lazy(() => import('@/pages/NewMembers'));
const PhotoManagement = React.lazy(() => import('@/pages/PhotoManagement'));

const About = React.lazy(() => import('@/pages/About'));
const HowItWorks = React.lazy(() => import('@/pages/HowItWorks'));
const FreeVsPaid = React.lazy(() => import('@/pages/FreeVsPaid'));
const Plans = React.lazy(() => import('@/pages/Plans'));
const Events = React.lazy(() => import('@/pages/Events'));
const Help = React.lazy(() => import('@/pages/Help'));
const SuccessStories = React.lazy(() => import('@/pages/SuccessStories'));
const Account = React.lazy(() => import('@/pages/Account'));
const AstrologicalServices = React.lazy(() => import('@/pages/AstrologicalServices'));
const EventDetails = React.lazy(() => import('@/pages/EventDetails'));
const Admin = React.lazy(() => import('@/pages/Admin'));

// Legal pages
const Privacy = React.lazy(() => import('@/pages/Privacy'));
const Terms = React.lazy(() => import('@/pages/Terms'));
const CookiePolicy = React.lazy(() => import('@/pages/CookiePolicy'));
const RefundPolicy = React.lazy(() => import('@/pages/RefundPolicy'));


// Configure the query client with better caching strategy and global error handlers
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      // Don't show toast for 401s as the Auth provider handles redirects
      if (error?.status === 401) return;
      toast.error(`Operation Failed: ${error.message || 'Server error'}`);
    },
  }),
});

// Landing page
const Landing = React.lazy(() => import('@/pages/Landing'));

// Home redirect component - shows landing page
const HomeRedirect = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Landing />
    </Suspense>
  );
};


const Authenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </ProtectedRoute>
);

// Wrapper component that uses useLocation inside Router
const AppContent = () => {
  const location = useLocation();
  const { user: _user } = useAuth();
  const path = location.pathname;
  // Show SimpleNavbar on login, register pages and landing page (always for landing)
  const simpleNavbarPages = ['/login', '/register', '/signup'];
  const isAuthPage = simpleNavbarPages.some((p) => path.startsWith(p));
  const isLandingPage = path === '/';
  // Landing page always shows SimpleNavbar, auth pages too
  const isSimpleNavbar = isAuthPage || isLandingPage;

  return (
    <>
      {isSimpleNavbar ? <SimpleNavbar /> : (
        <Suspense fallback={null}>
          <LazyOriginalNavbar />
        </Suspense>
      )}
      <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route 
                  path="/auth/callback" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AuthCallback />
                    </Suspense>
                  } 
                />

                {/* Public Information Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/free-vs-paid" element={<FreeVsPaid />} />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route path="/help" element={<Help />} />
                <Route path="/account" element={<Account />} />
                
                {/* Legal Pages */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<Authenticated><Dashboard /></Authenticated>} />
                <Route path="/profile" element={<Authenticated><Profile /></Authenticated>} />
                <Route path="/profile/:id" element={<Authenticated><Profile /></Authenticated>} />
                <Route path="/profile/manage" element={<Authenticated><ProfileManagement /></Authenticated>} />
                <Route path="/profile/setup" element={<Authenticated><ProfileSetupWizard onComplete={() => window.location.href = '/dashboard'} /></Authenticated>} />
                <Route path="/profile/photos" element={<Authenticated><PhotoManagement /></Authenticated>} />
                <Route path="/messages" element={<Authenticated><Messages /></Authenticated>} />
                <Route path="/matches" element={<Authenticated><Matches /></Authenticated>} />
                <Route path="/settings" element={<Authenticated><Settings /></Authenticated>} />
                <Route path="/search" element={<Authenticated><Search /></Authenticated>} />
                <Route path="/v-dates" element={<Authenticated><VDates /></Authenticated>} />
                <Route path="/community" element={<Authenticated><Community /></Authenticated>} />
                <Route path="/plans" element={<Authenticated><Plans /></Authenticated>} />
                <Route path="/events" element={<Authenticated><Events /></Authenticated>} />
                <Route path="/events/:id" element={<Authenticated><EventDetails /></Authenticated>} />
                <Route path="/astrological-services" element={<Authenticated><AstrologicalServices /></Authenticated>} />
                <Route path="/admin" element={<Authenticated><Admin /></Authenticated>} />
                <Route path="/my-favorites" element={<Authenticated><MyFavorites /></Authenticated>} />
                <Route path="/my-interests" element={<Authenticated><MyInterests /></Authenticated>} />
                <Route path="/interests-received" element={<Authenticated><InterestsReceived /></Authenticated>} />
                <Route path="/online-profiles" element={<Authenticated><OnlineProfiles /></Authenticated>} />
                <Route path="/new-members" element={<Authenticated><NewMembers /></Authenticated>} />
                <Route path="/connections/who-viewed" element={<Authenticated><WhoViewedYou /></Authenticated>} />
                <Route path="/connections/you-viewed" element={<Authenticated><YouViewed /></Authenticated>} />

                {/* Landing page as root - redirects to dashboard if logged in */}
                <Route
                  path="/"
                  element={<HomeRedirect />}
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </>
        );
};

// Inner component that uses auth context
const AppWithAuth = () => {
  const { user } = useAuth();

  // effect:audited — Application startup resilience for transaction recovery
  useEffect(() => {
    if (user) {
      TransactionRecovery.resumePendingTransactions().catch(err => {
        console.error('FAILED TO RESUME TRANSACTIONS:', err);
      });
    }
  }, [user]);

  return (
    <>
      <AppContent />
      <CollapsibleChatWidget />
      <DevModeIndicator />
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        toastOptions={{
          duration: 5000,
          className: "toast-custom-class",
        }}
      />
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary level="critical">
      <HelmetProvider>
        <SEO />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <AppWithAuth />
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};


export default App;