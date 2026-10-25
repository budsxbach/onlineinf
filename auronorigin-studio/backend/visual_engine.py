from __future__ import annotations

import math
import re
import subprocess
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

from .audio_engine import FFMPEG_BIN, SAMPLE_RATE
from .config import BRAND_IDENTITY, UPLOADS_DIR
from .image_generator import render_bespoke_auron_artwork

# Brand RGB Constants (strictly from AuronOrigin Brand Identity Kit)
C_BG_DEEP = (11, 12, 16)          # #0B0C10 Deep Space Black (60%)
C_STEEL = (31, 40, 51)            # #1F2833 Cosmic Steel Blue (20%)
C_GOLD = (212, 175, 55)           # #D4AF37 Auron-Gold (15%)
C_GOLD_BRIGHT = (255, 224, 120)   # #FFE078 High-Luminance Gold Highlight
C_ICE_WHITE = (248, 250, 252)     # #F8FAFC High-CTR Thumbnail Headline White
C_VIOLET = (74, 35, 90)           # #4A235A Mystic Violet (<=5% badge accent)
C_TEXT = (205, 208, 214)          # Light Grey Body
C_MUTED = (128, 142, 162)         # Metadata Steel
C_CRIMSON = (214, 58, 46)         # Anomaly / Focal Scan Accent

FPS = 24


def _load_font(family: str, size: int, weight: int = 400) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    font_path = BRAND_IDENTITY["fonts"].get(family, "")
    try:
        f = ImageFont.truetype(font_path, size=size)
        if weight != 400:
            try:
                axes = f.get_variation_axes()
                if len(axes) == 2:
                    opt = min(axes[0]["maximum"], max(axes[0]["minimum"], min(32, max(14, size))))
                    w_val = min(axes[1]["maximum"], max(axes[1]["minimum"], weight))
                    f.set_variation_by_axes([opt, w_val])
                elif len(axes) == 1:
                    w_val = min(axes[0]["maximum"], max(axes[0]["minimum"], weight))
                    f.set_variation_by_axes([w_val])
            except Exception:
                pass
        return f
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
        bbox = draw.textbbox((0, 0), test, font=font)
        if (bbox[2] - bbox[0]) <= max_width:
            cur = test
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def _split_narration_into_caption_chunks(
    narration: str,
    speech_start: float,
    speech_end: float,
    max_words_per_chunk: int = 6,
) -> list[dict[str, Any]]:
    """Split scene narration into short retention-friendly subtitle chunks proportional to character length."""
    cleaned = re.sub(r"\s+", " ", narration.strip())
    if not cleaned:
        return []

    clauses = [c.strip() for c in re.split(r"(?<=[.!?;:—–,])\s+", cleaned) if c.strip()]
    chunks: list[str] = []
    for cl in clauses:
        words = cl.split()
        for i in range(0, len(words), max_words_per_chunk):
            part = " ".join(words[i : i + max_words_per_chunk]).strip()
            if part:
                chunks.append(part)

    if not chunks:
        chunks = [cleaned]

    total_chars = max(1, sum(len(c) for c in chunks))
    total_dur = max(0.4, speech_end - speech_start)
    cursor = speech_start
    timed: list[dict[str, Any]] = []

    for idx, ch in enumerate(chunks):
        frac = len(ch) / float(total_chars)
        dur = total_dur * frac
        end_t = speech_end if idx == len(chunks) - 1 else (cursor + dur)
        timed.append(
            {
                "text": ch,
                "start": round(cursor, 3),
                "end": round(end_t, 3),
            }
        )
        cursor = end_t
    return timed


def _create_cosmic_backdrop(width: int, height: int, seed: int) -> Image.Image:
    """Render AuronOrigin's 60/20 Deep-Space & Cosmic-Steel radial background with subtle starfield."""
    y_grid, x_grid = np.ogrid[:height, :width]
    cx, cy = width * 0.5, height * 0.44
    norm_dist = np.sqrt(((x_grid - cx) / (width * 0.65)) ** 2 + ((y_grid - cy) / (height * 0.65)) ** 2)
    glow = np.clip(1.0 - norm_dist, 0.0, 1.0) ** 1.6

    arr = np.zeros((height, width, 3), dtype=np.float32)
    for c_i in range(3):
        arr[:, :, c_i] = C_BG_DEEP[c_i] * (1.0 - 0.72 * glow) + C_STEEL[c_i] * (0.72 * glow)

    rng = np.random.default_rng(seed)
    n_stars = 160
    sx = rng.integers(0, width, size=n_stars)
    sy = rng.integers(0, height, size=n_stars)
    sb = rng.uniform(0.25, 0.85, size=n_stars)
    for x, y, b in zip(sx, sy, sb):
        col = C_GOLD if b > 0.72 else C_TEXT
        arr[y, x] = np.clip(arr[y, x] + np.array(col) * b, 0, 255)
        if b > 0.65 and x + 1 < width and y + 1 < height:
            arr[y + 1, x] = np.clip(arr[y + 1, x] + np.array(col) * (b * 0.45), 0, 255)

    return Image.fromarray(arr.astype(np.uint8), mode="RGB")


def render_sacred_motif_plate(
    *,
    motif: str,
    width: int,
    height: int,
    seed: int = 42,
    custom_image_path: Path | None = None,
    prompt_en: str = "",
    scene_image_mode: str = "auto_ai_brand",
    focal_x_ratio: float | None = None,
    luminance_boost: float = 1.0,
    apply_vignette: bool = True,
) -> Image.Image:
    """Generate an oversized (1.14x) unique AuronOrigin Dark-Blue & Gold artwork plate (or grade a custom upload)."""
    w = int(width * 1.14)
    h = int(height * 1.14)
    w += w % 2
    h += h % 2

    cx, cy = w // 2, int(h * (0.43 if height > width else 0.47))
    min_dim = min(w, h)

    has_custom_image = False
    plate: Image.Image | None = None
    if custom_image_path and custom_image_path.exists():
        try:
            backdrop = _create_cosmic_backdrop(w, h, seed=seed)
            raw_img = Image.open(custom_image_path)
            raw_img = ImageOps.exif_transpose(raw_img)
            u_img = raw_img.convert("RGB")
            src_ratio = u_img.width / float(max(1, u_img.height))
            dst_ratio = w / float(max(1, h))
            if src_ratio > dst_ratio:
                nh = h
                nw = max(w, int(round(h * src_ratio)))
            else:
                nw = w
                nh = max(h, int(round(w / src_ratio)))
            u_img = u_img.resize((nw, nh), Image.Resampling.LANCZOS)
            left = max(0, (nw - w) // 2)
            top = max(0, (nh - h) // 2)
            u_img = u_img.crop((left, top, left + w, top + h))
            u_img = ImageEnhance.Brightness(u_img).enhance(0.86 * luminance_boost)
            u_img = ImageEnhance.Contrast(u_img).enhance(1.10)
            plate = Image.blend(backdrop, u_img, alpha=0.94)
            has_custom_image = True
        except Exception:
            has_custom_image = False

    if not has_custom_image or plate is None:
        plate = render_bespoke_auron_artwork(
            motif=motif,
            width=w,
            height=h,
            seed=seed,
            prompt_en=prompt_en,
            scene_image_mode=scene_image_mode,
            focal_x_ratio=focal_x_ratio,
            luminance_boost=luminance_boost,
        )

    if not apply_vignette:
        return plate.convert("RGB")

    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    if has_custom_image:
        r_outer = int(min_dim * 0.41)
        draw.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], outline=(*C_GOLD, 55), width=2)

    vig = np.zeros((h, w, 4), dtype=np.uint8)
    y_norm = np.linspace(0.0, 1.0, h, dtype=np.float32)
    top_dark = np.clip((0.28 - y_norm) / 0.28, 0.0, 1.0) * 175.0
    bot_dark = np.clip((y_norm - 0.58) / 0.42, 0.0, 1.0) * 215.0
    alpha_col = np.maximum(top_dark, bot_dark).astype(np.uint8)
    vig[:, :, 0] = C_BG_DEEP[0]
    vig[:, :, 1] = C_BG_DEEP[1]
    vig[:, :, 2] = C_BG_DEEP[2]
    vig[:, :, 3] = alpha_col[:, None]

    composed = Image.alpha_composite(plate.convert("RGBA"), overlay)
    composed = Image.alpha_composite(composed, Image.fromarray(vig, mode="RGBA"))
    return composed.convert("RGB")


def _pick_gold_highlight_word_idx(words: list[str]) -> int:
    """Prefer numbers, measurements, or strong curiosity/contrast words for gold subtitle anchoring."""
    if not words:
        return -1
    for wi, w_tok in enumerate(words):
        if re.search(r"\d", w_tok):
            return wi
    power_stems = ("rätsel", "niemals", "unmöglich", "plötzlich", "geheim", "beweis", "zeit", "kein", "trotzdem", "wahrheit")
    for wi, w_tok in enumerate(words):
        low = w_tok.lower()
        if any(st in low for st in power_stems):
            return wi
    best_idx = -1
    best_len = 4
    for wi, w_tok in enumerate(words):
        clean_w = re.sub(r"[^A-Za-zÄÖÜäöüß0-9]", "", w_tok)
        if len(clean_w) > best_len:
            best_len = len(clean_w)
            best_idx = wi
    return best_idx


def _build_scene_hud_rgba(
    *,
    width: int,
    height: int,
    scene: dict[str, Any],
    pillar: str,
    caption_text: str,
    include_watermark: bool,
    include_subtitles: bool,
    is_final_cta: bool,
    watermark_img: Image.Image | None,
    scene_idx: int = 0,
    total_scenes: int = 1,
) -> np.ndarray:
    """Pre-render crisp RGBA typography & brand HUD layer for one caption slice."""
    is_vertical = height > width
    hud = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(hud)

    pad_x = int(width * (0.075 if is_vertical else 0.065))
    top_y = int(height * (0.065 if is_vertical else 0.07))

    # 1. Top-left Pillar & Act/Fact Badge (shows chapter progress on longform 9-min videos for Zeigarnik retention!)
    phase_str = str(scene.get("phase") or "").strip()
    badge_core = str(scene.get("fact_badge") or "FAKT").strip()
    if total_scenes >= 10 and "AKT" in phase_str:
        badge_label = f"{phase_str}  •  {badge_core}"
    else:
        badge_label = f"{pillar.upper()}  •  {badge_core}"
    f_badge = _load_font("inter", max(16, int(width * (0.025 if is_vertical else 0.0145))), weight=700)
    bb = draw.textbbox((0, 0), badge_label, font=f_badge)
    bw, bh = bb[2] - bb[0] + 28, bb[3] - bb[1] + 16
    is_mystery_badge = any(k in badge_label for k in ("DEUTUNG", "MYSTERY", "OPEN LOOP", "TWIST", "ANOMALIE", "PAYOFF"))
    badge_bg = (*C_VIOLET, 220) if is_mystery_badge else (*C_STEEL, 228)
    draw.rounded_rectangle([pad_x, top_y, pad_x + bw, top_y + bh], radius=8, fill=badge_bg, outline=(*C_GOLD, 200), width=2)
    draw.text((pad_x + 14, top_y + 7), badge_label, font=f_badge, fill=(*C_GOLD_BRIGHT, 255))

    # 2. Top-right official AuronOrigin circular Watermark
    if include_watermark and watermark_img is not None:
        wm_size = int(min(width, height) * (0.105 if is_vertical else 0.095))
        wm_resized = watermark_img.resize((wm_size, wm_size), Image.Resampling.LANCZOS)
        hud.alpha_composite(wm_resized, dest=(width - pad_x - wm_size, top_y - 4))

    # 3. Monumental Cinzel ALL-CAPS Scene Headline in Auron-Gold
    headline = str(scene.get("on_screen_headline") or "").upper()
    if headline:
        f_head = _load_font("cinzel", max(26, int(width * (0.050 if is_vertical else 0.031))), weight=750)
        head_lines = _wrap_text(draw, headline, f_head, width - 2 * pad_x)[:2]
        hy = top_y + bh + int(height * 0.022)
        for line in head_lines:
            draw.text((pad_x + 2, hy + 2), line, font=f_head, fill=(0, 0, 0, 225))
            draw.text((pad_x, hy), line, font=f_head, fill=(*C_GOLD, 255))
            lbox = draw.textbbox((0, hy), line, font=f_head)
            hy = lbox[3] + 8

        div_y = hy + 6
        draw.line([(pad_x, div_y), (pad_x + int(width * 0.30), div_y)], fill=(*C_GOLD, 185), width=2)

        subline = str(scene.get("on_screen_subline") or "").strip()
        if subline:
            f_sub = _load_font("inter", max(16, int(width * (0.027 if is_vertical else 0.0165))), weight=550)
            draw.text((pad_x, div_y + 12), subline[:75], font=f_sub, fill=(*C_MUTED, 240))

    # 4. Burned-in Retention Subtitles (Lower-third glass card + Numbers/Power-word Gold highlight)
    if include_subtitles and caption_text:
        f_cap = _load_font("inter", max(22, int(width * (0.044 if is_vertical else 0.025))), weight=650)
        max_cap_w = int(width * (0.84 if is_vertical else 0.76))
        cap_lines = _wrap_text(draw, caption_text, f_cap, max_cap_w)[:3]

        line_h = int(f_cap.size * 1.34) if hasattr(f_cap, "size") else 32
        box_h = len(cap_lines) * line_h + 28
        box_w = max_cap_w + 36
        box_x = (width - box_w) // 2
        box_y = int(height * (0.73 if is_vertical else 0.74)) - box_h // 2

        draw.rounded_rectangle(
            [box_x, box_y, box_x + box_w, box_y + box_h],
            radius=14,
            fill=(11, 12, 16, 212),
            outline=(*C_GOLD, 135),
            width=2,
        )

        ty = box_y + 13
        for ln in cap_lines:
            words = ln.split()
            key_idx = _pick_gold_highlight_word_idx(words)

            full_bb = draw.textbbox((0, 0), ln, font=f_cap)
            line_w = full_bb[2] - full_bb[0]
            tx = (width - line_w) // 2

            for wi, w_tok in enumerate(words):
                piece = w_tok + (" " if wi < len(words) - 1 else "")
                col = (*C_GOLD_BRIGHT, 255) if wi == key_idx else (*C_TEXT, 255)
                draw.text((tx + 2, ty + 2), piece, font=f_cap, fill=(0, 0, 0, 235))
                draw.text((tx, ty), piece, font=f_cap, fill=col)
                p_bb = draw.textbbox((0, 0), piece, font=f_cap)
                tx += p_bb[2] - p_bb[0]
            ty += line_h

    # 5. Seamless End-Screen / Binge-Bridge Banner on Final Scene
    if is_final_cta:
        cta_txt = "NÄCHSTES RÄTSEL ANSEHEN  •  AURONORIGIN ABONNIEREN"
        f_cta = _load_font("cinzel", max(16, int(width * (0.026 if is_vertical else 0.017))))
        cbb = draw.textbbox((0, 0), cta_txt, font=f_cta)
        text_w = cbb[2] - cbb[0]
        cw, ch = text_w + 68, (cbb[3] - cbb[1]) + 24
        cx_box = (width - cw) // 2
        cy_box = int(height * (0.875 if is_vertical else 0.87))
        draw.rounded_rectangle(
            [cx_box, cy_box, cx_box + cw, cy_box + ch],
            radius=10,
            fill=(*C_STEEL, 238),
            outline=(*C_GOLD_BRIGHT, 255),
            width=2,
        )
        mid_y = cy_box + ch // 2
        for dx_c in (cx_box + 18, cx_box + cw - 18):
            draw.polygon([(dx_c, mid_y - 5), (dx_c + 5, mid_y), (dx_c, mid_y + 5), (dx_c - 5, mid_y)], fill=(*C_GOLD_BRIGHT, 255))
        tx_cta = cx_box + (cw - text_w) // 2
        draw.text((tx_cta, cy_box + 9), cta_txt, font=f_cta, fill=(*C_GOLD_BRIGHT, 255))

    return np.asarray(hud, dtype=np.uint8)


def _apply_auron_glitch_frame(frame: np.ndarray, intensity: float, seed: int) -> np.ndarray:
    """Authentic AuronOrigin RGB-split + horizontal scanline slice displacement VFX."""
    out = frame.copy()
    h, w, _ = out.shape
    shift = max(2, int(w * 0.012 * intensity))

    out[:, :, 0] = np.roll(out[:, :, 0], shift, axis=1)
    out[:, :, 2] = np.roll(out[:, :, 2], -shift, axis=1)

    rng = np.random.default_rng(seed)
    for _ in range(3):
        y0 = int(rng.integers(int(h * 0.12), int(h * 0.85)))
        sh = int(rng.integers(8, max(12, int(h * 0.035))))
        dx = int(rng.integers(-shift * 3, shift * 3 + 1))
        y1 = min(h, y0 + sh)
        out[y0:y1] = np.roll(out[y0:y1], dx, axis=1)
    return out


def _camera_crop_frame(
    plate_arr: np.ndarray,
    out_w: int,
    out_h: int,
    motion: str,
    progress: float,
    scene_duration_sec: float = 8.0,
) -> np.ndarray:
    """Smooth Ken Burns camera motion + automatic Mid-Scene Pattern-Interrupt Cut for scenes >= 13s."""
    ph, pw, _ = plate_arr.shape
    p = max(0.0, min(1.0, progress))

    # RETENTION PATTERN INTERRUPT: For longform scenes (>=13s), cut to a closer 1.08x detail angle at 50%
    detail_punch = False
    if scene_duration_sec >= 13.0 and p >= 0.50:
        detail_punch = True
        sub_p = (p - 0.50) / 0.50
        ease = 0.5 - 0.5 * math.cos(math.pi * sub_p)
    else:
        sub_p = (p / 0.50) if scene_duration_sec >= 13.0 else p
        ease = 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, sub_p)))

    if detail_punch:
        # Closer focal detail framing so 28s longform scenes feel like 2 dynamic camera shots!
        scale = 0.87 - 0.05 * ease
        cw, ch = int(pw * scale), int(ph * scale)
        x_bias = int((pw - cw) * (0.58 if motion in ("zoom_in", "drift_right") else 0.42))
        y_bias = int((ph - ch) * (0.44 if motion != "pan_up" else (0.55 - 0.15 * ease)))
        x0 = max(0, min(pw - cw, x_bias))
        y0 = max(0, min(ph - ch, y_bias))
    elif motion == "zoom_in":
        scale = 1.0 - 0.10 * ease
        cw, ch = int(pw * scale), int(ph * scale)
        x0 = (pw - cw) // 2
        y0 = (ph - ch) // 2
    elif motion == "zoom_out":
        scale = 0.90 + 0.10 * ease
        cw, ch = int(pw * scale), int(ph * scale)
        x0 = (pw - cw) // 2
        y0 = (ph - ch) // 2
    elif motion == "pan_up":
        cw, ch = out_w, out_h
        x0 = (pw - cw) // 2
        y0 = int((ph - ch) * (1.0 - ease))
    else:
        cw, ch = out_w, out_h
        x0 = int((pw - cw) * ease)
        y0 = (ph - ch) // 2

    cropped = plate_arr[y0 : y0 + ch, x0 : x0 + cw]
    if cropped.shape[1] == out_w and cropped.shape[0] == out_h:
        out = cropped.copy()
    else:
        img = Image.fromarray(cropped, mode="RGB").resize((out_w, out_h), Image.Resampling.BILINEAR)
        out = np.asarray(img, dtype=np.uint8)

    # Brief 3-frame warm optical flash right on the mid-scene pattern-interrupt cut
    if scene_duration_sec >= 13.0 and 0.50 <= p < (0.50 + 0.14 / max(1.0, scene_duration_sec)):
        flash_u16 = out.astype(np.uint16) + 22
        out = np.clip(flash_u16, 0, 255).astype(np.uint8)
    return out


def _alpha_composite_rgb(bg_rgb: np.ndarray, fg_rgba: np.ndarray) -> np.ndarray:
    alpha = fg_rgba[:, :, 3:4].astype(np.uint16)
    inv = 255 - alpha
    blended = (bg_rgb.astype(np.uint16) * inv + fg_rgba[:, :, :3].astype(np.uint16) * alpha) // 255
    return blended.astype(np.uint8)


def _format_srt_timestamp(seconds: float) -> str:
    ms_total = max(0, int(round(seconds * 1000)))
    hrs = ms_total // 3600000
    rem = ms_total % 3600000
    mins = rem // 60000
    rem %= 60000
    secs = rem // 1000
    ms = rem % 1000
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{ms:03d}"


def write_srt_subtitles(all_captions: list[dict[str, Any]], srt_path: Path, offset_sec: float = 0.0) -> Path:
    lines: list[str] = []
    for idx, cap in enumerate(all_captions, start=1):
        t0 = _format_srt_timestamp(cap["start"] + offset_sec)
        t1 = _format_srt_timestamp(cap["end"] + offset_sec)
        lines.append(f"{idx}\n{t0} --> {t1}\n{cap['text']}\n")
    srt_path.write_text("\n".join(lines), encoding="utf-8")
    return srt_path


def _prepare_brand_clip_segment(
    src_mp4: Path,
    dst_mp4: Path,
    target_w: int,
    target_h: int,
    max_duration: float | None = None,
) -> bool:
    """Conform AuronOrigin intro_5s.mp4 or outro_7s.mp4 to exact output resolution, 24fps, and 48kHz stereo."""
    if not src_mp4.exists():
        return False

    is_vertical = target_h > target_w
    if is_vertical:
        vf = (
            f"split[bg][fg];"
            f"[bg]scale={target_w}:{target_h}:force_original_aspect_ratio=increase,"
            f"crop={target_w}:{target_h},boxblur=24:4,eq=brightness=-0.32:contrast=1.1[bg2];"
            f"[fg]scale={target_w}:-2:force_original_aspect_ratio=decrease,"
            f"pad=iw:ih+4:0:2:color=#D4AF37[fg2];"
            f"[bg2][fg2]overlay=(W-w)/2:(H-h)/2,fps={FPS},format=yuv420p"
        )
    else:
        vf = (
            f"scale={target_w}:{target_h}:force_original_aspect_ratio=decrease,"
            f"pad={target_w}:{target_h}:(ow-iw)/2:(oh-ih)/2:color=#0B0C10,"
            f"fps={FPS},format=yuv420p"
        )

    af_chain = f"aresample={SAMPLE_RATE},aformat=sample_fmts=fltp:channel_layouts=stereo"
    if max_duration is not None and max_duration > 0.6:
        fade_st = max(0.1, max_duration - 0.35)
        af_chain += f",afade=t=out:st={fade_st:.2f}:d=0.32"

    cmd = [FFMPEG_BIN, "-y"]
    if max_duration is not None:
        cmd += ["-t", f"{max_duration:.2f}"]
    cmd += [
        "-i",
        str(src_mp4),
        "-vf",
        vf,
        "-af",
        af_chain,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "20",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        str(SAMPLE_RATE),
        "-ac",
        "2",
        str(dst_mp4),
    ]
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return res.returncode == 0 and dst_mp4.exists()


def _draw_bold_outlined_text(
    draw: ImageDraw.ImageDraw,
    pos: tuple[int, int],
    text: str,
    font: Any,
    fill: tuple[int, int, int, int],
    shadow_offset: int = 6,
) -> None:
    """Render ultra-crisp mobile-readable thumbnail typography with deep shadow + dark contour."""
    x, y = pos
    # Deep ambient drop shadow
    for dx, dy in ((shadow_offset, shadow_offset), (shadow_offset - 2, shadow_offset + 2)):
        draw.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0, 242))
    # Crisp 3px black stroke contour so letters pop over any cosmic detail even at 160x90px mobile preview
    for ox in (-3, 0, 3):
        for oy in (-3, 0, 3):
            if ox != 0 or oy != 0:
                draw.text((x + ox, y + oy), text, font=font, fill=(5, 7, 11, 248))
    draw.text((x, y), text, font=font, fill=fill)


def _fit_thumbnail_hero_lines(
    draw: ImageDraw.ImageDraw,
    trigger: str,
    family: str,
    start_size: int,
    min_size: int,
    max_w: int,
    max_lines: int = 3,
    weight: int = 850,
) -> tuple[Any, list[str], int]:
    """Fit 2–3 punchy words in ExtraBold/Black weight as large as possible without ever clipping German compound words."""
    clean = re.sub(r"\s+", " ", trigger.strip().upper())
    for sz in range(start_size, min_size - 1, -2):
        fnt = _load_font(family, sz, weight=weight)
        lines = _wrap_text(draw, clean, fnt, max_w)
        if len(lines) <= max_lines and all(
            (draw.textbbox((0, 0), ln, font=fnt)[2] - draw.textbbox((0, 0), ln, font=fnt)[0]) <= max_w
            for ln in lines
        ):
            return fnt, lines, int(sz * 1.12)
    fnt = _load_font(family, min_size, weight=weight)
    return fnt, _wrap_text(draw, clean, fnt, max_w)[:max_lines], int(min_size * 1.12)


def _select_topic_hero_motif(blueprint: dict[str, Any], var_key: str, fallback: str) -> str:
    """Choose the most iconic high-recognition visual motif matching the video's single topic."""
    sc0_txt = ""
    if blueprint.get("scenes"):
        sc0_txt = str(blueprint["scenes"][0].get("narration") or "")
    desc_txt = str((blueprint.get("youtube_seo") or {}).get("description") or "")[:240]
    hay = f"{blueprint.get('title') or ''} {blueprint.get('topic') or ''} {sc0_txt} {desc_txt}".lower()
    idx = {"A": 0, "B": 1, "C": 2}.get(var_key, 0)
    if any(k in hay for k in ("pyramide", "cheops", "gizeh", "galerie", "pharao", "ägypt")):
        return ("pyramid_radar", "pyramid_radar", "temple_monolith")[idx]
    if any(k in hay for k in ("schwarzes loch", "ereignishorizont", "gravitation", "singularität")):
        return ("event_horizon", "deep_telescope", "solar_eclipse_crown")[idx]
    if any(k in hay for k in ("zeit", "atomuhr", "uhr", "sekunde", "relativität")):
        return ("atomic_clock", "event_horizon", "ouroboros_seal")[idx]
    if any(k in hay for k in ("webb", "teleskop", "galaxi", "universum", "all", "kosmos", "wow")):
        return ("deep_telescope", "solar_eclipse_crown", "event_horizon")[idx]
    if any(k in hay for k in ("gehirn", "bewusstsein", "traum", "déjà", "deja", "gedanke", "entscheidung")):
        return ("eye_of_horus", "dna_biophoton", "astral_labyrinth")[idx]
    if any(k in hay for k in ("zelle", "leucht", "biophoton", "dna", "körper", "herz")):
        return ("dna_biophoton", "eye_of_horus", "solar_eclipse_crown")[idx]
    if any(k in hay for k in ("antikythera", "göbekli", "tempel", "monolith", "zivilisation", "antik")):
        return ("temple_monolith", "pyramid_radar", "ouroboros_seal")[idx]
    if any(k in hay for k in ("quanten", "doppelspalt", "verschränk", "teilchen", "beobachter")):
        return ("solar_eclipse_crown", "atomic_clock", "ouroboros_seal")[idx]
    return fallback if fallback else ("solar_eclipse_crown", "event_horizon", "eye_of_horus")[idx]


def generate_youtube_thumbnail(
    *,
    blueprint: dict[str, Any],
    out_png: Path,
    scene_image_mode: str = "auto_ai_brand",
    variant: str = "A",
) -> Path:
    """Render a High-CTR 1280x720 YouTube Home-Feed Thumbnail (Variants A, B, C for YouTube 'Test & Compare').

    Design Rules Engineered for > 4.5–6% Browse CTR:
    1. Bright Topic-Matched Focal Hero Subject in the Right Golden Ratio (`x ~ 69%`) with +40% Rim-Glow Luminance
       (never buried behind text or darkened by a full-frame veil!).
    2. Targeted dark scrim ONLY behind the left text zone so right-side contrast shines on mobile feeds.
    3. Ultra-readable ExtraBold 2–3 word Two-Tone Headline (Ice-White `#F8FAFC` + Radiant Gold `#FFE078`), zero clutter.
    4. Bottom-right YouTube Timestamp Dead-Zone (`x > 1030, y > 600`) kept 100% clear!
    """
    w, h = 1280, 720
    var_key = (variant or "A").upper()
    scenes = blueprint.get("scenes") or []
    variants_txt = blueprint.get("thumbnail_variants") if isinstance(blueprint.get("thumbnail_variants"), list) else []

    if var_key == "B":
        sc_idx = min(len(scenes) - 1, 2) if scenes else 0
        trigger = str(variants_txt[1] if len(variants_txt) > 1 else blueprint.get("thumbnail_text") or "KEIN ZUFALL?").upper()
        focal_x = 0.70
        seed_bump = 1907
    elif var_key == "C":
        sc_idx = min(len(scenes) - 1, 4) if scenes else 0
        trigger = str(variants_txt[2] if len(variants_txt) > 2 else blueprint.get("thumbnail_text") or "DER BEWEIS").upper()
        focal_x = 0.50
        seed_bump = 3851
    else:
        sc_idx = 0
        trigger = str(blueprint.get("thumbnail_text") or (variants_txt[0] if variants_txt else "DAS WAHRE RÄTSEL")).upper()
        focal_x = 0.71
        seed_bump = 0

    pick_sc = scenes[sc_idx] if scenes else {}
    motif = _select_topic_hero_motif(blueprint, var_key, str(pick_sc.get("visual_motif") or "solar_eclipse_crown"))
    base_seed = int(pick_sc.get("visual_seed") or (abs(hash(str(blueprint.get("title") or ""))) % 90_000_000 + 777)) + seed_bump
    prompt_en = str(pick_sc.get("image_prompt_en") or "")
    custom_id = str(pick_sc.get("custom_image_id") or "").strip() if var_key == "A" else ""
    custom_path = (UPLOADS_DIR / Path(custom_id).name) if custom_id else None

    bg = render_sacred_motif_plate(
        motif=motif,
        width=w,
        height=h,
        seed=base_seed,
        custom_image_path=custom_path if (custom_path and custom_path.exists()) else None,
        prompt_en=prompt_en,
        scene_image_mode=scene_image_mode,
        focal_x_ratio=focal_x,
        luminance_boost=1.42,
        apply_vignette=False,
    ).resize((w, h), Image.Resampling.LANCZOS)

    rgba = bg.convert("RGBA")

    # Add warm Golden Rim-Spotlight on the Hero Focal Zone so the thumbnail leaps out of YouTube's dark/light feed
    yy, xx = np.ogrid[:h, :w]
    hx, hy = int(w * focal_x), int(h * (0.56 if var_key == "C" else 0.49))
    rad_dist = np.sqrt(((xx - hx) / (w * 0.34)) ** 2 + ((yy - hy) / (h * 0.46)) ** 2)
    spot_mask = (np.clip(1.0 - rad_dist, 0.0, 1.0) ** 1.8) * 76.0
    spot = np.zeros((h, w, 4), dtype=np.uint8)
    spot[:, :, 0] = C_GOLD_BRIGHT[0]
    spot[:, :, 1] = C_GOLD_BRIGHT[1]
    spot[:, :, 2] = C_GOLD_BRIGHT[2]
    spot[:, :, 3] = spot_mask.astype(np.uint8)
    rgba = Image.alpha_composite(rgba, Image.fromarray(spot, mode="RGBA"))

    if var_key in ("A", "B"):
        # Left-only contrast scrim (x = 0..58%), leaving the right 42% hero object 100% vivid and bright!
        grad = np.zeros((h, w, 4), dtype=np.uint8)
        x_norm = np.linspace(0.0, 1.0, w, dtype=np.float32)
        alpha_x = (np.clip((0.62 - x_norm) / 0.42, 0.0, 1.0) ** 1.25 * 230.0).astype(np.uint8)
        grad[:, :, 0] = C_BG_DEEP[0]
        grad[:, :, 1] = C_BG_DEEP[1]
        grad[:, :, 2] = C_BG_DEEP[2]
        grad[:, :, 3] = alpha_x[None, :]
        rgba = Image.alpha_composite(rgba, Image.fromarray(grad, mode="RGBA"))

        # Variant B: 2x Supersampled Anti-Aliased Documentary Anomaly Target Ring + Pointer Vector!
        if var_key == "B":
            ss = 2
            overlay_2x = Image.new("RGBA", (w * ss, h * ss), (0, 0, 0, 0))
            odraw = ImageDraw.Draw(overlay_2x)
            hx2, hy2 = hx * ss, hy * ss
            r_ring = 148 * ss
            for rw, al in ((12 * ss, 60), (5 * ss, 242)):
                odraw.ellipse(
                    [hx2 - r_ring, hy2 - r_ring, hx2 + r_ring, hy2 + r_ring],
                    outline=(*C_CRIMSON, al),
                    width=rw,
                )
            r_in = 128 * ss
            odraw.ellipse(
                [hx2 - r_in, hy2 - r_in, hx2 + r_in, hy2 + r_in],
                outline=(*C_GOLD_BRIGHT, 240),
                width=3 * ss,
            )
            for dx0, dy0, dx1, dy1 in (
                (0, -r_ring - 18 * ss, 0, -r_ring + 14 * ss),
                (0, r_ring - 14 * ss, 0, r_ring + 18 * ss),
                (-r_ring - 18 * ss, 0, -r_ring + 14 * ss, 0),
                (r_ring - 14 * ss, 0, r_ring + 18 * ss, 0),
            ):
                odraw.line([(hx2 + dx0, hy2 + dy0), (hx2 + dx1, hy2 + dy1)], fill=(*C_GOLD_BRIGHT, 248), width=4 * ss)
            ax0, ay0 = int(w * 0.495) * ss, int(h * 0.515) * ss
            ax1, ay1 = hx2 - r_ring - 22 * ss, hy2 + 6 * ss
            odraw.line([(ax0, ay0), (ax1, ay1)], fill=(*C_GOLD_BRIGHT, 248), width=6 * ss)
            ang = math.atan2(ay1 - ay0, ax1 - ax0)
            ah = 24 * ss
            p_left = (ax1 - int(ah * math.cos(ang - 0.52)), ay1 - int(ah * math.sin(ang - 0.52)))
            p_right = (ax1 - int(ah * math.cos(ang + 0.52)), ay1 - int(ah * math.sin(ang + 0.52)))
            odraw.polygon([(ax1, ay1), p_left, p_right], fill=(*C_GOLD_BRIGHT, 255))
            overlay = overlay_2x.resize((w, h), Image.Resampling.LANCZOS)
            rgba = Image.alpha_composite(rgba, overlay)

        draw = ImageDraw.Draw(rgba)

        # Subtle top-left brand micro-seal (never competes with main trigger, keeps bottom-right 100% clear for YT timestamp!)
        wm_path = Path(BRAND_IDENTITY["assets"]["watermark_png"])
        tx_left = 64
        if wm_path.exists():
            wm_small = Image.open(wm_path).convert("RGBA").resize((48, 48), Image.Resampling.LANCZOS)
            rgba.alpha_composite(wm_small, dest=(tx_left, 44))
            draw = ImageDraw.Draw(rgba)
            f_micro = _load_font("cinzel", 22, weight=700)
            draw.text((tx_left + 60, 56), "AURONORIGIN", font=f_micro, fill=(*C_GOLD, 225))

        # ExtraBold 2–3 Word Left-Column Trigger (max 50% width -> giant mobile-legible block letters!)
        max_text_w = int(w * 0.50)
        f_hero, lines, line_h = _fit_thumbnail_hero_lines(
            draw, trigger, "inter", start_size=108, min_size=52, max_w=max_text_w, max_lines=3, weight=850
        )
        block_h = len(lines) * line_h
        ty = max(145, (h - block_h) // 2 + 10)

        # Glowing vertical Auron-Gold / Crimson power accent bar left of headline
        draw.rounded_rectangle(
            [tx_left - 22, ty + 10, tx_left - 11, ty + block_h - 8],
            radius=4,
            fill=(*(C_CRIMSON if var_key == "B" else C_GOLD_BRIGHT), 255),
        )

        for li, ln in enumerate(lines):
            # Two-tone high-CTR contrast: setup lines in pure Ice-White, punchline in radiant Gold!
            is_gold_line = (li == len(lines) - 1) or (len(lines) == 1)
            col = (*C_GOLD_BRIGHT, 255) if is_gold_line else (*C_ICE_WHITE, 255)
            _draw_bold_outlined_text(draw, (tx_left, ty), ln, f_hero, fill=col, shadow_offset=6)
            ty += line_h

        sub_opt = str(blueprint.get("thumbnail_subtext") or "").strip().upper()
        if sub_opt:
            f_sub = _load_font("inter", 28, weight=750)
            _draw_bold_outlined_text(draw, (tx_left, min(h - 72, ty + 12)), sub_opt[:32], f_sub, fill=(*C_TEXT, 245), shadow_offset=4)

    else:
        # Variant C: Monumental Center-Focus Mystery Composition (Top 2-word hook + massive glowing centerpiece)
        grad_top = np.zeros((h, w, 4), dtype=np.uint8)
        y_norm = np.linspace(0.0, 1.0, h, dtype=np.float32)
        alpha_y = (np.clip((0.44 - y_norm) / 0.36, 0.0, 1.0) ** 1.2 * 228.0).astype(np.uint8)
        grad_top[:, :, 0] = C_BG_DEEP[0]
        grad_top[:, :, 1] = C_BG_DEEP[1]
        grad_top[:, :, 2] = C_BG_DEEP[2]
        grad_top[:, :, 3] = alpha_y[:, None]
        rgba = Image.alpha_composite(rgba, Image.fromarray(grad_top, mode="RGBA"))
        draw = ImageDraw.Draw(rgba)

        f_hero, lines, line_h = _fit_thumbnail_hero_lines(
            draw, trigger, "cinzel", start_size=98, min_size=50, max_w=int(w * 0.86), max_lines=2, weight=820
        )
        ty = 52
        for li, ln in enumerate(lines):
            bb = draw.textbbox((0, 0), ln, font=f_hero)
            lw = bb[2] - bb[0]
            tx = (w - lw) // 2
            col = (*C_GOLD_BRIGHT, 255) if li == len(lines) - 1 else (*C_ICE_WHITE, 255)
            _draw_bold_outlined_text(draw, (tx, ty), ln, f_hero, fill=col, shadow_offset=6)
            ty += line_h

        # Subtle bottom-left brand wordmark (keeps bottom-right timestamp corner 100% empty!)
        f_micro = _load_font("cinzel", 22, weight=700)
        _draw_bold_outlined_text(draw, (46, h - 58), "AURONORIGIN", f_micro, fill=(*C_GOLD, 225), shadow_offset=3)

    # Crisp 3px golden outer frame
    draw = ImageDraw.Draw(rgba)
    draw.rectangle([14, 14, w - 14, h - 14], outline=(*C_GOLD, 165), width=3)

    rgba.convert("RGB").save(str(out_png), format="PNG", optimize=True)
    return out_png


def _encode_body_segment_mp4(
    *,
    prepared_slice: list[dict[str, Any]],
    audio_wav: Path,
    audio_start_sec: float,
    audio_dur_sec: float,
    seg_mp4: Path,
    width: int,
    height: int,
    global_start_sec: float,
    global_total_dur: float,
    progress_cb: Any = None,
    prog_base: int = 66,
    prog_span: int = 22,
) -> None:
    """Stream 24fps RGB24 frames for a contiguous slice of scenes directly into FFmpeg with synced audio."""
    seg_frames = max(1, int(round(audio_dur_sec * FPS)))
    ffmpeg_cmd = [
        FFMPEG_BIN,
        "-y",
        "-f",
        "rawvideo",
        "-vcodec",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{width}x{height}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-ss",
        f"{audio_start_sec:.3f}",
        "-t",
        f"{audio_dur_sec:.3f}",
        "-i",
        str(audio_wav),
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        str(SAMPLE_RATE),
        "-ac",
        "2",
        "-shortest",
        "-movflags",
        "+faststart",
        str(seg_mp4),
    ]

    proc = subprocess.Popen(
        ffmpeg_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    assert proc.stdin is not None

    sc_ptr = 0
    for f_idx in range(seg_frames):
        t_sec = audio_start_sec + (f_idx / float(FPS))
        while sc_ptr < len(prepared_slice) - 1 and t_sec >= prepared_slice[sc_ptr]["timing"]["visual_end"]:
            sc_ptr += 1

        cur = prepared_slice[sc_ptr]
        tm = cur["timing"]
        sc_obj = cur["scene"]
        vis_start = float(tm["visual_start"])
        vis_dur = max(0.1, float(tm["visual_duration"]))
        local_prog = (t_sec - vis_start) / vis_dur

        bg_frame = _camera_crop_frame(
            cur["plate"],
            width,
            height,
            str(sc_obj.get("camera_motion") or "zoom_in"),
            local_prog,
            scene_duration_sec=vis_dur,
        )

        active_hud = cur["silent_hud"]
        for c_start, c_end, c_arr in cur["caption_huds"]:
            if c_start <= t_sec <= c_end + 0.08:
                active_hud = c_arr
                break

        frame = _alpha_composite_rgb(bg_frame, active_hud)

        # Thin golden retention progress bar along bottom edge
        glob_t = global_start_sec + (f_idx / float(FPS))
        bar_w = max(2, int(width * min(1.0, glob_t / max(0.1, global_total_dur))))
        frame[-4:, :bar_w, 0] = C_GOLD[0]
        frame[-4:, :bar_w, 1] = C_GOLD[1]
        frame[-4:, :bar_w, 2] = C_GOLD[2]

        if cur["global_idx"] > 0 and sc_obj.get("glitch_transition", True) and (t_sec - vis_start) < 0.17:
            glitch_strength = 1.0 - ((t_sec - vis_start) / 0.17)
            frame = _apply_auron_glitch_frame(frame, intensity=max(0.35, glitch_strength), seed=f_idx * 13 + cur["global_idx"])

        proc.stdin.write(frame.tobytes())

        if progress_cb and f_idx % max(1, seg_frames // 8) == 0:
            pct = prog_base + int((f_idx / float(seg_frames)) * prog_span)
            progress_cb(pct, f"Rendere Video-Frames ({f_idx}/{seg_frames} @ {FPS} FPS)…")

    proc.stdin.close()
    stderr_bytes = proc.stderr.read() if proc.stderr else b""
    ret = proc.wait()
    if ret != 0 or not seg_mp4.exists():
        raise RuntimeError(f"FFmpeg Video-Encoding fehlgeschlagen: {stderr_bytes.decode('utf-8', errors='ignore')[-400:]}")


def render_complete_auron_video(
    *,
    blueprint: dict[str, Any],
    audio_bundle: dict[str, Any],
    work_dir: Path,
    final_mp4_path: Path,
    settings: dict[str, Any],
    quality: str = "hd",
    progress_cb: Any = None,
) -> dict[str, Any]:
    """Render all scenes at 24fps with Cold-Open-First Intro Placement, Mid-Scene Pattern Interrupts & High-CTR Thumbnail."""
    video_format = str(blueprint.get("video_format") or "9:16")
    if video_format == "9:16":
        width, height = (1080, 1920) if quality == "fullhd" else (720, 1280)
    else:
        width, height = (1920, 1080) if quality == "fullhd" else (1280, 720)

    scenes = blueprint.get("scenes") or []
    timings = audio_bundle["scene_timings"]
    master_wav: Path = audio_bundle["master_wav"]
    total_dur: float = float(audio_bundle["total_duration_sec"])
    pillar = str(blueprint.get("pillar") or "AuronOrigin")

    include_watermark = bool(settings.get("include_watermark", True))
    include_subtitles = bool(settings.get("include_subtitles", True))
    include_intro = bool(settings.get("include_brand_intro", True))
    include_outro = bool(settings.get("include_brand_outro", True))

    wm_img: Image.Image | None = None
    wm_path = Path(BRAND_IDENTITY["assets"]["watermark_png"])
    if include_watermark and wm_path.exists():
        wm_img = Image.open(wm_path).convert("RGBA")

    prepared_scenes: list[dict[str, Any]] = []
    scene_caption_groups: list[list[dict[str, Any]]] = []

    scene_image_mode = str(settings.get("scene_image_mode") or "auto_ai_brand")

    for idx, (sc, tm) in enumerate(zip(scenes, timings)):
        if progress_cb:
            progress_cb(
                int(50 + (idx / max(1, len(scenes))) * 15),
                f"Generiere AuronOrigin-Szenenbild {idx + 1}/{len(scenes)} ({sc.get('visual_motif')})…",
            )
        custom_id = str(sc.get("custom_image_id") or "").strip()
        custom_img_path = (UPLOADS_DIR / Path(custom_id).name) if custom_id else None
        scene_seed = int(sc.get("visual_seed") or (abs(hash(f"{blueprint.get('title')}-{idx}")) % 90_000_000 + 1000))

        plate_img = render_sacred_motif_plate(
            motif=str(sc.get("visual_motif") or "eye_of_horus"),
            width=width,
            height=height,
            seed=scene_seed,
            custom_image_path=custom_img_path if (custom_img_path and custom_img_path.exists()) else None,
            prompt_en=str(sc.get("image_prompt_en") or ""),
            scene_image_mode=scene_image_mode,
        )
        plate_arr = np.asarray(plate_img, dtype=np.uint8)

        captions = _split_narration_into_caption_chunks(
            str(sc.get("narration") or ""),
            float(tm["speech_start"]),
            float(tm["speech_end"]),
            max_words_per_chunk=5 if video_format == "9:16" else 8,
        )
        scene_caption_groups.append(captions)

        is_final = idx == len(scenes) - 1
        silent_hud = _build_scene_hud_rgba(
            width=width,
            height=height,
            scene=sc,
            pillar=pillar,
            caption_text="",
            include_watermark=include_watermark,
            include_subtitles=include_subtitles,
            is_final_cta=is_final,
            watermark_img=wm_img,
            scene_idx=idx,
            total_scenes=len(scenes),
        )
        caption_huds: list[tuple[float, float, np.ndarray]] = []
        for cap in captions:
            c_hud = _build_scene_hud_rgba(
                width=width,
                height=height,
                scene=sc,
                pillar=pillar,
                caption_text=cap["text"],
                include_watermark=include_watermark,
                include_subtitles=include_subtitles,
                is_final_cta=is_final,
                watermark_img=wm_img,
                scene_idx=idx,
                total_scenes=len(scenes),
            )
            caption_huds.append((cap["start"], cap["end"], c_hud))

        prepared_scenes.append(
            {
                "global_idx": idx,
                "scene": sc,
                "timing": tm,
                "plate": plate_arr,
                "silent_hud": silent_hud,
                "caption_huds": caption_huds,
            }
        )

    # COLD-OPEN-FIRST ARCHITECTURE:
    # Never place a 5-second logo intro BEFORE 00:00!
    # Scene 1 (Cold Open Hook) ALWAYS starts immediately at 00:00 to lock in early retention.
    # When `include_intro` is active and there are >=2 scenes, weave a snappy 2.2s Brand Stinger AFTER Scene 1!
    segments_to_concat: list[Path] = []
    stinger_dur_sec = 0.0
    intro_src = Path(BRAND_IDENTITY["assets"]["intro_mp4"])
    intro_seg = work_dir / "seg_stinger.mp4"

    use_post_hook_stinger = (
        include_intro
        and len(prepared_scenes) >= 2
        and _prepare_brand_clip_segment(intro_src, intro_seg, width, height, max_duration=2.2)
    )

    if use_post_hook_stinger:
        stinger_dur_sec = 2.2
        cold_end_sec = float(prepared_scenes[0]["timing"]["visual_end"])
        rest_dur_sec = max(0.2, total_dur - cold_end_sec)

        seg_cold = work_dir / "body_cold_open.mp4"
        seg_main = work_dir / "body_main_acts.mp4"

        _encode_body_segment_mp4(
            prepared_slice=prepared_scenes[:1],
            audio_wav=master_wav,
            audio_start_sec=0.0,
            audio_dur_sec=cold_end_sec,
            seg_mp4=seg_cold,
            width=width,
            height=height,
            global_start_sec=0.0,
            global_total_dur=total_dur + stinger_dur_sec,
            progress_cb=progress_cb,
            prog_base=66,
            prog_span=4,
        )
        _encode_body_segment_mp4(
            prepared_slice=prepared_scenes[1:],
            audio_wav=master_wav,
            audio_start_sec=cold_end_sec,
            audio_dur_sec=rest_dur_sec,
            seg_mp4=seg_main,
            width=width,
            height=height,
            global_start_sec=cold_end_sec + stinger_dur_sec,
            global_total_dur=total_dur + stinger_dur_sec,
            progress_cb=progress_cb,
            prog_base=70,
            prog_span=18,
        )
        segments_to_concat.extend([seg_cold, intro_seg, seg_main])
    else:
        body_mp4 = work_dir / "body_rendered.mp4"
        _encode_body_segment_mp4(
            prepared_slice=prepared_scenes,
            audio_wav=master_wav,
            audio_start_sec=0.0,
            audio_dur_sec=total_dur,
            seg_mp4=body_mp4,
            width=width,
            height=height,
            global_start_sec=0.0,
            global_total_dur=total_dur,
            progress_cb=progress_cb,
            prog_base=66,
            prog_span=22,
        )
        segments_to_concat.append(body_mp4)

    outro_dur_sec = 0.0
    if include_outro:
        outro_src = Path(BRAND_IDENTITY["assets"]["outro_mp4"])
        outro_seg = work_dir / "seg_outro.mp4"
        # Tight 5.5s End-Screen canvas (satisfies YouTube >=5s End-Screen minimum without retention drag!)
        if _prepare_brand_clip_segment(outro_src, outro_seg, width, height, max_duration=5.5):
            segments_to_concat.append(outro_seg)
            outro_dur_sec = 5.5

    if progress_cb:
        progress_cb(91, "Finalisiere MP4-Master (Cold-Open-Sync) & High-CTR Thumbnails…")

    if len(segments_to_concat) == 1:
        segments_to_concat[0].replace(final_mp4_path)
    else:
        inputs_args: list[str] = []
        filter_parts: list[str] = []
        for s_i, seg_p in enumerate(segments_to_concat):
            inputs_args += ["-i", str(seg_p)]
            filter_parts.append(f"[{s_i}:v:0][{s_i}:a:0]")
        concat_filter = f"{''.join(filter_parts)}concat=n={len(segments_to_concat)}:v=1:a=1[outv][outa]"

        concat_cmd = [
            FFMPEG_BIN,
            "-y",
            *inputs_args,
            "-filter_complex",
            concat_filter,
            "-map",
            "[outv]",
            "-map",
            "[outa]",
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-crf",
            "20",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-ar",
            str(SAMPLE_RATE),
            "-ac",
            "2",
            "-movflags",
            "+faststart",
            str(final_mp4_path),
        ]
        c_res = subprocess.run(concat_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        if c_res.returncode != 0 or not final_mp4_path.exists():
            segments_to_concat[0].replace(final_mp4_path)
            stinger_dur_sec = 0.0
            outro_dur_sec = 0.0

    # Adjust final captions & scene_timings for post-Cold-Open stinger so .SRT and YouTube Chapters are 100% synced!
    all_srt_captions: list[dict[str, Any]] = []
    for idx_g, caps in enumerate(scene_caption_groups):
        shift = stinger_dur_sec if (use_post_hook_stinger and idx_g >= 1 and stinger_dur_sec > 0.0) else 0.0
        for cp in caps:
            all_srt_captions.append(
                {
                    "text": cp["text"],
                    "start": round(float(cp["start"]) + shift, 3),
                    "end": round(float(cp["end"]) + shift, 3),
                }
            )

    synced_scene_timings: list[dict[str, Any]] = []
    for idx_t, tm in enumerate(timings):
        shift = stinger_dur_sec if (use_post_hook_stinger and idx_t >= 1 and stinger_dur_sec > 0.0) else 0.0
        synced_scene_timings.append(
            {
                **tm,
                "visual_start": round(float(tm["visual_start"]) + shift, 3),
                "visual_end": round(float(tm["visual_end"]) + shift, 3),
                "speech_start": round(float(tm["speech_start"]) + shift, 3),
                "speech_end": round(float(tm["speech_end"]) + shift, 3),
            }
        )

    thumb_path = final_mp4_path.with_name(final_mp4_path.stem + "_thumbnail.png")
    srt_path = final_mp4_path.with_name(final_mp4_path.stem + "_untertitel.srt")
    generate_youtube_thumbnail(blueprint=blueprint, out_png=thumb_path, scene_image_mode=scene_image_mode, variant="A")
    write_srt_subtitles(all_srt_captions, srt_path, offset_sec=0.0)

    total_final_dur = total_dur + stinger_dur_sec + outro_dur_sec

    return {
        "video_path": final_mp4_path,
        "thumbnail_path": thumb_path,
        "srt_path": srt_path,
        "captions": all_srt_captions,
        "synced_scene_timings": synced_scene_timings,
        "intro_offset_sec": 0.0,
        "stinger_dur_sec": stinger_dur_sec,
        "outro_dur_sec": outro_dur_sec,
        "resolution": f"{width}x{height}",
        "fps": FPS,
        "duration_sec": round(total_final_dur, 2),
    }
