import type { Bank, Project, SynthParams, Track } from './types';
import { COLORS, DRUM_INSTRUMENTS, clamp } from './music';

/* ------------------------------------------------------------------ *
 *  Helpers
 * ------------------------------------------------------------------ */

const mtof = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
const cutoffHz = (v: number) => clamp(180 * Math.pow(100, clamp(v, 0.02, 1)), 120, 19000);
const envPeak = (vel: number) => Math.max(0.0002, 0.26 * vel);

function setParam(param: AudioParam, value: number, ctx: BaseAudioContext, smooth = 0.015) {
  const now = ctx.currentTime;
  if (smooth > 0) param.setTargetAtTime(value, now, smooth);
  else param.value = value;
}

/* ------------------------------------------------------------------ *
 *  StudioGraph — all routing + sound design, works live or offline
 * ------------------------------------------------------------------ */

interface Channel {
  id: string;
  input: GainNode;
  filter: BiquadFilterNode;
  shaper: WaveShaperNode;
  panner: StereoPannerNode;
  dry: GainNode;
  reverbSend: GainNode;
  delaySend: GainNode;
  analyser: AnalyserNode | null;
}

function makeDriveCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 1024;
  const curve = new Float32Array(n);
  const k = 1 + amount * 12;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.tanh(x * k) / Math.tanh(k);
  }
  return curve;
}

export class StudioGraph {
  ctx: BaseAudioContext;
  project: Project;
  master: GainNode;
  limiter: DynamicsCompressorNode;
  analyser: AnalyserNode | null = null;
  channels = new Map<string, Channel>();
  reverb: ConvolverNode;
  reverbReturn: GainNode;
  delay: DelayNode;
  delayReturn: GainNode;
  delayFeedback: GainNode;
  delayFilter: BiquadFilterNode;
  previewBus: GainNode;
  noiseBuffer: AudioBuffer;
  private signature = '';
  private driveCurves = new Map<number, Float32Array<ArrayBuffer>>();

  constructor(ctx: BaseAudioContext, project: Project, { masterAnalyser = false } = {}) {
    this.ctx = ctx;
    this.project = project;

    this.master = ctx.createGain();
    this.master.gain.value = project.master_gain ?? 0.85;
    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -9;
    this.limiter.knee.value = 12;
    this.limiter.ratio.value = 5;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.24;
    this.master.connect(this.limiter);
    if (masterAnalyser && ctx instanceof AudioContext) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.75;
      this.limiter.connect(this.analyser);
      this.analyser.connect(ctx.destination);
    } else {
      this.limiter.connect(ctx.destination);
    }

    this.noiseBuffer = this.createNoise(2);

    // Reverb bus
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.createImpulse(2.6);
    this.reverbReturn = ctx.createGain();
    this.reverbReturn.gain.value = 0.9;
    this.reverb.connect(this.reverbReturn).connect(this.master);

    // Ping-pong-ish delay bus
    const beat = 60 / (project.bpm || 120);
    this.delay = ctx.createDelay(2);
    this.delay.delayTime.value = Math.min(1.5, beat * 0.75);
    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.value = 0.33;
    this.delayFilter = ctx.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayFilter.frequency.value = 3800;
    this.delayReturn = ctx.createGain();
    this.delayReturn.gain.value = 0.85;
    this.delay.connect(this.delayFilter).connect(this.delayFeedback).connect(this.delay);
    this.delayFilter.connect(this.delayReturn).connect(this.master);

    this.previewBus = ctx.createGain();
    this.previewBus.gain.value = 0.85;
    this.previewBus.connect(this.master);

    this.syncProject(project, true);
  }

  private createNoise(seconds: number) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = 0.98 * last + 0.02 * white;
      data[i] = white * 0.7 + last * 0.3;
    }
    return buffer;
  }

  private createImpulse(seconds: number) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const impulse = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const decay = Math.pow(1 - t, 2.6);
        data[i] = (Math.random() * 2 - 1) * decay * (ch === 0 ? 0.85 : 0.9);
      }
    }
    return impulse;
  }

  private makeChannel(track: Track): Channel {
    const ctx = this.ctx;
    const input = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoffHz(track.filter_cutoff);
    filter.Q.value = 0.6;
    const drive = track.drive ?? 0;
    const shaper = ctx.createWaveShaper();
    shaper.curve = this.getDriveCurve(drive);
    shaper.oversample = '2x';
    const panner = ctx.createStereoPanner();
    panner.pan.value = clamp(track.pan, -1, 1);
    const dry = ctx.createGain();
    dry.gain.value = 1;
    const reverbSend = ctx.createGain();
    reverbSend.gain.value = clamp(track.reverb_send, 0, 1) * 0.9;
    const delaySend = ctx.createGain();
    delaySend.gain.value = clamp(track.delay_send, 0, 1) * 0.8;

    input.connect(filter);
    filter.connect(shaper);
    shaper.connect(panner);
    panner.connect(dry).connect(this.master);
    panner.connect(reverbSend).connect(this.reverb);
    panner.connect(delaySend).connect(this.delay);

    input.gain.value = track.mute ? 0 : clamp(track.volume, 0, 1.5);

    let analyser: AnalyserNode | null = null;
    if (typeof AnalyserNode !== 'undefined' && ctx instanceof AudioContext) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      shaper.connect(analyser);
    }

    return { id: track.id, input, filter, shaper, panner, dry, reverbSend, delaySend, analyser };
  }

  private getDriveCurve(amount: number): Float32Array<ArrayBuffer> {
    const key = Math.round(clamp(amount, 0, 1) * 20) / 20;
    let curve = this.driveCurves.get(key);
    if (!curve) {
      curve = makeDriveCurve(key);
      this.driveCurves.set(key, curve);
    }
    return curve;
  }

  syncProject(project: Project, force = false) {
    this.project = project;
    const tracks = project.tracks || [];
    const signature = tracks.map((t) => t.id).join('|');
    if (force || signature !== this.signature) {
      for (const ch of this.channels.values()) this.disposeChannel(ch);
      this.channels.clear();
      for (const t of tracks) this.channels.set(t.id, this.makeChannel(t));
      this.signature = signature;
    } else {
      const anySolo = tracks.some((t) => t.solo);
      for (const t of tracks) {
        const ch = this.channels.get(t.id);
        if (!ch) continue;
        const audible = !t.mute && (!anySolo || t.solo);
        setParam(ch.input.gain, audible ? clamp(t.volume, 0, 1.5) : 0, this.ctx);
        setParam(ch.panner.pan, clamp(t.pan, -1, 1), this.ctx);
        setParam(ch.filter.frequency, cutoffHz(t.filter_cutoff), this.ctx, 0.03);
        setParam(ch.reverbSend.gain, clamp(t.reverb_send, 0, 1) * 0.9, this.ctx);
        setParam(ch.delaySend.gain, clamp(t.delay_send, 0, 1) * 0.8, this.ctx);
        ch.shaper.curve = this.getDriveCurve(t.drive ?? 0);
        const delayTime = Math.min(1.5, (60 / (project.bpm || 120)) * 0.75);
        setParam(this.delay.delayTime, delayTime, this.ctx, 0.05);
      }
    }
    setParam(this.master.gain, clamp(project.master_gain ?? 0.85, 0, 1.5), this.ctx, 0.02);
    setParam(this.delay.delayTime, Math.min(1.5, (60 / (project.bpm || 120)) * 0.75), this.ctx, 0.05);
  }

  private disposeChannel(ch: Channel) {
    try {
      ch.input.disconnect();
      ch.filter.disconnect();
      ch.shaper.disconnect();
      ch.panner.disconnect();
      ch.dry.disconnect();
      ch.reverbSend.disconnect();
      ch.delaySend.disconnect();
      ch.analyser?.disconnect();
    } catch {
      /* noop */
    }
  }

  levels(): number[] {
    const out: number[] = [];
    for (const t of this.project.tracks || []) {
      const ch = this.channels.get(t.id);
      if (!ch?.analyser) {
        out.push(0);
        continue;
      }
      const arr = new Uint8Array(ch.analyser.frequencyBinCount);
      ch.analyser.getByteTimeDomainData(arr);
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        const v = (arr[i] - 128) / 128;
        sum += v * v;
      }
      out.push(Math.min(1, Math.sqrt(sum / arr.length) * 2.6));
    }
    return out;
  }

  /* -------------------------- voices -------------------------- */

  private noiseSource(time: number, duration: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    src.start(time);
    src.stop(time + duration + 0.05);
    return src;
  }

  private click(time: number, accent = false) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = accent ? 1900 : 1300;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.09 : 0.05, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
    osc.connect(gain).connect(this.previewBus);
    osc.start(time);
    osc.stop(time + 0.06);
  }

  triggerDrum(instrument: string, params: SynthParams, time: number, velocity: number, dest: AudioNode = this.previewBus) {
    const ctx = this.ctx;
    const tune = (params.tune ?? 0) / 12;
    const mult = Math.pow(2, tune);
    const decay = params.decay ?? 0.3;
    const tone = clamp(params.tone ?? 0.5, 0, 1);
    const snap = clamp(params.snap ?? 0.4, 0, 1);
    const vel = clamp(velocity, 0.02, 1.2);

    if (instrument === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const tail = 0.1 + decay * 0.9;
      osc.frequency.setValueAtTime(150 * mult, time);
      osc.frequency.exponentialRampToValueAtTime(44 * mult, time + 0.085);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(vel * (0.9 + tone * 0.4), time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + tail);
      osc.connect(gain).connect(dest);
      osc.start(time);
      osc.stop(time + tail + 0.03);

      if (snap > 0.02) {
        const src = this.noiseSource(time, 0.03);
        const hp = ctx.createBiquadFilter();
        hp.type = 'bandpass';
        hp.frequency.value = 2600;
        hp.Q.value = 0.9;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(vel * snap * 0.35, time);
        ng.gain.exponentialRampToValueAtTime(0.0001, time + 0.028);
        src.connect(hp).connect(ng).connect(dest);
      }
      return;
    }

    if (instrument === 'snare' || instrument === 'clap' || instrument === 'rim') {
      const isClap = instrument === 'clap';
      const isRim = instrument === 'rim';
      const dur = isRim ? 0.06 : isClap ? 0.1 + decay * 0.5 : 0.09 + decay * 0.6;
      const bursts = isClap ? [0, 0.012, 0.024, 0.05] : [0];
      for (const offset of bursts) {
        const src = this.noiseSource(time + offset, dur);
        const bp = ctx.createBiquadFilter();
        bp.type = isRim ? 'bandpass' : 'highpass';
        bp.frequency.value = isRim ? 2200 : isClap ? 900 : 1500;
        bp.Q.value = isRim ? 5 : isClap ? 1.4 : 0.7;
        const g = ctx.createGain();
        const level = vel * (isClap ? 0.4 : isRim ? 0.35 : 0.55) * (0.6 + snap * 0.8);
        g.gain.setValueAtTime(level, time + offset);
        g.gain.exponentialRampToValueAtTime(0.0001, time + offset + dur * (offset > 0 ? 1.4 : 1));
        src.connect(bp).connect(g).connect(dest);
      }
      if (!isRim && !isClap) {
        const body = ctx.createOscillator();
        const bg = ctx.createGain();
        body.type = 'triangle';
        body.frequency.value = 185 * mult * (0.85 + tone * 0.3);
        bg.gain.setValueAtTime(vel * 0.28, time);
        bg.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);
        body.connect(bg).connect(dest);
        body.start(time);
        body.stop(time + 0.14);
      }
      return;
    }

    if (instrument === 'hat' || instrument === 'openhat' || instrument === 'crash') {
      const isOpen = instrument === 'openhat';
      const isCrash = instrument === 'crash';
      const tail = isCrash ? 0.6 + decay * 1.2 : isOpen ? 0.18 + decay * 0.7 : 0.025 + decay * 0.12;
      const src = this.noiseSource(time, tail);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = isCrash ? 5600 : 7200 - tone * 1800;
      const bp = ctx.createBiquadFilter();
      bp.type = 'peaking';
      bp.frequency.value = 9000;
      bp.Q.value = 1.1;
      bp.gain.value = 4;
      const g = ctx.createGain();
      const level = vel * (isCrash ? 0.22 : isOpen ? 0.28 : 0.3) * (0.7 + snap * 0.6);
      g.gain.setValueAtTime(level, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + tail);
      src.connect(hp).connect(bp).connect(g).connect(dest);
      if (isCrash) {
        const metal = ctx.createOscillator();
        const mg = ctx.createGain();
        metal.type = 'square';
        metal.frequency.value = 3100 * mult;
        mg.gain.setValueAtTime(vel * 0.05, time);
        mg.gain.exponentialRampToValueAtTime(0.0001, time + tail * 0.7);
        metal.connect(mg).connect(dest);
        metal.start(time);
        metal.stop(time + tail);
      }
      return;
    }

    if (instrument === 'tom') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const tail = 0.12 + decay * 0.55;
      osc.frequency.setValueAtTime(190 * mult * (0.8 + tone * 0.5), time);
      osc.frequency.exponentialRampToValueAtTime(92 * mult, time + tail * 0.8);
      gain.gain.setValueAtTime(vel * 0.75, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + tail);
      osc.connect(gain).connect(dest);
      osc.start(time);
      osc.stop(time + tail + 0.02);
      return;
    }

    if (instrument === 'cowbell') {
      for (const [freq, level] of [
        [540, 0.22],
        [800, 0.16],
      ] as const) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 900;
        bp.Q.value = 1.6;
        osc.type = 'square';
        osc.frequency.value = freq * mult;
        const tail = 0.06 + decay * 0.5;
        g.gain.setValueAtTime(vel * level * (0.7 + tone * 0.6), time);
        g.gain.exponentialRampToValueAtTime(0.0001, time + tail);
        osc.connect(bp).connect(g).connect(dest);
        osc.start(time);
        osc.stop(time + tail + 0.02);
      }
      return;
    }

    // generic sample / unknown instrument → breathy tone
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 330 * mult;
    g.gain.setValueAtTime(vel * 0.25, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
    osc.connect(g).connect(dest);
    osc.start(time);
    osc.stop(time + 0.35);
  }

  triggerSynth(params: SynthParams, midi: number, time: number, duration: number, velocity: number, dest: AudioNode = this.previewBus) {
    const ctx = this.ctx;
    const wave = String(params.wave || 'sawtooth');
    const attack = Math.max(0.002, params.attack ?? 0.01);
    const decay = Math.max(0.02, params.decay ?? 0.2);
    const sustain = clamp(params.sustain ?? 0.5, 0.01, 1);
    const release = Math.max(0.02, params.release ?? 0.2);
    const detune = (params.detune ?? 0) * 26;
    const cutoff = cutoffHz(params.cutoff ?? 0.5);
    const envAmount = clamp(params.envAmount ?? 0.4, 0, 1);
    const resonance = clamp(params.resonance ?? 0.15, 0, 1);
    const vel = clamp(velocity, 0.02, 1.2);
    const dur = Math.max(0.05, duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = resonance * 16;
    const peakCut = clamp(cutoff * (1 + envAmount * 6), 200, 19000);
    filter.frequency.setValueAtTime(peakCut, time);
    filter.frequency.exponentialRampToValueAtTime(clamp(cutoff, 120, 19000), time + Math.max(0.05, Math.min(1.2, decay * 2.2)));

    const amp = ctx.createGain();
    const peak = envPeak(vel);
    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(peak, time + attack);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * sustain), time + attack + decay);
    amp.gain.setValueAtTime(Math.max(0.0001, peak * sustain), time + Math.max(attack + decay, dur));
    amp.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(attack + decay, dur) + release);

    filter.connect(amp).connect(dest);

    const freq = mtof(midi);
    const oscCount = wave === 'fatsaw' ? 3 : wave === 'pulse' ? 2 : 1;
    const type = wave === 'fatsaw' ? 'sawtooth' : wave === 'pulse' ? 'square' : (wave as OscillatorType);
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < oscCount; i++) {
      const osc = ctx.createOscillator();
      osc.type = type;
      const spread = oscCount === 1 ? 0 : (i - (oscCount - 1) / 2) * detune;
      osc.detune.setValueAtTime(spread, time);
      osc.frequency.setValueAtTime(freq, time);
      const g = ctx.createGain();
      g.gain.value = 1 / Math.sqrt(oscCount);
      osc.connect(g).connect(filter);
      osc.start(time);
      osc.stop(time + Math.max(attack + decay, dur) + release + 0.05);
      oscs.push(osc);
    }

    const subAmt = clamp(params.sub ?? 0, 0, 1);
    if (subAmt > 0.01) {
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.value = freq / 2;
      const sg = ctx.createGain();
      sg.gain.value = subAmt * 0.7;
      sub.connect(sg).connect(filter);
      sub.start(time);
      sub.stop(time + Math.max(attack + decay, dur) + release + 0.05);
      oscs.push(sub);
    }

    if (params.glide && params.glide > 0.01 && midi > 30) {
      for (const osc of oscs) {
        osc.frequency.setValueAtTime(mtof(midi - 2), time);
        osc.frequency.exponentialRampToValueAtTime(freq, time + Math.max(0.03, params.glide * 0.25));
      }
    }
  }

  triggerTrack(track: Track, midi: number, time: number, duration: number, velocity: number) {
    const ch = this.channels.get(track.id);
    const dest = ch?.input ?? this.previewBus;
    if (track.kind === 'drum' || track.kind === 'sample') this.triggerDrum(track.instrument, track.synth, time, velocity, dest);
    else this.triggerSynth(track.synth, midi, time, duration, velocity, dest);
  }

  /** Schedules every event for one 16th step. */
  scheduleStep(bank: Bank, step: number, stepTime: number, stepDuration: number, { metronome = false } = {}) {
    const tracks = this.project.tracks || [];
    const anySolo = tracks.some((t) => t.solo);
    if (metronome && step % 4 === 0) this.click(stepTime, step === 0);
    for (const track of tracks) {
      if (track.mute || (anySolo && !track.solo)) continue;
      if (track.kind === 'synth') {
        const notes = track.notes?.[bank] || [];
        for (const n of notes) {
          if (n.step !== step) continue;
          const dur = Math.max(0.04, (n.len || 1) * stepDuration * 0.94);
          this.triggerSynth(track.synth, n.pitch, stepTime, dur, n.vel ?? 0.8, this.channels.get(track.id)?.input ?? this.previewBus);
        }
      } else {
        const cells = track.patterns?.[bank] || [];
        const cell = cells[step];
        if (!cell?.on) continue;
        if ((cell.prob ?? 1) < Math.random()) continue;
        const vel = (cell.vel ?? 0.8) * (1 + (cell.pitch ?? 0) * 0);
        const offset = (cell.pitch ?? 0) / 48;
        this.triggerDrum(track.instrument, track.synth, stepTime + Math.max(0, offset) * stepDuration * 0.1, vel, this.channels.get(track.id)?.input ?? this.previewBus);
      }
    }
  }

  previewTrack(track: Track, midi = 60) {
    if (track.kind === 'synth') this.triggerSynth(track.synth, midi, this.ctx.currentTime + 0.01, 0.55, 0.9, this.previewBus);
    else this.triggerDrum(track.instrument, track.synth, this.ctx.currentTime + 0.01, 0.9, this.previewBus);
  }

  previewPreset(instrument: string, params: SynthParams, midi = 57) {
    const now = this.ctx.currentTime + 0.02;
    if (DRUM_INSTRUMENTS.includes(instrument)) this.triggerDrum(instrument, params, now, 0.9, this.previewBus);
    else {
      this.triggerSynth(params, midi, now, 0.9, 0.8, this.previewBus);
      this.triggerSynth(params, midi + 7, now + 0.1, 0.7, 0.6, this.previewBus);
      this.triggerSynth(params, midi + 12, now + 0.22, 0.9, 0.55, this.previewBus);
    }
  }

  dispose() {
    for (const ch of this.channels.values()) this.disposeChannel(ch);
    this.channels.clear();
    try {
      this.master.disconnect();
      this.limiter.disconnect();
      this.reverb.disconnect();
      this.reverbReturn.disconnect();
      this.delay.disconnect();
      this.delayFilter.disconnect();
      this.delayFeedback.disconnect();
      this.delayReturn.disconnect();
      this.previewBus.disconnect();
      this.analyser?.disconnect();
    } catch {
      /* noop */
    }
  }
}

/* ------------------------------------------------------------------ *
 *  Live transport
 * ------------------------------------------------------------------ */

export type Position = { step: number; sectionIndex: number; repeat: number; bank: Bank; playing: boolean };

const emptyProject = (): Project => ({
  id: 'empty',
  title: 'Empty',
  genre: 'Electronic',
  bpm: 120,
  key_root: 0,
  scale: 'minor',
  description: '',
  sections: [],
  arrangement: [],
  status: 'sketch',
  favorite: false,
  cover: {},
  swing: 0,
  master_gain: 0.85,
  ai_notes: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  duration: 0,
  tracks: [],
});

export class AudioEngine {
  ctx: AudioContext | null = null;
  graph: StudioGraph | null = null;
  project: Project = emptyProject();
  playing = false;
  mode: 'song' | 'pattern' = 'song';
  bank: Bank = 'A';
  loop = true;
  metronome = false;
  position: Position = { step: 0, sectionIndex: 0, repeat: 0, bank: 'A', playing: false };
  onPosition: ((pos: Position) => void) | null = null;

  private timer: number | null = null;
  private raf: number | null = null;
  private nextStepTime = 0;
  private uiQueue: { time: number; step: number; sectionIndex: number; repeat: number; bank: Bank }[] = [];
  private lookahead = 0.14;

  private unlocked = false;

  ensureCtx(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.graph = new StudioGraph(this.ctx, this.project, { masterAnalyser: true });
      this.graph.ctx = this.ctx;
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden && this.ctx?.state === 'suspended') void this.ctx.resume();
        });
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /**
   * iOS/Safari only starts audio inside a real user gesture, and the hardware
   * mute switch silences a context that was never "unlocked" through a media
   * element. Playing a one-sample silent buffer plus a muted looping element
   * once fixes both — after that every sequencer hit is audible.
   */
  unlock() {
    if (this.unlocked) return;
    try {
      const ctx = this.ensureCtx();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      if (!document.getElementById('pulsar-silent-unlock')) {
        const el = document.createElement('audio');
        el.id = 'pulsar-silent-unlock';
        el.setAttribute('playsinline', 'true');
        el.loop = true;
        el.volume = 0.0001;
        el.src =
          'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        document.body.appendChild(el);
        void el.play().catch(() => {});
      }
      void ctx.resume();
      this.unlocked = true;
    } catch {
      /* audio will still work on the first play gesture */
    }
  }

  setProject(project: Project) {
    this.project = project;
    if (this.graph) this.graph.syncProject(project);
  }

  setMode(mode: 'song' | 'pattern') {
    this.mode = mode;
    if (mode === 'pattern') {
      this.bank = this.position.bank;
    }
  }

  setBank(bank: Bank) {
    this.bank = bank;
    if (!this.playing) {
      this.position = { ...this.position, bank };
      this.emit();
    }
  }

  setLoop(loop: boolean) {
    this.loop = loop;
  }

  setMetronome(on: boolean) {
    this.metronome = on;
  }

  setSwing(_swing: number) {
    /* read live from project.swing */
  }

  get stepDuration() {
    return 60 / (this.project.bpm || 120) / 4;
  }

  private effectiveStepTime(step: number) {
    const swing = clamp(this.project.swing || 0, 0, 60) / 100;
    return step % 2 === 1 ? this.stepDuration * swing * 0.5 : 0;
  }

  play() {
    const ctx = this.ensureCtx();
    if (this.playing) return;
    this.playing = true;
    const arrangement = (this.project.arrangement?.length ? this.project.arrangement : [{ bank: 'A', repeats: 2 }]) as { bank: Bank; repeats: number }[];
    if (this.mode === 'song') {
      if (this.position.sectionIndex >= arrangement.length) this.position = { ...this.position, sectionIndex: 0, step: 0, repeat: 0 };
      this.position.bank = arrangement[this.position.sectionIndex]?.bank || 'A';
    } else {
      this.position.bank = this.bank;
    }
    this.position.playing = true;
    this.uiQueue = [];
    this.emit();
    this.nextStepTime = ctx.currentTime + 0.06;
    this.timer = window.setInterval(() => this.tick(), 25);
    this.raf = window.requestAnimationFrame(() => this.publish());
    this.tick();
  }

  pause() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    if (this.raf) window.cancelAnimationFrame(this.raf);
    this.raf = null;
    this.playing = false;
    this.position.playing = false;
    this.emit();
  }

  stop() {
    this.pause();
    this.uiQueue = [];
    this.position = { step: 0, sectionIndex: 0, repeat: 0, bank: this.mode === 'pattern' ? this.bank : 'A', playing: false };
    this.emit();
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  private emit() {
    this.onPosition?.({ ...this.position });
  }

  private tick() {
    if (!this.ctx || !this.playing) return;
    while (this.nextStepTime < this.ctx.currentTime + this.lookahead) {
      this.scheduleStep(this.nextStepTime);
      this.nextStepTime += this.stepDuration + this.effectiveStepTime(this.position.step);
      this.advance();
      if (!this.playing) break;
    }
  }

  private scheduleStep(time: number) {
    const arrangement = (this.project.arrangement?.length ? this.project.arrangement : [{ bank: 'A', repeats: 2 }]) as { bank: Bank; repeats: number }[];
    const section = arrangement[this.position.sectionIndex];
    const bank: Bank = this.mode === 'pattern' ? this.bank : section?.bank || 'A';
    this.graph?.scheduleStep(bank, this.position.step, time, this.stepDuration, { metronome: this.metronome });
    this.uiQueue.push({
      time,
      step: this.position.step,
      sectionIndex: this.position.sectionIndex,
      repeat: this.position.repeat,
      bank,
    });
  }

  private advance() {
    const arrangement = (this.project.arrangement?.length ? this.project.arrangement : [{ bank: 'A', repeats: 2 }]) as { bank: Bank; repeats: number }[];
    if (this.mode === 'pattern') {
      this.position.step = (this.position.step + 1) % 32;
      return;
    }
    this.position.step += 1;
    if (this.position.step < 32) return;
    this.position.step = 0;
    this.position.repeat += 1;
    const repeats = arrangement[this.position.sectionIndex]?.repeats || 1;
    if (this.position.repeat < repeats) return;
    this.position.repeat = 0;
    this.position.sectionIndex += 1;
    if (this.position.sectionIndex >= arrangement.length) {
      if (this.loop) this.position.sectionIndex = 0;
      else {
        this.position.sectionIndex = arrangement.length - 1;
        this.position.step = 31;
        window.setTimeout(() => this.stop(), Math.max(50, (this.stepDuration * 2) * 1000));
        this.playing = false;
      }
    }
  }

  private publish() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    let latest: (typeof this.uiQueue)[number] | null = null;
    while (this.uiQueue.length && this.uiQueue[0].time <= now + 0.02) {
      latest = this.uiQueue.shift() || null;
    }
    if (latest) {
      this.position.step = latest.step;
      this.position.sectionIndex = latest.sectionIndex;
      this.position.repeat = latest.repeat;
      this.position.bank = latest.bank;
      this.emit();
    }
    if (this.playing) this.raf = window.requestAnimationFrame(() => this.publish());
  }

  jumpToSection(index: number) {
    const arrangement = this.project.arrangement || [];
    if (!arrangement[index]) return;
    this.position.sectionIndex = index;
    this.position.repeat = 0;
    this.position.step = 0;
    this.position.bank = arrangement[index].bank;
    this.uiQueue = [];
    if (this.ctx && this.playing) this.nextStepTime = this.ctx.currentTime + 0.04;
    this.emit();
  }

  /** Short audition of a single instrument, used across the UI. */
  preview(instrument: string, params: SynthParams, midi = 60) {
    this.ensureCtx();
    this.graph?.previewPreset(instrument, params, midi);
  }

  previewTrack(track: Track, midi = 60) {
    this.ensureCtx();
    this.graph?.previewTrack(track, midi);
  }

  previewPreset(instrument: string, params: SynthParams, midi = 57) {
    this.ensureCtx();
    this.graph?.previewPreset(instrument, params, midi);
  }

  levels(): number[] {
    return this.graph?.levels() ?? [];
  }

  get masterLevel(): number {
    if (!this.graph?.analyser) return 0;
    const arr = new Uint8Array(this.graph.analyser.frequencyBinCount);
    this.graph.analyser.getByteTimeDomainData(arr);
    let peak = 0;
    for (let i = 0; i < arr.length; i++) peak = Math.max(peak, Math.abs((arr[i] - 128) / 128));
    return peak;
  }

  getWaveform(): Uint8Array | null {
    if (!this.graph?.analyser) return null;
    const arr = new Uint8Array(this.graph.analyser.frequencyBinCount);
    this.graph.analyser.getByteTimeDomainData(arr);
    return arr;
  }

  getSpectrum(): Uint8Array | null {
    if (!this.graph?.analyser) return null;
    const arr = new Uint8Array(this.graph.analyser.frequencyBinCount);
    this.graph.analyser.getByteFrequencyData(arr);
    return arr;
  }
}

export const engine = new AudioEngine();

/* ------------------------------------------------------------------ *
 *  Offline render → WAV
 * ------------------------------------------------------------------ */

export async function renderProjectToWav(project: Project, maxSeconds = 70): Promise<Blob> {
  const arrangement = project.arrangement?.length ? project.arrangement : [{ bank: 'A' as Bank, repeats: 1 }];
  const stepDur = 60 / (project.bpm || 120) / 4;
  const totalSteps = arrangement.reduce((acc, s) => acc + 32 * (s.repeats || 1), 0);
  const duration = Math.min(maxSeconds, Math.max(2, totalSteps * stepDur + 3));
  const sampleRate = 44100;
  const offline = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
  const graph = new StudioGraph(offline, project);

  let time = 0.12;
  for (const section of arrangement) {
    for (let rep = 0; rep < (section.repeats || 1); rep++) {
      for (let step = 0; step < 32; step++) {
        const swing = clamp(project.swing || 0, 0, 60) / 100;
        const offset = step % 2 === 1 ? stepDur * swing * 0.5 : 0;
        graph.scheduleStep(section.bank, step, time + offset, stepDur);
        time += stepDur;
        if (time > duration - 1) break;
      }
      if (time > duration - 1) break;
    }
    if (time > duration - 1) break;
  }

  const buffer = await offline.startRendering();
  return encodeWav(buffer);
}

function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

  const out = new DataView(new ArrayBuffer(44 + dataSize));
  new Uint8Array(out.buffer).set(new Uint8Array(header), 0);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = clamp(channels[c][i], -1, 1);
      out.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([out.buffer], { type: 'audio/wav' });
}

export const TRACK_COLOR_FALLBACK = COLORS.acid;
