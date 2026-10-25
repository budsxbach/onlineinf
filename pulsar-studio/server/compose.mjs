import {
  COLORS,
  DRUM_DEFAULTS,
  INSTRUMENTS,
  SCALES,
  SYNTH_DEFAULTS,
  makeBlankSteps,
  scaleMidi,
} from './music.mjs';

/* ------------------------------------------------------------------ *
 *  Deterministic randomness
 * ------------------------------------------------------------------ */

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rand, list) => list[Math.floor(rand() * list.length) % list.length];
const chance = (rand, p) => rand() < p;

/* ------------------------------------------------------------------ *
 *  Pattern helpers
 * ------------------------------------------------------------------ */

function steps(hits, baseVel = 0.85) {
  const arr = makeBlankSteps(32);
  for (const hit of hits) {
    const step = Array.isArray(hit) ? hit[0] : hit;
    const vel = Array.isArray(hit) ? hit[1] : baseVel;
    const prob = Array.isArray(hit) && hit[2] != null ? hit[2] : 1;
    if (step >= 0 && step < 32) {
      arr[step] = { on: true, vel, prob, pitch: 0 };
    }
  }
  return arr;
}

function note(step, pitch, len = 2, vel = 0.85) {
  return { step, pitch, len, vel };
}

function chordProgression(genre, rand) {
  const options = {
    'Melodic House': [[0, 5, 3, 4], [0, 3, 5, 4], [0, 5, 6, 4]],
    Techno: [[0, 0, 5, 3], [0, 3, 5, 4]],
    'Lo-Fi Hip Hop': [[1, 4, 0, 5], [0, 5, 3, 4], [1, 5, 0, 4]],
    Trap: [[0, 5, 3, 4], [0, 3, 5, 4]],
    Drill: [[0, 5, 3, 4], [0, 1, 5, 4]],
    'Drum & Bass': [[0, 5, 3, 4], [0, 3, 4, 5]],
    Synthwave: [[0, 5, 3, 4], [0, 3, 5, 6]],
    Ambient: [[0, 3, 5, 4], [0, 5, 3, 4], [0, 3, 4, 5]],
    Pop: [[0, 4, 5, 3], [0, 3, 4, 5]],
    Afrobeat: [[0, 4, 5, 3], [0, 5, 3, 4]],
    Funk: [[0, 3, 4, 3], [0, 4, 3, 4]],
    Cinematic: [[0, 5, 3, 4], [0, 3, 6, 4]],
  };
  return pick(rand, options[genre] || options['Melodic House']);
}

const BPM_BY_GENRE = {
  'Melodic House': 124,
  Techno: 132,
  'Lo-Fi Hip Hop': 84,
  Trap: 142,
  Drill: 144,
  'Drum & Bass': 174,
  Synthwave: 110,
  Ambient: 72,
  Pop: 104,
  Afrobeat: 108,
  Funk: 112,
  Cinematic: 82,
};

const SCALE_BY_GENRE = {
  'Melodic House': 'minor',
  Techno: 'minor',
  'Lo-Fi Hip Hop': 'dorian',
  Trap: 'minor',
  Drill: 'harmonicMinor',
  'Drum & Bass': 'minor',
  Synthwave: 'minor',
  Ambient: 'major',
  Pop: 'major',
  Afrobeat: 'pentatonicMajor',
  Funk: 'mixolydian',
  Cinematic: 'minor',
};

const GENRE_KEYWORDS = [
  [['trap', '808', 'hi hat', 'hat rolls'], 'Trap'],
  [['drill', 'sliding 808', 'uk drill'], 'Drill'],
  [['lo-fi', 'lofi', 'chill', 'study', 'jazzy', 'boom bap', 'boom-bap'], 'Lo-Fi Hip Hop'],
  [['deep house', 'melodic house', 'house', 'piano house'], 'Melodic House'],
  [['techno', 'rave', 'warehouse', 'acid', 'peak time'], 'Techno'],
  [['drum and bass', 'drum & bass', 'dnb', 'd&b', 'jungle', 'breakbeat', 'liquid'], 'Drum & Bass'],
  [['synthwave', 'retro', '80s', 'outrun', 'neon'], 'Synthwave'],
  [['ambient', 'drone', 'sleep', 'meditation', 'soundscape'], 'Ambient'],
  [['afro', 'amapiano', 'afrobeat', 'log drum'], 'Afrobeat'],
  [['funk', 'disco', 'groove', 'slap bass'], 'Funk'],
  [['cinematic', 'score', 'film', 'orchestral', 'epic'], 'Cinematic'],
  [['pop', 'radio', 'vocal', 'chart'], 'Pop'],
];

const TITLE_ADJ = ['Midnight', 'Neon', 'Velvet', 'Chrome', 'Paper', 'Golden', 'Electric', 'Silent', 'Crimson', 'Glass', 'Slow', 'Solar', 'Lunar', 'Velour', 'Afterglow', 'Static'];
const TITLE_NOUN = ['Bloom', 'Transit', 'Garden', 'Drift', 'Machine', 'Mirage', 'Tides', 'Circuit', 'Ember', 'Skyline', 'Motion', 'Echoes', 'Halogen', 'Reverie', 'Signal'];

const GENRE_DESCRIPTIONS = {
  'Melodic House': 'a wide-screen melodic house groove built on a rolling low end, airy chord beds and a hypnotic arp',
  Techno: 'a driving warehouse techno cut with machine-tight percussion, a rolling bass and a tense filter sweep',
  'Lo-Fi Hip Hop': 'a dusty lo-fi head-nodder with lazy swung drums, warm keys and vinyl-worn chords',
  Trap: 'a dark trap banger with booming 808s, crisp hi-hat rolls and a floating bell melody',
  Drill: 'a sliding UK drill groove with syncopated kicks, sliding sub bass and eerie melodies',
  'Drum & Bass': 'a liquid drum & bass roller with a chopped breakbeat, deep sub and shimmering pads',
  Synthwave: 'a neon-lit synthwave cruiser with gated drums, octave bass and a widescreen analog lead',
  Ambient: 'an ambient drift of slow harmonic pads, sparse pulses and long reverb tails',
  Pop: 'a bright modern pop sketch with a clean beat, chord stacks and a hook-first topline',
  Afrobeat: 'a sun-soaked afrobeat groove with log-drum percussion, syncopated bass and warm keys',
  Funk: 'a tight funk workout with syncopated drums, popping bass and clipped clav stabs',
  Cinematic: 'a cinematic instrumental bed with string-like pads, low pulses and a patient piano motif',
};

/* ------------------------------------------------------------------ *
 *   Track factories
 * ------------------------------------------------------------------ */

const MIX_DEFAULTS = {
  kick: { volume: 1.0, pan: 0, drive: 0.12, reverbSend: 0.02, delaySend: 0.01 },
  snare: { volume: 0.82, pan: 0, drive: 0.1, reverbSend: 0.12, delaySend: 0.02 },
  clap: { volume: 0.72, pan: 0.02, drive: 0.08, reverbSend: 0.18, delaySend: 0.03 },
  hat: { volume: 0.5, pan: 0.16, drive: 0.04, reverbSend: 0.06, delaySend: 0.02 },
  openhat: { volume: 0.4, pan: 0.2, drive: 0.03, reverbSend: 0.14, delaySend: 0.02 },
  tom: { volume: 0.55, pan: -0.18, drive: 0.08, reverbSend: 0.14, delaySend: 0.02 },
  rim: { volume: 0.38, pan: -0.24, drive: 0.05, reverbSend: 0.16, delaySend: 0.06 },
  cowbell: { volume: 0.32, pan: 0.28, drive: 0.06, reverbSend: 0.2, delaySend: 0.04 },
  crash: { volume: 0.3, pan: -0.1, drive: 0.02, reverbSend: 0.28, delaySend: 0.02 },
  bass: { volume: 0.9, pan: 0, drive: 0.14, reverbSend: 0.02, delaySend: 0.02 },
  sub: { volume: 0.82, pan: 0, drive: 0.05, reverbSend: 0.01, delaySend: 0.01 },
  lead: { volume: 0.55, pan: 0.06, drive: 0.08, reverbSend: 0.24, delaySend: 0.2 },
  pad: { volume: 0.52, pan: 0, drive: 0.03, reverbSend: 0.5, delaySend: 0.12 },
  pluck: { volume: 0.5, pan: 0.22, drive: 0.05, reverbSend: 0.3, delaySend: 0.26 },
  keys: { volume: 0.62, pan: -0.1, drive: 0.04, reverbSend: 0.3, delaySend: 0.12 },
  sample: { volume: 0.7, pan: 0, drive: 0, reverbSend: 0.15, delaySend: 0.05 },
};

function track(spec) {
  const meta = INSTRUMENTS[spec.instrument] || INSTRUMENTS.kick;
  const mix = MIX_DEFAULTS[spec.instrument] || MIX_DEFAULTS.sample;
  const params = spec.synth || (SYNTH_DEFAULTS[spec.instrument] ? { ...SYNTH_DEFAULTS[spec.instrument] } : DRUM_DEFAULTS[spec.instrument] ? { ...DRUM_DEFAULTS[spec.instrument] } : {});
  const patterns = spec.patterns || {};
  const notes = spec.notes || {};
  const banks = ['A', 'B', 'C', 'D'];
  const fullPatterns = {};
  const fullNotes = {};
  for (const b of banks) {
    fullPatterns[b] = patterns[b] || makeBlankSteps(32);
    fullNotes[b] = notes[b] || [];
  }
  return {
    name: spec.name || meta.defaultName,
    kind: meta.kind,
    instrument: spec.instrument,
    color: spec.color || meta.color,
    volume: spec.volume ?? mix.volume,
    pan: spec.pan ?? mix.pan,
    mute: !!spec.mute,
    solo: false,
    drive: spec.drive ?? mix.drive,
    filterCutoff: spec.filterCutoff ?? (meta.kind === 'drum' ? 0.92 : 0.75),
    reverbSend: spec.reverbSend ?? mix.reverbSend,
    delaySend: spec.delaySend ?? mix.delaySend,
    synth: { ...params, ...(spec.synth || {}) },
    patterns: fullPatterns,
    notes: fullNotes,
    sampleId: spec.sampleId || null,
  };
}

/* ------------------------------------------------------------------ *
 *  Groove builders — 32 steps = 2 bars of 16ths
 * ------------------------------------------------------------------ */

function drumKitFor(genre, rand) {
  switch (genre) {
    case 'Melodic House':
      return {
        kick: steps([[0, 1], [4, 0.92], [8, 1], [12, 0.92], [16, 1], [20, 0.92], [24, 1], [28, 0.94]]),
        clap: steps([[4, 0.9], [12, 0.82], [20, 0.9], [28, 0.8]]),
        hat: steps([[2, 0.5], [3, 0.22], [6, 0.55], [7, 0.2], [10, 0.5], [11, 0.22], [14, 0.56], [15, 0.24], [18, 0.5], [19, 0.22], [22, 0.55], [23, 0.2], [26, 0.52], [27, 0.24], [30, 0.58], [31, 0.26]]),
        openhat: steps([[6, 0.6], [14, 0.58], [22, 0.6], [30, 0.62]]),
        crash: steps([[0, 0.45]]),
      };
    case 'Techno':
      return {
        kick: steps([[0, 1], [4, 0.96], [8, 1], [12, 0.96], [16, 1], [20, 0.96], [24, 1], [28, 0.96]]),
        clap: steps([[4, 0.72], [12, 0.8], [20, 0.72], [28, 0.8]]),
        rim: steps([[2, 0.35], [10, 0.4], [18, 0.35], [26, 0.4]]),
        hat: steps([[1, 0.3], [3, 0.42], [5, 0.3], [7, 0.44], [9, 0.3], [11, 0.42], [13, 0.3], [15, 0.46], [17, 0.3], [19, 0.42], [21, 0.3], [23, 0.44], [25, 0.3], [27, 0.42], [29, 0.3], [31, 0.48]]),
        openhat: steps([[2, 0.3], [10, 0.32], [18, 0.3], [26, 0.34]]),
      };
    case 'Lo-Fi Hip Hop':
      return {
        kick: steps([[0, 0.92], [7, 0.74], [10, 0.86], [19, 0.72], [24, 0.9]]),
        snare: steps([[12, 0.78], [28, 0.8]]),
        rim: steps([[6, 0.34], [22, 0.32], [30, 0.28]]),
        hat: steps([[1, 0.26], [3, 0.4], [5, 0.24], [7, 0.38], [9, 0.26], [11, 0.42], [13, 0.24], [15, 0.36], [17, 0.26], [19, 0.4], [21, 0.24], [23, 0.38], [25, 0.26], [27, 0.42], [29, 0.24], [31, 0.34]]),
        openhat: steps([[14, 0.3], [30, 0.3]]),
      };
    case 'Trap':
      return {
        kick: steps([[0, 1], [6, 0.86], [10, 0.9], [16, 1], [22, 0.86], [26, 0.9]]),
        snare: steps([[8, 0.92], [24, 0.92]]),
        clap: steps([[8, 0.55], [24, 0.55]]),
        hat: steps([[0, 0.42], [2, 0.32], [3, 0.46], [4, 0.32], [6, 0.42], [8, 0.32], [10, 0.42], [11, 0.32], [12, 0.46], [14, 0.6], [15, 0.66], [16, 0.42], [18, 0.32], [19, 0.46], [20, 0.32], [22, 0.42], [24, 0.32], [26, 0.46], [27, 0.32], [28, 0.42], [30, 0.62], [31, 0.7]]),
        openhat: steps([[7, 0.34], [15, 0.3], [23, 0.34], [31, 0.3]]),
        crash: steps([[0, 0.4]]),
      };
    case 'Drill':
      return {
        kick: steps([[0, 1], [3, 0.8], [10, 0.9], [16, 1], [19, 0.8], [26, 0.9]]),
        snare: steps([[8, 0.9], [24, 0.9]]),
        hat: steps([[0, 0.42], [2, 0.28], [3, 0.44], [5, 0.3], [6, 0.46], [8, 0.3], [9, 0.44], [11, 0.28], [12, 0.42], [14, 0.3], [15, 0.48], [16, 0.42], [18, 0.28], [19, 0.44], [21, 0.3], [22, 0.46], [24, 0.3], [25, 0.44], [27, 0.28], [28, 0.42], [30, 0.32], [31, 0.5]]),
        rim: steps([[4, 0.3], [20, 0.3]]),
      };
    case 'Drum & Bass':
      return {
        kick: steps([[0, 1], [10, 0.85], [16, 1], [26, 0.85]]),
        snare: steps([[8, 0.92], [24, 0.92], [14, 0.34], [30, 0.34]]),
        hat: steps([[0, 0.36], [1, 0.22], [2, 0.4], [3, 0.22], [4, 0.36], [5, 0.24], [6, 0.42], [7, 0.22], [8, 0.36], [9, 0.24], [10, 0.4], [11, 0.22], [12, 0.38], [13, 0.24], [14, 0.44], [15, 0.24], [16, 0.36], [17, 0.22], [18, 0.4], [19, 0.22], [20, 0.36], [21, 0.24], [22, 0.42], [23, 0.22], [24, 0.36], [25, 0.24], [26, 0.4], [27, 0.22], [28, 0.38], [29, 0.24], [30, 0.46], [31, 0.26]]),
        openhat: steps([[6, 0.36], [22, 0.4]]),
        crash: steps([[0, 0.34]]),
      };
    case 'Synthwave':
      return {
        kick: steps([[0, 1], [4, 0.92], [8, 1], [12, 0.92], [16, 1], [20, 0.92], [24, 1], [28, 0.92]]),
        snare: steps([[4, 0.88], [12, 0.88], [20, 0.88], [28, 0.88]]),
        hat: steps([[0, 0.32], [2, 0.45], [4, 0.32], [6, 0.45], [8, 0.32], [10, 0.45], [12, 0.32], [14, 0.45], [16, 0.32], [18, 0.45], [20, 0.32], [22, 0.45], [24, 0.32], [26, 0.45], [28, 0.32], [30, 0.45]]),
        tom: steps([[30, 0.5], [31, 0.55]]),
        crash: steps([[0, 0.34]]),
      };
    case 'Ambient':
      return {
        kick: steps([[0, 0.42], [16, 0.38]]),
        rim: steps([[10, 0.24], [26, 0.22]]),
        hat: steps([[6, 0.18], [14, 0.14], [22, 0.18], [30, 0.14]]),
        crash: steps([[0, 0.22]]),
      };
    case 'Pop':
      return {
        kick: steps([[0, 1], [6, 0.72], [8, 0.94], [16, 1], [22, 0.72], [24, 0.94]]),
        clap: steps([[4, 0.88], [12, 0.9], [20, 0.88], [28, 0.9]]),
        hat: steps([[0, 0.34], [2, 0.46], [4, 0.34], [6, 0.46], [8, 0.34], [10, 0.46], [12, 0.34], [14, 0.46], [16, 0.34], [18, 0.46], [20, 0.34], [22, 0.46], [24, 0.34], [26, 0.46], [28, 0.34], [30, 0.46]]),
        openhat: steps([[14, 0.32], [30, 0.32]]),
      };
    case 'Afrobeat':
      return {
        kick: steps([[0, 0.96], [6, 0.78], [12, 0.9], [20, 0.8], [26, 0.88]]),
        clap: steps([[4, 0.7], [12, 0.76], [20, 0.7], [28, 0.76]]),
        hat: steps([[1, 0.24], [3, 0.36], [5, 0.24], [7, 0.38], [9, 0.24], [11, 0.36], [13, 0.24], [15, 0.38], [17, 0.24], [19, 0.36], [21, 0.24], [23, 0.38], [25, 0.24], [27, 0.36], [29, 0.24], [31, 0.38]]),
        tom: steps([[3, 0.42], [7, 0.36], [11, 0.42], [15, 0.36], [19, 0.42], [23, 0.36], [27, 0.42], [31, 0.36]]),
        cowbell: steps([[6, 0.26], [22, 0.26]]),
      };
    case 'Funk':
      return {
        kick: steps([[0, 0.96], [6, 0.72], [10, 0.86], [16, 0.94], [19, 0.7], [24, 0.86], [28, 0.7]]),
        snare: steps([[4, 0.86], [12, 0.9], [20, 0.86], [28, 0.9], [7, 0.28], [15, 0.24], [23, 0.28], [31, 0.24]]),
        hat: steps([[0, 0.34], [1, 0.2], [2, 0.4], [3, 0.24], [4, 0.36], [5, 0.2], [6, 0.42], [7, 0.26], [8, 0.34], [9, 0.2], [10, 0.42], [11, 0.24], [12, 0.36], [13, 0.2], [14, 0.44], [15, 0.26], [16, 0.34], [17, 0.2], [18, 0.4], [19, 0.24], [20, 0.36], [21, 0.2], [22, 0.42], [23, 0.26], [24, 0.34], [25, 0.2], [26, 0.42], [27, 0.24], [28, 0.36], [29, 0.2], [30, 0.44], [31, 0.26]]),
        openhat: steps([[11, 0.34], [27, 0.34]]),
        cowbell: steps([[4, 0.22], [12, 0.22], [20, 0.22], [28, 0.22]]),
      };
    case 'Cinematic':
    default:
      return {
        kick: steps([[0, 0.6], [16, 0.5]]),
        tom: steps([[12, 0.4], [28, 0.44]]),
        rim: steps([[8, 0.24], [24, 0.24]]),
        crash: steps([[0, 0.3]]),
      };
  }
}

function bassRhythm(genre) {
  switch (genre) {
    case 'Melodic House':
      return { steps: [2, 6, 10, 14, 18, 22, 26, 30], len: 2, vel: 0.85, octaveJump: true };
    case 'Techno':
      return { steps: [2, 6, 10, 14, 18, 22, 26, 30], len: 2, vel: 0.9, octaveJump: false };
    case 'Lo-Fi Hip Hop':
      return { steps: [[0, 6], [7, 3], [12, 4], [16, 6], [23, 3], [28, 4]], len: 4, vel: 0.78 };
    case 'Trap':
    case 'Drill':
      return { steps: [[0, 8], [10, 4], [16, 8], [26, 5]], len: 6, vel: 0.9, slide: true };
    case 'Drum & Bass':
      return { steps: [[0, 7], [10, 3], [16, 7], [26, 5]], len: 6, vel: 0.86 };
    case 'Synthwave':
      return { steps: [0, 4, 8, 12, 16, 20, 24, 28], len: 2, vel: 0.8, octaveJump: true };
    case 'Ambient':
      return { steps: [[0, 16], [16, 16]], len: 16, vel: 0.6 };
    case 'Pop':
      return { steps: [0, 4, 8, 12, 16, 20, 24, 28], len: 2, vel: 0.82 };
    case 'Afrobeat':
      return { steps: [[0, 3], [3, 3], [7, 2], [10, 3], [14, 2], [16, 3], [19, 3], [23, 2], [26, 3], [30, 2]], len: 3, vel: 0.85 };
    case 'Funk':
      return { steps: [[0, 2], [3, 1], [6, 2], [10, 2], [12, 1], [16, 2], [19, 1], [22, 2], [26, 2], [28, 1]], len: 2, vel: 0.86 };
    case 'Cinematic':
      return { steps: [[0, 16], [16, 16]], len: 16, vel: 0.55 };
    default:
      return { steps: [0, 8, 16, 24], len: 4, vel: 0.8 };
  }
}

function leadRhythm(genre, rand) {
  const options = {
    'Melodic House': [[0, 3, 6, 10, 14, 18, 22, 26], [2, 6, 10, 12, 18, 22, 26]],
    Techno: [[2, 10, 18, 26], [0, 6, 8, 14, 16, 22, 24, 30]],
    'Lo-Fi Hip Hop': [[0, 6, 12, 20, 26], [2, 8, 14, 18, 24]],
    Trap: [[0, 4, 10, 16, 20, 26], [2, 8, 12, 18, 22, 28]],
    Drill: [[0, 6, 12, 16, 22, 26], [2, 10, 14, 20, 24, 30]],
    'Drum & Bass': [[0, 6, 12, 18, 24, 28], [2, 8, 14, 20, 26]],
    Synthwave: [[0, 4, 8, 12, 16, 20, 24, 28], [0, 6, 10, 16, 22, 26]],
    Ambient: [[0, 8, 16, 24], [4, 12, 20, 28]],
    Pop: [[0, 4, 8, 12, 16, 20, 24, 28], [0, 6, 10, 14, 18, 22, 28]],
    Afrobeat: [[0, 6, 10, 16, 22, 26], [2, 8, 12, 18, 24, 30]],
    Funk: [[2, 6, 10, 14, 18, 22, 26, 30], [0, 4, 8, 12, 20, 24, 28]],
    Cinematic: [[0, 12, 20, 28], [4, 16, 24]],
  };
  return pick(rand, options[genre] || options['Melodic House']);
}

/* ------------------------------------------------------------------ *
 *  Song generation
 * ------------------------------------------------------------------ */

export function detectGenre(prompt = '') {
  const p = prompt.toLowerCase();
  let best = null;
  for (const [keywords, genre] of GENRE_KEYWORDS) {
    for (const kw of keywords) {
      if (p.includes(kw)) {
        const score = kw.length;
        if (!best || score > best.score) best = { genre, score };
      }
    }
  }
  return best?.genre || null;
}

export function detectTempo(prompt = '') {
  const m = prompt.match(/(\d{2,3})\s*(bpm|beats per minute)/i);
  if (m) {
    const v = parseInt(m[1], 10);
    if (v >= 50 && v <= 220) return v;
  }
  return null;
}

export function detectKey(prompt = '') {
  const match = prompt.match(/\bin\s+([A-G][#b]?)\s*(minor|major|dorian|phrygian|mixolydian)?/i);
  if (!match) return null;
  const map = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  const root = map[match[1]] ?? map[match[1][0]];
  if (root == null) return null;
  const scaleWord = (match[2] || '').toLowerCase();
  let scale = null;
  if (scaleWord === 'major') scale = 'major';
  else if (scaleWord === 'minor') scale = 'minor';
  else if (scaleWord && SCALES[scaleWord]) scale = scaleWord;
  return { keyRoot: root, scale };
}

function melodyFromChords({ rand, progression, keyRoot, scale, rhythm, octave, chordSize = 1 }) {
  const notes = [];
  const block = 8;
  let prev = null;
  for (const [step, dur] of rhythm.map((s, i) => (typeof s === 'number' ? [s, 2] : [s, 4]))) {
    const chordIndex = Math.min(progression.length - 1, Math.floor(step / block));
    const degree = progression[chordIndex] + pick(rand, [0, 2, 4, 7, 9]);
    let pitch = scaleMidi(keyRoot, scale, octave, degree);
    if (prev != null && Math.abs(pitch - prev) > 9) pitch = prev + (pitch > prev ? 3 : -3);
    notes.push(note(step, pitch, dur, 0.62 + rand() * 0.28));
    prev = pitch;
  }
  return notes;
}

function chordNotes({ progression, keyRoot, scale, octave, step, len, vel = 0.6, seventh = false }) {
  const out = [];
  for (const deg of progression) {
    const base = chordSizeOf(deg, seventh);
    for (const interval of base) {
      out.push(note(step, scaleMidi(keyRoot, scale, octave, deg + interval), len, vel));
    }
    step += 8;
  }
  return out;
}

function chordSizeOf(degree, seventh) {
  return seventh ? [0, 2, 4, 6] : [0, 2, 4];
}

function arpNotes({ rand, progression, keyRoot, scale, octave, every = 2, len = 2, vel = 0.5 }) {
  const notes = [];
  const tones = [0, 2, 4, 7, 4, 2];
  let i = 0;
  for (let step = 0; step < 32; step += every) {
    const chordIndex = Math.min(progression.length - 1, Math.floor(step / 8));
    const degree = progression[chordIndex] + tones[i % tones.length];
    notes.push(note(step, scaleMidi(keyRoot, scale, octave, degree), len, vel + rand() * 0.15));
    i++;
  }
  return notes;
}

function addVariation(pattern, rand, density = 0.06) {
  const next = pattern.map((s) => ({ ...s }));
  for (let i = 0; i < next.length; i++) {
    if (i % 4 === 3 && chance(rand, density)) {
      next[i] = { on: true, vel: 0.3 + rand() * 0.25, prob: 0.8, pitch: 0 };
    }
  }
  return next;
}

function addFill(pattern, rand) {
  const next = pattern.map((s) => ({ ...s }));
  const end = next.length - 1;
  for (let i = 0; i < 4; i++) {
    const idx = end - i;
    next[idx] = { on: true, vel: 0.4 + i * 0.15, prob: 0.9, pitch: i };
  }
  return next;
}

const SECTION_SETS = {
  'Melodic House': ['Intro', 'Groove', 'Breakdown', 'Drop'],
  Techno: ['Intro', 'Peak Time', 'Break', 'Peak Time'],
  'Lo-Fi Hip Hop': ['Intro', 'Verse', 'Turnaround', 'Verse'],
  Trap: ['Intro', 'Hook', 'Verse', 'Hook'],
  Drill: ['Intro', 'Hook', 'Verse', 'Hook'],
  'Drum & Bass': ['Intro', 'Roller', 'Liquid Break', 'Roller'],
  Synthwave: ['Intro', 'Cruise', 'Bridge', 'Outro'],
  Ambient: ['Drift', 'Expansion', 'Return'],
  Pop: ['Verse', 'Pre', 'Chorus', 'Bridge'],
  Afrobeat: ['Intro', 'Groove', 'Break', 'Groove'],
  Funk: ['Intro', 'Head', 'Solo', 'Head'],
  Cinematic: ['Opening', 'Build', 'Climax', 'Resolution'],
};

export function composeIdea({
  prompt = '',
  genre: forcedGenre,
  bpm: forcedBpm,
  keyRoot: forcedRoot,
  scale: forcedScale,
  title: forcedTitle,
  seed,
} = {}) {
  const baseSeed = seed || hashString(`${prompt}|${forcedGenre || ''}|${forcedBpm || ''}|${forcedRoot ?? ''}`);
  const rand = mulberry32(baseSeed);
  const detected = detectGenre(prompt);
  const genre = forcedGenre || detected || pick(rand, ['Melodic House', 'Lo-Fi Hip Hop', 'Trap', 'Techno', 'Synthwave', 'Drum & Bass']);
  const keyInfo = detectKey(prompt) || {};
  const keyRoot = forcedRoot ?? keyInfo.keyRoot ?? Math.floor(rand() * 12);
  const scale = forcedScale || keyInfo.scale || SCALE_BY_GENRE[genre] || 'minor';
  const bpm = forcedBpm || detectTempo(prompt) || BPM_BY_GENRE[genre] || 120;
  const progression = chordProgression(genre, rand);
  const drums = drumKitFor(genre, rand);
  const arr = [0, 0, 1, 0];
  const specs = [];

  // --- Drums ---
  const palette = ['rose', 'amber', 'acid', 'orange', 'emerald', 'cyan', 'slate', 'fuchsia'];
  let colorIdx = 0;
  for (const [inst, pattern] of Object.entries(drums)) {
    const meta = INSTRUMENTS[inst];
    if (!meta) continue;
    specs.push(
      track({
        instrument: inst,
        name: meta.defaultName,
        color: palette[colorIdx++ % palette.length],
        patterns: {
          A: pattern,
          B: addVariation(pattern, rand, inst === 'kick' ? 0.02 : 0.09),
          C: inst === 'kick' || inst === 'snare' ? addFill(pattern, rand) : addVariation(pattern, rand, 0.03),
          D: pattern,
        },
      })
    );
  }

  // --- Bass ---
  const rhythm = bassRhythm(genre);
  const bassNotesA = [];
  const bassNotesB = [];
  const block = 8;
  const bassStepList = rhythm.steps.map((s) => (typeof s === 'number' ? [s, rhythm.len] : s));
  for (const [step, dur] of bassStepList) {
    const chordIndex = Math.min(progression.length - 1, Math.floor(step / block));
    const deg = progression[chordIndex];
    const octave = genre === 'Drum & Bass' || genre === 'Trap' || genre === 'Drill' ? 2 : 2;
    let pitch = scaleMidi(keyRoot, scale, octave, deg);
    if (rhythm.octaveJump && chance(rand, 0.4)) pitch += 12;
    if (rhythm.slide && step === 26) pitch += chance(rand, 0.5) ? 3 : -2;
    bassNotesA.push(note(step, pitch, Math.min(dur, 8), rhythm.vel));
    if (chance(rand, 0.25)) {
      bassNotesB.push(note(step, pitch + 12, Math.min(dur, 4), rhythm.vel * 0.8));
    } else {
      bassNotesB.push(note(step, pitch, Math.min(dur, 6), rhythm.vel));
    }
  }
  const bassInst = genre === 'Trap' || genre === 'Drill' || genre === 'Drum & Bass' ? 'bass' : 'bass';
  specs.push(
    track({
      instrument: bassInst,
      name: genre === 'Afrobeat' ? 'Log Bass' : 'Bass',
      color: 'violet',
      notes: { A: bassNotesA, B: bassNotesB, C: bassNotesA, D: bassNotesB },
      synth: genre === 'Trap' || genre === 'Drill' ? { ...SYNTH_DEFAULTS.bass, wave: 'sine', sub: 0.9, cutoff: 0.24, decay: 0.4, sustain: 0.7, envAmount: 0.35 } : { ...SYNTH_DEFAULTS.bass },
    })
  );

  // --- Chords / keys / pad ---
  const seventh = genre === 'Lo-Fi Hip Hop' || genre === 'Funk' || genre === 'Melodic House';
  if (['Lo-Fi Hip Hop', 'Pop', 'Afrobeat', 'Funk', 'Melodic House', 'Cinematic', 'Synthwave'].includes(genre)) {
    specs.push(
      track({
        instrument: genre === 'Lo-Fi Hip Hop' || genre === 'Funk' ? 'keys' : 'pad',
        name: genre === 'Lo-Fi Hip Hop' ? 'Dusty Keys' : genre === 'Funk' ? 'Clav Stabs' : 'Chord Bed',
        color: genre === 'Lo-Fi Hip Hop' ? 'amber' : 'cyan',
        notes: {
          A: chordNotes({ progression, keyRoot, scale, octave: 4, step: 0, len: genre === 'Funk' ? 3 : 7, vel: 0.55, seventh }),
          B: chordNotes({ progression, keyRoot, scale, octave: 4, step: 0, len: genre === 'Funk' ? 3 : 7, vel: 0.5, seventh }),
          C: chordNotes({ progression, keyRoot, scale, octave: 4, step: 0, len: 15, vel: 0.45, seventh }),
          D: chordNotes({ progression, keyRoot, scale, octave: 4, step: 0, len: 7, vel: 0.55, seventh }),
        },
      })
    );
  } else {
    const longChords = chordNotes({ progression, keyRoot, scale, octave: 4, step: 0, len: 15, vel: 0.45 });
    specs.push(
      track({
        instrument: 'pad',
        name: 'Atmosphere',
        color: 'cyan',
        notes: { A: longChords, B: longChords, C: longChords, D: longChords },
      })
    );
  }

  // --- Lead / melody ---
  if (!['Ambient', 'Cinematic'].includes(genre) || chance(rand, 0.5)) {
    const rhythmA = leadRhythm(genre, rand);
    const rhythmB = leadRhythm(genre, rand);
    const octave = genre === 'Trap' || genre === 'Drill' ? 6 : 5;
    const leadInstrument = genre === 'Trap' || genre === 'Drill' ? 'lead' : genre === 'Melodic House' ? 'pluck' : 'lead';
    specs.push(
      track({
        instrument: leadInstrument,
        name: genre === 'Trap' || genre === 'Drill' ? 'Bell Melody' : genre === 'Melodic House' ? 'Arp' : 'Lead',
        color: genre === 'Melodic House' ? 'emerald' : 'fuchsia',
        notes: {
          A: melodyFromChords({ rand, progression, keyRoot, scale, rhythm: rhythmA, octave }),
          B: melodyFromChords({ rand, progression, keyRoot, scale, rhythm: rhythmB, octave }),
          C: melodyFromChords({ rand, progression, keyRoot, scale, rhythm: rhythmA, octave: octave + 1 }).slice(0, 4),
          D: melodyFromChords({ rand, progression, keyRoot, scale, rhythm: rhythmA, octave }),
        },
      })
    );
  }

  // --- Arp layer for electronic genres ---
  if (['Melodic House', 'Techno', 'Synthwave', 'Drum & Bass', 'Ambient'].includes(genre)) {
    const every = genre === 'Techno' ? 2 : genre === 'Ambient' ? 8 : 2;
    specs.push(
      track({
        instrument: 'pluck',
        name: genre === 'Synthwave' ? 'Octave Arp' : 'Sparkle Arp',
        color: 'emerald',
        notes: {
          A: arpNotes({ rand, progression, keyRoot, scale, octave: genre === 'Ambient' ? 5 : 5, every, len: every, vel: 0.36 }),
          B: arpNotes({ rand, progression, keyRoot, scale, octave: 6, every, len: every, vel: 0.3 }),
          C: arpNotes({ rand, progression, keyRoot, scale, octave: 5, every: 8, len: 8, vel: 0.25 }),
          D: arpNotes({ rand, progression, keyRoot, scale, octave: 5, every, len: every, vel: 0.36 }),
        },
      })
    );
  }

  // --- Sub anchor for bass-heavy genres ---
  if (['Trap', 'Drill', 'Drum & Bass', 'Techno'].includes(genre)) {
    const subNotes = [];
    for (const [step, dur] of bassStepList) {
      const chordIndex = Math.min(progression.length - 1, Math.floor(step / block));
      const pitch = scaleMidi(keyRoot, scale, 1, progression[chordIndex]);
      subNotes.push(note(step, pitch + 12, Math.min(dur, 10), 0.6));
    }
    specs.push(
      track({
        instrument: 'sub',
        name: 'Sub Anchor',
        color: 'sky',
        notes: { A: subNotes, B: subNotes, C: subNotes.slice(0, 2), D: subNotes },
        volume: 0.5,
      })
    );
  }

  const sections = SECTION_SETS[genre] || ['Intro', 'Groove', 'Break', 'Drop'];
  const title = forcedTitle || `${pick(rand, TITLE_ADJ)} ${pick(rand, TITLE_NOUN)}`;
  const keyLabel = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][keyRoot];
  const description = `A ${genre.toLowerCase()} sketch in ${keyLabel} ${scale} at ${bpm} BPM — ${GENRE_DESCRIPTIONS[genre] || 'a fresh idea'}.`;

  return {
    title,
    genre,
    bpm,
    keyRoot,
    scale,
    description,
    sections,
    arrangement: [
      { bank: 'A', repeats: 2 },
      { bank: 'B', repeats: 2 },
      { bank: 'A', repeats: 2 },
      { bank: 'C', repeats: 1 },
      { bank: 'D', repeats: 2 },
    ],
    tracks: specs,
    engine: 'local',
  };
}

/* ------------------------------------------------------------------ *
 *  Starter material
 * ------------------------------------------------------------------ */

export function starterTracks() {
  return [
    track({ instrument: 'kick', name: 'Kick', color: 'rose', patterns: { A: steps([[0, 1], [4, 0.9], [8, 1], [12, 0.9], [16, 1], [20, 0.9], [24, 1], [28, 0.9]]) } }),
    track({ instrument: 'snare', name: 'Snare', color: 'amber', patterns: { A: steps([[4, 0.85], [12, 0.82], [20, 0.85], [28, 0.82]]) } }),
    track({
      instrument: 'hat',
      name: 'Hats',
      color: 'acid',
      patterns: { A: steps([[2, 0.4], [6, 0.46], [10, 0.4], [14, 0.46], [18, 0.4], [22, 0.46], [26, 0.4], [30, 0.46]]) },
    }),
    track({ instrument: 'clap', name: 'Clap', color: 'orange', patterns: { A: steps([[12, 0.6], [28, 0.6]]) } }),
    track({
      instrument: 'bass',
      name: 'Bass',
      color: 'violet',
      notes: { A: [note(0, 36, 4, 0.85), note(8, 36, 4, 0.8), note(16, 41, 4, 0.82), note(24, 36, 6, 0.8)] },
    }),
    track({
      instrument: 'pad',
      name: 'Pad',
      color: 'cyan',
      notes: { A: [note(0, 60, 15, 0.42), note(0, 63, 15, 0.4), note(0, 67, 15, 0.4), note(16, 58, 15, 0.4), note(16, 62, 15, 0.38), note(16, 65, 15, 0.38)] },
    }),
  ];
}

export function normalizeIdeaPayload(payload) {
  const out = {
    title: String(payload.title || 'Untitled Idea').slice(0, 80),
    genre: String(payload.genre || 'Electronic').slice(0, 60),
    bpm: clampInt(payload.bpm, 50, 220, 120),
    keyRoot: clampInt(payload.keyRoot, 0, 11, 0),
    scale: SCALES[payload.scale] ? payload.scale : 'minor',
    description: String(payload.description || '').slice(0, 400),
    sections: Array.isArray(payload.sections) ? payload.sections.slice(0, 8).map(String) : [],
    arrangement: Array.isArray(payload.arrangement)
      ? payload.arrangement
          .filter((a) => a && ['A', 'B', 'C', 'D'].includes(a.bank))
          .map((a) => ({ bank: a.bank, repeats: clampInt(a.repeats, 1, 8, 1) }))
      : [],
    tracks: [],
    engine: payload.engine || 'local',
  };
  const seen = new Set();
  const tracks = Array.isArray(payload.tracks) ? payload.tracks.slice(0, 16) : [];
  for (const t of tracks) {
    const inst = INSTRUMENTS[t.instrument] ? t.instrument : 'lead';
    const meta = INSTRUMENTS[inst];
    let name = String(t.name || meta.defaultName).slice(0, 40);
    while (seen.has(name)) name = `${name} 2`;
    seen.add(name);
    const synth = {};
    const defaults = SYNTH_DEFAULTS[inst] || DRUM_DEFAULTS[inst] || {};
    for (const k of Object.keys(defaults)) {
      if (t.synth && typeof t.synth[k] === 'number') synth[k] = t.synth[k];
    }
    const patterns = {};
    const notes = {};
    for (const bank of ['A', 'B', 'C', 'D']) {
      const rawPattern = t.patterns?.[bank];
      if (Array.isArray(rawPattern)) {
        const arr = makeBlankSteps(32);
        rawPattern.forEach((s, i) => {
          if (i > 31) return;
          if (typeof s === 'boolean') arr[i].on = s;
          else if (typeof s === 'number') arr[i] = { on: true, vel: Math.min(1, Math.max(0.05, s / 127 || s / 100)), prob: 1, pitch: 0 };
          else if (s && typeof s === 'object') {
            arr[i] = { on: !!s.on, vel: clampNum(s.vel, 0.05, 1, 0.8), prob: clampNum(s.prob, 0, 1, 1), pitch: clampInt(s.pitch, -12, 12, 0) };
          }
        });
        patterns[bank] = arr;
      }
      const rawNotes = t.notes?.[bank];
      if (Array.isArray(rawNotes)) {
        notes[bank] = rawNotes
          .slice(0, 200)
          .filter((n) => n && typeof n.step === 'number')
          .map((n) => ({
            step: clampInt(n.step, 0, 31, 0),
            pitch: clampInt(n.pitch, 12, 108, 60),
            len: clampInt(n.len, 1, 32, 2),
            vel: clampNum(n.vel, 0.05, 1, 0.8),
          }));
      }
    }
    out.tracks.push({
      name,
      kind: meta.kind,
      instrument: inst,
      color: COLORS[t.color] ? t.color : meta.color,
      volume: clampNum(t.volume, 0, 1.5, 0.8),
      pan: clampNum(t.pan, -1, 1, 0),
      drive: clampNum(t.drive, 0, 1, 0.05),
      filterCutoff: clampNum(t.filterCutoff, 0.05, 1, 0.9),
      reverbSend: clampNum(t.reverbSend, 0, 1, 0.15),
      delaySend: clampNum(t.delaySend, 0, 1, 0.05),
      synth,
      patterns,
      notes,
    });
  }
  return out;
}

function clampInt(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
function clampNum(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function composerNoteSummary() {
  return {
    tempo: BPM_BY_GENRE,
    scales: SCALE_BY_GENRE,
  };
}
