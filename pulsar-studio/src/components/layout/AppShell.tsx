import { Database, Menu, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Kbd } from '../ui';
import { CommandPalette } from './CommandPalette';
import { MobileSidebar, SidebarContent } from './Sidebar';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Overview', subtitle: 'Your studio at a glance' },
  '/projects': { title: 'Projects', subtitle: 'Every session in the vault' },
  '/studio': { title: 'Studio', subtitle: 'Sequencer, mixer & instruments' },
  '/composer': { title: 'AI Composer', subtitle: 'Describe it, hear it, refine it' },
  '/samples': { title: 'Samples', subtitle: 'One-shots, loops & textures' },
  '/presets': { title: 'Presets', subtitle: 'Saved instrument recipes' },
  '/settings': { title: 'Settings', subtitle: 'Arena key, studio & storage' },
};

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const base = `/${location.pathname.split('/')[1] || 'dashboard'}`;
  const meta = TITLES[base] || TITLES['/dashboard'];
  const isStudio = base === '/studio';

  return (
    <div className="flex min-h-screen bg-ink-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-ink-700/60 bg-ink-900/60 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-ink-700/50 bg-ink-950/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="focus-ring -ml-1 rounded-lg p-2 text-ink-400 hover:bg-white/5 hover:text-ink-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold tracking-tight text-ink-100">{meta.title}</h1>
                {isStudio && (
                  <span className="hidden rounded border border-ink-700 bg-ink-800/70 px-1.5 py-px text-[9px] uppercase tracking-widest text-ink-500 sm:inline">
                    live
                  </span>
                )}
              </div>
              <p className="hidden truncate text-[11px] text-ink-500 sm:block">{meta.subtitle}</p>
            </div>

            <div className="hidden items-center gap-2 rounded-lg border border-ink-700/60 bg-ink-900/60 px-2.5 py-1.5 xl:flex">
              <Database className="h-3 w-3 text-emerald-400/80" />
              <span className="text-[10px] font-medium text-ink-400">SQLite · persisted</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400/80" />
            </div>

            <button
              onClick={() => setPaletteOpen(true)}
              className="group flex h-9 items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/70 px-3 text-xs text-ink-500 transition-colors hover:border-ink-600 hover:text-ink-300 sm:w-56"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden flex-1 text-left sm:inline">Search anything…</span>
              <span className="hidden items-center gap-1 sm:flex">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </span>
            </button>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" strokeWidth={2.6} />}
              onClick={() => navigate('/projects?new=1')}
              className="hidden sm:inline-flex"
            >
              New project
            </Button>
          </div>
        </header>

        <main className="relative min-w-0 flex-1 pb-16">
          <Outlet />
        </main>
      </div>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
