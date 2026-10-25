import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { queryClient } from './lib/queryClient';
import { ToastViewport } from './components/ui';
import { engine } from './lib/engine';

// Touch the audio engine lazily; it only constructs an AudioContext after a gesture.
void engine;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastViewport />
    </QueryClientProvider>
  </React.StrictMode>
);
