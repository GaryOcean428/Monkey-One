import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import './index.css';
import styles from './styles/error.module.css';

// Add error boundary for the entire app
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className={styles.errorContainer}>
    <h1>Something went wrong</h1>
    <pre className={styles.errorMessage}>{error.message}</pre>
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Failed to find root element');
  document.body.innerHTML = `<div class="${styles.initError}">Failed to initialize application: Root element not found</div>`;
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <App />
        </React.Suspense>
      </ErrorBoundary>
    </React.StrictMode>
  );
}