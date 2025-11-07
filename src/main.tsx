import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
const dsn = import.meta.env.VITE_SENTRY_DSN;
const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
const release = import.meta.env.VITE_SENTRY_RELEASE || '0.0.0';
const enableReplay = import.meta.env.VITE_SENTRY_REPLAY === '1';

if (dsn) {
  (async () => {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      environment,
      release,
      integrations: [
        Sentry.browserTracingIntegration(),
        ...(enableReplay ? [Sentry.replayIntegration({ maskAllText: false, blockAllMedia: true })] : []),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: enableReplay ? 0.0 : 0.0,
      replaysOnErrorSampleRate: enableReplay ? 1.0 : 0.0,
    });
  })();
}

// Create the root element
const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
