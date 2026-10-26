import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import QRCode from 'qrcode';
import { fileURLToPath } from 'node:url';
import {
  COLORS,
  COLOR_KEYS,
  DRUM_DEFAULTS,
  DRUM_INSTRUMENTS,
  GENRES,
  INSTRUMENTS,
  KITS,
  NOTE_NAMES,
  SCALES,
  SCALE_LABELS,
  SYNTH_DEFAULTS,
  SYNTH_INSTRUMENTS,
  WAVES,
  defaultParams,
  makeBlankSteps,
} from './music.mjs';
import { AIError, aiConfigFromSettings, generateIdea, testArenaConnection } from './ai.mjs';
import {
  computeProjectDuration,
  db,
  getSetting,
  getSettingsObject,
  hydrateIdea,
  hydratePreset,
  hydrateProject,
  hydrateSample,
  hydrateTrack,
  newId,
  nowIso,
  safeJson,
  seedDatabase,
  setSetting,
} from './db.mjs';
import { normalizeIdeaPayload, starterTracks } from './compose.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';

seedDatabase();
recoverStuckIdeas();

const app = express();
app.use(express.json({ limit: '8mb' }));
app.disable('x-powered-by');

const PROJECT_STATUSES = ['sketch', 'demo', 'mixdown', 'master'];
const TRACK_FIELDS = ['name', 'color', 'volume', 'pan', 'mute', 'solo', 'drive', 'filterCutoff', 'reverbSend', 'delaySend', 'patterns', 'notes', 'synth', 'instrument', 'sampleId'];

/* ------------------------------------------------------------------ *
 *  Small helpers
 * ------------------------------------------------------------------ */

function recoverStuckIdeas() {
  const cutoff = new Date(Date.now() - 90 * 1000).toISOString();
  db.prepare(
    `UPDATE ideas SET status = 'failed', error = ?, updated_at = ? WHERE status = 'generating' AND updated_at < ?`
  ).run('Generation was interrupted. Retry to compose this idea again.', nowIso(), cutoff);
}

class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const bad = (msg, code = 'bad_request') => new HttpError(400, msg, code);
const notFound = (msg = 'Not found') => new HttpError(404, msg, 'not_found');

function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
function clampNum(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function requireString(value, field, { max = 200, min = 1 } = {}) {
  if (typeof value !== 'string') throw bad(`${field} is required`, 'validation');
  const trimmed = value.trim();
  if (trimmed.length < min) throw bad(`${field} must be at least ${min} character(s)`, 'validation');
  if (trimmed.length > max) throw bad(`${field} must be ${max} characters or fewer`, 'validation');
  return trimmed;
}

function validColor(value, fallback) {
  return typeof value === 'string' && COLORS[value] ? value : fallback;
}

function validStatus(value, fallback = 'sketch') {
  return PROJECT_STATUSES.includes(value) ? value : fallback;
}

function parseArrangement(raw, fallback = []) {
  if (!Array.isArray(raw)) return fallback;
  return raw
    .filter((s) => s && ['A', 'B', 'C', 'D'].includes(s.bank))
    .slice(0, 24)
    .map((s) => ({ bank: s.bank, repeats: clampInt(s.repeats, 1, 8, 1) }));
}

/* ------------------------------------------------------------------ *
 *  Tracks
 * ------------------------------------------------------------------ */

const insertTrackStmt = db.prepare(
  `INSERT INTO tracks (id, project_id, name, kind, instrument, color, position, volume, pan, mute, solo, drive, filter_cutoff, reverb_send, delay_send, patterns, notes, synth, sample_id, created_at, updated_at)
   VALUES (@id, @project_id, @name, @kind, @instrument, @color, @position, @volume, @pan, @mute, @solo, @drive, @filter_cutoff, @reverb_send, @delay_send, @patterns, @notes, @synth, @sample_id, @created_at, @updated_at)`
);

function blankBanks() {
  return { A: makeBlankSteps(32), B: makeBlankSteps(32), C: makeBlankSteps(32), D: makeBlankSteps(32) };
}

function createTrack(projectId, input, position) {
  const instrument = INSTRUMENTS[input.instrument] ? input.instrument : 'kick';
  const meta = INSTRUMENTS[instrument];
  const defaults = defaultParams(instrument);
  const ts = nowIso();
  const row = {
    id: newId('trk'),
    project_id: projectId,
    name: String(input.name || meta.defaultName).slice(0, 40),
    kind: meta.kind,
    instrument,
    color: validColor(input.color, meta.color),
    position,
    volume: clampNum(input.volume, 0, 1.5, 0.8),
    pan: clampNum(input.pan, -1, 1, 0),
    mute: input.mute ? 1 : 0,
    solo: input.solo ? 1 : 0,
    drive: clampNum(input.drive, 0, 1, 0.05),
    filter_cutoff: clampNum(input.filterCutoff, 0.05, 1, meta.kind === 'drum' ? 0.92 : 0.8),
    reverb_send: clampNum(input.reverbSend, 0, 1, 0.12),
    delay_send: clampNum(input.delaySend, 0, 1, 0.05),
    patterns: JSON.stringify(input.patterns && typeof input.patterns === 'object' ? input.patterns : blankBanks()),
    notes: JSON.stringify(input.notes && typeof input.notes === 'object' ? input.notes : { A: [], B: [], C: [], D: [] }),
    synth: JSON.stringify({ ...defaults, ...(input.synth && typeof input.synth === 'object' ? input.synth : {}) }),
    sample_id: input.sampleId || null,
    created_at: ts,
    updated_at: ts,
  };
  insertTrackStmt.run(row);
  return hydrateTrack(db.prepare('SELECT * FROM tracks WHERE id = ?').get(row.id));
}

function getProjectRow(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

function getProjectWithTracks(id) {
  const row = getProjectRow(id);
  if (!row) return null;
  const tracks = db.prepare('SELECT * FROM tracks WHERE project_id = ? ORDER BY position ASC, created_at ASC').all(id).map(hydrateTrack);
  return { ...hydrateProject(row), tracks };
}

function touchProject(id) {
  db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(nowIso(), id);
}

/* ------------------------------------------------------------------ *
 *  Meta
 * ------------------------------------------------------------------ */

app.get('/api/meta', (_req, res) => {
  res.json({
    genres: GENRES,
    statuses: PROJECT_STATUSES,
    scales: SCALES,
    scaleLabels: SCALE_LABELS,
    noteNames: NOTE_NAMES,
    colors: COLORS,
    colorKeys: COLOR_KEYS,
    instruments: INSTRUMENTS,
    drumInstruments: DRUM_INSTRUMENTS,
    synthInstruments: SYNTH_INSTRUMENTS,
    kits: KITS,
    waves: WAVES,
    synthDefaults: SYNTH_DEFAULTS,
    drumDefaults: DRUM_DEFAULTS,
  });
});


/* ------------------------------------------------------------------ *
 *  Device links — lets a phone on the same Wi-Fi drive the studio
 * ------------------------------------------------------------------ */

const PRIVATE_RANGES = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
];

export function lanAddresses() {
  const result = [];
  const interfaces = os.networkInterfaces();
  for (const [name, entries] of Object.entries(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family !== 'IPv4' && entry.family !== 4) continue;
      if (entry.internal) continue;
      if (entry.address.startsWith('127.')) continue;
      const isPrivate = PRIVATE_RANGES.some((rx) => rx.test(entry.address));
      result.push({
        name,
        address: entry.address,
        url: `http://${entry.address}:${PORT}`,
        private: isPrivate,
      });
    }
  }
  // Prefer home/office LAN addresses over container bridges.
  result.sort((a, b) => {
    const aWifi = /^(wlan|wl|wlp|enp|eno|eth)/.test(a.name) ? 0 : 1;
    const bWifi = /^(wlan|wl|wlp|enp|eno|eth)/.test(b.name) ? 0 : 1;
    if (aWifi !== bWifi) return aWifi - bWifi;
    return Number(b.private) - Number(a.private);
  });
  return result;
}

function publicOrigin(req) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString().split(',')[0].trim();
  if (!host) return null;
  const bare = host.split(':')[0];
  const isLocal = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'].includes(bare);
  const hasExplicitPort = /:\d+$/.test(host);
  let proto = (forwardedProto || req.protocol || 'http').toString().split(',')[0].trim();
  // Behind a TLS-terminating proxy that does not forward the header: https is the safe guess.
  if (!forwardedProto && !isLocal && !hasExplicitPort) proto = 'https';
  return { origin: `${proto}://${host}`, host: bare, isLocal, proto };
}

async function qrSvg(url) {
  try {
    return await QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#06070a', light: '#ffffff' },
    });
  } catch {
    return null;
  }
}

app.get('/api/link', async (req, res) => {
  const request = publicOrigin(req);
  const lan = lanAddresses();
  const candidates = [];

  if (request && !request.isLocal) {
    candidates.push({ label: 'This address', url: request.origin, kind: 'public' });
  }
  for (const entry of lan) {
    candidates.push({ label: entry.name, url: entry.url, kind: 'lan' });
  }
  const primary = candidates[0]?.url || `http://localhost:${PORT}`;
  const seen = new Set();
  const hosts = candidates.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  res.json({
    port: PORT,
    primary,
    local: `http://localhost:${PORT}`,
    hosts,
    secure: primary.startsWith('https://'),
    qrSvg: await qrSvg(primary),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'pulsar-studio', time: nowIso() });
});

/* ------------------------------------------------------------------ *
 *  Projects
 * ------------------------------------------------------------------ */

app.get('/api/projects', (req, res) => {
  const { query = '', status, genre, favorite, sort = 'updated', limit } = req.query;
  const where = [];
  const params = {};
  if (typeof query === 'string' && query.trim()) {
    where.push('(p.title LIKE @q OR p.genre LIKE @q OR p.description LIKE @q OR p.ai_notes LIKE @q)');
    params.q = `%${query.trim()}%`;
  }
  if (status && PROJECT_STATUSES.includes(status)) {
    where.push('p.status = @status');
    params.status = status;
  }
  if (genre) {
    where.push('p.genre = @genre');
    params.genre = genre;
  }
  if (favorite === 'true' || favorite === '1') where.push('p.favorite = 1');
  const order =
    sort === 'title'
      ? 'p.title COLLATE NOCASE ASC'
      : sort === 'bpm'
      ? 'p.bpm DESC'
      : sort === 'created'
      ? 'p.created_at DESC'
      : 'p.updated_at DESC';
  const limitSql = limit ? `LIMIT ${clampInt(limit, 1, 200, 100)}` : '';
  const rows = db
    .prepare(
      `SELECT p.*, (SELECT COUNT(*) FROM tracks t WHERE t.project_id = p.id) AS track_count
       FROM projects p ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY ${order} ${limitSql}`
    )
    .all(params);
  res.json(rows.map((r) => ({ ...hydrateProject(r), trackCount: r.track_count })));
});

app.get('/api/projects/:id', (req, res, next) => {
  const project = getProjectWithTracks(req.params.id);
  if (!project) return next(notFound('Project not found'));
  res.json({ ...project, trackCount: project.tracks.length });
});

app.post('/api/projects', (req, res, next) => {
  const body = req.body || {};
  const title = requireString(body.title ?? 'Untitled Session', 'Project title', { max: 80 });
  let tracksInput = Array.isArray(body.tracks) ? body.tracks : null;
  let base = null;

  if (body.ideaId) {
    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(body.ideaId);
    if (!idea) return next(notFound('Idea not found'));
    base = idea.payload ? safeJson(idea.payload, null) : null;
  }
  if (!tracksInput && !base) tracksInput = starterTracks();

  const bpm = clampInt(body.bpm ?? base?.bpm, 50, 220, 120);
  const arrangement = parseArrangement(body.arrangement ?? base?.arrangement, [
    { bank: 'A', repeats: 2 },
    { bank: 'B', repeats: 2 },
    { bank: 'D', repeats: 2 },
  ]);
  const id = newId('prj');
  const ts = nowIso();
  const cover = body.cover && typeof body.cover === 'object' ? body.cover : { theme: 'nebula', hue: Math.floor(Math.random() * 360) };

  const createAll = db.transaction(() => {
    db.prepare(
      `INSERT INTO projects (id, title, genre, bpm, key_root, scale, description, sections, arrangement, status, favorite, cover, swing, master_gain, ai_notes, created_at, updated_at)
       VALUES (@id, @title, @genre, @bpm, @key_root, @scale, @description, @sections, @arrangement, @status, @favorite, @cover, @swing, @master_gain, @ai_notes, @created_at, @updated_at)`
    ).run({
      id,
      title,
      genre: String(body.genre ?? base?.genre ?? 'Melodic House').slice(0, 60),
      bpm,
      key_root: clampInt(body.keyRoot ?? body.key_root ?? base?.keyRoot, 0, 11, 0),
      scale: SCALES[body.scale ?? base?.scale] ? body.scale ?? base.scale : 'minor',
      description: String(body.description ?? base?.description ?? '').slice(0, 500),
      sections: JSON.stringify(Array.isArray(body.sections) ? body.sections.slice(0, 8).map(String) : base?.sections || ['Intro', 'Groove', 'Drop']),
      arrangement: JSON.stringify(arrangement),
      status: validStatus(body.status, 'sketch'),
      favorite: body.favorite ? 1 : 0,
      cover: JSON.stringify(cover),
      swing: clampInt(body.swing, 0, 60, 0),
      master_gain: clampNum(body.masterGain ?? body.master_gain, 0, 1.5, 0.85),
      ai_notes: String(body.aiNotes ?? body.ai_notes ?? '').slice(0, 600),
      created_at: ts,
      updated_at: ts,
    });
    const source = tracksInput || base?.tracks || [];
    source.slice(0, 16).forEach((t, i) => createTrack(id, t, i));
  });
  createAll();
  res.status(201).json(getProjectWithTracks(id));
});

app.patch('/api/projects/:id', (req, res, next) => {
  const row = getProjectRow(req.params.id);
  if (!row) return next(notFound('Project not found'));
  const body = { ...(req.body || {}) };
  if (body.keyRoot === undefined && body.key_root !== undefined) body.keyRoot = body.key_root;
  if (body.masterGain === undefined && body.master_gain !== undefined) body.masterGain = body.master_gain;
  if (body.aiNotes === undefined && body.ai_notes !== undefined) body.aiNotes = body.ai_notes;
  if (body.trackCount !== undefined) delete body.trackCount;
  if (body.duration !== undefined) delete body.duration;
  if (body.tracks !== undefined) delete body.tracks;
  if (body.id !== undefined) delete body.id;
  if (body.created_at !== undefined) delete body.created_at;
  if (body.updated_at !== undefined) delete body.updated_at;
  if (body.track_count !== undefined) delete body.track_count;
  const updates = [];
  const params = { id: row.id };

  if (body.title !== undefined) {
    params.title = requireString(body.title, 'Project title', { max: 80 });
    updates.push('title = @title');
  }
  if (body.genre !== undefined) {
    params.genre = String(body.genre).slice(0, 60);
    updates.push('genre = @genre');
  }
  if (body.bpm !== undefined) {
    params.bpm = clampInt(body.bpm, 50, 220, row.bpm);
    updates.push('bpm = @bpm');
  }
  if (body.keyRoot !== undefined) {
    params.key_root = clampInt(body.keyRoot, 0, 11, row.key_root);
    updates.push('key_root = @key_root');
  }
  if (body.scale !== undefined) {
    params.scale = SCALES[body.scale] ? body.scale : row.scale;
    updates.push('scale = @scale');
  }
  if (body.description !== undefined) {
    params.description = String(body.description).slice(0, 500);
    updates.push('description = @description');
  }
  if (body.sections !== undefined) {
    params.sections = JSON.stringify(Array.isArray(body.sections) ? body.sections.slice(0, 8).map((s) => String(s).slice(0, 40)) : []);
    updates.push('sections = @sections');
  }
  if (body.arrangement !== undefined) {
    params.arrangement = JSON.stringify(parseArrangement(body.arrangement));
    updates.push('arrangement = @arrangement');
  }
  if (body.status !== undefined) {
    if (!PROJECT_STATUSES.includes(body.status)) return next(bad('Invalid status', 'validation'));
    params.status = body.status;
    updates.push('status = @status');
  }
  if (body.favorite !== undefined) {
    params.favorite = body.favorite ? 1 : 0;
    updates.push('favorite = @favorite');
  }
  if (body.cover !== undefined && body.cover && typeof body.cover === 'object') {
    params.cover = JSON.stringify({ ...safeJson(row.cover, {}), ...body.cover });
    updates.push('cover = @cover');
  }
  if (body.swing !== undefined) {
    params.swing = clampInt(body.swing, 0, 60, row.swing);
    updates.push('swing = @swing');
  }
  if (body.masterGain !== undefined) {
    params.master_gain = clampNum(body.masterGain, 0, 1.5, row.master_gain);
    updates.push('master_gain = @master_gain');
  }
  if (body.aiNotes !== undefined) {
    params.ai_notes = String(body.aiNotes).slice(0, 1200);
    updates.push('ai_notes = @ai_notes');
  }
  if (!updates.length) return next(bad('Nothing to update', 'validation'));
  params.updated_at = nowIso();
  updates.push('updated_at = @updated_at');
  db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = @id`).run(params);
  res.json(getProjectWithTracks(row.id));
});

app.delete('/api/projects/:id', (req, res, next) => {
  const row = getProjectRow(req.params.id);
  if (!row) return next(notFound('Project not found'));
  db.prepare('DELETE FROM projects WHERE id = ?').run(row.id);
  db.prepare('UPDATE ideas SET project_id = NULL WHERE project_id = ?').run(row.id);
  res.json({ ok: true, id: row.id });
});

app.post('/api/projects/:id/duplicate', (req, res, next) => {
  const row = getProjectRow(req.params.id);
  if (!row) return next(notFound('Project not found'));
  const tracks = db.prepare('SELECT * FROM tracks WHERE project_id = ? ORDER BY position ASC').all(row.id);
  const id = newId('prj');
  const ts = nowIso();
  const title = `${row.title} (copy)`.slice(0, 80);
  const copy = db.transaction(() => {
    db.prepare(
      `INSERT INTO projects (id, title, genre, bpm, key_root, scale, description, sections, arrangement, status, favorite, cover, swing, master_gain, ai_notes, created_at, updated_at)
       VALUES (@id, @title, @genre, @bpm, @key_root, @scale, @description, @sections, @arrangement, @status, 0, @cover, @swing, @master_gain, @ai_notes, @created_at, @updated_at)`
    ).run({
      id,
      title,
      genre: row.genre,
      bpm: row.bpm,
      key_root: row.key_root,
      scale: row.scale,
      description: row.description,
      sections: row.sections,
      arrangement: row.arrangement,
      status: row.status,
      cover: row.cover,
      swing: row.swing,
      master_gain: row.master_gain,
      ai_notes: row.ai_notes,
      created_at: ts,
      updated_at: ts,
    });
    for (const t of tracks) {
      createTrack(
        id,
        {
          name: t.name,
          instrument: t.instrument,
          color: t.color,
          volume: t.volume,
          pan: t.pan,
          drive: t.drive,
          filterCutoff: t.filter_cutoff,
          reverbSend: t.reverb_send,
          delaySend: t.delay_send,
          patterns: safeJson(t.patterns, {}),
          notes: safeJson(t.notes, {}),
          synth: safeJson(t.synth, {}),
          sampleId: t.sample_id,
        },
        t.position
      );
    }
  });
  copy();
  res.status(201).json(getProjectWithTracks(id));
});

app.get('/api/projects/:id/tracks', (req, res, next) => {
  if (!getProjectRow(req.params.id)) return next(notFound('Project not found'));
  const tracks = db.prepare('SELECT * FROM tracks WHERE project_id = ? ORDER BY position ASC').all(req.params.id).map(hydrateTrack);
  res.json(tracks);
});

app.post('/api/projects/:id/tracks', (req, res, next) => {
  if (!getProjectRow(req.params.id)) return next(notFound('Project not found'));
  const count = db.prepare('SELECT COUNT(*) AS c FROM tracks WHERE project_id = ?').get(req.params.id).c;
  if (count >= 16) return next(bad('This project already has the maximum of 16 tracks', 'limit'));
  const track = createTrack(req.params.id, req.body || {}, count);
  touchProject(req.params.id);
  res.status(201).json(track);
});

app.patch('/api/tracks/:id', (req, res, next) => {
  const row = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Track not found'));
  const body = { ...(req.body || {}) };
  const aliases = {
    filter_cutoff: 'filterCutoff',
    reverb_send: 'reverbSend',
    delay_send: 'delaySend',
    sample_id: 'sampleId',
  };
  for (const [snake, camel] of Object.entries(aliases)) {
    if (body[camel] === undefined && body[snake] !== undefined) body[camel] = body[snake];
  }
  for (const ignorable of ['id', 'project_id', 'position', 'kind', 'instrumentLabel', 'created_at', 'updated_at']) delete body[ignorable];
  const updates = [];
  const params = { id: row.id };
  for (const field of TRACK_FIELDS) {
    if (body[field] === undefined) continue;
    if (field === 'name') {
      params.name = requireString(body.name, 'Track name', { max: 40 });
      updates.push('name = @name');
    } else if (field === 'color') {
      params.color = validColor(body.color, row.color);
      updates.push('color = @color');
    } else if (['volume', 'pan', 'drive', 'reverbSend', 'delaySend'].includes(field)) {
      const col = field.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
      const limits = field === 'volume' ? [0, 1.5] : field === 'pan' ? [-1, 1] : [0, 1];
      params[col] = clampNum(body[field], limits[0], limits[1], row[col]);
      updates.push(`${col} = @${col}`);
    } else if (field === 'filterCutoff') {
      params.filter_cutoff = clampNum(body.filterCutoff, 0.05, 1, row.filter_cutoff);
      updates.push('filter_cutoff = @filter_cutoff');
    } else if (field === 'mute' || field === 'solo') {
      params[field] = body[field] ? 1 : 0;
      updates.push(`${field} = @${field}`);
    } else if (field === 'patterns' || field === 'notes' || field === 'synth') {
      if (!body[field] || typeof body[field] !== 'object') continue;
      params[field] = JSON.stringify(body[field]);
      updates.push(`${field} = @${field}`);
    } else if (field === 'instrument') {
      if (!INSTRUMENTS[body.instrument]) continue;
      const meta = INSTRUMENTS[body.instrument];
      params.instrument = body.instrument;
      params.kind = meta.kind;
      updates.push('instrument = @instrument', 'kind = @kind');
      if (body.synth === undefined) {
        params.synth_reset = JSON.stringify(defaultParams(body.instrument));
        updates.push('synth = @synth_reset');
      }
    } else if (field === 'sampleId') {
      params.sample_id = body.sampleId ? String(body.sampleId) : null;
      updates.push('sample_id = @sample_id');
    }
  }
  if (!updates.length) return next(bad('Nothing to update', 'validation'));
  params.updated_at = nowIso();
  updates.push('updated_at = @updated_at');
  db.prepare(`UPDATE tracks SET ${updates.join(', ')} WHERE id = @id`).run(params);
  touchProject(row.project_id);
  res.json(hydrateTrack(db.prepare('SELECT * FROM tracks WHERE id = ?').get(row.id)));
});

app.delete('/api/tracks/:id', (req, res, next) => {
  const row = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Track not found'));
  db.prepare('DELETE FROM tracks WHERE id = ?').run(row.id);
  const remaining = db.prepare('SELECT id FROM tracks WHERE project_id = ? ORDER BY position ASC').all(row.project_id);
  const reorder = db.prepare('UPDATE tracks SET position = ? WHERE id = ?');
  remaining.forEach((t, i) => reorder.run(i, t.id));
  touchProject(row.project_id);
  res.json({ ok: true, id: row.id });
});

app.post('/api/tracks/:id/duplicate', (req, res, next) => {
  const row = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Track not found'));
  const count = db.prepare('SELECT COUNT(*) AS c FROM tracks WHERE project_id = ?').get(row.project_id).c;
  if (count >= 16) return next(bad('This project already has the maximum of 16 tracks', 'limit'));
  const copy = createTrack(
    row.project_id,
    {
      name: `${row.name} 2`.slice(0, 40),
      instrument: row.instrument,
      color: row.color,
      volume: row.volume,
      pan: row.pan,
      drive: row.drive,
      filterCutoff: row.filter_cutoff,
      reverbSend: row.reverb_send,
      delaySend: row.delay_send,
      patterns: safeJson(row.patterns, {}),
      notes: safeJson(row.notes, {}),
      synth: safeJson(row.synth, {}),
      sampleId: row.sample_id,
    },
    count
  );
  touchProject(row.project_id);
  res.status(201).json(copy);
});

app.post('/api/projects/:id/reorder', (req, res, next) => {
  if (!getProjectRow(req.params.id)) return next(notFound('Project not found'));
  const order = Array.isArray(req.body?.trackIds) ? req.body.trackIds : null;
  if (!order) return next(bad('trackIds array is required', 'validation'));
  const existing = new Set(db.prepare('SELECT id FROM tracks WHERE project_id = ?').all(req.params.id).map((t) => t.id));
  const stmt = db.prepare('UPDATE tracks SET position = ? WHERE id = ? AND project_id = ?');
  const run = db.transaction(() => {
    order.forEach((id, i) => {
      if (existing.has(id)) stmt.run(i, id, req.params.id);
    });
  });
  run();
  touchProject(req.params.id);
  res.json(db.prepare('SELECT * FROM tracks WHERE project_id = ? ORDER BY position ASC').all(req.params.id).map(hydrateTrack));
});

/* ------------------------------------------------------------------ *
 *  Samples
 * ------------------------------------------------------------------ */

app.get('/api/samples', (req, res) => {
  const { category, query = '', favorite } = req.query;
  const where = [];
  const params = {};
  if (category && category !== 'All') {
    where.push('category = @category');
    params.category = String(category);
  }
  if (typeof query === 'string' && query.trim()) {
    where.push('(name LIKE @q OR description LIKE @q OR tags LIKE @q)');
    params.q = `%${query.trim()}%`;
  }
  if (favorite === 'true' || favorite === '1') where.push('favorite = 1');
  const rows = db
    .prepare(`SELECT * FROM samples ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY favorite DESC, created_at DESC`)
    .all(params);
  res.json(rows.map(hydrateSample));
});

app.post('/api/samples', (req, res, next) => {
  const body = req.body || {};
  const name = requireString(body.name ?? 'Untitled Sample', 'Sample name', { max: 60 });
  const id = newId('smp');
  const ts = nowIso();
  db.prepare(
    `INSERT INTO samples (id, name, category, instrument, bpm, key_root, description, color, duration, source, favorite, plays, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    name,
    String(body.category || 'Loops').slice(0, 30),
    INSTRUMENTS[body.instrument] ? body.instrument : 'sample',
    body.bpm == null ? null : clampInt(body.bpm, 40, 250, 120),
    body.keyRoot == null ? null : clampInt(body.keyRoot, 0, 11, 0),
    String(body.description || '').slice(0, 300),
    validColor(body.color, 'teal'),
    clampNum(body.duration, 0.1, 120, 2),
    ['generated', 'recorded', 'imported'].includes(body.source) ? body.source : 'generated',
    body.favorite ? 1 : 0,
    0,
    JSON.stringify(Array.isArray(body.tags) ? body.tags.slice(0, 8).map((t) => String(t).slice(0, 20)) : []),
    ts,
    ts
  );
  res.status(201).json(hydrateSample(db.prepare('SELECT * FROM samples WHERE id = ?').get(id)));
});

app.patch('/api/samples/:id', (req, res, next) => {
  const row = db.prepare('SELECT * FROM samples WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Sample not found'));
  const body = req.body || {};
  const updates = [];
  const params = { id: row.id };
  const map = { name: 'name', category: 'category', description: 'description', color: 'color', favorite: 'favorite', tags: 'tags', bpm: 'bpm', keyRoot: 'key_root' };
  for (const [key, col] of Object.entries(map)) {
    if (body[key] === undefined) continue;
    if (key === 'name') params.name = requireString(body.name, 'Sample name', { max: 60 });
    else if (key === 'color') params.color = validColor(body.color, row.color);
    else if (key === 'favorite') params.favorite = body.favorite ? 1 : 0;
    else if (key === 'tags') params.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags.slice(0, 8).map(String) : []);
    else if (key === 'bpm') params.bpm = body.bpm == null ? null : clampInt(body.bpm, 40, 250, row.bpm || 120);
    else if (key === 'keyRoot') params.key_root = body.keyRoot == null ? null : clampInt(body.keyRoot, 0, 11, row.key_root || 0);
    else params[key] = String(body[key]).slice(0, key === 'description' ? 300 : 60);
    updates.push(`${col} = @${key === 'keyRoot' ? 'key_root' : key}`);
  }
  if (!updates.length) return next(bad('Nothing to update', 'validation'));
  params.updated_at = nowIso();
  updates.push('updated_at = @updated_at');
  db.prepare(`UPDATE samples SET ${updates.join(', ')} WHERE id = @id`).run(params);
  res.json(hydrateSample(db.prepare('SELECT * FROM samples WHERE id = ?').get(row.id)));
});

app.post('/api/samples/:id/play', (req, res, next) => {
  const row = db.prepare('SELECT * FROM samples WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Sample not found'));
  db.prepare('UPDATE samples SET plays = plays + 1 WHERE id = ?').run(row.id);
  res.json({ ok: true, plays: row.plays + 1 });
});

app.delete('/api/samples/:id', (req, res, next) => {
  const row = db.prepare('SELECT * FROM samples WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Sample not found'));
  db.prepare('DELETE FROM samples WHERE id = ?').run(row.id);
  res.json({ ok: true, id: row.id });
});

/* ------------------------------------------------------------------ *
 *  Presets
 * ------------------------------------------------------------------ */

app.get('/api/presets', (req, res) => {
  const { category, query = '', favorite } = req.query;
  const where = [];
  const params = {};
  if (category && category !== 'All') {
    where.push('category = @category');
    params.category = String(category);
  }
  if (typeof query === 'string' && query.trim()) {
    where.push('(name LIKE @q OR description LIKE @q OR instrument LIKE @q)');
    params.q = `%${query.trim()}%`;
  }
  if (favorite === 'true' || favorite === '1') where.push('favorite = 1');
  const rows = db
    .prepare(`SELECT * FROM presets ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY favorite DESC, updated_at DESC`)
    .all(params);
  res.json(rows.map(hydratePreset));
});

app.post('/api/presets', (req, res, next) => {
  const body = req.body || {};
  const name = requireString(body.name ?? 'Untitled Preset', 'Preset name', { max: 60 });
  const instrument = INSTRUMENTS[body.instrument] && INSTRUMENTS[body.instrument].kind === 'synth' ? body.instrument : 'lead';
  const params = { ...defaultParams(instrument) };
  if (body.params && typeof body.params === 'object') {
    for (const [k, v] of Object.entries(body.params)) {
      if (typeof v === 'number' || typeof v === 'string') params[k] = v;
    }
  }
  const id = newId('pst');
  const ts = nowIso();
  db.prepare(
    `INSERT INTO presets (id, name, instrument, category, description, color, params, favorite, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    name,
    instrument,
    String(body.category || INSTRUMENTS[instrument].label).slice(0, 30),
    String(body.description || '').slice(0, 300),
    validColor(body.color, INSTRUMENTS[instrument].color),
    JSON.stringify(params),
    body.favorite ? 1 : 0,
    ts,
    ts
  );
  res.status(201).json(hydratePreset(db.prepare('SELECT * FROM presets WHERE id = ?').get(id)));
});

app.patch('/api/presets/:id', (req, res, next) => {
  const row = db.prepare('SELECT * FROM presets WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Preset not found'));
  const body = req.body || {};
  const updates = [];
  const params = { id: row.id };
  if (body.name !== undefined) {
    params.name = requireString(body.name, 'Preset name', { max: 60 });
    updates.push('name = @name');
  }
  if (body.category !== undefined) {
    params.category = String(body.category).slice(0, 30);
    updates.push('category = @category');
  }
  if (body.description !== undefined) {
    params.description = String(body.description).slice(0, 300);
    updates.push('description = @description');
  }
  if (body.color !== undefined) {
    params.color = validColor(body.color, row.color);
    updates.push('color = @color');
  }
  if (body.favorite !== undefined) {
    params.favorite = body.favorite ? 1 : 0;
    updates.push('favorite = @favorite');
  }
  if (body.params !== undefined && body.params && typeof body.params === 'object') {
    params.params = JSON.stringify({ ...safeJson(row.params, {}), ...body.params });
    updates.push('params = @params');
  }
  if (!updates.length) return next(bad('Nothing to update', 'validation'));
  params.updated_at = nowIso();
  updates.push('updated_at = @updated_at');
  db.prepare(`UPDATE presets SET ${updates.join(', ')} WHERE id = @id`).run(params);
  res.json(hydratePreset(db.prepare('SELECT * FROM presets WHERE id = ?').get(row.id)));
});

app.delete('/api/presets/:id', (req, res, next) => {
  const row = db.prepare('SELECT * FROM presets WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Preset not found'));
  db.prepare('DELETE FROM presets WHERE id = ?').run(row.id);
  res.json({ ok: true, id: row.id });
});

/* ------------------------------------------------------------------ *
 *  Ideas (AI / composer history)
 * ------------------------------------------------------------------ */

function listIdeaRows(where, params) {
  return db
    .prepare(
      `SELECT id, prompt, title, genre, bpm, key_root, scale, status, engine, model, summary, error, project_id, created_at, updated_at
       FROM ideas ${where ? `WHERE ${where}` : ''} ORDER BY created_at DESC LIMIT 60`
    )
    .all(params);
}

app.get('/api/ideas', (req, res) => {
  const { status, query = '' } = req.query;
  const where = [];
  const params = {};
  if (status && status !== 'all') {
    where.push('status = @status');
    params.status = String(status);
  }
  if (typeof query === 'string' && query.trim()) {
    where.push('(prompt LIKE @q OR title LIKE @q OR genre LIKE @q)');
    params.q = `%${query.trim()}%`;
  }
  res.json(listIdeaRows(where.length ? where.join(' AND ') : null, params).map(hydrateIdea));
});

app.get('/api/ideas/:id', (req, res, next) => {
  const row = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Idea not found'));
  res.json(hydrateIdea(row));
});

app.post(
  '/api/ideas',
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const prompt = requireString(body.prompt, 'Prompt', { min: 4, max: 600 });
    const id = newId('idea');
    const ts = nowIso();
    const genre = body.genre ? String(body.genre).slice(0, 60) : null;
    const bpm = body.bpm ? clampInt(body.bpm, 50, 220, 120) : null;
    const keyRoot = body.keyRoot === '' || body.keyRoot == null ? null : clampInt(body.keyRoot, 0, 11, 0);
    const scale = SCALES[body.scale] ? body.scale : null;

    db.prepare(
      `INSERT INTO ideas (id, prompt, title, genre, bpm, key_root, scale, status, engine, model, summary, payload, error, project_id, created_at, updated_at)
       VALUES (?, ?, NULL, ?, ?, ?, ?, 'generating', 'local', NULL, NULL, NULL, NULL, NULL, ?, ?)`
    ).run(id, prompt, genre, bpm, keyRoot, scale, ts, ts);

    const config = aiConfigFromSettings(getSetting);
    const result = await generateIdea({
      prompt,
      genre,
      bpm: bpm || undefined,
      keyRoot: keyRoot == null ? undefined : keyRoot,
      scale: scale || undefined,
      config,
      preferLocal: !!body.preferLocal,
      seed: `${prompt}-${id}`,
    });

    const idea = result.idea;
    let projectId = null;
    if (body.createProject) {
      projectId = persistIdeaProject(idea);
    }
    const status = projectId ? 'saved' : 'ready';
    db.prepare(
      `UPDATE ideas SET title = ?, genre = ?, bpm = ?, key_root = ?, scale = ?, status = ?, engine = ?, model = ?, summary = ?, payload = ?, error = NULL, project_id = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      idea.title,
      idea.genre,
      idea.bpm,
      idea.keyRoot,
      idea.scale,
      status,
      result.engine,
      result.model,
      summarizeIdea(idea, result),
      JSON.stringify(idea),
      projectId,
      nowIso(),
      id
    );
    const saved = db.prepare('SELECT * FROM ideas WHERE id = ?').get(id);
    res.status(201).json({ idea: hydrateIdea(saved), projectId, warning: result.warning });
  })
);

app.patch('/api/ideas/:id', (req, res, next) => {
  const row = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Idea not found'));
  const body = req.body || {};
  const updates = [];
  const params = { id: row.id };
  if (body.title !== undefined) {
    params.title = requireString(body.title, 'Title', { max: 80 });
    updates.push('title = @title');
  }
  if (body.status !== undefined) {
    if (!['draft', 'ready', 'saved', 'failed'].includes(body.status)) return next(bad('Invalid idea status', 'validation'));
    params.status = body.status;
    updates.push('status = @status');
  }
  if (!updates.length) return next(bad('Nothing to update', 'validation'));
  params.updated_at = nowIso();
  updates.push('updated_at = @updated_at');
  db.prepare(`UPDATE ideas SET ${updates.join(', ')} WHERE id = @id`).run(params);
  res.json(hydrateIdea(db.prepare('SELECT * FROM ideas WHERE id = ?').get(row.id)));
});

app.delete('/api/ideas/:id', (req, res, next) => {
  const row = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Idea not found'));
  db.prepare('DELETE FROM ideas WHERE id = ?').run(row.id);
  res.json({ ok: true, id: row.id });
});

app.post(
  '/api/ideas/:id/retry',
  asyncRoute(async (req, res, next) => {
    const row = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);
    if (!row) return next(notFound('Idea not found'));
    db.prepare("UPDATE ideas SET status = 'generating', error = NULL, updated_at = ? WHERE id = ?").run(nowIso(), row.id);
    const config = aiConfigFromSettings(getSetting);
    const result = await generateIdea({
      prompt: row.prompt,
      genre: row.genre || undefined,
      bpm: row.bpm || undefined,
      keyRoot: row.key_root == null ? undefined : row.key_root,
      scale: row.scale || undefined,
      config,
      preferLocal: !!req.body?.preferLocal,
      seed: `${row.prompt}-${row.id}-retry`,
    });
    const idea = result.idea;
    let projectId = row.project_id;
    if (req.body?.createProject && !projectId) projectId = persistIdeaProject(idea);
    db.prepare(
      `UPDATE ideas SET title = ?, genre = ?, bpm = ?, key_root = ?, scale = ?, status = ?, engine = ?, model = ?, summary = ?, payload = ?, error = NULL, project_id = ?, updated_at = ? WHERE id = ?`
    ).run(
      idea.title,
      idea.genre,
      idea.bpm,
      idea.keyRoot,
      idea.scale,
      projectId ? 'saved' : 'ready',
      result.engine,
      result.model,
      summarizeIdea(idea, result),
      JSON.stringify(idea),
      projectId || null,
      nowIso(),
      row.id
    );
    res.json({ idea: hydrateIdea(db.prepare('SELECT * FROM ideas WHERE id = ?').get(row.id)), projectId, warning: result.warning });
  })
);

app.post('/api/ideas/:id/open', (req, res, next) => {
  const row = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);
  if (!row) return next(notFound('Idea not found'));
  let payload = row.payload ? safeJson(row.payload, null) : null;
  if (!payload) {
    payload = normalizeIdeaPayload({
      title: row.title || 'Untitled Idea',
      genre: row.genre,
      bpm: row.bpm,
      keyRoot: row.key_root,
      scale: row.scale,
      tracks: starterTracks(),
      description: row.summary || '',
    });
  }
  const projectId = persistIdeaProject(payload);
  db.prepare("UPDATE ideas SET status = 'saved', project_id = ?, updated_at = ? WHERE id = ?").run(projectId, nowIso(), row.id);
  res.status(201).json(getProjectWithTracks(projectId));
});

function persistIdeaProject(idea) {
  const normalized = normalizeIdeaPayload(idea);
  const id = newId('prj');
  const ts = nowIso();
  const arrangement = normalized.arrangement.length ? normalized.arrangement : [{ bank: 'A', repeats: 2 }, { bank: 'B', repeats: 2 }];
  const run = db.transaction(() => {
    db.prepare(
      `INSERT INTO projects (id, title, genre, bpm, key_root, scale, description, sections, arrangement, status, favorite, cover, swing, master_gain, ai_notes, created_at, updated_at)
       VALUES (@id, @title, @genre, @bpm, @key_root, @scale, @description, @sections, @arrangement, 'sketch', 0, @cover, 0, 0.85, @ai_notes, @created_at, @updated_at)`
    ).run({
      id,
      title: normalized.title,
      genre: normalized.genre,
      bpm: normalized.bpm,
      key_root: normalized.keyRoot,
      scale: normalized.scale,
      description: normalized.description,
      sections: JSON.stringify(normalized.sections.length ? normalized.sections : ['Intro', 'Groove', 'Drop']),
      arrangement: JSON.stringify(arrangement),
      cover: JSON.stringify({ theme: 'nebula', hue: Math.floor(Math.random() * 360) }),
      ai_notes: normalizeAiNotes(normalized.description || ''),
      created_at: ts,
      updated_at: ts,
    });
    normalized.tracks.forEach((t, i) => createTrack(id, t, i));
  });
  run();
  return id;
}

function normalizeAiNotes(text) {
  return String(text || '').slice(0, 400);
}

function summarizeIdea(idea, result) {
  const count = idea.tracks?.length || 0;
  const engineLabel = result.engine === 'arena' ? 'Arena router' : 'Local composer';
  const base = `${engineLabel} built ${count} tracks in ${idea.genre} at ${idea.bpm} BPM.`;
  return result.warning ? `${base} ${result.warning}` : base;
}

/* ------------------------------------------------------------------ *
 *  Stats
 * ------------------------------------------------------------------ */

app.get('/api/stats', (_req, res) => {
  const projects = db.prepare('SELECT * FROM projects').all().map(hydrateProject);
  const trackCount = db.prepare('SELECT COUNT(*) AS c FROM tracks').get().c;
  const sampleCount = db.prepare('SELECT COUNT(*) AS c FROM samples').get().c;
  const presetCount = db.prepare('SELECT COUNT(*) AS c FROM presets').get().c;
  const ideaCount = db.prepare('SELECT COUNT(*) AS c FROM ideas').get().c;
  const favorites = projects.filter((p) => p.favorite).length;
  const totalSeconds = projects.reduce((acc, p) => acc + (p.duration || 0), 0);
  const bpmAvg = projects.length ? Math.round(projects.reduce((a, p) => a + p.bpm, 0) / projects.length) : 0;

  const statusCounts = PROJECT_STATUSES.reduce((acc, s) => {
    acc[s] = projects.filter((p) => p.status === s).length;
    return acc;
  }, {});
  const genreCounts = {};
  for (const p of projects) genreCounts[p.genre] = (genreCounts[p.genre] || 0) + 1;

  const recentProjects = [...projects]
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
    .slice(0, 5)
    .map((p) => ({ ...p, trackCount: db.prepare('SELECT COUNT(*) AS c FROM tracks WHERE project_id = ?').get(p.id).c }));

  const ideas = db.prepare('SELECT * FROM ideas ORDER BY created_at DESC LIMIT 4').all().map(hydrateIdea);
  const presets = db.prepare('SELECT * FROM presets ORDER BY favorite DESC, updated_at DESC LIMIT 4').all().map(hydratePreset);

  const activity = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const a = day.toISOString();
    const b = next.toISOString();
    const edits = db.prepare('SELECT COUNT(*) AS c FROM projects WHERE updated_at >= ? AND updated_at < ?').get(a, b).c;
    const ideasCount = db.prepare('SELECT COUNT(*) AS c FROM ideas WHERE created_at >= ? AND created_at < ?').get(a, b).c;
    activity.push({ date: a.slice(0, 10), projects: edits, ideas: ideasCount, total: edits + ideasCount });
  }

  res.json({
    totals: {
      projects: projects.length,
      tracks: trackCount,
      samples: sampleCount,
      presets: presetCount,
      ideas: ideaCount,
      favorites,
      minutes: Math.round((totalSeconds / 60) * 10) / 10,
      bpmAvg,
    },
    statusCounts,
    genreCounts,
    recentProjects,
    recentIdeas: ideas,
    featuredPresets: presets,
    activity,
  });
});

/* ------------------------------------------------------------------ *
 *  Settings
 * ------------------------------------------------------------------ */

function publicSettings() {
  const raw = getSettingsObject();
  const key = raw['ai.apiKey'] || process.env.ARENA_API_KEY || process.env.ARENA_ROUTER_API_KEY || '';
  const settings = { ...raw };
  delete settings['ai.apiKey'];
  settings['ai.hasKey'] = !!key;
  settings['ai.keyHint'] = key ? `${key.slice(0, 4)}••••${key.slice(-4)}` : '';
  settings['ai.envKey'] = !raw['ai.apiKey'] && !!(process.env.ARENA_API_KEY || process.env.ARENA_ROUTER_API_KEY);
  if (!settings['ai.baseUrl']) settings['ai.baseUrl'] = 'https://api.preview.arena.ai/v1';
  if (!settings['ai.model']) settings['ai.model'] = 'coding-router-preview';
  return settings;
}

app.get('/api/settings', (_req, res) => {
  res.json(publicSettings());
});

app.patch('/api/settings', (req, res, next) => {
  const body = req.body || {};
  const allowed = new Set([
    'user.displayName',
    'user.studioName',
    'user.theme',
    'user.defaultBpm',
    'project.autosave',
    'project.metronome',
    'project.countIn',
    'ai.provider',
    'ai.baseUrl',
    'ai.model',
  ]);
  let changed = 0;
  for (const [key, value] of Object.entries(body)) {
    if (key === 'ai.apiKey') {
      if (typeof value === 'string' && value.trim()) {
        const trimmed = value.trim();
        if (!/^[A-Za-z0-9._\-:]{8,200}$/.test(trimmed)) return next(bad('That API key format looks invalid', 'validation'));
        setSetting('ai.apiKey', trimmed);
        setSetting('ai.keySet', true);
        changed++;
      } else if (value === '' || value === null) {
        db.prepare("DELETE FROM settings WHERE key = 'ai.apiKey'").run();
        setSetting('ai.keySet', false);
        changed++;
      }
      continue;
    }
    if (!allowed.has(key)) continue;
    if (key === 'ai.baseUrl') {
      let url;
      try {
        url = new URL(String(value));
      } catch {
        return next(bad('Base URL must be a valid https URL', 'validation'));
      }
      if (!['https:', 'http:'].includes(url.protocol)) return next(bad('Base URL must use http or https', 'validation'));
      setSetting(key, url.toString().replace(/\/+$/, ''));
    } else if (key === 'user.defaultBpm') {
      setSetting(key, clampInt(value, 50, 220, 120));
    } else if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      setSetting(key, value);
    }
    changed++;
  }
  if (!changed) return next(bad('No valid settings provided', 'validation'));
  res.json(publicSettings());
});

app.post(
  '/api/settings/test-ai',
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const stored = aiConfigFromSettings(getSetting);
    const config = {
      baseUrl: (body.baseUrl ? String(body.baseUrl) : stored.baseUrl).replace(/\/+$/, ''),
      model: body.model ? String(body.model) : stored.model,
      apiKey: body.apiKey ? String(body.apiKey).trim() : stored.apiKey,
    };
    if (!config.apiKey) {
      return res.status(400).json({ ok: false, error: 'No Arena API key configured yet.', code: 'missing_key' });
    }
    try {
      const result = await testArenaConnection(config);
      res.json({ ok: true, models: result.models, modelCount: result.count, model: config.model, baseUrl: config.baseUrl });
    } catch (err) {
      const message = err instanceof AIError ? err.message : `Connection failed: ${err.message}`;
      res.status(502).json({ ok: false, error: message, code: err.code || 'network' });
    }
  })
);

/* ------------------------------------------------------------------ *
 *  Static client + errors
 * ------------------------------------------------------------------ */

const distDir = path.join(ROOT, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: '1h', index: false }));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res
      .status(200)
      .type('html')
      .send(`<pre style="font-family:monospace;padding:32px;background:#090b10;color:#d6ff4d">Pulsar Studio API is running on :${PORT}.
The client bundle has not been built yet.

Run:  npm run build   (then restart)

API health: <a style="color:#5eead4" href="/api/health">/api/health</a></pre>`);
  });
}

app.use((req, res) => {
  if (req.path.startsWith('/api/')) res.status(404).json({ error: 'Not found', code: 'not_found' });
  else res.status(404).type('text').send('Not found');
});

app.use((err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : err.status && Number.isInteger(err.status) ? err.status : 500;
  if (status >= 500) console.error('[pulsar]', err);
  res.status(status).json({
    error: err.message || 'Something went wrong',
    code: err.code || 'server_error',
  });
});

app.listen(PORT, HOST, () => {
  const lan = lanAddresses();
  const local = `http://localhost:${PORT}`;
  const remote = lan[0]?.url || null;

  console.log('');
  console.log('  \x1b[38;5;191mPULSAR STUDIO\x1b[0m  beat lab');
  console.log(`  \x1b[2mdesktop\x1b[0m  ${local}`);
  if (remote) {
    console.log(`  \x1b[2mphone  \x1b[0m  ${remote}   \x1b[2m(same Wi-Fi, then scan the QR below)\x1b[0m`);
    lan.forEach((entry) => {
      if (entry.url !== remote) console.log(`  \x1b[2m       \x1b[0m  ${entry.url}  ${entry.name}`);
    });
  } else {
    console.log('  \x1b[2mphone  \x1b[0m  no LAN address found — check your Wi-Fi connection');
  }
  console.log('');

  if (remote) {
    QRCode.toString(remote, { type: 'terminal', small: true, errorCorrectionLevel: 'M' })
      .then((qr) => {
        console.log(qr);
        console.log('  Open your iPhone camera and point it at the code.');
        console.log('');
      })
      .catch(() => {});
  }
});
