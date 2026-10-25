import { create } from 'zustand';
import { api } from '../lib/api';
import { engine } from '../lib/engine';
import { queryClient } from '../lib/queryClient';
import { INSTRUMENTS, blankSteps, colorOf } from '../lib/music';
import type { Bank, Project, Track } from '../lib/types';
import { toast } from './toast';

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface StudioState {
  project: Project | null;
  selectedTrackId: string | null;
  bank: Bank;
  mode: 'song' | 'pattern';
  saveState: SaveState;
  lastSavedAt: string | null;
  autosave: boolean;
  setAutosave: (on: boolean) => void;
  setProject: (project: Project) => void;
  clear: () => void;
  updateProject: (patch: Partial<Project>) => void;
  updateTrack: (id: string, patch: Partial<Track>) => void;
  addTrack: (input: { instrument: string; name?: string; color?: string; synth?: Record<string, number | string> }) => Promise<Track | undefined>;
  deleteTrack: (id: string) => Promise<void>;
  duplicateTrack: (id: string) => Promise<void>;
  selectTrack: (id: string | null) => void;
  setBank: (bank: Bank) => void;
  setMode: (mode: 'song' | 'pattern') => void;
  flushNow: () => Promise<void>;
}

let pendingProject: Partial<Project> | null = null;
let pendingTracks: Record<string, Partial<Track>> = {};
let saveTimer: number | null = null;
let inFlight = false;
let rerun = false;

function scheduleFlush(set: (s: Partial<StudioState>) => void, get: () => StudioState, delay = 480) {
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => void flush(set as never, get), delay);
}

async function flush(set: (s: Partial<StudioState>) => void, get: () => StudioState) {
  if (saveTimer) {
    window.clearTimeout(saveTimer);
    saveTimer = null;
  }
  const project = get().project;
  if (!project) return;
  if (inFlight) {
    rerun = true;
    return;
  }
  const projectPatch = pendingProject;
  const trackPatches = pendingTracks;
  pendingProject = null;
  pendingTracks = {};
  if (!projectPatch && !Object.keys(trackPatches).length) {
    if (get().saveState === 'dirty') set({ saveState: 'saved' });
    return;
  }
  inFlight = true;
  set({ saveState: 'saving' });
  try {
    if (projectPatch) await api.projects.update(project.id, projectPatch as Partial<Project>);
    for (const [trackId, patch] of Object.entries(trackPatches)) {
      await api.tracks.update(trackId, patch);
    }
    const stillPending = !!pendingProject || Object.keys(pendingTracks).length > 0;
    set({ saveState: stillPending ? 'dirty' : 'saved', lastSavedAt: new Date().toISOString() });
    void queryClient.invalidateQueries({ queryKey: ['projects'] });
    void queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    void queryClient.invalidateQueries({ queryKey: ['stats'] });
  } catch (err) {
    pendingProject = { ...(pendingProject || {}), ...(projectPatch || {}) };
    pendingTracks = { ...pendingTracks, ...trackPatches };
    set({ saveState: 'error' });
    toast.error('Changes could not be saved', err instanceof Error ? err.message : 'Check that the local server is running.');
  } finally {
    inFlight = false;
    if (rerun || pendingProject || Object.keys(pendingTracks).length) {
      rerun = false;
      scheduleFlush(set, get, 260);
    }
  }
}

function syncEngine(project: Project) {
  engine.setProject(project);
}

export const useStudioStore = create<StudioState>((set, get) => ({
  project: null,
  selectedTrackId: null,
  bank: 'A',
  mode: 'song',
  saveState: 'idle',
  lastSavedAt: null,
  autosave: true,

  setAutosave: (on) => set({ autosave: on }),

  setProject: (project) => {
    pendingProject = null;
    pendingTracks = {};
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = null;
    set({
      project,
      selectedTrackId: project.tracks?.[0]?.id ?? null,
      bank: (engine.bank as Bank) || 'A',
      mode: engine.mode,
      saveState: 'idle',
      lastSavedAt: project.updated_at,
    });
    syncEngine(project);
  },

  clear: () => {
    set({ project: null, selectedTrackId: null, saveState: 'idle', lastSavedAt: null });
  },

  updateProject: (patch) => {
    const project = get().project;
    if (!project) return;
    const next = { ...project, ...patch };
    set({ project: next, saveState: 'dirty' });
    syncEngine(next);
    pendingProject = { ...(pendingProject || {}), ...patch };
    if (get().autosave) scheduleFlush(set, get);
  },

  updateTrack: (id, patch) => {
    const project = get().project;
    if (!project) return;
    const index = project.tracks?.findIndex((t) => t.id === id) ?? -1;
    if (index < 0 || !project.tracks) return;
    const tracks = project.tracks.slice();
    tracks[index] = { ...tracks[index], ...patch };
    const next = { ...project, tracks };
    set({ project: next, saveState: 'dirty' });
    syncEngine(next);
    pendingTracks[id] = { ...(pendingTracks[id] || {}), ...patch };
    if (get().autosave) scheduleFlush(set, get);
  },

  addTrack: async ({ instrument, name, color, synth }) => {
    const project = get().project;
    if (!project) return undefined;
    const tempId = `tmp_${Math.random().toString(36).slice(2, 9)}`;
    const blank = {
      A: blankSteps(),
      B: blankSteps(),
      C: blankSteps(),
      D: blankSteps(),
    };
    const temp: Track = {
      id: tempId,
      project_id: project.id,
      name: name || 'New Track',
      kind: INSTRUMENTS[instrument]?.kind || 'drum',
      instrument,
      color: color || 'acid',
      position: (project.tracks?.length || 0),
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      drive: 0.05,
      filter_cutoff: 0.9,
      reverb_send: 0.15,
      delay_send: 0.05,
      patterns: blank,
      notes: { A: [], B: [], C: [], D: [] },
      synth: synth || {},
      sample_id: null,
    };
    const tracks = [...(project.tracks || []), temp];
    const next = { ...project, tracks };
    set({ project: next, selectedTrackId: tempId });
    syncEngine(next);
    try {
      const created = await api.projects.addTrack(project.id, { instrument, name, color, synth });
      const current = get().project;
      if (!current) return undefined;
      const replaced = (current.tracks || []).map((t) => (t.id === tempId ? created : t));
      const updated = { ...current, tracks: replaced };
      set({ project: updated, selectedTrackId: created.id });
      syncEngine(updated);
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`${created.name} added`, 'Painted a few steps to get started.');
      return created;
    } catch (err) {
      const current = get().project;
      if (current) {
        const without = { ...current, tracks: (current.tracks || []).filter((t) => t.id !== tempId) };
        set({ project: without, selectedTrackId: without.tracks?.[0]?.id ?? null });
        syncEngine(without);
      }
      toast.error('Could not add track', err instanceof Error ? err.message : undefined);
      return undefined;
    }
  },

  deleteTrack: async (id) => {
    const project = get().project;
    if (!project || !project.tracks) return;
    const previous = project.tracks;
    const tracks = previous.filter((t) => t.id !== id).map((t, i) => ({ ...t, position: i }));
    const next = { ...project, tracks };
    const wasSelected = get().selectedTrackId === id;
    set({ project: next, selectedTrackId: wasSelected ? tracks[0]?.id ?? null : get().selectedTrackId });
    syncEngine(next);
    try {
      await api.tracks.remove(id);
      delete pendingTracks[id];
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Track deleted');
    } catch (err) {
      const current = get().project;
      if (current) {
        const restored = { ...current, tracks: previous };
        set({ project: restored, selectedTrackId: id });
        syncEngine(restored);
      }
      toast.error('Could not delete track', err instanceof Error ? err.message : undefined);
    }
  },

  duplicateTrack: async (id) => {
    const project = get().project;
    if (!project) return;
    try {
      const created = await api.tracks.duplicate(id);
      const current = get().project;
      if (!current) return;
      const updated = { ...current, tracks: [...(current.tracks || []), created] };
      set({ project: updated, selectedTrackId: created.id });
      syncEngine(updated);
      toast.success(`${created.name} created`);
    } catch (err) {
      toast.error('Could not duplicate track', err instanceof Error ? err.message : undefined);
    }
  },

  selectTrack: (id) => set({ selectedTrackId: id }),

  setBank: (bank) => {
    engine.setBank(bank);
    set({ bank });
  },

  setMode: (mode) => {
    engine.setMode(mode);
    set({ mode });
  },

  flushNow: async () => {
    await flush(set, get);
  },
}));

export const trackColor = (track: Track) => colorOf(track.color);
