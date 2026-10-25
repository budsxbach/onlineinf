import {
  AudioLines,
  FolderOpen,
  LayoutDashboard,
  Music2,
  Settings,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../../lib/hooks';
import { initials } from '../../lib/format';
import { cn, Skeleton } from '../ui';
import { Logo } from './Logo';

const CREATE = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Projects', to: '/projects', icon: FolderOpen },
  { label: 'Studio', to: '/studio', icon: AudioLines },
];

const LIBRARY = [
  { label: 'AI Composer', to: '/composer', icon: Sparkles, accent: true },
  { label: 'Samples', to: '/samples', icon: Music2 },
  { label: 'Presets', to: '/presets', icon: SlidersHorizontal },
];

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  accent,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof FolderOpen;
  end?: boolean;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-all duration-150',
          isActive
            ? 'bg-ink-750 text-ink-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]'
            : 'text-ink-400 hover:bg-white/[0.035] hover:text-ink-200'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-acid-300" />}
          <Icon
            className={cn(
              'h-[15px] w-[15px] transition-colors',
              isActive ? (accent ? 'text-acid-300' : 'text-ink-200') : 'text-ink-500 group-hover:text-ink-300',
              accent && !isActive && 'text-acid-300/70'
            )}
            strokeWidth={1.9}
          />
          <span className="truncate">{label}</span>
          {accent && (
            <span className="ml-auto rounded border border-acid-300/25 bg-acid-300/10 px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-acid-300">
              ai
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data: settings, isLoading } = useSettings();
  const displayName = (settings?.['user.displayName'] as string) || 'Producer';
  const studioName = (settings?.['user.studioName'] as string) || 'Pulsar Studio';
  const hasKey = !!settings?.['ai.hasKey'];
  const model = (settings?.['ai.model'] as string) || 'coding-router-preview';

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-3 pb-4 pt-2">
        <div className="space-y-1">
          <p className="label-mono px-3 pb-2">Session</p>
          {CREATE.map((item) => (
            <NavItem key={item.to} {...item} onClick={onNavigate} />
          ))}
        </div>
        <div className="space-y-1">
          <p className="label-mono px-3 pb-2">Create</p>
          {LIBRARY.map((item) => (
            <NavItem key={item.to} {...item} onClick={onNavigate} />
          ))}
        </div>
        <div className="space-y-1">
          <p className="label-mono px-3 pb-2">System</p>
          <NavItem to="/settings" label="Settings" icon={Settings} onClick={onNavigate} />
        </div>
      </nav>

      <div className="space-y-3 border-t border-ink-700/60 p-3">
        <div className="rounded-xl border border-ink-700/70 bg-ink-800/50 p-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-60', hasKey ? 'animate-ping bg-acid-300' : 'bg-amber-400')} />
              <span className={cn('relative inline-flex h-2 w-2 rounded-full', hasKey ? 'bg-acid-300' : 'bg-amber-400')} />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-300">
              {hasKey ? 'Arena router' : 'Local engine'}
            </span>
          </div>
          <p className="mt-1.5 truncate font-mono text-[10px] text-ink-500">
            {hasKey ? model : 'Add a key in Settings'}
          </p>
        </div>

        <NavLink
          to="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-transparent p-1.5 transition-colors hover:border-ink-700/70 hover:bg-ink-800/60"
        >
          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-600 bg-gradient-to-br from-ink-650 to-ink-800 text-[11px] font-semibold text-acid-200">
              {initials(displayName) || 'P'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-ink-100">{displayName}</p>
            <p className="truncate text-[10px] text-ink-500">{studioName}</p>
          </div>
          <Settings className="h-3.5 w-3.5 text-ink-600" />
        </NavLink>
      </div>
    </div>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div className="absolute left-0 top-0 h-full w-[268px] animate-[slide-in-left_0.28s_cubic-bezier(0.22,1,0.36,1)_both] border-r border-ink-700/80 bg-ink-900 shadow-lifted">
        <button
          onClick={onClose}
          className="absolute right-3 top-4 rounded-lg p-1.5 text-ink-500 hover:bg-white/5 hover:text-ink-200"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}
