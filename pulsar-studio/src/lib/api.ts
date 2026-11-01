import type {
  Bank,
  ComposerTestResult,
  DeviceLink,
  Idea,
  IdeaResult,
  Preset,
  Project,
  Sample,
  Settings,
  Stats,
  Track,
} from './types';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * A stalled request must never leave the UI spinning forever — every call gets
 * a hard deadline and surfaces a readable error instead.
 */
const REQUEST_TIMEOUT = 20_000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(
        'The server did not answer in time. Is Pulsar Studio still running?',
        0,
        'timeout'
      );
    }
    throw new ApiError('Could not reach the server.', 0, 'network');
  }
  clearTimeout(timer);
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const payload = data as { error?: string; code?: string } | null;
    throw new ApiError(payload?.error || `Request failed (${res.status})`, res.status, payload?.code);
  }
  return data as T;
}

export const api = {
  meta: () => request<Record<string, unknown>>('/meta'),
  stats: () => request<Stats>('/stats'),

  projects: {
    list: (params: { query?: string; status?: string; genre?: string; favorite?: boolean; sort?: string } = {}) => {
      const qs = new URLSearchParams();
      if (params.query) qs.set('query', params.query);
      if (params.status && params.status !== 'all') qs.set('status', params.status);
      if (params.genre && params.genre !== 'all') qs.set('genre', params.genre);
      if (params.favorite) qs.set('favorite', 'true');
      if (params.sort) qs.set('sort', params.sort);
      return request<Project[]>(`/projects?${qs.toString()}`);
    },
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (input: Partial<Project> & { ideaId?: string; tracks?: Partial<Track>[] }) =>
      request<Project>('/projects', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, patch: Partial<Project>) =>
      request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (id: string) => request<{ ok: boolean; id: string }>(`/projects/${id}`, { method: 'DELETE' }),
    duplicate: (id: string) => request<Project>(`/projects/${id}/duplicate`, { method: 'POST' }),
    reorder: (id: string, trackIds: string[]) =>
      request<Track[]>(`/projects/${id}/reorder`, { method: 'POST', body: JSON.stringify({ trackIds }) }),
    addTrack: (projectId: string, input: Partial<Track> & { instrument?: string }) =>
      request<Track>(`/projects/${projectId}/tracks`, { method: 'POST', body: JSON.stringify(input) }),
  },

  tracks: {
    update: (id: string, patch: Partial<Track>) => request<Track>(`/tracks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (id: string) => request<{ ok: boolean; id: string }>(`/tracks/${id}`, { method: 'DELETE' }),
    duplicate: (id: string) => request<Track>(`/tracks/${id}/duplicate`, { method: 'POST' }),
  },

  samples: {
    list: (params: { category?: string; query?: string; favorite?: boolean } = {}) => {
      const qs = new URLSearchParams();
      if (params.category && params.category !== 'All') qs.set('category', params.category);
      if (params.query) qs.set('query', params.query);
      if (params.favorite) qs.set('favorite', 'true');
      return request<Sample[]>(`/samples?${qs.toString()}`);
    },
    create: (input: Partial<Sample>) => request<Sample>('/samples', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, patch: Partial<Sample>) => request<Sample>(`/samples/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (id: string) => request<{ ok: boolean }>(`/samples/${id}`, { method: 'DELETE' }),
    play: (id: string) => request<{ ok: boolean; plays: number }>(`/samples/${id}/play`, { method: 'POST' }),
  },

  presets: {
    list: (params: { category?: string; query?: string; favorite?: boolean } = {}) => {
      const qs = new URLSearchParams();
      if (params.category && params.category !== 'All') qs.set('category', params.category);
      if (params.query) qs.set('query', params.query);
      if (params.favorite) qs.set('favorite', 'true');
      return request<Preset[]>(`/presets?${qs.toString()}`);
    },
    create: (input: Partial<Preset> & { instrument: string }) =>
      request<Preset>('/presets', { method: 'POST', body: JSON.stringify(input) }),
    update: (id: string, patch: Partial<Preset>) => request<Preset>(`/presets/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (id: string) => request<{ ok: boolean }>(`/presets/${id}`, { method: 'DELETE' }),
  },

  ideas: {
    list: (params: { status?: string; query?: string } = {}) => {
      const qs = new URLSearchParams();
      if (params.status) qs.set('status', params.status);
      if (params.query) qs.set('query', params.query);
      return request<Idea[]>(`/ideas?${qs.toString()}`);
    },
    get: (id: string) => request<Idea>(`/ideas/${id}`),
    generate: (input: {
      prompt: string;
      genre?: string | null;
      bpm?: number | null;
      keyRoot?: number | null;
      scale?: string | null;
      createProject?: boolean;
      preferLocal?: boolean;
    }) =>
      request<IdeaResult>('/ideas', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    update: (id: string, patch: Partial<Idea>) => request<Idea>(`/ideas/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    remove: (id: string) => request<{ ok: boolean }>(`/ideas/${id}`, { method: 'DELETE' }),
    retry: (id: string, input: { preferLocal?: boolean; createProject?: boolean } = {}) =>
      request<IdeaResult>(`/ideas/${id}/retry`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    open: (id: string) => request<Project>(`/ideas/${id}/open`, { method: 'POST' }),
  },

  link: () =>
    request<DeviceLink>('/link'),

  settings: {
    get: () => request<Settings>('/settings'),
    testComposer: (input: { apiKey?: string; baseUrl?: string; model?: string } = {}) =>
      request<ComposerTestResult>('/settings/test-composer', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    update: (patch: Record<string, string | number | boolean | null>) =>
      request<Settings>('/settings', { method: 'PATCH', body: JSON.stringify(patch) }),
    testAi: (input: { apiKey?: string; baseUrl?: string; model?: string } = {}) =>
      request<{
        ok: boolean;
        models: string[];
        modelCount: number;
        model: string;
        modelAvailable: boolean | null;
        baseUrl: string;
      }>('/settings/test-ai', {
        method: 'POST',
        body: JSON.stringify(input),
      }).catch((err) => {
        if (err instanceof ApiError) {
          throw err;
        }
        throw err;
      }),
  },
};

export const BANKS: Bank[] = ['A', 'B', 'C', 'D'];
