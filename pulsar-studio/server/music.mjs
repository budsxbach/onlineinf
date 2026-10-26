// Shared musical vocabulary used by the composer, seeder and API.
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  pentatonicMinor: [0, 3, 5, 7, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
};

export const SCALE_LABELS = {
  minor: 'Natural Minor',
  major: 'Major',
  dorian: 'Dorian',
  phrygian: 'Phrygian',
  mixolydian: 'Mixolydian',
  harmonicMinor: 'Harmonic Minor',
  pentatonicMinor: 'Pentatonic Minor',
  pentatonicMajor: 'Pentatonic Major',
};

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

export const COLORS = {
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

export const INSTRUMENTS = {
  kick: { label: 'Kick', kind: 'drum', color: 'rose', defaultName: 'Kick' },
  snare: { label: 'Snare', kind: 'drum', color: 'amber', defaultName: 'Snare' },
  clap: { label: 'Clap', kind: 'drum', color: 'orange', defaultName: 'Clap' },
  hat: { label: 'Closed Hat', kind: 'drum', color: 'acid', defaultName: 'Hats' },
  openhat: { label: 'Open Hat', kind: 'drum', color: 'emerald', defaultName: 'Open Hat' },
  tom: { label: 'Tom', kind: 'drum', color: 'fuchsia', defaultName: 'Toms' },
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

export const WAVES = ['sawtooth', 'square', 'triangle', 'sine', 'fatsaw', 'pulse'];

export const SYNTH_DEFAULTS = {
  bass: { wave: 'sawtooth', octave: 0, detune: 0.1, cutoff: 0.3, resonance: 0.2, attack: 0.004, decay: 0.22, sustain: 0.5, release: 0.18, envAmount: 0.55, sub: 0.55, glide: 0 },
  sub: { wave: 'sine', octave: 0, detune: 0, cutoff: 0.22, resonance: 0.05, attack: 0.01, decay: 0.3, sustain: 0.8, release: 0.3, envAmount: 0.2, sub: 0.25, glide: 0.1 },
  lead: { wave: 'fatsaw', octave: 0, detune: 0.18, cutoff: 0.55, resonance: 0.22, attack: 0.01, decay: 0.2, sustain: 0.45, release: 0.25, envAmount: 0.4, sub: 0.1, glide: 0.05 },
  pad: { wave: 'fatsaw', octave: 0, detune: 0.24, cutoff: 0.42, resonance: 0.12, attack: 0.9, decay: 1.2, sustain: 0.75, release: 1.8, envAmount: 0.25, sub: 0.15, glide: 0 },
  pluck: { wave: 'triangle', octave: 0, detune: 0.06, cutoff: 0.5, resonance: 0.18, attack: 0.002, decay: 0.16, sustain: 0.05, release: 0.2, envAmount: 0.7, sub: 0.05, glide: 0 },
  keys: { wave: 'triangle', octave: 0, detune: 0.04, cutoff: 0.46, resonance: 0.1, attack: 0.008, decay: 0.5, sustain: 0.3, release: 0.5, envAmount: 0.45, sub: 0.2, glide: 0 },
};

export const DRUM_DEFAULTS = {
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

export const KITS = [
  { id: 'neon', name: 'Neon 808', description: 'Punchy modern 808 kit with a saturated top end.', kick: { decay: 0.5, tone: 0.55, snap: 0.5 }, snare: { decay: 0.2, tone: 0.5, snap: 0.6 }, hat: { decay: 0.05, tone: 0.7, snap: 0.5 } },
  { id: 'vinyl', name: 'Vinyl Dust', description: 'Dusty sampled drums with soft transients.', kick: { decay: 0.34, tone: 0.36, snap: 0.2 }, snare: { decay: 0.3, tone: 0.42, snap: 0.35 }, hat: { decay: 0.08, tone: 0.45, snap: 0.25 } },
  { id: 'analog', name: 'Analog 909', description: 'Classic analog drum machine warmth.', kick: { decay: 0.38, tone: 0.5, snap: 0.3 }, snare: { decay: 0.18, tone: 0.6, snap: 0.55 }, hat: { decay: 0.04, tone: 0.65, snap: 0.45 } },
  { id: 'tape', name: 'Tape Heat', description: 'Saturated, slightly blown-out drums.', kick: { decay: 0.46, tone: 0.6, snap: 0.4 }, snare: { decay: 0.26, tone: 0.55, snap: 0.5 }, hat: { decay: 0.07, tone: 0.55, snap: 0.4 } },
];

export function makeBlankSteps(length = 32) {
  return Array.from({ length }, () => ({ on: false, vel: 0.8, prob: 1, pitch: 0 }));
}

export function emptyBanksNotes() {
  return { A: [], B: [], C: [], D: [] };
}

export function defaultParams(instrument) {
  if (SYNTH_DEFAULTS[instrument]) return { ...SYNTH_DEFAULTS[instrument] };
  if (DRUM_DEFAULTS[instrument]) return { ...DRUM_DEFAULTS[instrument] };
  return {};
}

export function midiToName(midi) {
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

export function scaleNotes(keyRoot, scale) {
  return (SCALES[scale] || SCALES.minor).map((i) => (keyRoot + i) % 12);
}

export function scaleMidi(keyRoot, scale, octave, degree) {
  const intervals = SCALES[scale] || SCALES.minor;
  const len = intervals.length;
  const oct = Math.floor(degree / len);
  const i = ((degree % len) + len) % len;
  return (octave + 1) * 12 + keyRoot + intervals[i] + oct * 12;
}
