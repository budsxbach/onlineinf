import { FolderOpen, Grid3x3, List, Plus, SearchX, SlidersHorizontal, Sparkles, Star, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Page, PageHeader } from '../components/layout/Page';
import { ProjectCard, ProjectCardSkeleton } from '../components/ProjectCard';
import {
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  SearchInput,
  Select,
  Segmented,
  StatusBadge,
  cn,
} from '../components/ui';
import { useCreateProject, useProjects, useSettings, useStats } from '../lib/hooks';
import { GENRES, NOTE_NAMES, SCALES, SCALE_LABELS, STATUSES, STATUS_META } from '../lib/music';
import type { Project, ProjectStatus } from '../lib/types';

const THEMES = ['nebula', 'sunset', 'monolith', 'glass', 'ember', 'tidal', 'rings'];

const TEMPLATES = [
  {
    id: 'starter',
    name: 'Starter groove',
    description: 'Kick, snare, hats, bass and a pad — straight into the sequencer.',
    icon: <Wand2 className="h-3.5 w-3.5" />,
  },
  {
    id: 'blank',
    name: 'Blank canvas',
    description: 'Empty session. Add your own instruments from scratch.',
    icon: <SlidersHorizontal className="h-3.5 w-3.5" />,
  },
  {
    id: 'ai',
    name: 'Composer sketch',
    description: 'Start from a prompt with the Arena co-writer instead.',
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
];

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ProjectStatus>('all');
  const [genre, setGenre] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState('updated');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [modalOpen, setModalOpen] = useState(false);

  const filters = useMemo(
    () => ({ query, status, genre, favorite: favoritesOnly, sort }),
    [query, status, genre, favoritesOnly, sort]
  );
  const { data: projects, isLoading, isFetching } = useProjects(filters);
  const { data: stats } = useStats();
  const { data: settings } = useSettings();
  const createProject = useCreateProject();

  const [form, setForm] = useState({
    title: '',
    genre: 'Melodic House',
    bpm: 120,
    keyRoot: 0,
    scale: 'minor',
    status: 'sketch' as ProjectStatus,
    theme: 'nebula',
    template: 'starter',
  });

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setModalOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openNew = () => {
    setForm({
      title: '',
      genre: 'Melodic House',
      bpm: Number(settings?.['user.defaultBpm'] || 120),
      keyRoot: 0,
      scale: 'minor',
      status: 'sketch',
      theme: THEMES[Math.floor(Math.random() * THEMES.length)],
      template: 'starter',
    });
    setModalOpen(true);
  };

  const submit = () => {
    if (form.template === 'ai') {
      setModalOpen(false);
      navigate(`/composer?genre=${encodeURIComponent(form.genre)}&bpm=${form.bpm}`);
      return;
    }
    const title = form.title.trim() || 'Untitled Session';
    createProject.mutate(
      {
        title,
        genre: form.genre,
        bpm: form.bpm,
        key_root: form.keyRoot,
        scale: form.scale,
        status: form.status,
        cover: { theme: form.theme, hue: (form.keyRoot * 31) % 360 },
        tracks: form.template === 'blank' ? [] : undefined,
        sections: ['Intro', 'Groove', 'Breakdown', 'Drop'],
        arrangement: [
          { bank: 'A', repeats: 2 },
          { bank: 'B', repeats: 2 },
          { bank: 'D', repeats: 2 },
        ],
        description: '',
      },
      {
        onSuccess: (project: Project) => {
          setModalOpen(false);
          navigate(`/studio/${project.id}`);
        },
      }
    );
  };

  const statusCounts = stats?.statusCounts;
  const hasFilters = !!query || status !== 'all' || genre !== 'all' || favoritesOnly;

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <span className="h-1 w-1 rounded-full bg-acid-300" />
            Project vault
          </>
        }
        title="Every session, one place."
        description={
          stats
            ? `${stats.totals.projects} sessions · ${stats.totals.tracks} tracks · ${stats.totals.favorites} pinned. Everything is saved to the local studio database.`
            : 'Your sessions, sketches and finished masters.'
        }
        actions={
          <>
            <Button
              variant="outline"
              icon={<Star className={cn('h-4 w-4', favoritesOnly && 'fill-acid-300 text-acid-300')} />}
              onClick={() => setFavoritesOnly((v) => !v)}
            >
              {favoritesOnly ? 'Showing pinned' : 'Pinned only'}
            </Button>
            <Button variant="primary" icon={<Plus className="h-4 w-4" strokeWidth={2.6} />} onClick={openNew}>
              New project
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-ink-700/70 bg-ink-900/60 p-0.5">
            <button
              onClick={() => setStatus('all')}
              className={cn(
                'h-7 rounded-[10px] px-2.5 text-[11px] font-medium transition-colors',
                status === 'all' ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-200'
              )}
            >
              All
              <span className="ml-1.5 font-mono text-[9px] text-ink-500">{stats?.totals.projects ?? '—'}</span>
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-[10px] px-2.5 text-[11px] font-medium transition-colors',
                  status === s ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-200'
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_META[s].dot }} />
                {STATUS_META[s].label}
                <span className="font-mono text-[9px] text-ink-500">{statusCounts?.[s] ?? '—'}</span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-1 flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
            <SearchInput value={query} onChange={setQuery} placeholder="Search projects…" className="w-full sm:w-56" />
            <Select value={genre} onChange={(e) => setGenre(e.target.value)} className="h-9 w-full py-0 text-xs sm:w-40">
              <option value="all">All genres</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 w-full py-0 text-xs sm:w-36">
              <option value="updated">Recently edited</option>
              <option value="created">Newest</option>
              <option value="title">A – Z</option>
              <option value="bpm">Fastest BPM</option>
            </Select>
            <Segmented
              value={view}
              onChange={setView}
              size="sm"
              options={[
                { value: 'grid', label: '', icon: <Grid3x3 className="h-3.5 w-3.5" /> },
                { value: 'list', label: '', icon: <List className="h-3.5 w-3.5" /> },
              ]}
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2 text-[11px] text-ink-500">
            <span>
              {isFetching ? 'Filtering…' : `${projects?.length ?? 0} ${projects?.length === 1 ? 'match' : 'matches'}`}
            </span>
            <button
              onClick={() => {
                setQuery('');
                setStatus('all');
                setGenre('all');
                setFavoritesOnly(false);
              }}
              className="text-acid-300/80 hover:text-acid-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'space-y-2'}>
          {Array.from({ length: view === 'grid' ? 8 : 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} view={view} />
          ))}
        </div>
      )}

      {!isLoading && projects && projects.length === 0 && (
        <EmptyState
          icon={hasFilters ? <SearchX className="h-5 w-5" /> : <FolderOpen className="h-5 w-5" />}
          title={hasFilters ? 'No sessions match those filters' : 'The vault is empty'}
          description={
            hasFilters
              ? 'Try a different status, genre or search term — or clear the filters to see everything.'
              : 'Start a new session and it will be saved here automatically, with every track and pattern.'
          }
          action={
            hasFilters ? (
              <Button
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                  setGenre('all');
                  setFavoritesOnly(false);
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openNew}>
                Create your first project
              </Button>
            )
          }
        />
      )}

      {!isLoading && projects && projects.length > 0 && (
        <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'space-y-2'}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} view={view} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Start a new session"
        description="Pick a template and key — you can change everything later."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit} loading={createProject.isPending}>
              {form.template === 'ai' ? 'Open composer' : 'Create & open studio'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Project title" className="sm:col-span-2">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Midnight Transit"
                maxLength={80}
                autoFocus
              />
            </Field>
            <Field label="Genre">
              <Select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tempo" hint="50 – 220 BPM">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={50}
                  max={220}
                  value={form.bpm}
                  onChange={(e) => setForm({ ...form, bpm: Math.min(220, Math.max(50, Number(e.target.value) || 120)) })}
                  className="font-mono"
                />
                <span className="text-xs text-ink-500">BPM</span>
              </div>
            </Field>
            <Field label="Key">
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.keyRoot} onChange={(e) => setForm({ ...form, keyRoot: Number(e.target.value) })}>
                  {NOTE_NAMES.map((n, i) => (
                    <option key={n} value={i}>
                      {n}
                    </option>
                  ))}
                </Select>
                <Select value={form.scale} onChange={(e) => setForm({ ...form, scale: e.target.value })}>
                  {Object.keys(SCALES).map((s) => (
                    <option key={s} value={s}>
                      {SCALE_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
            </Field>
            <Field label="Cover theme" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, theme: t })}
                    className={cn(
                      'group relative h-11 w-16 overflow-hidden rounded-lg border transition-all',
                      form.theme === t ? 'border-acid-300 ring-2 ring-acid-300/20' : 'border-ink-700 hover:border-ink-500'
                    )}
                  >
                    <div
                      className="h-full w-full"
                      style={{
                        background:
                          t === 'nebula'
                            ? 'radial-gradient(circle at 30% 30%, #a78bfa, #0b0b1a 70%)'
                            : t === 'sunset'
                            ? 'linear-gradient(160deg, #fbbf24, #fb7185 50%, #1a0b10)'
                            : t === 'monolith'
                            ? 'linear-gradient(120deg, #0a0c0a 40%, #d6ff4d 50%, #0a0c0a 60%)'
                            : t === 'glass'
                            ? 'linear-gradient(140deg, #5eead4, #818cf8 60%, #071014)'
                            : t === 'ember'
                            ? 'radial-gradient(circle at 70% 70%, #fbbf24, #fb7185 40%, #170a0a)'
                            : t === 'tidal'
                            ? 'linear-gradient(150deg, #38bdf8, #34d399 60%, #06101a)'
                            : 'conic-gradient(from 180deg, #e879f9, #a78bfa, #0f0818)',
                      }}
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-ink-950/70 py-0.5 text-[8px] uppercase tracking-wider text-ink-300">
                      {t}
                    </span>
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div>
            <p className="label-mono mb-2">Start from</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setForm({ ...form, template: t.id })}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all',
                    form.template === t.id
                      ? 'border-acid-300/60 bg-acid-300/[0.06]'
                      : 'border-ink-700 bg-ink-800/40 hover:border-ink-600'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-md border',
                      form.template === t.id ? 'border-acid-300/40 bg-acid-300/15 text-acid-300' : 'border-ink-600 text-ink-400'
                    )}
                  >
                    {t.icon}
                  </span>
                  <p className="mt-2 text-xs font-medium text-ink-100">{t.name}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-ink-500">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-ink-700/60 bg-ink-800/40 px-3 py-2.5">
            <StatusBadge status={form.status} />
            <span className="text-[11px] text-ink-500">
              {form.title.trim() || 'Untitled Session'} · {form.genre} · {NOTE_NAMES[form.keyRoot]} {SCALE_LABELS[form.scale]} ·{' '}
              {form.bpm} BPM
            </span>
          </div>
        </div>
      </Modal>
    </Page>
  );
}
