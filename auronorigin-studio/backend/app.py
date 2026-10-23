from __future__ import annotations

import io
import json
import re
import shutil
import threading
import time
import uuid
import zipfile
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .arena_client import DEFAULT_ARENA_MODELS, discover_arena_models, extract_json_object
from .audio_engine import build_master_audio_timeline
from .config import (
    BRAND_DIR,
    BRAND_IDENTITY,
    RENDERS_DIR,
    STATIC_DIR,
    STUDIO_DIR,
    TOPIC_SUGGESTIONS,
    UPLOADS_DIR,
    append_history,
    load_history,
    load_settings,
    mask_key,
    record_token_usage,
    save_settings,
)
from .research_engine import run_topic_research
from .script_generator import (
    VISUAL_MOTIFS,
    build_auron_script_prompts,
    generate_video_blueprint,
    normalize_blueprint,
)
from .visual_engine import generate_youtube_thumbnail, render_complete_auron_video, render_sacred_motif_plate

app = FastAPI(
    title="AuronOrigin YouTube Video Studio",
    description="Automatisierte YouTube-Videoproduktion für AuronOrigin mit Arena API & Arena Router",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount ONNX Runtime Web WASM files for browser-side neural German TTS
ORT_DIST_DIR = STUDIO_DIR / "node_modules" / "onnxruntime-web" / "dist"
if ORT_DIST_DIR.exists():
    app.mount("/vendor-ort", StaticFiles(directory=str(ORT_DIST_DIR)), name="vendor_ort")

if BRAND_DIR.exists():
    app.mount("/brand-assets", StaticFiles(directory=str(BRAND_DIR)), name="brand_assets")

STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

RENDER_JOBS: dict[str, dict[str, Any]] = {}
JOBS_LOCK = threading.Lock()


class SettingsPayload(BaseModel):
    arena_api_key: str | None = None
    arena_gateway_url: str | None = None
    arena_model: str | None = None
    arena_protocol: str | None = None
    tts_engine: str | None = None
    edge_voice: str | None = None
    browser_voice: str | None = None
    voice_rate_pct: int | None = None
    voice_pitch_hz: int | None = None
    voice_reverb: bool | None = None
    elevenlabs_api_key: str | None = None
    elevenlabs_voice_id: str | None = None
    openai_tts_api_key: str | None = None
    music_preset: str | None = None
    music_volume_db: float | None = None
    include_brand_intro: bool | None = None
    include_brand_outro: bool | None = None
    include_watermark: bool | None = None
    include_subtitles: bool | None = None
    include_glitch_sfx: bool | None = None
    editorial_mode: str | None = None


class VerifyKeyPayload(BaseModel):
    arena_api_key: str | None = None
    arena_gateway_url: str | None = None


class ResearchPayload(BaseModel):
    topic: str
    pillar: str | None = None
    editorial_mode: str = "fakten_mystery"
    browser_sources: list[dict[str, Any]] = Field(default_factory=list)
    arena_api_key: str | None = None
    arena_gateway_url: str | None = None
    arena_model: str | None = None


class ScriptPayload(BaseModel):
    topic: str
    dossier: dict[str, Any] | None = None
    video_format: str = "9:16"
    duration_target: str = "short_60"
    editorial_mode: str = "fakten_mystery"
    pillar: str | None = None
    arena_api_key: str | None = None
    arena_gateway_url: str | None = None
    arena_model: str | None = None
    browser_raw_llm_text: str | None = None
    prompt_tokens: int = 0
    completion_tokens: int = 0


class RenderPayload(BaseModel):
    blueprint: dict[str, Any]
    quality: str = "hd"  # hd (720x1280 / 1280x720 fast) | fullhd (1080x1920 / 1920x1080)
    uploaded_scene_audio: dict[str, str] = Field(default_factory=dict)  # scene_number -> file_id
    custom_music_file_id: str | None = None
    settings_override: dict[str, Any] = Field(default_factory=dict)


class PreviewMotifPayload(BaseModel):
    visual_motif: str = "eye_of_horus"
    video_format: str = "9:16"
    custom_image_id: str | None = None


def _public_settings_view(cfg: dict[str, Any]) -> dict[str, Any]:
    out = dict(cfg)
    raw_key = str(cfg.get("arena_api_key") or "")
    out["has_arena_key"] = bool(raw_key.strip())
    out["arena_api_key_masked"] = mask_key(raw_key)
    out["arena_api_key"] = mask_key(raw_key)
    out["elevenlabs_api_key"] = mask_key(str(cfg.get("elevenlabs_api_key") or ""))
    out["openai_tts_api_key"] = mask_key(str(cfg.get("openai_tts_api_key") or ""))
    return out


def _effective_arena_cfg(inline_key: str | None, inline_gw: str | None, inline_model: str | None = None) -> dict[str, Any]:
    saved = load_settings()
    if inline_key and not inline_key.startswith("••••"):
        saved["arena_api_key"] = inline_key.strip()
    if inline_gw:
        saved["arena_gateway_url"] = inline_gw.strip()
    if inline_model:
        saved["arena_model"] = inline_model.strip()
    return saved


@app.get("/", response_class=HTMLResponse)
def serve_index() -> HTMLResponse:
    index_file = STATIC_DIR / "index.html"
    if not index_file.exists():
        return HTMLResponse("<h1>AuronOrigin Studio wird initialisiert…</h1>")
    return HTMLResponse(index_file.read_text(encoding="utf-8"))


@app.get("/api/bootstrap")
def api_bootstrap() -> dict[str, Any]:
    cfg = load_settings()
    return {
        "ok": True,
        "settings": _public_settings_view(cfg),
        "brand": {
            "name": BRAND_IDENTITY["name"],
            "claim_docu": BRAND_IDENTITY["claim_docu"],
            "claim_matrix": BRAND_IDENTITY["claim_matrix"],
            "colors": BRAND_IDENTITY["colors"],
            "socials": BRAND_IDENTITY["socials"],
        },
        "default_models": DEFAULT_ARENA_MODELS,
        "topic_suggestions": TOPIC_SUGGESTIONS,
        "visual_motifs": [
            {"id": "eye_of_horus", "label": "Auge des Horus • Hologramm-Linse"},
            {"id": "ouroboros_seal", "label": "Ouroboros • Goldenes Siegel"},
            {"id": "quantum_lattice", "label": "Quanten-Gitter • Zeitkristall"},
            {"id": "pyramid_radar", "label": "Gizeh-Pyramide • SAR-Radarscan"},
            {"id": "neural_cosmos", "label": "Bewusstseins-Netz • Thalamus-Kosmos"},
            {"id": "sacred_archive", "label": "Tempel-Archiv • Hieroglyphen-Code"},
        ],
        "music_presets": [
            {"id": "glitch_horizon", "label": "AuronOrigin Original – 'Glitch Horizon' (60 BPM Dark Cosmic)"},
            {"id": "temple_drone_432", "label": "Tempel-Resonanz 432 Hz (Tiefen-Drone & Herzschlag)"},
            {"id": "quantum_pulse", "label": "Quanten-Puls (Dunkler Sci-Fi Arpeggio-Takt)"},
            {"id": "custom", "label": "Eigene Musikdatei hochladen (MP3/WAV)"},
            {"id": "none", "label": "Keine Hintergrundmusik (Nur Tonstimme)"},
        ],
        "voice_presets": [
            {
                "id": "auto",
                "label": "Automatik (ConradNeural -15%/-3Hz + Browser Neural Thorsten Fallback)",
            },
            {
                "id": "browser_neural",
                "label": "Lokale KI-Stimme im Browser (Thorsten Neural VITS • 100% Offlinefähig)",
            },
            {
                "id": "edge",
                "label": "Microsoft Neural Cloud – ConradNeural (-15% Tempo, -3Hz Tiefe)",
            },
            {
                "id": "elevenlabs",
                "label": "ElevenLabs Multilingual v2 (Optional mit eigenem Key)",
            },
        ],
        "history": load_history()[:15],
    }


@app.post("/api/settings")
def api_save_settings(payload: SettingsPayload) -> dict[str, Any]:
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = save_settings(updates)
    return {"ok": True, "settings": _public_settings_view(updated)}


@app.post("/api/arena/verify")
def api_verify_arena(payload: VerifyKeyPayload) -> dict[str, Any]:
    saved = load_settings()
    key = payload.arena_api_key
    if not key or key.startswith("••••"):
        key = saved.get("arena_api_key", "")
    else:
        save_settings({"arena_api_key": key.strip()})

    gw = payload.arena_gateway_url or saved.get("arena_gateway_url", "https://api.preview.arena.ai")
    save_settings({"arena_gateway_url": gw})

    result = discover_arena_models(api_key=key, gateway_url=gw)
    if result.get("gateway_url"):
        save_settings({"arena_gateway_url": result["gateway_url"]})
    return result


@app.post("/api/research")
def api_research(payload: ResearchPayload) -> dict[str, Any]:
    if not payload.topic.strip():
        raise HTTPException(status_code=400, detail="Bitte gib ein Thema ein.")
    eff_cfg = _effective_arena_cfg(payload.arena_api_key, payload.arena_gateway_url, payload.arena_model)
    if payload.arena_api_key and not payload.arena_api_key.startswith("••••"):
        save_settings({"arena_api_key": payload.arena_api_key.strip()})

    dossier = run_topic_research(
        topic=payload.topic,
        pillar=payload.pillar,
        editorial_mode=payload.editorial_mode,
        browser_sources=payload.browser_sources,
        arena_settings=eff_cfg,
    )
    return {
        "ok": True,
        "dossier": dossier,
        "settings": _public_settings_view(load_settings()),
    }


@app.post("/api/script/prompts")
def api_script_prompts(payload: ScriptPayload) -> dict[str, Any]:
    """Return official AuronOrigin Showrunner prompts so browser-direct Arena Router mode can call api.arena.ai."""
    sys_p, usr_p = build_auron_script_prompts(
        topic=payload.topic,
        dossier=payload.dossier,
        video_format=payload.video_format,
        duration_target=payload.duration_target,
        editorial_mode=payload.editorial_mode,
        pillar=payload.pillar,
    )
    return {"ok": True, "system_prompt": sys_p, "user_prompt": usr_p}


@app.post("/api/script")
def api_generate_script(payload: ScriptPayload) -> dict[str, Any]:
    if not payload.topic.strip():
        raise HTTPException(status_code=400, detail="Bitte gib ein Thema ein.")

    # If the browser executed the Arena Router call directly (e.g. inside cloud sandbox iframe), parse & normalize
    if payload.browser_raw_llm_text:
        parsed = extract_json_object(payload.browser_raw_llm_text)
        if not parsed or not isinstance(parsed.get("scenes"), list):
            raise HTTPException(status_code=422, detail="Konnte JSON-Blueprint aus der Router-Antwort nicht lesen.")
        totals = record_token_usage(payload.prompt_tokens, payload.completion_tokens)
        bp = normalize_blueprint(
            parsed,
            topic=payload.topic,
            video_format=payload.video_format,
            editorial_mode=payload.editorial_mode,
            pillar=payload.pillar,
        )
        bp["arena_router_used"] = True
        bp["arena_model_used"] = payload.arena_model or "coding-router-preview (Browser-Direkt)"
        bp["cumulative_usage"] = totals
        return {"ok": True, "blueprint": bp, "settings": _public_settings_view(load_settings())}

    eff_cfg = _effective_arena_cfg(payload.arena_api_key, payload.arena_gateway_url, payload.arena_model)
    if payload.arena_api_key and not payload.arena_api_key.startswith("••••"):
        save_settings({"arena_api_key": payload.arena_api_key.strip()})

    bp = generate_video_blueprint(
        topic=payload.topic,
        dossier=payload.dossier,
        video_format=payload.video_format,
        duration_target=payload.duration_target,
        editorial_mode=payload.editorial_mode,
        pillar=payload.pillar,
        arena_settings=eff_cfg,
    )
    return {"ok": True, "blueprint": bp, "settings": _public_settings_view(load_settings())}


@app.post("/api/upload/media")
async def api_upload_media(
    file: UploadFile = File(...),
    kind: str = Form("image"),
) -> dict[str, Any]:
    raw_name = file.filename or "upload.bin"
    ext = Path(raw_name).suffix.lower()
    allowed_exts = {".png", ".jpg", ".jpeg", ".webp", ".wav", ".mp3", ".ogg", ".m4a"}
    if ext not in allowed_exts:
        ext = ".wav" if kind == "audio" else ".png"

    file_id = f"{kind}_{uuid.uuid4().hex[:12]}{ext}"
    dest = UPLOADS_DIR / file_id
    data = await file.read()
    if len(data) > 60 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Datei ist größer als 60 MB.")
    dest.write_bytes(data)
    return {"ok": True, "file_id": file_id, "size_bytes": len(data)}


@app.post("/api/preview-motif")
def api_preview_motif(payload: PreviewMotifPayload) -> Response:
    w, h = (360, 640) if payload.video_format == "9:16" else (640, 360)
    custom_path = (UPLOADS_DIR / payload.custom_image_id) if payload.custom_image_id else None
    img = render_sacred_motif_plate(
        motif=payload.visual_motif if payload.visual_motif in VISUAL_MOTIFS else "eye_of_horus",
        width=w,
        height=h,
        seed=42,
        custom_image_path=custom_path if (custom_path and custom_path.exists()) else None,
    ).resize((w, h))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=88)
    return Response(content=buf.getvalue(), media_type="image/jpeg")


def _update_job(job_id: str, **fields: Any) -> None:
    with JOBS_LOCK:
        if job_id in RENDER_JOBS:
            RENDER_JOBS[job_id].update(fields)


def _execute_render_job(job_id: str, payload: RenderPayload) -> None:
    job_dir = RENDERS_DIR / job_id
    work_dir = job_dir / "work"
    job_dir.mkdir(parents=True, exist_ok=True)
    work_dir.mkdir(parents=True, exist_ok=True)

    try:
        cfg = load_settings()
        for k, v in payload.settings_override.items():
            if v is not None and not (isinstance(v, str) and v.startswith("••••")):
                cfg[k] = v

        bp = normalize_blueprint(
            payload.blueprint,
            topic=str(payload.blueprint.get("title") or "AuronOrigin Analyse"),
            video_format=str(payload.blueprint.get("video_format") or "9:16"),
            editorial_mode=str(payload.blueprint.get("editorial_mode") or cfg.get("editorial_mode", "fakten_mystery")),
            pillar=payload.blueprint.get("pillar"),
        )

        uploaded_audio_paths: dict[int, Path] = {}
        for sc_key, fid in payload.uploaded_scene_audio.items():
            try:
                s_num = int(sc_key)
                cand = UPLOADS_DIR / Path(fid).name
                if cand.exists():
                    uploaded_audio_paths[s_num] = cand
            except ValueError:
                continue

        custom_music_path: Path | None = None
        if payload.custom_music_file_id:
            cand_m = UPLOADS_DIR / Path(payload.custom_music_file_id).name
            if cand_m.exists():
                custom_music_path = cand_m

        def on_prog(pct: int, msg: str) -> None:
            _update_job(job_id, progress=pct, message=msg)

        on_prog(6, "Starte AuronOrigin Audio-Engine (Tonstimme & Mastering)…")
        audio_bundle = build_master_audio_timeline(
            scenes=bp["scenes"],
            work_dir=work_dir,
            settings=cfg,
            uploaded_scene_audio=uploaded_audio_paths,
            custom_music_path=custom_music_path,
            progress_cb=on_prog,
        )

        # Copy mastered voiceover WAV to job root for clean single-click download
        voice_export = job_dir / "voiceover_master.wav"
        shutil.copy2(audio_bundle["voice_only_wav"], voice_export)

        safe_slug = re.sub(r"[^A-Za-z0-9_-]+", "_", bp["title"])[:42].strip("_") or "AuronOrigin_Video"
        final_mp4 = job_dir / f"{safe_slug}.mp4"

        vis_bundle = render_complete_auron_video(
            blueprint=bp,
            audio_bundle=audio_bundle,
            work_dir=work_dir,
            final_mp4_path=final_mp4,
            settings=cfg,
            quality=payload.quality,
            progress_cb=on_prog,
        )

        # Persist blueprint & SEO metadata inside job directory
        meta = {
            "job_id": job_id,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "title": bp["title"],
            "pillar": bp["pillar"],
            "video_format": bp["video_format"],
            "resolution": vis_bundle["resolution"],
            "duration_sec": vis_bundle["duration_sec"],
            "tts_engines_used": audio_bundle["tts_engines_used"],
            "video_filename": final_mp4.name,
            "thumbnail_filename": vis_bundle["thumbnail_path"].name,
            "srt_filename": vis_bundle["srt_path"].name,
            "blueprint": bp,
        }
        (job_dir / "metadata.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")

        # Clean intermediate work files to save disk space
        shutil.rmtree(work_dir, ignore_errors=True)

        urls = {
            "video_url": f"/api/renders/{job_id}/video.mp4",
            "thumbnail_url": f"/api/renders/{job_id}/thumbnail.png",
            "voiceover_url": f"/api/renders/{job_id}/voiceover.wav",
            "srt_url": f"/api/renders/{job_id}/subtitles.srt",
            "zip_url": f"/api/renders/{job_id}/package.zip",
        }

        append_history(
            {
                "job_id": job_id,
                "created_at": meta["created_at"],
                "title": bp["title"],
                "pillar": bp["pillar"],
                "video_format": bp["video_format"],
                "resolution": vis_bundle["resolution"],
                "duration_sec": vis_bundle["duration_sec"],
                **urls,
            }
        )

        _update_job(
            job_id,
            status="completed",
            progress=100,
            message="Video erfolgreich gerendert & bereit für YouTube!",
            result={**meta, **urls},
        )
    except Exception as exc:
        _update_job(
            job_id,
            status="failed",
            message=f"Render-Fehler: {exc}",
            error=str(exc),
        )


@app.post("/api/render")
def api_start_render(payload: RenderPayload) -> dict[str, Any]:
    scenes = payload.blueprint.get("scenes") if isinstance(payload.blueprint, dict) else None
    if not scenes or not isinstance(scenes, list):
        raise HTTPException(status_code=400, detail="Das Produktions-Skript enthält noch keine Szenen.")

    job_id = uuid.uuid4().hex[:10]
    with JOBS_LOCK:
        RENDER_JOBS[job_id] = {
            "job_id": job_id,
            "status": "running",
            "progress": 2,
            "message": "Initialisiere AuronOrigin Produktions-Pipeline…",
            "created_ts": time.time(),
        }

    worker = threading.Thread(target=_execute_render_job, args=(job_id, payload), daemon=True)
    worker.start()
    return {"ok": True, "job_id": job_id}


@app.get("/api/jobs/{job_id}")
def api_get_job(job_id: str) -> dict[str, Any]:
    with JOBS_LOCK:
        job = RENDER_JOBS.get(job_id)
        if job:
            return {"ok": True, "job": dict(job)}

    # Check persisted job on disk if server restarted
    meta_file = RENDERS_DIR / Path(job_id).name / "metadata.json"
    if meta_file.exists():
        meta = json.loads(meta_file.read_text(encoding="utf-8"))
        urls = {
            "video_url": f"/api/renders/{job_id}/video.mp4",
            "thumbnail_url": f"/api/renders/{job_id}/thumbnail.png",
            "voiceover_url": f"/api/renders/{job_id}/voiceover.wav",
            "srt_url": f"/api/renders/{job_id}/subtitles.srt",
            "zip_url": f"/api/renders/{job_id}/package.zip",
        }
        return {
            "ok": True,
            "job": {
                "job_id": job_id,
                "status": "completed",
                "progress": 100,
                "message": "Fertiggestellt",
                "result": {**meta, **urls},
            },
        }
    raise HTTPException(status_code=404, detail="Render-Auftrag nicht gefunden.")


@app.get("/api/renders/{job_id}/{artifact}")
def api_get_render_artifact(job_id: str, artifact: str) -> Response:
    safe_id = Path(job_id).name
    job_dir = RENDERS_DIR / safe_id
    meta_file = job_dir / "metadata.json"
    if not meta_file.exists():
        raise HTTPException(status_code=404, detail="Render-Artefakt nicht gefunden.")
    meta = json.loads(meta_file.read_text(encoding="utf-8"))

    if artifact == "video.mp4":
        vp = job_dir / meta["video_filename"]
        return FileResponse(str(vp), media_type="video/mp4", filename=vp.name)

    if artifact == "thumbnail.png":
        tp = job_dir / meta["thumbnail_filename"]
        return FileResponse(str(tp), media_type="image/png", filename=tp.name)

    if artifact == "voiceover.wav":
        wp = job_dir / "voiceover_master.wav"
        return FileResponse(str(wp), media_type="audio/wav", filename=f"{Path(meta['video_filename']).stem}_voiceover.wav")

    if artifact == "subtitles.srt":
        sp = job_dir / meta["srt_filename"]
        return FileResponse(str(sp), media_type="text/plain; charset=utf-8", filename=sp.name)

    if artifact == "package.zip":
        bp = meta.get("blueprint", {})
        seo = bp.get("youtube_seo", {})
        poll = seo.get("community_poll", {})
        seo_txt = (
            f"=== AURONORIGIN YOUTUBE UPLOAD-PAKET ===\n\n"
            f"HAUPTTITEL:\n{bp.get('title', '')}\n\n"
            f"ALTERNATIVE CTR-TITEL:\n"
            + "\n".join(f"- {t}" for t in bp.get("alt_titles", []))
            + f"\n\nTHUMBNAIL-TEXT:\n{bp.get('thumbnail_text', '')} ({bp.get('thumbnail_subtext', '')})\n\n"
            f"YOUTUBE-BESCHREIBUNG:\n{seo.get('description', '')}\n\n"
            f"ANGEPINNTER KOMMENTAR ([FAKT / DEUTUNG]):\n{seo.get('pinned_comment', '')}\n\n"
            f"COMMUNITY-UMFRAGE:\nFrage: {poll.get('question', '')}\n"
            + "\n".join(f"  [ ] {opt}" for opt in poll.get("options", []))
            + f"\n\nTAGS (Kommagetrennt zum Kopieren):\n{', '.join(seo.get('tags', []))}\n"
        )
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            vp = job_dir / meta["video_filename"]
            tp = job_dir / meta["thumbnail_filename"]
            sp = job_dir / meta["srt_filename"]
            if vp.exists():
                zf.write(vp, arcname=vp.name)
            if tp.exists():
                zf.write(tp, arcname=tp.name)
            if sp.exists():
                zf.write(sp, arcname=sp.name)
            zf.writestr("YouTube_SEO_Upload_Infos.txt", seo_txt)
            zf.writestr("Skript_Blueprint.json", json.dumps(bp, indent=2, ensure_ascii=False))

        zip_name = f"{Path(meta['video_filename']).stem}_YouTube_Paket.zip"
        return Response(
            content=buf.getvalue(),
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{zip_name}"'},
        )

    raise HTTPException(status_code=404, detail="Unbekannter Dateityp.")
