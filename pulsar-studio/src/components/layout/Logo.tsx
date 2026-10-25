import { cn } from '../ui';

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  const bars = [9, 15, 11, 18, 7];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative flex h-9 w-9 shrink-0 items-end justify-center gap-[3px] overflow-hidden rounded-xl border border-ink-600/70 bg-ink-800 px-[7px] py-2 shadow-glow">
        <span className="absolute inset-0 bg-gradient-to-br from-acid-300/20 via-transparent to-transparent" />
        {bars.map((h, i) => (
          <span
            key={i}
            className="relative w-[2.5px] rounded-full bg-acid-300"
            style={{ height: h, opacity: 0.55 + i * 0.09 }}
          />
        ))}
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-[13px] font-semibold tracking-[0.2em] text-ink-100">PULSAR</div>
          <div className="mt-1 text-[8.5px] font-medium uppercase tracking-[0.32em] text-ink-500">beat lab</div>
        </div>
      )}
    </div>
  );
}
