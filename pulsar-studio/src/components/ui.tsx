import { clsx, type ClassValue } from 'clsx';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Info,
  Loader2,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { ProjectStatus } from '../lib/types';
import { STATUS_META } from '../lib/music';
import { useToastStore } from '../store/toast';

export const cn = (...args: ClassValue[]) => clsx(args);

/* ------------------------------------------------------------------ *
 *  Button
 * ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'subtle';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-acid-300 text-ink-950 hover:bg-acid-200 active:bg-acid-400 shadow-[0_0_30px_-12px_rgba(214,255,77,0.65)] font-semibold',
  secondary: 'bg-ink-700 text-ink-100 hover:bg-ink-650 border border-ink-600/80 active:bg-ink-600',
  ghost: 'text-ink-300 hover:text-ink-100 hover:bg-white/[0.06]',
  outline: 'border border-ink-600 text-ink-200 hover:border-ink-500 hover:bg-white/[0.03]',
  danger: 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
  subtle: 'bg-ink-800 text-ink-200 hover:bg-ink-750 border border-ink-700/60',
};

const SIZES: Record<ButtonSize, string> = {
  xs: 'h-7 gap-1.5 rounded-lg px-2.5 text-[11px]',
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-11 gap-2 rounded-xl px-5 text-sm',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'secondary', size = 'md', loading, icon, iconRight, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'focus-ring inline-flex select-none items-center justify-center whitespace-nowrap transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      {children}
      {iconRight}
    </button>
  );
});

export function IconButton({
  label,
  className,
  variant = 'ghost',
  size = 'sm',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; variant?: ButtonVariant; size?: 'xs' | 'sm' | 'md' }) {
  const dim = size === 'xs' ? 'h-7 w-7' : size === 'md' ? 'h-10 w-10' : 'h-8 w-8';
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'focus-ring inline-flex items-center justify-center rounded-lg transition-colors',
        dim,
        variant === 'ghost' ? 'text-ink-400 hover:bg-white/[0.06] hover:text-ink-100' : VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Inputs
 * ------------------------------------------------------------------ */

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn('field', className)} {...props} />;
  }
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn('field resize-none leading-relaxed', className)} {...props} />;
  }
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn('field appearance-none pr-9 [&>option]:bg-ink-800', className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
      </div>
    );
  }
);

export function Field({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="label-mono block">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[11px] text-rose-300">{error}</p>
      ) : hint ? (
        <p className="text-[11px] leading-relaxed text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="field h-9 rounded-xl pl-9 pr-8 text-xs"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-500 hover:text-ink-200"
          aria-label="Clear search"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function RangeInput({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  format,
  className,
  accent = '#d6ff4d',
}: {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  className?: string;
  accent?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="label-mono">{label}</span>
          <span className="font-mono text-[10px] text-ink-300">{format ? format(value) : Math.round(value * 100)}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={
          {
            '--range-fill': `${pct}%`,
            background: `linear-gradient(to right, ${accent} ${pct}%, #222836 ${pct}%)`,
          } as React.CSSProperties
        }
        className="w-full"
      />
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      {(label || description) && (
        <div className="min-w-0">
          {label && <div className="text-sm font-medium text-ink-100">{label}</div>}
          {description && <div className="mt-0.5 text-xs leading-relaxed text-ink-500">{description}</div>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'focus-ring relative mt-0.5 h-6 w-10 shrink-0 rounded-full border transition-colors duration-200',
          checked ? 'border-acid-300/50 bg-acid-300/90' : 'border-ink-600 bg-ink-700',
          disabled && 'cursor-not-allowed opacity-40'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-[18px] w-[18px] rounded-full bg-ink-950 shadow-sm transition-all duration-200',
            checked ? 'left-[19px]' : 'left-0.5'
          )}
        />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: {
  options: { value: T; label: React.ReactNode; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-xl border border-ink-700/70 bg-ink-900/70 p-0.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'focus-ring inline-flex items-center gap-1.5 rounded-[10px] font-medium transition-all',
            size === 'sm' ? 'h-7 px-2.5 text-[11px]' : 'h-8 px-3 text-xs',
            value === opt.value
              ? 'bg-ink-700 text-ink-100 shadow-sm'
              : 'text-ink-400 hover:text-ink-200'
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Knob
 * ------------------------------------------------------------------ */

export function Knob({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  format,
  size = 46,
  accent = '#d6ff4d',
  defaultValue,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  size?: number;
  accent?: string;
  defaultValue?: number;
}) {
  const drag = useRef<{ y: number; value: number } | null>(null);
  const norm = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;
  const offset = arc * (1 - norm);
  const angle = -135 + norm * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    drag.current = { y: e.clientY, value };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const delta = (drag.current.y - e.clientY) / 160;
    const span = max - min;
    const raw = drag.current.value + delta * span;
    const stepped = Math.round(raw / step) * step;
    onChange(Math.min(max, Math.max(min, Number(stepped.toFixed(4)))));
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => defaultValue != null && onChange(defaultValue)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') onChange(Math.min(max, value + step));
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') onChange(Math.max(min, value - step));
        }}
        className="focus-ring relative cursor-ns-resize touch-none rounded-full"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-[135deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#232936"
            strokeWidth={3}
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth={3}
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div
          className="absolute left-1/2 top-1/2 rounded-full border border-ink-600/80 bg-gradient-to-b from-ink-700 to-ink-850 shadow-inner"
          style={{ width: size - 16, height: size - 16, transform: 'translate(-50%, -50%)' }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[11px] w-[2px] origin-bottom rounded-full"
          style={{
            background: accent,
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            transformOrigin: '50% 100%',
            marginTop: 2,
          }}
        />
      </div>
      <div className="text-center">
        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-400">{label}</div>
        <div className="font-mono text-[10px] text-ink-200">{format ? format(value) : value.toFixed(2)}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Badges & status
 * ------------------------------------------------------------------ */

export function Badge({
  children,
  color,
  className,
  dot,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4',
        !color && 'border-ink-600/70 bg-ink-700/40 text-ink-300',
        className
      )}
      style={
        color
          ? { color, borderColor: `${color}38`, backgroundColor: `${color}14` }
          : undefined
      }
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color || '#94a3b8' }} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const meta = STATUS_META[status] || STATUS_META.sketch;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize leading-4',
        meta.bg,
        meta.border,
        meta.text,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-ink-600/80 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-ink-400">
      {children}
    </kbd>
  );
}

/* ------------------------------------------------------------------ *
 *  Modal / Drawer
 * ------------------------------------------------------------------ */

const ModalContext = createContext<{ onClose: () => void } | null>(null);

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return createPortal(
    <ModalContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6">
        <div
          className="fixed inset-0 bg-ink-950/75 backdrop-blur-[3px] animate-fade-in"
          onClick={onClose}
          aria-hidden
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          className={cn(
            'relative z-10 w-full animate-scale-in rounded-t-3xl border border-ink-700/80 bg-ink-850 shadow-lifted sm:rounded-2xl',
            widths[size],
            className
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-ink-700/60 px-5 py-4">
            <div>
              {title && (
                <h2 id={titleId} className="text-[15px] font-semibold tracking-tight text-ink-100">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-xs leading-relaxed text-ink-400">{description}</p>}
            </div>
            <IconButton label="Close" onClick={onClose} size="sm">
              <X className="h-4 w-4" />
            </IconButton>
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="flex items-center justify-end gap-2 border-t border-ink-700/60 px-5 py-3.5">{footer}</div>}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-xl',
  side = 'right',
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  side?: 'right' | 'bottom';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-[2px] animate-fade-in" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'absolute animate-slide-in-right border-ink-700/80 bg-ink-900 shadow-lifted',
          side === 'right'
            ? `right-0 top-0 flex h-full w-full flex-col border-l ${width}`
            : 'bottom-0 left-0 right-0 max-h-[82vh] rounded-t-2xl border-t'
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-ink-700/60 px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-ink-100">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[11px] text-ink-500">{subtitle}</p>}
          </div>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
        <p className="text-xs leading-relaxed text-ink-300">
          This action can’t be undone. Anything linked to this item will be removed from your session.
        </p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Empty / loading states
 * ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-ink-700/80 bg-ink-900/40 text-center',
        compact ? 'px-6 py-10' : 'px-8 py-16',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid-300/[0.04] blur-3xl" />
      {icon && (
        <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-ink-700 bg-ink-800/80 text-acid-300 shadow-glow">
          {icon}
        </div>
      )}
      <h3 className="relative text-sm font-semibold text-ink-100">{title}</h3>
      {description && <p className="relative mt-1.5 max-w-sm text-xs leading-relaxed text-ink-400">{description}</p>}
      {action && <div className="relative mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-lg bg-ink-750/80', className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin text-ink-400', className)} />;
}

export function PageLoader({ label = 'Loading session…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-ink-700" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-acid-300" />
        <span className="h-2 w-2 rounded-full bg-acid-300" />
      </div>
      <p className="text-xs text-ink-400">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Toasts
 * ------------------------------------------------------------------ */

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex animate-slide-in-right items-start gap-3 rounded-xl border border-ink-700/90 bg-ink-800/95 p-3.5 shadow-lifted backdrop-blur"
        >
          <span
            className={cn(
              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
              t.kind === 'success' && 'bg-acid-300/15 text-acid-300',
              t.kind === 'error' && 'bg-rose-500/15 text-rose-300',
              t.kind === 'info' && 'bg-sky-400/15 text-sky-300'
            )}
          >
            {t.kind === 'success' ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : t.kind === 'error' ? (
              <XCircle className="h-3.5 w-3.5" />
            ) : (
              <Info className="h-3.5 w-3.5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-ink-100">{t.title}</p>
            {t.description && <p className="mt-0.5 text-[11px] leading-relaxed text-ink-400">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="rounded p-1 text-ink-500 hover:text-ink-200" aria-label="Dismiss">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

/* ------------------------------------------------------------------ *
 *  Misc
 * ------------------------------------------------------------------ */

export function Dropdown({
  trigger,
  children,
  align = 'right',
  className,
  width = 'w-48',
}: {
  trigger: React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  align?: 'left' | 'right';
  className?: string;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setPos({ top: rect.bottom + 6, left: rect.left, right: Math.max(8, window.innerWidth - rect.right) });
      }
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={triggerRef} className={cn('relative', className)}>
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
      >
        {trigger}
      </div>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: Math.min(pos.top, window.innerHeight - 260),
              ...(align === 'right' ? { right: pos.right } : { left: Math.min(pos.left, window.innerWidth - 220) }),
            }}
            className={cn(
              'z-[80] max-h-[300px] overflow-y-auto animate-scale-in rounded-xl border border-ink-700 bg-ink-800/98 p-1 shadow-lifted backdrop-blur',
              width
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {typeof children === 'function' ? children(() => setOpen(false)) : children}
          </div>,
          document.body
        )}
    </div>
  );
}

export function DropdownItem({
  children,
  icon,
  onClick,
  danger,
  active,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
        danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-ink-300 hover:bg-white/[0.05] hover:text-ink-100',
        active && 'text-acid-300'
      )}
    >
      {icon && <span className="flex h-3.5 w-3.5 items-center justify-center opacity-80">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-ink-100">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[11px] text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-ink-700/60', className)} />;
}

export function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useClickOutside<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T | null>(null);
  const cb = useCallback(handler, [handler]);
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      cb();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [cb]);
  return ref;
}

export function CheckMark({ className }: { className?: string }) {
  return (
    <span className={cn('flex h-4 w-4 items-center justify-center rounded-full bg-acid-300 text-ink-950', className)}>
      <Check className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}
