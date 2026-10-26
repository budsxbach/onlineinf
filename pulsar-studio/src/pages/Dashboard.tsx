import {
  ArrowRight,
  AudioLines,
  Clock,
  Disc3,
  FolderOpen,
  Layers,
  Play,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
  Wand2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CoverArt } from '../components/CoverArt';
import { Page, PageHeader } from '../components/layout/Page';
import { ProjectCard, ProjectCardSkeleton } from '../components/ProjectCard';
import { Badge, Button, EmptyState, SectionHeader, Skeleton, StatusBadge, cn } from '../components/ui';
import { formatDuration, formatMinutes, timeAgo } from '../lib/format';
import { useProjects, useSettings, useStats } from '../lib/hooks';
import { engine } from '../lib/engine';
import { keyLabel } from '../lib/music';
import type { Idea, Preset, Project } from '../lib/types';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: string;
}) {
  return (
    <div className="panel relative overflow-hidden p-4">
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: accent || '#d6ff4d' }}
      />
      <div className="flex items-center justify-between">
        <span className="label-mono">{label}</span>
        <span className="text-ink-500" style={{ color: accent || undefined }}>
          {icon}
        </span>
      </div>
      <div className="mt-3 font-mono text-[26px] font-medium leading-none tracking-tight text-ink-100">{value}</div>
      <p className="mt-1.5 text-[11px] text-ink-500">{hint}</p>
    </div>
  );
}

function ActivityChart({ activity }: { activity: { date: string; total: number; projects: number; ideas: number }[] }) {
  const max = Math.max(1, ...activity.map((a) => a.total));
  return (
    <div className="panel flex h-full flex-col p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink-100">Session activity</h3>
          <p className="mt-0.5 text-[11px] text-ink-500">Projects touched & ideas composed</p>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-ink-700 px-2 py-0.5 text-[9px] uppercase tracking-widest text-ink-400">
          <TrendingUp className="h-2.5 w-2.5 text-acid-300" /> 14d
        </span>
      </div>
      <div className="mt-5 flex flex-1 items-end gap-1.5">
        {activity.map((a) => {
          const height = a.total === 0 ? 6 : Math.max(10, (a.total / max) * 100);
          return (
            <div key={a.date} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div className="pointer-events-none absolute -top-7 z-10 hidden whitespace-nowrap rounded border border-ink-700 bg-ink-800 px-1.5 py-1 text-[9px] text-ink-300 shadow-lg group-hover:block">
                {a.total} {a.total === 1 ? 'edit' : 'edits'} · {a.date.slice(5)}
              </div>
              <div
                className={cn(
                  'w-full rounded-[3px] transition-all duration-300',
                  a.total > 0 ? 'bg-gradient-to-t from-acid-500/40 to-acid-300' : 'bg-ink-750'
                )}
                style={{ height: `${height}%`, maxHeight: '100%' }}
              />
              <span className="text-[8px] tabular-nums text-ink-600">{a.date.slice(8)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-ink-700/50 pt-2.5 text-[10px] text-ink-500">
        <span>Last 2 weeks</span>
        <span className="font-mono text-ink-300">{activity.reduce((a, b) => a + b.total, 0)} events</span>
      </div>
    </div>
  );
}

function IdeaRow({ idea }: { idea: Idea }) {
  const target = useNavigate();
  const statusColor =
    idea.status === 'failed' ? '#fb7185' : idea.status === 'generating' ? '#fbbf24' : idea.status === 'saved' ? '#5eead4' : '#d6ff4d';
  return (
    <button
      onClick={() => target('/composer')}
      className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 text-left transition-colors hover:border-ink-700/70 hover:bg-ink-800/50"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink-700 bg-ink-800">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor, boxShadow: `0 0 10px ${statusColor}` }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-ink-200">{idea.title || idea.prompt}</span>
        <span className="block truncate text-[10px] text-ink-500">
          {idea.genre || 'Unclassified'} · {idea.bpm || '—'} BPM · {timeAgo(idea.created_at)}
        </span>
      </span>
      <Badge color={idea.engine === 'arena' ? '#5eead4' : '#94a3b8'}>{idea.engine === 'arena' ? 'Arena' : 'Local'}</Badge>
    </button>
  );
}

function PresetRow({ preset }: { preset: Preset }) {
  const { data: settings } = useSettings();
  return (
    <button
      onClick={() => {
        if (!settings) return;
        engine.previewPreset(preset.instrument, preset.params, 57);
      }}
      className="group flex w-full items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-800/30 px-2.5 py-2 text-left transition-colors hover:border-ink-600 hover:bg-ink-800/70"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-900">
        <Play className="h-3 w-3 text-ink-400 transition-colors group-hover:text-acid-300" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-medium text-ink-200">{preset.name}</span>
        <span className="block truncate text-[9px] uppercase tracking-wider text-ink-500">{preset.category}</span>
      </span>
      <span className="h-4 w-12 opacity-50">
        <span className="flex h-full items-end gap-[2px]">
          {[3, 8, 5, 10, 4, 7, 2, 9].map((h, i) => (
            <span key={i} className="w-[2px] rounded-full bg-ink-400" style={{ height: `${h * 10}%` }} />
          ))}
        </span>
      </span>
    </button>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading, isError, refetch } = useStats();
  const { data: settings } = useSettings();
  const { data: projects } = useProjects({ sort: 'updated' });
  const navigate = useNavigate();

  const name = (settings?.['user.displayName'] as string) || 'Ari';
  const projectList = projects || stats?.recentProjects || [];
  const hero: Project | undefined = projectList[0];
  const weekly = (stats?.activity || []).slice(-7).reduce((a, b) => a + b.total, 0);
  const genres = Object.entries(stats?.genreCounts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const genreMax = Math.max(1, ...genres.map((g) => g[1]));

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <span className="h-1 w-1 rounded-full bg-acid-300" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </>
        }
        title={`${greeting()}, ${name}.`}
        description={
          isLoading
            ? 'Pulling up your sessions…'
            : weekly > 0
            ? `${weekly} studio ${weekly === 1 ? 'event' : 'events'} in the last seven days. Pick up where you left off or start something new.`
            : 'A quiet week so far. The best time to start a new session is right now.'
        }
        actions={
          <>
            {hero && (
              <Button variant="secondary" icon={<AudioLines className="h-4 w-4" />} onClick={() => navigate(`/studio/${hero.id}`)}>
                Open studio
              </Button>
            )}
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" strokeWidth={2.6} />}
              onClick={() => navigate('/projects?new=1')}
            >
              New project
            </Button>
          </>
        }
      />

      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[118px] rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-[280px] rounded-2xl lg:col-span-2" />
            <Skeleton className="h-[280px] rounded-2xl" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {isError && (
        <EmptyState
          icon={<Disc3 className="h-5 w-5" />}
          title="The studio server isn’t answering"
          description="Check that the local Node server is running, then reload this session."
          action={<Button onClick={() => refetch()}>Retry connection</Button>}
        />
      )}

      {!isLoading && !isError && stats && (
        <div className="space-y-5 lg:space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={<FolderOpen className="h-4 w-4" />}
              label="Projects"
              value={String(stats.totals.projects)}
              hint={`${stats.totals.favorites} pinned · ${stats.statusCounts.mixdown + stats.statusCounts.master} in mixdown`}
            />
            <StatCard
              icon={<Layers className="h-4 w-4" />}
              label="Tracks"
              value={String(stats.totals.tracks)}
              hint={`Across ${stats.genreCounts ? Object.keys(stats.genreCounts).length : 0} genres`}
              accent="#a78bfa"
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="Studio time"
              value={formatMinutes(stats.totals.minutes)}
              hint={`Average ${stats.totals.bpmAvg} BPM`}
              accent="#5eead4"
            />
            <StatCard
              icon={<Wand2 className="h-4 w-4" />}
              label="AI ideas"
              value={String(stats.totals.ideas)}
              hint={`${stats.recentIdeas.filter((i) => i.engine === 'arena').length} recently via Arena`}
              accent="#fb7185"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {hero ? (
              <div className="group relative overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850/70 lg:col-span-2">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-[42%]">
                    <CoverArt theme={hero.cover?.theme} hue={hero.cover?.hue} seed={hero.id} className="h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ink-850/90 max-sm:bg-gradient-to-t" />
                    <div className="absolute left-3 top-3">
                      <StatusBadge status={hero.status} className="backdrop-blur-md" />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink-500">
                        <span className="h-1 w-1 rounded-full bg-acid-300" /> Continue where you left off
                      </div>
                      <h2 className="mt-2 truncate text-xl font-semibold tracking-tight text-ink-100">{hero.title}</h2>
                      <p className="mt-1 text-xs text-ink-400">
                        {hero.genre} · {keyLabel(hero.key_root, hero.scale)} · {hero.bpm} BPM · {hero.trackCount ?? '—'} tracks
                      </p>
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-500">
                        {hero.description || 'No notes yet — open the session and shape the next section.'}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {(hero.sections || []).slice(0, 4).map((s, i) => (
                          <span
                            key={`${s}-${i}`}
                            className="rounded-md border border-ink-700/70 bg-ink-800/60 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ink-400"
                          >
                            {s}
                          </span>
                        ))}
                        <span className="rounded-md border border-ink-700/70 bg-ink-800/60 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ink-400">
                          {formatDuration(hero.duration, { compact: true })}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Play className="h-3.5 w-3.5 fill-ink-950" />}
                        onClick={() => navigate(`/studio/${hero.id}`)}
                      >
                        Continue session
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate('/composer')} icon={<Sparkles className="h-3.5 w-3.5" />}>
                        Generate a variation
                      </Button>
                      <span className="ml-auto text-[10px] text-ink-600">edited {timeAgo(hero.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2">
                <EmptyState
                  icon={<Disc3 className="h-5 w-5" />}
                  title="No sessions yet"
                  description="Create your first project or let the composer sketch one for you."
                  action={
                    <div className="flex gap-2">
                      <Button variant="primary" onClick={() => navigate('/projects?new=1')} icon={<Plus className="h-4 w-4" />}>
                        New project
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/composer')} icon={<Sparkles className="h-4 w-4" />}>
                        Ask the composer
                      </Button>
                    </div>
                  }
                />
              </div>
            )}
            <ActivityChart activity={stats.activity} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeader
                title="Recent sessions"
                subtitle="The projects you touched most recently"
                action={
                  <Link to="/projects" className="group flex items-center gap-1 text-[11px] text-ink-400 hover:text-acid-300">
                    View all
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                }
                className="mb-3"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {projectList.slice(0, 4).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
                {projectList.length === 0 && (
                  <div className="sm:col-span-2">
                    <EmptyState compact title="Nothing here yet" description="Your newest sessions will appear here." />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="panel p-4">
                <SectionHeader
                  title="Idea bank"
                  subtitle="Generated sketches"
                  action={
                    <Link to="/composer" className="text-[11px] text-ink-400 hover:text-acid-300">
                      Open
                    </Link>
                  }
                  className="mb-2"
                />
                <div className="space-y-1">
                  {stats.recentIdeas.slice(0, 4).map((idea) => (
                    <IdeaRow key={idea.id} idea={idea} />
                  ))}
                  {stats.recentIdeas.length === 0 && (
                    <div className="rounded-xl border border-dashed border-ink-700 px-3 py-6 text-center">
                      <p className="text-[11px] text-ink-500">No ideas yet.</p>
                      <Link to="/composer" className="mt-1 inline-block text-[11px] text-acid-300 hover:underline">
                        Compose the first one →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="panel p-4">
                <SectionHeader title="Preset shelf" subtitle="Tap to audition" className="mb-2" />
                <div className="space-y-1.5">
                  {stats.featuredPresets.slice(0, 4).map((preset) => (
                    <PresetRow key={preset.id} preset={preset} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="panel p-4 lg:col-span-2">
              <SectionHeader title="Genres in rotation" subtitle="What’s shaping your sound right now" className="mb-4" />
              <div className="space-y-3">
                {genres.map(([genre, count]) => (
                  <div key={genre} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-[11px] text-ink-300">{genre}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-acid-500/70 to-acid-300"
                        style={{ width: `${Math.max(6, (count / genreMax) * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-mono text-[10px] text-ink-500">{count}</span>
                  </div>
                ))}
                {genres.length === 0 && <p className="text-xs text-ink-500">No genres yet.</p>}
              </div>
            </div>
            <div className="panel relative overflow-hidden p-4">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-acid-300/10 blur-3xl" />
              <Star className="h-4 w-4 text-acid-300" />
              <h3 className="mt-3 text-sm font-semibold text-ink-100">Arena co-writer</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                {settings?.['ai.hasKey']
                  ? `Connected to ${settings?.['ai.model'] || 'the Arena router'}. Describe a vibe and get a full arrangement back.`
                  : 'Add your Arena API key to let the router compose full arrangements from a prompt.'}
              </p>
              <Button
                variant={settings?.['ai.hasKey'] ? 'primary' : 'outline'}
                size="sm"
                className="mt-4 w-full"
                icon={settings?.['ai.hasKey'] ? <Sparkles className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                onClick={() => navigate(settings?.['ai.hasKey'] ? '/composer' : '/settings')}
              >
                {settings?.['ai.hasKey'] ? 'Compose a new idea' : 'Connect Arena'}
              </Button>
              <div className="mt-3 flex items-center justify-between border-t border-ink-700/50 pt-2.5 text-[10px] text-ink-600">
                <span>Engine</span>
                <span className="font-mono text-ink-400">{settings?.['ai.hasKey'] ? 'arena router' : 'local fallback'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-700/50 bg-ink-900/40 px-4 py-3 text-[11px] text-ink-500">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All {stats.totals.projects} projects, {stats.totals.tracks} tracks and {stats.totals.samples} samples are stored locally in SQLite.
            </span>
            <span className="flex items-center gap-1.5">
              Press <kbd className="rounded border border-ink-700 bg-ink-800 px-1 py-px font-mono text-[9px]">⌘K</kbd> to jump anywhere
            </span>
          </div>
        </div>
      )}
    </Page>
  );
}
