import {
  AudioLines,
  ChevronDown,
  ChevronLeft,
  Copy,
  Download,
  FolderOpen,
  Heart,
  Loader2,
  MoreHorizontal,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AddTrackModal } from '../components/studio/AddTrackModal';
import { Arrangement } from '../components/studio/Arrangement';
import { DevicePanel } from '../components/studio/DevicePanel';
import { Mixer } from '../components/studio/Mixer';
import { PianoRoll } from '../components/studio/PianoRoll';
import { StepGrid } from '../components/studio/StepGrid';
import { Transport } from '../components/studio/Transport';
import { Page, PageHeader } from '../components/layout/Page';
import { ProjectCard } from '../components/ProjectCard';
import {
  Button,
  ConfirmDialog,
  Dropdown,
  DropdownItem,
  EmptyState,
  IconButton,
  PageLoader,
  Segmented,
  Select,
  StatusBadge,
  cn,
} from '../components/ui';
import { renderProjectToWav } from '../lib/engine';
import { keyLabel, GENRES, NOTE_NAMES, SCALES, SCALE_LABELS, STATUSES, STATUS_META } from '../lib/music';
import { pushRecentProject, readRecentProjects, timeAgo } from '../lib/format';
import {
  useDeleteProject,
  useDuplicateProject,
  useProject,
  useProjects,
  useSettings,
  useToggleFavoriteProject,
} from '../lib/hooks';
import { useStudioStore } from '../store/studio';
import { transport, useTransport } from '../store/transport';
import { toast } from '../store/toast';
import type { ProjectStatus } from '../lib/types';

function SaveIndicator() {
  const { saveState, lastSavedAt, flushNow } = useStudioStore();
  const label =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'error'
      ? 'Save failed'
      : saveState === 'dirty'
      ? 'Unsaved'
      : lastSavedAt
      ? `Saved ${timeAgo(lastSavedAt)}`
      : 'Saved';
  return (
    <button
      onClick={() => void flushNow()}
      title="Changes are saved automatically. Click to force a save."
      className={cn(
        'hidden items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] transition-colors sm:flex',
        saveState === 'error'
          ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          : saveState === 'saving'
          ? 'border-amber-400/30 bg-amber-400/10 text-amber-200'
          : 'border-ink-700 bg-ink-800/60 text-ink-400 hover:text-ink-200'
      )}
    >
      {saveState === 'saving' ? (
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
      ) : saveState === 'error' ? (
        <Save className="h-2.5 w-2.5" />
      ) : (
        <span className={cn('h-1.5 w-1.5 rounded-full', saveState === 'dirty' ? 'bg-amber-400' : 'bg-emerald-400')} />
      )}
      {label}
    </button>
  );
}

export default function Studio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useProject(id);
  const {
    project,
    setProject,
    updateProject,
    selectedTrackId,
    bank,
  } = useStudioStore();
  const [view, setView] = useState<'sequencer' | 'mixer'>('sequencer');
  const [addOpen, setAddOpen] = useState(false);
  const [rollId, setRollId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const loaded = useRef<string | null>(null);

  const duplicate = useDuplicateProject();
  const remove = useDeleteProject();
  const favorite = useToggleFavoriteProject();
  const { data: allProjects } = useProjects({ sort: 'updated' });
  const { data: settings } = useSettings();

  useEffect(() => {
    if (!data) return;
    if (loaded.current === data.id) return;
    if (loaded.current && loaded.current !== data.id) transport.stop();
    loaded.current = data.id;
    setProject(data);
    setTitleDraft(data.title);
  }, [data, setProject]);

  useEffect(() => {
    if (settings) {
      useStudioStore.getState().setAutosave(settings['project.autosave'] !== false);
      if (settings['project.metronome']) transport.setMetronome(true);
    }
  }, [settings]);

  useEffect(() => {
    return () => {
      transport.stop();
      void useStudioStore.getState().flushNow();
      useStudioStore.getState().clear();
    };
  }, []);

  useEffect(() => {
    if (project) pushRecentProject(project.id);
  }, [project?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;
      if (e.code === 'Space') {
        e.preventDefault();
        transport.toggle();
      } else if (e.key.toLowerCase() === 'l') {
        transport.setLoop(!useTransport.getState().loop);
      } else if (e.key.toLowerCase() === 'm') {
        transport.setMetronome(!useTransport.getState().metronome);
      } else if (e.key === 'Escape') {
        setRollId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const commitTitle = () => {
    const cleaned = titleDraft.trim().slice(0, 80);
    if (cleaned && cleaned !== project?.title) updateProject({ title: cleaned });
    else if (project) setTitleDraft(project.title);
  };

  const exportWav = async () => {
    if (!project) return;
    setExporting(true);
    try {
      const blob = await renderProjectToWav(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'pulsar-session'}.wav`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success('WAV rendered', 'The full arrangement was rendered offline at 44.1 kHz.');
    } catch (err) {
      toast.error('Export failed', err instanceof Error ? err.message : 'The offline renderer hit a snag.');
    } finally {
      setExporting(false);
    }
  };

  if (isLoading && !project) {
    return <PageLoader label="Loading the session…" />;
  }

  if (isError) {
    return (
      <Page>
        <EmptyState
          icon={<FolderOpen className="h-5 w-5" />}
          title="This session could not be loaded"
          description={error instanceof Error ? error.message : 'It may have been deleted, or the studio server is offline.'}
          action={
            <Button onClick={() => navigate('/projects')} icon={<ChevronLeft className="h-4 w-4" />}>
              Back to projects
            </Button>
          }
        />
      </Page>
    );
  }

  if (!project) return <PageLoader label="Opening the studio…" />;

  const tracks = project.tracks || [];
  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0] || null;
  const rollTrack = tracks.find((t) => t.id === rollId && t.kind === 'synth') || null;

  return (
    <div className="pb-10">
      <div className="border-b border-ink-700/50 bg-ink-950/40">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-3 px-3 pb-3 pt-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/projects" className="flex items-center gap-1 text-[11px] text-ink-500 transition-colors hover:text-ink-200">
              <ChevronLeft className="h-3 w-3" /> Projects
            </Link>
            <span className="text-ink-700">/</span>
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              }}
              maxLength={80}
              className="min-w-0 flex-1 truncate border-none bg-transparent p-0 text-lg font-semibold tracking-tight text-ink-100 outline-none focus:ring-0 sm:text-xl"
              aria-label="Project title"
            />
            <StatusSelect value={project.status} onChange={(status) => updateProject({ status })} />
            <SaveIndicator />
            <div className="ml-auto flex items-center gap-1.5">
              <Segmented
                size="sm"
                value={view}
                onChange={setView}
                options={[
                  { value: 'sequencer', label: 'Sequencer' },
                  { value: 'mixer', label: 'Mixer' },
                ]}
                className="hidden sm:inline-flex"
              />
              <Button
                size="sm"
                variant="outline"
                icon={exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                onClick={exportWav}
                disabled={exporting || tracks.length === 0}
              >
                <span className="hidden sm:inline">{exporting ? 'Rendering…' : 'Export WAV'}</span>
              </Button>
              <IconButton
                label={project.favorite ? 'Unfavorite project' : 'Favorite project'}
                onClick={() => favorite.mutate({ id: project.id, favorite: !project.favorite })}
                className="border border-ink-700/60 bg-ink-800/40"
              >
                <Star className={cn('h-3.5 w-3.5', project.favorite ? 'fill-acid-300 text-acid-300' : 'text-ink-400')} />
              </IconButton>
              <Dropdown
                align="right"
                width="w-52"
                trigger={
                  <IconButton label="Session actions" className="border border-ink-700/60 bg-ink-800/40">
                    <MoreHorizontal className="h-4 w-4" />
                  </IconButton>
                }
              >
                {(close) => (
                  <>
                    <DropdownItem icon={<Copy className="h-3.5 w-3.5" />} onClick={() => { close(); duplicate.mutate(project.id); }}>
                      Duplicate session
                    </DropdownItem>
                    <DropdownItem icon={<Sparkles className="h-3.5 w-3.5" />} onClick={() => { close(); navigate('/composer'); }}>
                      Generate a new idea
                    </DropdownItem>
                    <DropdownItem icon={<Download className="h-3.5 w-3.5" />} onClick={() => { close(); void exportWav(); }}>
                      Export WAV
                    </DropdownItem>
                    <div className="my-1 h-px bg-ink-700/70" />
                    <DropdownItem danger icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => { close(); setConfirmDelete(true); }}>
                      Delete session
                    </DropdownItem>
                  </>
                )}
              </Dropdown>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Select
              value={project.genre}
              onChange={(e) => updateProject({ genre: e.target.value })}
              className="h-7 w-auto max-w-[150px] rounded-md border-ink-700/80 bg-ink-800/50 py-0 pl-2 pr-7 text-[10px]"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
            <div className="flex items-center gap-1 rounded-md border border-ink-700/80 bg-ink-800/50 px-1.5 py-0.5">
              <span className="text-[9px] uppercase tracking-wider text-ink-600">key</span>
              <select
                value={project.key_root}
                onChange={(e) => updateProject({ key_root: Number(e.target.value) })}
                className="bg-transparent text-[10px] text-ink-200 outline-none [&>option]:bg-ink-800"
              >
                {NOTE_NAMES.map((n, i) => (
                  <option key={n} value={i}>
                    {n}
                  </option>
                ))}
              </select>
              <select
                value={project.scale}
                onChange={(e) => updateProject({ scale: e.target.value })}
                className="bg-transparent text-[10px] text-ink-200 outline-none [&>option]:bg-ink-800"
              >
                {Object.keys(SCALES).map((s) => (
                  <option key={s} value={s}>
                    {SCALE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <span className="rounded-md border border-ink-700/80 bg-ink-800/50 px-1.5 py-1 font-mono text-[10px] text-ink-400">
              {project.bpm} BPM
            </span>
            <span className="rounded-md border border-ink-700/80 bg-ink-800/50 px-1.5 py-1 text-[10px] text-ink-400">
              {tracks.length} track{tracks.length === 1 ? '' : 's'}
            </span>
            <span className="hidden rounded-md border border-ink-700/80 bg-ink-800/50 px-1.5 py-1 text-[10px] text-ink-500 sm:inline">
              {project.sections?.join(' · ') || 'No sections'}
            </span>
            <span className="ml-auto hidden text-[10px] text-ink-600 md:inline">edited {timeAgo(project.updated_at)}</span>
          </div>
        </div>
      </div>

      <Transport onAddTrack={() => setAddOpen(true)} />

      <div className="mx-auto w-full max-w-[1800px] px-3 py-3 sm:px-5">
        <Arrangement />
        {view === 'sequencer' ? (
          <StepGrid onAddTrack={() => setAddOpen(true)} onOpenRoll={(trackId) => setRollId(trackId || selectedTrack?.id || null)} />
        ) : (
          <Mixer />
        )}

        {selectedTrack ? (
          <DevicePanel track={selectedTrack} bank={bank} onOpenRoll={() => setRollId(selectedTrack.id)} />
        ) : (
          <div className="panel mt-3 flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 bg-ink-800 text-acid-300">
                <AudioLines className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-medium text-ink-200">No instrument selected</p>
                <p className="text-[11px] text-ink-500">Add a track to start shaping the sound.</p>
              </div>
            </div>
            <Button size="sm" variant="primary" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setAddOpen(true)}>
              Add instrument
            </Button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-ink-600">
          <span className="flex flex-wrap items-center gap-3">
            <span>
              <kbd className="rounded border border-ink-700 bg-ink-800 px-1 py-px font-mono">space</kbd> play / pause
            </span>
            <span>
              <kbd className="rounded border border-ink-700 bg-ink-800 px-1 py-px font-mono">L</kbd> loop
            </span>
            <span>
              <kbd className="rounded border border-ink-700 bg-ink-800 px-1 py-px font-mono">M</kbd> metronome
            </span>
            <span className="hidden sm:inline">shift-click a step to cycle velocity</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="h-2.5 w-2.5" />
            {keyLabel(project.key_root, project.scale)} · {project.genre}
          </span>
        </div>
      </div>

      <AddTrackModal open={addOpen} onClose={() => setAddOpen(false)} />

      {rollTrack && (
        <PianoRoll
          open={!!rollTrack}
          onClose={() => setRollId(null)}
          track={rollTrack}
          project={project}
          bank={bank}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          remove.mutate(project.id, {
            onSuccess: () => navigate('/projects'),
          });
          setConfirmDelete(false);
        }}
        title={`Delete “${project.title}”?`}
        description="The session, its tracks and patterns will be permanently removed."
      />
    </div>
  );
}

function StatusSelect({ value, onChange }: { value: ProjectStatus; onChange: (s: ProjectStatus) => void }) {
  return (
    <Dropdown
      align="left"
      width="w-40"
      trigger={
        <button className="flex items-center gap-1 rounded-full transition-opacity hover:opacity-90">
          <StatusBadge status={value} />
          <ChevronDown className="h-3 w-3 text-ink-500" />
        </button>
      }
    >
      {(close) => (
        <>
          {STATUSES.map((s) => (
            <DropdownItem
              key={s}
              active={s === value}
              icon={<span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[s].dot }} />}
              onClick={() => {
                onChange(s);
                close();
              }}
            >
              {STATUS_META[s].label}
            </DropdownItem>
          ))}
        </>
      )}
    </Dropdown>
  );
}

export function StudioIndex() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects({ sort: 'updated' });
  const recent = readRecentProjects();
  const list = projects || [];
  const last = list.find((p) => recent.includes(p.id)) || list[0];

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <span className="h-1 w-1 rounded-full bg-acid-300" /> Studio
          </>
        }
        title="Pick a session to open."
        description="Load a project into the sequencer, or start a fresh one and compose with the Arena router."
        actions={
          <>
            <Button
              variant="outline"
              icon={<Sparkles className="h-4 w-4" />}
              onClick={() => navigate('/composer')}
            >
              AI Composer
            </Button>
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/projects?new=1')}>
              New project
            </Button>
          </>
        }
      />

      {last && (
        <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-ink-700/60 bg-gradient-to-br from-ink-800/80 to-ink-900/50 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="label-mono">Pick up where you left off</p>
            <h2 className="mt-1.5 text-lg font-semibold text-ink-100">{last.title}</h2>
            <p className="mt-1 text-xs text-ink-400">
              {last.genre} · {keyLabel(last.key_root, last.scale)} · {last.bpm} BPM · {last.trackCount ?? '—'} tracks
            </p>
          </div>
          <Button variant="primary" icon={<AudioLines className="h-4 w-4" />} onClick={() => navigate(`/studio/${last.id}`)}>
            Open studio
          </Button>
        </div>
      )}

      {isLoading && <PageLoader label="Loading sessions…" />}

      {!isLoading && list.length === 0 && (
        <EmptyState
          icon={<AudioLines className="h-5 w-5" />}
          title="Nothing to open yet"
          description="Create a session first — the studio needs a project to load."
          action={
            <Button variant="primary" onClick={() => navigate('/projects?new=1')}>
              Create a project
            </Button>
          }
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </Page>
  );
}
