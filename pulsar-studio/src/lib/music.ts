import type { InstrumentMeta, Kit, ProjectStatus } from './types';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES: Record<string, number[]> = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  pentatonicMinor: [0, 3, 5, 7, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
};

export const SCALE_LABELS: Record<string, string> = {
  minor: 'Minor',
  major: 'Major',
  dorian: 'Dorian',
  phrygian: 'Phrygian',
  mixolydian: 'Mixolydian',
  harmonicMinor: 'Harmonic Minor',
  pentatonicMinor: 'Pentatonic Minor',
  pentatonicMajor: 'Pentatonic Major',
};

export const COLORS: Record<string, string> = {
  acid: '#d6ff4d',
  violet: '#a78bfa',
  cyan: '#5eead4',
  rose: '#fb7185',
  amber: '#fbbf24',
  sky: '#38bdf8',
  emerald: '#34d399',
  fuchsia: '#e879f9',
  orange: '#fb923c',
  teal: '#2dd4bf',
  slate: '#94a3b8',
  red: '#f87171',
};

export const COLOR_KEYS = Object.keys(COLORS);

export const GENRES = [
  'Melodic House',
  'Techno',
  'Lo-Fi Hip Hop',
  'Trap',
  'Drum & Bass',
  'Synthwave',
  'Ambient',
  'Pop',
  'Drill',
  'Afrobeat',
  'Funk',
  'Cinematic',
];

export const STATUSES: ProjectStatus[] = ['sketch', 'demo', 'mixdown', 'master'];

export const STATUS_META: Record<ProjectStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  sketch: { label: 'Sketch', dot: '#94a3b8', text: 'text-ink-300', bg: 'bg-ink-500/15', border: 'border-ink-500/40' },
  demo: { label: 'Demo', dot: '#38bdf8', text: 'text-sky-300', bg: 'bg-sky-400/10', border: 'border-sky-400/30' },
  mixdown: { label: 'Mixdown', dot: '#a78bfa', text: 'text-violet-300', bg: 'bg-violet-400/10', border: 'border-violet-400/30' },
  master: { label: 'Master', dot: '#d6ff4d', text: 'text-acid-300', bg: 'bg-acid-300/10', border: 'border-acid-300/30' },
};

export const INSTRUMENTS: Record<string, InstrumentMeta> = {
  kick: { label: 'Kick', kind: 'drum', color: 'rose', defaultName: 'Kick' },
  snare: { label: 'Snare', kind: 'drum', color: 'amber', defaultName: 'Snare' },
  clap: { label: 'Clap', kind: 'drum', color: 'orange', defaultName: 'Clap' },
  hat: { label: 'Closed Hat', kind: 'drum', color: 'acid', defaultName: 'Hats' },
  openhat: { label: 'Open Hat', kind: 'drum', color: 'emerald', defaultName: 'Open Hat' },
  tom: { label: 'Tom', kind: 'drum', color: 'fuchsia', defaultName: 'Tom' },
  rim: { label: 'Rimshot', kind: 'drum', color: 'cyan', defaultName: 'Rim' },
  cowbell: { label: 'Cowbell', kind: 'drum', color: 'sky', defaultName: 'Cowbell' },
  crash: { label: 'Crash', kind: 'drum', color: 'slate', defaultName: 'Crash' },
  bass: { label: 'Bass', kind: 'synth', color: 'violet', defaultName: 'Bass' },
  sub: { label: 'Sub Bass', kind: 'synth', color: 'sky', defaultName: 'Sub' },
  lead: { label: 'Lead', kind: 'synth', color: 'fuchsia', defaultName: 'Lead' },
  pad: { label: 'Pad', kind: 'synth', color: 'cyan', defaultName: 'Pad' },
  pluck: { label: 'Pluck', kind: 'synth', color: 'emerald', defaultName: 'Pluck' },
  keys: { label: 'Keys', kind: 'synth', color: 'amber', defaultName: 'Keys' },
  sample: { label: 'Sample', kind: 'sample', color: 'teal', defaultName: 'Sample' },
};

export const DRUM_INSTRUMENTS = ['kick', 'snare', 'clap', 'hat', 'openhat', 'tom', 'rim', 'cowbell', 'crash'];
export const SYNTH_INSTRUMENTS = ['bass', 'sub', 'lead', 'pad', 'pluck', 'keys'];
export const ALL_INSTRUMENTS = [...DRUM_INSTRUMENTS, ...SYNTH_INSTRUMENTS];

export const SYNTH_DEFAULTS: Record<string, Record<string, number | string>> = {
  bass: { wave: 'sawtooth', octave: 0, detune: 0.1, cutoff: 0.3, resonance: 0.2, attack: 0.004, decay: 0.22, sustain: 0.5, release: 0.18, envAmount: 0.55, sub: 0.55, glide: 0 },
  sub: { wave: 'sine', octave: 0, detune: 0, cutoff: 0.22, resonance: 0.05, attack: 0.01, decay: 0.3, sustain: 0.8, release: 0.3, envAmount: 0.2, sub: 0.25, glide: 0.1 },
  lead: { wave: 'fatsaw', octave: 0, detune: 0.18, cutoff: 0.55, resonance: 0.22, attack: 0.01, decay: 0.2, sustain: 0.45, release: 0.25, envAmount: 0.4, sub: 0.1, glide: 0.05 },
  pad: { wave: 'fatsaw', octave: 0, detune: 0.24, cutoff: 0.42, resonance: 0.12, attack: 0.9, decay: 1.2, sustain: 0.75, release: 1.8, envAmount: 0.25, sub: 0.15, glide: 0 },
  pluck: { wave: 'triangle', octave: 0, detune: 0.06, cutoff: 0.5, resonance: 0.18, attack: 0.002, decay: 0.16, sustain: 0.05, release: 0.2, envAmount: 0.7, sub: 0.05, glide: 0 },
  keys: { wave: 'triangle', octave: 0, detune: 0.04, cutoff: 0.46, resonance: 0.1, attack: 0.008, decay: 0.5, sustain: 0.3, release: 0.5, envAmount: 0.45, sub: 0.2, glide: 0 },
};

export const DRUM_DEFAULTS: Record<string, Record<string, number | string>> = {
  kick: { tune: 0, decay: 0.42, tone: 0.5, snap: 0.35 },
  snare: { tune: 0, decay: 0.24, tone: 0.5, snap: 0.5 },
  clap: { tune: 0, decay: 0.28, tone: 0.55, snap: 0.6 },
  hat: { tune: 0, decay: 0.06, tone: 0.6, snap: 0.4 },
  openhat: { tune: 0, decay: 0.32, tone: 0.55, snap: 0.3 },
  tom: { tune: 0, decay: 0.3, tone: 0.45, snap: 0.3 },
  rim: { tune: 0, decay: 0.08, tone: 0.6, snap: 0.6 },
  cowbell: { tune: 0, decay: 0.18, tone: 0.5, snap: 0.4 },
  crash: { tune: 0, decay: 1.4, tone: 0.6, snap: 0.3 },
};

export const defaultParams = (instrument: string): Record<string, number | string> => ({
  ...(SYNTH_DEFAULTS[instrument] || DRUM_DEFAULTS[instrument] || {}),
});

export const WAVES = [
  { id: 'sawtooth', label: 'Saw' },
  { id: 'fatsaw', label: 'Fat Saw' },
  { id: 'square', label: 'Square' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'triangle', label: 'Tri' },
  { id: 'sine', label: 'Sine' },
];

export const KITS: Kit[] = [
  { id: 'neon', name: 'Neon 808', description: 'Punchy modern 808 kit with a saturated top end.' },
  { id: 'vinyl', name: 'Vinyl Dust', description: 'Dusty sampled drums with soft transients.' },
  { id: 'analog', name: 'Analog 909', description: 'Classic analog drum machine warmth.' },
  { id: 'tape', name: 'Tape Heat', description: 'Saturated, slightly blown-out drums.' },
];

export const SAMPLE_CATEGORIES = ['All', 'Drums', 'Bass', 'Synth', 'Loops', 'Vocals', 'FX'];

export const PROMPT_IDEAS = [
  'Warm melodic house at 122 BPM with a rolling bassline and wide analog pads',
  'Dusty lo-fi hip hop with swung drums, vinyl noise and jazzy keys in Eb',
  'Dark trap with booming 808s, fast hi-hat rolls and a floating bell melody',
  'Peak time warehouse techno, 134 BPM, tense filter sweeps and a rolling low end',
  'Neon synthwave cruiser with gated snare and octave bass at 110',
  'Liquid drum & bass roller with chopped breaks and shimmering pads',
  'Cinematic trailer cue in C minor with string swells and deep impacts',
  'Sun-soaked afrobeat groove with log drums and syncopated bass',
];

export const midiToName = (midi: number) => `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;

export const keyLabel = (root: number, scale?: string) =>
  `${NOTE_NAMES[((root % 12) + 12) % 12]}${scale ? ` ${SCALE_LABELS[scale] || scale}` : ''}`;

export const colorOf = (key: string) => COLORS[key] || '#d6ff4d';

export function scaleMidi(root: number, scale: string, octave: number, degree: number) {
  const intervals = SCALES[scale] || SCALES.minor;
  const len = intervals.length;
  const oct = Math.floor(degree / len);
  const i = ((degree % len) + len) % len;
  return (octave + 1) * 12 + root + intervals[i] + oct * 12;
}

export function isInScale(midi: number, root: number, scale: string) {
  const intervals = SCALES[scale] || SCALES.minor;
  return intervals.includes((((midi - root) % 12) + 12) % 12);
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const blankSteps = (length = 32) =>
  Array.from({ length }, () => ({ on: false, vel: 0.8, prob: 1, pitch: 0 }));
