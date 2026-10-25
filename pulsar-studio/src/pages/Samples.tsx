import { Heart, Music2, Pause, Pencil, Play, Plus, SearchX, Star, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Page, PageHeader } from '../components/layout/Page';
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
  SearchInput,
  Select,
  Textarea,
  cn,
} from '../components/ui';
import { api } from '../lib/api';
import { engine } from '../lib/engine';
import { COLORS, DRUM_INSTRUMENTS, INSTRUMENTS, NOTE_NAMES, SAMPLE_CATEGORIES, SYNTH_INSTRUMENTS, colorOf, defaultParams } from '../lib/music';
import { useCreateSample, useDeleteSample, useSamples, useStats, useUpdateSample } from '../lib/hooks';
import { MiniWave } from '../components/CoverArt';
import type { Sample } from '../lib/types';

const CATEGORY_COLORS: Record<string, string> = {
  Drums: '#fb7185',
  Bass: '#a78bfa',
  Synth: '#5eead4',
  Loops: '#38bdf8',
  Vocals: '#e879f9',
  FX: '#fbbf24',
};

interface SampleForm {
  name: string;
  category: string;
  instrument: string;
  bpm: number | '';
  keyRoot: number | '';
  description: string;
  color: string;
  duration: number;
  source: string;
  tags: string;
}

const emptyForm = (): SampleForm => ({
  name: '',
  category: 'Drums',
  instrument: 'kick',
  bpm: '',
  keyRoot: '',
  description: '',
  color: 'rose',
  duration: 1,
  source: 'generated',
  tags: '',
});

function SampleModal({
  open,
  onClose,
  sample,
}: {
  open: boolean;
  onClose: () => void;
  sample: Sample | null;
}) {
  const create = useCreateSample();
  const update = useUpdateSample();
  const [form, setForm] = useState<SampleForm>(() =>
    sample
      ? {
          name: sample.name,
          category: sample.category,
          instrument: sample.instrument,
          bpm: sample.bpm ?? '',
          keyRoot: sample.key_root ?? '',
          description: sample.description,
          color: sample.color,
          duration: sample.duration,
          source: sample.source,
          tags: sample.tags.join(', '),
        }
      : emptyForm()
  );

  const save = () => {
    const payload = {
      name: form.name.trim() || 'Untitled Sample',
      category: form.category,
      instrument: form.instrument,
      bpm: form.bpm === '' ? null : Number(form.bpm),
      keyRoot: form.keyRoot === '' ? null : Number(form.keyRoot),
      description: form.description.trim(),
      color: form.color,
      duration: Number(form.duration),
      source: form.source,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8),
    };
    if (sample) {
      update.mutate({ id: sample.id, patch: payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={sample ? 'Edit sample' : 'Add a sample'}
      description={sample ? 'Update the metadata for this sound.' : 'Samples are metadata-first — perfect for tracking your own recordings and sketches.'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => engine.previewPreset(form.instrument, defaultParams(form.instrument), form.keyRoot === '' ? 57 : Number(form.keyRoot) + 60)}>
            Audition
          </Button>
          <Button variant="primary" loading={create.isPending || update.isPending} onClick={save}>
            {sample ? 'Save changes' : 'Add to library'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" className="sm:col-span-2">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} placeholder="e.g. Neon Kick 01" />
        </Field>
        <Field label="Category">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {SAMPLE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Preview engine">
          <Select value={form.instrument} onChange={(e) => setForm({ ...form, instrument: e.target.value })}>
            <optgroup label="Drums">
              {DRUM_INSTRUMENTS.map((id) => (
                <option key={id} value={id}>
                  {INSTRUMENTS[id].label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Synths">
              {SYNTH_INSTRUMENTS.map((id) => (
                <option key={id} value={id}>
                  {INSTRUMENTS[id].label}
                </option>
              ))}
            </optgroup>
            <option value="sample">Generic texture</option>
          </Select>
        </Field>
        <Field label="Duration" hint={`${Number(form.duration).toFixed(1)} seconds`}>
          <input
            type="range"
            min={0.1}
            max={30}
            step={0.1}
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
            className="mt-3 w-full"
          />
        </Field>
        <Field label="Source">
          <Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
            <option value="generated">Generated</option>
            <option value="recorded">Recorded</option>
            <option value="imported">Imported</option>
          </Select>
        </Field>
        <Field label="Tempo (optional)">
          <Input
            type="number"
            min={40}
            max={250}
            value={form.bpm}
            onChange={(e) => setForm({ ...form, bpm: e.target.value === '' ? '' : Number(e.target.value) })}
            placeholder="One-shot"
            className="font-mono"
          />
        </Field>
        <Field label="Key (optional)">
          <Select value={form.keyRoot} onChange={(e) => setForm({ ...form, keyRoot: e.target.value === '' ? '' : Number(e.target.value) })}>
            <option value="">Unpitched</option>
            {NOTE_NAMES.map((n, i) => (
              <option key={n} value={i}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            maxLength={300}
            placeholder="How does it sound? When would you reach for it?"
          />
        </Field>
        <Field label="Tags" hint="Comma separated" className="sm:col-span-2">
          <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="kick, 808, punchy" />
        </Field>
        <Field label="Accent colour" className="sm:col-span-2">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(COLORS).map(([key, hex]) => (
              <button
                key={key}
                onClick={() => setForm({ ...form, color: key })}
                className={cn(
                  'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
                  form.color === key ? 'border-white' : 'border-transparent'
                )}
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

export default function Samples() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState(false);
  const { data: samples, isLoading } = useSamples({ category, query, favorite: favorites });
  const { data: stats } = useStats();
  const update = useUpdateSample();
  const remove = useDeleteSample();
  const qc = useQueryClient();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sample | null>(null);
  const [deleting, setDeleting] = useState<Sample | null>(null);

  const categories = useMemo(() => SAMPLE_CATEGORIES, []);
  const hasFilters = !!query || category !== 'All' || favorites;

  const play = (sample: Sample) => {
    const params = defaultParams(sample.instrument);
    const midi = sample.key_root != null ? 60 + sample.key_root : 57;
    engine.previewPreset(sample.instrument, { ...params, ...(sample.instrument === 'sample' ? { wave: 'triangle', cutoff: 0.5, decay: 0.4, sustain: 0.1 } : {}) }, midi);
    setPlayingId(sample.id);
    window.setTimeout(() => setPlayingId((current) => (current === sample.id ? null : current)), Math.min(4000, Math.max(600, sample.duration * 1000)));
    qc.setQueriesData<Sample[]>({ queryKey: ['samples'] }, (old) =>
      old?.map((s) => (s.id === sample.id ? { ...s, plays: s.plays + 1 } : s))
    );
    void api.samples.play(sample.id).catch(() => undefined);
  };

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <span className="h-1 w-1 rounded-full bg-acid-300" /> Library
          </>
        }
        title="Sample library"
        description={
          stats
            ? `${stats.totals.samples} sounds catalogued across drums, loops, vocals and FX — searchable and ready to preview.`
            : 'One-shots, loops and textures.'
        }
        actions={
          <>
            <Button
              variant="outline"
              icon={<Heart className={cn('h-4 w-4', favorites && 'fill-acid-300 text-acid-300')} />}
              onClick={() => setFavorites((v) => !v)}
            >
              {favorites ? 'Favorites' : 'All sounds'}
            </Button>
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Add sample
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
                'flex h-7 items-center gap-1.5 rounded-[10px] px-2.5 text-[11px] font-medium transition-colors',
                category === c ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-200'
              )}
            >
              {c !== 'All' && <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_COLORS[c] }} />}
              {c}
            </button>
          ))}
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search samples…" className="ml-auto w-full sm:w-60" />
        <span className="hidden rounded-md border border-ink-700/60 bg-ink-800/50 px-2 py-1 font-mono text-[10px] text-ink-500 md:block">
          {isLoading ? '…' : `${samples?.length ?? 0} results`}
        </span>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="panel p-3">
              <div className="shimmer h-24 rounded-lg bg-ink-750" />
              <div className="mt-3 space-y-2">
                <div className="shimmer h-3 w-2/3 rounded bg-ink-750" />
                <div className="shimmer h-2.5 w-1/2 rounded bg-ink-750" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && samples && samples.length === 0 && (
        <EmptyState
          icon={hasFilters ? <SearchX className="h-5 w-5" /> : <Music2 className="h-5 w-5" />}
          title={hasFilters ? 'No samples match' : 'Your library is empty'}
          description={
            hasFilters
              ? 'Try another category or search term.'
              : 'Catalogue your favourite one-shots, loops and textures so they’re always a click away.'
          }
          action={
            hasFilters ? (
              <Button onClick={() => { setCategory('All'); setQuery(''); setFavorites(false); }}>Clear filters</Button>
            ) : (
              <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>
                Add your first sample
              </Button>
            )
          }
        />
      )}

      {!isLoading && samples && samples.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {samples.map((sample) => {
            const color = colorOf(sample.color);
            const isPlaying = playingId === sample.id;
            return (
              <div
                key={sample.id}
                className="group relative overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850/70 transition-all hover:border-ink-600 hover:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)]"
              >
                <div
                  className="relative flex h-24 items-center justify-between px-3"
                  style={{ background: `linear-gradient(135deg, ${color}22, rgba(9,11,16,0.25) 65%)` }}
                >
                  <div className="pointer-events-none absolute -right-6 -top-10 h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ background: color }} />
                  <button
                    onClick={() => play(sample)}
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-full border transition-all',
                      isPlaying
                        ? 'border-acid-300 bg-acid-300 text-ink-950 shadow-[0_0_26px_-6px_rgba(214,255,77,0.8)]'
                        : 'border-white/10 bg-ink-950/60 text-ink-100 backdrop-blur hover:border-acid-300/50 hover:text-acid-300'
                    )}
                    aria-label={isPlaying ? 'Stop preview' : 'Preview sample'}
                  >
                    {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
                  </button>
                  <div className="min-w-0 flex-1 px-3">
                    <MiniWave seed={sample.id} bars={24} color={color} className={cn('h-7 transition-opacity', isPlaying ? 'opacity-100' : 'opacity-60')} />
                  </div>
                  <span className="rounded border border-white/10 bg-ink-950/40 px-1.5 py-0.5 font-mono text-[9px] text-ink-300">
                    {sample.duration < 1 ? `${Math.round(sample.duration * 1000)}ms` : `${sample.duration.toFixed(sample.duration < 10 ? 1 : 0)}s`}
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-medium text-ink-100">{sample.name}</h3>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-500">
                        <span style={{ color }}>{sample.category}</span>
                        {sample.bpm && (
                          <>
                            <span className="text-ink-700">·</span>
                            <span className="font-mono">{sample.bpm} BPM</span>
                          </>
                        )}
                        {sample.key_root != null && (
                          <>
                            <span className="text-ink-700">·</span>
                            <span>{NOTE_NAMES[sample.key_root]}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <IconButton
                        label={sample.favorite ? 'Unfavorite' : 'Favorite'}
                        size="xs"
                        onClick={() => update.mutate({ id: sample.id, patch: { favorite: !sample.favorite } })}
                      >
                        <Star className={cn('h-3.5 w-3.5', sample.favorite ? 'fill-acid-300 text-acid-300' : 'text-ink-500')} />
                      </IconButton>
                      <Dropdown
                        align="right"
                        width="w-40"
                        trigger={
                          <IconButton label="Sample actions" size="xs">
                            <span className="text-[10px]">···</span>
                          </IconButton>
                        }
                      >
                        {(close) => (
                          <>
                            <DropdownItem icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => { close(); setEditing(sample); setModalOpen(true); }}>
                              Edit sample
                            </DropdownItem>
                            <DropdownItem icon={<Play className="h-3.5 w-3.5" />} onClick={() => { close(); play(sample); }}>
                              Preview
                            </DropdownItem>
                            <div className="my-1 h-px bg-ink-700/70" />
                            <DropdownItem danger icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => { close(); setDeleting(sample); }}>
                              Delete sample
                            </DropdownItem>
                          </>
                        )}
                      </Dropdown>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-[28px] text-[11px] leading-relaxed text-ink-500">{sample.description || 'No description yet.'}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-ink-700/50 pt-2">
                    <div className="flex flex-wrap gap-1">
                      {sample.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} className="text-[9px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="shrink-0 font-mono text-[9px] text-ink-600">{sample.plays} plays</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <SampleModal
          key={editing?.id || 'new'}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          sample={editing}
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
        description="This removes the sample from your library. Existing project tracks are not affected."
      />
    </Page>
  );
}
