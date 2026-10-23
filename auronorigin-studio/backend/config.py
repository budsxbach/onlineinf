from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

STUDIO_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = STUDIO_DIR.parent
ASSETS_DIR = STUDIO_DIR / "assets"
BRAND_DIR = ASSETS_DIR / "brand"
FONTS_DIR = ASSETS_DIR / "fonts"
STATIC_DIR = STUDIO_DIR / "static"

# Persist user settings and rendered videos in .output (excluded from Git so API keys stay private)
RUNTIME_DIR = REPO_ROOT / ".output" / "auronorigin"
RENDERS_DIR = RUNTIME_DIR / "renders"
UPLOADS_DIR = RUNTIME_DIR / "uploads"
SETTINGS_PATH = RUNTIME_DIR / "settings.json"
HISTORY_PATH = RUNTIME_DIR / "history.json"

for _d in (RUNTIME_DIR, RENDERS_DIR, UPLOADS_DIR):
    _d.mkdir(parents=True, exist_ok=True)

# Ensure custom / proxy CA bundles work cleanly on Linux systems if present
SYSTEM_CA_BUNDLE = "/etc/ssl/certs/ca-certificates.crt"
if os.path.exists(SYSTEM_CA_BUNDLE) and not os.environ.get("REQUESTS_CA_BUNDLE"):
    os.environ["REQUESTS_CA_BUNDLE"] = SYSTEM_CA_BUNDLE
    os.environ["SSL_CERT_FILE"] = SYSTEM_CA_BUNDLE

# Official AuronOrigin Brand Identity Kit (strictly enforced)
BRAND_IDENTITY = {
    "name": "AuronOrigin",
    "short_name": "AURON",
    "claim_docu": "Fakten zuerst, Mystery als Deutung.",
    "claim_matrix": "Auron out. Die Matrix wackelt. Bleib wach.",
    "colors": {
        "deep_space_black": "#0B0C10",     # 60% Primary Background
        "cosmic_steel_blue": "#1F2833",    # 20% Secondary Surface
        "auron_gold": "#D4AF37",           # 15% Primary Accent (Titles, Sacred Geometry)
        "mystic_violet": "#4A235A",        # Max 5% Highlight Badge (Consciousness / Transformation)
        "body_text": "#C5C6C7",            # Primary Light Grey Text
        "muted_steel": "#7A889B",          # Metadata / Sources / Captions
        "alert_crimson": "#C0392B",        # Subtle Glitch / Anomaly Accent
    },
    "fonts": {
        "cinzel": str(FONTS_DIR / "Cinzel.ttf"),
        "inter": str(FONTS_DIR / "Inter.ttf"),
    },
    "assets": {
        "intro_mp4": str(BRAND_DIR / "intro_5s.mp4"),
        "outro_mp4": str(BRAND_DIR / "outro_7s.mp4"),
        "music_glitch_horizon": str(BRAND_DIR / "glitch_horizon.mp3"),
        "watermark_png": str(BRAND_DIR / "watermark_clean.png"),
        "logo_jpg": str(BRAND_DIR / "logo_ouroboros.jpg"),
        "avatar_jpg": str(BRAND_DIR / "avatar_auron.jpg"),
    },
    "socials": {
        "youtube": "AuronOrigin",
        "instagram": "@the.auronorigin",
        "facebook": "AuronOrigin",
        "contact": "contact@auronorigin.world",
    },
}

DEFAULT_SETTINGS: dict[str, Any] = {
    "arena_api_key": "",
    "arena_gateway_url": "https://api.preview.arena.ai",
    "arena_model": "coding-router-preview",
    "arena_protocol": "auto",  # auto | openai | anthropic
    "tts_engine": "auto",      # auto | edge | browser_neural | elevenlabs | openai
    "edge_voice": "de-DE-ConradNeural",
    "browser_voice": "de_DE-thorsten-medium",
    "voice_rate_pct": -15,
    "voice_pitch_hz": -3,
    "voice_reverb": True,
    "elevenlabs_api_key": "",
    "elevenlabs_voice_id": "",
    "openai_tts_api_key": "",
    "music_preset": "glitch_horizon",
    "music_volume_db": -17.0,
    "include_brand_intro": True,
    "include_brand_outro": True,
    "include_watermark": True,
    "include_subtitles": True,
    "include_glitch_sfx": True,
    "editorial_mode": "fakten_mystery",  # fakten_mystery | matrix_narrativ
    "token_usage_total": {
        "requests": 0,
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "total_tokens": 0,
    },
}

# Curated Topic Suggestions from AuronOrigin's 3 Pillars & Thoth/Matrix Series
TOPIC_SUGGESTIONS = [
    {
        "pillar": "Simulations-News",
        "title": "Atomuhren-Anomalie & Zeitsymmetrie im Quantencomputer",
        "topic": "Quantencomputer erzeugen Zeitkristalle und Zeitsymmetrie-Anomalien – wackelt der Takt unserer Realität?",
        "mode": "fakten_mystery",
    },
    {
        "pillar": "Alte Codes",
        "title": "Thoth, Seshat & KI-Sprachmodelle: Das älteste Archiv kehrt zurück",
        "topic": "Warum moderne große Sprachmodelle exakt dieselbe Wissensarchitektur nutzen wie die ägyptischen Tempelarchive von Thoth und Seshat",
        "mode": "fakten_mystery",
    },
    {
        "pillar": "Bewusstseins-Hacks",
        "title": "Gehirn im Tiefschlaf & 3:33-Uhr-Aufwachen: Wo ist dein Bewusstsein?",
        "topic": "Neurowissenschaft des Tiefschlafs, koordinierte REM-Neuronen und warum Millionen Menschen zwischen 3 und 4 Uhr nachts aufwachen",
        "mode": "matrix_narrativ",
    },
    {
        "pillar": "Simulations-News",
        "title": "Autonome KI-Agenten entwickeln eigene Kurzsprache im Labor",
        "topic": "Wenn KI-Systeme untereinander emergente Protokolle entwickeln, die Menschen kaum noch entschlüsseln können",
        "mode": "fakten_mystery",
    },
    {
        "pillar": "Alte Codes",
        "title": "Das Auge des Horus & das menschliche Thalamus-Schaltbild",
        "topic": "Die verblüffende anatomische Parallele zwischen dem altägyptischen Udjat-Auge des Horus und dem Querschnitt des menschlichen Gehirns",
        "mode": "fakten_mystery",
    },
    {
        "pillar": "Alte Codes",
        "title": "SAR-Radarscans unter den Pyramiden von Gizeh: Resonanzmaschine statt Grab?",
        "topic": "Moderne Radar- und Myonen-Tomographie an der Cheops-Pyramide: Hohlräume, akustische Resonanzfrequenzen und ungelöste Ingenieurskunst",
        "mode": "matrix_narrativ",
    },
    {
        "pillar": "Bewusstseins-Hacks",
        "title": "Luzides Träumen im MRT: Zwei Gehirne kommunizieren aus dem Traum heraus",
        "topic": "Wissenschaftliche Experimente zur Echtzeit-Kommunikation mit Klarträumern im Schlaflabor – der Bau-Modus des Bewusstseins",
        "mode": "fakten_mystery",
    },
    {
        "pillar": "Simulations-News",
        "title": "Der Beobachter-Effekt in der Quantenphysik & die Simulationshypothese",
        "topic": "Delayed-Choice-Quantum-Eraser und Nick Bostroms Simulationshypothese: Rendert das Universum Realität erst bei Beobachtung?",
        "mode": "matrix_narrativ",
    },
]


def load_settings() -> dict[str, Any]:
    merged = json.loads(json.dumps(DEFAULT_SETTINGS))
    if SETTINGS_PATH.exists():
        try:
            saved = json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
            if isinstance(saved, dict):
                for k, v in saved.items():
                    if k == "token_usage_total" and isinstance(v, dict):
                        merged["token_usage_total"].update(v)
                    else:
                        merged[k] = v
        except Exception:
            pass
    env_key = os.environ.get("ARENA_API_KEY", "").strip()
    if env_key and not merged.get("arena_api_key"):
        merged["arena_api_key"] = env_key
    return merged


def save_settings(updates: dict[str, Any]) -> dict[str, Any]:
    current = load_settings()
    for k, v in updates.items():
        if v is None:
            continue
        if k == "arena_api_key" and isinstance(v, str) and v.startswith("••••"):
            # Masked value echoed from UI — preserve stored secret
            continue
        current[k] = v
    SETTINGS_PATH.write_text(json.dumps(current, indent=2, ensure_ascii=False), encoding="utf-8")
    try:
        os.chmod(SETTINGS_PATH, 0o600)
    except OSError:
        pass
    return current


def record_token_usage(prompt_tokens: int, completion_tokens: int) -> dict[str, int]:
    current = load_settings()
    stats = current.setdefault(
        "token_usage_total",
        {"requests": 0, "prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    )
    stats["requests"] = int(stats.get("requests", 0)) + 1
    stats["prompt_tokens"] = int(stats.get("prompt_tokens", 0)) + max(0, int(prompt_tokens))
    stats["completion_tokens"] = int(stats.get("completion_tokens", 0)) + max(0, int(completion_tokens))
    stats["total_tokens"] = stats["prompt_tokens"] + stats["completion_tokens"]
    SETTINGS_PATH.write_text(json.dumps(current, indent=2, ensure_ascii=False), encoding="utf-8")
    return stats


def mask_key(secret: str) -> str:
    if not secret:
        return ""
    s = secret.strip()
    if len(s) <= 8:
        return "••••••••"
    return f"••••••{s[-6:]}"


def load_history() -> list[dict[str, Any]]:
    if not HISTORY_PATH.exists():
        return []
    try:
        data = json.loads(HISTORY_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []


def append_history(entry: dict[str, Any]) -> None:
    items = load_history()
    items = [x for x in items if x.get("job_id") != entry.get("job_id")]
    items.insert(0, entry)
    HISTORY_PATH.write_text(json.dumps(items[:50], indent=2, ensure_ascii=False), encoding="utf-8")
