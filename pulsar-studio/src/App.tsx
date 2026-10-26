import { Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Button, EmptyState } from './components/ui';
import Composer from './pages/Composer';
import Dashboard from './pages/Dashboard';
import Presets from './pages/Presets';
import Projects from './pages/Projects';
import Samples from './pages/Samples';
import Settings from './pages/Settings';
import Studio, { StudioIndex } from './pages/Studio';
import { AudioLines, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[pulsar] render error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-lg">
            <EmptyState
              icon={<AudioLines className="h-5 w-5" />}
              title="The transport stopped unexpectedly"
              description={this.state.error.message || 'An unexpected rendering error occurred. Reload to reconnect to your session.'}
              action={
                <Button onClick={() => window.location.reload()} icon={<RefreshCw className="h-4 w-4" />}>
                  Reload studio
                </Button>
              }
            />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <EmptyState
        icon={<AudioLines className="h-5 w-5" />}
        title="That channel doesn’t exist"
        description="The page you were looking for has been muted. Head back to the overview to keep working."
        action={<Button onClick={() => navigate('/dashboard')}>Back to the studio</Button>}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/studio" element={<StudioIndex />} />
            <Route path="/studio/:id" element={<Studio />} />
            <Route path="/composer" element={<Composer />} />
            <Route path="/samples" element={<Samples />} />
            <Route path="/presets" element={<Presets />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
