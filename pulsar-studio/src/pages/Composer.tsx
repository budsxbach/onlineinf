import {
  ArrowUpRight,
  Bookmark,
  Check,
  Clock,
  Cpu,
  Disc3,
  KeyRound,
  MoreHorizontal,
  RefreshCw,
  SearchX,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  SearchInput,
  Select,
  Switch,
  Textarea,
  cn,
} from '../components/ui';
import { timeAgo } from '../lib/format';
import {
  useDeleteIdea,
  useGenerateIdea,
  useIdeas,
  useOpenIdea,
  useRetryIdea,
  useSettings,
  useUpdateIdea,
} from '../lib/hooks';
import { GENRES, NOTE_NAMES, PROMPT_IDEAS, SCALES, SCALE_LABELS, keyLabel } from '../lib/music';
import type { Idea } from '../lib/types';

const STATUS_FILTERS = [
  { id: 'all', label: 'All ideas' },
  { id: 'ready', label: 'Ready' },
  { id: 'saved', label: 'Saved' },
  { id: 'failed', label: 'Failed' },
];

function statusMeta(status: Idea['status']) {
  switch (status) {
    case 'ready':
      return { label: 'Ready', color: '#d6ff4d' };
    case 'saved':
      return { label: 'Saved', color: '#5eead4' };
    case 'failed':
      return { label: 'Failed', color: '#fb7185' };
    case 'generating':
      return { label: 'Composing', color: '#fbbf24' };
    default:
      return { label: 'Draft', color: '#94a3b8' };
  }
}

function IdeaCard({
  idea,
  onOpen,
  opening,
  highlighted,
}: {
  idea: Idea;
  onOpen: (id: string) => void;
  opening: boolean;
  highlighted?: boolean;
}) {
  const retry = useRetryIdea();
  const update = useUpdateIdea();
  const remove = useDeleteIdea();
  const [confirm, setConfirm] = useState(false);
  const meta = statusMeta(idea.status);
  const isFailed = idea.status === 'failed';
  const isGenerating = idea.status === 'generating';

  return (
    <>
      <div
        className={cn(
          'panel relative overflow-hidden p-4 transition-all',
          highlighted && 'border-acid-300/40 shadow-[0_0_50px_-20px_rgba(214,255,77,0.4)]'
        )}
      >
        <div className="absolute inset-y-0 left-0 w-[2px]" style={{ background: `${meta.color}88` }} />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-ink-100">{idea.title || 'Untitled idea'}</h3>
              <Badge dot color={meta.color}>
                {meta.label}
              </Badge>
              <Badge color={idea.engine === 'arena' ? '#5eead4' : '#94a3b8'}>{idea.engine === 'arena' ? 'Arena router' : 'Local'}</Badge>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-ink-500">
              <span>{idea.genre || 'Unclassified'}</span>
              <span className="text-ink-700">·</span>
              <span className="font-mono">{idea.bpm || '—'} BPM</span>
              {idea.key_root != null && (
                <>
                  <span className="text-ink-700">·</span>
                  <span>{keyLabel(idea.key_root, idea.scale || undefined)}</span>
                </>
              )}
              <span className="text-ink-700">·</span>
              <span>{timeAgo(idea.created_at)}</span>
            </p>
          </div>
          <Dropdown
            align="right"
            width="w-40"
            trigger={
              <IconButton label="Idea actions" size="xs">
                <MoreHorizontal className="h-3.5 w-3.5 text-ink-400" />
              </IconButton>
            }
          >
            {(close) => (
              <>
                <DropdownItem
                  icon={<Bookmark className="h-3.5 w-3.5" />}
                  onClick={() => {
                    update.mutate({ id: idea.id, patch: { status: idea.status === 'saved' ? 'ready' : 'saved' } });
                    close();
                  }}
                >
                  {idea.status === 'saved' ? 'Mark as ready' : 'Save for later'}
                </DropdownItem>
                <div className="my-1 h-px bg-ink-700/70" />
                <DropdownItem danger icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => { close(); setConfirm(true); }}>
                  Delete idea
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>

        <blockquote className="mt-3 rounded-lg border border-ink-700/50 bg-ink-900/50 px-3 py-2 text-[11px] italic leading-relaxed text-ink-400">
          “{idea.prompt}”
        </blockquote>

        {idea.summary && <p className="mt-2.5 text-[11px] leading-relaxed text-ink-500">{idea.summary}</p>}
        {isFailed && idea.error && (
          <p className="mt-2.5 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-[11px] leading-relaxed text-rose-200/80">
            {idea.error}
          </p>
        )}

        {isGenerating ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2">
            <span className="flex items-end gap-[2px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-[2px] animate-pulse rounded-full bg-amber-300"
                  style={{ height: 4 + i * 2, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </span>
            <span className="text-[10px] text-amber-200/80">Composing…</span>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {isFailed ? (
              <>
                <Button
                  size="xs"
                  variant="primary"
                  loading={retry.isPending}
                  icon={<RefreshCw className="h-3 w-3" />}
                  onClick={() => retry.mutate({ id: idea.id })}
                >
                  Retry
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  icon={<Cpu className="h-3 w-3" />}
                  loading={retry.isPending}
                  onClick={() => retry.mutate({ id: idea.id, preferLocal: true })}
                >
                  Compose locally
                </Button>
              </>
            ) : (
              <Button
                size="xs"
                variant={idea.status === 'ready' ? 'primary' : 'secondary'}
                loading={opening}
                icon={<ArrowUpRight className="h-3 w-3" />}
                onClick={() => onOpen(idea.id)}
              >
                Open in studio
              </Button>
            )}
            {idea.engine === 'arena' && idea.model && (
              <span className="rounded border border-ink-700/60 px-1.5 py-0.5 font-mono text-[9px] text-ink-500">
                {idea.model}
              </span>
            )}
            {idea.project_id && (
              <Badge color="#d6ff4d">
                <Check className="h-2.5 w-2.5" /> project linked
              </Badge>
            )}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          remove.mutate(idea.id);
          setConfirm(false);
        }}
        title="Delete this idea?"
        description="The generated sketch will be removed from your idea bank."
      />
    </>
  );
}

export default function Composer() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: settings } = useSettings();
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState<string>(params.get('genre') || 'Melodic House');
  const [bpm, setBpm] = useState<number>(Number(params.get('bpm')) || 120);
  const [keyRoot, setKeyRoot] = useState<number>(0);
  const [scale, setScale] = useState('minor');
  const [createProject, setCreateProject] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [highlight, setHighlight] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const openedAt = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: ideas, isLoading } = useIdeas({ status: filter === 'all' ? undefined : filter, query: search });
  const generate = useGenerateIdea();
  const open = useOpenIdea();

  const hasKey = !!settings?.['ai.hasKey'];
  const isGenerating = generate.isPending;

  useEffect(() => {
    if (!isGenerating) {
      openedAt.current = null;
      setElapsed(0);
      return;
    }
    openedAt.current = Date.now();
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - (openedAt.current || Date.now())) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  const filtered = useMemo(() => ideas || [], [ideas]);

  const submit = (openAfter: boolean) => {
    if (prompt.trim().length < 4) return;
    generate.mutate(
      {
        prompt: prompt.trim(),
        genre,
        bpm,
        keyRoot,
        scale,
        createProject: openAfter,
      },
      {
        onSuccess: (result) => {
          setPrompt('');
          if (openAfter && result.projectId) {
            navigate(`/studio/${result.projectId}`);
            return;
          }
          setHighlight(result.idea.id);
          window.setTimeout(() => setHighlight(null), 4000);
        },
      }
    );
  };

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <span className="relative flex h-2 w-2">
              <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-60', hasKey ? 'animate-ping bg-acid-300' : 'bg-amber-400')} />
              <span className={cn('relative inline-flex h-2 w-2 rounded-full', hasKey ? 'bg-acid-300' : 'bg-amber-400')} />
            </span>
            {hasKey ? 'Arena router online' : 'Local composer mode'}
          </>
        }
        title="Describe it. Hear it."
        description="Write a brief, set a few guardrails, and the co-writer builds a complete multi-track arrangement you can edit like any other session."
        actions={
          hasKey ? (
            <Badge color="#5eead4" dot>
              {String(settings?.['ai.model'] || 'coding-router-preview')}
            </Badge>
          ) : (
            <Link to="/settings">
              <Button variant="outline" icon={<KeyRound className="h-4 w-4" />}>
                Add Arena key
              </Button>
            </Link>
          )
        }
      />

      {!hasKey && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3">
          <Zap className="h-4 w-4 shrink-0 text-amber-300" />
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-amber-100/80">
            No Arena API key yet — ideas will be composed by the built-in local engine. Add a key in{' '}
            <Link to="/settings" className="underline decoration-amber-300/40 hover:text-amber-200">
              Settings → AI engine
            </Link>{' '}
            to route prompts through Arena with the model of your choice.
          </p>
          <Badge color="#fbbf24">fallback active</Badge>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="panel relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-acid-300/[0.06] blur-3xl" />
          <div className="border-b border-ink-700/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-acid-300/10 text-acid-300">
                <Wand2 className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-ink-100">New composition</p>
                <p className="text-[10px] text-ink-500">One prompt → drums, bass, harmony and a hook.</p>
              </div>
              <span className="ml-auto font-mono text-[10px] text-ink-600">{prompt.length}/600</span>
            </div>
          </div>
          <div className="space-y-4 p-4">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 600))}
              placeholder="e.g. A slow-burning melodic house track in F minor at 124 BPM. Rolling bass, airy pads, a hypnotic arp and a patient breakdown before the drop."
              rows={4}
              className="min-h-[112px] border-ink-700/80 bg-ink-900/70 text-[13px]"
            />
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_IDEAS.slice(0, 4).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPrompt(p);
                    textareaRef.current?.focus();
                  }}
                  className="max-w-full truncate rounded-full border border-ink-700 bg-ink-800/50 px-2.5 py-1 text-[10px] text-ink-400 transition-colors hover:border-acid-300/30 hover:text-acid-200"
                >
                  {p.length > 58 ? `${p.slice(0, 58)}…` : p}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Genre">
                <Select value={genre} onChange={(e) => setGenre(e.target.value)} className="h-9 py-0 text-xs">
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tempo">
                <div className="relative">
                  <Input
                    type="number"
                    min={50}
                    max={220}
                    value={bpm}
                    onChange={(e) => setBpm(Math.min(220, Math.max(50, Number(e.target.value) || 120)))}
                    className="h-9 py-0 pr-12 font-mono text-xs"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-wider text-ink-600">
                    bpm
                  </span>
                </div>
              </Field>
              <Field label="Key">
                <Select value={keyRoot} onChange={(e) => setKeyRoot(Number(e.target.value))} className="h-9 py-0 text-xs">
                  {NOTE_NAMES.map((n, i) => (
                    <option key={n} value={i}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Scale">
                <Select value={scale} onChange={(e) => setScale(e.target.value)} className="h-9 py-0 text-xs">
                  {Object.keys(SCALES).map((s) => (
                    <option key={s} value={s}>
                      {SCALE_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-700/50 pt-3">
              <Switch
                checked={createProject}
                onChange={setCreateProject}
                label="Open in studio when ready"
                description="Skip the idea bank and jump straight into the sequencer."
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => submit(false)}
                  disabled={isGenerating || prompt.trim().length < 4}
                  icon={<Bookmark className="h-4 w-4" />}
                >
                  Save to idea bank
                </Button>
                <Button
                  variant="primary"
                  onClick={() => submit(createProject)}
                  disabled={isGenerating || prompt.trim().length < 4}
                  loading={isGenerating}
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  {isGenerating ? 'Composing…' : createProject ? 'Compose & open' : 'Compose idea'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-ink-400" />
              <p className="label-mono">Engine</p>
            </div>
            <div className="mt-3 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-ink-500">Provider</span>
                <span className="font-mono text-ink-200">Arena router</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-500">Model</span>
                <span className="truncate font-mono text-ink-200">{String(settings?.['ai.model'] || '—')}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-500">Endpoint</span>
                <span className="truncate font-mono text-[10px] text-ink-400">{String(settings?.['ai.baseUrl'] || '—')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-500">API key</span>
                <span className={cn('font-mono', hasKey ? 'text-acid-300' : 'text-amber-300')}>
                  {hasKey ? String(settings?.['ai.keyHint'] || 'configured') : 'not set'}
                </span>
              </div>
            </div>
            <Link
              to="/settings"
              className="mt-3 flex items-center justify-between rounded-lg border border-ink-700/60 bg-ink-800/40 px-2.5 py-2 text-[10px] text-ink-400 transition-colors hover:border-ink-600 hover:text-ink-200"
            >
              Manage AI settings
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="panel p-4">
            <p className="label-mono">How it composes</p>
            <ol className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-ink-500">
              {[
                'Reads your brief for genre, tempo and key clues.',
                'Chooses a groove template and chord progression.',
                'Writes drums, bass, harmony, lead and texture tracks.',
                'Saves a 32-step pattern per bank plus a full arrangement.',
              ].map((step, i) => (
                <li key={step} className="flex gap-2.5">
                  <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink-600 font-mono text-[8px] text-ink-400">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-3 border-t border-ink-700/50 pt-2.5 text-[10px] text-ink-600">
              Everything is editable. Nothing is locked behind a plugin licence.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3 mt-8 flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-ink-100">Idea bank</h2>
        <span className="rounded border border-ink-700 bg-ink-800/60 px-1.5 py-px font-mono text-[9px] text-ink-500">
          {filtered.length}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search ideas…" className="w-44" />
          <div className="flex items-center gap-0.5 rounded-lg border border-ink-700/70 bg-ink-900/60 p-0.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'h-7 rounded-md px-2.5 text-[10px] font-medium transition-colors',
                  filter === f.id ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-200'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="mb-3 overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-400/[0.08] to-ink-850/60 p-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-300/10">
              <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-amber-100">
                {hasKey ? 'Arena router is arranging your track…' : 'Local engine is arranging your track…'}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-amber-100/50">
                {genre} · {bpm} BPM · {keyLabel(keyRoot, scale)} · {elapsed}s elapsed
              </p>
            </div>
            <span className="hidden font-mono text-[10px] text-amber-100/40 sm:block">
              {hasKey ? String(settings?.['ai.model'] || 'router') : 'offline composer'}
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            {[92, 78, 85, 64].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-14 shrink-0 rounded-full bg-amber-300/10" />
                <div className="h-1.5 overflow-hidden rounded-full bg-amber-300/10" style={{ width: `${w}%` }}>
                  <div className="h-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" style={{ animationDelay: `${i * 0.12}s` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-3 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="panel h-48 p-4">
              <div className="shimmer h-full rounded-lg bg-ink-750/60" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={search ? <SearchX className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          title={search ? 'No ideas match that search' : 'No ideas yet'}
          description={
            search
              ? 'Try a different phrase, or clear the search to see every sketch.'
              : 'Write a brief above and the co-writer will build a full arrangement you can open in the studio.'
          }
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              highlighted={highlight === idea.id}
              opening={open.isPending && open.variables === idea.id}
              onOpen={(id) =>
                open.mutate(id, {
                  onSuccess: (project) => navigate(`/studio/${project.id}`),
                })
              }
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-700/50 bg-ink-900/40 px-4 py-3 text-[10px] text-ink-600">
        <span className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Ideas keep their full arrangement data — open one later without regenerating.
        </span>
        <span className="flex items-center gap-2">
          <Disc3 className="h-3 w-3" />
          {filtered.filter((i) => i.engine === 'arena').length} of {filtered.length} composed by Arena
        </span>
      </div>
    </Page>
  );
}
