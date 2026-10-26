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

export async function generateWithArena({ prompt, genre, bpm, keyRoot, scale, config, timeoutMs = 60000 }) {
  const url = `${config.baseUrl}/chat/completions`;
  const body = {
    model: config.model || DEFAULT_MODEL,
    temperature: 0.9,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt({ prompt, genre, bpm, keyRoot, scale }) },
    ],
  };
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const aborted = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    throw new AIError(aborted ? 'Arena request timed out. Try again, or use the local composer.' : `Could not reach Arena: ${err.message}`, 'network');
  }
  if (!res.ok) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson?.error?.message || errJson?.message || '';
    } catch {
      /* ignore */
    }
    const message =
      res.status === 401 || res.status === 403
        ? 'Arena rejected the API key. Check it in Settings → AI engine.'
        : `Arena returned ${res.status}${detail ? `: ${detail}` : ''}.`;
    throw new AIError(message, 'upstream', res.status);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  const text = Array.isArray(content) ? content.map((c) => c?.text || '').join('') : content;
  const parsed = extractJson(text);
  if (!parsed) throw new AIError('Arena returned a response that was not valid JSON. Try again.', 'parse');
  const normalized = normalizeIdeaPayload(parsed);
  if (!normalized.tracks.length) throw new AIError('Arena returned no tracks. Try again with a more specific prompt.', 'empty');
  normalized.engine = 'arena';
  normalized.model = config.model;
  return normalized;
}

export async function testArenaConnection(config) {
  const url = `${config.baseUrl}/models`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.error?.message || '';
    } catch {
      /* ignore */
    }
    throw new AIError(`Arena returned ${res.status}${detail ? `: ${detail}` : ''}.`, 'upstream', res.status);
  }
  const data = await res.json().catch(() => ({}));
  const models = Array.isArray(data?.data) ? data.data.map((m) => m?.id).filter(Boolean) : [];
  return { models: models.slice(0, 25), count: models.length };
}

export class AIError extends Error {
  constructor(message, code = 'ai_error', status = null) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function generateIdea({ prompt, genre, bpm, keyRoot, scale, config, preferLocal = false, seed }) {
  if (!preferLocal && config.apiKey) {
    try {
      const idea = await generateWithArena({ prompt, genre, bpm, keyRoot, scale, config });
      return { idea, engine: 'arena', model: config.model, warning: null };
    } catch (err) {
      const fallback = composeIdea({ prompt, genre, bpm, keyRoot, scale, seed });
      return {
        idea: fallback,
        engine: 'local',
        model: null,
        warning: err.message || 'Arena request failed — composed locally instead.',
      };
    }
  }
  const idea = composeIdea({ prompt, genre, bpm, keyRoot, scale, seed });
  return {
    idea,
    engine: 'local',
    model: null,
    warning: !preferLocal && !config.apiKey ? 'No Arena key configured — composed locally. Add a key in Settings to use the Arena router.' : null,
  };
}
