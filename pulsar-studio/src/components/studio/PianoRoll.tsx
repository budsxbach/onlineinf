import { ChevronDown, ChevronUp, Eraser, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { engine } from '../../lib/engine';
import { clamp, colorOf, isInScale, midiToName, NOTE_NAMES, SCALES, scaleMidi } from '../../lib/music';
import type { Note, Project, Track } from '../../lib/types';
import { useStudioStore } from '../../store/studio';
import { toast } from '../../store/toast';
import { Button, Drawer, Segmented, cn } from '../ui';

const ROWS = 24;
const ROW_H = 17;
const LENGTHS = [1, 2, 4, 8];

const BASE_BY_INSTRUMENT: Record<string, number> = {
  bass: 36,
  sub: 24,
  keys: 48,
  pad: 48,
  pluck: 60,
  lead: 60,
};

const BLACK = [1, 3, 6, 8, 10];

function generateMotif(project: Project, base: number, length: number): Note[] {
  const notes: Note[] = [];
  let degree = 0;
  let step = 0;
  while (step < 32) {
    const rest = Math.random() < 0.22 && step > 0;
    if (!rest) {
      const raw = scaleMidi(project.key_root, project.scale, Math.floor(base / 12) - 1, degree);
      let pitch = raw;
      while (pitch < base) pitch += 12;
      while (pitch >= base + ROWS) pitch -= 12;
      notes.push({ step, pitch, len: length, vel: 0.6 + Math.random() * 0.3 });
    }
    step += length;
    degree += [-2, -1, 0, 1, 2, 3, -3][Math.floor(Math.random() * 7)];
    if (step % 16 === 0) degree = 0;
  }
  return notes;
}

export function PianoRoll({
  open,
  onClose,
  track,
  project,
  bank,
}: {
  open: boolean;
  onClose: () => void;
  track: Track;
  project: Project;
  bank: 'A' | 'B' | 'C' | 'D';
}) {
  const { updateTrack, setBank } = useStudioStore();
  const allNotes = useMemo(() => {
    const pitches = (['A', 'B', 'C', 'D'] as const).flatMap((b) => (track.notes?.[b] || []).map((n) => n.pitch));
    return pitches;
  }, [track.notes]);
  const [base, setBase] = useState(() => {
    const defaultBase = BASE_BY_INSTRUMENT[track.instrument] ?? 48;
    if (allNotes.length) {
      const min = Math.min(...allNotes);
      if (min < defaultBase) return clamp(min - 1, 12, 84);
    }
    return defaultBase;
  });
  const [noteLength, setNoteLength] = useState(2);
  const [velocity, setVelocity] = useState(0.85);
  const color = colorOf(track.color);
  const notes = track.notes?.[bank] || [];
  const inRange = notes.filter((n) => n.pitch >= base && n.pitch < base + ROWS);
  const outOfRange = notes.length - inRange.length;

  const commit = (next: Note[]) => {
    const sorted = [...next].sort((a, b) => a.step - b.step || a.pitch - b.pitch);
    updateTrack(track.id, { notes: { ...track.notes, [bank]: sorted } });
  };

  const at = (step: number, pitch: number) => notes.find((n) => n.step === step && n.pitch === pitch);

  const clickCell = (step: number, pitch: number) => {
    const existing = at(step, pitch);
    if (existing) {
      commit(notes.filter((n) => n !== existing));
      return;
    }
    commit([...notes, { step, pitch, len: noteLength, vel: velocity }]);
    engine.previewTrack(track, pitch);
  };

  const fitRange = () => {
    if (!allNotes.length) return;
    setBase(clamp(Math.min(...allNotes) - 1, 12, 84));
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="max-w-5xl"
      title={
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          {track.name} · piano roll
        </span>
      }
      subtitle={`Bank ${bank} · ${notes.length} notes · ${NOTE_NAMES[project.key_root]} ${project.scale}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-700/60 px-4 py-2.5">
          <div className="flex items-center gap-1">
            {(['A', 'B', 'C', 'D'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBank(b)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md font-mono text-[11px] transition-colors',
                  bank === b ? 'bg-ink-700 text-acid-300' : 'text-ink-500 hover:text-ink-200'
                )}
              >
                {b}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-ink-700" />
          <span className="label-mono">note</span>
          <Segmented
            size="sm"
            value={String(noteLength)}
            onChange={(v) => setNoteLength(Number(v))}
            options={LENGTHS.map((l) => ({ value: String(l), label: `${l}` }))}
          />
          <span className="label-mono ml-1">vel</span>
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.05}
            value={velocity}
            onChange={(e) => setVelocity(Number(e.target.value))}
            className="w-20"
            style={{ background: `linear-gradient(to right, ${color} ${((velocity - 0.2) / 0.8) * 100}%, #222836 ${((velocity - 0.2) / 0.8) * 100}%)` }}
          />
          <span className="w-8 font-mono text-[10px] text-ink-400">{Math.round(velocity * 100)}</span>
          <div className="h-4 w-px bg-ink-700" />
          <span className="label-mono">oct</span>
          <div className="flex items-center gap-0.5 rounded-md border border-ink-700 p-0.5">
            <button
              onClick={() => setBase((b) => clamp(b - 12, 12, 84))}
              className="flex h-6 w-6 items-center justify-center rounded text-ink-400 hover:bg-white/5 hover:text-ink-100"
              aria-label="Octave down"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
            <span className="w-10 text-center font-mono text-[10px] text-ink-300">
              {midiToName(base)}–{midiToName(base + ROWS - 1)}
            </span>
            <button
              onClick={() => setBase((b) => clamp(b + 12, 12, 84))}
              className="flex h-6 w-6 items-center justify-center rounded text-ink-400 hover:bg-white/5 hover:text-ink-100"
              aria-label="Octave up"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
          </div>
          {outOfRange > 0 && (
            <button onClick={fitRange} className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] text-amber-200">
              {outOfRange} off-screen · fit
            </button>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              size="xs"
              variant="ghost"
              icon={<Sparkles className="h-3 w-3" />}
              onClick={() => {
                commit(generateMotif(project, base, noteLength));
                toast.success('Motif generated', `In ${NOTE_NAMES[project.key_root]} ${project.scale} — tweak it to taste.`);
              }}
            >
              Generate
            </Button>
            <Button
              size="xs"
              variant="ghost"
              icon={<Eraser className="h-3 w-3" />}
              onClick={() => {
                commit([]);
                toast.success(`Cleared bank ${bank}`);
              }}
            >
              Clear
            </Button>
            <Button size="xs" variant="secondary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="min-w-[680px]">
            <div className="mb-1 flex">
              <div className="w-14 shrink-0" />
              <div className="grid flex-1" style={{ gridTemplateColumns: 'repeat(32, minmax(0,1fr))' }}>
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'pb-1 text-center font-mono text-[8px]',
                      i % 16 === 0 ? 'text-ink-300' : i % 4 === 0 ? 'text-ink-500' : 'text-ink-700'
                    )}
                  >
                    {i % 4 === 0 ? (i % 16) / 4 + 1 : '·'}
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-ink-700/70">
              <div className="flex">
                <div className="w-14 shrink-0 border-r border-ink-700 bg-ink-900">
                  {Array.from({ length: ROWS }).map((_, row) => {
                    const pitch = base + ROWS - 1 - row;
                    const name = midiToName(pitch);
                    const isBlack = BLACK.includes(pitch % 12);
                    return (
                      <div
                        key={pitch}
                        className={cn(
                          'flex items-center justify-end border-b border-ink-800/80 pr-1.5 font-mono text-[8px]',
                          isBlack ? 'bg-ink-800 text-ink-500' : 'bg-ink-850 text-ink-300'
                        )}
                        style={{ height: ROW_H }}
                      >
                        {name}
                      </div>
                    );
                  })}
                </div>
                <div className="relative flex-1">
                  {Array.from({ length: ROWS }).map((_, row) => {
                    const pitch = base + ROWS - 1 - row;
                    const isBlack = BLACK.includes(pitch % 12);
                    const inScale = isInScale(pitch, project.key_root, project.scale);
                    const isRoot = ((pitch - project.key_root) % 12 + 12) % 12 === 0;
                    return (
                      <div
                        key={pitch}
                        className={cn('grid border-b border-ink-800/70', isBlack ? 'bg-ink-900/80' : 'bg-ink-850/60')}
                        style={{ gridTemplateColumns: 'repeat(32, minmax(0,1fr))', height: ROW_H }}
                      >
                        {Array.from({ length: 32 }).map((_, step) => (
                          <div
                            key={step}
                            onClick={() => clickCell(step, pitch)}
                            className={cn(
                              'cursor-crosshair border-r border-ink-800/50 transition-colors hover:bg-white/[0.06]',
                              isRoot && 'bg-acid-300/[0.04]',
                              !isRoot && inScale && 'bg-white/[0.012]',
                              step % 16 === 0 && 'border-l border-l-ink-600/60',
                              step % 4 === 0 && 'border-l border-l-ink-700/60'
                            )}
                          />
                        ))}
                      </div>
                    );
                  })}
                  <div className="pointer-events-none absolute inset-0">
                    {inRange.map((note, i) => {
                      const top = (ROWS - 1 - (note.pitch - base)) * ROW_H;
                      return (
                        <div
                          key={`${note.step}-${note.pitch}-${i}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            commit(notes.filter((n) => n !== note));
                          }}
                          className="pointer-events-auto absolute cursor-pointer rounded-[3px] border border-white/20 transition-all hover:brightness-125"
                          style={{
                            left: `calc(${(note.step / 32) * 100}% + 1px)`,
                            width: `max(8px, calc(${(Math.max(1, note.len) / 32) * 100}% - 2px))`,
                            top: top + 1.5,
                            height: ROW_H - 3,
                            background: color,
                            opacity: 0.45 + (note.vel ?? 0.8) * 0.5,
                            boxShadow: `0 0 14px -6px ${color}`,
                          }}
                          title={`${midiToName(note.pitch)} · step ${note.step + 1} · ${Math.round((note.vel ?? 0.8) * 100)}% — click to delete`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-ink-600">
            <span>Click an empty cell to draw · click a note to remove · length {noteLength} step{noteLength > 1 ? 's' : ''}</span>
            <span className="font-mono">
              {SCALES[project.scale]?.length || 7}-note scale · {NOTE_NAMES[project.key_root]} root highlighted
            </span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
