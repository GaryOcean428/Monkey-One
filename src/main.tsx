import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add error boundary for the entire app
const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Something went wrong</h1>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Failed to find root element');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Failed to initialize application: Root element not found</div>';
} else {
  console.log('Starting application initialization...');
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <React.Suspense fallback={<div>Loading...</div>}>
        <App />
      </React.Suspense>
    </React.StrictMode>
  );
  console.log('Application rendered successfully');
}