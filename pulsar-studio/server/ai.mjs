import { normalizeIdeaPayload, composeIdea } from './compose.mjs';
import { NOTE_NAMES, SCALE_LABELS } from './music.mjs';

const DEFAULT_BASE_URL = 'https://api.preview.arena.ai/v1';
const DEFAULT_MODEL = 'coding-router-preview';

const SYSTEM_PROMPT = `You are the in-house composer for Pulsar Studio, a browser beat lab.
Return ONLY minified JSON with this exact shape:
{
  "title": string (2-4 words),
  "genre": string,
  "bpm": integer 50-220,
  "keyRoot": integer 0-11 (0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B),
  "scale": one of "minor","major","dorian","phrygian","mixolydian","harmonicMinor","pentatonicMinor","pentatonicMajor",
  "description": string (max 240 chars, describes the groove),
  "sections": array of 3-5 section names,
  "arrangement": array of {"bank":"A|B|C|D","repeats":1-4},
  "tracks": array of 4-8 tracks,
  "engine": "arena"
}
Each track:
{
  "name": string,
  "instrument": one of "kick","snare","clap","hat","openhat","tom","rim","cowbell","crash","bass","sub","lead","pad","pluck","keys","sample",
  "color": one of "acid","violet","cyan","rose","amber","sky","emerald","fuchsia","orange","teal","slate","red",
  "volume": 0-1.2, "pan": -1..1, "reverbSend": 0-1, "delaySend": 0-1,
  "patterns": {"A":[32 step objects],"B":[...],"C":[...],"D":[...]},   // for drums/samples
  "notes": {"A":[{"step":0-31,"pitch":MIDI 24-96,"len":1-32,"vel":0.05-1}],...},
  "synth": {"wave":"sawtooth|square|triangle|sine|fatsaw|pulse","cutoff":0-1,"resonance":0-1,"attack":sec,"decay":sec,"sustain":0-1,"release":sec,"envAmount":0-1,"detune":0-1,"sub":0-1,"glide":0-1}
}
Rules:
- The grid is 32 sixteenth-note steps (2 bars). Drums use "patterns" step objects {"on":bool,"vel":0-1,"prob":0-1}. Melodic tracks use "notes" with step/pitch/len/vel.
- Every drum track must have the same handful of keys (A-D). Melodic tracks need notes arrays for all A-D (empty arrays allowed).
- Keep it musically coherent: choose one key and scale, keep bass and chords in key, put kick on downbeats for house/techno, snares on 2 and 4, etc.
- Do not wrap JSON in markdown. Do not add commentary.`;

function extractJson(text) {
  if (!text) return null;
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function aiConfigFromSettings(getSetting) {
  return {
    baseUrl: String(getSetting('ai.baseUrl', DEFAULT_BASE_URL) || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    model: String(getSetting('ai.model', DEFAULT_MODEL) || DEFAULT_MODEL),
    apiKey: getSetting('ai.apiKey', '') || process.env.ARENA_API_KEY || process.env.ARENA_ROUTER_API_KEY || '',
    provider: getSetting('ai.provider', 'arena'),
  };
}

function userPrompt({ prompt, genre, bpm, keyRoot, scale }) {
  const parts = [`Compose a brand new track from this brief: "${prompt}".`];
  if (genre) parts.push(`Genre: ${genre}.`);
  if (bpm) parts.push(`Tempo: ${bpm} BPM.`);
  if (keyRoot != null) parts.push(`Key centre: ${NOTE_NAMES[keyRoot]} ${scale ? SCALE_LABELS[scale] || scale : ''}.`);
  parts.push('Make it feel finished: full drum groove, bassline, harmony and a hook. Return only the JSON.');
  return parts.join(' ');
}

/* ------------------------------------------------------------------ *
 *  Upstream diagnostics
 * ------------------------------------------------------------------ */

/** Statuses where a different request shape has a real chance of working. */
const RETRYABLE_STATUS = new Set([400, 403, 404, 405, 413, 415, 422]);

const CHAT_ENDPOINT = '/chat/completions';
const RESPONSES_ENDPOINT = '/responses';

function trimDetail(value, max = 600) {
  if (value == null) return '';
  const text = String(value).replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Pull the most useful sentence out of whatever the router returned. */
function detailFromPayload(payload) {
  if (payload == null) return '';
  if (typeof payload === 'string') return trimDetail(payload);
  const candidates = [
    payload?.error?.message,
    payload?.error?.detail,
    typeof payload?.error === 'string' ? payload.error : null,
    payload?.message,
    payload?.detail,
    payload?.error?.type,
  ];
  for (const candidate of candidates) {
    if (candidate) return trimDetail(candidate);
  }
  return trimDetail(JSON.stringify(payload));
}

async function readFailure(res) {
  const text = await res.text().catch(() => '');
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  return { status: res.status, detail: detailFromPayload(payload) || trimDetail(text) };
}

function classify(status) {
  if (status === 401) return 'invalid_key';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'endpoint_not_found';
  if (status === 413) return 'payload_too_large';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'upstream_error';
  if (status === 400 || status === 422) return 'bad_request';
  return 'upstream_error';
}

function failureMessage({ kind, status, detail, model, base, modelAvailable, models }) {
  const suffix = detail ? ` — ${detail}` : '';
  let message;
  switch (kind) {
    case 'invalid_key':
      message = `Arena rejected the API key (401). Check it under Settings → AI engine.${suffix}`;
      break;
    case 'forbidden':
      message = `Arena accepted the key but refused this request (403) for model “${model}”. The key may not have access to this model or endpoint.${suffix}`;
      break;
    case 'endpoint_not_found':
      message = `Arena answered 404 — no composer endpoint at ${base}.${suffix}`;
      break;
    case 'bad_request':
      message = `Arena rejected the request body (${status}) for model “${model}”.${suffix}`;
      break;
    case 'payload_too_large':
      message = `Arena refused the request as too large (413) for model “${model}”.${suffix}`;
      break;
    case 'rate_limited':
      message = `Arena is rate limiting this key (429). Wait a moment and try again.${suffix}`;
      break;
    case 'upstream_error':
      message = `Arena returned ${status} for model “${model}”.${suffix}`;
      break;
    case 'timeout':
      message = 'Arena did not answer in time. The local engine composed this instead.';
      break;
    case 'network':
      message = `Could not reach Arena at ${base} — check your internet connection.${suffix}`;
      break;
    case 'parse':
      message = 'Arena answered, but the reply was not valid arrangement JSON. Try again or switch model.';
      break;
    case 'empty':
      message = 'Arena answered with an arrangement that contained no tracks. Try a more specific prompt.';
      break;
    default:
      message = `Arena request failed${status ? ` (${status})` : ''}.${suffix}`;
  }
  if (modelAvailable === false) {
    const sample = (models || []).slice(0, 8).join(', ');
    message += ` The configured model “${model}” is not offered by this endpoint${
      sample ? ` (available: ${sample}${models.length > 8 ? ', …' : ''})` : ''
    }. Choose an available model under Settings → AI engine.`;
  }
  return message;
}

/** Ask /models what this key may actually use. Only called after a failure. */
async function listModels(config, timeoutMs = 15000) {
  try {
    const res = await fetch(`${String(config.baseUrl).replace(/\/+$/, '')}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const models = Array.isArray(data?.data) ? data.data.map((m) => m?.id).filter(Boolean) : [];
    return models.length ? models : null;
  } catch {
    return null;
  }
}

async function buildFailure({ config, model, base, lastFailure, attempts }) {
  const status = lastFailure?.status ?? null;
  const kind = lastFailure?.kind || classify(status);

  let models = null;
  let modelAvailable = null;
  if (status === 400 || status === 403 || status === 404) {
    models = await listModels(config);
    if (models) modelAvailable = models.includes(model);
  }

  const message = failureMessage({
    kind,
    status,
    detail: lastFailure?.detail || '',
    model,
    base,
    modelAvailable,
    models,
  });

  return new AIError(message, kind, status, {
    detail: lastFailure?.detail || null,
    endpoint: lastFailure?.endpoint || null,
    attempts,
    modelAvailable,
    models,
  });
}

/** Read the assistant text out of every response shape the routers use. */
function extractContent(data) {
  if (!data || typeof data !== 'object') return null;
  const choice = data?.choices?.[0];
  const message = choice?.message?.content ?? choice?.text;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) {
    const joined = message.map((part) => (typeof part === 'string' ? part : part?.text || '')).join('');
    if (joined.trim()) return joined;
  }
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text;
  if (Array.isArray(data.output)) {
    const joined = data.output
      .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
      .map((part) => part?.text || part?.content || '')
      .join('');
    if (joined.trim()) return joined;
  }
  if (Array.isArray(data.content)) {
    const joined = data.content.map((part) => part?.text || '').join('');
    if (joined.trim()) return joined;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 *  Request ladder
 * ------------------------------------------------------------------ */

/**
 * Progressively more forgiving request shapes. Preview routers vary in what
 * they accept (temperature ranges, max_tokens ceilings, whether a system role
 * is supported, whether /chat/completions exists at all), so instead of
 * failing on the first 400/403/404 we walk down this list.
 */
function attemptPlan({ model, systemPrompt, userPrompt }) {
  return [
    {
      label: 'standard',
      endpoint: CHAT_ENDPOINT,
      body: {
        model,
        temperature: 0.9,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
    },
    {
      label: 'conservative',
      endpoint: CHAT_ENDPOINT,
      body: {
        model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }],
      },
    },
    {
      label: 'minimal',
      endpoint: CHAT_ENDPOINT,
      body: {
        model,
        messages: [{ role: 'user', content: userPrompt }],
      },
    },
    {
      label: 'responses-api',
      endpoint: RESPONSES_ENDPOINT,
      body: {
        model,
        input: `${systemPrompt}\n\n${userPrompt}`,
        max_output_tokens: 2048,
      },
    },
  ];
}

export class AIError extends Error {
  constructor(message, code = 'ai_error', status = null, meta = {}) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.status = status;
    this.detail = meta.detail ?? null;
    this.endpoint = meta.endpoint ?? null;
    this.attempts = meta.attempts ?? [];
    this.modelAvailable = meta.modelAvailable ?? null;
    this.models = meta.models ?? null;
  }

  /** Diagnostics in the shape the client renders and doctor.sh prints. */
  toDiagnostics() {
    return {
      code: this.code,
      status: this.status,
      detail: this.detail,
      endpoint: this.endpoint,
      attempts: this.attempts,
      modelAvailable: this.modelAvailable,
      availableModels: this.models ? this.models.slice(0, 20) : null,
    };
  }
}

/* ------------------------------------------------------------------ *
 *  Public API
 * ------------------------------------------------------------------ */

export async function testArenaConnection(config) {
  const base = String(config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  let res;
  try {
    res = await fetch(`${base}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    throw new AIError(`Could not reach ${base}: ${err.message}`, 'network');
  }
  if (!res.ok) {
    const failure = await readFailure(res);
    throw new AIError(
      failureMessage({ kind: classify(res.status), status: res.status, detail: failure.detail, model: config.model, base }),
      classify(res.status),
      res.status,
      { detail: failure.detail, endpoint: '/models' }
    );
  }
  const data = await res.json().catch(() => ({}));
  const models = Array.isArray(data?.data) ? data.data.map((m) => m?.id).filter(Boolean) : [];
  const model = String(config.model || DEFAULT_MODEL);
  return {
    models: models.slice(0, 25),
    count: models.length,
    model,
    modelAvailable: models.length ? models.includes(model) : null,
  };
}

/**
 * A real composer call — the only honest way to prove that a key may use the
 * arrangement endpoint. Used by Settings and by scripts/doctor.sh.
 */
export async function testComposerConnection(config) {
  const base = String(config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const model = String(config.model || DEFAULT_MODEL);
  const attempts = [];
  let lastFailure = null;

  // Deliberately the *same* ladder the composer uses, so a green probe really
  // predicts that composition will work — just with a tiny prompt.
  const plan = attemptPlan({
    model,
    systemPrompt: 'You are a connectivity check. Reply with the single word OK.',
    userPrompt: 'Reply with the single word OK.',
  });

  for (const step of plan) {
    let res;
    try {
      res = await fetch(`${base}${step.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify(step.body),
        signal: AbortSignal.timeout(30000),
      });
    } catch (err) {
      const aborted = err?.name === 'TimeoutError' || err?.name === 'AbortError';
      attempts.push({ label: step.label, endpoint: step.endpoint, status: null, detail: aborted ? 'timeout' : trimDetail(err.message) });
      lastFailure = { kind: aborted ? 'timeout' : 'network', status: null, detail: trimDetail(err.message), endpoint: step.endpoint };
      break;
    }

    if (res.ok) {
      const data = await res.json().catch(() => null);
      attempts.push({ label: step.label, endpoint: step.endpoint, status: res.status, detail: 'ok' });
      return {
        ok: true,
        endpoint: step.endpoint,
        variant: step.label,
        sample: trimDetail(extractContent(data) || '', 120),
        attempts,
      };
    }

    const failure = await readFailure(res);
    attempts.push({ label: step.label, endpoint: step.endpoint, status: res.status, detail: failure.detail });
    lastFailure = { ...failure, endpoint: step.endpoint };
    if (!RETRYABLE_STATUS.has(res.status)) break;
  }

  throw await buildFailure({ config, model, base, lastFailure, attempts });
}

export async function generateWithArena({ prompt, genre, bpm, keyRoot, scale, config, timeoutMs = 60000 }) {
  const base = String(config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const model = String(config.model || DEFAULT_MODEL);
  const userMessage = userPrompt({ prompt, genre, bpm, keyRoot, scale });
  const plan = attemptPlan({ model, systemPrompt: SYSTEM_PROMPT, userPrompt: userMessage });

  const attempts = [];
  let lastFailure = null;

  for (const step of plan) {
    let res;
    try {
      res = await fetch(`${base}${step.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(step.body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      const aborted = err?.name === 'TimeoutError' || err?.name === 'AbortError';
      const detail = aborted ? 'timeout' : trimDetail(err.message);
      attempts.push({ label: step.label, endpoint: step.endpoint, status: null, detail });
      lastFailure = { kind: aborted ? 'timeout' : 'network', status: null, detail, endpoint: step.endpoint };
      break;
    }

    if (res.ok) {
      const data = await res.json().catch(() => null);
      const content = extractContent(data);
      const parsed = extractJson(content);
      if (!parsed) {
        const detail = trimDetail(content || 'empty response body');
        attempts.push({ label: step.label, endpoint: step.endpoint, status: res.status, detail: `not JSON: ${detail}` });
        lastFailure = { kind: 'parse', status: res.status, detail, endpoint: step.endpoint };
        continue;
      }
      const normalized = normalizeIdeaPayload(parsed);
      if (!normalized.tracks.length) {
        attempts.push({ label: step.label, endpoint: step.endpoint, status: res.status, detail: 'no tracks' });
        lastFailure = { kind: 'empty', status: res.status, detail: 'the model returned no tracks', endpoint: step.endpoint };
        continue;
      }
      normalized.engine = 'arena';
      normalized.model = model;
      return { idea: normalized, attempts, endpoint: step.endpoint, variant: step.label };
    }

    const failure = await readFailure(res);
    attempts.push({ label: step.label, endpoint: step.endpoint, status: res.status, detail: failure.detail });
    lastFailure = { ...failure, endpoint: step.endpoint };
    if (!RETRYABLE_STATUS.has(res.status)) break;
  }

  throw await buildFailure({ config, model, base, lastFailure, attempts });
}

export async function generateIdea({ prompt, genre, bpm, keyRoot, scale, config, preferLocal = false, seed }) {
  if (!preferLocal && config.apiKey) {
    try {
      const result = await generateWithArena({ prompt, genre, bpm, keyRoot, scale, config });
      return {
        idea: result.idea,
        engine: 'arena',
        model: config.model,
        warning: null,
        variant: result.variant,
        attempts: result.attempts,
      };
    } catch (err) {
      const fallback = composeIdea({ prompt, genre, bpm, keyRoot, scale, seed });
      const diagnostics = err instanceof AIError ? err.toDiagnostics() : { code: 'ai_error' };
      return {
        idea: fallback,
        engine: 'local',
        model: null,
        warning: err.message || 'Arena request failed — composed locally instead.',
        diagnostics,
      };
    }
  }
  const idea = composeIdea({ prompt, genre, bpm, keyRoot, scale, seed });
  return {
    idea,
    engine: 'local',
    model: null,
    warning: !preferLocal && !config.apiKey ? 'No Arena key configured — composed locally. Add a key in Settings to use the Arena router.' : null,
    diagnostics: !preferLocal && !config.apiKey ? { code: 'missing_key' } : null,
  };
}
