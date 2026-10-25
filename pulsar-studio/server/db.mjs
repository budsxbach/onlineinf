import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { composeIdea } from './compose.mjs';
import { COLORS, DRUM_DEFAULTS, INSTRUMENTS, SYNTH_DEFAULTS } from './music.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.PULSAR_DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'pulsar.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const nowIso = () => new Date().toISOString();
export const newId = (prefix = 'id') => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT 'Electronic',
  bpm INTEGER NOT NULL DEFAULT 120,
  key_root INTEGER NOT NULL DEFAULT 0,
  scale TEXT NOT NULL DEFAULT 'minor',
  description TEXT NOT NULL DEFAULT '',
  sections TEXT NOT NULL DEFAULT '[]',
  arrangement TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'demo',
  favorite INTEGER NOT NULL DEFAULT 0,
  cover TEXT NOT NULL DEFAULT '{}',
  swing INTEGER NOT NULL DEFAULT 0,
  master_gain REAL NOT NULL DEFAULT 0.85,
  ai_notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'drum',
  instrument TEXT NOT NULL DEFAULT 'kick',
  color TEXT NOT NULL DEFAULT 'acid',
  position INTEGER NOT NULL DEFAULT 0,
  volume REAL NOT NULL DEFAULT 0.8,
  pan REAL NOT NULL DEFAULT 0,
  mute INTEGER NOT NULL DEFAULT 0,
  solo INTEGER NOT NULL DEFAULT 0,
  drive REAL NOT NULL DEFAULT 0.05,
  filter_cutoff REAL NOT NULL DEFAULT 0.9,
  reverb_send REAL NOT NULL DEFAULT 0.1,
  delay_send REAL NOT NULL DEFAULT 0.05,
  patterns TEXT NOT NULL DEFAULT '{}',
  notes TEXT NOT NULL DEFAULT '{}',
  synth TEXT NOT NULL DEFAULT '{}',
  sample_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tracks_project ON tracks(project_id, position);

CREATE TABLE IF NOT EXISTS samples (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Loop',
  instrument TEXT NOT NULL DEFAULT 'sample',
  bpm INTEGER,
  key_root INTEGER,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'teal',
  duration REAL NOT NULL DEFAULT 2,
  source TEXT NOT NULL DEFAULT 'generated',
  favorite INTEGER NOT NULL DEFAULT 0,
  plays INTEGER NOT NULL DEFAULT 0,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  instrument TEXT NOT NULL DEFAULT 'lead',
  category TEXT NOT NULL DEFAULT 'Lead',
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'fuchsia',
  params TEXT NOT NULL DEFAULT '{}',
  favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  title TEXT,
  genre TEXT,
  bpm INTEGER,
  key_root INTEGER,
  scale TEXT,
  status TEXT NOT NULL DEFAULT 'ready',
  engine TEXT NOT NULL DEFAULT 'local',
  model TEXT,
  summary TEXT,
  payload TEXT,
  error TEXT,
  project_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at DESC);
`);

export function getSetting(key, fallback = null) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
}

export function setSetting(key, value) {
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(key, JSON.stringify(value), nowIso());
}

export function getSettingsObject() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const out = {};
  for (const r of rows) {
    try {
      out[r.key] = JSON.parse(r.value);
    } catch {
      out[r.key] = r.value;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 *  Seeding
 * ------------------------------------------------------------------ */

const SEED_PROJECTS = [
  {
    title: 'Midnight Transit',
    prompt: 'melodic house for an after hours drive, wide pads, hypnotic arp, 124 bpm in F minor',
    genre: 'Melodic House',
    bpm: 124,
    keyRoot: 5,
    scale: 'minor',
    status: 'mixdown',
    favorite: 1,
    swing: 0,
    daysAgo: 1,
  },
  {
    title: 'Velvet Static',
    prompt: 'dusty lo-fi hip hop with warm keys, swung drums and vinyl noise in Eb dorian',
    genre: 'Lo-Fi Hip Hop',
    bpm: 84,
    keyRoot: 3,
    scale: 'dorian',
    status: 'demo',
    favorite: 1,
    swing: 26,
    daysAgo: 3,
  },
  {
    title: 'Chrome Bloom',
    prompt: 'retro synthwave cruiser with gated drums and octave bass at 110',
    genre: 'Synthwave',
    bpm: 110,
    keyRoot: 7,
    scale: 'minor',
    status: 'mixdown',
    favorite: 0,
    swing: 0,
    daysAgo: 5,
  },
  {
    title: 'Ritual',
    prompt: 'peak time warehouse techno, rolling bass, tense filter sweep, 134 bpm',
    genre: 'Techno',
    bpm: 134,
    keyRoot: 2,
    scale: 'phrygian',
    status: 'master',
    favorite: 0,
    swing: 0,
    daysAgo: 7,
  },
  {
    title: 'Ember Drift',
    prompt: 'dark trap banger with booming 808s and hi hat rolls in G# minor',
    genre: 'Trap',
    bpm: 142,
    keyRoot: 8,
    scale: 'minor',
    status: 'demo',
    favorite: 0,
    swing: 0,
    daysAgo: 9,
  },
  {
    title: 'Aphelion',
    prompt: 'liquid drum and bass roller, chopped breakbeat, deep sub, shimmering pads',
    genre: 'Drum & Bass',
    bpm: 174,
    keyRoot: 4,
    scale: 'minor',
    status: 'sketch',
    favorite: 1,
    swing: 4,
    daysAgo: 11,
  },
  {
    title: 'Golden Hour',
    prompt: 'sun soaked afrobeat groove with log drum percussion and warm keys',
    genre: 'Afrobeat',
    bpm: 108,
    keyRoot: 0,
    scale: 'pentatonicMajor',
    status: 'demo',
    favorite: 0,
    swing: 12,
    daysAgo: 14,
  },
  {
    title: 'Glass Horizon',
    prompt: 'ambient drift with long harmonic pads, sparse pulses, slow evolution',
    genre: 'Ambient',
    bpm: 72,
    keyRoot: 9,
    scale: 'major',
    status: 'sketch',
    favorite: 0,
    swing: 0,
    daysAgo: 18,
  },
  {
    title: 'Hardware Dreams',
    prompt: 'tight funk workout with syncopated drums, popping bass and clav stabs',
    genre: 'Funk',
    bpm: 112,
    keyRoot: 10,
    scale: 'mixolydian',
    status: 'demo',
    favorite: 0,
    swing: 8,
    daysAgo: 21,
  },
  {
    title: 'Paper Skyline',
    prompt: 'bright modern pop sketch, clean beat, chord stacks, hook first topline',
    genre: 'Pop',
    bpm: 104,
    keyRoot: 6,
    scale: 'major',
    status: 'sketch',
    favorite: 0,
    swing: 0,
    daysAgo: 26,
  },
];

const COVER_THEMES = ['nebula', 'sunset', 'monolith', 'glass', 'ember', 'tidal'];

function isoDaysAgo(days, hour = 15, minute = 24) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function insertProject(payload, extra) {
  const id = newId('prj');
  const created = extra.created_at || nowIso();
  db.prepare(
    `INSERT INTO projects (id, title, genre, bpm, key_root, scale, description, sections, arrangement, status, favorite, cover, swing, master_gain, ai_notes, created_at, updated_at)
     VALUES (@id, @title, @genre, @bpm, @key_root, @scale, @description, @sections, @arrangement, @status, @favorite, @cover, @swing, @master_gain, @ai_notes, @created_at, @updated_at)`
  ).run({
    id,
    title: payload.title,
    genre: payload.genre,
    bpm: payload.bpm,
    key_root: payload.keyRoot,
    scale: payload.scale,
    description: payload.description || '',
    sections: JSON.stringify(payload.sections || []),
    arrangement: JSON.stringify(payload.arrangement || []),
    status: extra.status || 'demo',
    favorite: extra.favorite ? 1 : 0,
    cover: JSON.stringify({ theme: extra.theme || 'nebula', hue: extra.hue ?? 0 }),
    swing: extra.swing ?? 0,
    master_gain: 0.85,
    ai_notes: extra.ai_notes || '',
    created_at: created,
    updated_at: extra.updated_at || created,
  });
  const insertTrack = db.prepare(
    `INSERT INTO tracks (id, project_id, name, kind, instrument, color, position, volume, pan, mute, solo, drive, filter_cutoff, reverb_send, delay_send, patterns, notes, synth, sample_id, created_at, updated_at)
     VALUES (@id, @project_id, @name, @kind, @instrument, @color, @position, @volume, @pan, @mute, @solo, @drive, @filter_cutoff, @reverb_send, @delay_send, @patterns, @notes, @synth, @sample_id, @created_at, @updated_at)`
  );
  payload.tracks.forEach((t, i) => {
    insertTrack.run({
      id: newId('trk'),
      project_id: id,
      name: t.name,
      kind: t.kind,
      instrument: t.instrument,
      color: t.color,
      position: i,
      volume: t.volume,
      pan: t.pan,
      mute: t.mute ? 1 : 0,
      solo: 0,
      drive: t.drive,
      filter_cutoff: t.filterCutoff,
      reverb_send: t.reverbSend,
      delay_send: t.delaySend,
      patterns: JSON.stringify(t.patterns || {}),
      notes: JSON.stringify(t.notes || {}),
      synth: JSON.stringify(t.synth || {}),
      sample_id: t.sampleId || null,
      created_at: created,
      updated_at: created,
    });
  });
  return id;
}

const SEED_SAMPLES = [
  ['Neon Kick 01', 'Drums', 'kick', 0, null, 'Saturated 808-style kick with a short punchy tail.', 'rose', 0.6, 1, ['kick', '808', 'punchy']],
  ['Tape Snare 92', 'Drums', 'snare', 0, null, 'Tape-saturated snare with a soft room tail.', 'amber', 0.5, 0, ['snare', 'tape', 'lofi']],
  ['Clap Stack Wide', 'Drums', 'clap', 0, null, 'Wide 4-layer clap stack for big choruses.', 'orange', 0.7, 1, ['clap', 'wide', 'stack']],
  ['Hi-Hat Roll 16', 'Drums', 'hat', 0, null, 'Tight closed hat with a 16th roll baked in.', 'acid', 0.4, 0, ['hat', 'roll', 'tight']],
  ['Rim Ghost', 'Drums', 'rim', 0, null, 'Dry rimshot for ghost notes and textures.', 'cyan', 0.3, 0, ['rim', 'ghost', 'dry']],
  ['Dusty Break 84', 'Loops', 'sample', 84, null, '2-bar vinyl-crushed break at 84 BPM.', 'teal', 5.7, 0, ['break', 'lofi', '84']],
  ['Warehouse Loop 132', 'Loops', 'sample', 132, null, 'Relentless 2-bar techno percussion loop.', 'slate', 3.6, 0, ['techno', 'loop', '132']],
  ['Sub Drop F', 'Bass', 'sub', 0, 5, 'Deep sub drop tuned to F, one shot.', 'sky', 1.8, 0, ['sub', 'drop', 'fx']],
  ['Rubber Bass C', 'Bass', 'bass', 0, 0, 'Elastic mono bass note at C2 for resampling.', 'violet', 1.2, 0, ['bass', 'mono', 'resample']],
  ['Saw Chord Stack', 'Synth', 'pad', 0, 3, 'Wide detuned saw chord in Eb minor.', 'fuchsia', 3.9, 1, ['saw', 'chord', 'stack']],
  ['Glass Pluck Cm', 'Synth', 'pluck', 0, 0, 'Crystalline pluck in C minor, perfect for arps.', 'emerald', 1.1, 0, ['pluck', 'glass', 'arp']],
  ['Velvet Keys Em', 'Synth', 'keys', 0, 4, 'Warm electric piano chord in E minor.', 'amber', 2.4, 0, ['keys', 'warm', 'chord']],
  ['Vocal Chop Air', 'Vocals', 'sample', 120, 9, 'Breathy vowel chop, formant shifted up.', 'rose', 0.9, 0, ['vocal', 'chop', 'texture']],
  ['Riser 8 Bars', 'FX', 'sample', 128, null, 'Noise riser that builds over 8 bars.', 'orange', 15, 0, ['riser', 'build', 'tension']],
  ['Vinyl Crackle Bed', 'FX', 'sample', 0, null, 'Endless vinyl crackle and room tone.', 'slate', 30, 1, ['vinyl', 'crackle', 'noise']],
  ['Impacts Deep', 'FX', 'sample', 0, null, 'Cinematic impact with a long sub tail.', 'red', 4.2, 0, ['impact', 'cinematic', 'sub']],
];

const SEED_PRESETS = [
  ['Deep Sub', 'sub', 'Bass', 'Round sine sub with a whisper of movement.', 'sky', { ...SYNTH_DEFAULTS.sub, cutoff: 0.18, sustain: 0.9, release: 0.4 }],
  ['Acid Squelch', 'bass', 'Bass', 'Resonant filter sweep that bites.', 'acid', { ...SYNTH_DEFAULTS.bass, wave: 'sawtooth', cutoff: 0.2, resonance: 0.72, envAmount: 0.85, decay: 0.16, sustain: 0.1 }],
  ['808 Slide', 'bass', 'Bass', 'Long-tail 808 built for slides and glides.', 'violet', { ...SYNTH_DEFAULTS.bass, wave: 'sine', sub: 0.95, cutoff: 0.22, decay: 0.5, sustain: 0.8, release: 0.5, glide: 0.18 }],
  ['Warm Analog Pad', 'pad', 'Pad', 'Slow, detuned saw pad with a wide stereo field.', 'cyan', { ...SYNTH_DEFAULTS.pad }],
  ['Air Choir', 'pad', 'Pad', 'Breathy upper-register pad for breakdowns.', 'emerald', { ...SYNTH_DEFAULTS.pad, cutoff: 0.6, attack: 1.6, release: 2.4, detune: 0.3 }],
  ['Dust Pad', 'pad', 'Pad', 'Dark, filtered pad with a worn edge.', 'slate', { ...SYNTH_DEFAULTS.pad, cutoff: 0.3, attack: 1.2, resonance: 0.2 }],
  ['Glass Pluck', 'pluck', 'Pluck', 'Short crystalline pluck for arpeggios.', 'emerald', { ...SYNTH_DEFAULTS.pluck, wave: 'triangle', cutoff: 0.62, decay: 0.12, envAmount: 0.75 }],
  ['Pixel Square', 'lead', 'Lead', '8-bit square lead with a fast envelope.', 'fuchsia', { ...SYNTH_DEFAULTS.lead, wave: 'square', cutoff: 0.5, resonance: 0.3, sustain: 0.3 }],
  ['Laser Lead', 'lead', 'Lead', 'Bright saw lead that cuts through a dense mix.', 'rose', { ...SYNTH_DEFAULTS.lead, cutoff: 0.75, resonance: 0.35, envAmount: 0.6 }],
  ['Velvet Keys', 'keys', 'Keys', 'Soft electric piano with a long release.', 'amber', { ...SYNTH_DEFAULTS.keys }],
  ['Vinyl Wurli', 'keys', 'Keys', 'Detuned keys with a tape-worn sustain.', 'orange', { ...SYNTH_DEFAULTS.keys, detune: 0.12, cutoff: 0.34, sustain: 0.22, release: 0.8 }],
  ['Rubber Bass', 'bass', 'Bass', 'Bouncy triangle bass for funk lines.', 'teal', { ...SYNTH_DEFAULTS.bass, wave: 'triangle', cutoff: 0.36, resonance: 0.3, decay: 0.18, sustain: 0.35 }],
];

const SEED_IDEAS = [
  {
    prompt: 'A slow-burning dub techno roller in D minor around 122 BPM with cavernous chords.',
    title: 'Dub Chamber',
    genre: 'Techno',
    bpm: 122,
    keyRoot: 2,
    scale: 'minor',
    status: 'ready',
    engine: 'arena',
    model: 'coding-router-preview',
    summary: 'Built 7 tracks: four-on-the-floor, rim ghosts, cavernous dub chords and a low, patient bassline.',
    daysAgo: 2,
    makeProject: true,
  },
  {
    prompt: 'Neo-soul keys loop in Eb major, 78 BPM, slightly off-grid drums, plenty of noise.',
    title: 'Sunday Static',
    genre: 'Lo-Fi Hip Hop',
    bpm: 78,
    keyRoot: 3,
    scale: 'major',
    status: 'saved',
    engine: 'arena',
    model: 'coding-router-preview',
    summary: 'Generated a keys-forward loop with 7th chords and brushed percussion.',
    daysAgo: 4,
    makeProject: false,
  },
  {
    prompt: 'Hyperpop beat at 160 with pitched vocal chops and a distorted kick.',
    title: 'Candy Circuit',
    genre: 'Pop',
    bpm: 160,
    keyRoot: 11,
    scale: 'major',
    status: 'ready',
    engine: 'local',
    model: null,
    summary: 'Local composer built a clipped 160 BPM pop beat with pitchy leads.',
    daysAgo: 6,
    makeProject: true,
  },
  {
    prompt: 'Cinematic trailer cue in C minor, 90 seconds, big percussion and string swells.',
    title: 'Monolith Theme',
    genre: 'Cinematic',
    bpm: 82,
    keyRoot: 0,
    scale: 'minor',
    status: 'saved',
    engine: 'arena',
    model: 'coding-router-preview',
    summary: 'Drafted an orchestral bed with string pads, taiko-style toms and a rising sub.',
    daysAgo: 9,
    makeProject: false,
  },
  {
    prompt: 'Jungle break with chopped amen samples and heavy sub.',
    title: 'Amen Pressure',
    genre: 'Drum & Bass',
    bpm: 172,
    keyRoot: 7,
    scale: 'minor',
    status: 'failed',
    engine: 'arena',
    model: 'coding-router-preview',
    summary: '',
    error: 'Upstream request timed out. Add an Arena API key in Settings, then retry — local composer is always available.',
    daysAgo: 12,
    makeProject: false,
  },
  {
    prompt: 'Minimal ambient sketch for a short film, mostly pad and piano.',
    title: 'Quiet Frames',
    genre: 'Ambient',
    bpm: 68,
    keyRoot: 5,
    scale: 'major',
    status: 'saved',
    engine: 'local',
    model: null,
    summary: 'Sparse piano motif over a 32-bar drone.',
    daysAgo: 16,
    makeProject: false,
  },
];

export function seedDatabase() {
  const projectCount = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c;
  const seed = db.transaction(() => {
    if (projectCount === 0) {
      SEED_PROJECTS.forEach((p, idx) => {
        const composed = composeIdea({
          prompt: p.prompt,
          genre: p.genre,
          bpm: p.bpm,
          keyRoot: p.keyRoot,
          scale: p.scale,
          title: p.title,
          seed: `seed-${idx}-${p.title}`,
        });
        const created = isoDaysAgo(p.daysAgo, 9 + (idx % 9), 12 + ((idx * 7) % 40));
        insertProject(composed, {
          status: p.status,
          favorite: p.favorite,
          swing: p.swing,
          theme: COVER_THEMES[idx % COVER_THEMES.length],
          hue: (idx * 47) % 360,
          created_at: created,
          updated_at: isoDaysAgo(Math.max(0, p.daysAgo - 1), 18, 5 + idx),
          ai_notes: `Composed from: “${p.prompt}”`,
        });
      });
    }

    const sampleCount = db.prepare('SELECT COUNT(*) AS c FROM samples').get().c;
    if (sampleCount === 0) {
      const stmt = db.prepare(
        `INSERT INTO samples (id, name, category, instrument, bpm, key_root, description, color, duration, source, favorite, plays, tags, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      SEED_SAMPLES.forEach((s, i) => {
        const [name, category, instrument, bpm, keyRoot, description, color, duration, fav, tags] = s;
        const created = isoDaysAgo(30 - i, 11, 20);
        stmt.run(
          newId('smp'),
          name,
          category,
          instrument,
          bpm || null,
          keyRoot == null ? null : keyRoot,
          description,
          COLORS[color] ? color : 'teal',
          duration,
          'generated',
          fav,
          Math.floor(20 + ((i * 137) % 900)),
          JSON.stringify(tags),
          created,
          created
        );
      });
    }

    const presetCount = db.prepare('SELECT COUNT(*) AS c FROM presets').get().c;
    if (presetCount === 0) {
      const stmt = db.prepare(
        `INSERT INTO presets (id, name, instrument, category, description, color, params, favorite, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      SEED_PRESETS.forEach(([name, instrument, category, description, color, params], i) => {
        const created = isoDaysAgo(24 - i, 16, 30);
        stmt.run(newId('pst'), name, instrument, category, description, color, JSON.stringify(params), i % 4 === 0 ? 1 : 0, created, created);
      });
    }

    const ideaCount = db.prepare('SELECT COUNT(*) AS c FROM ideas').get().c;
    if (ideaCount === 0) {
      const stmt = db.prepare(
        `INSERT INTO ideas (id, prompt, title, genre, bpm, key_root, scale, status, engine, model, summary, payload, error, project_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      SEED_IDEAS.forEach((idea, i) => {
        const created = isoDaysAgo(idea.daysAgo, 10 + (i % 8), 8 + i * 3);
        let payload = null;
        let projectId = null;
        if (idea.makeProject) {
          const composed = composeIdea({
            prompt: idea.prompt,
            genre: idea.genre,
            bpm: idea.bpm,
            keyRoot: idea.keyRoot,
            scale: idea.scale,
            title: idea.title,
            seed: `idea-${i}-${idea.title}`,
          });
          payload = JSON.stringify(composed);
          projectId = insertProject(composed, {
            status: 'sketch',
            theme: COVER_THEMES[(i + 3) % COVER_THEMES.length],
            hue: (i * 71) % 360,
            created_at: created,
            updated_at: created,
            ai_notes: `Composed from: “${idea.prompt}”`,
          });
        }
        stmt.run(
          newId('idea'),
          idea.prompt,
          idea.title,
          idea.genre,
          idea.bpm,
          idea.keyRoot,
          idea.scale,
          idea.status,
          idea.engine,
          idea.model,
          idea.summary,
          payload,
          idea.error || null,
          projectId,
          created,
          created
        );
      });
    }

    const settingsCount = db.prepare('SELECT COUNT(*) AS c FROM settings').get().c;
    if (settingsCount === 0) {
      setSetting('user.displayName', 'Ari');
      setSetting('user.studioName', 'Pulsar Studio');
      setSetting('user.theme', 'obsidian');
      setSetting('user.defaultBpm', 120);
      setSetting('project.autosave', true);
      setSetting('project.metronome', true);
      setSetting('project.countIn', false);
      setSetting('ai.provider', 'arena');
      setSetting('ai.baseUrl', 'https://api.preview.arena.ai/v1');
      setSetting('ai.model', 'coding-router-preview');
      setSetting('ai.keySet', false);
    }
  });
  seed();
}

/* ------------------------------------------------------------------ *
 *  Query helpers
 * ------------------------------------------------------------------ */

export function computeProjectDuration(bpm, arrangement) {
  let bars = 0;
  for (const s of arrangement || []) bars += 2 * (s.repeats || 1);
  if (!bars) bars = 8;
  const bpmSafe = bpm && bpm > 20 ? bpm : 120;
  return Math.round(((bars * 4 * 60) / bpmSafe) * 10) / 10;
}

export function hydrateProject(row) {
  if (!row) return null;
  return {
    ...row,
    favorite: !!row.favorite,
    sections: safeJson(row.sections, []),
    arrangement: safeJson(row.arrangement, []),
    cover: safeJson(row.cover, {}),
    duration: computeProjectDuration(row.bpm, safeJson(row.arrangement, [])),
  };
}

export function hydrateTrack(row) {
  if (!row) return null;
  const meta = INSTRUMENTS[row.instrument] || {};
  return {
    ...row,
    mute: !!row.mute,
    solo: !!row.solo,
    patterns: safeJson(row.patterns, {}),
    notes: safeJson(row.notes, {}),
    synth: { ...(SYNTH_DEFAULTS[row.instrument] || DRUM_DEFAULTS[row.instrument] || {}), ...safeJson(row.synth, {}) },
    instrumentLabel: meta.label || row.instrument,
    kind: row.kind || meta.kind || 'drum',
  };
}

export function hydrateSample(row) {
  if (!row) return null;
  return { ...row, favorite: !!row.favorite, tags: safeJson(row.tags, []) };
}

export function hydratePreset(row) {
  if (!row) return null;
  return { ...row, favorite: !!row.favorite, params: safeJson(row.params, {}) };
}

export function hydrateIdea(row) {
  if (!row) return null;
  return {
    ...row,
    payload: row.payload ? safeJson(row.payload, null) : null,
  };
}

export function safeJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}
