import { Copy, Disc3, FolderOpen, MoreHorizontal, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteProject, useDuplicateProject, useToggleFavoriteProject } from '../lib/hooks';
import { keyLabel } from '../lib/music';
import { formatDuration, pushRecentProject, readRecentProjects, timeAgo } from '../lib/format';
import type { Project } from '../lib/types';
import { cn, ConfirmDialog, Dropdown, DropdownItem, IconButton, StatusBadge, Skeleton } from './ui';
import { CoverArt } from './CoverArt';

export function ProjectCard({ project, view = 'grid' }: { project: Project; view?: 'grid' | 'list' }) {
  const navigate = useNavigate();
  const toggleFavorite = useToggleFavoriteProject();
  const duplicate = useDuplicateProject();
  const remove = useDeleteProject();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(readRecentProjects());
  }, []);

  const open = () => {
    pushRecentProject(project.id);
    navigate(`/studio/${project.id}`);
  };

  const menu = (align: 'left' | 'right' = 'right') => (
    <Dropdown
      align={align}
      trigger={
        <IconButton
          label="Project actions"
          size="xs"
          className="bg-ink-900/70 backdrop-blur hover:bg-ink-800"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
      }
    >
      {(close) => (
        <>
          <DropdownItem icon={<FolderOpen className="h-3.5 w-3.5" />} onClick={() => { close(); open(); }}>
            Open in studio
          </DropdownItem>
          <DropdownItem icon={<Copy className="h-3.5 w-3.5" />} onClick={() => { close(); duplicate.mutate(project.id); }}>
            Duplicate session
          </DropdownItem>
          <DropdownItem
            icon={<Star className={cn('h-3.5 w-3.5', project.favorite && 'fill-acid-300 text-acid-300')} />}
            onClick={() => {
              close();
              toggleFavorite.mutate({ id: project.id, favorite: !project.favorite });
            }}
          >
            {project.favorite ? 'Remove from favorites' : 'Add to favorites'}
          </DropdownItem>
          <div className="my-1 h-px bg-ink-700/70" />
          <DropdownItem danger icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => { close(); setConfirmOpen(true); }}>
            Delete project
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );

  if (view === 'list') {
    return (
      <>
        <div className="group flex items-center gap-4 rounded-xl border border-ink-700/60 bg-ink-850/60 p-3 transition-colors hover:border-ink-600 hover:bg-ink-800/70">
          <button onClick={open} className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
            <CoverArt theme={project.cover?.theme} hue={project.cover?.hue} seed={project.id} showGrid={false} className="h-full w-full" />
          </button>
          <button onClick={open} className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-medium text-ink-100">{project.title}</h3>
              {project.favorite && <Star className="h-3 w-3 shrink-0 fill-acid-300 text-acid-300" />}
            </div>
            <p className="mt-0.5 truncate text-[11px] text-ink-500">
              {project.genre} · {keyLabel(project.key_root, project.scale)} · {project.bpm} BPM
            </p>
          </button>
          <div className="hidden items-center gap-6 text-[11px] text-ink-500 md:flex">
            <span className="w-16">{project.trackCount ?? project.tracks?.length ?? 0} tracks</span>
            <span className="w-14 font-mono">{formatDuration(project.duration, { compact: true })}</span>
            <span className="w-20 text-right">{timeAgo(project.updated_at)}</span>
          </div>
          <StatusBadge status={project.status} />
          {menu()}
        </div>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            remove.mutate(project.id);
            setConfirmOpen(false);
          }}
          title={`Delete “${project.title}”?`}
          description="The project and all of its tracks will be permanently removed."
        />
      </>
    );
  }

  return (
    <>
      <div
        onClick={open}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && open()}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-600 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid-300/40"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <CoverArt theme={project.cover?.theme} hue={project.cover?.hue} seed={project.id} className="h-full w-full" />
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
            <StatusBadge status={project.status} className="backdrop-blur-md" />
            {project.favorite && (
              <span className="flex h-5 items-center gap-1 rounded-full border border-acid-300/30 bg-ink-950/60 px-1.5 text-[9px] font-medium text-acid-300 backdrop-blur-md">
                <Star className="h-2.5 w-2.5 fill-acid-300" /> pinned
              </span>
            )}
          </div>
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <IconButton
              label={project.favorite ? 'Unfavorite' : 'Favorite'}
              size="xs"
              className="bg-ink-950/60 backdrop-blur hover:bg-ink-800"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite.mutate({ id: project.id, favorite: !project.favorite });
              }}
            >
              <Star className={cn('h-3.5 w-3.5', project.favorite ? 'fill-acid-300 text-acid-300' : 'text-ink-300')} />
            </IconButton>
            {menu()}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
            <span className="flex items-center gap-1.5 rounded-full border border-ink-700/60 bg-ink-950/60 px-2 py-0.5 text-[10px] text-ink-300 backdrop-blur-md">
              <Disc3 className="h-2.5 w-2.5 text-acid-300" />
              {project.trackCount ?? project.tracks?.length ?? 0} tracks
            </span>
            <span className="rounded-full bg-acid-300 px-2.5 py-1 text-[10px] font-semibold text-ink-950 opacity-0 shadow-glow transition-opacity group-hover:opacity-100">
              Open studio →
            </span>
          </div>
        </div>
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-ink-100">{project.title}</h3>
            <span className="shrink-0 font-mono text-[10px] text-ink-500">{formatDuration(project.duration, { compact: true })}</span>
          </div>
          <p className="mt-1 truncate text-[11px] text-ink-500">
            {project.genre} · {keyLabel(project.key_root, project.scale)} · {project.bpm} BPM
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-ink-700/50 pt-2.5 text-[10px] text-ink-500">
            <span className="truncate">{project.sections?.slice(0, 3).join(' · ') || 'Untitled arrangement'}</span>
            <span className="shrink-0 pl-2">{timeAgo(project.updated_at)}</span>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          remove.mutate(project.id);
          setConfirmOpen(false);
        }}
        title={`Delete “${project.title}”?`}
        description="The project and all of its tracks will be permanently removed."
      />
    </>
  );
}

export function ProjectCardSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  if (view === 'list') {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-ink-700/60 bg-ink-850/60 p-3">
        <Skeleton className="h-14 w-20 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-2.5 w-56" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-850/70">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-2.5 p-3.5">
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="h-2.5 w-4/5" />
        <div className="flex justify-between pt-1">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-2.5 w-14" />
        </div>
      </div>
    </div>
  );
}
