import React from 'react';

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
