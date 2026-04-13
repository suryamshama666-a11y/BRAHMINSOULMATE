// Global type declarations
/* eslint-disable no-var */

declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, options?: { contexts?: { react?: { componentStack?: string } } }) => string;
      setTag?: (key: string, value: string) => void;
      setContext?: (key: string, context: Record<string, unknown>) => void;
    };
  }

  // Global logger utility
  var logger: {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    log: (...args: unknown[]) => void;
  };
}

export {};
