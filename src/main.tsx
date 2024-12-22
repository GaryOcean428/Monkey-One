import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeFirebase } from './lib/firebase';
import './index.css';

// Initialize Firebase before rendering
initializeFirebase().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch(error => {
  console.error('Failed to start application:', error);
  // Optionally render an error screen
});