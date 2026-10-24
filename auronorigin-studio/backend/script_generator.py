from __future__ import annotations

from typing import Any

from .arena_client import call_arena_router, extract_json_object
from .research_engine import detect_pillar

VISUAL_MOTIFS = [
    "eye_of_horus",      # Holographic Eye of Horus / Consciousness Lens
    "ouroboros_seal",    # Sacred Ouroboros Gold Ring & Runes
    "quantum_lattice",   # Optical Clock / Quantum Time-Crystal Matrix Grid
    "pyramid_radar",     # Giza Pyramid SAR / Muon Tomography Wireframe
    "neural_cosmos",     # Brain Thalamus / Synaptic Constellation
    "sacred_archive",    # Ancient Temple Glyphs morphing into Code Streams
]


def resolve_target_scene_count(duration_target: str = "short_60", scene_count: int | None = None) -> int:
    if scene_count is not None:
        try:
            return max(2, min(30, int(scene_count)))
        except (TypeError, ValueError):
            pass
    if duration_target == "short_60":
        return 6
    if duration_target == "mid_180":
        return 8
    return 10


def build_auron_script_prompts(
    *,
    topic: str,
    dossier: dict[str, Any] | None,
    video_format: str = "9:16",
    duration_target: str = "short_60",
    editorial_mode: str = "fakten_mystery",
    pillar: str | None = None,
    scene_count: int | None = None,
) -> tuple[str, str]:
    """Construct the official AuronOrigin Showrunner System & User prompts."""
    chosen_pillar = pillar or (dossier or {}).get("pillar") or detect_pillar(topic)
    target_n = resolve_target_scene_count(duration_target, scene_count)

    if target_n <= 6:
        scene_count_spec = f"exakt {target_n} Szenen (Gesamt-Sprechtext ca. 110–150 Wörter für ein 48–65 Sekunden YouTube Short / Reel)"
    elif target_n <= 8:
        scene_count_spec = f"exakt {target_n} Szenen (Gesamt-Sprechtext ca. 260–350 Wörter für ein 2,5–3,5 Minuten YouTube Video)"
    else:
        est_words_min = target_n * 45
        est_words_max = target_n * 60
        scene_count_spec = f"exakt {target_n} Szenen (nummeriert von 1 bis {target_n}, Gesamt-Sprechtext ca. {est_words_min}–{est_words_max} Wörter)"

    if editorial_mode == "matrix_narrativ":
        persona_block = (
            "MODUS: 'Auron – Der Code der Matrix' (Ich-Erzähler Auron, ruhig, souverän, mystisch-analytisch). "
            "Signatur-Abschluss im letzten Satz: 'Auron out. Die Matrix wackelt. Bleib wach.'"
        )
    else:
        persona_block = (
            "MODUS: 'Fakten zuerst, Mystery als Deutung' (Seriöser High-End-Wissenschafts- & Mystery-Erzähler). "
            "Zuerst harte, staunenswerte Fakten, danach der ruhige Gänsehaut-Perspektivwechsel. "
            "Keine billige Panikmache, keine Verschwörungs-Floskeln ('sie verheimlichen uns'), sondern präzise Eleganz."
        )

    facts_text = "\n".join(f"- {f}" for f in (dossier or {}).get("verified_facts", [])) or f"- Kernthema: {topic}"
    mystery_text = "\n".join(f"- {m}" for m in (dossier or {}).get("mystery_interpretation", [])) or "- Philosophische Deutung an der Grenze von Physik und Bewusstsein."

    system_prompt = f"""Du bist der Chef-Showrunner, Skript-Architekt und YouTube-Retention-Stratege der Marke **AuronOrigin**.
Marken-DNA von AuronOrigin:
- Visuelle & tonale Welt: Dunkler Tiefraum (#0B0C10), Kosmisches Stahlblau (#1F2833), Auron-Gold (#D4AF37), Mystisches Violett (#4A235A).
- Typografie: CINZEL (Versalien für monumentale On-Screen-Titel) & INTER (klare Fakten-Typografie).
- Stimme: Tief, ruhig, getragen (-15% Sprechtempo, leichte Tempel-/Kosmische Raumtiefe). Sätze müssen für Sprachsynthese perfekt rhythmisiert sein – kurze bis mittellange Hauptsätze, gezielte Gedankenpausen, KEINE unaussprechlichen URLs oder Klammer-Codes im `narration`-Text!
- {persona_block}
- YouTube-Retention-Gesetz:
  1. Szene 1 (0–3 Sek.): Sofortiger Pattern-Interrupt / Curiosity-Gap-Hook ohne Begrüßungs-Floskeln ("Hallo Leute" ist streng verboten!).
  2. Mittelteil: Konkrete wissenschaftliche oder historische Fakten (`fact_badge`: `"FAKT"` oder `"STUDIE"` oder `"HISTORISCH"`), die echtes Vertrauen aufbauen.
  3. Wendepunkt: Philosophische Simulations-/Bewusstseins-Deutung (`fact_badge`: `"DEUTUNG"` oder `"GEDANKENEXPERIMENT"`).
  4. Finale Szene: Gänsehaut-Konklusion + eleganter Abonnenten-Trigger ("Wenn du solche Codes zwischen Wissenschaft und Mysterium entschlüsseln willst – abonniere AuronOrigin") + offene Kommentar-Frage für den Algorithmus.

WICHTIG: Das Array `"scenes"` MUSS exakt {target_n} Szenen enthalten!
Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt (kein Text außerhalb des JSON)."""

    user_prompt = f"""Erstelle ein komplettes, produktionsfertiges YouTube-Videopaket für **AuronOrigin**:

THEMA: {topic}
SÄULE: {chosen_pillar}
FORMAT: {video_format} ({'YouTube Short / Vertikal 1080x1920' if video_format == '9:16' else 'YouTube Breitbild 16:9'})
UMFANG: {scene_count_spec}

RECHERCHE-DOSSIER (FAKTEN):
{facts_text}

MYSTERY-DEUTUNG:
{mystery_text}

Erlaubte Werte für `visual_motif` pro Szene (abwechslungsreich wählen):
`eye_of_horus`, `ouroboros_seal`, `quantum_lattice`, `pyramid_radar`, `neural_cosmos`, `sacred_archive`

Erlaubte Werte für `camera_motion`:
`zoom_in`, `zoom_out`, `pan_up`, `drift_right`

Liefere EXAKT dieses JSON-Format mit exakt {target_n} Einträgen in `"scenes"`:
{{
  "title": "Haupttitel des Videos (max. 68 Zeichen, hohe Klickrate, seriös-mystisch)",
  "alt_titles": [
    "Alternativer CTR-Titel 1",
    "Alternativer CTR-Titel 2",
    "Alternativer CTR-Titel 3"
  ],
  "thumbnail_text": "2 BIS 3 WORTE IN VERSALIEN (z.B. 'DER ZEIT-CODE' oder 'DAS 64. FRAGMENT')",
  "thumbnail_subtext": "Kurzer Untertitel max. 4 Worte",
  "pillar": "{chosen_pillar}",
  "editorial_mode": "{editorial_mode}",
  "hook_3s": "Der exakte erste Satz der ersten 3 Sekunden",
  "scenes": [
    {{
      "scene_number": 1,
      "phase": "HOOK",
      "fact_badge": "IMPULS",
      "on_screen_headline": "KURZER CINZEL TITEL (MAX 5 WORTE)",
      "on_screen_subline": "Prägnante Fakt-Zeile oder Kennzahl für das Bild",
      "narration": "Gesprochener deutscher Sprechertext dieser Szene – flüssig, atmosphärisch, ohne Sonderzeichen-Ballast.",
      "pause_after": 0.8,
      "visual_motif": "eye_of_horus",
      "camera_motion": "zoom_in",
      "glitch_transition": true,
      "image_prompt_en": "Dark cinematic sacred-tech visual prompt in #0B0C10 obsidian and #D4AF37 gold..."
    }}
  ],
  "youtube_seo": {{
    "description": "Komplette YouTube-Beschreibung auf Deutsch inkl. Zusammenfassung, Fakten-Hinweis, Kapitelmarken und Hashtags #AuronOrigin #Wissenschaft #Mystery",
    "tags": ["AuronOrigin", "Wissenschaft", "Mystery", "Simulation", "...10-15 relevante deutsche Tags"],
    "pinned_comment": "Angepinnter Kommentar nach dem AuronOrigin [FAKT / DEUTUNG] Schema mit konkreter Frage an die Community",
    "community_poll": {{
      "question": "Community-Tab Abstimmungsfrage zum Video",
      "options": ["Option A (Wissenschaftlich)", "Option B (Tieferer Code)", "Option C (Beides greift ineinander)"]
    }}
  }}
}}"""
    return system_prompt, user_prompt


def normalize_blueprint(
    raw: dict[str, Any],
    *,
    topic: str,
    video_format: str = "9:16",
    editorial_mode: str = "fakten_mystery",
    pillar: str | None = None,
) -> dict[str, Any]:
    """Guarantee all required fields exist across any number of scenes without dropping user scenes."""
    chosen_pillar = raw.get("pillar") or pillar or detect_pillar(topic)
    scenes_in = raw.get("scenes") if isinstance(raw.get("scenes"), list) else []
    normalized_scenes: list[dict[str, Any]] = []

    motions = ["zoom_in", "zoom_out", "pan_up", "drift_right"]

    for idx, sc in enumerate(scenes_in):
        if not isinstance(sc, dict):
            continue
        headline = str(sc.get("on_screen_headline") or f"SEQUENZ {idx + 1}").strip().upper()
        narration = str(sc.get("narration") or "").strip()
        if not narration:
            narration = headline.title()

        motif = str(sc.get("visual_motif") or VISUAL_MOTIFS[idx % len(VISUAL_MOTIFS)]).strip()
        if motif not in VISUAL_MOTIFS:
            motif = VISUAL_MOTIFS[idx % len(VISUAL_MOTIFS)]
        motion = str(sc.get("camera_motion") or motions[idx % len(motions)]).strip()
        if motion not in motions:
            motion = motions[idx % len(motions)]
        pause_val = sc.get("pause_after", 0.85)
        try:
            pause_after = max(0.3, min(2.5, float(pause_val)))
        except (TypeError, ValueError):
            pause_after = 0.85

        subline = str(sc.get("on_screen_subline") or "").strip()
        badge = str(sc.get("fact_badge") or ("FAKT" if idx in (1, 2, 3) else "DEUTUNG")).strip().upper()

        normalized_scenes.append(
            {
                "scene_number": idx + 1,
                "phase": str(sc.get("phase") or ("HOOK" if idx == 0 else "ANALYSE")).upper(),
                "fact_badge": badge,
                "on_screen_headline": headline[:60],
                "on_screen_subline": subline[:110],
                "narration": narration,
                "pause_after": pause_after,
                "visual_motif": motif,
                "camera_motion": motion,
                "glitch_transition": bool(sc.get("glitch_transition", True)),
                "image_prompt_en": str(
                    sc.get("image_prompt_en")
                    or f"Dark sacred geometry {motif}, obsidian #0B0C10 background, subtle #D4AF37 gold light, cinematic 8k"
                ),
                "custom_image_id": str(sc.get("custom_image_id") or "").strip(),
                "custom_image_name": str(sc.get("custom_image_name") or "").strip(),
            }
        )

    title = str(raw.get("title") or f"{topic[:52]} – Fakten & Mysterium | AuronOrigin").strip()
    thumb_text = str(raw.get("thumbnail_text") or "DER VERBORGENE CODE").strip().upper()
    thumb_sub = str(raw.get("thumbnail_subtext") or chosen_pillar.upper()).strip()

    seo_in = raw.get("youtube_seo") if isinstance(raw.get("youtube_seo"), dict) else {}
    poll_in = seo_in.get("community_poll") if isinstance(seo_in.get("community_poll"), dict) else {}

    return {
        "title": title,
        "alt_titles": raw.get("alt_titles")
        or [
            f"{topic[:46]}: Zufall oder verborgene Ordnung?",
            f"Was Forscher über {topic[:40]} wirklich fanden",
            f"Das Rätsel hinter {topic[:42]} | AuronOrigin",
        ],
        "thumbnail_text": thumb_text[:34],
        "thumbnail_subtext": thumb_sub[:44],
        "pillar": chosen_pillar,
        "video_format": video_format,
        "editorial_mode": editorial_mode,
        "hook_3s": str(raw.get("hook_3s") or (normalized_scenes[0]["narration"] if normalized_scenes else "")),
        "scenes": normalized_scenes,
        "youtube_seo": {
            "description": str(seo_in.get("description") or _default_description(title, topic, chosen_pillar)),
            "tags": seo_in.get("tags")
            or [
                "AuronOrigin",
                chosen_pillar,
                "Wissenschaft und Mystery",
                "Simulationshypothese",
                "Bewusstsein",
                "Alte Kulturen",
                "Quantenphysik",
                "Doku Deutsch",
            ],
            "pinned_comment": str(
                seo_in.get("pinned_comment")
                or (
                    f"[FAKT vs. DEUTUNG] Was denkst du über '{topic}'? "
                    "Reiner Zufall der Naturgesetze – oder blicken wir hier auf eine tiefere Struktur? "
                    "Schreib deine Sicht in die Kommentare & abonniere AuronOrigin für die nächste Analyse."
                )
            ),
            "community_poll": {
                "question": str(poll_in.get("question") or f"Wie ordnest du '{topic}' ein?"),
                "options": poll_in.get("options")
                or [
                    "100% klassisch erklärbar [FAKT]",
                    "Hinweis auf tiefere Informations-Ordnung [DEUTUNG]",
                    "Genau die Schnittstelle fasziniert mich – mehr davon!",
                ],
            },
        },
    }


def _default_description(title: str, topic: str, pillar: str) -> str:
    return (
        f"{title}\n\n"
        f"In dieser Episode von AuronOrigin untersuchen wir '{topic}' nach unserem Grundsatz: "
        f"Fakten zuerst, Mystery als Deutung.\n\n"
        f"▸ Säule: {pillar}\n"
        f"▸ Kanal abonnieren & Glocke aktivieren, um keine Entschlüsselung zu verpassen.\n"
        f"▸ Instagram: @the.auronorigin | Kontakt: contact@auronorigin.world\n\n"
        f"#AuronOrigin #{pillar.replace('-', '')} #Wissenschaft #Mystery #Bewusstsein #Doku"
    )


def _pad_or_trim_scenes_to_count(
    scenes: list[dict[str, Any]],
    target_n: int,
    topic: str,
    dossier: dict[str, Any] | None,
    pillar: str,
) -> list[dict[str, Any]]:
    """Ensure the generated blueprint matches the requested number of scenes (e.g., 10 scenes)."""
    if len(scenes) == target_n:
        return scenes
    if len(scenes) > target_n and target_n >= 2:
        # Keep Hook (first) and CTA (last), trim middle
        trimmed = scenes[: target_n - 1] + [scenes[-1]]
        for i, sc in enumerate(trimmed):
            sc["scene_number"] = i + 1
        return trimmed

    facts = (dossier or {}).get("verified_facts") or []
    mysteries = (dossier or {}).get("mystery_interpretation") or []
    motions = ["zoom_in", "zoom_out", "pan_up", "drift_right"]

    expansion_pool = [
        (
            "HISTORISCHE PARALLELE",
            "KONTEXT",
            f"Betrachtet man die überlieferten Strukturen rund um {topic}, zeigt sich über Epochen hinweg dieselbe präzise Geometrie.",
            "sacred_archive",
        ),
        (
            "MESSBARE SIGNATUR",
            "STUDIE",
            (facts[3].split(" (")[0] if len(facts) > 3 else f"Moderne Messverfahren legen bei {topic} Muster frei, die mit bloßem Auge unsichtbar bleiben."),
            "quantum_lattice",
        ),
        (
            "DIE SCHNITTSTELLE",
            "ANALYSE",
            "Genau an diesem Punkt berühren sich objektive Messung, Informationstheorie und die Frage nach dem Beobachter.",
            "neural_cosmos",
        ),
        (
            "DAS TIEFERE MUSTER",
            "DEUTUNG",
            (mysteries[1] if len(mysteries) > 1 else f"Vielleicht ist {topic} kein isoliertes Rätsel, sondern Teil einer größeren Informations-Architektur."),
            "ouroboros_seal",
        ),
        (
            "OFFENE FRAGE",
            "IMPULS",
            "Je mehr Daten wir sammeln, desto deutlicher wird: Unsere bisherigen Modelle beschreiben nur die Oberfläche.",
            "pyramid_radar",
        ),
    ]

    out = list(scenes[:-1]) if scenes else []
    cta_scene = scenes[-1] if scenes else {
        "phase": "OUTRO & CTA",
        "fact_badge": "AURONORIGIN",
        "on_screen_headline": "ABONNIERE AURONORIGIN",
        "on_screen_subline": "Deine Sicht in die Kommentare ↓",
        "narration": "Abonniere jetzt AuronOrigin und schreib deine Deutung in die Kommentare.",
        "pause_after": 0.85,
        "visual_motif": "eye_of_horus",
        "camera_motion": "zoom_out",
        "glitch_transition": False,
    }

    pool_idx = 0
    while len(out) + 1 < target_n:
        head, badge, narr, motif = expansion_pool[pool_idx % len(expansion_pool)]
        seq_num = len(out) + 1
        out.append(
            {
                "scene_number": seq_num,
                "phase": f"VERTIEFUNG {seq_num}",
                "fact_badge": badge,
                "on_screen_headline": head if pool_idx < len(expansion_pool) else f"{head} {seq_num}",
                "on_screen_subline": pillar.upper(),
                "narration": narr,
                "pause_after": 0.9,
                "visual_motif": VISUAL_MOTIFS[(seq_num + 1) % len(VISUAL_MOTIFS)] if pool_idx >= len(expansion_pool) else motif,
                "camera_motion": motions[seq_num % len(motions)],
                "glitch_transition": True,
                "custom_image_id": "",
                "custom_image_name": "",
            }
        )
        pool_idx += 1

    out.append(cta_scene)
    for i, sc in enumerate(out):
        sc["scene_number"] = i + 1
    return out


def _build_local_auron_blueprint(
    *,
    topic: str,
    dossier: dict[str, Any] | None,
    video_format: str,
    duration_target: str,
    editorial_mode: str,
    pillar: str,
    scene_count: int | None = None,
) -> dict[str, Any]:
    """High-craft deterministic AuronOrigin script builder matching the exact requested scene count."""
    target_n = resolve_target_scene_count(duration_target, scene_count)

    facts = (dossier or {}).get("verified_facts") or [
        f"Messbare Befunde rund um {topic} zeigen präzise Muster, die selbst Fachleute überraschen.",
        "Unabhängige Analysen dokumentieren dabei Zusammenhänge zwischen Struktur, Energie und Information.",
    ]
    mysteries = (dossier or {}).get("mystery_interpretation") or [
        "Wo die klassische Messung endet, beginnt die entscheidende Frage nach dem Bauplan unserer Realität.",
    ]

    f1 = facts[0].split(" (")[0]
    f2 = (facts[1] if len(facts) > 1 else facts[0]).split(" (")[0]
    f3 = (facts[2] if len(facts) > 2 else f2).split(" (")[0]
    m1 = mysteries[0]

    closing_line = (
        "Wenn du genau solche Codes zwischen harter Forschung und tiefem Mysterium entschlüsseln willst, "
        "abonniere jetzt AuronOrigin und schreib deine Deutung in die Kommentare. "
        + ("Auron out. Die Matrix wackelt. Bleib wach." if editorial_mode == "matrix_narrativ" else "Bleib wachsam – wir sehen uns in der nächsten Analyse.")
    )

    words_upper = [w.upper() for w in topic.replace(":", " ").replace("&", " ").replace("-", " ").split() if len(w) >= 3]
    short_trigger = " ".join(words_upper[:4])[:28].strip() if len(words_upper) >= 2 else "DER REALITÄTS-CODE"

    base_scenes = [
        {
            "scene_number": 1,
            "phase": "HOOK",
            "fact_badge": "IMPULS",
            "on_screen_headline": short_trigger[:28],
            "on_screen_subline": "Fakten zuerst • Mystery als Deutung",
            "narration": (
                f"Halte für drei Sekunden inne. Was wäre, wenn {topic} kein bloßer Zufall ist, "
                "sondern ein direkter Blick hinter die Kulissen unserer Realität?"
            ),
            "pause_after": 0.9,
            "visual_motif": "eye_of_horus",
            "camera_motion": "zoom_in",
            "glitch_transition": True,
        },
        {
            "scene_number": 2,
            "phase": "FAKT 1",
            "fact_badge": "FAKT",
            "on_screen_headline": "BELEGTER BEFUND",
            "on_screen_subline": pillar.upper(),
            "narration": f"Schauen wir zuerst nüchtern auf die belegten Daten. {f1}",
            "pause_after": 0.85,
            "visual_motif": "quantum_lattice" if pillar == "Simulations-News" else ("pyramid_radar" if pillar == "Alte Codes" else "neural_cosmos"),
            "camera_motion": "pan_up",
            "glitch_transition": True,
        },
        {
            "scene_number": 3,
            "phase": "FAKT 2",
            "fact_badge": "FORSCHUNG",
            "on_screen_headline": "DIE ZWEITE EBENE",
            "on_screen_subline": "Präzise Struktur statt Zufall",
            "narration": f"Doch genau hier wird es außergewöhnlich. {f2}",
            "pause_after": 0.9,
            "visual_motif": "sacred_archive",
            "camera_motion": "zoom_out",
            "glitch_transition": True,
        },
        {
            "scene_number": 4,
            "phase": "VERTIEFUNG",
            "fact_badge": "ANALYSE",
            "on_screen_headline": "DAS MUSTER DAHINTER",
            "on_screen_subline": "Information • Geometrie • Resonanz",
            "narration": (
                f"{f3} Je genauer unsere Instrumente messen, desto klarer tritt eine mathematische Ordnung hervor."
            ),
            "pause_after": 1.0,
            "visual_motif": "pyramid_radar" if pillar != "Bewusstseins-Hacks" else "neural_cosmos",
            "camera_motion": "drift_right",
            "glitch_transition": True,
        },
        {
            "scene_number": 5,
            "phase": "MYSTERY-DEUTUNG",
            "fact_badge": "DEUTUNG",
            "on_screen_headline": "PERSPEKTIVWECHSEL",
            "on_screen_subline": "Wo Messung auf Philosophie trifft",
            "narration": f"Und hier beginnt die eigentliche Deutung: {m1}",
            "pause_after": 1.1,
            "visual_motif": "ouroboros_seal",
            "camera_motion": "zoom_in",
            "glitch_transition": True,
        },
        {
            "scene_number": 6,
            "phase": "OUTRO & CTA",
            "fact_badge": "AURONORIGIN",
            "on_screen_headline": "ABONNIERE AURONORIGIN",
            "on_screen_subline": "Deine Sicht in die Kommentare ↓",
            "narration": closing_line,
            "pause_after": 0.8,
            "visual_motif": "eye_of_horus",
            "camera_motion": "zoom_out",
            "glitch_transition": False,
        },
    ]

    scenes = _pad_or_trim_scenes_to_count(base_scenes, target_n, topic, dossier, pillar)

    short_topic = topic if len(topic) <= 56 else topic[:56].rsplit(" ", 1)[0]
    raw = {
        "title": f"{short_topic} – Zufall oder Code? | AuronOrigin",
        "thumbnail_text": short_trigger[:28],
        "thumbnail_subtext": "FAKTEN & MYSTERIUM",
        "pillar": pillar,
        "scenes": scenes,
    }
    return normalize_blueprint(
        raw,
        topic=topic,
        video_format=video_format,
        editorial_mode=editorial_mode,
        pillar=pillar,
    )


def generate_video_blueprint(
    *,
    topic: str,
    dossier: dict[str, Any] | None = None,
    video_format: str = "9:16",
    duration_target: str = "short_60",
    editorial_mode: str = "fakten_mystery",
    pillar: str | None = None,
    scene_count: int | None = None,
    arena_settings: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Generate a complete AuronOrigin script & visual scene blueprint via Arena Router."""
    clean_topic = (topic or "").strip()
    if not clean_topic:
        raise ValueError("Bitte gib ein Thema ein.")

    chosen_pillar = pillar or (dossier or {}).get("pillar") or detect_pillar(clean_topic)
    target_n = resolve_target_scene_count(duration_target, scene_count)
    sys_prompt, usr_prompt = build_auron_script_prompts(
        topic=clean_topic,
        dossier=dossier,
        video_format=video_format,
        duration_target=duration_target,
        editorial_mode=editorial_mode,
        pillar=chosen_pillar,
        scene_count=target_n,
    )

    cfg = arena_settings or {}
    api_key = (cfg.get("arena_api_key") or "").strip()

    if api_key:
        router_res = call_arena_router(
            api_key=api_key,
            system_prompt=sys_prompt,
            user_prompt=usr_prompt,
            gateway_url=cfg.get("arena_gateway_url", "https://api.preview.arena.ai"),
            model=cfg.get("arena_model", "coding-router-preview"),
            protocol=cfg.get("arena_protocol", "auto"),
            max_tokens=8192 if target_n > 8 else 4096,
        )
        if router_res.get("ok"):
            parsed = extract_json_object(router_res.get("text", ""))
            if parsed and isinstance(parsed.get("scenes"), list) and len(parsed["scenes"]) >= 2:
                bp = normalize_blueprint(
                    parsed,
                    topic=clean_topic,
                    video_format=video_format,
                    editorial_mode=editorial_mode,
                    pillar=chosen_pillar,
                )
                if len(bp["scenes"]) < target_n:
                    bp["scenes"] = _pad_or_trim_scenes_to_count(
                        bp["scenes"], target_n, clean_topic, dossier, chosen_pillar
                    )
                bp["arena_router_used"] = True
                bp["arena_model_used"] = router_res.get("routed_model")
                bp["arena_gateway_used"] = router_res.get("gateway")
                bp["arena_usage"] = router_res.get("usage")
                bp["cumulative_usage"] = router_res.get("cumulative_usage")
                return bp

        fallback = _build_local_auron_blueprint(
            topic=clean_topic,
            dossier=dossier,
            video_format=video_format,
            duration_target=duration_target,
            editorial_mode=editorial_mode,
            pillar=chosen_pillar,
            scene_count=target_n,
        )
        fallback["arena_router_used"] = False
        fallback["arena_warning"] = router_res.get("error")
        fallback["sandbox_network_restricted"] = bool(router_res.get("sandbox_network_restricted"))
        fallback["prompts_for_browser_router"] = {
            "system_prompt": sys_prompt,
            "user_prompt": usr_prompt,
        }
        return fallback

    fallback = _build_local_auron_blueprint(
        topic=clean_topic,
        dossier=dossier,
        video_format=video_format,
        duration_target=duration_target,
        editorial_mode=editorial_mode,
        pillar=chosen_pillar,
        scene_count=target_n,
    )
    fallback["arena_router_used"] = False
    fallback["arena_warning"] = "Kein Arena API-Key gesetzt – lokaler AuronOrigin Studio-Entwurf erstellt."
    fallback["prompts_for_browser_router"] = {
        "system_prompt": sys_prompt,
        "user_prompt": usr_prompt,
    }
    return fallback
