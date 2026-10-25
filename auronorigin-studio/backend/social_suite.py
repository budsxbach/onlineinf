"""Multi-Platform Social Media Publishing, Cover/Thumbnail & Validated Subtitle Suite.

Generates copy-paste-ready German metadata, interactive elements (YouTube In-Video Quiz,
YouTube End-Screen/Abspann configuration, Instagram Reel Poll & Alt-Text, TikTok Search-SEO,
Facebook/Meta Business Suite Title & A/B Test), validated multi-format subtitles (.srt,
.de_DE.srt, .vtt, .txt), and safe-zone-engineered Covers & Thumbnails for:
- YouTube (16:9 Thumbnail 1280x720 + Shorts Cover 1080x1920)
- TikTok (9:16 Safe-Zone & Profile-Grid Cover 1080x1920)
- Instagram (9:16 Unified Safe-Zone Reel Cover 1080x1920 + 4:5 Feed Cover 1080x1350)
- Facebook (16:9 Meta Video Thumbnail 1200x675 + 9:16 Facebook Reel Cover 1080x1920)
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from .config import BRAND_IDENTITY, UPLOADS_DIR
from .visual_engine import render_sacred_motif_plate

# AuronOrigin Brand Colors
C_BG_DEEP = (11, 12, 16)         # #0B0C10
C_STEEL = (31, 40, 51)           # #1F2833
C_GOLD = (212, 175, 55)          # #D4AF37
C_GOLD_BRIGHT = (246, 216, 118)  # #F6D876
C_VIOLET = (74, 35, 90)          # #4A235A
C_TEXT = (214, 218, 224)
C_MUTED = (138, 154, 176)


def _load_font(family: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    font_path = BRAND_IDENTITY["fonts"].get(family, "")
    try:
        return ImageFont.truetype(font_path, size=size)
    except Exception:
        return ImageFont.load_default()


def _wrap_text(draw: ImageDraw.ImageDraw, text: str, font: Any, max_width: int) -> list[str]:
    words = text.split()
    if not words:
        return []
    lines: list[str] = []
    cur = words[0]
    for w in words[1:]:
        test = f"{cur} {w}"
        bb = draw.textbbox((0, 0), test, font=font)
        if (bb[2] - bb[0]) <= max_width:
            cur = test
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def _fit_font_and_wrap(
    draw: ImageDraw.ImageDraw,
    text: str,
    family: str,
    start_size: int,
    min_size: int,
    max_width: int,
    max_lines: int = 3,
) -> tuple[Any, list[str], int]:
    """Auto-scale font size so long German compound words (e.g. QUANTENVERSCHRÄNKUNG) never clip."""
    for sz in range(start_size, min_size - 1, -2):
        fnt = _load_font(family, sz)
        lines = _wrap_text(draw, text, fnt, max_width)
        if len(lines) <= max_lines and all((draw.textbbox((0, 0), ln, font=fnt)[2] - draw.textbbox((0, 0), ln, font=fnt)[0]) <= max_width for ln in lines):
            return fnt, lines, int(sz * 1.18)

    # Fallback at min_size: hyphenate any single ultra-long German compound word cleanly
    fnt = _load_font(family, min_size)
    raw_lines = _wrap_text(draw, text, fnt, max_width)
    fixed: list[str] = []
    for ln in raw_lines:
        while (draw.textbbox((0, 0), ln, font=fnt)[2] - draw.textbbox((0, 0), ln, font=fnt)[0]) > max_width and len(ln) > 6:
            mid = len(ln) // 2
            fixed.append(ln[:mid] + "-")
            ln = ln[mid:]
        fixed.append(ln)
    return fnt, fixed[:max_lines], int(min_size * 1.18)


def _fmt_mmss(seconds: float) -> str:
    total = max(0, int(round(seconds)))
    mins = total // 60
    secs = total % 60
    return f"{mins:02d}:{secs:02d}"


def _fmt_srt_time(seconds: float, vtt: bool = False) -> str:
    ms_total = max(0, int(round(seconds * 1000)))
    hrs = ms_total // 3600000
    rem = ms_total % 3600000
    mins = rem // 60000
    rem %= 60000
    secs = rem // 1000
    ms = rem % 1000
    sep = "." if vtt else ","
    return f"{hrs:02d}:{mins:02d}:{secs:02d}{sep}{ms:03d}"


def _wrap_caption_two_lines(text: str, max_line_chars: int = 40) -> str:
    """Wrap subtitle cues cleanly into max 2 balanced lines with zero markup (YouTube/Meta spec)."""
    clean = re.sub(r"<[^>]+>", "", str(text or ""))
    clean = re.sub(r"\s+", " ", clean).strip()
    if len(clean) <= max_line_chars:
        return clean
    words = clean.split(" ")
    mid = len(clean) // 2
    best_split = 1
    acc = 0
    best_dist = 9999
    for idx in range(1, len(words)):
        acc += len(words[idx - 1]) + 1
        dist = abs(acc - mid)
        if dist < best_dist:
            best_dist = dist
            best_split = idx
    line1 = " ".join(words[:best_split]).strip()
    line2 = " ".join(words[best_split:]).strip()
    return f"{line1}\n{line2}" if line2 else line1


def write_subtitle_bundle(
    *,
    all_captions: list[dict[str, Any]],
    job_dir: Path,
    safe_slug: str,
    offset_sec: float = 0.0,
) -> dict[str, str]:
    """Write strictly validated, monotonic, non-overlapping .srt, .de_DE.srt, .vtt, and .txt files."""
    normalized: list[dict[str, Any]] = []
    cursor_end = 0.0

    for raw in all_captions:
        txt = _wrap_caption_two_lines(str(raw.get("text") or ""), max_line_chars=40)
        if not txt:
            continue
        s_t = max(cursor_end, float(raw.get("start", 0.0)) + offset_sec)
        e_t = max(s_t + 0.45, float(raw.get("end", s_t + 1.2)) + offset_sec)
        normalized.append({"start": round(s_t, 3), "end": round(e_t, 3), "text": txt})
        cursor_end = round(e_t + 0.02, 3)

    srt_blocks: list[str] = []
    vtt_blocks: list[str] = ["WEBVTT\nKind: captions\nLanguage: de\n"]
    plain_lines: list[str] = []

    for idx, item in enumerate(normalized, start=1):
        t0_srt = _fmt_srt_time(item["start"], vtt=False)
        t1_srt = _fmt_srt_time(item["end"], vtt=False)
        srt_blocks.append(f"{idx}\n{t0_srt} --> {t1_srt}\n{item['text']}\n")

        t0_vtt = _fmt_srt_time(item["start"], vtt=True)
        t1_vtt = _fmt_srt_time(item["end"], vtt=True)
        vtt_blocks.append(f"{idx}\n{t0_vtt} --> {t1_vtt}\n{item['text']}\n")

        plain_lines.append(item["text"].replace("\n", " "))

    srt_content = "\n".join(srt_blocks).strip() + "\n"
    vtt_content = "\n".join(vtt_blocks).strip() + "\n"
    txt_content = "\n\n".join(plain_lines).strip() + "\n"

    yt_srt = job_dir / f"{safe_slug}_untertitel.srt"
    fb_srt = job_dir / f"{safe_slug}.de_DE.srt"
    web_vtt = job_dir / f"{safe_slug}_untertitel.vtt"
    plain_txt = job_dir / f"{safe_slug}_transkript_deutsch.txt"

    yt_srt.write_text(srt_content, encoding="utf-8")
    fb_srt.write_text(srt_content, encoding="utf-8")
    web_vtt.write_text(vtt_content, encoding="utf-8")
    plain_txt.write_text(txt_content, encoding="utf-8")

    return {
        "srt_filename": yt_srt.name,
        "fb_srt_filename": fb_srt.name,
        "vtt_filename": web_vtt.name,
        "txt_filename": plain_txt.name,
    }


def _render_vertical_safezone_cover(
    *,
    blueprint: dict[str, Any],
    out_png: Path,
    platform_badge: str,
    safe_top_px: int,
    safe_bottom_px: int,
    safe_right_px: int,
    seed_offset: int,
    scene_image_mode: str = "auto_ai_brand",
) -> Path:
    """Render a 1080x1920 vertical 9:16 Cover strictly inside each platform's UI & Profile-Grid Safe Zone."""
    w, h = 1080, 1920
    scenes = blueprint.get("scenes") or []
    sc_pick = scenes[min(len(scenes) - 1, seed_offset % max(1, len(scenes)))] if scenes else {}
    motif = str(sc_pick.get("visual_motif") or "solar_eclipse_crown")
    base_seed = int(sc_pick.get("visual_seed") or 515151) + seed_offset * 977
    prompt_en = str(sc_pick.get("image_prompt_en") or "")
    custom_id = str(sc_pick.get("custom_image_id") or "").strip()
    custom_path = (UPLOADS_DIR / Path(custom_id).name) if custom_id else None

    bg = render_sacred_motif_plate(
        motif=motif,
        width=w,
        height=h,
        seed=base_seed,
        custom_image_path=custom_path if (custom_path and custom_path.exists()) else None,
        prompt_en=prompt_en,
        scene_image_mode=scene_image_mode,
    ).resize((w, h), Image.Resampling.LANCZOS)

    rgba = bg.convert("RGBA")

    # Central dark radial scrim inside the 1:1 / 3:4 profile grid crop (y=460..1460) so cover headline pops
    scrim = np.zeros((h, w, 4), dtype=np.uint8)
    yy, xx = np.ogrid[:h, :w]
    cy_focus = (safe_top_px + (h - safe_bottom_px)) // 2
    cx_focus = (w - safe_right_px // 2) // 2
    dist = np.sqrt(((xx - cx_focus) / (w * 0.56)) ** 2 + ((yy - cy_focus) / (h * 0.28)) ** 2)
    alpha_mid = (np.clip(1.0 - dist, 0.0, 1.0) ** 1.3 * 168.0).astype(np.uint8)
    scrim[:, :, 0] = C_BG_DEEP[0]
    scrim[:, :, 1] = C_BG_DEEP[1]
    scrim[:, :, 2] = C_BG_DEEP[2]
    scrim[:, :, 3] = alpha_mid
    rgba = Image.alpha_composite(rgba, Image.fromarray(scrim, mode="RGBA"))

    draw = ImageDraw.Draw(rgba)

    # Subtle sacred-gold frame inset within safe margins
    left_pad = 76
    right_limit = w - max(76, safe_right_px)
    box_w = right_limit - left_pad
    center_x = left_pad + box_w // 2

    # Pillar + Platform micro-pill above main trigger (kept strictly inside 3:4 & 1:1 profile-grid safe area!)
    pillar = str(blueprint.get("pillar") or "AURONORIGIN").upper()
    pill_text = f"{pillar}"
    f_pill = _load_font("inter", 26)
    pbb = draw.textbbox((0, 0), pill_text, font=f_pill)
    pw, ph = (pbb[2] - pbb[0]) + 46, (pbb[3] - pbb[1]) + 24

    # Place text block vertically centered around y = 860 (safe in 9:16 Feed, 4:5 Grid, AND 1:1 Grid!)
    trigger = str(blueprint.get("thumbnail_text") or "DER REALITÄTS-CODE").upper()
    f_hero, hero_lines, line_h = _fit_font_and_wrap(draw, trigger, "cinzel", 78, 36, box_w - 36, max_lines=3)
    block_h = ph + 34 + len(hero_lines) * line_h + 74

    start_y = max(safe_top_px + 40, min(h - safe_bottom_px - block_h - 30, 910 - block_h // 2))

    px0 = center_x - pw // 2
    draw.rounded_rectangle(
        [px0, start_y, px0 + pw, start_y + ph],
        radius=999,
        fill=(*C_VIOLET, 232),
        outline=(*C_GOLD_BRIGHT, 240),
        width=2,
    )
    draw.text((center_x, start_y + ph // 2), pill_text, font=f_pill, fill=(*C_GOLD_BRIGHT, 255), anchor="mm")

    ty = start_y + ph + 32
    for ln in hero_lines:
        lbb = draw.textbbox((0, 0), ln, font=f_hero)
        lw = lbb[2] - lbb[0]
        tx = center_x - lw // 2
        draw.text((tx + 4, ty + 5), ln, font=f_hero, fill=(0, 0, 0, 245))
        draw.text((tx, ty), ln, font=f_hero, fill=(*C_GOLD_BRIGHT, 255))
        ty += line_h

    # Decorative golden divider + subtitle inside safe zone
    div_half = min(210, box_w // 3)
    draw.line([(center_x - div_half, ty + 8), (center_x + div_half, ty + 8)], fill=(*C_GOLD, 215), width=3)
    draw.polygon(
        [(center_x, ty + 1), (center_x + 7, ty + 8), (center_x, ty + 15), (center_x - 7, ty + 8)],
        fill=(*C_GOLD_BRIGHT, 255),
    )

    sub_raw = str(blueprint.get("thumbnail_subtext") or "FAKTEN & MYSTERIUM").upper()
    f_sub = _load_font("inter", 32)
    sub_lines = _wrap_text(draw, sub_raw, f_sub, box_w - 30)[:2]
    sy = ty + 28
    for sln in sub_lines:
        sbb = draw.textbbox((0, 0), sln, font=f_sub)
        sw = sbb[2] - sbb[0]
        sx = center_x - sw // 2
        draw.text((sx + 2, sy + 2), sln, font=f_sub, fill=(0, 0, 0, 235))
        draw.text((sx, sy), sln, font=f_sub, fill=(*C_TEXT, 250))
        sy += 42

    # Subtle AuronOrigin seal centered above bottom dead-zone
    wm_path = Path(BRAND_IDENTITY["assets"]["watermark_png"])
    seal_y = min(h - safe_bottom_px - 96, sy + 34)
    if wm_path.exists() and seal_y > sy + 12:
        wm = Image.open(wm_path).convert("RGBA").resize((78, 78), Image.Resampling.LANCZOS)
        rgba.alpha_composite(wm, dest=(center_x - 39, seal_y))

    rgba.convert("RGB").save(str(out_png), format="PNG", optimize=True)
    return out_png


def _render_portrait_4x5_cover(
    *,
    blueprint: dict[str, Any],
    out_png: Path,
    seed_offset: int = 3,
    scene_image_mode: str = "auto_ai_brand",
) -> Path:
    """Render a 1080x1350 (4:5) Portrait Feed Cover for Instagram & Facebook Feeds."""
    w, h = 1080, 1350
    scenes = blueprint.get("scenes") or []
    sc_pick = scenes[min(len(scenes) - 1, seed_offset % max(1, len(scenes)))] if scenes else {}
    motif = str(sc_pick.get("visual_motif") or "ouroboros_seal")
    base_seed = int(sc_pick.get("visual_seed") or 616161) + 3311
    prompt_en = str(sc_pick.get("image_prompt_en") or "")
    custom_id = str(sc_pick.get("custom_image_id") or "").strip()
    custom_path = (UPLOADS_DIR / Path(custom_id).name) if custom_id else None

    bg = render_sacred_motif_plate(
        motif=motif,
        width=w,
        height=h,
        seed=base_seed,
        custom_image_path=custom_path if (custom_path and custom_path.exists()) else None,
        prompt_en=prompt_en,
        scene_image_mode=scene_image_mode,
    ).resize((w, h), Image.Resampling.LANCZOS)

    rgba = bg.convert("RGBA")
    draw = ImageDraw.Draw(rgba)

    # Outer gold border
    draw.rectangle([28, 28, w - 28, h - 28], outline=(*C_GOLD, 185), width=3)

    pillar = str(blueprint.get("pillar") or "AURONORIGIN").upper()
    f_pill = _load_font("inter", 26)
    pbb = draw.textbbox((0, 0), pillar, font=f_pill)
    pw, ph = (pbb[2] - pbb[0]) + 44, (pbb[3] - pbb[1]) + 22
    px0 = (w - pw) // 2
    draw.rounded_rectangle([px0, 92, px0 + pw, 92 + ph], radius=999, fill=(*C_VIOLET, 232), outline=(*C_GOLD_BRIGHT, 240), width=2)
    draw.text((w // 2, 92 + ph // 2), pillar, font=f_pill, fill=(*C_GOLD_BRIGHT, 255), anchor="mm")

    trigger = str(blueprint.get("thumbnail_text") or "DER REALITÄTS-CODE").upper()
    f_hero, lines, line_h = _fit_font_and_wrap(draw, trigger, "cinzel", 80, 38, w - 140, max_lines=3)
    ty = h - 410 - max(0, (len(lines) - 1) * (line_h // 2))
    for ln in lines:
        lbb = draw.textbbox((0, 0), ln, font=f_hero)
        tx = (w - (lbb[2] - lbb[0])) // 2
        draw.text((tx + 4, ty + 5), ln, font=f_hero, fill=(0, 0, 0, 245))
        draw.text((tx, ty), ln, font=f_hero, fill=(*C_GOLD_BRIGHT, 255))
        ty += line_h

    sub_raw = str(blueprint.get("thumbnail_subtext") or "FAKTEN ZUERST • MYSTERY ALS DEUTUNG").upper()
    f_sub = _load_font("inter", 30)
    sbb = draw.textbbox((0, 0), sub_raw, font=f_sub)
    sx = (w - (sbb[2] - sbb[0])) // 2
    draw.text((sx + 2, ty + 14), sub_raw, font=f_sub, fill=(0, 0, 0, 235))
    draw.text((sx, ty + 12), sub_raw, font=f_sub, fill=(*C_TEXT, 248))

    f_brand = _load_font("cinzel", 25)
    b_txt = "AURONORIGIN"
    bbb = draw.textbbox((0, 0), b_txt, font=f_brand)
    draw.text(((w - (bbb[2] - bbb[0])) // 2, h - 82), b_txt, font=f_brand, fill=(*C_GOLD, 230))

    rgba.convert("RGB").save(str(out_png), format="PNG", optimize=True)
    return out_png


def _render_landscape_social_thumbnail(
    *,
    blueprint: dict[str, Any],
    out_png: Path,
    width: int = 1200,
    height: int = 675,
    seed_offset: int = 4,
    scene_image_mode: str = "auto_ai_brand",
) -> Path:
    """Render a 16:9 Landscape Thumbnail (e.g., 1200x675 for Facebook / Meta Business Suite)."""
    scenes = blueprint.get("scenes") or []
    sc_pick = scenes[min(len(scenes) - 1, seed_offset % max(1, len(scenes)))] if scenes else {}
    motif = str(sc_pick.get("visual_motif") or "event_horizon")
    base_seed = int(sc_pick.get("visual_seed") or 717171) + 4409
    prompt_en = str(sc_pick.get("image_prompt_en") or "")
    custom_id = str(sc_pick.get("custom_image_id") or "").strip()
    custom_path = (UPLOADS_DIR / Path(custom_id).name) if custom_id else None

    bg = render_sacred_motif_plate(
        motif=motif,
        width=width,
        height=height,
        seed=base_seed,
        custom_image_path=custom_path if (custom_path and custom_path.exists()) else None,
        prompt_en=prompt_en,
        scene_image_mode=scene_image_mode,
    ).resize((width, height), Image.Resampling.LANCZOS)

    rgba = bg.convert("RGBA")
    grad = np.zeros((height, width, 4), dtype=np.uint8)
    x_norm = np.linspace(0.0, 1.0, width, dtype=np.float32)
    alpha_x = (np.clip(1.0 - x_norm * 0.92, 0.20, 0.88) * 235.0).astype(np.uint8)
    grad[:, :, 0] = C_BG_DEEP[0]
    grad[:, :, 1] = C_BG_DEEP[1]
    grad[:, :, 2] = C_BG_DEEP[2]
    grad[:, :, 3] = alpha_x[None, :]
    rgba = Image.alpha_composite(rgba, Image.fromarray(grad, mode="RGBA"))

    draw = ImageDraw.Draw(rgba)
    draw.rectangle([20, 20, width - 20, height - 20], outline=(*C_GOLD, 180), width=3)

    pillar = str(blueprint.get("pillar") or "AURONORIGIN").upper()
    f_tag = _load_font("inter", 22)
    tb = draw.textbbox((0, 0), pillar, font=f_tag)
    tw, th = tb[2] - tb[0] + 36, tb[3] - tb[1] + 20
    draw.rounded_rectangle([62, 58, 62 + tw, 58 + th], radius=8, fill=(*C_VIOLET, 235), outline=(*C_GOLD_BRIGHT, 240), width=2)
    draw.text((62 + tw // 2, 58 + th // 2), pillar, font=f_tag, fill=(*C_GOLD_BRIGHT, 255), anchor="mm")

    trigger = str(blueprint.get("thumbnail_text") or "DER REALITÄTS-CODE").upper()
    f_hero, lines, line_h = _fit_font_and_wrap(draw, trigger, "cinzel", 78, 38, int(width * 0.84), max_lines=3)
    ty = 172
    for ln in lines:
        draw.text((66, ty + 4), ln, font=f_hero, fill=(0, 0, 0, 245))
        draw.text((62, ty), ln, font=f_hero, fill=(*C_GOLD_BRIGHT, 255))
        ty += line_h

    sub = str(blueprint.get("thumbnail_subtext") or "AKTUELLE FAKTEN & MYSTERIUM").upper()
    f_sub = _load_font("inter", 29)
    draw.text((64, ty + 16), sub, font=f_sub, fill=(*C_TEXT, 245))

    wm_path = Path(BRAND_IDENTITY["assets"]["watermark_png"])
    if wm_path.exists():
        wm = Image.open(wm_path).convert("RGBA").resize((104, 104), Image.Resampling.LANCZOS)
        rgba.alpha_composite(wm, dest=(width - 154, height - 150))

    f_brand = _load_font("cinzel", 24)
    draw.text((62, height - 72), "AURONORIGIN", font=f_brand, fill=(*C_GOLD, 230))

    rgba.convert("RGB").save(str(out_png), format="PNG", optimize=True)
    return out_png


def render_all_social_covers(
    *,
    blueprint: dict[str, Any],
    job_dir: Path,
    safe_slug: str,
    youtube_16x9_filename: str,
    scene_image_mode: str = "auto_ai_brand",
) -> dict[str, dict[str, str]]:
    """Generate dedicated, safe-zone-accurate Covers & Thumbnails for YouTube, TikTok, Instagram, and Facebook."""
    yt_short_fn = f"{safe_slug}_youtube_shorts_cover_1080x1920.png"
    tt_cover_fn = f"{safe_slug}_tiktok_cover_1080x1920.png"
    ig_reel_fn = f"{safe_slug}_instagram_reel_cover_1080x1920.png"
    ig_feed_fn = f"{safe_slug}_instagram_feed_cover_1080x1350.png"
    fb_thumb_fn = f"{safe_slug}_facebook_thumbnail_1200x675.png"
    fb_reel_fn = f"{safe_slug}_facebook_reel_cover_1080x1920.png"

    # YouTube Shorts 9:16 Cover
    _render_vertical_safezone_cover(
        blueprint=blueprint,
        out_png=job_dir / yt_short_fn,
        platform_badge="YOUTUBE SHORTS",
        safe_top_px=240,
        safe_bottom_px=580,
        safe_right_px=130,
        seed_offset=0,
        scene_image_mode=scene_image_mode,
    )

    # TikTok 9:16 Cover (strictly avoids right 180px icon rail, top 240px & bottom 640px, centered in profile grid)
    _render_vertical_safezone_cover(
        blueprint=blueprint,
        out_png=job_dir / tt_cover_fn,
        platform_badge="TIKTOK",
        safe_top_px=240,
        safe_bottom_px=640,
        safe_right_px=175,
        seed_offset=1,
        scene_image_mode=scene_image_mode,
    )

    # Instagram Reels 9:16 Cover (Meta Unified Safe Zone: 14% top=270px, 35% bottom=672px, centered for 3:4 profile grid)
    _render_vertical_safezone_cover(
        blueprint=blueprint,
        out_png=job_dir / ig_reel_fn,
        platform_badge="INSTAGRAM REELS",
        safe_top_px=270,
        safe_bottom_px=672,
        safe_right_px=95,
        seed_offset=2,
        scene_image_mode=scene_image_mode,
    )

    # Instagram 4:5 Portrait Feed Cover (1080x1350)
    _render_portrait_4x5_cover(
        blueprint=blueprint,
        out_png=job_dir / ig_feed_fn,
        seed_offset=2,
        scene_image_mode=scene_image_mode,
    )

    # Facebook 16:9 Video Thumbnail (1200x675 for Meta Business Suite)
    _render_landscape_social_thumbnail(
        blueprint=blueprint,
        out_png=job_dir / fb_thumb_fn,
        width=1200,
        height=675,
        seed_offset=3,
        scene_image_mode=scene_image_mode,
    )

    # Facebook 9:16 Reel Cover (1080x1920)
    _render_vertical_safezone_cover(
        blueprint=blueprint,
        out_png=job_dir / fb_reel_fn,
        platform_badge="FACEBOOK REELS",
        safe_top_px=265,
        safe_bottom_px=660,
        safe_right_px=105,
        seed_offset=3,
        scene_image_mode=scene_image_mode,
    )

    return {
        "youtube_16x9": {
            "filename": youtube_16x9_filename,
            "label": "YouTube Thumbnail (16:9 • 1280×720)",
            "dimensions": "1280×720",
        },
        "youtube_shorts_9x16": {
            "filename": yt_short_fn,
            "label": "YouTube Shorts Cover (9:16 • 1080×1920)",
            "dimensions": "1080×1920",
        },
        "tiktok_9x16": {
            "filename": tt_cover_fn,
            "label": "TikTok Safe-Zone Cover (9:16 • 1080×1920)",
            "dimensions": "1080×1920",
        },
        "instagram_reel_9x16": {
            "filename": ig_reel_fn,
            "label": "Instagram Reels Cover (9:16 • 1080×1920)",
            "dimensions": "1080×1920",
        },
        "instagram_feed_4x5": {
            "filename": ig_feed_fn,
            "label": "Instagram Feed-Vorschau (4:5 • 1080×1350)",
            "dimensions": "1080×1350",
        },
        "facebook_16x9": {
            "filename": fb_thumb_fn,
            "label": "Facebook Video-Thumbnail (16:9 • 1200×675)",
            "dimensions": "1200×675",
        },
        "facebook_reel_9x16": {
            "filename": fb_reel_fn,
            "label": "Facebook Reels Cover (9:16 • 1080×1920)",
            "dimensions": "1080×1920",
        },
    }


def _pillar_hashtags(pillar: str) -> list[str]:
    if pillar == "Alte Codes":
        return ["#AuronOrigin", "#AlteKulturen", "#Archäologie", "#Mysterium", "#AltesWissen"]
    if pillar == "Bewusstseins-Hacks":
        return ["#AuronOrigin", "#Bewusstsein", "#Gehirnforschung", "#Neurowissenschaft", "#Wahrnehmung"]
    return ["#AuronOrigin", "#Quantenphysik", "#Wissenschaft", "#Raumzeit", "#Simulationshypothese"]


def _instagram_topics_for_pillar(pillar: str) -> list[str]:
    if pillar == "Alte Codes":
        return ["Wissenschaft & Technik", "Geschichte & Archäologie", "Kunst & Kultur"]
    if pillar == "Bewusstseins-Hacks":
        return ["Wissenschaft & Technik", "Gesundheit & Achtsamkeit", "Bildung & Wissen"]
    return ["Wissenschaft & Technik", "Weltraum & Astronomie", "Zukunftstechnologie & KI"]


def build_social_publishing_suite(
    *,
    blueprint: dict[str, Any],
    scene_timings: list[dict[str, Any]],
    total_final_dur_sec: float,
    intro_offset_sec: float = 0.0,
    outro_dur_sec: float = 0.0,
) -> dict[str, Any]:
    """Assemble complete, copy-paste-ready German metadata & interactive settings for YouTube, TikTok, Instagram & Facebook."""
    title = str(blueprint.get("title") or "AuronOrigin Analyse").strip()
    pillar = str(blueprint.get("pillar") or "Simulations-News").strip()
    scenes = blueprint.get("scenes") or []
    seo = blueprint.get("youtube_seo") or {}
    poll = seo.get("community_poll") or {}
    social_raw = blueprint.get("social_pack") if isinstance(blueprint.get("social_pack"), dict) else {}

    hook_line = str(scenes[0].get("narration") if scenes else blueprint.get("hook_3s") or title).strip()
    fact_scene = scenes[1] if len(scenes) > 1 else (scenes[0] if scenes else {})
    fact_line = str(fact_scene.get("narration") or "").strip()
    deutung_scene = scenes[-2] if len(scenes) > 2 else fact_scene
    deutung_line = str(deutung_scene.get("narration") or "").strip()

    tags_5 = _pillar_hashtags(pillar)
    tags_5_str = " ".join(tags_5)

    # 1. Exact YouTube Chapters synced to rendered MP4 (YouTube requires first chapter at 00:00 and >=3 chapters)
    chapter_lines: list[str] = []
    if intro_offset_sec > 0.5:
        chapter_lines.append("00:00 AuronOrigin Intro")
    for idx, (sc, tm) in enumerate(zip(scenes, scene_timings)):
        ts_sec = 0.0 if (idx == 0 and intro_offset_sec <= 0.5) else (float(tm["visual_start"]) + intro_offset_sec)
        ch_label = str(sc.get("on_screen_headline") or f"Szene {idx + 1}").title()
        chapter_lines.append(f"{_fmt_mmss(ts_sec)} {ch_label}")
    chapters_text = "\n".join(chapter_lines)

    # Ensure YouTube description embeds exact chapters + strong first 2 lines
    base_yt_desc = str(seo.get("description") or "").strip()
    if "00:00" not in base_yt_desc and chapter_lines:
        yt_description = (
            f"{hook_line}\n"
            f"Fakten zuerst, Mystery als Deutung – alle Hintergründe in dieser AuronOrigin-Analyse.\n\n"
            f"{base_yt_desc}\n\n"
            f"⏱️ KAPITELMARKEN:\n{chapters_text}\n\n"
            f"🔔 Kanal abonnieren: @AuronOrigin\n"
            f"📸 Instagram: @the.auronorigin | Kontakt: contact@auronorigin.world\n\n"
            f"{tags_5_str} #DokuDeutsch"
        ).strip()
    else:
        yt_description = base_yt_desc

    # 2. YouTube Quiz (In-Video Quiz with timestamp + Community-Beitrags-Quiz)
    quiz_raw = social_raw.get("youtube_quiz") if isinstance(social_raw.get("youtube_quiz"), dict) else {}
    # Ideal quiz timestamp: right after Fact 2 / ~55% into the body
    quiz_ts_sec = max(8.0, min(max(8.0, total_final_dur_sec - outro_dur_sec - 8.0), total_final_dur_sec * 0.52))
    if len(scene_timings) >= 3:
        quiz_ts_sec = float(scene_timings[min(2, len(scene_timings) - 1)]["visual_end"]) + intro_offset_sec - 0.5

    quiz_question = str(
        quiz_raw.get("question")
        or f"Wissenstest zum Video: Welcher zentrale Befund rund um „{blueprint.get('thumbnail_text') or title[:32]}“ ist wissenschaftlich belegt?"
    )[:140]
    quiz_options_in = quiz_raw.get("options") if isinstance(quiz_raw.get("options"), list) and len(quiz_raw.get("options")) >= 3 else None
    if quiz_options_in:
        quiz_opts = [str(o)[:78] for o in quiz_options_in[:4]]
        correct_idx = max(0, min(len(quiz_opts) - 1, int(quiz_raw.get("correct_index", 0) or 0)))
        quiz_explanation = str(
            quiz_raw.get("explanation")
            or f"Genau dieser Befund bildet die reale Faktenbasis dieser AuronOrigin-Episode ({pillar})."
        )[:340]
    else:
        short_correct = (fact_line[:74] + "…") if len(fact_line) > 75 else (fact_line or "Präzise Messdaten zeigen reproduzierbare Muster.")
        quiz_opts = [
            short_correct,
            "Es handelt sich lediglich um einen unbestätigten Messfehler aus den 1970ern.",
            "Der Effekt tritt ausschließlich in Computersimulationen ohne reale Messung auf.",
            "Die Fachwelt hat alle Messungen dazu vollständig widerlegt.",
        ]
        correct_idx = 0
        quiz_explanation = (
            f"Richtig! {fact_line[:240]} Genau hier setzt die weiterführende Deutung von AuronOrigin an."
        )[:340]

    quiz_copy_block = (
        f"EINSATZORT 1: YouTube Studio → Videoelemente → „Quiz hinzufügen“ bei Zeitstempel {_fmt_mmss(quiz_ts_sec)}\n"
        f"EINSATZORT 2: YouTube Kanal → Beitrag erstellen → „Quiz“ (Community-Tab)\n\n"
        f"FRAGE:\n{quiz_question}\n\n"
        f"ANTWORTMÖGLICHKEITEN (1 richtige Antwort markieren):\n"
        + "\n".join(
            f"{'[✓ RICHTIG]' if i == correct_idx else '[  Falsch ]'} Option {chr(65 + i)}: {opt}"
            for i, opt in enumerate(quiz_opts)
        )
        + f"\n\nERKLÄRUNG ZUR RICHTIGEN ANTWORT (optionales Feld in YouTube Studio):\n{quiz_explanation}"
    )

    # 3. YouTube End Screen (Abspann) & Info-Karten (Cards) & Shorts Related Video
    if total_final_dur_sec >= 25.0:
        end_len = min(12.0, max(5.5, outro_dur_sec if outro_dur_sec >= 5.0 else 8.0))
        end_start = max(0.0, total_final_dur_sec - end_len)
        info_card_ts = _fmt_mmss(max(6.0, total_final_dur_sec * 0.35))
        abspann_copy_block = (
            f"ABSPANN-ZEITFENSTER (YouTube Studio → Videoelemente → Abspann hinzufügen):\n"
            f"• Startzeit: {_fmt_mmss(end_start)}  bis  Videoende: {_fmt_mmss(total_final_dur_sec)} (Dauer: {end_len:.1f} Sek. – erfüllt die ≥25s YouTube-Regel)\n\n"
            f"EMPFOHLENE ABSPANN-ELEMENTE (Vorlage: „2 Videos + 1 Abo-Button“):\n"
            f"1. Element Links [VIDEO]: „Bestes Video für den Zuschauer“ (maximiert laut YouTube-Algorithmus die Session-Watchtime)\n"
            f"2. Element Rechts [PLAYLIST]: Öffentliche Playlist „AuronOrigin • {pillar}“\n"
            f"3. Element Mitte/Unten [ABONNIEREN]: Kanal-Button @AuronOrigin\n\n"
            f"ZUSATZ FÜR YOUTUBE SHORTS (9:16):\n"
            f"• Feld „Verknüpftes Video“ (Related Video im Rechts-Menü): Verknüpfe dein passendes Langvideo oder ein zweites Video aus „{pillar}“ (erscheint als klickbarer Play-Link direkt über dem Shorts-Titel!).\n\n"
            f"INFO-KARTE (Card während des Videos):\n"
            f"• Zeitstempel {info_card_ts} → Playlist „{pillar}“ verlinken."
        )
    else:
        abspann_copy_block = (
            f"HINWEIS ZUR VIDEOLÄNGE ({total_final_dur_sec:.1f} Sek.):\n"
            f"• Klassische YouTube-Abspanne erfordern mindestens 25 Sekunden Gesamtlänge. Aktiviere im Studio einfach „Offizielles AuronOrigin Intro/Outro“ oder ab 5 Szenen für volle Abspann-Unterstützung.\n"
            f"• Für YouTube Shorts: Nutze im Upload-Menü rechts das Feld „Verknüpftes Video“ (Related Video) und wähle deine Playlist/Episode zu „{pillar}“."
        )

    raw_tags = [str(t).strip() for t in (seo.get("tags") or []) if str(t).strip()]
    tags_csv = ", ".join(raw_tags)
    if len(tags_csv) > 490:
        tags_csv = tags_csv[:490].rsplit(",", 1)[0]

    yt_settings_checklist = (
        "• Zielgruppe: „Nein, es ist nicht speziell für Kinder“ (WICHTIG: sonst deaktiviert YouTube Kommentare, Quiz & Abspann!)\n"
        "• Veränderte oder synthetische Inhalte (Pflichtfeld 2026): „Nein“ bei abstrakten/symbolischen Kosmos-Grafiken; „Ja“ wählen, falls fotorealistisch wirkende KI-Realszenen gezeigt werden.\n"
        "• Videosprache & Titel-/Beschreibungssprache: Deutsch\n"
        "• Kategorie: Wissenschaft & Technik\n"
        "• Untertitel hochladen: Videoelemente → Untertitel → „Datei hochladen“ → „Mit Zeitangaben“ → die enthaltene .SRT-Datei auswählen\n"
        "• Kommentare: „Ein“ (Moderation: Grundlegend) + direkt nach Veröffentlichung den angepinnten Kommentar oben fixieren"
    )

    poll_q = str(poll.get("question") or f"Wie ordnest du diesen Befund in „{pillar}“ ein?")
    poll_opts = [str(o) for o in (poll.get("options") or ["Rein physikalisch erklärbar [FAKT]", "Hinweis auf tieferen Code [DEUTUNG]", "Beides greift ineinander"])]
    yt_poll_block = f"FRAGE:\n{poll_q}\n\nANTWORTEN:\n" + "\n".join(f"• {o}" for o in poll_opts)

    # 4. TikTok Copy-Paste Suite (2026 Search-SEO + 5 Caption Hashtags + Cover Text + Disclosure)
    tt_raw = social_raw.get("tiktok") if isinstance(social_raw.get("tiktok"), dict) else {}
    tt_cover_title = str(tt_raw.get("cover_text") or blueprint.get("thumbnail_text") or title[:28]).upper()[:36]
    tt_search_kw = str(tt_raw.get("search_keywords") or f"{pillar} {blueprint.get('thumbnail_text', '').title()} erklärt").strip()
    tt_caption = str(
        tt_raw.get("caption")
        or (
            f"{hook_line}\n\n"
            f"📌 Fakt dahinter: {fact_line}\n\n"
            f"💭 Zufall der Naturgesetze oder steckt eine tiefere Ordnung dahinter? Schreib deine Sicht in die Kommentare & speichere das Video für später!\n\n"
            f"{tags_5_str}"
        )
    ).strip()
    tt_first_comment = str(
        tt_raw.get("first_comment")
        or f"Team [FAKT] oder Team [TIEFERER CODE]? Schreib deine Meinung unten rein 👇 (Suchbegriff zum Vertiefen: {tt_search_kw})"
    )
    tt_settings = (
        f"• Cover-Bild: Lade „{tt_cover_title}“ (Datei: *_tiktok_cover_1080x1920.png) hoch – Text liegt exakt in der 2026 TikTok Safe-Zone & im Profilraster!\n"
        f"• Such-SEO (blauer Suchlink über Kommentaren): Keywords „{tt_search_kw}“ sind in Caption & erstem Kommentar verankert.\n"
        f"• Originalton benennen: „Originalton – AuronOrigin | {pillar}“\n"
        f"• Playlist / Serie zuordnen: „AuronOrigin • {pillar}“\n"
        f"• Untertitel (TikTok Studio Web): Enthaltene .SRT oder .VTT Datei hochladen\n"
        f"• KI-generierte Inhalte (EU Art. 50 / TikTok Schalter): Nur bei fotorealistischen Personen/Ereignissen aktivieren; Skript & Grafikdesign benötigen kein Deepfake-Label."
    )

    # 5. Instagram Reels & Feed Suite (First line <125 chars, Official max 5 Hashtags, Alt-Text, Caption Poll, Topics)
    ig_raw = social_raw.get("instagram") if isinstance(social_raw.get("instagram"), dict) else {}
    ig_hook_125 = hook_line if len(hook_line) <= 122 else (hook_line[:119].rsplit(" ", 1)[0] + "…")
    ig_caption = str(
        ig_raw.get("caption")
        or (
            f"{ig_hook_125}\n\n"
            f"🔬 [FAKT]: {fact_line}\n\n"
            f"🌌 [DEUTUNG]: {deutung_line}\n\n"
            f"📌 Speichere dir diesen Beitrag für später & folge @the.auronorigin für tägliche Analysen zwischen Wissenschaft und Mysterium.\n\n"
            f"{tags_5_str}"
        )
    ).strip()
    ig_alt_text = str(
        ig_raw.get("alt_text")
        or (
            f"AuronOrigin Wissenschafts- und Mystery-Reel im dunkelblauen und goldenen Kosmos-Design zum Thema „{title}“ "
            f"(Säule: {pillar}). Enthält geprüfte wissenschaftliche Fakten, deutsche Sprachausgabe und eingebrannte Untertitel."
        )
    )
    ig_topics = _instagram_topics_for_pillar(pillar)
    ig_poll_block = (
        f"UMFRAGE-FRAGE (Instagram → „Umfrage hinzufügen“ unter der Caption):\n"
        f"Zufall oder tieferer Code?\n\n"
        f"ANTWORT-OPTIONEN (je max. 24 Zeichen nach Instagram-Limit):\n"
        f"• Option 1: Reiner Zufall [FAKT]\n"
        f"• Option 2: Tieferer Code!\n"
        f"• Option 3: Beides zusammen\n"
        f"• Option 4: Mehr dazu bitte!"
    )
    ig_audio_name = f"AuronOrigin • {blueprint.get('thumbnail_text', pillar).title()}"
    ig_settings = (
        f"• Cover hochladen: Nutze *_instagram_reel_cover_1080x1920.png (Text sitzt exakt in der neuen Meta 2026 Safe-Zone UND im vertikalen 3:4/4:5 Profilraster!).\n"
        f"• „Auch im Feed teilen“ (Share to Feed): Aktivieren ✓ (optional *_instagram_feed_cover_1080x1350.png für reine 4:5 Posts).\n"
        f"• Hashtag-Regel (offizielles Instagram-Limit): Exakt 5 hochrelevante Hashtags sind bereits am Ende der Caption eingesetzt (mehr als 5 blockieren Kommentare/Reichweite!).\n"
        f"• Themen hinzufügen (Add Topics – 3 wählen): {', '.join(ig_topics)}\n"
        f"• Original-Audio umbenennen in: „{ig_audio_name}“\n"
        f"• Erweiterte Einstellungen → „Alternativtext schreiben“: Den vorbereiteten SEO-Alt-Text unten per Copy-Paste einfügen."
    )

    # 6. Facebook Reels & Meta Business Suite Video Suite (Separate Title + A/B Title + Description + .de_DE.srt)
    fb_raw = social_raw.get("facebook") if isinstance(social_raw.get("facebook"), dict) else {}
    fb_title = str(fb_raw.get("title") or title)[:65]
    alt_list = blueprint.get("alt_titles") or []
    fb_ab_title = str(fb_raw.get("ab_test_title") or (alt_list[0] if alt_list else f"Was aktuelle Daten über {blueprint.get('thumbnail_text', title)[:30]} verraten"))[:65]
    fb_tags_4 = " ".join(tags_5[:4])
    fb_description = str(
        fb_raw.get("description")
        or (
            f"{hook_line}\n\n"
            f"Was zunächst wie Science-Fiction klingt, hat einen messbaren wissenschaftlichen Kern: {fact_line}\n\n"
            f"{deutung_line}\n\n"
            f"👇 Wie siehst du das: Klassisch erklärbarer Zufall der Naturgesetze – oder blicken wir hier auf eine tiefere Ordnung? "
            f"Schreib deine Gedanken in die Kommentare und folge AuronOrigin für die nächste Entschlüsselung!\n\n"
            f"{fb_tags_4}"
        )
    ).strip()
    fb_first_comment = str(
        fb_raw.get("first_comment")
        or f"Welches Phänomen aus „{pillar}“ sollen wir in der nächsten AuronOrigin-Folge unter die Lupe nehmen? Schreib deinen Themenwunsch hier drunter 👇"
    )
    fb_settings = (
        "• Meta Business Suite → „Reel erstellen“ (oder „Video veröffentlichen“ bei 16:9 Breitbild):\n"
        "• Thumbnail / Cover: Für 9:16 Reels *_facebook_reel_cover_1080x1920.png nutzen; für 16:9 Videos & A/B-Thumbnail-Test *_facebook_thumbnail_1200x675.png hochladen.\n"
        "• A/B-Test in Meta Business Suite: Teste Haupttitel gegen den untenstehenden A/B-Alternativtitel für bis zu +25 % mehr Reichweite.\n"
        "• Untertitel-Datei hochladen: Wähle im ZIP-Ordner die Datei mit der Endung „.de_DE.srt“ – durch dieses Namensschema erkennt Facebook automatisch „Deutsch“ ohne Fehlermeldung!\n"
        "• Crossposting & Verteilung: „Auf Facebook Watch / Reels empfehlen“ aktivieren."
    )

    return {
        "youtube": {
            "title": title,
            "alt_titles": alt_list,
            "description": yt_description,
            "chapters": chapters_text,
            "pinned_comment": str(seo.get("pinned_comment") or ""),
            "tags_csv": tags_csv,
            "quiz_copy_paste": quiz_copy_block,
            "quiz_structured": {
                "timestamp": _fmt_mmss(quiz_ts_sec),
                "question": quiz_question,
                "options": quiz_opts,
                "correct_index": correct_idx,
                "explanation": quiz_explanation,
            },
            "end_screen_copy_paste": abspann_copy_block,
            "community_poll_copy_paste": yt_poll_block,
            "upload_checklist": yt_settings_checklist,
        },
        "tiktok": {
            "cover_headline": tt_cover_title,
            "caption": tt_caption,
            "search_seo_keywords": tt_search_kw,
            "first_comment": tt_first_comment,
            "original_sound_name": f"Originalton – AuronOrigin | {pillar}",
            "series_name": f"AuronOrigin • {pillar}",
            "upload_checklist": tt_settings,
        },
        "instagram": {
            "cover_headline": tt_cover_title,
            "caption": ig_caption,
            "alt_text": ig_alt_text,
            "reel_poll_copy_paste": ig_poll_block,
            "pinned_comment": str(seo.get("pinned_comment") or ""),
            "original_audio_name": ig_audio_name,
            "recommended_topics": ", ".join(ig_topics),
            "upload_checklist": ig_settings,
        },
        "facebook": {
            "video_title": fb_title,
            "ab_test_title": fb_ab_title,
            "description": fb_description,
            "first_comment": fb_first_comment,
            "alt_text": ig_alt_text,
            "upload_checklist": fb_settings,
        },
    }


def format_social_suite_text_files(suite: dict[str, Any]) -> dict[str, str]:
    """Generate clean UTF-8 .txt files per platform for the downloadable .ZIP archive."""
    yt = suite["youtube"]
    tt = suite["tiktok"]
    ig = suite["instagram"]
    fb = suite["facebook"]

    yt_txt = (
        "====================================================================\n"
        "  YOUTUBE STUDIO KOMPLETT-PAKET (INKL. QUIZ, ABSPANN & KAPITEL)\n"
        "====================================================================\n\n"
        f"1. HAUPTTITEL:\n{yt['title']}\n\n"
        "2. ALTERNATIVE A/B-TEST-TITEL (YouTube „Testen & Vergleichen“):\n"
        + "\n".join(f"- {t}" for t in yt["alt_titles"])
        + f"\n\n3. VIDEOBESCHREIBUNG (INKL. KAPITELMARKEN & HASHTAGS):\n{yt['description']}\n\n"
        f"4. YOUTUBE QUIZ (IN-VIDEO QUIZ & COMMUNITY-QUIZ):\n{yt['quiz_copy_paste']}\n\n"
        f"5. YOUTUBE ABSPANN (END SCREEN) & INFO-KARTE:\n{yt['end_screen_copy_paste']}\n\n"
        f"6. ANGEPINNTER KOMMENTAR:\n{yt['pinned_comment']}\n\n"
        f"7. COMMUNITY-UMFRAGE:\n{yt['community_poll_copy_paste']}\n\n"
        f"8. TAGS (KOMMAGETRENNT ZUM EINFÜGEN):\n{yt['tags_csv']}\n\n"
        f"9. PFLICHTANGABEN IM UPLOAD-DIALOG:\n{yt['upload_checklist']}\n"
    )

    tt_txt = (
        "====================================================================\n"
        "  TIKTOK STUDIO KOMPLETT-PAKET (SAFE-ZONE COVER & SEARCH-SEO)\n"
        "====================================================================\n\n"
        f"1. COVER-TITEL:\n{tt['cover_headline']}\n\n"
        f"2. TIKTOK CAPTION / BESCHREIBUNG (INKL. 5 NISCHEN-HASHTAGS):\n{tt['caption']}\n\n"
        f"3. SUCHLEISTEN-KEYWORDS (TIKTOK SEARCH SEO):\n{tt['search_seo_keywords']}\n\n"
        f"4. ERSTER EIGENER KOMMENTAR (DIREKT NACH UPLOAD POSTEN):\n{tt['first_comment']}\n\n"
        f"5. ORIGINALTON-NAME & SERIE:\nOriginalton: {tt['original_sound_name']}\nSerie/Playlist: {tt['series_name']}\n\n"
        f"6. TIKTOK UPLOAD-CHECKLISTE:\n{tt['upload_checklist']}\n"
    )

    ig_txt = (
        "====================================================================\n"
        "  INSTAGRAM REELS & FEED KOMPLETT-PAKET (INKL. ALT-TEXT & UMFRAGE)\n"
        "====================================================================\n\n"
        f"1. INSTAGRAM REEL CAPTION (MAX. 5 HASHTAGS NACH 2026 REGEL):\n{ig['caption']}\n\n"
        f"2. SEO-ALTERNATIVTEXT (Erweiterte Einstellungen → Alternativtext):\n{ig['alt_text']}\n\n"
        f"3. INTERAKTIVE REEL-UMFRAGE:\n{ig['reel_poll_copy_paste']}\n\n"
        f"4. ORIGINAL-AUDIO UMBENENNEN:\n{ig['original_audio_name']}\n\n"
        f"5. THEMEN HINZUFÜGEN (ADD TOPICS – 3 WÄHLEN):\n{ig['recommended_topics']}\n\n"
        f"6. ANGEPINNTER KOMMENTAR:\n{ig['pinned_comment']}\n\n"
        f"7. INSTAGRAM UPLOAD-CHECKLISTE:\n{ig['upload_checklist']}\n"
    )

    fb_txt = (
        "====================================================================\n"
        "  FACEBOOK REELS & META BUSINESS SUITE KOMPLETT-PAKET\n"
        "====================================================================\n\n"
        f"1. FACEBOOK VIDEO-TITEL:\n{fb['video_title']}\n\n"
        f"2. A/B-TEST ALTERNATIVTITEL (META BUSINESS SUITE):\n{fb['ab_test_title']}\n\n"
        f"3. FACEBOOK BEITRAGSTEXT / BESCHREIBUNG:\n{fb['description']}\n\n"
        f"4. ERSTER KOMMENTAR UNTER DEM VIDEO:\n{fb['first_comment']}\n\n"
        f"5. ALTERNATIVTEXT (BARRIEREFREIHEIT / SEO):\n{fb['alt_text']}\n\n"
        f"6. FACEBOOK / META UPLOAD-CHECKLISTE:\n{fb['upload_checklist']}\n"
    )

    return {
        "04_Copy_Paste_Texte/01_YOUTUBE_Quiz_Abspann_SEO.txt": yt_txt,
        "04_Copy_Paste_Texte/02_TIKTOK_Caption_SearchSEO.txt": tt_txt,
        "04_Copy_Paste_Texte/03_INSTAGRAM_Caption_AltText_Umfrage.txt": ig_txt,
        "04_Copy_Paste_Texte/04_FACEBOOK_Titel_Beschreibung_ABTest.txt": fb_txt,
    }
