"""Automatic Bespoke Scene Artwork Generator for AuronOrigin.

Generates unique, non-repeating scene images for every scene of every video
strictly in AuronOrigin's signature brand world:
- Deep Space Black (#0B0C10)
- Dark Cosmic Blue (#101D30 / #1F2833 / #162B46)
- Luminous Auron-Gold (#D4AF37 / #F2D266)
- Subtle Mystic Violet (#4A235A)

Supports two complementary pipelines:
1. AI Scene Synthesis (Pollinations Flux / OpenAI Images when reachable on Ubuntu)
   followed by AuronOrigin's Tri-Tone Cinema Color-Grading LUT so every AI image
   is locked to the Dark-Blue & Gold brand palette.
2. Multi-Layer Volumetric Generative Cinema Art (domain-warped cosmic nebulae,
   golden volumetric god-rays, bokeh dust, additive Gaussian bloom, and 16 distinct
   3D/geometric compositions parameterized by each scene's unique `visual_seed`).
"""
from __future__ import annotations

import hashlib
import io
import math
from pathlib import Path
from typing import Any
from urllib.parse import quote

import numpy as np
import requests
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

from .config import BRAND_IDENTITY, CACHE_DIR

# AuronOrigin Exact Palette
C_OBSIDIAN = np.array([11.0, 12.0, 16.0], dtype=np.float32)       # #0B0C10
C_DARK_BLUE = np.array([18.0, 34.0, 58.0], dtype=np.float32)      # Rich Cosmic Dark Blue
C_STEEL_BLUE = np.array([31.0, 46.0, 68.0], dtype=np.float32)     # #1F2E44
C_VIOLET = np.array([74.0, 35.0, 90.0], dtype=np.float32)         # #4A235A
C_GOLD = np.array([212.0, 175.0, 55.0], dtype=np.float32)         # #D4AF37
C_GOLD_BRIGHT = np.array([246.0, 216.0, 118.0], dtype=np.float32) # #F6D876

T_OBSIDIAN = (11, 12, 16)
T_DARK_BLUE = (18, 34, 58)
T_STEEL_BLUE = (31, 46, 68)
T_VIOLET = (88, 44, 108)
T_GOLD = (212, 175, 55)
T_GOLD_BRIGHT = (246, 216, 118)
T_CYAN_STEEL = (62, 104, 148)

# Fast track whether external Pollinations endpoint is reachable in current environment
_AI_ENDPOINT_AVAILABLE: bool | None = None


def apply_auron_brand_color_grade(img: Image.Image, strength: float = 0.72) -> Image.Image:
    """Apply AuronOrigin's Dark-Blue & Gold Tri-Tone Cinema LUT to any generated image."""
    rgb = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
    lum = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]

    # S-curve contrast on luminance
    lum_c = np.clip((lum - 0.5) * 1.18 + 0.48, 0.0, 1.0)

    # Tri-tone map: Shadows -> #0B0C10..DarkBlue, Midtones -> Cosmic Dark Blue, Highlights -> Auron-Gold
    shadow_col = C_OBSIDIAN / 255.0
    mid_col = np.array([20.0, 40.0, 68.0], dtype=np.float32) / 255.0
    high_col = C_GOLD_BRIGHT / 255.0

    low_mask = np.clip(lum_c * 2.0, 0.0, 1.0)[:, :, None]
    high_mask = np.clip((lum_c - 0.48) / 0.52, 0.0, 1.0)[:, :, None] ** 1.25

    graded = shadow_col * (1.0 - low_mask) + mid_col * low_mask
    graded = graded * (1.0 - high_mask) + high_col * high_mask

    # Blend with original color saturation so natural warm gold/blue details survive
    blended = rgb * (1.0 - strength) + graded * strength
    out_u8 = np.clip(blended * 255.0, 0.0, 255.0).astype(np.uint8)
    return Image.fromarray(out_u8, mode="RGB")


def _try_fetch_ai_scene_image(prompt_en: str, width: int, height: int, seed: int) -> Image.Image | None:
    """Generate a unique AI scene image via Flux on Ubuntu with internet access, graded to AuronOrigin palette."""
    global _AI_ENDPOINT_AVAILABLE
    if _AI_ENDPOINT_AVAILABLE is False:
        return None

    brand_prompt = (
        f"{prompt_en}. Cinematic dark sci-fi documentary still, AuronOrigin aesthetic, "
        "color palette strictly deep midnight blue #1F2833, cosmic obsidian #0B0C10, and glowing metallic gold #D4AF37, "
        "volumetric lighting, ultra detailed, photorealistic, no text, no letters, no watermark"
    )
    req_w = min(1024, max(512, (width // 64) * 64))
    req_h = min(1024, max(512, (height // 64) * 64))
    url = (
        f"https://image.pollinations.ai/prompt/{quote(brand_prompt[:480])}"
        f"?width={req_w}&height={req_h}&seed={int(seed)}&model=flux&nologo=true"
    )
    try:
        resp = requests.get(
            url,
            headers={"User-Agent": "AuronOriginStudio/2.0"},
            timeout=12 if _AI_ENDPOINT_AVAILABLE is True else 3.5,
        )
        if resp.status_code == 200 and len(resp.content) > 4096:
            img = Image.open(io.BytesIO(resp.content)).convert("RGB")
            _AI_ENDPOINT_AVAILABLE = True
            img = img.resize((width, height), Image.Resampling.LANCZOS)
            return apply_auron_brand_color_grade(img, strength=0.62)
        if resp.status_code >= 400:
            _AI_ENDPOINT_AVAILABLE = False
    except Exception:
        _AI_ENDPOINT_AVAILABLE = False
    return None


def _domain_warped_nebula(width: int, height: int, rng: np.random.Generator) -> np.ndarray:
    """Synthesize a unique organic Dark-Blue & Gold cosmic nebula cloud field using domain-warped FBM."""
    # Compute at 1/4 resolution for speed, then bicubic-upsample smoothly
    gw = max(96, width // 4)
    gh = max(96, height // 4)
    y, x = np.mgrid[0:gh, 0:gw].astype(np.float32)
    nx = (x / float(gw)) * 2.0 - 1.0
    ny = (y / float(gh)) * 2.0 - 1.0

    # Seeded rotation + focal center shift so every scene has a unique sky topology
    fx = float(rng.uniform(-0.32, 0.32))
    fy = float(rng.uniform(-0.28, 0.22))
    rot = float(rng.uniform(0.0, math.pi * 2.0))
    rx = (nx - fx) * math.cos(rot) - (ny - fy) * math.sin(rot)
    ry = (nx - fx) * math.sin(rot) + (ny - fy) * math.cos(rot)

    # Multi-frequency domain warp
    k1 = float(rng.uniform(2.1, 3.8))
    k2 = float(rng.uniform(3.5, 6.2))
    p1 = float(rng.uniform(0, 6.28))
    p2 = float(rng.uniform(0, 6.28))
    wx = rx + 0.34 * np.sin(k1 * ry + p1) + 0.16 * np.cos(k2 * rx - p2)
    wy = ry + 0.34 * np.cos(k1 * rx + p2) + 0.16 * np.sin(k2 * ry + p1)

    fbm = np.zeros((gh, gw), dtype=np.float32)
    amp = 0.52
    freq = float(rng.uniform(1.8, 2.9))
    for _ in range(4):
        ph_x = float(rng.uniform(0, 6.28))
        ph_y = float(rng.uniform(0, 6.28))
        layer = 0.5 + 0.5 * np.sin(freq * wx + ph_x) * np.cos(freq * wy + ph_y)
        fbm += amp * layer
        freq *= 1.92
        amp *= 0.52

    fbm = np.clip(fbm, 0.0, 1.0)
    dist = np.sqrt((nx - fx * 0.6) ** 2 + (ny - fy * 0.6) ** 2)
    core_glow = np.clip(1.0 - dist * float(rng.uniform(0.68, 0.95)), 0.0, 1.0) ** 1.45

    # Filament ridges where wave phase crosses zero -> glowing golden dust veins!
    ridge = np.clip(1.0 - np.abs(np.sin(3.4 * wx + 2.7 * wy + p1)), 0.0, 1.0) ** 5.5

    # Compose RGB in Dark Cosmic Blue + Deep Space + Golden Nebula Veins + subtle Violet
    canvas = np.zeros((gh, gw, 3), dtype=np.float32)
    blue_mix = np.clip(fbm * 0.85 + core_glow * 0.55, 0.0, 1.0)
    violet_mask = (np.clip(np.sin(2.5 * wx - 1.8 * wy + p2), 0.0, 1.0) ** 3.0) * 0.28
    gold_vein = ridge * core_glow * float(rng.uniform(0.32, 0.58))

    for c in range(3):
        base_c = C_OBSIDIAN[c] * (1.0 - blue_mix) + C_DARK_BLUE[c] * blue_mix
        base_c = base_c + C_STEEL_BLUE[c] * (core_glow * 0.42)
        base_c = base_c * (1.0 - violet_mask) + C_VIOLET[c] * violet_mask
        base_c = base_c + C_GOLD[c] * gold_vein
        canvas[:, :, c] = np.clip(base_c, 0.0, 255.0)

    neb_small = Image.fromarray(canvas.astype(np.uint8), mode="RGB")
    neb_full = neb_small.resize((width, height), Image.Resampling.BICUBIC)
    return np.asarray(neb_full, dtype=np.float32)


def _add_volumetric_god_rays(
    arr: np.ndarray,
    cx: int,
    cy: int,
    rng: np.random.Generator,
    intensity: float = 0.28,
) -> np.ndarray:
    """Add radial volumetric Auron-Gold & Dark-Blue light shafts emanating from the scene's focal point."""
    h, w, _ = arr.shape
    gh, gw = max(80, h // 4), max(80, w // 4)
    yy, xx = np.mgrid[0:gh, 0:gw].astype(np.float32)
    scx, scy = cx / 4.0, cy / 4.0
    dx = xx - scx
    dy = yy - scy
    angles = np.arctan2(dy, dx)
    dist = np.sqrt(dx * dx + dy * dy) / float(max(gw, gh))

    n_rays = int(rng.integers(5, 13))
    ray_phase = float(rng.uniform(0, 6.28))
    rays = (0.5 + 0.5 * np.sin(angles * n_rays + ray_phase)) ** 4.0
    rays *= (0.5 + 0.5 * np.cos(angles * (n_rays // 2 + 2) - ray_phase * 0.7))
    falloff = np.exp(-dist * float(rng.uniform(2.2, 3.6)))
    beam = (rays * falloff * intensity)[:, :, None]

    beam_rgb = beam * C_GOLD_BRIGHT[None, None, :]
    beam_img = Image.fromarray(np.clip(beam_rgb, 0, 255).astype(np.uint8), mode="RGB").resize(
        (w, h), Image.Resampling.BILINEAR
    )
    return np.clip(arr + np.asarray(beam_img, dtype=np.float32), 0.0, 255.0)


def _draw_starfield_and_bokeh(draw_glow: ImageDraw.ImageDraw, draw_sharp: ImageDraw.ImageDraw, w: int, h: int, rng: np.random.Generator) -> None:
    """Draw multi-depth stars + soft golden/blue bokeh dust orbs."""
    n_stars = int(rng.integers(140, 240))
    for _ in range(n_stars):
        sx = int(rng.integers(0, w))
        sy = int(rng.integers(0, h))
        bright = float(rng.uniform(0.25, 1.0))
        is_gold = rng.random() > 0.45
        col = T_GOLD_BRIGHT if is_gold else (185, 208, 238)
        alpha = int(bright * 210)
        r = 2 if bright > 0.86 else 1
        draw_sharp.ellipse([sx - r, sy - r, sx + r, sy + r], fill=(*col, alpha))

    # Floating cinematic golden bokeh particles
    n_bokeh = int(rng.integers(14, 28))
    for _ in range(n_bokeh):
        bx = int(rng.integers(int(w * 0.05), int(w * 0.95)))
        by = int(rng.integers(int(h * 0.08), int(h * 0.92)))
        br = int(rng.integers(6, max(14, min(w, h) // 26)))
        col = T_GOLD if rng.random() > 0.3 else T_CYAN_STEEL
        alpha = int(rng.integers(18, 56))
        draw_glow.ellipse([bx - br, by - br, bx + br, by + br], fill=(*col, alpha))


def _draw_motif_scene(
    motif: str,
    glow_draw: ImageDraw.ImageDraw,
    crisp_draw: ImageDraw.ImageDraw,
    base_img: Image.Image,
    w: int,
    h: int,
    cx: int,
    cy: int,
    rng: np.random.Generator,
) -> None:
    """Render 1 of 16 rich geometric/3D AuronOrigin scene structures with unique seeded geometry."""
    m = min(w, h)
    rot0 = float(rng.uniform(0.0, 360.0))
    scale_v = float(rng.uniform(0.88, 1.12))

    if motif == "event_horizon":
        # Relativistic Black Hole Accretion Disk & Gravitational Lensing Halo in Gold & Dark Blue
        r_shadow = int(m * 0.14 * scale_v)
        tilt = float(rng.uniform(-22.0, 22.0))
        # Lensed upper & lower photon arches
        for k in range(8, 0, -1):
            rk = int(r_shadow * (1.05 + k * 0.14))
            al = int(190 / (k * 0.65 + 0.5))
            glow_draw.ellipse([cx - rk, cy - rk, cx + rk, cy + rk], outline=(*T_GOLD_BRIGHT, al), width=max(2, 8 - k))
        # Wide perspective accretion disk rings
        disk_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        dd = ImageDraw.Draw(disk_layer)
        for i in range(18):
            rx = int(m * (0.20 + i * 0.016) * scale_v)
            ry = int(rx * float(rng.uniform(0.22, 0.30)))
            col = T_GOLD_BRIGHT if i < 6 else (T_GOLD if i < 13 else T_CYAN_STEEL)
            al = max(25, 220 - i * 11)
            dd.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=(*col, al), width=3 if i < 5 else 2)
        disk_layer = disk_layer.rotate(tilt, center=(cx, cy), resample=Image.Resampling.BICUBIC)
        base_img.alpha_composite(disk_layer)
        # Pitch-black event horizon core + crisp golden photon ring
        crisp_draw.ellipse([cx - r_shadow, cy - r_shadow, cx + r_shadow, cy + r_shadow], fill=(*T_OBSIDIAN, 255), outline=(*T_GOLD_BRIGHT, 245), width=3)

    elif motif == "atomic_clock":
        # Precision Optical Lattice Clock: Intersecting Gyroscopic Gold Rings & Laser Beams
        for l_ang in (rot0, rot0 + 90.0, rot0 + 45.0, rot0 - 45.0):
            rad_a = math.radians(l_ang)
            x1, y1 = cx - int(m * 0.48 * math.cos(rad_a)), cy - int(m * 0.48 * math.sin(rad_a))
            x2, y2 = cx + int(m * 0.48 * math.cos(rad_a)), cy + int(m * 0.48 * math.sin(rad_a))
            glow_draw.line([(x1, y1), (x2, y2)], fill=(*T_GOLD, 95), width=4)
            crisp_draw.line([(x1, y1), (x2, y2)], fill=(*T_GOLD_BRIGHT, 165), width=1)
        for idx_r, frac in enumerate((0.11, 0.19, 0.28, 0.37, 0.43)):
            rr = int(m * frac * scale_v)
            crisp_draw.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(*T_GOLD, 210 - idx_r * 28), width=2)
            ticks = 24 + idx_r * 12
            for t_i in range(ticks):
                a = math.radians(t_i * (360.0 / ticks) + rot0 * (idx_r + 1) * 0.3)
                in_r = rr - (10 if t_i % 4 == 0 else 4)
                crisp_draw.line(
                    [(cx + int(in_r * math.cos(a)), cy + int(in_r * math.sin(a))),
                     (cx + int(rr * math.cos(a)), cy + int(rr * math.sin(a)))],
                    fill=(*T_GOLD_BRIGHT, 190 if t_i % 4 == 0 else 90),
                    width=2 if t_i % 4 == 0 else 1,
                )
        glow_draw.ellipse([cx - 26, cy - 26, cx + 26, cy + 26], fill=(*T_GOLD_BRIGHT, 235))

    elif motif == "temple_monolith":
        # 3D Isometric Obsidian & Dark-Blue Monolith with Glowing Golden Circuit-Glyph Architecture
        mw = int(m * float(rng.uniform(0.20, 0.27)))
        mh = int(m * float(rng.uniform(0.52, 0.64)))
        depth_x = int(mw * float(rng.uniform(0.28, 0.40))) * (1 if rng.random() > 0.5 else -1)
        depth_y = -int( abs(depth_x) * 0.45 )
        top_w = int(mw * 0.84)
        front_pts = [
            (cx - top_w // 2, cy - mh // 2),
            (cx + top_w // 2, cy - mh // 2),
            (cx + mw // 2, cy + mh // 2),
            (cx - mw // 2, cy + mh // 2),
        ]
        if depth_x > 0:
            side_pts = [front_pts[1], (front_pts[1][0] + depth_x, front_pts[1][1] + depth_y),
                        (front_pts[2][0] + depth_x, front_pts[2][1] + depth_y), front_pts[2]]
        else:
            side_pts = [front_pts[0], (front_pts[0][0] + depth_x, front_pts[0][1] + depth_y),
                        (front_pts[3][0] + depth_x, front_pts[3][1] + depth_y), front_pts[3]]
        top_pts = [
            front_pts[0],
            front_pts[1],
            (front_pts[1][0] + depth_x, front_pts[1][1] + depth_y),
            (front_pts[0][0] + depth_x, front_pts[0][1] + depth_y),
        ]
        glow_draw.polygon(front_pts, outline=(*T_GOLD_BRIGHT, 210), width=6)
        crisp_draw.polygon(side_pts, fill=(16, 30, 52, 242), outline=(*T_GOLD, 195), width=2)
        crisp_draw.polygon(top_pts, fill=(26, 46, 76, 242), outline=(*T_GOLD_BRIGHT, 220), width=2)
        crisp_draw.polygon(front_pts, fill=(9, 14, 24, 246), outline=(*T_GOLD_BRIGHT, 245), width=3)
        # Central golden energy spine + geometric circuit branches inside monolith
        crisp_draw.line([(cx, cy - int(mh * 0.42)), (cx, cy + int(mh * 0.42))], fill=(*T_GOLD_BRIGHT, 215), width=2)
        rows = int(rng.integers(7, 11))
        for r_i in range(1, rows):
            yy = cy - mh // 2 + int((mh * r_i) / rows)
            span = int((top_w + (mw - top_w) * (r_i / rows)) * 0.34)
            crisp_draw.line([(cx - span, yy), (cx + span, yy)], fill=(*T_GOLD, 165), width=2)
            for end_x in (cx - span, cx + span):
                crisp_draw.ellipse([end_x - 3, yy - 3, end_x + 3, yy + 3], fill=(*T_GOLD_BRIGHT, 225))
        # Cosmic portal ring behind monolith + perspective horizon lines
        r_halo = int(mh * 0.44)
        crisp_draw.arc([cx - r_halo, cy - r_halo, cx + r_halo, cy + r_halo], start=195, end=345, fill=(*T_GOLD, 150), width=2)
        hy = cy + mh // 2
        for g_i in range(1, 9):
            gy = hy + int((h - hy) * ((g_i / 9.0) ** 1.55))
            crisp_draw.line([(0, gy), (w, gy)], fill=(*T_CYAN_STEEL, 85), width=1)

    elif motif == "dna_biophoton":
        # Luminous Double Helix & Biophoton Light Emissions
        span_h = int(h * 0.68)
        y0 = cy - span_h // 2
        n_steps = 38
        amp_x = int(m * float(rng.uniform(0.14, 0.22)))
        freq_h = float(rng.uniform(2.2, 3.4))
        prev_a: tuple[int, int] | None = None
        prev_b: tuple[int, int] | None = None
        for s_i in range(n_steps + 1):
            frac = s_i / float(n_steps)
            yy = y0 + int(frac * span_h)
            ph = frac * math.pi * freq_h + math.radians(rot0)
            xa = cx + int(amp_x * math.sin(ph))
            xb = cx + int(amp_x * math.sin(ph + math.pi))
            if s_i % 2 == 0:
                crisp_draw.line([(xa, yy), (xb, yy)], fill=(*T_CYAN_STEEL, 150), width=2)
                mid_x = (xa + xb) // 2
                glow_draw.ellipse([mid_x - 4, yy - 4, mid_x + 4, yy + 4], fill=(*T_GOLD_BRIGHT, 190))
            if prev_a and prev_b:
                glow_draw.line([prev_a, (xa, yy)], fill=(*T_GOLD_BRIGHT, 210), width=5)
                glow_draw.line([prev_b, (xb, yy)], fill=(*T_GOLD, 190), width=5)
                crisp_draw.line([prev_a, (xa, yy)], fill=(*T_GOLD_BRIGHT, 245), width=2)
                crisp_draw.line([prev_b, (xb, yy)], fill=(*T_GOLD, 230), width=2)
            prev_a, prev_b = (xa, yy), (xb, yy)

    elif motif == "deep_telescope":
        # 18-Segment Golden Honeycomb Space Mirror (JWST-inspired) + Distant Deep-Field Galaxies
        hex_r = int(m * 0.068 * scale_v)
        dx = int(hex_r * 1.76)
        dy = int(hex_r * 1.52)
        coords = []
        for q in range(-2, 3):
            for r in range(-2, 3):
                if abs(q + r) <= 2 and not (q == 0 and r == 0):
                    px = cx + int(dx * (q + r * 0.5))
                    py = cy + int(dy * r)
                    coords.append((px, py))
        for px, py in coords:
            pts = [
                (px + int(hex_r * 0.92 * math.cos(math.radians(60 * k + 30))),
                 py + int(hex_r * 0.92 * math.sin(math.radians(60 * k + 30))))
                for k in range(6)
            ]
            crisp_draw.polygon(pts, fill=(22, 38, 62, 185), outline=(*T_GOLD_BRIGHT, 235), width=2)
            glow_draw.polygon(pts, outline=(*T_GOLD, 140), width=4)
        # Central secondary mirror diffraction spikes (6-point golden star)
        for sp_k in range(6):
            ang = math.radians(sp_k * 60 + 30)
            r_spike = int(m * 0.44)
            glow_draw.line([(cx, cy), (cx + int(r_spike * math.cos(ang)), cy + int(r_spike * math.sin(ang)))], fill=(*T_GOLD_BRIGHT, 180), width=3)
        glow_draw.ellipse([cx - 18, cy - 18, cx + 18, cy + 18], fill=(*T_GOLD_BRIGHT, 250))

    elif motif in ("astral_labyrinth", "cymatic_resonance"):
        # Sacred Metatron / Cymatic Chladni Standing Wave Mandala
        petals = int(rng.choice([6, 8, 12, 16]))
        max_r = int(m * 0.36 * scale_v)
        pts_ring = []
        for k in range(petals):
            a = math.radians(k * (360.0 / petals) + rot0)
            px = cx + int(max_r * 0.56 * math.cos(a))
            py = cy + int(max_r * 0.56 * math.sin(a))
            pts_ring.append((px, py))
            rr = int(max_r * 0.42)
            crisp_draw.ellipse([px - rr, py - rr, px + rr, py + rr], outline=(*T_GOLD, 125), width=2)
        if motif == "astral_labyrinth":
            for i in range(len(pts_ring)):
                for j in range(i + 1, len(pts_ring)):
                    crisp_draw.line([pts_ring[i], pts_ring[j]], fill=(*T_GOLD_BRIGHT, 85), width=1)
        crisp_draw.ellipse([cx - max_r, cy - max_r, cx + max_r, cy + max_r], outline=(*T_GOLD_BRIGHT, 225), width=3)
        glow_draw.ellipse([cx - max_r, cy - max_r, cx + max_r, cy + max_r], outline=(*T_GOLD, 160), width=6)

    elif motif == "solar_eclipse_crown":
        # Total Cosmic Eclipse with Blazing Auron-Gold Corona Streamers in Dark Blue Sky
        r_moon = int(m * 0.19 * scale_v)
        for ray_i in range(72):
            a = math.radians(ray_i * 5.0 + rot0)
            r_len = r_moon + int(m * float(rng.uniform(0.05, 0.24)))
            x1, y1 = cx + int(r_moon * math.cos(a)), cy + int(r_moon * math.sin(a))
            x2, y2 = cx + int(r_len * math.cos(a)), cy + int(r_len * math.sin(a))
            glow_draw.line([(x1, y1), (x2, y2)], fill=(*T_GOLD_BRIGHT, int(rng.integers(75, 195))), width=3)
        glow_draw.ellipse([cx - r_moon - 10, cy - r_moon - 10, cx + r_moon + 10, cy + r_moon + 10], outline=(*T_GOLD_BRIGHT, 255), width=8)
        crisp_draw.ellipse([cx - r_moon, cy - r_moon, cx + r_moon, cy + r_moon], fill=(*T_OBSIDIAN, 255), outline=(*T_GOLD_BRIGHT, 255), width=3)

    elif motif in ("quantum_lattice", "simulation_horizon"):
        # Dual Top & Bottom 3D Perspective Matrix Horizons + Floating Polyhedral Core
        span_y = int(m * 0.16)
        for sign in (-1, 1):
            hy = cy + sign * span_y
            edge_y = 0 if sign < 0 else h
            for k in range(-12, 13):
                x_in = cx + k * int(m * 0.024)
                x_out = cx + k * int(m * 0.11)
                grid_col = T_CYAN_STEEL if k % 2 else T_GOLD
                crisp_draw.line([(x_in, hy), (x_out, edge_y)], fill=(*grid_col, 95), width=1)
            for r_i in range(1, 9):
                frac = (r_i / 8.0) ** 1.65
                yy = int(hy + (edge_y - hy) * frac)
                crisp_draw.line([(0, yy), (w, yy)], fill=(*T_GOLD, 75), width=1)
        # Floating polyhedron with unique vertex count & rotation
        v_cnt = int(rng.choice([5, 6, 8]))
        pr = int(m * 0.19 * scale_v)
        verts = [
            (cx + int(pr * math.cos(math.radians(rot0 + k * (360.0 / v_cnt)))),
             cy + int(pr * math.sin(math.radians(rot0 + k * (360.0 / v_cnt)))))
            for k in range(v_cnt)
        ]
        verts.append((cx, cy - int(pr * 0.35)))
        verts.append((cx, cy + int(pr * 0.35)))
        for i in range(len(verts)):
            for j in range(i + 1, len(verts)):
                crisp_draw.line([verts[i], verts[j]], fill=(*T_GOLD_BRIGHT, 165), width=2)
        for vx, vy in verts:
            glow_draw.ellipse([vx - 8, vy - 8, vx + 8, vy + 8], fill=(*T_GOLD_BRIGHT, 235))

    elif motif == "pyramid_radar":
        # 3D Isometric Giza Pyramid Complex with Muon/Radar Scan Cones & Constellation Alignment
        pyr_h = int(m * 0.38 * scale_v)
        pyr_w = int(m * 0.52 * scale_v)
        skew = int(pyr_w * float(rng.uniform(-0.14, 0.14)))
        apex = (cx, cy - int(pyr_h * 0.58))
        bl = (cx - pyr_w // 2, cy + int(pyr_h * 0.44))
        br = (cx + pyr_w // 2, cy + int(pyr_h * 0.44))
        bm = (cx + skew, cy + int(pyr_h * 0.58))
        crisp_draw.polygon([apex, bl, bm], fill=(15, 28, 48, 175), outline=(*T_GOLD_BRIGHT, 225), width=2)
        crisp_draw.polygon([apex, bm, br], fill=(10, 18, 34, 205), outline=(*T_GOLD, 210), width=2)
        for i in range(1, 14):
            f = i / 14.0
            lx, ly = int(apex[0] + (bl[0] - apex[0]) * f), int(apex[1] + (bl[1] - apex[1]) * f)
            mx, my = int(apex[0] + (bm[0] - apex[0]) * f), int(apex[1] + (bm[1] - apex[1]) * f)
            rx, ry = int(apex[0] + (br[0] - apex[0]) * f), int(apex[1] + (br[1] - apex[1]) * f)
            crisp_draw.line([(lx, ly), (mx, my), (rx, ry)], fill=(*T_GOLD, 78), width=1)
        # Glowing internal chamber + vertical cosmic alignment beam from apex
        glow_draw.line([(apex[0], 0), apex], fill=(*T_GOLD_BRIGHT, 170), width=4)
        ch_y = cy + int(pyr_h * 0.04)
        glow_draw.rectangle([cx - 26, ch_y - 14, cx + 26, ch_y + 14], fill=(*T_GOLD_BRIGHT, 195))
        crisp_draw.rectangle([cx - 26, ch_y - 14, cx + 26, ch_y + 14], outline=(*T_GOLD_BRIGHT, 255), width=2)

    elif motif in ("neural_cosmos", "synapse_pulse"):
        # Luminous Neural Constellation & Golden Consciousness Wavefronts
        n_nodes = int(rng.integers(32, 48))
        pts = []
        for _ in range(n_nodes):
            ang = float(rng.uniform(0, math.pi * 2.0))
            rad = float(rng.uniform(0.04, 0.38)) * m * scale_v
            pts.append((cx + int(rad * math.cos(ang) * 1.15), cy + int(rad * math.sin(ang) * 0.92)))
        pts.append((cx, cy))
        thresh = m * 0.19
        for i, (x1, y1) in enumerate(pts):
            for x2, y2 in pts[i + 1 :]:
                d = math.hypot(x2 - x1, y2 - y1)
                if d < thresh:
                    al = int(205 * (1.0 - d / thresh))
                    col = T_GOLD_BRIGHT if (i + x2) % 3 != 0 else T_CYAN_STEEL
                    crisp_draw.line([(x1, y1), (x2, y2)], fill=(*col, al), width=2 if al > 120 else 1)
        for k, (nx, ny) in enumerate(pts):
            rr = 7 if k % 6 == 0 else 4
            glow_draw.ellipse([nx - rr - 3, ny - rr - 3, nx + rr + 3, ny + rr + 3], fill=(*T_GOLD_BRIGHT, 165))
            crisp_draw.ellipse([nx - rr, ny - rr, nx + rr, ny + rr], fill=(*T_GOLD_BRIGHT, 245))
        for wave_r in (0.14, 0.25, 0.36):
            wr = int(m * wave_r * scale_v)
            crisp_draw.arc([cx - wr, cy - wr, cx + wr, cy + wr], start=int(rot0), end=int(rot0 + 250), fill=(*T_GOLD, 130), width=2)

    elif motif == "eye_of_horus":
        # Stylized Geometric Cosmic Lens & Iris (without pasting the identical static avatar photo every time!)
        eye_w = int(m * 0.38 * scale_v)
        eye_h = int(m * 0.19 * scale_v)
        # Upper and lower almond arcs via smooth polygon curve
        upper_pts = []
        lower_pts = []
        for i in range(41):
            t_f = (i / 40.0) * 2.0 - 1.0
            px = cx + int(t_f * eye_w)
            py_off = int((1.0 - t_f * t_f) * eye_h)
            upper_pts.append((px, cy - py_off))
            lower_pts.append((px, cy + py_off))
        lens_poly = upper_pts + list(reversed(lower_pts))
        crisp_draw.polygon(lens_poly, fill=(14, 28, 52, 200), outline=(*T_GOLD_BRIGHT, 240), width=3)
        glow_draw.polygon(lens_poly, outline=(*T_GOLD, 180), width=6)
        # Golden iris filaments
        iris_r = int(eye_h * 0.88)
        crisp_draw.ellipse([cx - iris_r, cy - iris_r, cx + iris_r, cy + iris_r], fill=(22, 42, 74, 235), outline=(*T_GOLD_BRIGHT, 245), width=3)
        for k in range(36):
            a = math.radians(k * 10.0 + rot0)
            r_in = int(iris_r * 0.36)
            crisp_draw.line(
                [(cx + int(r_in * math.cos(a)), cy + int(r_in * math.sin(a))),
                 (cx + int((iris_r - 3) * math.cos(a)), cy + int((iris_r - 3) * math.sin(a)))],
                fill=(*T_GOLD, 165),
                width=2 if k % 3 == 0 else 1,
            )
        pupil_r = int(iris_r * 0.34)
        crisp_draw.ellipse([cx - pupil_r, cy - pupil_r, cx + pupil_r, cy + pupil_r], fill=(*T_OBSIDIAN, 255), outline=(*T_GOLD_BRIGHT, 255), width=2)
        # Outer astrolabe ring
        or_r = int(m * 0.42 * scale_v)
        crisp_draw.ellipse([cx - or_r, cy - or_r, cx + or_r, cy + or_r], outline=(*T_GOLD, 110), width=2)

    elif motif == "ouroboros_seal":
        # Luminous Celestial Ring Gate & Interlocking Sacred Geometry
        r_main = int(m * 0.31 * scale_v)
        r_inner = int(r_main * 0.78)
        glow_draw.ellipse([cx - r_main, cy - r_main, cx + r_main, cy + r_main], outline=(*T_GOLD_BRIGHT, 210), width=8)
        crisp_draw.ellipse([cx - r_main, cy - r_main, cx + r_main, cy + r_main], outline=(*T_GOLD_BRIGHT, 245), width=3)
        crisp_draw.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner], outline=(*T_GOLD, 185), width=2)
        n_poly = int(rng.choice([3, 4, 6]))
        for layer_i in range(2):
            pts = [
                (cx + int(r_inner * math.cos(math.radians(rot0 + layer_i * (180.0 / n_poly) + k * (360.0 / n_poly)))),
                 cy + int(r_inner * math.sin(math.radians(rot0 + layer_i * (180.0 / n_poly) + k * (360.0 / n_poly)))))
                for k in range(n_poly)
            ]
            crisp_draw.polygon(pts, outline=(*T_GOLD_BRIGHT, 175), width=2)

    else:
        # 'sacred_archive': Cascading Luminous Gold Glyphs & Dark-Blue Data Pillars
        cols = int(rng.integers(6, 10))
        span_w = int(m * 0.74)
        x0 = cx - span_w // 2
        step_x = span_w // max(1, cols - 1)
        for ci in range(cols):
            xc = x0 + ci * step_x
            top_off = int(rng.integers(int(h * 0.12), int(h * 0.28)))
            bot_off = int(rng.integers(int(h * 0.72), int(h * 0.88)))
            crisp_draw.line([(xc, top_off), (xc, bot_off)], fill=(*T_CYAN_STEEL, 95), width=1)
            glyph_n = int(rng.integers(5, 10))
            for gi in range(glyph_n):
                gy = top_off + int(((gi + 0.5) / glyph_n) * (bot_off - top_off))
                sz = int(rng.integers(7, 13))
                kind = int(rng.integers(0, 4))
                al = int(rng.integers(110, 235))
                if kind == 0:
                    crisp_draw.ellipse([xc - sz, gy - sz, xc + sz, gy + sz], outline=(*T_GOLD_BRIGHT, al), width=2)
                elif kind == 1:
                    crisp_draw.polygon([(xc, gy - sz), (xc + sz, gy), (xc, gy + sz), (xc - sz, gy)], outline=(*T_GOLD, al), width=2)
                elif kind == 2:
                    crisp_draw.polygon([(xc, gy - sz), (xc + sz, gy + sz), (xc - sz, gy + sz)], outline=(*T_GOLD_BRIGHT, al), width=2)
                else:
                    glow_draw.ellipse([xc - 5, gy - 5, xc + 5, gy + 5], fill=(*T_GOLD_BRIGHT, al))


def render_bespoke_auron_artwork(
    *,
    motif: str,
    width: int,
    height: int,
    seed: int,
    prompt_en: str = "",
    scene_image_mode: str = "auto_ai_brand",
) -> Image.Image:
    """Create or load a cached unique AuronOrigin Dark-Blue & Gold scene artwork for `(motif, seed, width, height)`."""
    cache_sub = CACHE_DIR / "scene_art_v3"
    cache_sub.mkdir(parents=True, exist_ok=True)
    sig_raw = f"{motif}|{seed}|{width}x{height}|{scene_image_mode}|{prompt_en[:160]}"
    sig = hashlib.sha1(sig_raw.encode("utf-8")).hexdigest()[:16]
    cache_file = cache_sub / f"art_{sig}.jpg"
    if cache_file.exists() and cache_file.stat().st_size > 2048:
        try:
            return Image.open(cache_file).convert("RGB")
        except Exception:
            pass

    # Step 1: If auto_ai_brand is active and external Flux endpoint is reachable (on Ubuntu), synthesize AI scene art
    if scene_image_mode == "auto_ai_brand" and prompt_en:
        ai_img = _try_fetch_ai_scene_image(prompt_en, width, height, seed=seed)
        if ai_img is not None:
            try:
                ai_img.save(str(cache_file), format="JPEG", quality=92)
            except Exception:
                pass
            return ai_img

    # Step 2: 2x Supersampled Multi-Layer Volumetric Dark-Blue & Gold Cinema Art (silky 4x MSAA anti-aliasing!)
    rng = np.random.default_rng(abs(int(seed)) % (2**31 - 1))
    neb_arr = _domain_warped_nebula(width, height, rng)

    cx = int(width * float(rng.uniform(0.38, 0.62)))
    cy = int(height * float(rng.uniform(0.40, 0.50) if height > width else rng.uniform(0.43, 0.53)))

    neb_arr = _add_volumetric_god_rays(neb_arr, cx, cy, rng, intensity=float(rng.uniform(0.22, 0.38)))
    base_rgba = Image.fromarray(neb_arr.astype(np.uint8), mode="RGB").convert("RGBA")

    # Render geometric & star layers at 2x resolution then LANCZOS-downsample for razor-sharp anti-aliased curves
    ss = 2
    sw, sh = width * ss, height * ss
    scx, scy = cx * ss, cy * ss
    base_ss = base_rgba.resize((sw, sh), Image.Resampling.BILINEAR)

    glow_ss = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    crisp_ss = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_ss)
    crisp_draw = ImageDraw.Draw(crisp_ss)

    _draw_starfield_and_bokeh(glow_draw, crisp_draw, sw, sh, rng)
    _draw_motif_scene(motif, glow_draw, crisp_draw, base_ss, sw, sh, scx, scy, rng)

    base_rgba = base_ss.resize((width, height), Image.Resampling.LANCZOS)
    glow_layer = glow_ss.resize((width, height), Image.Resampling.LANCZOS)
    crisp_layer = crisp_ss.resize((width, height), Image.Resampling.LANCZOS)

    blur_radius = max(8, min(width, height) // 34)
    bloom_rgba = glow_layer.filter(ImageFilter.GaussianBlur(radius=blur_radius))

    composed = Image.alpha_composite(base_rgba, bloom_rgba)
    composed = Image.alpha_composite(composed, crisp_layer)
    rgb_out = composed.convert("RGB")

    bright_pass = ImageEnhance.Brightness(rgb_out).enhance(0.42).filter(ImageFilter.GaussianBlur(radius=blur_radius // 2 + 2))
    rgb_out = ImageChops.screen(rgb_out, bright_pass)

    try:
        rgb_out.save(str(cache_file), format="JPEG", quality=92)
    except Exception:
        pass
    return rgb_out
