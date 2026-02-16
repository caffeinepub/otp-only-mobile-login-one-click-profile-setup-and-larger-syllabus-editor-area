import { lazy, Suspense, useMemo, useState, useEffect, Component, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetSessionState } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = lazy(() => import('./pages/HomePage'));
const MockTestsPage = lazy(() => import('./pages/MockTestsPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const SyllabusPage = lazy(() => import('./pages/SyllabusPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'));

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        if (error instanceof Error && (
          error.message.includes('Invalid') ||
          error.message.includes('already exists') ||
          error.message.includes('Unauthorized')
        )) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: 1000,
    },
  },
});

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-primary/5 to-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <AlertCircle className="h-16 w-16 text-red-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
            <p className="text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="w-full bg-red-primary hover:bg-red-dark"
            >
              Return to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { identity, isInitializing, login } = useInternetIdentity();
  
  // Critical: Use backend session state for authentication instead of Internet Identity
  const { data: sessionState, isLoading: sessionLoading } = useGetSessionState();
  const isAuthenticated = sessionState?.isAuthenticated || false;
  const isAdmin = sessionState?.role === 'admin';
  
  // Profile setup modal: show when authenticated but profile is missing or incomplete
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && (userProfile === null || (userProfile && !userProfile.profileComplete));
  
  // Initialize page from URL path on mount, then use state
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const path = window.location.pathname.slice(1) || 'home';
    const validPages: Page[] = ['home', 'mock-tests', 'courses', 'syllabus', 'progress', 'profile', 'admin', 'payment-success', 'payment-failure'];
    return validPages.includes(path as Page) ? (path as Page) : 'home';
  });

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    // Update URL without reload for better UX and deployment compatibility
    const newPath = page === 'home' ? '/' : `/${page}`;
    window.history.pushState({}, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginClick = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Sync state with browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1) || 'home';
      const validPages: Page[] = ['home', 'mock-tests', 'courses', 'syllabus', 'progress', 'profile', 'admin', 'payment-success', 'payment-failure'];
      if (validPages.includes(path as Page)) {
        setCurrentPage(path as Page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && currentPage !== 'home') {
      setCurrentPage('home');
      window.history.pushState({}, '', '/');
    }
  }, [isAuthenticated, currentPage]);

  // Show loading while checking session state
  if (isInitializing || sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-accent/5 to-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-blue-accent mx-auto" />
          <p className="text-lg text-muted-foreground font-medium">Loading Exam Xpresss...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    try {
      switch (currentPage) {
        case 'home':
          return <HomePage onNavigate={handleNavigate} onLoginClick={handleLoginClick} isAuthenticated={isAuthenticated} />;
        case 'mock-tests':
          return <MockTestsPage onNavigate={handleNavigate} />;
        case 'courses':
          return <CoursesPage onNavigate={handleNavigate} />;
        case 'syllabus':
          return <SyllabusPage onNavigate={handleNavigate} />;
        case 'progress':
          return <ProgressPage onNavigate={handleNavigate} />;
        case 'profile':
          return <ProfilePage />;
        case 'admin':
          return <AdminPanel onNavigate={handleNavigate} />;
        case 'payment-success':
          return <PaymentSuccess onNavigate={handleNavigate} />;
        case 'payment-failure':
          return <PaymentFailure onNavigate={handleNavigate} />;
        default:
          return <HomePage onNavigate={handleNavigate} onLoginClick={handleLoginClick} isAuthenticated={isAuthenticated} />;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-primary mx-auto" />
            <h2 className="text-2xl font-bold text-red-primary">Something went wrong</h2>
            <p className="text-muted-foreground">Please try refreshing the page or go back to home.</p>
            <Button
              onClick={() => handleNavigate('home')}
              className="px-6 py-2 bg-red-primary hover:bg-red-dark"
            >
              Go to Home
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Header 
          currentPage={currentPage} 
          onNavigate={handleNavigate} 
          onLoginClick={handleLoginClick}
          isAdmin={isAdmin}
        />
        <main className="flex-1">
          <ErrorBoundary
            fallback={
              <div className="container mx-auto px-4 py-8">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-red-primary mx-auto" />
                  <h2 className="text-2xl font-bold">Page Error</h2>
                  <p className="text-muted-foreground">This page encountered an error.</p>
                  <Button onClick={() => handleNavigate('home')} className="bg-red-primary hover:bg-red-dark">
                    Return to Home
                  </Button>
                </div>
              </div>
            }
          >
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-accent" />
              </div>
            }>
              {renderPage()}
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer onNavigate={handleNavigate} />
        <Toaster position="top-right" richColors closeButton />
        
        {/* Profile Setup Modal - shown when authenticated but profile incomplete */}
        {showProfileSetup && <ProfileSetupModal />}
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
