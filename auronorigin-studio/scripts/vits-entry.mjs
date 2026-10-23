import * as ort from 'onnxruntime-web';
import { createPiperPhonemize } from '../node_modules/@diffusionstudio/vits-web/dist/piper-DeOu3H9E.js';

const HF_BASE = 'https://huggingface.co/diffusionstudio/piper-voices/resolve/main';
const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize';

const VOICE_PATHS = {
  'de_DE-thorsten-medium': 'de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx',
  'de_DE-thorsten-high': 'de/de_DE/thorsten/high/de_DE-thorsten-high.onnx',
  'de_DE-thorsten_emotional-medium': 'de/de_DE/thorsten_emotional/medium/de_DE-thorsten_emotional-medium.onnx',
  'de_DE-mls-medium': 'de/de_DE/mls/medium/de_DE-mls-medium.onnx',
  'de_DE-pavoque-low': 'de/de_DE/pavoque/low/de_DE-pavoque-low.onnx',
  'de_DE-kerstin-low': 'de/de_DE/kerstin/low/de_DE-kerstin-low.onnx',
  'de_DE-ramona-low': 'de/de_DE/ramona/low/de_DE-ramona-low.onnx',
};

const memBlobCache = new Map();
const sessionCache = new Map();
const configCache = new Map();

async function opfsRead(url) {
  if (memBlobCache.has(url)) return memBlobCache.get(url);
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle('auron_piper', { create: true });
    const name = url.split('/').pop();
    const fh = await dir.getFileHandle(name);
    const file = await fh.getFile();
    memBlobCache.set(url, file);
    return file;
  } catch {
    return null;
  }
}

async function opfsWrite(url, blob) {
  memBlobCache.set(url, blob);
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle('auron_piper', { create: true });
    const name = url.split('/').pop();
    const fh = await dir.getFileHandle(name, { create: true });
    const writable = await fh.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch {
    // Fallback to in-memory cache (safe inside cross-origin preview iframes)
  }
}

async function fetchWithProgress(url, onProgress) {
  const cached = await opfsRead(url);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Modell-Download fehlgeschlagen (${res.status}): ${url}`);
  const reader = res.body?.getReader();
  const total = Number(res.headers.get('Content-Length') || 0);
  if (!reader) {
    const blob = await res.blob();
    await opfsWrite(url, blob);
    return blob;
  }
  let loaded = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (onProgress) onProgress({ url, total, loaded });
  }
  const blob = new Blob(chunks, { type: res.headers.get('Content-Type') || 'application/octet-stream' });
  await opfsWrite(url, blob);
  return blob;
}

function float32ToWavBuffer(samples, numChannels, sampleRate) {
  const length = samples.length;
  const headerSize = 44;
  const view = new DataView(new ArrayBuffer(length * numChannels * 2 + headerSize));
  view.setUint32(0, 0x46464952, true); // RIFF
  view.setUint32(4, view.buffer.byteLength - 8, true);
  view.setUint32(8, 0x45564157, true); // WAVE
  view.setUint32(12, 0x20746d66, true); // fmt
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, numChannels * 2 * sampleRate, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x61746164, true); // data
  view.setUint32(40, length * 2, true);
  let offset = headerSize;
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return view.buffer;
}

export async function synthesizeBrowserNeural({ text, voiceId = 'de_DE-thorsten-medium', lengthScaleOverride = null }, onProgress) {
  const relPath = VOICE_PATHS[voiceId] || VOICE_PATHS['de_DE-thorsten-medium'];
  ort.env.allowLocalModels = false;
  ort.env.wasm.numThreads = window.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;
  ort.env.wasm.wasmPaths = new URL('/vendor-ort/', window.location.origin).href;

  let cfg = configCache.get(voiceId);
  if (!cfg) {
    const cfgBlob = await fetchWithProgress(`${HF_BASE}/${relPath}.json`);
    cfg = JSON.parse(await cfgBlob.text());
    configCache.set(voiceId, cfg);
  }

  let session = sessionCache.get(voiceId);
  if (!session) {
    const modelBlob = await fetchWithProgress(`${HF_BASE}/${relPath}`, onProgress);
    const modelBuf = await modelBlob.arrayBuffer();
    session = await ort.InferenceSession.create(modelBuf, { executionProviders: ['wasm'] });
    sessionCache.set(voiceId, session);
  }

  const inputPayload = JSON.stringify([{ text: text.trim() }]);
  const phonemeIds = await new Promise(async (resolve, reject) => {
    try {
      const mod = await createPiperPhonemize({
        print: (out) => {
          try {
            resolve(JSON.parse(out).phoneme_ids);
          } catch (err) {
            reject(err);
          }
        },
        printErr: (msg) => {
          console.warn('[PiperPhonemize]', msg);
        },
        locateFile: (file) =>
          file.endsWith('.wasm') ? `${WASM_BASE}.wasm` : file.endsWith('.data') ? `${WASM_BASE}.data` : file,
      });
      mod.callMain(['-l', cfg.espeak.voice, '--input', inputPayload, '--espeak_data', '/espeak-ng-data']);
    } catch (err) {
      reject(err);
    }
  });

  const sampleRate = cfg.audio.sample_rate;
  const noiseScale = cfg.inference.noise_scale;
  const lengthScale = lengthScaleOverride ?? (cfg.inference.length_scale * 1.12); // Calm Auron cadence!
  const noiseW = cfg.inference.noise_w;

  const feeds = {
    input: new ort.Tensor('int64', BigInt64Array.from(phonemeIds.map((x) => BigInt(x))), [1, phonemeIds.length]),
    input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(phonemeIds.length)]), [1]),
    scales: new ort.Tensor('float32', Float32Array.from([noiseScale, lengthScale, noiseW]), [3]),
  };
  if (cfg.speaker_id_map && Object.keys(cfg.speaker_id_map).length > 0) {
    feeds.sid = new ort.Tensor('int64', BigInt64Array.from([0n]), [1]);
  }

  const results = await session.run(feeds);
  const pcm = results.output.data;
  const wavBuf = float32ToWavBuffer(pcm, 1, sampleRate);
  return new Blob([wavBuf], { type: 'audio/wav' });
}

window.AuronBrowserTTS = { synthesizeBrowserNeural, VOICE_PATHS };
