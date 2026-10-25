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
CACHE_DIR = RUNTIME_DIR / "cache"
SETTINGS_PATH = RUNTIME_DIR / "settings.json"
HISTORY_PATH = RUNTIME_DIR / "history.json"

for _d in (RUNTIME_DIR, RENDERS_DIR, UPLOADS_DIR, CACHE_DIR):
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
    "settings_version": 3,
    "arena_api_key": "",
    "arena_gateway_url": "https://api.preview.arena.ai",
    "arena_model": "coding-router-preview",
    "arena_protocol": "auto",  # auto | openai | anthropic | responses
    "voice_character": "wise_elder",  # wise_elder | mystic_chronicler | calm_philosopher | cosmos_documentary | elevenlabs_custom
    "tts_engine": "sage_neural",      # sage_neural | browser_neural | elevenlabs | openai
    "edge_voice": "de-DE-ConradNeural",
    "browser_voice": "de_DE-thorsten-high",
    "voice_rate_pct": -16,
    "voice_depth_semitones": -2.6,
    "voice_warmth_db": 4.5,
    "voice_pitch_hz": -10,
    "voice_reverb": True,
    "elevenlabs_api_key": "",
    "elevenlabs_voice_id": "",
    "openai_tts_api_key": "",
    "music_preset": "dark_cosmos_cinematic",
    "music_volume_db": -17.5,
    "scene_image_mode": "auto_ai_brand",  # auto_ai_brand | procedural_brand
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

# Focused single-topic impulses — each suggestion launches ONE cohesive, self-contained topic
TOPIC_SUGGESTIONS = [
    {
        "pillar": "Simulations-News",
        "title": "Quantenverschränkung",
        "topic": "Quantenverschränkung",
        "mode": "fakten_mystery",
    },
    {
        "pillar": "Alte Codes",
        "title": "Cheops-Pyramide: Geheime Kammer",
        "topic": "Geheime Kammer der Cheops-Pyramide",
        "mode": "fakten_mystery",
    },
    {
        "pillar": "Simulations-News",
        "title": "James-Webb-Teleskop",
        "topic": "James Webb Teleskop frühe Galaxien",
        "mode": "fakten_mystery",
    },
    {
        "pillar": "Bewusstseins-Hacks",
        "title": "Das 100-ms-Gehirn",
        "topic": "Gehirn Vorhersage Wahrnehmung",
        "mode": "matrix_narrativ",
    },
    {
        "pillar": "Simulations-News",
        "title": "Zeitkristalle",
        "topic": "Zeitkristall im Quantencomputer",
        "mode": "fakten_mystery",
    },
    {
        "pillar": "Alte Codes",
        "title": "Göbekli Tepe",
        "topic": "Göbekli Tepe Tempel",
        "mode": "fakten_mystery",
    },
    {
        "pillar": "Simulations-News",
        "title": "Schwarzes Loch: Ereignishorizont",
        "topic": "Schwarzes Loch Ereignishorizont",
        "mode": "matrix_narrativ",
    },
    {
        "pillar": "Bewusstseins-Hacks",
        "title": "Klarträumen im Labor",
        "topic": "Klarträumen Schlaflabor",
        "mode": "fakten_mystery",
    },
]


def load_settings() -> dict[str, Any]:
    merged = json.loads(json.dumps(DEFAULT_SETTINGS))
    if SETTINGS_PATH.exists():
        try:
            saved = json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
            if isinstance(saved, dict):
                prev_ver = int(saved.get("settings_version") or 1)
                for k, v in saved.items():
                    if k == "token_usage_total" and isinstance(v, dict):
                        merged["token_usage_total"].update(v)
                    else:
                        merged[k] = v
                # Migrate old v1 default 'glitch_horizon' to the new cinematic default
                if prev_ver < 2 and merged.get("music_preset") == "glitch_horizon":
                    merged["music_preset"] = "dark_cosmos_cinematic"
                # Migrate v1/v2 'auto' Thorsten voice to v3 locked 'wise_elder' (Auron – Der Alte Weise)
                if prev_ver < 3:
                    merged["voice_character"] = "wise_elder"
                    if merged.get("tts_engine") in ("auto", "edge", "", None):
                        merged["tts_engine"] = "sage_neural"
                    merged["edge_voice"] = "de-DE-ConradNeural"
                    merged["browser_voice"] = "de_DE-thorsten-high"
                    merged["voice_rate_pct"] = -16
                    merged["voice_depth_semitones"] = -2.6
                    merged["voice_warmth_db"] = 4.5
                    merged["voice_pitch_hz"] = -10
                    merged["settings_version"] = 3
                    try:
                        SETTINGS_PATH.write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")
                    except Exception:
                        pass
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
