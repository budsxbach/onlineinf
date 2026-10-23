from __future__ import annotations

import math
import re
import subprocess
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

from .audio_engine import FFMPEG_BIN, SAMPLE_RATE
from .config import BRAND_IDENTITY, UPLOADS_DIR

# Brand RGB Constants (strictly from AuronOrigin Brand Identity Kit)
C_BG_DEEP = (11, 12, 16)         # #0B0C10 Deep Space Black (60%)
C_STEEL = (31, 40, 51)           # #1F2833 Cosmic Steel Blue (20%)
C_GOLD = (212, 175, 55)          # #D4AF37 Auron-Gold (15%)
C_GOLD_BRIGHT = (242, 210, 102)  # Luminous Gold highlight
C_VIOLET = (74, 35, 90)          # #4A235A Mystic Violet (<=5% badge accent)
C_TEXT = (197, 198, 199)         # #C5C6C7 Light Grey Body
C_MUTED = (122, 136, 155)        # #7A889B Metadata Steel
C_CRIMSON = (192, 57, 43)        # Subtle glitch/anomaly accent

FPS = 24


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

    # First split on natural clause punctuation, then chunk long clauses into <= max_words_per_chunk
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

    # Subtle cosmic dust & star points
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


def _blend_brand_emblem(base: Image.Image, img_path: Path, center: tuple[int, int], target_diameter: int, opacity: float = 0.86) -> None:
    """Composite a circularly feathered brand artwork (Eye of Horus avatar or Ouroboros logo) onto base."""
    if not img_path.exists():
        return
    src = Image.open(img_path).convert("RGB")
    src = src.resize((target_diameter, target_diameter), Image.Resampling.LANCZOS)
    src = ImageEnhance.Contrast(src).enhance(1.12)

    # Smooth radial alpha mask so edges dissolve organically into #0B0C10
    yy, xx = np.ogrid[:target_diameter, :target_diameter]
    r = target_diameter / 2.0
    dist = np.sqrt((xx - r) ** 2 + (yy - r) ** 2) / r
    alpha = np.clip((1.0 - dist) / 0.28, 0.0, 1.0) ** 1.35 * (255.0 * opacity)
    mask = Image.fromarray(alpha.astype(np.uint8), mode="L")

    px = int(center[0] - target_diameter // 2)
    py = int(center[1] - target_diameter // 2)
    base.paste(src, (px, py), mask)


def render_sacred_motif_plate(
    *,
    motif: str,
    width: int,
    height: int,
    seed: int = 42,
    custom_image_path: Path | None = None,
) -> Image.Image:
    """Generate an oversized (1.14x) Sacred-Tech AuronOrigin artwork plate for smooth Ken Burns camera motion."""
    w = int(width * 1.14)
    h = int(height * 1.14)
    # Ensure even dimensions
    w += w % 2
    h += h % 2

    plate = _create_cosmic_backdrop(w, h, seed=seed)
    cx, cy = w // 2, int(h * (0.43 if height > width else 0.47))
    min_dim = min(w, h)

    # Optional user-uploaded custom scene image graded in AuronOrigin Dark-Gold Cinema LUT
    if custom_image_path and custom_image_path.exists():
        try:
            u_img = Image.open(custom_image_path).convert("RGB")
            src_ratio = u_img.width / float(u_img.height)
            dst_ratio = w / float(h)
            if src_ratio > dst_ratio:
                nh = h
                nw = int(h * src_ratio)
            else:
                nw = w
                nh = int(w / src_ratio)
            u_img = u_img.resize((nw, nh), Image.Resampling.LANCZOS)
            left = (nw - w) // 2
            top = (nh - h) // 2
            u_img = u_img.crop((left, top, left + w, top + h))
            u_img = ImageEnhance.Brightness(u_img).enhance(0.56)
            u_img = ImageEnhance.Contrast(u_img).enhance(1.15)
            plate = Image.blend(plate, u_img, alpha=0.80)
        except Exception:
            pass

    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Subtle sacred-geometry background grid lines
    step = max(48, min_dim // 12)
    for gx in range(0, w, step):
        draw.line([(gx, 0), (gx, h)], fill=(31, 40, 51, 34), width=1)
    for gy in range(0, h, step):
        draw.line([(0, gy), (w, gy)], fill=(31, 40, 51, 34), width=1)

    if custom_image_path and custom_image_path.exists():
        # Add subtle gold sacred ring framing around custom visual
        r_outer = int(min_dim * 0.38)
        draw.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], outline=(*C_GOLD, 70), width=2)
        return Image.alpha_composite(plate.convert("RGBA"), overlay).convert("RGB")

    if motif == "eye_of_horus":
        avatar_path = Path(BRAND_IDENTITY["assets"]["avatar_jpg"])
        diam = int(min_dim * 0.56)
        _blend_brand_emblem(plate, avatar_path, (cx, cy), diam, opacity=0.88)
        for rad_f, alpha_v, wid in ((0.30, 150, 2), (0.37, 95, 1), (0.44, 55, 1)):
            rad = int(min_dim * rad_f)
            draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], outline=(*C_GOLD, alpha_v), width=wid)
        # Degree ticks around outer ring
        r_tick = int(min_dim * 0.37)
        for deg in range(0, 360, 15):
            ang = math.radians(deg + seed * 7)
            r_in = r_tick - (12 if deg % 45 == 0 else 6)
            x1, y1 = cx + int(r_in * math.cos(ang)), cy + int(r_in * math.sin(ang))
            x2, y2 = cx + int(r_tick * math.cos(ang)), cy + int(r_tick * math.sin(ang))
            draw.line([(x1, y1), (x2, y2)], fill=(*C_GOLD, 165 if deg % 45 == 0 else 85), width=2 if deg % 45 == 0 else 1)

    elif motif == "ouroboros_seal":
        logo_path = Path(BRAND_IDENTITY["assets"]["logo_jpg"])
        diam = int(min_dim * 0.58)
        _blend_brand_emblem(plate, logo_path, (cx, cy), diam, opacity=0.90)
        # Sacred hexagram / dual equilateral triangles in translucent gold
        rad = int(min_dim * 0.34)
        for rot in (0, 60):
            pts = [
                (
                    cx + int(rad * math.cos(math.radians(rot + k * 120 - 90))),
                    cy + int(rad * math.sin(math.radians(rot + k * 120 - 90))),
                )
                for k in range(3)
            ]
            draw.polygon(pts, outline=(*C_GOLD, 105), width=2)
        draw.ellipse([cx - int(rad * 1.12), cy - int(rad * 1.12), cx + int(rad * 1.12), cy + int(rad * 1.12)], outline=(*C_GOLD, 130), width=2)

    elif motif == "pyramid_radar":
        # Wireframe Giza Pyramid with Muon/SAR Tomography scan beams
        pyr_h = int(min_dim * 0.42)
        pyr_w = int(min_dim * 0.56)
        apex = (cx, cy - int(pyr_h * 0.62))
        bl = (cx - pyr_w // 2, cy + int(pyr_h * 0.45))
        br = (cx + pyr_w // 2, cy + int(pyr_h * 0.45))
        bm = (cx + int(pyr_w * 0.08), cy + int(pyr_h * 0.56))

        # Horizontal SAR radar strata lines inside pyramid
        for i in range(1, 16):
            frac = i / 16.0
            lx = int(apex[0] + (bl[0] - apex[0]) * frac)
            rx = int(apex[0] + (br[0] - apex[0]) * frac)
            ly = int(apex[1] + (bl[1] - apex[1]) * frac)
            draw.line([(lx, ly), (rx, ly)], fill=(*C_GOLD, 55 if i % 3 else 115), width=1)

        # Outer pyramid wireframe
        draw.line([apex, bl], fill=(*C_GOLD_BRIGHT, 220), width=3)
        draw.line([apex, br], fill=(*C_GOLD_BRIGHT, 220), width=3)
        draw.line([apex, bm], fill=(*C_GOLD, 180), width=2)
        draw.line([bl, bm], fill=(*C_GOLD, 195), width=2)
        draw.line([bm, br], fill=(*C_GOLD, 195), width=2)

        # Glowing hidden chamber & Grand Gallery scan anomaly
        ch_x, ch_y = cx - int(pyr_w * 0.02), cy + int(pyr_h * 0.05)
        draw.rectangle([ch_x - 28, ch_y - 16, ch_x + 28, ch_y + 16], fill=(*C_VIOLET, 145), outline=(*C_GOLD_BRIGHT, 235), width=2)
        draw.line([(cx - int(pyr_w * 0.18), cy + int(pyr_h * 0.22)), (ch_x + 24, ch_y - 12)], fill=(*C_GOLD_BRIGHT, 210), width=3)
        for r_scan in (int(min_dim * 0.34), int(min_dim * 0.42)):
            draw.arc([cx - r_scan, cy - r_scan, cx + r_scan, cy + r_scan], start=200, end=340, fill=(*C_GOLD, 95), width=2)

    elif motif == "quantum_lattice":
        # 3D Optical Clock / Time-Crystal Perspective Grid + Central Polyhedron
        horizon_y = cy + int(min_dim * 0.08)
        for k in range(-10, 11):
            x_top = cx + k * int(min_dim * 0.022)
            x_bot = cx + k * int(min_dim * 0.095)
            draw.line([(x_top, horizon_y), (x_bot, h)], fill=(*C_GOLD, 72 if k % 2 == 0 else 38), width=1)
        for row in range(1, 11):
            y_pos = horizon_y + int(((row / 10.0) ** 1.7) * (h - horizon_y))
            draw.line([(0, y_pos), (w, y_pos)], fill=(*C_GOLD, 65), width=1)

        # Time-Crystal Octahedron in upper cosmic field
        oct_cy = cy - int(min_dim * 0.06)
        oct_r = int(min_dim * 0.22)
        nodes = [
            (cx, oct_cy - oct_r),
            (cx + int(oct_r * 0.85), oct_cy),
            (cx, oct_cy + oct_r),
            (cx - int(oct_r * 0.85), oct_cy),
            (cx + int(oct_r * 0.35), oct_cy - int(oct_r * 0.22)),
            (cx - int(oct_r * 0.35), oct_cy + int(oct_r * 0.22)),
        ]
        for i_n in range(len(nodes)):
            for j_n in range(i_n + 1, len(nodes)):
                draw.line([nodes[i_n], nodes[j_n]], fill=(*C_GOLD_BRIGHT, 155), width=2)
        for nx, ny in nodes:
            draw.ellipse([nx - 6, ny - 6, nx + 6, ny + 6], fill=(*C_GOLD_BRIGHT, 240))
        draw.ellipse([cx - int(oct_r * 1.25), oct_cy - int(oct_r * 1.25), cx + int(oct_r * 1.25), oct_cy + int(oct_r * 1.25)], outline=(*C_VIOLET, 165), width=3)

    elif motif == "neural_cosmos":
        # Synaptic / Thalamus Consciousness Network with Golden Resonance Waves
        rng = np.random.default_rng(seed + 99)
        n_pts = 34
        angles = np.linspace(0, 2 * math.pi, n_pts, endpoint=False)
        radii = rng.uniform(min_dim * 0.06, min_dim * 0.34, size=n_pts)
        pts = [(cx + int(r * math.cos(a) * 1.12), cy + int(r * math.sin(a) * 0.88)) for a, r in zip(angles, radii)]
        pts.append((cx, cy))

        for i_p, (x1, y1) in enumerate(pts):
            for x2, y2 in pts[i_p + 1 :]:
                dist = math.hypot(x2 - x1, y2 - y1)
                if dist < min_dim * 0.20:
                    alpha = int(max(30, 175 * (1.0 - dist / (min_dim * 0.20))))
                    col = C_GOLD if (i_p % 3 != 0) else (138, 86, 162)
                    draw.line([(x1, y1), (x2, y2)], fill=(*col, alpha), width=2)

        for idx_p, (nx, ny) in enumerate(pts):
            rr = 7 if idx_p % 5 == 0 else 4
            draw.ellipse([nx - rr, ny - rr, nx + rr, ny + rr], fill=(*C_GOLD_BRIGHT, 230))
        # Central thalamus / third-eye harmonic rings
        for rad_c in (int(min_dim * 0.09), int(min_dim * 0.19), int(min_dim * 0.31)):
            draw.ellipse([cx - rad_c, cy - rad_c, cx + rad_c, cy + rad_c], outline=(*C_GOLD, 95), width=2)

    else:
        # 'sacred_archive': Temple Glyph Columns morphing into Vector Streams
        col_count = 7
        span_w = int(min_dim * 0.68)
        start_x = cx - span_w // 2
        col_step = span_w // max(1, col_count - 1)
        rng = np.random.default_rng(seed + 2026)
        for c_idx in range(col_count):
            x_col = start_x + c_idx * col_step
            draw.line([(x_col, cy - int(min_dim * 0.34)), (x_col, cy + int(min_dim * 0.34))], fill=(*C_GOLD, 70), width=1)
            for row_i in range(-5, 6):
                gy = cy + row_i * int(min_dim * 0.058)
                shape_kind = int(rng.integers(0, 4))
                sz = 10
                alpha = 185 if abs(row_i) <= 2 else 95
                if shape_kind == 0:
                    draw.ellipse([x_col - sz, gy - sz, x_col + sz, gy + sz], outline=(*C_GOLD, alpha), width=2)
                elif shape_kind == 1:
                    draw.polygon([(x_col, gy - sz), (x_col + sz, gy + sz), (x_col - sz, gy + sz)], outline=(*C_GOLD_BRIGHT, alpha), width=2)
                elif shape_kind == 2:
                    draw.rectangle([x_col - sz, gy - sz, x_col + sz, gy + sz], outline=(*C_GOLD, alpha), width=2)
                else:
                    draw.line([(x_col - sz, gy), (x_col + sz, gy)], fill=(*C_GOLD_BRIGHT, alpha), width=2)
                    draw.ellipse([x_col - 3, gy - 3, x_col + 3, gy + 3], fill=(*C_GOLD_BRIGHT, alpha))

        # Central glowing Ouroboros ring overlay
        r_mid = int(min_dim * 0.25)
        draw.ellipse([cx - r_mid, cy - r_mid, cx + r_mid, cy + r_mid], outline=(*C_GOLD_BRIGHT, 190), width=3)

    # Dark cinematic top & bottom gradient vignette so typography & subtitles always have AAA contrast
    vig = np.zeros((h, w, 4), dtype=np.uint8)
    y_norm = np.linspace(0.0, 1.0, h, dtype=np.float32)
    top_dark = np.clip((0.28 - y_norm) / 0.28, 0.0, 1.0) * 185.0
    bot_dark = np.clip((y_norm - 0.56) / 0.44, 0.0, 1.0) * 225.0
    alpha_col = np.maximum(top_dark, bot_dark).astype(np.uint8)
    vig[:, :, 0] = C_BG_DEEP[0]
    vig[:, :, 1] = C_BG_DEEP[1]
    vig[:, :, 2] = C_BG_DEEP[2]
    vig[:, :, 3] = alpha_col[:, None]

    composed = Image.alpha_composite(plate.convert("RGBA"), overlay)
    composed = Image.alpha_composite(composed, Image.fromarray(vig, mode="RGBA"))
    return composed.convert("RGB")


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
) -> np.ndarray:
    """Pre-render crisp RGBA typography & brand HUD layer for one caption slice."""
    is_vertical = height > width
    hud = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(hud)

    pad_x = int(width * (0.075 if is_vertical else 0.065))
    top_y = int(height * (0.065 if is_vertical else 0.07))

    # 1. Top-left Pillar & Fact/Mystery Classification Badge (<=5% Mystic Violet or Cosmic Steel)
    badge_label = f"{pillar.upper()}  •  {scene.get('fact_badge', 'FAKT')}"
    f_badge = _load_font("inter", max(16, int(width * (0.026 if is_vertical else 0.015))))
    bb = draw.textbbox((0, 0), badge_label, font=f_badge)
    bw, bh = bb[2] - bb[0] + 28, bb[3] - bb[1] + 16
    is_mystery_badge = any(k in badge_label for k in ("DEUTUNG", "MYSTERY", "IMPULS", "GEDANKEN"))
    badge_bg = (*C_VIOLET, 215) if is_mystery_badge else (*C_STEEL, 225)
    draw.rounded_rectangle([pad_x, top_y, pad_x + bw, top_y + bh], radius=8, fill=badge_bg, outline=(*C_GOLD, 195), width=2)
    draw.text((pad_x + 14, top_y + 7), badge_label, font=f_badge, fill=(*C_GOLD_BRIGHT, 255))

    # 2. Top-right official AuronOrigin circular Watermark (cleaned RGBA emblem)
    if include_watermark and watermark_img is not None:
        wm_size = int(min(width, height) * (0.105 if is_vertical else 0.095))
        wm_resized = watermark_img.resize((wm_size, wm_size), Image.Resampling.LANCZOS)
        hud.alpha_composite(wm_resized, dest=(width - pad_x - wm_size, top_y - 4))

    # 3. Monumental Cinzel ALL-CAPS Scene Headline in Auron-Gold (#D4AF37)
    headline = str(scene.get("on_screen_headline") or "").upper()
    if headline:
        f_head = _load_font("cinzel", max(26, int(width * (0.052 if is_vertical else 0.032))))
        head_lines = _wrap_text(draw, headline, f_head, width - 2 * pad_x)[:2]
        hy = top_y + bh + int(height * 0.022)
        for line in head_lines:
            # Crisp dark shadow for legibility
            draw.text((pad_x + 2, hy + 2), line, font=f_head, fill=(0, 0, 0, 220))
            draw.text((pad_x, hy), line, font=f_head, fill=(*C_GOLD, 255))
            lbox = draw.textbbox((0, hy), line, font=f_head)
            hy = lbox[3] + 8

        # Thin golden sacred divider line with clean breathing room below Cinzel letters
        div_y = hy + 6
        draw.line([(pad_x, div_y), (pad_x + int(width * 0.30), div_y)], fill=(*C_GOLD, 185), width=2)

        subline = str(scene.get("on_screen_subline") or "").strip()
        if subline:
            f_sub = _load_font("inter", max(16, int(width * (0.028 if is_vertical else 0.017))))
            draw.text((pad_x, div_y + 12), subline[:75], font=f_sub, fill=(*C_MUTED, 240))

    # 4. Burned-in Retention Subtitles (Lower-third glass card + Gold keyword highlight)
    if include_subtitles and caption_text:
        f_cap = _load_font("inter", max(22, int(width * (0.044 if is_vertical else 0.025))))
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
            fill=(11, 12, 16, 208),
            outline=(*C_GOLD, 125),
            width=2,
        )

        # Highlight longest/key content word in Auron-Gold for high retention visual anchor
        ty = box_y + 13
        for ln in cap_lines:
            words = ln.split()
            key_idx = -1
            best_len = 4
            for wi, w_tok in enumerate(words):
                clean_w = re.sub(r"[^A-Za-zÄÖÜäöüß0-9]", "", w_tok)
                if len(clean_w) > best_len:
                    best_len = len(clean_w)
                    key_idx = wi

            full_bb = draw.textbbox((0, 0), ln, font=f_cap)
            line_w = full_bb[2] - full_bb[0]
            tx = (width - line_w) // 2

            for wi, w_tok in enumerate(words):
                piece = w_tok + (" " if wi < len(words) - 1 else "")
                col = (*C_GOLD_BRIGHT, 255) if wi == key_idx else (*C_TEXT, 255)
                draw.text((tx + 2, ty + 2), piece, font=f_cap, fill=(0, 0, 0, 230))
                draw.text((tx, ty), piece, font=f_cap, fill=col)
                p_bb = draw.textbbox((0, 0), piece, font=f_cap)
                tx += p_bb[2] - p_bb[0]
            ty += line_h

    # 5. Subscriber Conversion Banner on Final CTA Scene (with geometric gold diamond sigils, zero tofu glyphs)
    if is_final_cta:
        cta_txt = "AURONORIGIN ABONNIEREN  •  GLOCKE AKTIVIEREN"
        f_cta = _load_font("cinzel", max(17, int(width * (0.029 if is_vertical else 0.018))))
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
        # Draw left & right sacred gold diamond ornaments
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

    # Chromatic RGB channel split (Red right, Blue left)
    out[:, :, 0] = np.roll(out[:, :, 0], shift, axis=1)
    out[:, :, 2] = np.roll(out[:, :, 2], -shift, axis=1)

    # 3 brief horizontal scanline slice displacements
    rng = np.random.default_rng(seed)
    for _ in range(3):
        y0 = int(rng.integers(int(h * 0.12), int(h * 0.85)))
        sh = int(rng.integers(8, max(12, int(h * 0.035))))
        dx = int(rng.integers(-shift * 3, shift * 3 + 1))
        y1 = min(h, y0 + sh)
        out[y0:y1] = np.roll(out[y0:y1], dx, axis=1)
    return out


def _camera_crop_frame(plate_arr: np.ndarray, out_w: int, out_h: int, motion: str, progress: float) -> np.ndarray:
    """Smooth Ken Burns camera motion from oversized plate using fast bilinear/area slicing."""
    ph, pw, _ = plate_arr.shape
    p = max(0.0, min(1.0, progress))
    # Smooth cosine easing
    ease = 0.5 - 0.5 * math.cos(math.pi * p)

    if motion == "zoom_in":
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
        # drift_right
        cw, ch = out_w, out_h
        x0 = int((pw - cw) * ease)
        y0 = (ph - ch) // 2

    cropped = plate_arr[y0 : y0 + ch, x0 : x0 + cw]
    if cropped.shape[1] == out_w and cropped.shape[0] == out_h:
        return cropped
    img = Image.fromarray(cropped, mode="RGB").resize((out_w, out_h), Image.Resampling.BILINEAR)
    return np.asarray(img, dtype=np.uint8)


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
        # Frame 16:9 brand intro/outro inside a dark blurred Sacred-Tech 9:16 vertical stage
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

    cmd = [FFMPEG_BIN, "-y"]
    if max_duration is not None:
        cmd += ["-t", f"{max_duration:.2f}"]
    cmd += [
        "-i",
        str(src_mp4),
        "-vf",
        vf,
        "-af",
        f"aresample={SAMPLE_RATE},aformat=sample_fmts=fltp:channel_layouts=stereo",
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


def generate_youtube_thumbnail(
    *,
    blueprint: dict[str, Any],
    out_png: Path,
) -> Path:
    """Render a high-CTR 1280x720 AuronOrigin YouTube Thumbnail PNG."""
    w, h = 1280, 720
    scenes = blueprint.get("scenes") or []
    first_motif = scenes[0].get("visual_motif", "eye_of_horus") if scenes else "eye_of_horus"
    custom_id = scenes[0].get("custom_image_id") if scenes else ""
    custom_path = (UPLOADS_DIR / custom_id) if custom_id else None

    # Render dramatic artwork shifted slightly right so bold left/center text pops
    bg = render_sacred_motif_plate(
        motif=first_motif,
        width=w,
        height=h,
        seed=777,
        custom_image_path=custom_path if (custom_path and custom_path.exists()) else None,
    ).resize((w, h), Image.Resampling.LANCZOS)

    rgba = bg.convert("RGBA")
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Left-side dark gradient for bold 2-3 word trigger legibility
    grad = np.zeros((h, w, 4), dtype=np.uint8)
    x_norm = np.linspace(0.0, 1.0, w, dtype=np.float32)
    alpha_x = (np.clip(1.0 - x_norm * 0.95, 0.22, 0.88) * 235.0).astype(np.uint8)
    grad[:, :, 0] = C_BG_DEEP[0]
    grad[:, :, 1] = C_BG_DEEP[1]
    grad[:, :, 2] = C_BG_DEEP[2]
    grad[:, :, 3] = alpha_x[None, :]
    rgba = Image.alpha_composite(rgba, Image.fromarray(grad, mode="RGBA"))
    draw = ImageDraw.Draw(rgba)

    # Outer sacred gold hairline border
    draw.rectangle([22, 22, w - 22, h - 22], outline=(*C_GOLD, 180), width=3)

    # Pillar tag
    pillar = str(blueprint.get("pillar") or "AURONORIGIN").upper()
    f_tag = _load_font("inter", 24)
    tb = draw.textbbox((0, 0), pillar, font=f_tag)
    tw, th = tb[2] - tb[0] + 34, tb[3] - tb[1] + 18
    draw.rounded_rectangle([68, 66, 68 + tw, 66 + th], radius=8, fill=(*C_VIOLET, 235), outline=(*C_GOLD_BRIGHT, 240), width=2)
    draw.text((85, 74), pillar, font=f_tag, fill=(*C_GOLD_BRIGHT, 255))

    # 2–3 Word Cinzel ALL-CAPS Trigger
    trigger = str(blueprint.get("thumbnail_text") or "DER ZEIT-CODE").upper()
    f_hero = _load_font("cinzel", 86)
    lines = _wrap_text(draw, trigger, f_hero, int(w * 0.72))[:3]
    ty = 185
    for ln in lines:
        draw.text((72, ty + 5), ln, font=f_hero, fill=(0, 0, 0, 245))
        draw.text((68, ty), ln, font=f_hero, fill=(*C_GOLD_BRIGHT, 255))
        lb = draw.textbbox((0, 0), ln, font=f_hero)
        ty += (lb[3] - lb[1]) + 18

    sub = str(blueprint.get("thumbnail_subtext") or "FAKTEN & MYSTERIUM").upper()
    if sub:
        f_sub = _load_font("inter", 32)
        draw.text((70, ty + 18), sub, font=f_sub, fill=(*C_TEXT, 245))

    # Bottom-right watermark emblem + AURONORIGIN wordmark
    wm_path = Path(BRAND_IDENTITY["assets"]["watermark_png"])
    if wm_path.exists():
        wm = Image.open(wm_path).convert("RGBA").resize((112, 112), Image.Resampling.LANCZOS)
        rgba.alpha_composite(wm, dest=(w - 168, h - 164))

    f_brand = _load_font("cinzel", 26)
    draw.text((68, h - 78), "AURONORIGIN", font=f_brand, fill=(*C_GOLD, 230))

    rgba.convert("RGB").save(str(out_png), format="PNG", optimize=True)
    return out_png


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
    """Render all scenes at 24fps with Ken Burns, Glitch VFX, Watermark, Subtitles, Audio & Intro/Outro."""
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

    # 1. Pre-render oversized background plates & pre-compute caption HUD overlays per scene
    prepared_scenes: list[dict[str, Any]] = []
    all_srt_captions: list[dict[str, Any]] = []

    for idx, (sc, tm) in enumerate(zip(scenes, timings)):
        if progress_cb:
            progress_cb(
                int(50 + (idx / max(1, len(scenes))) * 15),
                f"Generiere Sacred-Tech Szene {idx + 1}/{len(scenes)} ({sc.get('visual_motif')})…",
            )
        custom_id = str(sc.get("custom_image_id") or "").strip()
        custom_img_path = (UPLOADS_DIR / custom_id) if custom_id else None

        plate_img = render_sacred_motif_plate(
            motif=str(sc.get("visual_motif") or "eye_of_horus"),
            width=width,
            height=height,
            seed=100 + idx * 37,
            custom_image_path=custom_img_path if (custom_img_path and custom_img_path.exists()) else None,
        )
        plate_arr = np.asarray(plate_img, dtype=np.uint8)

        captions = _split_narration_into_caption_chunks(
            str(sc.get("narration") or ""),
            float(tm["speech_start"]),
            float(tm["speech_end"]),
            max_words_per_chunk=5 if video_format == "9:16" else 8,
        )
        all_srt_captions.extend(captions)

        is_final = idx == len(scenes) - 1
        # Pre-render HUD with empty caption (for silent lead-in/pause) + one HUD per caption slice
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
            )
            caption_huds.append((cap["start"], cap["end"], c_hud))

        prepared_scenes.append(
            {
                "scene": sc,
                "timing": tm,
                "plate": plate_arr,
                "silent_hud": silent_hud,
                "caption_huds": caption_huds,
            }
        )

    # 2. Stream 24fps composited RGB24 frames directly into FFmpeg with master 48kHz audio
    body_mp4 = work_dir / "body_rendered.mp4"
    total_frames = max(1, int(round(total_dur * FPS)))

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
        "-i",
        str(master_wav),
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
        str(body_mp4),
    ]

    proc = subprocess.Popen(
        ffmpeg_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    assert proc.stdin is not None

    sc_ptr = 0
    for f_idx in range(total_frames):
        t_sec = f_idx / float(FPS)
        while sc_ptr < len(prepared_scenes) - 1 and t_sec >= prepared_scenes[sc_ptr]["timing"]["visual_end"]:
            sc_ptr += 1

        cur = prepared_scenes[sc_ptr]
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
        )

        # Select active subtitle HUD
        active_hud = cur["silent_hud"]
        for c_start, c_end, c_arr in cur["caption_huds"]:
            if c_start <= t_sec <= c_end + 0.08:
                active_hud = c_arr
                break

        frame = _alpha_composite_rgb(bg_frame, active_hud)

        # Thin golden retention progress bar along bottom edge (3px)
        bar_w = max(2, int(width * (f_idx / float(max(1, total_frames - 1)))))
        frame[-4:, :bar_w, 0] = C_GOLD[0]
        frame[-4:, :bar_w, 1] = C_GOLD[1]
        frame[-4:, :bar_w, 2] = C_GOLD[2]

        # Authentic AuronOrigin Glitch VFX on first 4 frames of transition scenes
        if sc_ptr > 0 and sc_obj.get("glitch_transition", True) and (t_sec - vis_start) < 0.17:
            glitch_strength = 1.0 - ((t_sec - vis_start) / 0.17)
            frame = _apply_auron_glitch_frame(frame, intensity=max(0.35, glitch_strength), seed=f_idx * 13)

        proc.stdin.write(frame.tobytes())

        if progress_cb and f_idx % max(1, total_frames // 10) == 0:
            pct = 66 + int((f_idx / float(total_frames)) * 22)
            progress_cb(pct, f"Rendere Video-Frames ({f_idx}/{total_frames} @ {FPS} FPS)…")

    proc.stdin.close()
    stderr_bytes = proc.stderr.read() if proc.stderr else b""
    ret = proc.wait()
    if ret != 0 or not body_mp4.exists():
        raise RuntimeError(f"FFmpeg Video-Encoding fehlgeschlagen: {stderr_bytes.decode('utf-8', errors='ignore')[-400:]}")

    # 3. Optionally stitch official AuronOrigin Intro (5s / 2.4s Short sting) & Outro (7s)
    segments_to_concat: list[Path] = []
    intro_offset_sec = 0.0

    if include_intro:
        intro_src = Path(BRAND_IDENTITY["assets"]["intro_mp4"])
        intro_seg = work_dir / "seg_intro.mp4"
        # For Shorts (9:16), keep intro sting snappy (2.5s) for maximum retention; full 5.0s for 16:9 Longform
        intro_len = 2.5 if video_format == "9:16" else None
        if _prepare_brand_clip_segment(intro_src, intro_seg, width, height, max_duration=intro_len):
            segments_to_concat.append(intro_seg)
            intro_offset_sec = 2.5 if video_format == "9:16" else 5.0

    segments_to_concat.append(body_mp4)

    if include_outro:
        outro_src = Path(BRAND_IDENTITY["assets"]["outro_mp4"])
        outro_seg = work_dir / "seg_outro.mp4"
        if _prepare_brand_clip_segment(outro_src, outro_seg, width, height, max_duration=None):
            segments_to_concat.append(outro_seg)

    if progress_cb:
        progress_cb(92, "Finalisiere MP4-Master inkl. AuronOrigin Intro/Outro & Thumbnail…")

    if len(segments_to_concat) == 1:
        body_mp4.replace(final_mp4_path)
    else:
        # Lossless-sync filter_complex concat across conformed segments
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
            # Fallback to body_mp4 if concat fails for any reason
            body_mp4.replace(final_mp4_path)

    # 4. Generate Thumbnail PNG & SRT Subtitles
    thumb_path = final_mp4_path.with_name(final_mp4_path.stem + "_thumbnail.png")
    srt_path = final_mp4_path.with_name(final_mp4_path.stem + "_untertitel.srt")
    generate_youtube_thumbnail(blueprint=blueprint, out_png=thumb_path)
    write_srt_subtitles(all_srt_captions, srt_path, offset_sec=intro_offset_sec)

    total_final_dur = total_dur + intro_offset_sec + (7.0 if include_outro and len(segments_to_concat) > 1 else 0.0)

    return {
        "video_path": final_mp4_path,
        "thumbnail_path": thumb_path,
        "srt_path": srt_path,
        "resolution": f"{width}x{height}",
        "fps": FPS,
        "duration_sec": round(total_final_dur, 2),
    }
