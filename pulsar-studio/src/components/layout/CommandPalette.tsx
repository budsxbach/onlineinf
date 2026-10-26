import {
  AudioLines,
  FolderOpen,
  LayoutDashboard,
  Library,
  Music2,
  Plus,
  Settings,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../lib/hooks';
import { pushRecentProject, readRecentProjects } from '../../lib/format';
import { cn, Kbd } from '../ui';

const NAV = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, hint: 'Session stats & recent work' },
  { label: 'Projects', to: '/projects', icon: FolderOpen, hint: 'All sessions' },
  { label: 'Studio', to: '/studio', icon: AudioLines, hint: 'Sequencer, mixer & piano roll' },
  { label: 'AI Composer', to: '/composer', icon: Sparkles, hint: 'Generate a new idea' },
  { label: 'Samples', to: '/samples', icon: Music2, hint: 'Sample library' },
  { label: 'Presets', to: '/presets', icon: SlidersHorizontal, hint: 'Synth presets' },
  { label: 'Settings', to: '/settings', icon: Settings, hint: 'Arena key & studio prefs' },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data: projects } = useProjects({});
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    setRecent(readRecentProjects());
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const q = query.trim().toLowerCase();
  const navResults = useMemo(() => NAV.filter((n) => !q || n.label.toLowerCase().includes(q)), [q]);
  const projectResults = useMemo(() => {
    if (!projects) return [];
    const sorted = [...projects].sort((a, b) => {
      const ai = recent.indexOf(a.id);
      const bi = recent.indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return sorted
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.genre.toLowerCase().includes(q))
      .slice(0, 6);
  }, [projects, q, recent]);

  const items = useMemo(
    () => [
      ...navResults.map((n) => ({ kind: 'nav' as const, id: n.to, label: n.label, hint: n.hint, icon: n.icon, to: n.to })),
      ...projectResults.map((p) => ({
        kind: 'project' as const,
        id: p.id,
        label: p.title,
        hint: `${p.genre} · ${p.bpm} BPM`,
        icon: Library,
        to: `/studio/${p.id}`,
      })),
    ],
    [navResults, projectResults]
  );

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, items.length - 1)));
  }, [items.length]);

  if (!open) return null;

  const go = (index: number) => {
    const item = items[index];
    if (!item) return;
    onClose();
    if (item.kind === 'project') {
      pushRecentProject(item.id);
      navigate(`/studio/${item.id}`);
    } else {
      navigate(item.to);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-ink-700 bg-ink-850 shadow-lifted">
        <div className="flex items-center gap-3 border-b border-ink-700/70 px-4 py-3">
          <Music2 className="h-4 w-4 text-acid-300" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(items.length - 1, a + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                go(active);
              }
            }}
            placeholder="Jump to a project or page…"
            className="flex-1 bg-transparent text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
          />
          <Kbd>ESC</Kbd>
        </div>
        <div className="max-h-[46vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-ink-500">No matches. Try a project name or page.</div>
          )}
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.kind}-${item.id}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(index)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                  active === index ? 'bg-ink-750 text-ink-100' : 'text-ink-300 hover:bg-ink-800'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg border',
                    active === index
                      ? 'border-acid-300/30 bg-acid-300/10 text-acid-300'
                      : 'border-ink-700 bg-ink-800 text-ink-400'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{item.label}</span>
                  <span className="block truncate text-[10px] text-ink-500">{item.hint}</span>
                </span>
                {item.kind === 'nav' ? (
                  <span className="text-[9px] uppercase tracking-widest text-ink-600">page</span>
                ) : (
                  <Kbd>open</Kbd>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-ink-700/60 px-4 py-2 text-[10px] text-ink-500">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
            <span className="mx-1 text-ink-700">·</span>
            <Kbd>↵</Kbd> open
          </span>
          <button onClick={onClose} className="flex items-center gap-1 text-ink-500 hover:text-ink-200">
            <Plus className="h-3 w-3 rotate-45" /> close
          </button>
        </div>
      </div>
    </div>
  );
}
