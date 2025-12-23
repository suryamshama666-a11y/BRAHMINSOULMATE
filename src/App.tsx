import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleNavbar from '@/components/SimpleNavbar';
import { DevModeIndicator } from '@/components/DevModeIndicator';
import { CollapsibleChatWidget } from '@/components/CollapsibleChatWidget';

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy loaded pages with named chunks for better caching
const LazyOriginalNavbar = React.lazy(() => import(/* webpackChunkName: "navbar" */ '@/components/OriginalNavbar'));

// Auth pages loaded together to prevent flash when navigating between them
const authPagesPromise = Promise.all([
  import(/* webpackChunkName: "auth" */ '@/pages/Login'),
  import(/* webpackChunkName: "auth" */ '@/pages/Register'),
  import(/* webpackChunkName: "auth" */ '@/pages/ForgotPassword'),
  import(/* webpackChunkName: "auth" */ '@/pages/ResetPassword'),
]);

const Login = React.lazy(() => authPagesPromise.then(([login]) => login));
const Register = React.lazy(() => authPagesPromise.then(([, register]) => register));
const ForgotPassword = React.lazy(() => authPagesPromise.then(([, , forgot]) => forgot));
const ResetPassword = React.lazy(() => authPagesPromise.then(([, , , reset]) => reset));

const Dashboard = React.lazy(() => import(/* webpackChunkName: "dashboard" */ '@/pages/Dashboard'));
const Profile = React.lazy(() => import(/* webpackChunkName: "profile" */ '@/pages/Profile'));
const ProfileManagement = React.lazy(() => import(/* webpackChunkName: "profile" */ '@/pages/ProfileManagement'));
const ProfileSetupWizard = React.lazy(() => import(/* webpackChunkName: "profile" */ '@/features/profile/components/ProfileSetupWizard'));
const Messages = React.lazy(() => import(/* webpackChunkName: "messages" */ '@/pages/Messages'));
const Matches = React.lazy(() => import(/* webpackChunkName: "matches" */ '@/pages/Matches'));
const Settings = React.lazy(() => import(/* webpackChunkName: "settings" */ '@/pages/Settings'));
const AuthCallback = React.lazy(() => import(/* webpackChunkName: "auth" */ '@/pages/auth/callback'));
const Search = React.lazy(() => import(/* webpackChunkName: "search" */ '@/pages/Search'));
const VDates = React.lazy(() => import(/* webpackChunkName: "vdates" */ '@/pages/VDates'));
// Direct import for Community to avoid lazy loading issues
import Community from '@/pages/Community';

// Import Connections pages
const MyFavorites = React.lazy(() => import(/* webpackChunkName: "connections" */ '@/pages/MyFavorites'));
const MyInterests = React.lazy(() => import(/* webpackChunkName: "connections" */ '@/pages/MyInterests'));
const InterestsReceived = React.lazy(() => import(/* webpackChunkName: "connections" */ '@/pages/InterestsReceived'));
const WhoViewedYou = React.lazy(() => import(/* webpackChunkName: "connections" */ '@/pages/WhoViewedYou'));
const YouViewed = React.lazy(() => import(/* webpackChunkName: "connections" */ '@/pages/YouViewed'));

// Import Profile browsing pages
const OnlineProfiles = React.lazy(() => import(/* webpackChunkName: "profiles" */ '@/pages/OnlineProfiles'));
const NewMembers = React.lazy(() => import(/* webpackChunkName: "profiles" */ '@/pages/NewMembers'));
const PhotoManagement = React.lazy(() => import(/* webpackChunkName: "profile" */ '@/pages/PhotoManagement'));

// Import More menu pages
const About = React.lazy(() => import(/* webpackChunkName: "about" */ '@/pages/About'));
const HowItWorks = React.lazy(() => import(/* webpackChunkName: "how-it-works" */ '@/pages/HowItWorks'));
const FreeVsPaid = React.lazy(() => import(/* webpackChunkName: "free-vs-paid" */ '@/pages/FreeVsPaid'));
const Plans = React.lazy(() => import(/* webpackChunkName: "plans" */ '@/pages/Plans'));
const Events = React.lazy(() => import(/* webpackChunkName: "events" */ '@/pages/Events'));
const Help = React.lazy(() => import(/* webpackChunkName: "help" */ '@/pages/Help'));
const SuccessStories = React.lazy(() => import(/* webpackChunkName: "success-stories" */ '@/pages/SuccessStories'));
const Account = React.lazy(() => import(/* webpackChunkName: "account" */ '@/pages/Account'));
const AstrologicalServices = React.lazy(() => import(/* webpackChunkName: "astrological-services" */ '@/pages/AstrologicalServices'));
const EventDetails = React.lazy(() => import(/* webpackChunkName: "events" */ '@/pages/EventDetails'));
const Admin = React.lazy(() => import(/* webpackChunkName: "admin" */ '@/pages/Admin'));

// Configure the query client with better caching strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Import the landing page
const Landing = React.lazy(() => import(/* webpackChunkName: "landing" */ '@/pages/Landing'));

// Home redirect component - shows landing page (no redirect for logged in users)
const HomeRedirect = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Landing />
    </Suspense>
  );
};

// Add a simple test component
const TestPage = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>Test Page Working!</h1>
      <p>If you can see this, React is working.</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ marginRight: '10px', padding: '10px', backgroundColor: 'blue', color: 'white', textDecoration: 'none' }}>
          Go to Login
        </a>
        <a href="/dashboard" style={{ padding: '10px', backgroundColor: 'green', color: 'white', textDecoration: 'none' }}>
          Try Dashboard
        </a>
      </div>
    </div>
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
  const { user } = useAuth();
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
                {/* Test Route */}
                <Route path="/test" element={<TestPage />} />
                
                {/* Public Routes - Auth pages share same chunk, no nested Suspense needed */}
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
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
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

const App = () => {
  return (
    <ErrorBoundary level="critical">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
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
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;