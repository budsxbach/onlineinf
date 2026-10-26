import {
  ChevronDown,
  ChevronUp,
  Circle,
  Gauge,
  Headphones,
  Pause,
  Play,
  Plus,
  Repeat,
  Square,
  Volume2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { engine } from '../../lib/engine';
import { clamp } from '../../lib/music';
import { useStudioStore } from '../../store/studio';
import { transport, useTransport } from '../../store/transport';
import type { Bank } from '../../lib/types';
import { Button, IconButton, Kbd, Segmented, cn } from '../ui';

const BANKS: Bank[] = ['A', 'B', 'C', 'D'];

export function MasterMeter({ className }: { className?: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  const peakRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let peak = 0;
    let peakTime = 0;
    const loop = () => {
      const level = engine.masterLevel;
      peak = Math.max(peak * 0.995, level);
      if (level > peak) peakTime = performance.now();
      if (performance.now() - peakTime > 700) peak = Math.max(level, peak - 0.004);
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, level * 1.6)})`;
      if (peakRef.current) peakRef.current.style.left = `${Math.min(99, peak * 160)}%`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-ink-800', className)}>
      <div
        ref={barRef}
        className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-emerald-400 via-acid-300 to-rose-400"
        style={{ transform: 'scaleX(0)' }}
      />
      <div ref={peakRef} className="absolute inset-y-0 w-px bg-white/70" style={{ left: '0%' }} />
    </div>
  );
}

export function Transport({ onAddTrack }: { onAddTrack: () => void }) {
  const { project, updateProject, mode, setMode, bank, setBank, saveState } = useStudioStore();
  const { playing, step, sectionIndex, bank: playingBank } = useTransport();
  const { loop, metronome } = useTransport();
  const [bpmDraft, setBpmDraft] = useState<string>(String(project?.bpm ?? 120));
  const taps = useRef<number[]>([]);
  const [tapFlash, setTapFlash] = useState(false);

  useEffect(() => {
    setBpmDraft(String(project?.bpm ?? 120));
  }, [project?.bpm]);

  if (!project) return null;

  const commitBpm = (value: number) => {
    const bpm = clamp(Math.round(value), 50, 220);
    updateProject({ bpm });
    setBpmDraft(String(bpm));
  };

  const tap = () => {
    const now = performance.now();
    taps.current = [...taps.current.filter((t) => now - t < 3000), now];
    setTapFlash(true);
    window.setTimeout(() => setTapFlash(false), 90);
    if (taps.current.length >= 2) {
      const intervals = taps.current.slice(1).map((t, i) => t - taps.current[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avg > 200) commitBpm(60000 / avg);
    }
  };

  const sectionName = project.sections?.[sectionIndex] || `Section ${sectionIndex + 1}`;
  const bar = Math.floor(step / 16) + 1;
  const beat = Math.floor((step % 16) / 4) + 1;
  const sixteenth = (step % 4) + 1;

  return (
    <div className="sticky top-16 z-10 border-b border-ink-700/60 bg-ink-950/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => transport.toggle()}
            className={cn(
              'focus-ring flex h-10 w-10 items-center justify-center rounded-full transition-all',
              playing
                ? 'bg-acid-300 text-ink-950 shadow-[0_0_28px_-6px_rgba(214,255,77,0.8)]'
                : 'bg-ink-700 text-ink-100 hover:bg-ink-650'
            )}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
          </button>
          <IconButton label="Stop" onClick={() => transport.stop()} className="bg-ink-800/70">
            <Square className="h-3.5 w-3.5 fill-current" />
          </IconButton>
          <IconButton
            label="Loop arrangement"
            onClick={() => transport.setLoop(!loop)}
            className={cn(loop ? 'text-acid-300' : 'text-ink-500', 'bg-ink-800/50')}
          >
            <Repeat className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton
            label="Metronome"
            onClick={() => transport.setMetronome(!metronome)}
            className={cn(metronome ? 'text-acid-300' : 'text-ink-500', 'hidden bg-ink-800/50 sm:inline-flex')}
          >
            <Gauge className="h-3.5 w-3.5" />
          </IconButton>
        </div>

        <div className="flex h-10 items-center gap-2 rounded-xl border border-ink-700/70 bg-ink-900/70 px-2.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink-500">bpm</span>
          <input
            value={bpmDraft}
            onChange={(e) => setBpmDraft(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
            onBlur={() => commitBpm(Number(bpmDraft) || project.bpm)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            className="w-9 border-none bg-transparent p-0 text-center font-mono text-sm text-ink-100 focus:outline-none"
            inputMode="numeric"
            aria-label="Tempo"
          />
          <div className="flex flex-col">
            <button
              onClick={() => commitBpm(project.bpm + 1)}
              className="text-ink-500 hover:text-acid-300"
              aria-label="Increase tempo"
            >
              <ChevronUp className="h-2.5 w-2.5" />
            </button>
            <button
              onClick={() => commitBpm(project.bpm - 1)}
              className="text-ink-500 hover:text-acid-300"
              aria-label="Decrease tempo"
            >
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </div>
          <button
            onClick={tap}
            className={cn(
              'rounded border px-1.5 py-1 text-[9px] font-semibold uppercase tracking-wider transition-colors',
              tapFlash
                ? 'border-acid-300 bg-acid-300 text-ink-950'
                : 'border-ink-600 text-ink-400 hover:border-acid-300/40 hover:text-acid-300'
            )}
            title="Tap tempo"
          >
            tap
          </button>
        </div>

        <div className="hidden h-10 flex-col justify-center gap-1 rounded-xl border border-ink-700/70 bg-ink-900/70 px-3 md:flex">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm tracking-[0.12em] text-ink-100">
              {String(bar).padStart(2, '0')}:{beat}:{sixteenth}
            </span>
            <span className="max-w-[120px] truncate text-[10px] text-ink-500">{playing ? sectionName : 'stopped'}</span>
          </div>
          <MasterMeter className="w-32" />
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Segmented
            size="sm"
            value={mode}
            onChange={(m) => {
              setMode(m);
              if (m === 'pattern') setBank(bank);
            }}
            options={[
              { value: 'song', label: 'Song' },
              { value: 'pattern', label: 'Pattern' },
            ]}
          />
          <div className="flex items-center gap-0.5 rounded-lg border border-ink-700/70 bg-ink-900/70 p-0.5">
            {BANKS.map((b) => (
              <button
                key={b}
                onClick={() => setBank(b)}
                className={cn(
                  'relative flex h-7 w-7 items-center justify-center rounded-md font-mono text-[11px] transition-colors',
                  bank === b ? 'bg-ink-700 text-acid-300' : 'text-ink-500 hover:text-ink-200'
                )}
                aria-label={`Edit pattern bank ${b}`}
              >
                {b}
                {playing && playingBank === b && mode === 'song' && (
                  <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-acid-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 xl:flex">
            <Headphones className="h-3.5 w-3.5 text-ink-500" />
            <input
              type="range"
              min={0}
              max={1.2}
              step={0.01}
              value={project.master_gain}
              onChange={(e) => updateProject({ master_gain: Number(e.target.value) })}
              className="w-24"
              style={
                {
                  background: `linear-gradient(to right, #d6ff4d ${(project.master_gain / 1.2) * 100}%, #222836 ${(project.master_gain / 1.2) * 100}%)`,
                } as React.CSSProperties
              }
              aria-label="Master volume"
            />
            <Volume2 className="h-3.5 w-3.5 text-ink-500" />
          </div>
          <Button size="sm" variant="secondary" icon={<Plus className="h-3.5 w-3.5" />} onClick={onAddTrack}>
            <span className="hidden sm:inline">Add track</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-ink-700/40 px-3 py-1.5 text-[10px] text-ink-600 sm:px-5">
        <span className="flex items-center gap-1.5">
          <Circle className={cn('h-2 w-2 fill-current', saveState === 'saving' ? 'animate-pulse text-amber-400' : saveState === 'error' ? 'text-rose-400' : 'text-emerald-400')} />
          {saveState === 'saving'
            ? 'Saving changes…'
            : saveState === 'error'
            ? 'Save failed — changes kept locally'
            : saveState === 'dirty'
            ? 'Unsaved changes'
            : 'All changes saved'}
        </span>
        <span className="hidden text-ink-700 sm:inline">·</span>
        <span className="hidden sm:inline">
          <Kbd>space</Kbd> play · <Kbd>L</Kbd> loop · <Kbd>M</Kbd> metronome
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded border border-ink-700/70 p-0.5 lg:hidden">
            <button
              onClick={() => setMode('song')}
              className={cn('rounded px-1.5 py-0.5 text-[9px]', mode === 'song' ? 'bg-ink-700 text-ink-100' : 'text-ink-500')}
            >
              Song
            </button>
            <button
              onClick={() => setMode('pattern')}
              className={cn('rounded px-1.5 py-0.5 text-[9px]', mode === 'pattern' ? 'bg-ink-700 text-ink-100' : 'text-ink-500')}
            >
              Pattern
            </button>
          </div>
          <span className="hidden items-center gap-1 md:flex">
            <span className={cn('h-1.5 w-1.5 rounded-full', playing ? 'bg-acid-300 pulse-ring' : 'bg-ink-600')} />
            {mode === 'song' ? 'Song mode' : 'Pattern loop'} · Bank {bank}
          </span>
          <span className="flex items-center gap-0.5 lg:hidden">
            {BANKS.map((b) => (
              <button
                key={b}
                onClick={() => setBank(b)}
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded font-mono text-[9px]',
                  bank === b ? 'bg-ink-700 text-acid-300' : 'text-ink-600'
                )}
              >
                {b}
              </button>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
