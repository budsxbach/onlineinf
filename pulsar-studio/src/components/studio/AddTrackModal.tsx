import { Drum, Play, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { engine } from '../../lib/engine';
import { COLORS, DRUM_INSTRUMENTS, INSTRUMENTS, SYNTH_INSTRUMENTS, colorOf, defaultParams } from '../../lib/music';
import { KITS } from '../../lib/music';
import { useStudioStore } from '../../store/studio';
import { Button, Field, Input, Modal, cn } from '../ui';

const KIT_PARAMS: Record<string, Record<string, number>> = {
  neon: { decay: 0.5, tone: 0.55, snap: 0.5 },
  vinyl: { decay: 0.34, tone: 0.36, snap: 0.2 },
  analog: { decay: 0.38, tone: 0.5, snap: 0.3 },
  tape: { decay: 0.46, tone: 0.6, snap: 0.4 },
};

const SUGGESTED: Record<string, string> = {
  kick: 'Punchy low end anchored to the grid.',
  snare: 'Backbeat body with a noisy tail.',
  clap: 'Wide stereo clap for hooks and drops.',
  hat: 'Closed hats — the engine of the groove.',
  openhat: 'Open hats for offbeat lift.',
  tom: 'Tuned toms for fills and tribal energy.',
  rim: 'Tight rim clicks for ghost notes.',
  cowbell: 'Metallic accent for funk and afro grooves.',
  crash: 'Long metallic tails to mark sections.',
  bass: 'Monophonic bass with filter envelope.',
  sub: 'Pure low sine — weight without mud.',
  lead: 'Bright detuned lead for hooks.',
  pad: 'Slow evolving chord bed.',
  pluck: 'Short, percussive melodic plucks.',
  keys: 'Soft keys for chords and riffs.',
};

export function AddTrackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTrack, project } = useStudioStore();
  const [instrument, setInstrument] = useState('kick');
  const [name, setName] = useState('');
  const [kit, setKit] = useState('neon');
  const [creating, setCreating] = useState(false);
  const meta = INSTRUMENTS[instrument];
  const isDrum = meta?.kind === 'drum';

  useEffect(() => {
    if (!open) return;
    setInstrument(project?.tracks?.some((t) => t.instrument === 'kick') ? 'bass' : 'kick');
    setName('');
    setCreating(false);
  }, [open, project]);

  const params = {
    ...defaultParams(instrument),
    ...(isDrum ? KIT_PARAMS[kit] : {}),
  };

  const preview = () => {
    engine.previewPreset(instrument, params);
  };

  const submit = async () => {
    setCreating(true);
    const created = await addTrack({ instrument, name: name.trim() || undefined, synth: params });
    setCreating(false);
    if (created) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add an instrument"
      description="Every track is a self-contained machine — drums, synths or samples."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={creating} onClick={submit}>
            Add {meta?.label || 'track'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Drum className="h-3.5 w-3.5 text-ink-500" />
            <span className="label-mono">Drum machines</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {DRUM_INSTRUMENTS.map((id) => {
              const info = INSTRUMENTS[id];
              const active = instrument === id;
              return (
                <button
                  key={id}
                  onClick={() => setInstrument(id)}
                  className={cn(
                    'group flex flex-col items-start gap-2 rounded-xl border p-2.5 text-left transition-all',
                    active ? 'border-acid-300/50 bg-white/[0.04]' : 'border-ink-700 bg-ink-800/40 hover:border-ink-600'
                  )}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10"
                    style={{ background: `${colorOf(info.color)}22`, color: colorOf(info.color) }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: colorOf(info.color) }} />
                  </span>
                  <span className={cn('text-[11px] font-medium', active ? 'text-ink-100' : 'text-ink-300')}>{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-ink-500" />
            <span className="label-mono">Synth engines</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SYNTH_INSTRUMENTS.map((id) => {
              const info = INSTRUMENTS[id];
              const active = instrument === id;
              return (
                <button
                  key={id}
                  onClick={() => setInstrument(id)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-xl border p-2.5 text-left transition-all',
                    active ? 'border-acid-300/50 bg-white/[0.04]' : 'border-ink-700 bg-ink-800/40 hover:border-ink-600'
                  )}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10"
                    style={{ background: `${colorOf(info.color)}22`, color: colorOf(info.color) }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: colorOf(info.color) }} />
                  </span>
                  <span className={cn('text-[11px] font-medium', active ? 'text-ink-100' : 'text-ink-300')}>{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Track name" hint={SUGGESTED[instrument]}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={meta?.defaultName} maxLength={40} />
          </Field>
          {isDrum ? (
            <Field label="Drum kit character">
              <div className="grid grid-cols-2 gap-1.5">
                {KITS.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setKit(k.id)}
                    className={cn(
                      'rounded-lg border px-2 py-1.5 text-left text-[11px] transition-colors',
                      kit === k.id
                        ? 'border-acid-300/40 bg-acid-300/[0.07] text-ink-100'
                        : 'border-ink-700 bg-ink-800/40 text-ink-400 hover:border-ink-600'
                    )}
                  >
                    {k.name}
                  </button>
                ))}
              </div>
            </Field>
          ) : (
            <Field label="Engine character" hint="Fine-tune the sound in the device panel after adding.">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(COLORS)
                  .slice(0, 6)
                  .map(([key, hex]) => (
                    <span key={key} className="h-6 w-6 rounded-full border border-white/10" style={{ background: hex }} />
                  ))}
                <span className="self-center pl-1 text-[10px] text-ink-500">{meta?.kind} engine</span>
              </div>
            </Field>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-ink-700/60 bg-ink-800/40 px-3 py-2.5">
          <p className="text-[11px] text-ink-400">
            {project?.tracks?.length ?? 0} / 16 tracks used in this session
          </p>
          <Button size="sm" variant="outline" icon={<Play className="h-3 w-3" />} onClick={preview}>
            Preview sound
          </Button>
        </div>
      </div>
    </Modal>
  );
}
