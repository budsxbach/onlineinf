import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { queryClient } from './lib/queryClient';
import { ToastViewport } from './components/ui';
import { engine } from './lib/engine';
// Self-hosted Inter (latin subset covers German umlauts and the euro sign) so
// the studio never waits on an external font CDN — it must work fully offline.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';

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
