from __future__ import annotations

import asyncio
import math
import shutil
import subprocess
import wave
from pathlib import Path
from typing import Any

import imageio_ffmpeg
import numpy as np
import requests
from scipy.io import wavfile

from .config import BRAND_IDENTITY


def get_ffmpeg_bin() -> str:
    sys_ff = shutil.which("ffmpeg")
    if sys_ff:
        return sys_ff
    return imageio_ffmpeg.get_ffmpeg_exe()


FFMPEG_BIN = get_ffmpeg_bin()
SAMPLE_RATE = 48000


def get_wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        return frames / float(rate) if rate else 0.0


def _convert_to_standard_wav(src: Path, dst: Path, apply_reverb: bool = True) -> None:
    """Convert any audio file (MP3/WAV/OGG) into 48 kHz 16-bit stereo WAV with AuronOrigin mastering."""
    filters = [
        "highpass=f=70",
        "acompressor=threshold=-19dB:ratio=2.5:attack=10:release=160:makeup=2dB",
    ]
    if apply_reverb:
        # Exact AuronOrigin subtle cosmic hall signature from generate_perfect_audio.py
        filters.append("aecho=0.8:0.88:60:0.28")
    filters.append("alimiter=limit=0.93")
    af_chain = ",".join(filters)

    cmd = [
        FFMPEG_BIN,
        "-y",
        "-i",
        str(src),
        "-af",
        af_chain,
        "-ar",
        str(SAMPLE_RATE),
        "-ac",
        "2",
        "-c:a",
        "pcm_s16le",
        str(dst),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


async def _edge_tts_save(text: str, out_mp3: Path, voice: str, rate_pct: int, pitch_hz: int) -> None:
    import edge_tts

    rate_str = f"{rate_pct:+d}%"
    pitch_str = f"{pitch_hz:+d}Hz"
    comm = edge_tts.Communicate(text, voice=voice, rate=rate_str, pitch=pitch_str)
    await comm.save(str(out_mp3))


def _try_edge_tts(text: str, out_mp3: Path, voice: str, rate_pct: int, pitch_hz: int) -> bool:
    try:
        asyncio.run(_edge_tts_save(text, out_mp3, voice, rate_pct, pitch_hz))
        return out_mp3.exists() and out_mp3.stat().st_size > 512
    except Exception:
        return False


def _try_elevenlabs_tts(text: str, out_mp3: Path, api_key: str, voice_id: str) -> bool:
    if not api_key or not voice_id:
        return False
    try:
        resp = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": api_key.strip(),
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            json={
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.62, "similarity_boost": 0.80, "style": 0.25},
            },
            timeout=35,
        )
        if resp.status_code == 200 and len(resp.content) > 512:
            out_mp3.write_bytes(resp.content)
            return True
    except Exception:
        pass
    return False


def _try_openai_tts(text: str, out_mp3: Path, api_key: str) -> bool:
    if not api_key:
        return False
    try:
        resp = requests.post(
            "https://api.openai.com/v1/audio/speech",
            headers={
                "Authorization": f"Bearer {api_key.strip()}",
                "Content-Type": "application/json",
            },
            json={
                "model": "tts-1-hd",
                "voice": "onyx",
                "input": text,
                "speed": 0.90,
            },
            timeout=35,
        )
        if resp.status_code == 200 and len(resp.content) > 512:
            out_mp3.write_bytes(resp.content)
            return True
    except Exception:
        pass
    return False


def _synthesize_offline_baritone_cadence(text: str, out_wav: Path, rate_pct: int = -15) -> None:
    """Offline acoustic speech-cadence fallback when neither internet TTS nor browser WAVs are present.

    Produces syllable-timed baritone formant vocalizations with realistic speaking duration (~125 WPM)
    so headless offline render tests always generate valid multi-stream timing and waveforms.
    """
    words = [w for w in text.strip().split() if w]
    speed_factor = max(0.72, 1.0 + (rate_pct / 100.0))
    # ~2.2 words/sec at -15% AuronOrigin narration tempo
    est_seconds = max(2.4, (len(words) / (2.45 * speed_factor)) + 0.35)
    n_samples = int(est_seconds * SAMPLE_RATE)
    t = np.linspace(0.0, est_seconds, n_samples, endpoint=False, dtype=np.float32)

    # Syllable envelope from character groups
    n_syllables = max(4, sum(max(1, len(w) // 3) for w in words))
    env = np.zeros_like(t)
    cursor = 0.08
    avg_step = (est_seconds - 0.22) / n_syllables

    rng = np.random.default_rng(abs(hash(text)) % (2**31 - 1))
    f0_curve = np.full_like(t, 98.0)

    for i in range(n_syllables):
        dur = avg_step * float(rng.uniform(0.68, 0.92))
        s_idx = int(cursor * SAMPLE_RATE)
        e_idx = min(n_samples, int((cursor + dur) * SAMPLE_RATE))
        if e_idx > s_idx:
            seg_len = e_idx - s_idx
            win = np.maximum(0.0, np.sin(np.linspace(0, math.pi, seg_len, dtype=np.float32))) ** 0.65
            env[s_idx:e_idx] = win * float(rng.uniform(0.75, 1.0))
            # Natural downward sentence prosody
            pitch = 104.0 - 14.0 * (i / max(1, n_syllables - 1)) + float(rng.uniform(-4.0, 4.0))
            f0_curve[s_idx:e_idx] = pitch
        cursor += avg_step

    phase = 2.0 * np.pi * np.cumsum(f0_curve) / SAMPLE_RATE
    # Baritone glottal harmonics + vowel formants (~500 Hz, ~1400 Hz)
    glottal = (
        0.55 * np.sin(phase)
        + 0.30 * np.sin(2.0 * phase + 0.3)
        + 0.18 * np.sin(3.0 * phase + 0.7)
        + 0.11 * np.sin(5.0 * phase)
        + 0.06 * np.sin(11.0 * phase)
    )
    breath = rng.normal(0.0, 0.025, size=n_samples).astype(np.float32)
    signal = (glottal + breath) * env * 0.42

    stereo = np.column_stack([signal, signal])
    pcm16 = np.clip(stereo * 32767.0, -32768, 32767).astype(np.int16)
    wavfile.write(str(out_wav), SAMPLE_RATE, pcm16)


def generate_procedural_music(preset: str, duration_sec: float, out_wav: Path) -> Path:
    """Generate procedural 60 BPM AuronOrigin dark ambient music in 48 kHz stereo."""
    dur = max(5.0, float(duration_sec))
    n = int(dur * SAMPLE_RATE)
    t = np.linspace(0.0, dur, n, endpoint=False, dtype=np.float32)

    if preset == "quantum_pulse":
        # 60 BPM cosmic synth pulse in D minor (D2=73.42Hz, A2=110Hz, F3=174.61Hz)
        sub = 0.36 * np.sin(2 * np.pi * 73.42 * t)
        fifth = 0.20 * np.sin(2 * np.pi * 110.0 * t + 0.4 * np.sin(2 * np.pi * 0.18 * t))
        pad_l = 0.15 * np.sin(2 * np.pi * 146.83 * t + np.sin(2 * np.pi * 0.07 * t))
        pad_r = 0.15 * np.sin(2 * np.pi * 147.15 * t + np.cos(2 * np.pi * 0.09 * t))
        # Subtle 1 Hz (60 BPM) rhythmic pulse + 2 Hz arpeggio shimmer
        beat_env = (0.5 + 0.5 * np.cos(2 * np.pi * 1.0 * t)) ** 3.0
        pulse = 0.16 * beat_env * np.sin(2 * np.pi * 220.0 * t)
        shimmer = 0.06 * ((0.5 + 0.5 * np.sin(2 * np.pi * 2.0 * t)) ** 4.0) * np.sin(2 * np.pi * 440.0 * t)
        left = sub + fifth + pad_l + pulse + shimmer
        right = sub + fifth + pad_r + pulse + shimmer * 0.85
    else:
        # 'temple_drone_432': Sacred 432 Hz / 108 Hz / 54 Hz deep temple resonance
        sub = 0.40 * np.sin(2 * np.pi * 54.0 * t)
        root = 0.24 * np.sin(2 * np.pi * 108.0 * t + 0.35 * np.sin(2 * np.pi * 0.05 * t))
        fifth_l = 0.16 * np.sin(2 * np.pi * 162.0 * t + 0.25 * np.sin(2 * np.pi * 0.08 * t))
        fifth_r = 0.16 * np.sin(2 * np.pi * 162.35 * t + 0.25 * np.cos(2 * np.pi * 0.07 * t))
        halo = 0.07 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t)) * np.sin(2 * np.pi * 432.0 * t)
        heartbeat = 0.12 * ((0.5 + 0.5 * np.cos(2 * np.pi * 1.0 * t)) ** 6.0) * np.sin(2 * np.pi * 64.0 * t)
        left = sub + root + fifth_l + halo + heartbeat
        right = sub + root + fifth_r + halo * 0.9 + heartbeat

    # Smooth fade-in (1.2s) and fade-out (2.0s)
    fade_in = min(n // 3, int(1.2 * SAMPLE_RATE))
    fade_out = min(n // 3, int(2.0 * SAMPLE_RATE))
    env = np.ones(n, dtype=np.float32)
    if fade_in > 0:
        env[:fade_in] = np.linspace(0.0, 1.0, fade_in, dtype=np.float32)
    if fade_out > 0:
        env[-fade_out:] = np.linspace(1.0, 0.0, fade_out, dtype=np.float32)

    stereo = np.column_stack([left * env, right * env]) * 0.65
    pcm16 = np.clip(stereo * 32767.0, -32768, 32767).astype(np.int16)
    wavfile.write(str(out_wav), SAMPLE_RATE, pcm16)
    return out_wav


def _make_glitch_whoosh_sfx(duration_sec: float = 0.26) -> np.ndarray:
    """Create a subtle cinematic sub-whoosh + digital crystal glitch transition sound."""
    n = int(duration_sec * SAMPLE_RATE)
    t = np.linspace(0.0, duration_sec, n, endpoint=False, dtype=np.float32)
    rng = np.random.default_rng(1337)
    # Frequency sweep 180 Hz -> 52 Hz
    sweep_phase = 2 * np.pi * np.cumsum(np.linspace(190.0, 52.0, n, dtype=np.float32)) / SAMPLE_RATE
    sub_whoosh = 0.55 * np.sin(sweep_phase)
    # Brief digital granular burst
    burst = rng.normal(0.0, 0.18, size=n).astype(np.float32) * (np.sin(2 * np.pi * 48.0 * t) > 0.2)
    env = np.maximum(0.0, np.sin(np.linspace(0, math.pi, n, dtype=np.float32))) ** 1.4
    mono = (sub_whoosh + burst) * env * 0.18
    return np.column_stack([mono, mono * 0.92])


def build_master_audio_timeline(
    *,
    scenes: list[dict[str, Any]],
    work_dir: Path,
    settings: dict[str, Any],
    uploaded_scene_audio: dict[int, Path] | None = None,
    custom_music_path: Path | None = None,
    progress_cb: Any = None,
) -> dict[str, Any]:
    """Synthesize per-scene voiceovers, record exact timings, duck background music, and mix master WAV."""
    work_dir.mkdir(parents=True, exist_ok=True)
    uploaded_map = uploaded_scene_audio or {}

    tts_engine = str(settings.get("tts_engine") or "auto")
    edge_voice = str(settings.get("edge_voice") or "de-DE-ConradNeural")
    rate_pct = int(settings.get("voice_rate_pct", -15))
    pitch_hz = int(settings.get("voice_pitch_hz", -3))
    apply_reverb = bool(settings.get("voice_reverb", True))
    music_preset = str(settings.get("music_preset") or "glitch_horizon")
    music_vol_db = float(settings.get("music_volume_db", -17.0))
    include_glitch_sfx = bool(settings.get("include_glitch_sfx", True))

    lead_in_sec = 0.45
    tail_out_sec = 0.75

    scene_timings: list[dict[str, Any]] = []
    voice_segments_pcm: list[np.ndarray] = []
    voice_activity_intervals: list[tuple[float, float]] = []
    transition_timestamps: list[float] = []

    # Initial 0.45s atmospheric lead-in before voice begins
    lead_samples = int(lead_in_sec * SAMPLE_RATE)
    voice_segments_pcm.append(np.zeros((lead_samples, 2), dtype=np.float32))
    cursor_sec = lead_in_sec
    used_tts_engines: set[str] = set()
    edge_tts_available = True

    total_scenes = len(scenes)
    for idx, sc in enumerate(scenes):
        scene_num = idx + 1
        text = str(sc.get("narration") or "").strip()
        pause_after = float(sc.get("pause_after", 0.85))
        if progress_cb:
            progress_cb(
                int(10 + (idx / max(1, total_scenes)) * 30),
                f"Synthetisiere Tonstimme für Szene {scene_num}/{total_scenes}…",
            )

        raw_audio_path = work_dir / f"scene_{scene_num:02d}_raw"
        std_wav_path = work_dir / f"scene_{scene_num:02d}_voice.wav"
        engine_used = "offline_cadence"

        # Priority 1: Pre-synthesized Browser Neural VITS WAV uploaded by client
        if scene_num in uploaded_map and uploaded_map[scene_num].exists():
            _convert_to_standard_wav(uploaded_map[scene_num], std_wav_path, apply_reverb=apply_reverb)
            engine_used = "browser_neural_vits"
        else:
            # Priority 2: Configured server TTS (ElevenLabs / OpenAI / Edge-TTS ConradNeural)
            ok = False
            mp3_candidate = raw_audio_path.with_suffix(".mp3")
            if tts_engine == "elevenlabs" or (tts_engine == "auto" and settings.get("elevenlabs_api_key") and settings.get("elevenlabs_voice_id")):
                ok = _try_elevenlabs_tts(
                    text,
                    mp3_candidate,
                    str(settings.get("elevenlabs_api_key") or ""),
                    str(settings.get("elevenlabs_voice_id") or ""),
                )
                if ok:
                    engine_used = "elevenlabs"

            if not ok and (tts_engine == "openai" or (tts_engine == "auto" and settings.get("openai_tts_api_key"))):
                ok = _try_openai_tts(text, mp3_candidate, str(settings.get("openai_tts_api_key") or ""))
                if ok:
                    engine_used = "openai_tts"

            if not ok and edge_tts_available and tts_engine in ("auto", "edge", "browser_neural"):
                ok = _try_edge_tts(text, mp3_candidate, edge_voice, rate_pct, pitch_hz)
                if ok:
                    engine_used = f"edge_tts ({edge_voice})"
                else:
                    edge_tts_available = False

            if ok and mp3_candidate.exists():
                _convert_to_standard_wav(mp3_candidate, std_wav_path, apply_reverb=apply_reverb)
            else:
                fallback_raw = raw_audio_path.with_suffix(".wav")
                _synthesize_offline_baritone_cadence(text, fallback_raw, rate_pct=rate_pct)
                _convert_to_standard_wav(fallback_raw, std_wav_path, apply_reverb=apply_reverb)
                engine_used = "studio_acoustic_synth"

        used_tts_engines.add(engine_used)
        sr, pcm_int16 = wavfile.read(str(std_wav_path))
        pcm_f = pcm_int16.astype(np.float32) / 32768.0
        if pcm_f.ndim == 1:
            pcm_f = np.column_stack([pcm_f, pcm_f])

        voice_dur = len(pcm_f) / float(SAMPLE_RATE)
        pause_samples = int(pause_after * SAMPLE_RATE)
        pause_pcm = np.zeros((pause_samples, 2), dtype=np.float32)

        # Scene visual spans from start of narration (including lead-in for Scene 1) to end of pause
        scene_visual_start = 0.0 if idx == 0 else cursor_sec
        speech_start = cursor_sec
        speech_end = cursor_sec + voice_dur
        scene_visual_end = speech_end + pause_after
        if idx == total_scenes - 1:
            scene_visual_end += tail_out_sec

        voice_activity_intervals.append((speech_start, speech_end))
        voice_segments_pcm.append(pcm_f)
        voice_segments_pcm.append(pause_pcm)

        scene_timings.append(
            {
                "scene_number": scene_num,
                "visual_start": round(scene_visual_start, 3),
                "visual_end": round(scene_visual_end, 3),
                "visual_duration": round(scene_visual_end - scene_visual_start, 3),
                "speech_start": round(speech_start, 3),
                "speech_end": round(speech_end, 3),
                "pause_after": round(pause_after, 3),
                "tts_engine": engine_used,
            }
        )

        cursor_sec = speech_end + pause_after
        if idx < total_scenes - 1 and sc.get("glitch_transition", True):
            transition_timestamps.append(cursor_sec)

    # Tail room after final word
    voice_segments_pcm.append(np.zeros((int(tail_out_sec * SAMPLE_RATE), 2), dtype=np.float32))
    voice_track = np.vstack(voice_segments_pcm)
    total_duration_sec = len(voice_track) / float(SAMPLE_RATE)
    total_samples = len(voice_track)

    if progress_cb:
        progress_cb(44, "Mische Hintergrundmusik ('Glitch Horizon' / 60 BPM) & Auto-Ducking…")

    # Prepare background music track at exact length
    music_wav_path = work_dir / "music_bed.wav"
    brand_mp3 = Path(BRAND_IDENTITY["assets"]["music_glitch_horizon"])

    if music_preset == "none":
        music_track = np.zeros_like(voice_track)
    else:
        src_music: Path | None = None
        if custom_music_path and custom_music_path.exists():
            src_music = custom_music_path
        elif music_preset == "glitch_horizon" and brand_mp3.exists():
            src_music = brand_mp3

        if src_music is not None:
            # Loop seamlessly via FFmpeg stream_loop and trim to exact duration with smooth fade-out
            fade_out_start = max(0.5, total_duration_sec - 2.2)
            cmd = [
                FFMPEG_BIN,
                "-y",
                "-stream_loop",
                "-1",
                "-i",
                str(src_music),
                "-t",
                f"{total_duration_sec:.3f}",
                "-af",
                f"afade=t=in:st=0:d=1.2,afade=t=out:st={fade_out_start:.3f}:d=2.0",
                "-ar",
                str(SAMPLE_RATE),
                "-ac",
                "2",
                "-c:a",
                "pcm_s16le",
                str(music_wav_path),
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            generate_procedural_music(music_preset, total_duration_sec, music_wav_path)

        _, mus_i16 = wavfile.read(str(music_wav_path))
        music_track = mus_i16.astype(np.float32) / 32768.0
        if music_track.ndim == 1:
            music_track = np.column_stack([music_track, music_track])
        if len(music_track) < total_samples:
            pad = np.zeros((total_samples - len(music_track), 2), dtype=np.float32)
            music_track = np.vstack([music_track, pad])
        else:
            music_track = music_track[:total_samples]

    # Dynamic Auto-Ducking envelope: full ambient swell in pauses, -5.5 dB ducking during speech
    base_music_gain = float(10.0 ** (music_vol_db / 20.0))
    duck_ratio = float(10.0 ** (-5.5 / 20.0))
    duck_env = np.ones(total_samples, dtype=np.float32)
    ramp = int(0.18 * SAMPLE_RATE)

    for s_sec, e_sec in voice_activity_intervals:
        s_i = max(0, int(s_sec * SAMPLE_RATE) - ramp)
        e_i = min(total_samples, int(e_sec * SAMPLE_RATE) + ramp)
        duck_env[s_i:e_i] = duck_ratio

    # Smooth the ducking curve with a moving-average window (220ms) so transitions feel cinematic
    smooth_win = max(1, int(0.22 * SAMPLE_RATE))
    kernel = np.ones(smooth_win, dtype=np.float32) / float(smooth_win)
    duck_env_smooth = np.convolve(duck_env, kernel, mode="same")

    mixed = voice_track * 1.04 + music_track * (base_music_gain * duck_env_smooth[:, None])

    # Layer subtle AuronOrigin glitch/whoosh transition SFX at scene cuts
    if include_glitch_sfx and transition_timestamps:
        sfx = _make_glitch_whoosh_sfx(0.26)
        half = len(sfx) // 2
        for ts in transition_timestamps:
            center = int(ts * SAMPLE_RATE)
            start_i = max(0, center - half)
            end_i = min(total_samples, start_i + len(sfx))
            seg_len = end_i - start_i
            if seg_len > 0:
                mixed[start_i:end_i] += sfx[:seg_len]

    # Soft master limiter to prevent clipping
    peak = float(np.max(np.abs(mixed))) if len(mixed) else 0.0
    if peak > 0.95:
        mixed = mixed * (0.95 / peak)

    master_wav = work_dir / "body_master_48k.wav"
    voice_only_wav = work_dir / "voiceover_only_48k.wav"

    wavfile.write(
        str(master_wav),
        SAMPLE_RATE,
        np.clip(mixed * 32767.0, -32768, 32767).astype(np.int16),
    )
    wavfile.write(
        str(voice_only_wav),
        SAMPLE_RATE,
        np.clip(voice_track * 32767.0, -32768, 32767).astype(np.int16),
    )

    return {
        "master_wav": master_wav,
        "voice_only_wav": voice_only_wav,
        "total_duration_sec": round(total_duration_sec, 3),
        "scene_timings": scene_timings,
        "tts_engines_used": sorted(used_tts_engines),
    }
