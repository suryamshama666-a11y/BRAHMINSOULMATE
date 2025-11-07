import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  eventId?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to Sentry if available
    if (window.Sentry) {
      const eventId = window.Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } }
      });
      this.setState({ errorInfo, eventId });
    } else {
      this.setState({ errorInfo });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey)) {
        this.resetErrorBoundary();
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = (): void => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({ hasError: false, error: undefined, errorInfo: undefined, eventId: undefined });
  };

  handleRetry = (): void => {
    this.resetErrorBoundary();
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, eventId } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Different UI based on error level
      switch (level) {
        case 'critical':
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <CardTitle className="text-red-600">Critical Error</CardTitle>
                  <CardDescription>
                    The application encountered a critical error and needs to be restarted.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {process.env.NODE_ENV === 'development' && (
                    <details className="text-sm bg-gray-100 p-3 rounded">
                      <summary className="cursor-pointer font-medium">Error Details</summary>
                      <pre className="mt-2 text-xs overflow-auto">
                        {error?.message}
                        {errorInfo?.componentStack}
                      </pre>
                    </details>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={this.handleReload} className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reload App
                    </Button>
                    <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Button>
                  </div>
                  {eventId && (
                    <p className="text-xs text-gray-500 text-center">
                      Error ID: {eventId}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          );

        case 'page':
          return (
            <div className="min-h-[400px] flex items-center justify-center p-8">
              <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-orange-600">Page Error</CardTitle>
                  <CardDescription>
                    This page encountered an error. Please try refreshing or go back.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {process.env.NODE_ENV === 'development' && (
                    <details className="text-sm bg-gray-100 p-3 rounded">
                      <summary className="cursor-pointer font-medium">Error Details</summary>
                      <pre className="mt-2 text-xs overflow-auto">
                        {error?.message}
                      </pre>
                    </details>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={this.handleRetry} variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button onClick={() => window.history.back()} className="flex-1">
                      Go Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );

        case 'component':
        default:
          return (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium text-sm">Component Error</span>
              </div>
              <p className="text-sm text-red-600 mb-3">
                This component failed to load properly.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="text-xs bg-white p-2 rounded border mb-3">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-1 overflow-auto">
                    {error?.message}
                  </pre>
                </details>
              )}
              <Button
                onClick={this.handleRetry}
                size="sm"
                variant="outline"
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          );
      }
    }

    return children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for manual error reporting
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Manual error report:', error, errorInfo);

    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: errorInfo ? { react: { componentStack: errorInfo.componentStack } } : undefined
      });
    }
  }, []);
};

export default ErrorBoundary;