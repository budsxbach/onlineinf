import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { queryClient } from './queryClient';
import { toast } from '../store/toast';
import type { Idea, Preset, Project, Sample, Settings, Stats } from './types';

export const keys = {
  stats: ['stats'] as const,
  projects: (filters?: Record<string, unknown>) => ['projects', filters ?? {}] as const,
  project: (id: string) => ['project', id] as const,
  samples: (filters?: Record<string, unknown>) => ['samples', filters ?? {}] as const,
  presets: (filters?: Record<string, unknown>) => ['presets', filters ?? {}] as const,
  ideas: (filters?: Record<string, unknown>) => ['ideas', filters ?? {}] as const,
  idea: (id: string) => ['idea', id] as const,
  settings: ['settings'] as const,
};

export function useStats() {
  return useQuery({ queryKey: keys.stats, queryFn: api.stats });
}

export function useProjects(filters: { query?: string; status?: string; genre?: string; favorite?: boolean; sort?: string } = {}) {
  return useQuery({
    queryKey: keys.projects(filters),
    queryFn: () => api.projects.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: keys.project(id || ''),
    queryFn: () => api.projects.get(id as string),
    enabled: !!id,
  });
}

export function useSamples(filters: { category?: string; query?: string; favorite?: boolean } = {}) {
  return useQuery({
    queryKey: keys.samples(filters),
    queryFn: () => api.samples.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function usePresets(filters: { category?: string; query?: string; favorite?: boolean } = {}) {
  return useQuery({
    queryKey: keys.presets(filters),
    queryFn: () => api.presets.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useIdeas(filters: { status?: string; query?: string } = {}) {
  return useQuery({
    queryKey: keys.ideas(filters),
    queryFn: () => api.ideas.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useSettings() {
  return useQuery({ queryKey: keys.settings, queryFn: api.settings.get });
}

/* ------------------------------------------------------------------ *
 *  Projects
 * ------------------------------------------------------------------ */

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.projects.create,
    onSuccess: (project) => {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success(`${project.title} created`, 'Your new session is ready to arrange.');
    },
    onError: (err) => toast.error('Could not create project', err instanceof Error ? err.message : undefined),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Project> }) => api.projects.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ['projects'] });
      const previous = qc.getQueriesData<Project[]>({ queryKey: ['projects'] });
      qc.setQueriesData<Project[]>({ queryKey: ['projects'] }, (old) =>
        old?.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
      qc.setQueryData<Project>(['project', id], (old) => (old ? { ...old, ...patch } : old));
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error('Update failed', err instanceof Error ? err.message : undefined);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useToggleFavoriteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) => api.projects.update(id, { favorite }),
    onMutate: async ({ id, favorite }) => {
      await qc.cancelQueries({ queryKey: ['projects'] });
      const previous = qc.getQueriesData<Project[]>({ queryKey: ['projects'] });
      qc.setQueriesData<Project[]>({ queryKey: ['projects'] }, (old) =>
        old?.map((p) => (p.id === id ? { ...p, favorite } : p))
      );
      qc.setQueryData<Project>(['project', id], (old) => (old ? { ...old, favorite } : old));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error('Could not update favorite');
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.projects.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['projects'] });
      const previous = qc.getQueriesData<Project[]>({ queryKey: ['projects'] });
      qc.setQueriesData<Project[]>({ queryKey: ['projects'] }, (old) => old?.filter((p) => p.id !== id));
      return { previous };
    },
    onError: (err, _id, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error('Could not delete project', err instanceof Error ? err.message : undefined);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Project deleted');
    },
  });
}

export function useDuplicateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.projects.duplicate(id),
    onSuccess: (project) => {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success(`${project.title} created`, 'A full copy of the session is ready.');
    },
    onError: (err) => toast.error('Could not duplicate project', err instanceof Error ? err.message : undefined),
  });
}

/* ------------------------------------------------------------------ *
 *  Samples
 * ------------------------------------------------------------------ */

export function useCreateSample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.samples.create,
    onSuccess: (sample) => {
      void qc.invalidateQueries({ queryKey: ['samples'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success(`${sample.name} saved to the library`);
    },
    onError: (err) => toast.error('Could not save sample', err instanceof Error ? err.message : undefined),
  });
}

export function useUpdateSample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Sample> }) => api.samples.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ['samples'] });
      const previous = qc.getQueriesData<Sample[]>({ queryKey: ['samples'] });
      qc.setQueriesData<Sample[]>({ queryKey: ['samples'] }, (old) =>
        old?.map((s) => (s.id === id ? { ...s, ...patch } : s))
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error('Could not update sample', err instanceof Error ? err.message : undefined);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['stats'] }),
  });
}

export function useDeleteSample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.samples.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['samples'] });
      const previous = qc.getQueriesData<Sample[]>({ queryKey: ['samples'] });
      qc.setQueriesData<Sample[]>({ queryKey: ['samples'] }, (old) => old?.filter((s) => s.id !== id));
      return { previous };
    },
    onError: (err, _id, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error('Could not delete sample', err instanceof Error ? err.message : undefined);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['samples'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Sample deleted');
    },
  });
}

/* ------------------------------------------------------------------ *
 *  Presets
 * ------------------------------------------------------------------ */

export function useCreatePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.presets.create,
    onSuccess: (preset) => {
      void qc.invalidateQueries({ queryKey: ['presets'] });
      toast.success(`${preset.name} saved as a preset`);
    },
    onError: (err) => toast.error('Could not save preset', err instanceof Error ? err.message : undefined),
  });
}

export function useUpdatePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Preset> }) => api.presets.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ['presets'] });
      const previous = qc.getQueriesData<Preset[]>({ queryKey: ['presets'] });
      qc.setQueriesData<Preset[]>({ queryKey: ['presets'] }, (old) =>
        old?.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error('Could not update preset', err instanceof Error ? err.message : undefined);
    },
  });
}

export function useDeletePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.presets.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['presets'] });
      const previous = qc.getQueriesData<Preset[]>({ queryKey: ['presets'] });
      qc.setQueriesData<Preset[]>({ queryKey: ['presets'] }, (old) => old?.filter((p) => p.id !== id));
      return { previous };
    },
    onError: (err, _id, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error('Could not delete preset', err instanceof Error ? err.message : undefined);
    },
    onSuccess: () => toast.success('Preset deleted'),
  });
}

/* ------------------------------------------------------------------ *
 *  Ideas
 * ------------------------------------------------------------------ */

export function useGenerateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.ideas.generate,
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: ['ideas'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      void qc.invalidateQueries({ queryKey: ['projects'] });
      if (result.warning) {
        const code = result.diagnostics?.code;
        toast.info('Composed with the local engine', code ? `${code} — ${result.warning}` : result.warning);
      }
      else if (result.idea.engine === 'arena') toast.success('Arena composed a new idea', `${result.idea.title} is ready to open in the studio.`);
      else toast.success('Idea composed', `${result.idea.title} is ready to open in the studio.`);
    },
    onError: (err) => toast.error('Composition failed', err instanceof Error ? err.message : undefined),
  });
}

export function useRetryIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, preferLocal, createProject }: { id: string; preferLocal?: boolean; createProject?: boolean }) =>
      api.ideas.retry(id, { preferLocal, createProject }),
    onMutate: async ({ id }) => {
      qc.setQueriesData<Idea[]>({ queryKey: ['ideas'] }, (old) =>
        old?.map((i) => (i.id === id ? { ...i, status: 'generating', error: null } : i))
      );
    },
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: ['ideas'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      if (result.warning) {
        const code = result.diagnostics?.code;
        toast.info('Retried with the local engine', code ? `${code} — ${result.warning}` : result.warning);
      }
      else toast.success('Idea regenerated');
    },
    onError: (err) => {
      void qc.invalidateQueries({ queryKey: ['ideas'] });
      toast.error('Retry failed', err instanceof Error ? err.message : undefined);
    },
  });
}

export function useUpdateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Idea> }) => api.ideas.update(id, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['ideas'] }),
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.ideas.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['ideas'] });
      const previous = qc.getQueriesData<Idea[]>({ queryKey: ['ideas'] });
      qc.setQueriesData<Idea[]>({ queryKey: ['ideas'] }, (old) => old?.filter((i) => i.id !== id));
      return { previous };
    },
    onError: (err, _id, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error('Could not delete idea', err instanceof Error ? err.message : undefined);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['ideas'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Idea removed');
    },
  });
}

export function useOpenIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.ideas.open(id),
    onSuccess: (project) => {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      void qc.invalidateQueries({ queryKey: ['ideas'] });
      void qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success(`${project.title} opened in the studio`);
    },
    onError: (err) => toast.error('Could not open idea', err instanceof Error ? err.message : undefined),
  });
}

/* ------------------------------------------------------------------ *
 *  Settings
 * ------------------------------------------------------------------ */

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Record<string, string | number | boolean | null>) => api.settings.update(patch),
    onMutate: async (patch) => {
      const previous = qc.getQueryData<Settings>(keys.settings);
      qc.setQueryData<Settings>(keys.settings, (old) => (old ? { ...old, ...patch } : old));
      return { previous };
    },
    onError: (err, _patch, ctx) => {
      if (ctx?.previous) qc.setQueryData(keys.settings, ctx.previous);
      toast.error('Could not save settings', err instanceof Error ? err.message : undefined);
    },
    onSuccess: (settings) => {
      qc.setQueryData(keys.settings, settings);
      toast.success('Settings saved');
    },
  });
}

export function useTestAi() {
  return useMutation({
    mutationFn: api.settings.testAi,
    onSuccess: (result) => {
      toast.success('Arena router connected', `${result.modelCount} models available on ${new URL(result.baseUrl).host}.`);
    },
    onError: (err) => toast.error('Connection test failed', err instanceof Error ? err.message : undefined),
  });
}

/* ------------------------------------------------------------------ *
 *  Utility
 * ------------------------------------------------------------------ */

export function patchProjectInCache(id: string, patch: Partial<Project>) {
  queryClient.setQueriesData<Project[]>({ queryKey: ['projects'] }, (old) =>
    old?.map((p) => (p.id === id ? { ...p, ...patch } : p))
  );
  queryClient.setQueryData<Project>(['project', id], (old) => (old ? { ...old, ...patch } : old));
}

export function getCachedStats(): Stats | undefined {
  return queryClient.getQueryData<Stats>(keys.stats);
}

export function useDeviceLink() {
  return useQuery({
    queryKey: ['device-link'],
    queryFn: () => api.link(),
    staleTime: 60_000,
    retry: false,
  });
}

export function useTestComposer() {
  return useMutation({
    mutationFn: (input: { apiKey?: string; baseUrl?: string; model?: string }) => api.settings.testComposer(input),
  });
}
