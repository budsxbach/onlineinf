import {
  ChevronDown,
  Copy,
  Eraser,
  Music2,
  Pencil,
  Plus,
  Trash2,
  Volume2,
  Wand2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from '../../store/toast';
import { engine } from '../../lib/engine';
import { COLORS, colorOf } from '../../lib/music';
import { cn, Dropdown, DropdownItem, IconButton } from '../ui';
import { useStudioStore } from '../../store/studio';
import { useTransport } from '../../store/transport';
import type { Bank, Track } from '../../lib/types';

const BANKS: Bank[] = ['A', 'B', 'C', 'D'];
const VELOCITIES = [0.35, 0.6, 0.85, 1];

function PlayheadColumn({ active }: { active: boolean }) {
  const step = useTransport((s) => s.step);
  if (!active) return null;
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 z-[5] border-x border-acid-300/40 bg-acid-300/[0.09]"
      style={{ width: 'calc(100% / 32)', transform: `translateX(${step * 100}%)` }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-acid-300/60" />
    </div>
  );
}

function SynthLane({ track, bank, onOpen }: { track: Track; bank: Bank; onOpen: () => void }) {
  const color = colorOf(track.color);
  const notes = track.notes?.[bank] || [];
  const all = ['A', 'B', 'C', 'D'].flatMap((b) => track.notes?.[b as Bank] || []);
  const pitches = all.map((n) => n.pitch);
  let min = pitches.length ? Math.min(...pitches) : 45;
  let max = pitches.length ? Math.max(...pitches) : 69;
  if (max - min < 10) {
    const mid = (min + max) / 2;
    min = Math.round(mid - 5);
    max = Math.round(mid + 5);
  }
  const span = Math.max(1, max - min);

  return (
    <div className="relative h-7 w-full cursor-pointer overflow-hidden rounded-[4px] bg-ink-800/50" onClick={onOpen}>
      <div className="grid h-full grid-cols-32" style={{ gridTemplateColumns: 'repeat(32, minmax(0,1fr))' }}>
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className={cn('h-full border-r border-ink-750/60', i % 8 === 0 ? 'bg-white/[0.025]' : '')}
          />
        ))}
      </div>
      {notes.map((note, i) => {
        const top = (1 - (note.pitch - min) / span) * 100;
        return (
          <div
            key={`${note.step}-${note.pitch}-${i}`}
            className="absolute rounded-[2px] transition-transform hover:scale-y-150"
            style={{
              left: `calc(${(note.step / 32) * 100}% + 1px)`,
              width: `max(5px, calc(${(Math.max(1, note.len) / 32) * 100}% - 2px))`,
              top: `calc(${Math.min(92, Math.max(4, top))}% )`,
              height: '44%',
              background: color,
              opacity: 0.35 + (note.vel ?? 0.8) * 0.6,
              boxShadow: `0 0 10px -4px ${color}`,
              transform: 'translateY(-50%)',
            }}
          />
        );
      })}
      {notes.length === 0 && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-[0.16em] text-ink-600">
          empty pattern — click to draw
        </span>
      )}
    </div>
  );
}

function TrackRowHeader({
  track,
  selected,
  onSelect,
  onOpenRoll,
}: {
  track: Track;
  selected: boolean;
  onSelect: () => void;
  onOpenRoll: () => void;
}) {
  const { updateTrack, duplicateTrack, deleteTrack } = useStudioStore();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(track.name);
  const color = colorOf(track.color);

  const commitName = () => {
    setRenaming(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== track.name) updateTrack(track.id, { name: trimmed.slice(0, 40) });
    else setName(track.name);
  };

  return (
    <div
      className={cn(
        'sticky left-0 z-10 flex h-[46px] w-[214px] shrink-0 items-center gap-1.5 border-r border-ink-700/60 px-2 transition-colors',
        selected ? 'bg-ink-800' : 'bg-ink-850 hover:bg-ink-800/70'
      )}
      onClick={onSelect}
    >
      <Dropdown
        align="left"
        width="w-32"
        trigger={
          <button
            className="h-6 w-2 shrink-0 rounded-full transition-transform hover:scale-x-150"
            style={{ background: color }}
            aria-label="Track color"
          />
        }
      >
        {(close) => (
          <div className="grid grid-cols-4 gap-1 p-1">
            {Object.entries(COLORS).map(([key, hex]) => (
              <button
                key={key}
                onClick={() => {
                  updateTrack(track.id, { color: key });
                  close();
                }}
                className="h-5 w-5 rounded-full border border-white/10 transition-transform hover:scale-110"
                style={{ background: hex }}
                aria-label={key}
              />
            ))}
          </div>
        )}
      </Dropdown>

      <button onClick={onSelect} className="min-w-0 flex-1 text-left">
        {renaming ? (
          <input
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') {
                setName(track.name);
                setRenaming(false);
              }
            }}
            className="w-full rounded border border-acid-300/40 bg-ink-900 px-1 py-0.5 text-[11px] text-ink-100 outline-none"
          />
        ) : (
          <span className="block truncate text-[11px] font-medium text-ink-200">{track.name}</span>
        )}
        <span className="mt-0.5 flex items-center gap-1 truncate text-[9px] uppercase tracking-wider text-ink-500">
          <span className="truncate">{track.instrumentLabel || track.instrument}</span>
        </span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          engine.previewTrack(track);
        }}
        className="rounded p-1 text-ink-600 transition-colors hover:text-acid-300"
        aria-label="Preview track"
        title="Preview"
      >
        <Volume2 className="h-3 w-3" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          updateTrack(track.id, { mute: !track.mute });
        }}
        className={cn(
          'h-5 w-5 rounded text-[9px] font-bold transition-colors',
          track.mute ? 'bg-rose-500/20 text-rose-300' : 'text-ink-500 hover:bg-white/5 hover:text-ink-200'
        )}
        title="Mute"
      >
        M
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          updateTrack(track.id, { solo: !track.solo });
        }}
        className={cn(
          'h-5 w-5 rounded text-[9px] font-bold transition-colors',
          track.solo ? 'bg-acid-300/20 text-acid-300' : 'text-ink-500 hover:bg-white/5 hover:text-ink-200'
        )}
        title="Solo"
      >
        S
      </button>

      <Dropdown
        align="right"
        width="w-44"
        trigger={
          <IconButton label="Track actions" size="xs" className="h-6 w-5" onClick={(e) => e.stopPropagation()}>
            <ChevronDown className="h-3 w-3" />
          </IconButton>
        }
      >
        {(close) => (
          <>
            {track.kind === 'synth' && (
              <DropdownItem icon={<Music2 className="h-3.5 w-3.5" />} onClick={() => { close(); onOpenRoll(); }}>
                Open piano roll
              </DropdownItem>
            )}
            <DropdownItem icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => { close(); setRenaming(true); }}>
              Rename track
            </DropdownItem>
            <DropdownItem icon={<Copy className="h-3.5 w-3.5" />} onClick={() => { close(); duplicateTrack(track.id); }}>
              Duplicate track
            </DropdownItem>
            <div className="my-1 h-px bg-ink-700/70" />
            <DropdownItem danger icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => { close(); deleteTrack(track.id); }}>
              Delete track
            </DropdownItem>
          </>
        )}
      </Dropdown>
    </div>
  );
}

export function StepGrid({ onAddTrack, onOpenRoll }: { onAddTrack: () => void; onOpenRoll: (trackId?: string) => void }) {
  const { project, bank, setBank, selectedTrackId, selectTrack, updateTrack, setMode } = useStudioStore();
  const playing = useTransport((s) => s.playing);
  const playingBank = useTransport((s) => s.bank);
  const paintRef = useRef<{ trackId: string; value: boolean } | null>(null);

  useEffect(() => {
    const up = () => {
      paintRef.current = null;
    };
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, []);

  if (!project) return null;
  const tracks = project.tracks || [];
  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) || null;

  const setCell = (track: Track, index: number, patch: Partial<{ on: boolean; vel: number }>) => {
    const cells = (track.patterns?.[bank] || []).slice();
    if (!cells[index]) return;
    cells[index] = { ...cells[index], ...patch };
    updateTrack(track.id, { patterns: { ...track.patterns, [bank]: cells } });
  };

  const clearBank = () => {
    if (!selectedTrack) return;
    if (selectedTrack.kind === 'synth') {
      updateTrack(selectedTrack.id, { notes: { ...selectedTrack.notes, [bank]: [] } });
      toast.success(`Cleared ${selectedTrack.name} in bank ${bank}`);
      return;
    }
    const cells = (selectedTrack.patterns?.[bank] || []).map((c) => ({ ...c, on: false }));
    updateTrack(selectedTrack.id, { patterns: { ...selectedTrack.patterns, [bank]: cells } });
    toast.success(`Cleared ${selectedTrack.name} in bank ${bank}`);
  };

  const humanize = () => {
    if (!selectedTrack) return;
    if (selectedTrack.kind === 'synth') {
      const notes = (selectedTrack.notes?.[bank] || []).map((n) => ({
        ...n,
        vel: Math.min(1, Math.max(0.3, (n.vel ?? 0.8) + (Math.random() - 0.5) * 0.18)),
      }));
      updateTrack(selectedTrack.id, { notes: { ...selectedTrack.notes, [bank]: notes } });
    } else {
      const cells = (selectedTrack.patterns?.[bank] || []).map((c) => ({
        ...c,
        vel: c.on ? Math.min(1, Math.max(0.25, c.vel + (Math.random() - 0.5) * 0.16)) : c.vel,
      }));
      updateTrack(selectedTrack.id, { patterns: { ...selectedTrack.patterns, [bank]: cells } });
    }
    toast.success('Velocities humanized', `A little movement added to ${selectedTrack.name}.`);
  };

  const targetBank = playing && playingBank !== bank ? playingBank : bank;

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-700/50 px-3 py-2">
        <span className="label-mono">Sequencer</span>
        <div className="flex items-center gap-0.5 rounded-lg border border-ink-700/70 bg-ink-900/70 p-0.5">
          {BANKS.map((b) => (
            <button
              key={b}
              onClick={() => {
                setBank(b);
                setMode('pattern');
              }}
              className={cn(
                'relative flex h-6 w-6 items-center justify-center rounded-[6px] font-mono text-[10px] transition-colors',
                bank === b ? 'bg-ink-700 text-acid-300' : 'text-ink-500 hover:text-ink-200'
              )}
            >
              {b}
              {playing && playingBank === b && (
                <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-acid-300" />
              )}
            </button>
          ))}
        </div>
        <span className="rounded border border-ink-700/70 bg-ink-800/60 px-1.5 py-px font-mono text-[9px] text-ink-500">
          32 steps · 2 bars
        </span>
        {playing && playingBank !== bank && (
          <button
            onClick={() => setBank(playingBank)}
            className="flex items-center gap-1 rounded-full border border-acid-300/30 bg-acid-300/10 px-2 py-0.5 text-[9px] text-acid-300 hover:bg-acid-300/20"
          >
            Playing bank {playingBank} — follow
          </button>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => selectedTrack && onOpenRoll(selectedTrack.id)}
            disabled={!selectedTrack || selectedTrack.kind !== 'synth'}
            className="flex h-7 items-center gap-1 rounded-lg border border-ink-700 px-2 text-[10px] text-ink-300 transition-colors hover:border-ink-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Music2 className="h-3 w-3" /> Piano roll
          </button>
          <Dropdown
            align="right"
            width="w-44"
            trigger={
              <span className="flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-ink-700 px-2 text-[10px] text-ink-300 hover:border-ink-500">
                <Wand2 className="h-3 w-3" /> Tools <ChevronDown className="h-2.5 w-2.5" />
              </span>
            }
          >
            {(close) => (
              <>
                <DropdownItem icon={<Eraser className="h-3.5 w-3.5" />} onClick={() => { clearBank(); close(); }}>
                  Clear {bank} for {selectedTrack?.name || 'track'}
                </DropdownItem>
                <DropdownItem icon={<Wand2 className="h-3.5 w-3.5" />} onClick={() => { humanize(); close(); }}>
                  Humanize velocities
                </DropdownItem>
                <DropdownItem icon={<Music2 className="h-3.5 w-3.5" />} onClick={() => { onOpenRoll(selectedTrack?.id); close(); }}>
                  Edit notes in piano roll
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[780px]">
          <div className="flex border-b border-ink-700/50 bg-ink-900/50">
            <div className="sticky left-0 z-10 flex h-6 w-[214px] shrink-0 items-center border-r border-ink-700/60 bg-ink-900 px-2">
              <span className="text-[9px] uppercase tracking-[0.16em] text-ink-600">Tracks</span>
            </div>
            <div className="grid flex-1 grid-cols-32" style={{ gridTemplateColumns: 'repeat(32, minmax(0,1fr))' }}>
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex h-6 items-center justify-center border-r border-ink-800/80 font-mono text-[8px]',
                    i % 16 === 0 ? 'border-l border-l-ink-600/70 text-ink-400' : 'text-ink-600'
                  )}
                >
                  {i % 16 === 0 ? `BAR ${i / 16 + 1}` : i % 4 === 0 ? (i % 16) / 4 + 1 : ''}
                </div>
              ))}
            </div>
          </div>

          {tracks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-14">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-700 bg-ink-800 text-acid-300">
                <Music2 className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-ink-200">This session has no tracks yet</p>
              <p className="max-w-sm text-center text-xs text-ink-500">
                Add a drum machine, bass or pad to start painting patterns.
              </p>
              <button
                onClick={onAddTrack}
                className="mt-1 flex items-center gap-1.5 rounded-lg bg-acid-300 px-3 py-1.5 text-xs font-semibold text-ink-950"
              >
                <Plus className="h-3.5 w-3.5" /> Add instrument
              </button>
            </div>
          )}

          {tracks.map((track) => {
            const selected = track.id === selectedTrackId;
            const color = colorOf(track.color);
            const cells = track.patterns?.[bank] || [];
            return (
              <div
                key={track.id}
                className={cn(
                  'flex border-b border-ink-750/70 last:border-b-0',
                  selected && 'bg-white/[0.018]'
                )}
              >
                <TrackRowHeader
                  track={track}
                  selected={selected}
                  onSelect={() => selectTrack(track.id)}
                  onOpenRoll={() => onOpenRoll(track.id)}
                />
                <div className="relative flex-1 py-1.5">
                  {track.kind === 'synth' ? (
                    <SynthLane track={track} bank={bank} onOpen={() => onOpenRoll(track.id)} />
                  ) : (
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(32, minmax(0,1fr))' }}>
                      {cells.map((cell, index) => (
                        <div key={index} className="p-[1.5px]">
                          <button
                            data-on={cell.on}
                            data-accent={index % 8 === 0}
                            className="step-cell h-[26px] w-full focus-ring"
                            style={
                              {
                                '--step-color': color,
                                opacity: cell.on ? 0.35 + cell.vel * 0.65 : 1,
                              } as React.CSSProperties
                            }
                            onPointerDown={(e) => {
                              e.preventDefault();
                              if (e.shiftKey) {
                                const current = VELOCITIES.reduce(
                                  (best, v) => (Math.abs(v - cell.vel) < Math.abs(best - cell.vel) ? v : best),
                                  VELOCITIES[0]
                                );
                                const next = VELOCITIES[(VELOCITIES.indexOf(current) + 1) % VELOCITIES.length];
                                setCell(track, index, { on: true, vel: next });
                                return;
                              }
                              paintRef.current = { trackId: track.id, value: !cell.on };
                              setCell(track, index, { on: !cell.on });
                              if (!cell.on) engine.previewTrack(track);
                            }}
                            onPointerEnter={() => {
                              if (paintRef.current && paintRef.current.trackId === track.id) {
                                setCell(track, index, { on: paintRef.current.value });
                              }
                            }}
                            title={`Step ${index + 1} · vel ${Math.round(cell.vel * 100)}%${cell.on ? '' : ' · off'} — shift-click cycles velocity`}
                            aria-label={`${track.name} step ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <PlayheadColumn active={playing && targetBank === bank} />
                </div>
              </div>
            );
          })}

          {tracks.length > 0 && (
            <div className="flex border-t border-ink-700/40">
              <div className="sticky left-0 z-10 w-[214px] shrink-0 border-r border-ink-700/60 bg-ink-850 px-2 py-1.5">
                <button
                  onClick={onAddTrack}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-600/80 py-1.5 text-[10px] text-ink-400 transition-colors hover:border-acid-300/50 hover:text-acid-300"
                >
                  <Plus className="h-3 w-3" /> Add instrument
                </button>
              </div>
              <div className="flex-1 px-1 py-1.5 text-right text-[9px] text-ink-600">
                click toggles · <span className="text-ink-500">⇧-click</span> cycles velocity · drag paints
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
