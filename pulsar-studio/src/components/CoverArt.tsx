import { cn } from './ui';

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const THEMES: Record<string, { a: string; b: string; base: string; shape: 'orb' | 'sun' | 'monolith' | 'glass' | 'waves' | 'rings' }> = {
  nebula: { a: '#a78bfa', b: '#5eead4', base: '#0b0b1a', shape: 'orb' },
  sunset: { a: '#fb923c', b: '#f43f5e', base: '#1a0b10', shape: 'sun' },
  monolith: { a: '#d6ff4d', b: '#38bdf8', base: '#0a0c0a', shape: 'monolith' },
  glass: { a: '#5eead4', b: '#818cf8', base: '#071014', shape: 'glass' },
  ember: { a: '#fb7185', b: '#fbbf24', base: '#170a0a', shape: 'waves' },
  tidal: { a: '#38bdf8', b: '#34d399', base: '#06101a', shape: 'waves' },
  rings: { a: '#e879f9', b: '#a78bfa', base: '#0f0818', shape: 'rings' },
};

export function CoverArt({
  theme = 'nebula',
  hue = 220,
  seed = 'pulsar',
  className,
  children,
  showGrid = true,
}: {
  theme?: string;
  hue?: number;
  seed?: string;
  className?: string;
  children?: React.ReactNode;
  showGrid?: boolean;
}) {
  const t = THEMES[theme] || THEMES.nebula;
  const h = hash(seed);
  const hueA = hue || h % 360;
  const hueB = (hueA + 54 + (h % 60)) % 360;
  const accentA = `hsl(${hueA} 82% 62%)`;
  const accentB = `hsl(${hueB} 78% 58%)`;
  const shift = (h % 30) - 15;

  return (
    <div
      className={cn('grain relative overflow-hidden', className)}
      style={{ background: `radial-gradient(120% 120% at 20% 0%, ${t.base}, #05060a 75%)` }}
    >
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(ellipse at 50% 40%, black, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black, transparent 78%)',
          }}
        />
      )}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]">
        {t.shape === 'orb' && (
          <>
            <div
              className="absolute left-[14%] top-[18%] h-[52%] w-[52%] rounded-full opacity-70 blur-2xl"
              style={{ background: `radial-gradient(circle, ${accentA}, transparent 65%)` }}
            />
            <div
              className="absolute bottom-[4%] right-[6%] h-[58%] w-[58%] rounded-full opacity-60 blur-2xl"
              style={{ background: `radial-gradient(circle, ${accentB}, transparent 68%)` }}
            />
            <div
              className="absolute left-[30%] top-[26%] h-[44%] w-[44%] rounded-full border opacity-40"
              style={{ borderColor: `${accentA}55` }}
            />
            <div
              className="absolute left-[38%] top-[34%] h-[28%] w-[28%] rounded-full border opacity-25"
              style={{ borderColor: `${accentB}55` }}
            />
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-px w-px rounded-full bg-white"
                style={{
                  left: `${(hash(`${seed}${i}`) % 92) + 4}%`,
                  top: `${(hash(`${seed}x${i}`) % 88) + 6}%`,
                  opacity: 0.25 + ((hash(`${seed}o${i}`) % 50) / 100),
                }}
              />
            ))}
          </>
        )}

        {t.shape === 'sun' && (
          <>
            <div
              className="absolute left-1/2 top-[42%] h-[42%] w-[42%] -translate-x-1/2 rounded-full"
              style={{ background: `linear-gradient(180deg, ${accentB}, ${accentA})`, filter: 'blur(1px)' }}
            />
            <div className="absolute inset-x-0 top-[52%] h-[1px] bg-black/40" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute left-0 right-0 bg-black/55"
                style={{ top: `${56 + i * 7}%`, height: `${1 + i * 0.7}%`, opacity: 0.8 }}
              />
            ))}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(0deg, ${t.base} 8%, transparent 60%)` }}
            />
          </>
        )}

        {t.shape === 'monolith' && (
          <>
            <div
              className="absolute left-1/2 top-1/2 h-[62%] w-[34%] -translate-x-1/2 -translate-y-1/2 rotate-[8deg] rounded-sm border border-white/10"
              style={{ background: `linear-gradient(160deg, #14161b, #05060a 70%)`, boxShadow: `0 0 60px ${accentA}22` }}
            />
            <div
              className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 opacity-70 blur-[1px]"
              style={{ background: `linear-gradient(180deg, transparent, ${accentA}, transparent)` }}
            />
            <div
              className="absolute bottom-[12%] left-[14%] h-[1px] w-[72%]"
              style={{ background: `linear-gradient(90deg, transparent, ${accentB}88, transparent)` }}
            />
          </>
        )}

        {t.shape === 'glass' && (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute rounded-lg border border-white/10 backdrop-blur-[1px]"
                style={{
                  width: `${34 + i * 12}%`,
                  height: `${56 + i * 6}%`,
                  left: `${8 + i * 19}%`,
                  top: `${10 + i * 9}%`,
                  transform: `rotate(${shift + i * 9}deg)`,
                  background: `linear-gradient(140deg, ${i % 2 ? accentB : accentA}30, transparent 70%)`,
                }}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        )}

        {t.shape === 'waves' && (
          <svg viewBox="0 0 300 180" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id={`g-${seed}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={accentA} stopOpacity="0.9" />
                <stop offset="100%" stopColor={accentB} stopOpacity="0.55" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M0 ${120 + i * 14} C 60 ${70 + i * 12}, 110 ${150 + i * 4}, 170 ${96 + i * 10} S 250 ${122 + i * 8}, 300 ${84 + i * 12}`}
                fill="none"
                stroke={`url(#g-${seed})`}
                strokeWidth={i === 0 ? 2 : 1}
                opacity={0.38 - i * 0.07}
              />
            ))}
            <circle cx="222" cy="52" r="26" fill={`url(#g-${seed})`} opacity="0.55" />
            <circle cx="222" cy="52" r="34" fill="none" stroke={accentA} strokeOpacity="0.25" />
          </svg>
        )}

        {t.shape === 'rings' && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                style={{
                  width: `${34 + i * 16}%`,
                  height: `${34 + i * 16}%`,
                  borderColor: i % 2 ? `${accentB}44` : `${accentA}44`,
                  transform: `translate(-50%,-50%) rotate(${shift + i * 6}deg)`,
                  borderRadius: i % 2 ? '48% 52% 60% 40%' : '50%',
                }}
              />
            ))}
            <div
              className="absolute left-1/2 top-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
              style={{ background: accentA }}
            />
          </>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
      {children}
    </div>
  );
}

export function MiniWave({ seed = 'pulsar', bars = 28, className, color = '#d6ff4d' }: { seed?: string; bars?: number; className?: string; color?: string }) {
  const h = hash(seed);
  return (
    <div className={cn('flex h-6 items-center gap-[2px]', className)}>
      {Array.from({ length: bars }).map((_, i) => {
        const value = 0.18 + ((hash(`${seed}${i}`) % 100) / 100) * 0.82;
        const shaped = Math.abs(Math.sin(((h % 17) + i) * 0.7)) * 0.5 + value * 0.5;
        return (
          <span
            key={i}
            className="w-[2px] shrink-0 rounded-full"
            style={{ height: `${Math.max(10, shaped * 100)}%`, background: color, opacity: 0.28 + shaped * 0.62 }}
          />
        );
      })}
    </div>
  );
}
