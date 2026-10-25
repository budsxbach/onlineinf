import { Heart, Pencil, Play, Plus, SearchX, Sparkles, Star, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Page, PageHeader } from '../components/layout/Page';
import { MiniWave } from '../components/CoverArt';
import {
  Badge,
  Button,
  ConfirmDialog,
  Dropdown,
  DropdownItem,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  RangeInput,
  SearchInput,
  Segmented,
  Select,
  Textarea,
  cn,
} from '../components/ui';
import { engine } from '../lib/engine';
import { COLORS, INSTRUMENTS, SYNTH_INSTRUMENTS, WAVES, colorOf, defaultParams } from '../lib/music';
import { useCreatePreset, useDeletePreset, usePresets, useUpdatePreset } from '../lib/hooks';
import type { Preset, SynthParams } from '../lib/types';

const pct = (v: number) => `${Math.round(v * 100)}%`;
const ms = (v: number) => `${Math.round(v * 1000)} ms`;
const secs = (v: number) => `${v.toFixed(2)} s`;

interface PresetForm {
  name: string;
  instrument: string;
  category: string;
  description: string;
  color: string;
  params: SynthParams;
}

function PresetModal({ open, onClose, preset }: { open: boolean; onClose: () => void; preset: Preset | null }) {
  const create = useCreatePreset();
  const update = useUpdatePreset();
  const [form, setForm] = useState<PresetForm>(() =>
    preset
      ? {
          name: preset.name,
          instrument: preset.instrument,
          category: preset.category,
          description: preset.description,
          color: preset.color,
          params: { ...preset.params },
        }
      : {
          name: '',
          instrument: 'lead',
          category: 'Lead',
          description: '',
          color: 'fuchsia',
          params: { ...(defaultParams('lead') as SynthParams) },
        }
  );

  const setParam = (key: string, value: number | string) => setForm({ ...form, params: { ...form.params, [key]: value } });

  const save = () => {
    const payload = {
      name: form.name.trim() || 'Untitled Preset',
      instrument: form.instrument,
      category: form.category || INSTRUMENTS[form.instrument]?.label || 'Synth',
      description: form.description.trim(),
      color: form.color,
      params: form.params,
    };
    if (preset) update.mutate({ id: preset.id, patch: payload }, { onSuccess: onClose });
    else create.mutate(payload, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={preset ? 'Edit preset' : 'New preset'}
      description="Presets store the full synth patch — wave, filter and envelope."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" icon={<Play className="h-3.5 w-3.5" />} onClick={() => engine.previewPreset(form.instrument, form.params, 57)}>
            Audition
          </Button>
          <Button variant="primary" loading={create.isPending || update.isPending} onClick={save}>
            {preset ? 'Save preset' : 'Create preset'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Preset name" className="sm:col-span-2">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} placeholder="e.g. Glass Pluck" />
        </Field>
        <Field label="Synth engine">
          <Select
            value={form.instrument}
            onChange={(e) => {
              const instrument = e.target.value;
              setForm({
                ...form,
                instrument,
                category: INSTRUMENTS[instrument]?.label || 'Synth',
                params: { ...(defaultParams(instrument) as SynthParams), ...(preset?.instrument === instrument ? preset.params : {}) },
              });
            }}
          >
            {SYNTH_INSTRUMENTS.map((id) => (
              <option key={id} value={id}>
                {INSTRUMENTS[id].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Category">
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} maxLength={30} />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} maxLength={300} placeholder="Wide detuned pad with a slow bloom" />
        </Field>
        <Field label="Waveform" className="sm:col-span-2">
          <Segmented
            size="sm"
            value={String(form.params.wave || 'sawtooth')}
            onChange={(v) => setParam('wave', v)}
            options={WAVES.map((w) => ({ value: w.id, label: w.label }))}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-3">
          <RangeInput label="Cutoff" value={Number(form.params.cutoff ?? 0.5)} onChange={(v) => setParam('cutoff', v)} format={pct} />
          <RangeInput label="Resonance" value={Number(form.params.resonance ?? 0.15)} onChange={(v) => setParam('resonance', v)} format={pct} />
          <RangeInput label="Env amount" value={Number(form.params.envAmount ?? 0.4)} onChange={(v) => setParam('envAmount', v)} format={pct} />
          <RangeInput label="Attack" value={Number(form.params.attack ?? 0.01)} min={0.002} max={2} step={0.002} onChange={(v) => setParam('attack', v)} format={ms} />
          <RangeInput label="Decay" value={Number(form.params.decay ?? 0.2)} min={0.02} max={2} step={0.01} onChange={(v) => setParam('decay', v)} format={secs} />
          <RangeInput label="Sustain" value={Number(form.params.sustain ?? 0.5)} onChange={(v) => setParam('sustain', v)} format={pct} />
          <RangeInput label="Release" value={Number(form.params.release ?? 0.2)} min={0.02} max={3} step={0.01} onChange={(v) => setParam('release', v)} format={secs} />
          <RangeInput label="Detune" value={Number(form.params.detune ?? 0.1)} onChange={(v) => setParam('detune', v)} format={pct} />
          <RangeInput label="Sub" value={Number(form.params.sub ?? 0)} onChange={(v) => setParam('sub', v)} format={pct} />
        </div>
        <Field label="Accent colour" className="sm:col-span-2">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(COLORS).map(([key, hex]) => (
              <button
                key={key}
                onClick={() => setForm({ ...form, color: key })}
                className={cn('h-7 w-7 rounded-full border-2 transition-transform hover:scale-110', form.color === key ? 'border-white' : 'border-transparent')}
                style={{ background: hex }}
                aria-label={key}
              />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

export default function Presets() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState(false);
  const { data: presets, isLoading } = usePresets({ category, query, favorite: favorites });
  const { data: allPresets } = usePresets({});
  const update = useUpdatePreset();
  const remove = useDeletePreset();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Preset | null>(null);
  const [deleting, setDeleting] = useState<Preset | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (allPresets || presets || []).forEach((p) => set.add(p.category));
    const order = ['Bass', 'Lead', 'Pad', 'Keys', 'Pluck', 'Sub'];
    const list = Array.from(set).sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return ['All', ...list];
  }, [allPresets, presets]);

  const hasFilters = !!query || category !== 'All' || favorites;

  const audition = (preset: Preset) => {
    engine.previewPreset(preset.instrument, preset.params, 57);
    setPlayingId(preset.id);
    window.setTimeout(() => setPlayingId((c) => (c === preset.id ? null : c)), 1400);
  };

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <span className="h-1 w-1 rounded-full bg-acid-300" /> Sound design
          </>
        }
        title="Preset rack"
        description="Every patch you save becomes a reusable instrument recipe — audition it here, load it from any device panel."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Heart className={cn('h-4 w-4', favorites && 'fill-acid-300 text-acid-300')} />}
              onClick={() => setFavorites((v) => !v)}
            >
              {favorites ? 'Favorites' : 'All presets'}
            </Button>
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              New preset
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-ink-700/70 bg-ink-900/60 p-0.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'h-7 rounded-[10px] px-2.5 text-[11px] font-medium transition-colors',
                category === c ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-200'
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search presets…" className="ml-auto w-full sm:w-60" />
        <span className="hidden rounded-md border border-ink-700/60 bg-ink-800/50 px-2 py-1 font-mono text-[10px] text-ink-500 md:block">
          {isLoading ? '…' : `${presets?.length ?? 0} presets`}
        </span>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="panel p-3">
              <div className="shimmer h-20 rounded-lg bg-ink-750" />
              <div className="mt-3 space-y-2">
                <div className="shimmer h-3 w-2/3 rounded bg-ink-750" />
                <div className="shimmer h-2.5 w-full rounded bg-ink-750" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && presets && presets.length === 0 && (
        <EmptyState
          icon={hasFilters ? <SearchX className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          title={hasFilters ? 'No presets match' : 'No presets saved yet'}
          description={
            hasFilters
              ? 'Try another category or clear the search.'
              : 'Dial in a sound in the studio, then hit Save in the device panel to add it here.'
          }
          action={
            hasFilters ? (
              <Button onClick={() => { setCategory('All'); setQuery(''); setFavorites(false); }}>Clear filters</Button>
            ) : (
              <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>
                Create a preset
              </Button>
            )
          }
        />
      )}

      {!isLoading && presets && presets.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {presets.map((preset) => {
            const color = colorOf(preset.color);
            const isPlaying = playingId === preset.id;
            return (
              <div
                key={preset.id}
                className="group relative overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850/70 p-3 transition-all hover:border-ink-600"
              >
                <div
                  className="relative flex h-20 items-center justify-between overflow-hidden rounded-xl border border-white/5 px-3"
                  style={{ background: `linear-gradient(130deg, ${color}26, rgba(9,11,16,0.3) 70%)` }}
                >
                  <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-30 blur-2xl" style={{ background: color }} />
                  <button
                    onClick={() => audition(preset)}
                    className={cn(
                      'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all',
                      isPlaying
                        ? 'border-acid-300 bg-acid-300 text-ink-950 shadow-[0_0_24px_-6px_rgba(214,255,77,0.8)]'
                        : 'border-white/10 bg-ink-950/60 text-ink-100 backdrop-blur hover:border-acid-300/50 hover:text-acid-300'
                    )}
                    aria-label="Audition preset"
                  >
                    <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                  </button>
                  <MiniWave seed={preset.id} bars={22} color={color} className="h-7 flex-1 px-3 opacity-70" />
                  <span className="rounded border border-white/10 bg-ink-950/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ink-300">
                    {INSTRUMENTS[preset.instrument]?.label || preset.instrument}
                  </span>
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-medium text-ink-100">{preset.name}</h3>
                    <p className="mt-0.5 text-[10px] text-ink-500">
                      <span style={{ color }}>{preset.category}</span> · {String(preset.params.wave || 'saw')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <IconButton
                      label={preset.favorite ? 'Unfavorite' : 'Favorite'}
                      size="xs"
                      onClick={() => update.mutate({ id: preset.id, patch: { favorite: !preset.favorite } })}
                    >
                      <Star className={cn('h-3.5 w-3.5', preset.favorite ? 'fill-acid-300 text-acid-300' : 'text-ink-500')} />
                    </IconButton>
                    <Dropdown
                      align="right"
                      width="w-40"
                      trigger={
                        <IconButton label="Preset actions" size="xs">
                          <span className="text-[10px]">···</span>
                        </IconButton>
                      }
                    >
                      {(close) => (
                        <>
                          <DropdownItem icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => { close(); setEditing(preset); setModalOpen(true); }}>
                            Edit preset
                          </DropdownItem>
                          <DropdownItem icon={<Play className="h-3.5 w-3.5" />} onClick={() => { close(); audition(preset); }}>
                            Audition
                          </DropdownItem>
                          <div className="my-1 h-px bg-ink-700/70" />
                          <DropdownItem danger icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => { close(); setDeleting(preset); }}>
                            Delete preset
                          </DropdownItem>
                        </>
                      )}
                    </Dropdown>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 min-h-[28px] text-[11px] leading-relaxed text-ink-500">{preset.description || 'No description yet.'}</p>
                <div className="mt-2 flex items-center justify-between border-t border-ink-700/50 pt-2">
                  <div className="flex gap-1.5 font-mono text-[9px] text-ink-600">
                    <span>C {Math.round(Number(preset.params.cutoff ?? 0.5) * 100)}</span>
                    <span>R {Math.round(Number(preset.params.resonance ?? 0.15) * 100)}</span>
                    <span>A {Math.round(Number(preset.params.attack ?? 0.01) * 1000)}ms</span>
                  </div>
                  <Badge className="text-[9px]">{preset.params.wave || 'saw'}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <PresetModal
          key={editing?.id || 'new'}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          preset={editing}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id);
          setDeleting(null);
        }}
        title={`Delete “${deleting?.name}”?`}
        description="Tracks already using this patch keep their current settings."
      />
    </Page>
  );
}
