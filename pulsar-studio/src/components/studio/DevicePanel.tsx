import { ChevronDown, Music2, Play, Save, SlidersHorizontal, Sparkles, Volume2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { engine } from '../../lib/engine';
import { COLORS, colorOf, INSTRUMENTS, WAVES } from '../../lib/music';
import type { Preset, SynthParams, Track } from '../../lib/types';
import { useCreatePreset, usePresets } from '../../lib/hooks';
import { useStudioStore } from '../../store/studio';
import { toast } from '../../store/toast';
import { Button, Dropdown, DropdownItem, Field, Input, Knob, Modal, cn } from '../ui';

const hz = (v: number) => `${Math.round(180 * Math.pow(100, v))} Hz`;
const pctFormat = (v: number) => `${Math.round(v * 100)}%`;
const ms = (v: number) => `${Math.round(v * 1000)} ms`;
const secs = (v: number) => `${v.toFixed(2)} s`;
const semi = (v: number) => `${v > 0 ? '+' : ''}${Math.round(v)} st`;
const panFormat = (v: number) => (Math.abs(v) < 0.02 ? 'C' : `${v < 0 ? 'L' : 'R'}${Math.round(Math.abs(v) * 100)}`);

export function DevicePanel({ track, bank, onOpenRoll }: { track: Track; bank: string; onOpenRoll: () => void }) {
  const { updateTrack } = useStudioStore();
  const { data: presets } = usePresets();
  const createPreset = useCreatePreset();
  const [saveOpen, setSaveOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  const color = colorOf(track.color);
  const synth = track.synth || {};
  const isSynth = track.kind === 'synth';

  const compatible = useMemo(
    () => (presets || []).filter((p) => p.instrument === track.instrument),
    [presets, track.instrument]
  );

  const setSynth = (patch: SynthParams) => updateTrack(track.id, { synth: { ...synth, ...patch } });

  const hits = (track.patterns?.[bank as 'A'] || []).filter((c) => c.on).length;
  const noteCount = (track.notes?.[bank as 'A'] || []).length;
  const bankActivity = (['A', 'B', 'C', 'D'] as const).map((b) =>
    isSynth ? (track.notes?.[b] || []).length : (track.patterns?.[b] || []).filter((c) => c.on).length
  );
  const maxActivity = Math.max(1, ...bankActivity);

  const applyPreset = (preset: Preset) => {
    updateTrack(track.id, { synth: { ...preset.params } });
    engine.previewTrack({ ...track, synth: { ...preset.params } });
    toast.success(`${preset.name} loaded`, `${track.name} now uses this ${preset.category.toLowerCase()} recipe.`);
  };

  return (
    <div className="panel mt-3 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-700/50 px-3 py-2">
        <span className="label-mono">Device</span>
        <span className="flex items-center gap-1.5 rounded-md border border-ink-700/60 bg-ink-800/60 px-1.5 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          <span className="text-[10px] font-medium text-ink-200">{track.name}</span>
        </span>
        <span className="text-[10px] text-ink-500">{INSTRUMENTS[track.instrument]?.label || track.instrument}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button size="xs" variant="ghost" icon={<Volume2 className="h-3 w-3" />} onClick={() => engine.previewTrack(track)}>
            Audition
          </Button>
          {isSynth && (
            <Button size="xs" variant="ghost" icon={<Music2 className="h-3 w-3" />} onClick={onOpenRoll}>
              Piano roll
            </Button>
          )}
          {isSynth && (
            <Dropdown
              align="right"
              width="w-52"
              trigger={
                <span className="flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-ink-700 px-2 text-[10px] text-ink-300 hover:border-ink-500">
                  <Sparkles className="h-3 w-3" /> Presets <ChevronDown className="h-2.5 w-2.5" />
                </span>
              }
            >
              {(close) => (
                <>
                  {compatible.length === 0 && (
                    <div className="px-2.5 py-3 text-[10px] leading-relaxed text-ink-500">
                      No {INSTRUMENTS[track.instrument]?.label.toLowerCase()} presets yet. Dial something in and save it below.
                    </div>
                  )}
                  {compatible.map((p) => (
                    <DropdownItem
                      key={p.id}
                      icon={<span className="h-2 w-2 rounded-full" style={{ background: COLORS[p.color] || '#d6ff4d' }} />}
                      onClick={() => {
                        applyPreset(p);
                        close();
                      }}
                    >
                      {p.name}
                    </DropdownItem>
                  ))}
                </>
              )}
            </Dropdown>
          )}
          {isSynth && (
            <Button
              size="xs"
              variant="outline"
              icon={<Save className="h-3 w-3" />}
              onClick={() => {
                setPresetName(`${track.name} recipe`);
                setPresetDescription('');
                setSaveOpen(true);
              }}
            >
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 p-3.5 lg:grid-cols-[190px_minmax(0,1fr)_260px]">
        <div className="relative overflow-hidden rounded-xl border border-ink-700/60 p-3" style={{ background: `linear-gradient(145deg, ${color}18, rgba(9,11,16,0.4) 65%)` }}>
          <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-25 blur-2xl" style={{ background: color }} />
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-ink-900/60" style={{ color }}>
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-ink-100">
                {INSTRUMENTS[track.instrument]?.label || track.instrument}
              </p>
              <p className="text-[9px] uppercase tracking-widest text-ink-500">
                {isSynth ? 'subtractive synth' : 'drum machine'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-1">
            {bankActivity.map((count, i) => (
              <div key={i} className="flex-1">
                <div className="flex h-10 items-end rounded-sm bg-white/[0.03]">
                  <div
                    className="w-full rounded-sm"
                    style={{
                      height: `${Math.max(6, (count / maxActivity) * 100)}%`,
                      background: color,
                      opacity: ['A', 'B', 'C', 'D'][i] === bank ? 1 : 0.35,
                    }}
                  />
                </div>
                <p className="mt-1 text-center font-mono text-[8px] text-ink-500">{['A', 'B', 'C', 'D'][i]}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[9px] text-ink-500">
            <span>{isSynth ? `${noteCount} notes` : `${hits} hits`}</span>
            <span className="font-mono uppercase">bank {bank}</span>
          </div>
        </div>

        <div className="min-w-0">
          {isSynth ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="label-mono mr-1">Wave</span>
                {WAVES.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSynth({ wave: w.id })}
                    className={cn(
                      'rounded-md border px-2 py-1 text-[10px] transition-colors',
                      synth.wave === w.id
                        ? 'border-acid-300/50 bg-acid-300/10 text-acid-300'
                        : 'border-ink-700 text-ink-400 hover:border-ink-500 hover:text-ink-200'
                    )}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
                <Knob label="Cutoff" value={Number(synth.cutoff ?? 0.5)} onChange={(v) => setSynth({ cutoff: v })} format={hz} accent={color} />
                <Knob label="Reso" value={Number(synth.resonance ?? 0.15)} onChange={(v) => setSynth({ resonance: v })} format={pctFormat} accent={color} />
                <Knob label="Env amt" value={Number(synth.envAmount ?? 0.4)} onChange={(v) => setSynth({ envAmount: v })} format={pctFormat} accent={color} />
                <Knob label="Attack" value={Number(synth.attack ?? 0.01)} min={0.002} max={2} step={0.002} onChange={(v) => setSynth({ attack: v })} format={ms} accent={color} />
                <Knob label="Decay" value={Number(synth.decay ?? 0.2)} min={0.02} max={2} step={0.01} onChange={(v) => setSynth({ decay: v })} format={secs} accent={color} />
                <Knob label="Sustain" value={Number(synth.sustain ?? 0.5)} onChange={(v) => setSynth({ sustain: v })} format={pctFormat} accent={color} />
                <Knob label="Release" value={Number(synth.release ?? 0.2)} min={0.02} max={3} step={0.01} onChange={(v) => setSynth({ release: v })} format={secs} accent={color} />
                <Knob label="Detune" value={Number(synth.detune ?? 0.1)} onChange={(v) => setSynth({ detune: v })} format={pctFormat} accent={color} />
                <Knob label="Sub" value={Number(synth.sub ?? 0)} onChange={(v) => setSynth({ sub: v })} format={pctFormat} accent={color} />
                <Knob label="Glide" value={Number(synth.glide ?? 0)} onChange={(v) => setSynth({ glide: v })} format={pctFormat} accent={color} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Knob label="Tune" value={Number(synth.tune ?? 0)} min={-12} max={12} step={1} onChange={(v) => setSynth({ tune: v })} format={semi} accent={color} />
                <Knob label="Decay" value={Number(synth.decay ?? 0.3)} onChange={(v) => setSynth({ decay: v })} format={pctFormat} accent={color} />
                <Knob label="Tone" value={Number(synth.tone ?? 0.5)} onChange={(v) => setSynth({ tone: v })} format={pctFormat} accent={color} />
                <Knob label="Snap" value={Number(synth.snap ?? 0.4)} onChange={(v) => setSynth({ snap: v })} format={pctFormat} accent={color} />
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ink-700/50 bg-ink-800/30 px-2.5 py-2">
                <span className="text-[10px] text-ink-500">Shape the transient, then hit</span>
                <button
                  onClick={() => engine.previewTrack(track)}
                  className="flex items-center gap-1 rounded border border-ink-600 px-1.5 py-0.5 text-[10px] text-ink-200 hover:border-acid-300/50 hover:text-acid-300"
                >
                  <Play className="h-2.5 w-2.5" /> audition
                </button>
                <span className="ml-auto font-mono text-[9px] text-ink-600">synth engine · 48 kHz</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
          <div className="flex items-center justify-between">
            <p className="label-mono">Channel strip</p>
            <div className="flex gap-1">
              <button
                onClick={() => updateTrack(track.id, { mute: !track.mute })}
                className={cn(
                  'h-5 w-5 rounded text-[9px] font-bold transition-colors',
                  track.mute ? 'bg-rose-500/20 text-rose-300' : 'text-ink-500 hover:bg-white/5'
                )}
              >
                M
              </button>
              <button
                onClick={() => updateTrack(track.id, { solo: !track.solo })}
                className={cn(
                  'h-5 w-5 rounded text-[9px] font-bold transition-colors',
                  track.solo ? 'bg-acid-300/20 text-acid-300' : 'text-ink-500 hover:bg-white/5'
                )}
              >
                S
              </button>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Knob label="Volume" value={track.volume} max={1.5} onChange={(v) => updateTrack(track.id, { volume: v })} format={pctFormat} size={40} accent={color} />
            <Knob label="Pan" value={track.pan} min={-1} max={1} onChange={(v) => updateTrack(track.id, { pan: v })} format={panFormat} size={40} accent={color} defaultValue={0} />
            <Knob label="Drive" value={track.drive} onChange={(v) => updateTrack(track.id, { drive: v })} format={pctFormat} size={40} accent={color} />
            <Knob label="Reverb" value={track.reverb_send} onChange={(v) => updateTrack(track.id, { reverb_send: v })} format={pctFormat} size={40} accent={color} />
            <Knob label="Delay" value={track.delay_send} onChange={(v) => updateTrack(track.id, { delay_send: v })} format={pctFormat} size={40} accent={color} />
            <Knob label="Filter" value={track.filter_cutoff} min={0.05} max={1} onChange={(v) => updateTrack(track.id, { filter_cutoff: v })} format={pctFormat} size={40} accent={color} />
          </div>
        </div>
      </div>

      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Save preset"
        description={`Capture ${track.name}'s current sound for later sessions.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createPreset.isPending}
              onClick={() => {
                createPreset.mutate(
                  {
                    name: presetName.trim() || `${track.name} recipe`,
                    instrument: track.instrument,
                    category: INSTRUMENTS[track.instrument]?.label || 'Synth',
                    description: presetDescription.trim(),
                    color: track.color,
                    params: synth,
                  },
                  {
                    onSuccess: () => {
                      setSaveOpen(false);
                    },
                  }
                );
              }}
            >
              Save preset
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Preset name">
            <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} maxLength={60} autoFocus />
          </Field>
          <Field label="Notes" hint="Describe the character so future you remembers.">
            <Input value={presetDescription} onChange={(e) => setPresetDescription(e.target.value)} maxLength={200} placeholder="e.g. Wide detuned pad with a slow bloom" />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-ink-700/60 bg-ink-800/40 px-3 py-2 text-[11px] text-ink-400">
            <span>Instrument</span>
            <span className="font-mono text-ink-200">{INSTRUMENTS[track.instrument]?.label}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
