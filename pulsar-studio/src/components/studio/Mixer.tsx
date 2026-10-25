import { Headphones, Volume2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { engine } from '../../lib/engine';
import { clamp, colorOf, INSTRUMENTS } from '../../lib/music';
import { useStudioStore } from '../../store/studio';
import { cn, Knob } from '../ui';

function Meter({ index, master = false }: { index?: number; master?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const peakRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let peak = 0;
    let peakAt = 0;
    const loop = () => {
      const level = master ? engine.masterLevel : engine.levels()[index ?? 0] || 0;
      if (level > peak) {
        peak = level;
        peakAt = performance.now();
      }
      if (performance.now() - peakAt > 900) peak = Math.max(level, peak - 0.006);
      if (ref.current) ref.current.style.transform = `scaleY(${Math.min(1, level * 1.5)})`;
      if (peakRef.current) peakRef.current.style.bottom = `${Math.min(99, peak * 145)}%`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [index, master]);
  return (
    <div className="relative h-[132px] w-[7px] overflow-hidden rounded-full bg-ink-800">
      <div
        ref={ref}
        className="absolute inset-0 origin-bottom rounded-full bg-gradient-to-t from-emerald-400 via-acid-300 to-rose-400"
        style={{ transform: 'scaleY(0)' }}
      />
      <div ref={peakRef} className="absolute inset-x-0 h-px bg-white/80" style={{ bottom: 0 }} />
    </div>
  );
}

function Fader({
  value,
  max = 1.5,
  onChange,
  color,
}: {
  value: number;
  max?: number;
  onChange: (v: number) => void;
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const set = (clientY: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = 1 - (clientY - rect.top) / rect.height;
    onChange(Math.round(clamp(ratio * max, 0, max) * 100) / 100);
  };
  const pct = (value / max) * 100;
  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        set(e.clientY);
      }}
      onPointerMove={(e) => dragging.current && set(e.clientY)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      className="relative h-[132px] w-7 cursor-ns-resize touch-none select-none"
      role="slider"
      aria-label="Volume"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') onChange(clamp(value + 0.05, 0, max));
        if (e.key === 'ArrowDown') onChange(clamp(value - 0.05, 0, max));
      }}
    >
      <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-ink-800" />
      <div
        className="absolute bottom-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full"
        style={{ height: `${pct}%`, background: `${color}bb` }}
      />
      {[0, 25, 50, 75, 100].map((t) => (
        <div key={t} className="absolute left-1/2 h-px w-1.5 -translate-x-1/2 bg-ink-600/70" style={{ bottom: `${t}%` }} />
      ))}
      <div
        className="absolute left-1/2 h-2.5 w-6 -translate-x-1/2 rounded-sm border border-ink-500 bg-gradient-to-b from-ink-650 to-ink-800 shadow"
        style={{ bottom: `calc(${pct}% - 5px)` }}
      >
        <div className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2" style={{ background: color }} />
      </div>
    </div>
  );
}

export function Mixer() {
  const { project, updateProject, selectedTrackId, selectTrack, updateTrack } = useStudioStore();
  if (!project) return null;
  const tracks = project.tracks || [];

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink-700/50 px-3 py-2">
        <span className="label-mono">Mixer</span>
        <span className="rounded border border-ink-700/70 bg-ink-800/60 px-1.5 py-px font-mono text-[9px] text-ink-500">
          {tracks.length} channels
        </span>
        <span className="hidden text-[10px] text-ink-600 sm:inline">Drag faders · meters show live signal while the transport runs</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-ink-500">
          <Headphones className="h-3 w-3" />
          master {Math.round((project.master_gain ?? 0.85) * 100)}%
        </span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto p-3">
        {tracks.length === 0 && (
          <div className="flex h-40 w-full items-center justify-center text-xs text-ink-500">
            No channels yet — add an instrument in the sequencer.
          </div>
        )}
        {tracks.map((track) => {
          const color = colorOf(track.color);
          const selected = track.id === selectedTrackId;
          return (
            <div
              key={track.id}
              onClick={() => selectTrack(track.id)}
              className={cn(
                'group flex w-[106px] shrink-0 cursor-pointer flex-col gap-2 rounded-xl border p-2 transition-colors',
                selected ? 'border-acid-300/30 bg-ink-800/70' : 'border-ink-700/60 bg-ink-900/40 hover:border-ink-600'
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-ink-200">{track.name}</span>
              </div>
              <p className="truncate text-[8px] uppercase tracking-wider text-ink-600">
                {INSTRUMENTS[track.instrument]?.label || track.instrument}
              </p>
              <div className="flex items-end justify-center gap-1.5">
                <Meter index={tracks.indexOf(track)} />
                <Fader value={track.volume} onChange={(v) => updateTrack(track.id, { volume: v })} color={color} />
              </div>
              <div className="flex items-center justify-center">
                <Knob
                  label="Pan"
                  value={track.pan}
                  min={-1}
                  max={1}
                  onChange={(v) => updateTrack(track.id, { pan: v })}
                  format={(v) => (Math.abs(v) < 0.02 ? 'C' : `${v < 0 ? 'L' : 'R'}${Math.round(Math.abs(v) * 100)}`)}
                  size={34}
                  accent={color}
                  defaultValue={0}
                />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrack(track.id, { mute: !track.mute });
                  }}
                  className={cn(
                    'h-5 flex-1 rounded text-[8px] font-bold uppercase tracking-wider transition-colors',
                    track.mute ? 'bg-rose-500/20 text-rose-300' : 'bg-ink-800 text-ink-500 hover:text-ink-200'
                  )}
                >
                  mute
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrack(track.id, { solo: !track.solo });
                  }}
                  className={cn(
                    'h-5 flex-1 rounded text-[8px] font-bold uppercase tracking-wider transition-colors',
                    track.solo ? 'bg-acid-300/20 text-acid-300' : 'bg-ink-800 text-ink-500 hover:text-ink-200'
                  )}
                >
                  solo
                </button>
              </div>
              <div className="flex justify-between text-[8px] text-ink-600">
                <span>R {Math.round(track.reverb_send * 100)}</span>
                <span>D {Math.round(track.delay_send * 100)}</span>
              </div>
            </div>
          );
        })}

        <div className="flex w-[132px] shrink-0 flex-col gap-2 rounded-xl border border-acid-300/20 bg-acid-300/[0.035] p-2">
          <div className="flex items-center gap-1.5">
            <Volume2 className="h-3 w-3 text-acid-300" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-acid-200">Master</span>
          </div>
          <p className="text-[8px] uppercase tracking-wider text-ink-600">limiter · -9 dB</p>
          <div className="flex items-end justify-center gap-2">
            <Meter master />
            <Fader value={project.master_gain ?? 0.85} max={1.2} onChange={(v) => updateProject({ master_gain: v })} color="#d6ff4d" />
            <Meter master />
          </div>
          <div className="rounded-md border border-ink-700/60 bg-ink-900/60 px-1.5 py-1 text-center font-mono text-[9px] text-ink-400">
            {(project.master_gain ?? 0.85).toFixed(2)}
          </div>
          <div className="flex justify-between text-[8px] text-ink-600">
            <span>{project.bpm} bpm</span>
            <span>{project.tracks?.length ?? 0} trk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
