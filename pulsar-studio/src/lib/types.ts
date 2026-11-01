export type Bank = 'A' | 'B' | 'C' | 'D';
export type ProjectStatus = 'sketch' | 'demo' | 'mixdown' | 'master';
export type TrackKind = 'drum' | 'synth' | 'sample';

export interface Step {
  on: boolean;
  vel: number;
  prob: number;
  pitch: number;
}

export interface Note {
  step: number;
  pitch: number;
  len: number;
  vel: number;
}

export interface SynthParams {
  wave?: string;
  octave?: number;
  detune?: number;
  cutoff?: number;
  resonance?: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  envAmount?: number;
  sub?: number;
  glide?: number;
  tune?: number;
  tone?: number;
  snap?: number;
  [key: string]: number | string | undefined;
}

export interface Track {
  id: string;
  project_id: string;
  name: string;
  kind: TrackKind;
  instrument: string;
  color: string;
  position: number;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  drive: number;
  filter_cutoff: number;
  reverb_send: number;
  delay_send: number;
  patterns: Record<Bank, Step[]>;
  notes: Record<Bank, Note[]>;
  synth: SynthParams;
  sample_id: string | null;
  instrumentLabel?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ArrangementBlock {
  bank: Bank;
  repeats: number;
}

export interface CoverTheme {
  theme?: string;
  hue?: number;
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  key_root: number;
  scale: string;
  description: string;
  sections: string[];
  arrangement: ArrangementBlock[];
  status: ProjectStatus;
  favorite: boolean;
  cover: CoverTheme;
  swing: number;
  master_gain: number;
  ai_notes: string;
  created_at: string;
  updated_at: string;
  duration: number;
  trackCount?: number;
  track_count?: number;
  tracks?: Track[];
}

export interface Sample {
  id: string;
  name: string;
  category: string;
  instrument: string;
  bpm: number | null;
  key_root: number | null;
  description: string;
  color: string;
  duration: number;
  source: string;
  favorite: boolean;
  plays: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Preset {
  id: string;
  name: string;
  instrument: string;
  category: string;
  description: string;
  color: string;
  params: SynthParams;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface IdeaPayload {
  title: string;
  genre: string;
  bpm: number;
  keyRoot: number;
  scale: string;
  description: string;
  sections: string[];
  arrangement: ArrangementBlock[];
  tracks: Partial<Track>[];
  engine?: string;
}

export interface Idea {
  id: string;
  prompt: string;
  title: string | null;
  genre: string | null;
  bpm: number | null;
  key_root: number | null;
  scale: string | null;
  status: 'generating' | 'ready' | 'saved' | 'failed' | 'draft';
  engine: 'arena' | 'local' | string;
  model: string | null;
  summary: string | null;
  error: string | null;
  error_detail?: AiDiagnostics | null;
  project_id: string | null;
  payload?: IdeaPayload | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  'user.displayName'?: string;
  'user.studioName'?: string;
  'user.theme'?: string;
  'user.defaultBpm'?: number;
  'project.autosave'?: boolean;
  'project.metronome'?: boolean;
  'project.countIn'?: boolean;
  'ai.provider'?: string;
  'ai.baseUrl'?: string;
  'ai.model'?: string;
  'ai.hasKey'?: boolean;
  'ai.keyHint'?: string;
  'ai.envKey'?: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

export interface Stats {
  totals: {
    projects: number;
    tracks: number;
    samples: number;
    presets: number;
    ideas: number;
    favorites: number;
    minutes: number;
    bpmAvg: number;
  };
  statusCounts: Record<ProjectStatus, number>;
  genreCounts: Record<string, number>;
  recentProjects: Project[];
  recentIdeas: Idea[];
  featuredPresets: Preset[];
  activity: { date: string; projects: number; ideas: number; total: number }[];
}

export interface InstrumentMeta {
  label: string;
  kind: TrackKind;
  color: string;
  defaultName: string;
}

export interface Kit {
  id: string;
  name: string;
  description: string;
}

export interface DeviceLinkHost {
  label: string;
  url: string;
  kind: 'public' | 'lan';
}

export interface DeviceLink {
  port: number;
  primary: string;
  local: string;
  hosts: DeviceLinkHost[];
  secure: boolean;
  qrSvg: string | null;
}

export interface AiAttempt {
  label: string;
  endpoint: string;
  status: number | null;
  detail: string;
}

/** Everything the server learned while trying to reach the Arena router. */
export interface AiDiagnostics {
  code: string;
  status?: number | null;
  detail?: string | null;
  endpoint?: string | null;
  attempts?: AiAttempt[];
  modelAvailable?: boolean | null;
  availableModels?: string[] | null;
}

export interface IdeaResult {
  idea: Idea;
  projectId: string | null;
  warning: string | null;
  diagnostics?: AiDiagnostics | null;
}

export interface ComposerTestResult {
  ok: boolean;
  endpoint: string;
  variant: string;
  sample: string;
  attempts: AiAttempt[];
  model: string;
  baseUrl: string;
}
