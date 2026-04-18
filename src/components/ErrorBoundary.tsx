/* eslint-disable react-refresh/only-export-components */
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { logger } from '@/utils/logger';

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
  eventId?: string | null;
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
    logger.error('Critical Error caught by Page Boundary', error, { 
      stack: errorInfo.componentStack ?? undefined 
    });

    this.props.onError?.(error, errorInfo);

    const sentry = (window as any).Sentry;
    if (sentry) {
      const eventId = sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack ?? undefined } }
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
              <Card className="w-full max-w-md shadow-xl border-red-100">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-pulse-gentle">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-800 font-serif">System Error</CardTitle>
                  <CardDescription className="text-gray-600">
                    We've encountered a critical issue. Our team has been notified.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-3">
                    <Button onClick={this.handleReload} className="w-full bg-red-600 hover:bg-red-700 shadow-md">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reload Application
                    </Button>
                    <Button variant="outline" onClick={this.handleGoHome} className="w-full border-red-200 text-red-700 hover:bg-red-50">
                      <Home className="w-4 h-4 mr-2" />
                      Return to Homepage
                    </Button>
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <details className="text-xs bg-gray-50 p-3 rounded border border-gray-200">
                      <summary className="cursor-pointer font-medium text-gray-500 hover:text-gray-900 transition-colors">Developer Details</summary>
                      <pre className="mt-2 text-red-600 overflow-auto whitespace-pre-wrap max-h-40">
                        {error?.message}
                        {errorInfo?.componentStack}
                      </pre>
                    </details>
                  )}
                  
                  {eventId && (
                    <p className="text-xs text-gray-400 text-center">
                      Reference ID: {eventId}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          );

        case 'page':
          return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
              <EmptyState
                variant="error"
                title="Unable to Load Page"
                description="We ran into a slight problem loading this content."
                actionLabel="Try Again"
                onAction={this.handleRetry}
              />
            </div>
          );

        case 'component':
        default:
          return (
            <div className="p-4 border border-red-100 bg-red-50/50 rounded-xl flex flex-col items-center text-center space-y-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-600 font-medium">
                Content unavailable
              </p>
              <Button
                onClick={this.handleRetry}
                size="sm"
                variant="ghost"
                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-100 h-7"
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

export default ErrorBoundary;