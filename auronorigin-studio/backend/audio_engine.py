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
from scipy import signal as sp_signal
from scipy.io import wavfile

from .config import BRAND_IDENTITY, CACHE_DIR
from .script_generator import enforce_german_narration


def get_ffmpeg_bin() -> str:
    sys_ff = shutil.which("ffmpeg")
    if sys_ff:
        return sys_ff
    return imageio_ffmpeg.get_ffmpeg_exe()


FFMPEG_BIN = get_ffmpeg_bin()
SAMPLE_RATE = 48000

# Selectable high-craft AuronOrigin background music catalog
MUSIC_PRESETS: list[dict[str, str]] = [
    {
        "id": "dark_cosmos_cinematic",
        "name": "Dark Cosmos – Interstellar Cello & Analog-Pad (Empfohlen)",
        "mood": "Episch, tief, warmes Streicher-Pad & kosmische Weite",
    },
    {
        "id": "golden_archive_theme",
        "name": "Das Goldene Archiv – Mystische Harfe & Tempel-Chor",
        "mood": "Geheimnisvoll, edel, gezupfte Gold-Arpeggien & tiefer Raumklang",
    },
    {
        "id": "quantum_horizon_arp",
        "name": "Quanten-Horizont – Sci-Fi Synthesizer & sanfter Puls",
        "mood": "Moderne Wissenschafts-Doku (Stil: Melodysheep / Kosmos-Synth)",
    },
    {
        "id": "chronos_tension",
        "name": "Chronos-Akte – Dokumentar-Piano & Herzschlag-Puls",
        "mood": "Spannend, seriös, gedämpftes Filz-Piano & 60-BPM Tiefbass",
    },
    {
        "id": "neural_awakening",
        "name": "Bewusstseins-Impuls – Warmes E-Piano & Tiefraum-Sphären",
        "mood": "Hypnotisch, ruhig, kristalline Akkorde für Gehirn- & Bewusstseinsthemen",
    },
    {
        "id": "pyramid_resonance",
        "name": "Pyramiden-Resonanz – Tiefe Cello-Quinten & Wüstenwind",
        "mood": "Monumental, archaisch, perfekt für Alte Codes & Archäologie",
    },
    {
        "id": "astral_odyssey",
        "name": "Astrale Odyssee – Schwebende Raumzeit-Flächen (Ohne Beat)",
        "mood": "Reine atmosphärische Schwerelosigkeit, maximaler Fokus auf die Stimme",
    },
    {
        "id": "glitch_horizon",
        "name": "Legacy: Glitch Horizon (Original-Asset)",
        "mood": "Ursprünglicher kurzer Loop aus dem alten Asset-Ordner",
    },
    {
        "id": "none",
        "name": "Ohne Hintergrundmusik (Nur deutsche Tonstimme)",
        "mood": "Reines Voiceover ohne Musikbett",
    },
]


def get_wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        return frames / float(rate) if rate else 0.0


def _convert_to_standard_wav(src: Path, dst: Path, apply_reverb: bool = True) -> None:
    """Convert any audio file into 48 kHz 16-bit stereo WAV with AuronOrigin mastering."""
    filters = [
        "highpass=f=70",
        "acompressor=threshold=-19dB:ratio=2.5:attack=10:release=160:makeup=2dB",
    ]
    if apply_reverb:
        filters.append("aecho=0.8:0.88:60:0.24")
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

    # Strictly enforce a German voice ID
    de_voice = voice if str(voice).lower().startswith("de-") else "de-DE-ConradNeural"
    rate_str = f"{rate_pct:+d}%"
    pitch_str = f"{pitch_hz:+d}Hz"
    comm = edge_tts.Communicate(text, voice=de_voice, rate=rate_str, pitch=pitch_str)
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
                "language_code": "de",
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
                "speed": 0.92,
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
    """Offline acoustic speech-cadence fallback when neither internet TTS nor browser WAVs are present."""
    words = [w for w in text.strip().split() if w]
    speed_factor = max(0.72, 1.0 + (rate_pct / 100.0))
    est_seconds = max(2.4, (len(words) / (2.45 * speed_factor)) + 0.35)
    n_samples = int(est_seconds * SAMPLE_RATE)
    t = np.linspace(0.0, est_seconds, n_samples, endpoint=False, dtype=np.float32)

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
            pitch = 104.0 - 14.0 * (i / max(1, n_syllables - 1)) + float(rng.uniform(-4.0, 4.0))
            f0_curve[s_idx:e_idx] = pitch
        cursor += avg_step

    phase = 2.0 * np.pi * np.cumsum(f0_curve) / SAMPLE_RATE
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


# ==============================================================================
# Polyphonic Cinematic Soundtrack Synthesizer (Warm Analog Pads, Arps & Reverb)
# ==============================================================================

def _midi_to_hz(midi_note: float) -> float:
    return 440.0 * (2.0 ** ((midi_note - 69.0) / 12.0))


def _rich_pad_wave(freq: float, t: np.ndarray, brightness: float = 0.55, phase_offset: float = 0.0) -> np.ndarray:
    """Warm analog string/brass waveform (band-limited harmonic stack with zero aliasing)."""
    w = 2.0 * np.pi * freq * t + phase_offset
    sig = (
        1.00 * np.sin(w)
        + 0.52 * brightness * np.sin(2.0 * w + 0.4)
        + 0.31 * brightness * np.sin(3.0 * w + 1.1)
        + 0.18 * (brightness ** 1.3) * np.sin(4.0 * w + 1.9)
        + 0.10 * (brightness ** 1.6) * np.sin(5.0 * w + 2.6)
    )
    return sig.astype(np.float32)


def _apply_lowpass(stereo: np.ndarray, cutoff_hz: float, order: int = 4) -> np.ndarray:
    sos = sp_signal.butter(order, cutoff_hz, btype="lowpass", fs=SAMPLE_RATE, output="sos")
    return sp_signal.sosfilt(sos, stereo, axis=0).astype(np.float32)


def _apply_cosmic_hall(stereo: np.ndarray, wet: float = 0.38) -> np.ndarray:
    """Lush stereo ping-pong & diffused hall reflection network."""
    n = len(stereo)
    out_l = stereo[:, 0].copy()
    out_r = stereo[:, 1].copy()

    # Prime-spaced stereo delay taps (in seconds) creating wide cinematic depth
    taps = [
        (0.193, 0.34, True),
        (0.317, 0.28, False),
        (0.461, 0.23, True),
        (0.677, 0.18, False),
        (0.953, 0.13, True),
        (1.319, 0.09, False),
    ]
    wet_l = np.zeros(n, dtype=np.float32)
    wet_r = np.zeros(n, dtype=np.float32)

    for delay_s, gain, cross in taps:
        d = int(delay_s * SAMPLE_RATE)
        if d < n:
            if cross:
                wet_l[d:] += stereo[:-d, 1] * gain
                wet_r[d:] += stereo[:-d, 0] * gain
            else:
                wet_l[d:] += stereo[:-d, 0] * gain
                wet_r[d:] += stereo[:-d, 1] * gain

    wet_stereo = _apply_lowpass(np.column_stack([wet_l, wet_r]), cutoff_hz=2600.0, order=2)
    combined_l = out_l * (1.0 - wet * 0.32) + wet_stereo[:, 0] * wet
    combined_r = out_r * (1.0 - wet * 0.32) + wet_stereo[:, 1] * wet
    return np.column_stack([combined_l, combined_r])


def _render_chord_progression(
    chords_midi: list[list[int]],
    bar_sec: float,
    total_dur: float,
    cutoff_hz: float,
    brightness: float,
    sub_gain: float,
) -> tuple[np.ndarray, np.ndarray]:
    """Render smoothly crossfading stereo detuned analog pads + deep cello sub-bass."""
    n = int(total_dur * SAMPLE_RATE)
    t_full = np.linspace(0.0, total_dur, n, endpoint=False, dtype=np.float32)
    left = np.zeros(n, dtype=np.float32)
    right = np.zeros(n, dtype=np.float32)

    overlap_s = min(1.4, bar_sec * 0.32)
    num_bars = int(math.ceil(total_dur / bar_sec)) + 1

    for b in range(num_bars):
        chord = chords_midi[b % len(chords_midi)]
        start_s = max(0.0, b * bar_sec - (overlap_s if b > 0 else 0.0))
        end_s = min(total_dur, (b + 1) * bar_sec + overlap_s)
        s_i = int(start_s * SAMPLE_RATE)
        e_i = int(end_s * SAMPLE_RATE)
        seg_n = e_i - s_i
        if seg_n <= 64:
            continue

        t_seg = t_full[s_i:e_i]
        env = np.ones(seg_n, dtype=np.float32)
        fade_in_n = int(overlap_s * SAMPLE_RATE) if b > 0 else int(0.8 * SAMPLE_RATE)
        fade_out_n = int(overlap_s * SAMPLE_RATE)
        fade_in_n = min(fade_in_n, seg_n // 2)
        fade_out_n = min(fade_out_n, seg_n // 2)
        if fade_in_n > 0:
            env[:fade_in_n] = 0.5 - 0.5 * np.cos(np.linspace(0.0, math.pi, fade_in_n, dtype=np.float32))
        if fade_out_n > 0:
            env[-fade_out_n:] = 0.5 + 0.5 * np.cos(np.linspace(0.0, math.pi, fade_out_n, dtype=np.float32))

        seg_l = np.zeros(seg_n, dtype=np.float32)
        seg_r = np.zeros(seg_n, dtype=np.float32)

        # Bass root note (warm cello sub)
        bass_hz = _midi_to_hz(chord[0] - 12)
        bass = (
            0.72 * np.sin(2.0 * np.pi * bass_hz * t_seg)
            + 0.28 * np.sin(4.0 * np.pi * bass_hz * t_seg + 0.3)
        ).astype(np.float32) * sub_gain
        seg_l += bass
        seg_r += bass

        # Polyphonic stereo detuned voices (-7 cents L, +7 cents R, center slow LFO)
        for v_idx, midi_n in enumerate(chord):
            f_center = _midi_to_hz(midi_n)
            f_l = f_center * (2.0 ** (-6.5 / 1200.0))
            f_r = f_center * (2.0 ** (+6.5 / 1200.0))
            note_gain = 0.22 / max(1.0, len(chord) ** 0.55)
            seg_l += note_gain * _rich_pad_wave(f_l, t_seg, brightness=brightness, phase_offset=v_idx * 0.7)
            seg_r += note_gain * _rich_pad_wave(f_r, t_seg, brightness=brightness, phase_offset=v_idx * 1.3 + 0.5)

        left[s_i:e_i] += seg_l * env
        right[s_i:e_i] += seg_r * env

    # Slow breathing filter modulation via gentle amplitude shimmer + Butterworth analog filter
    shimmer = (0.86 + 0.14 * np.sin(2.0 * np.pi * 0.09 * t_full)).astype(np.float32)
    pad_stereo = np.column_stack([left * shimmer, right * shimmer])
    pad_stereo = _apply_lowpass(pad_stereo, cutoff_hz=cutoff_hz, order=4)
    return pad_stereo[:, 0], pad_stereo[:, 1]


def _add_plucked_arpeggio(
    left: np.ndarray,
    right: np.ndarray,
    chords_midi: list[list[int]],
    bar_sec: float,
    step_sec: float,
    note_gain: float = 0.11,
    bell_tone: bool = False,
    octave_shift: int = 12,
) -> None:
    """Layer delicate harp, celesta, felt-piano, or sci-fi synth arpeggio notes synced to the chord progression."""
    n = len(left)
    total_dur = n / float(SAMPLE_RATE)
    num_steps = int(total_dur / step_sec)
    arp_pattern = [0, 1, 2, 3, 2, 1]

    for step in range(num_steps):
        onset_s = step * step_sec
        bar_idx = int(onset_s // bar_sec)
        chord = chords_midi[bar_idx % len(chords_midi)]
        note_idx = arp_pattern[step % len(arp_pattern)] % len(chord)
        midi_n = chord[note_idx] + octave_shift + (12 if step % 8 == 7 else 0)
        freq = _midi_to_hz(midi_n)

        note_dur = min(step_sec * 2.6, 2.2)
        s_i = int(onset_s * SAMPLE_RATE)
        e_i = min(n, s_i + int(note_dur * SAMPLE_RATE))
        seg_n = e_i - s_i
        if seg_n <= 32:
            continue

        t_n = np.linspace(0.0, seg_n / float(SAMPLE_RATE), seg_n, endpoint=False, dtype=np.float32)
        # Fast soft attack (14ms) + natural exponential string/piano decay
        attack_n = min(seg_n // 3, int(0.014 * SAMPLE_RATE))
        env = np.exp(-t_n * (2.6 if bell_tone else 3.4)).astype(np.float32)
        if attack_n > 0:
            env[:attack_n] *= np.linspace(0.0, 1.0, attack_n, dtype=np.float32)

        if bell_tone:
            # Rhodes / Celesta crystalline tone
            wave_n = (
                np.sin(2.0 * np.pi * freq * t_n)
                + 0.32 * np.exp(-t_n * 6.0) * np.sin(4.0 * np.pi * freq * t_n)
                + 0.12 * np.exp(-t_n * 9.0) * np.sin(6.0 * np.pi * freq * t_n)
            ).astype(np.float32)
        else:
            # Warm plucked golden harp / muted synth pluck
            wave_n = (
                np.sin(2.0 * np.pi * freq * t_n)
                + 0.45 * np.exp(-t_n * 5.0) * np.sin(4.0 * np.pi * freq * t_n + 0.2)
                + 0.20 * np.exp(-t_n * 8.0) * np.sin(6.0 * np.pi * freq * t_n + 0.6)
            ).astype(np.float32)

        pan = 0.5 + 0.34 * math.sin(step * 0.9)
        left[s_i:e_i] += wave_n * env * note_gain * (1.0 - pan * 0.45)
        right[s_i:e_i] += wave_n * env * note_gain * (0.55 + pan * 0.45)


def _add_cinematic_heartbeat(left: np.ndarray, right: np.ndarray, period_sec: float = 2.0, gain: float = 0.16) -> None:
    """Warm, deep cinematic tom/heartbeat pulse (never harsh)."""
    n = len(left)
    total_dur = n / float(SAMPLE_RATE)
    hits = int(total_dur / period_sec)
    for h in range(hits):
        for sub_offset, sub_amp in ((0.0, 1.0), (0.34, 0.58)):
            onset = h * period_sec + sub_offset
            s_i = int(onset * SAMPLE_RATE)
            dur_n = int(0.32 * SAMPLE_RATE)
            e_i = min(n, s_i + dur_n)
            seg_n = e_i - s_i
            if seg_n <= 32:
                continue
            t_p = np.linspace(0.0, seg_n / float(SAMPLE_RATE), seg_n, endpoint=False, dtype=np.float32)
            # Pitch envelope 82 Hz -> 44 Hz
            f_curve = 44.0 + 38.0 * np.exp(-t_p * 18.0)
            phase = 2.0 * np.pi * np.cumsum(f_curve) / float(SAMPLE_RATE)
            thump = np.sin(phase).astype(np.float32) * np.exp(-t_p * 9.5).astype(np.float32)
            attack = min(seg_n, int(0.008 * SAMPLE_RATE))
            thump[:attack] *= np.linspace(0.0, 1.0, attack, dtype=np.float32)
            pulse = thump * gain * sub_amp
            left[s_i:e_i] += pulse
            right[s_i:e_i] += pulse


def generate_procedural_music(preset: str, duration_sec: float, out_wav: Path) -> Path:
    """Synthesize lush, polyphonic 48 kHz stereo AuronOrigin film-score soundtracks."""
    dur = max(5.0, float(duration_sec))

    # Map legacy preset IDs seamlessly to the upgraded compositions
    preset_key = preset
    if preset_key == "quantum_pulse":
        preset_key = "quantum_horizon_arp"
    elif preset_key == "temple_drone_432":
        preset_key = "pyramid_resonance"

    if preset_key == "golden_archive_theme":
        # C# minor -> A maj7 -> F# min9 -> G# sus4 -> G#7 (mysterious ancient archive + golden harp)
        chords = [
            [49, 56, 61, 64],      # C#m9
            [45, 52, 57, 61, 64],  # Amaj7
            [42, 49, 54, 57, 61],  # F#m7
            [44, 51, 56, 58, 61],  # G#7sus4
        ]
        left, right = _render_chord_progression(chords, bar_sec=4.8, total_dur=dur, cutoff_hz=920.0, brightness=0.60, sub_gain=0.26)
        _add_plucked_arpeggio(left, right, chords, bar_sec=4.8, step_sec=0.60, note_gain=0.11, bell_tone=False, octave_shift=12)
        wet = 0.44

    elif preset_key == "quantum_horizon_arp":
        # F minor -> Db maj7 -> Ab maj -> C min7 (Melodysheep / modern cosmos synthwave-ambient)
        chords = [
            [41, 48, 53, 56, 60],  # Fm
            [49, 56, 60, 65],      # Dbmaj7
            [44, 51, 56, 60],      # Ab
            [48, 55, 58, 63],      # Cm7
        ]
        left, right = _render_chord_progression(chords, bar_sec=4.0, total_dur=dur, cutoff_hz=1100.0, brightness=0.72, sub_gain=0.30)
        _add_plucked_arpeggio(left, right, chords, bar_sec=4.0, step_sec=0.25, note_gain=0.085, bell_tone=False, octave_shift=12)
        _add_cinematic_heartbeat(left, right, period_sec=2.0, gain=0.11)
        wet = 0.40

    elif preset_key == "chronos_tension":
        # A minor -> F maj7 -> D minor9 -> E7sus4 (investigative documentary piano + heartbeat)
        chords = [
            [45, 52, 57, 60],      # Am
            [41, 48, 53, 57, 60],  # Fmaj7
            [50, 57, 62, 65],      # Dm
            [40, 47, 52, 57, 59],  # E7sus4
        ]
        left, right = _render_chord_progression(chords, bar_sec=4.0, total_dur=dur, cutoff_hz=760.0, brightness=0.48, sub_gain=0.28)
        _add_plucked_arpeggio(left, right, chords, bar_sec=4.0, step_sec=0.50, note_gain=0.10, bell_tone=True, octave_shift=12)
        _add_cinematic_heartbeat(left, right, period_sec=1.0, gain=0.13)
        wet = 0.36

    elif preset_key == "neural_awakening":
        # E minor9 -> C maj7 -> A minor7 -> B7sus4 (warm Rhodes electric piano & velvet consciousness pad)
        chords = [
            [40, 47, 54, 55, 59],  # Em9
            [48, 55, 59, 64],      # Cmaj7
            [45, 52, 55, 60],      # Am7
            [47, 54, 57, 62],      # Bsus4
        ]
        left, right = _render_chord_progression(chords, bar_sec=5.2, total_dur=dur, cutoff_hz=840.0, brightness=0.45, sub_gain=0.25)
        _add_plucked_arpeggio(left, right, chords, bar_sec=5.2, step_sec=0.65, note_gain=0.105, bell_tone=True, octave_shift=12)
        wet = 0.46

    elif preset_key == "pyramid_resonance":
        # C minor -> Ab maj7 -> F minor -> G7sus4 (monumental ancient stone resonance & deep fifths)
        chords = [
            [36, 43, 48, 55, 63],  # Cm open fifths
            [44, 51, 56, 63],      # Abmaj7
            [41, 48, 53, 60],      # Fm
            [43, 50, 55, 60],      # Gsus4
        ]
        left, right = _render_chord_progression(chords, bar_sec=6.0, total_dur=dur, cutoff_hz=680.0, brightness=0.58, sub_gain=0.34)
        _add_cinematic_heartbeat(left, right, period_sec=3.0, gain=0.14)
        _add_plucked_arpeggio(left, right, chords, bar_sec=6.0, step_sec=1.5, note_gain=0.08, bell_tone=False, octave_shift=12)
        wet = 0.48

    elif preset_key == "astral_odyssey":
        # B minor9 -> G maj7 -> D maj9 -> F#m7 (pure beatless weightless deep-space spheres)
        chords = [
            [47, 54, 57, 61, 66],  # Bm9
            [43, 50, 54, 59, 62],  # Gmaj7
            [50, 57, 61, 66],      # Dmaj7
            [42, 49, 52, 57, 61],  # F#m7
        ]
        left, right = _render_chord_progression(chords, bar_sec=6.5, total_dur=dur, cutoff_hz=780.0, brightness=0.52, sub_gain=0.26)
        wet = 0.52

    else:
        # Default 'dark_cosmos_cinematic': D minor9 -> Bb maj7 -> G minor7 -> A7sus4 (Interstellar grandeur)
        chords = [
            [38, 45, 50, 53, 57, 64],  # Dm9
            [46, 53, 57, 62, 65],      # Bbmaj7
            [43, 50, 55, 58, 62],      # Gm7
            [45, 52, 57, 62, 64],      # A7sus4
        ]
        left, right = _render_chord_progression(chords, bar_sec=4.8, total_dur=dur, cutoff_hz=960.0, brightness=0.64, sub_gain=0.30)
        _add_plucked_arpeggio(left, right, chords, bar_sec=4.8, step_sec=0.80, note_gain=0.095, bell_tone=True, octave_shift=12)
        _add_cinematic_heartbeat(left, right, period_sec=2.4, gain=0.10)
        wet = 0.45

    stereo = _apply_cosmic_hall(np.column_stack([left, right]), wet=wet)

    # Smooth fade-in (1.4s) and fade-out (2.2s) + soft normalization
    n = len(stereo)
    fade_in = min(n // 3, int(1.4 * SAMPLE_RATE))
    fade_out = min(n // 3, int(2.2 * SAMPLE_RATE))
    env = np.ones(n, dtype=np.float32)
    if fade_in > 0:
        env[:fade_in] = np.linspace(0.0, 1.0, fade_in, dtype=np.float32)
    if fade_out > 0:
        env[-fade_out:] = np.linspace(1.0, 0.0, fade_out, dtype=np.float32)

    stereo = stereo * env[:, None]
    peak = float(np.max(np.abs(stereo))) if n else 1.0
    if peak > 1e-4:
        stereo = stereo * (0.78 / peak)

    pcm16 = np.clip(stereo * 32767.0, -32768, 32767).astype(np.int16)
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(str(out_wav), SAMPLE_RATE, pcm16)
    return out_wav


def get_or_create_music_preview(preset_id: str) -> Path | None:
    """Return a cached 16-second WAV/MP3 preview file so users can audition any music preset in the browser."""
    if preset_id == "none":
        return None
    if preset_id == "glitch_horizon":
        brand_mp3 = Path(BRAND_IDENTITY["assets"]["music_glitch_horizon"])
        if brand_mp3.exists():
            return brand_mp3
    preview_dir = CACHE_DIR / "music_previews_v2"
    preview_dir.mkdir(parents=True, exist_ok=True)
    safe_id = "".join(c for c in preset_id if c.isalnum() or c == "_") or "dark_cosmos_cinematic"
    out_wav = preview_dir / f"{safe_id}_preview.wav"
    if not out_wav.exists() or out_wav.stat().st_size < 4096:
        generate_procedural_music(safe_id, 16.0, out_wav)
    return out_wav


def _make_glitch_whoosh_sfx(duration_sec: float = 0.26) -> np.ndarray:
    """Create a subtle cinematic sub-whoosh + crystal shimmer transition sound."""
    n = int(duration_sec * SAMPLE_RATE)
    t = np.linspace(0.0, duration_sec, n, endpoint=False, dtype=np.float32)
    rng = np.random.default_rng(1337)
    sweep_phase = 2 * np.pi * np.cumsum(np.linspace(190.0, 52.0, n, dtype=np.float32)) / SAMPLE_RATE
    sub_whoosh = 0.55 * np.sin(sweep_phase)
    burst = rng.normal(0.0, 0.14, size=n).astype(np.float32) * (np.sin(2 * np.pi * 48.0 * t) > 0.25)
    env = np.maximum(0.0, np.sin(np.linspace(0, math.pi, n, dtype=np.float32))) ** 1.4
    mono = (sub_whoosh + burst) * env * 0.16
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
    """Synthesize 100% German per-scene voiceovers, record exact timings, duck background music, and mix master WAV."""
    work_dir.mkdir(parents=True, exist_ok=True)
    uploaded_map = uploaded_scene_audio or {}

    tts_engine = str(settings.get("tts_engine") or "auto")
    edge_voice = str(settings.get("edge_voice") or "de-DE-ConradNeural")
    if not edge_voice.lower().startswith("de-"):
        edge_voice = "de-DE-ConradNeural"
    rate_pct = int(settings.get("voice_rate_pct", -15))
    pitch_hz = int(settings.get("voice_pitch_hz", -3))
    apply_reverb = bool(settings.get("voice_reverb", True))
    music_preset = str(settings.get("music_preset") or "dark_cosmos_cinematic")
    music_vol_db = float(settings.get("music_volume_db", -17.0))
    include_glitch_sfx = bool(settings.get("include_glitch_sfx", True))

    lead_in_sec = 0.45
    tail_out_sec = 0.75

    scene_timings: list[dict[str, Any]] = []
    voice_segments_pcm: list[np.ndarray] = []
    voice_activity_intervals: list[tuple[float, float]] = []
    transition_timestamps: list[float] = []

    lead_samples = int(lead_in_sec * SAMPLE_RATE)
    voice_segments_pcm.append(np.zeros((lead_samples, 2), dtype=np.float32))
    cursor_sec = lead_in_sec
    used_tts_engines: set[str] = set()
    edge_tts_available = True

    total_scenes = len(scenes)
    for idx, sc in enumerate(scenes):
        scene_num = idx + 1
        raw_text = str(sc.get("narration") or "").strip()
        # Final German safety lock before voice synthesis
        text = enforce_german_narration(raw_text, fallback_topic=str(sc.get("on_screen_headline") or ""))
        pause_after = float(sc.get("pause_after", 0.85))
        if progress_cb:
            progress_cb(
                int(10 + (idx / max(1, total_scenes)) * 30),
                f"Synthetisiere deutsche Tonstimme für Szene {scene_num}/{total_scenes}…",
            )

        raw_audio_path = work_dir / f"scene_{scene_num:02d}_raw"
        std_wav_path = work_dir / f"scene_{scene_num:02d}_voice.wav"
        engine_used = "offline_cadence"

        # Priority 1: Pre-synthesized German Browser Neural VITS WAV uploaded by client
        if scene_num in uploaded_map and uploaded_map[scene_num].exists():
            _convert_to_standard_wav(uploaded_map[scene_num], std_wav_path, apply_reverb=apply_reverb)
            engine_used = "browser_neural_vits_de"
        else:
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
                    engine_used = "elevenlabs_de"

            if not ok and (tts_engine == "openai" or (tts_engine == "auto" and settings.get("openai_tts_api_key"))):
                ok = _try_openai_tts(text, mp3_candidate, str(settings.get("openai_tts_api_key") or ""))
                if ok:
                    engine_used = "openai_tts_de"

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
                engine_used = "studio_acoustic_synth_de"

        used_tts_engines.add(engine_used)
        sr, pcm_int16 = wavfile.read(str(std_wav_path))
        pcm_f = pcm_int16.astype(np.float32) / 32768.0
        if pcm_f.ndim == 1:
            pcm_f = np.column_stack([pcm_f, pcm_f])

        voice_dur = len(pcm_f) / float(SAMPLE_RATE)
        pause_samples = int(pause_after * SAMPLE_RATE)
        pause_pcm = np.zeros((pause_samples, 2), dtype=np.float32)

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

    voice_segments_pcm.append(np.zeros((int(tail_out_sec * SAMPLE_RATE), 2), dtype=np.float32))
    voice_track = np.vstack(voice_segments_pcm)
    total_duration_sec = len(voice_track) / float(SAMPLE_RATE)
    total_samples = len(voice_track)

    if progress_cb:
        progress_cb(44, f"Komponiere & mische Hintergrundmusik ({music_preset}) inkl. Auto-Ducking…")

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

    # Dynamic Auto-Ducking envelope: full swell in pauses, -5.5 dB ducking during speech
    base_music_gain = float(10.0 ** (music_vol_db / 20.0))
    duck_ratio = float(10.0 ** (-5.5 / 20.0))
    duck_env = np.ones(total_samples, dtype=np.float32)
    ramp = int(0.18 * SAMPLE_RATE)

    for s_sec, e_sec in voice_activity_intervals:
        s_i = max(0, int(s_sec * SAMPLE_RATE) - ramp)
        e_i = min(total_samples, int(e_sec * SAMPLE_RATE) + ramp)
        duck_env[s_i:e_i] = duck_ratio

    smooth_win = max(1, int(0.22 * SAMPLE_RATE))
    kernel = np.ones(smooth_win, dtype=np.float32) / float(smooth_win)
    duck_env_smooth = np.convolve(duck_env, kernel, mode="same")

    mixed = voice_track * 1.04 + music_track * (base_music_gain * duck_env_smooth[:, None])

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
