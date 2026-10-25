from __future__ import annotations

import random
import re
from typing import Any

from .arena_client import call_arena_router, extract_json_object
from .config import load_history
from .research_engine import clean_german_sentence, detect_pillar, is_pure_german

VISUAL_MOTIFS = [
    "eye_of_horus",          # Holografisches Horus-Auge & Bewusstseins-Linse
    "ouroboros_seal",        # Goldener Ouroboros-Ring & Kosmische Geometrie
    "quantum_lattice",       # Quantengitter & Zeitkristall-Matrix
    "pyramid_radar",         # Pyramiden-Myonenscan & Goldene Vektoren
    "neural_cosmos",         # Neuronales Kosmos-Netz & Synapsen-Gold
    "sacred_archive",        # Tempel-Archiv & Goldene Licht-Glyphen
    "event_horizon",         # Schwarzes Loch & Raumzeit-Krümmung
    "atomic_clock",          # Optischer Atomuhr-Resonator & Laser-Ringe
    "temple_monolith",       # Obsidian-Monolith mit goldenen Geometrie-Adern
    "dna_biophoton",         # Goldene Doppelhelix & Dunkelblaue Biophotonen
    "astral_labyrinth",      # Metatrons Würfel & Astrolabium-Kompass
    "deep_telescope",        # Hexagonaler Weltraumspiegel & Tiefraum-Galaxien
    "synapse_pulse",         # Gehirnwellen-Krone & Goldene Impuls-Ströme
    "cymatic_resonance",     # Kymatische Klanggeometrie & Stehende Wellen
    "simulation_horizon",    # Holografischer Horizont & Matrix-Lichtfäden
    "solar_eclipse_crown",   # Kosmische Korona-Finsternis in Dunkelblau & Gold
]

NARRATIVE_ARCHETYPES = [
    (
        "DAS PARADOXON-EXPERIMENT",
        "Starte direkt mitten in einer verblüffenden Messung oder Beobachtung, die der Alltagserfahrung widerspricht, und löse erst danach Schritt für Schritt den wissenschaftlichen Hintergrund auf.",
    ),
    (
        "DIE ZEITKAPSEL-BRÜCKE",
        "Schlage im ersten Satz einen unerwarteten Bogen zwischen uraltem Menschheitswissen und modernster Hochtechnologie unserer Gegenwart.",
    ),
    (
        "DER MASSSTABS-ZOOM",
        "Beginne bei einem winzigen, kaum sichtbaren Detail – einem Bruchteil einer Sekunde, einem Atom oder einem einzelnen Signal – und zoome bis zur Struktur des gesamten Kosmos auf.",
    ),
    (
        "DIE INDIZIEN-KETTE",
        "Baue das Skript wie eine ruhige wissenschaftliche Spurensuche auf: Drei präzise Einzelbefunde fügen sich am Wendepunkt zu einem größeren Gesamtbild zusammen.",
    ),
    (
        "DER BLINDE FLECK",
        "Zeige souverän auf, was wir im Alltag für völlig selbstverständlich halten – bis aktuelle Forschungsdaten genau diese Gewissheit ins Wanken bringen.",
    ),
    (
        "DAS GEDANKENEXPERIMENT",
        "Versetze den Zuschauer im ersten Satz unmittelbar in eine konkrete Situation und untermauere sie sofort mit realen Messdaten.",
    ),
    (
        "DIE INFORMATIONS-SIGNATUR",
        "Betrachte das Thema konsequent durch die Linse von Information, Geometrie, Frequenz und mathematischer Ordnung.",
    ),
    (
        "DER GRENZGANG DER FORSCHUNG",
        "Starte an exakt der Grenze, an der selbst führende Forscher heute offen zugeben: Unsere bisherigen Modelle reichen hier nicht mehr aus.",
    ),
]

# Common English terms mapped to clean spoken German so TTS stays 100% German
_SPOKEN_GERMAN_REPLACEMENTS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bquantum\s+comput(?:ing|er)\b", re.I), "Quantencomputer"),
    (re.compile(r"\btime\s+crystals?\b", re.I), "Zeitkristalle"),
    (re.compile(r"\bblack\s+holes?\b", re.I), "Schwarze Löcher"),
    (re.compile(r"\bartificial\s+intelligence\b", re.I), "Künstliche Intelligenz"),
    (re.compile(r"\bdelayed[- ]choice\b", re.I), "Verzögerte-Wahl"),
    (re.compile(r"\bquantum\s+eraser\b", re.I), "Quantenradierer"),
    (re.compile(r"\bdouble[- ]slit\b", re.I), "Doppelspalt"),
    (re.compile(r"\bdefault\s+mode\s+network\b", re.I), "Ruhezustandsnetzwerk"),
    (re.compile(r"\bdeep\s+space\b", re.I), "Tiefraum"),
    (re.compile(r"\bancient\b", re.I), "antik"),
    (re.compile(r"\bconsciousness\b", re.I), "Bewusstsein"),
    (re.compile(r"\bresearchers\b", re.I), "Forscher"),
    (re.compile(r"\bscientists\b", re.I), "Wissenschaftler"),
    (re.compile(r"\bevidence\b", re.I), "Beleg"),
    (re.compile(r"\bsimulation\s+hypothesis\b", re.I), "Simulationshypothese"),
    (re.compile(r"\bobserver\s+effect\b", re.I), "Beobachtereffekt"),
    (re.compile(r"\blucid\s+dream(?:ing|s)?\b", re.I), "Klarträumen"),
]


def enforce_german_narration(text: str, fallback_topic: str = "") -> str:
    """Guarantee that spoken narration is 100% clean, natural German without English sentences or markup."""
    if not text:
        return ""
    t = str(text)
    # Strip markdown symbols, citations [1], URLs
    t = re.sub(r"https?://\S+", "", t)
    t = re.sub(r"\[\d+\]", "", t)
    t = re.sub(r"[*_`#<>]+", "", t)
    for pattern, repl in _SPOKEN_GERMAN_REPLACEMENTS:
        t = pattern.sub(repl, t)

    # Split into sentences and reject any stray English sentence
    raw_sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", t) if s.strip()]
    kept: list[str] = []
    for sent in raw_sentences:
        cleaned_s = clean_german_sentence(sent)
        if not cleaned_s:
            continue
        # Short dramatic fragments ('Genau hier kippt das Bild.') may have <18 chars — keep unless English stopwords appear
        if len(cleaned_s) < 22:
            if not re.search(r"\b(the|and|with|from|this|that|study|research)\b", cleaned_s, re.I):
                kept.append(cleaned_s)
        elif is_pure_german(cleaned_s):
            kept.append(cleaned_s)

    result = " ".join(kept).strip()
    if not result:
        short_t = clean_german_sentence(fallback_topic)[:80] or "diesem Phänomen"
        return f"Genau hier zeigen die Messdaten zu {short_t} eine bemerkenswerte Ordnung."
    return result


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


def _recent_hooks() -> list[str]:
    try:
        hist = load_history()
        hooks = [str(h.get("title", "")) for h in hist[:8] if h.get("title")]
        return hooks
    except Exception:
        return []


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
    """Construct anti-repetitive, strictly German AuronOrigin Showrunner prompts."""
    chosen_pillar = pillar or (dossier or {}).get("pillar") or detect_pillar(topic)
    target_n = resolve_target_scene_count(duration_target, scene_count)
    archetype_name, archetype_instr = random.choice(NARRATIVE_ARCHETYPES)
    creative_seed = random.randint(1000, 9999)

    if target_n <= 6:
        scene_count_spec = f"exakt {target_n} Szenen (Gesamt-Sprechtext ca. 120–165 Wörter für ein 50–65 Sekunden YouTube Short)"
    elif target_n <= 8:
        scene_count_spec = f"exakt {target_n} Szenen (Gesamt-Sprechtext ca. 260–360 Wörter für ein 2,5–3,5 Minuten Video)"
    else:
        est_words_min = target_n * 42
        est_words_max = target_n * 58
        scene_count_spec = f"exakt {target_n} Szenen (nummeriert 1 bis {target_n}, Gesamt-Sprechtext ca. {est_words_min}–{est_words_max} Wörter)"

    if editorial_mode == "matrix_narrativ":
        persona_block = (
            "MODUS: 'Auron – Der Code der Matrix' (souveräner Erzähler, ruhig, analytisch-mystisch). "
            "Letzter Satz im Finale: 'Auron out. Die Matrix wackelt. Bleib wach.'"
        )
    else:
        persona_block = (
            "MODUS: 'Fakten zuerst, Mystery als Deutung' (hochwertige deutsche Wissenschafts- & Mystery-Dokumentation). "
            "Zuerst überprüfbare, konkrete Fakten und Zahlen, danach ein eleganter philosophischer Perspektivwechsel."
        )

    de_facts = [f for f in (dossier or {}).get("verified_facts", []) if is_pure_german(str(f))]
    facts_text = "\n".join(f"- {f}" for f in de_facts) or f"- Aktueller Fokus: {topic}"
    discovery_note = (dossier or {}).get("discovery_note") or ""
    recent_list = _recent_hooks()
    avoid_block = (
        "VERMEIDE zwingend Ähnlichkeiten zu diesen letzten Videotiteln:\n" + "\n".join(f"- {h}" for h in recent_list)
        if recent_list
        else ""
    )

    motifs_csv = ", ".join(f"`{m}`" for m in VISUAL_MOTIFS)

    system_prompt = f"""Du bist der Chef-Showrunner und Drehbuchautor des deutschen YouTube-Kanals **AuronOrigin**.

STRENGE SPRACH- UND QUALITÄTSREGELN (UNVERHANDELBAR):
1. **100% REINES DEUTSCH**: Jedes einzelne Wort in `title`, `alt_titles`, `thumbnail_text`, `thumbnail_subtext`, `on_screen_headline`, `on_screen_subline` und ganz besonders im gesprochenen Sprechertext `narration` MUSS makelloses, natürliches Deutsch sein!
   - KEINE englischen Sätze, KEINE englischen Fachzitate, KEINE Denglisch-Floskeln! Übersetze englische Konzepte immer elegant ins Deutsche (z.B. „Zeitkristalle“, „Beobachtereffekt“, „Ereignishorizont“, „Klartraum“).
2. **NULL WIEDERHOLUNG / FRISCHE DRAMATURGIE**:
   - Nutze für dieses Video den Erzähl-Archetyp **{archetype_name}**: {archetype_instr}
   - VERBOTENE Standard-Floskeln: Beginne NIEMALS mit „Halte für drei Sekunden inne“, „Stell dir vor“ oder „Hallo Leute“! Jedes Skript braucht einen einzigartigen, themenspezifischen ersten Satz!
3. **SPRECHTEXT FÜR DEUTSCHE NEURALE STIMME**:
   - Schreibe Zahlen und Abkürzungen im `narration`-Feld sprechfreundlich aus, keine Klammern, keine URLs, keine Hashtags im Sprechtext.
4. **MARKENWELT AURONORIGIN**:
   - Farb- & Bildwelt für jede Szene (`image_prompt_en`): Tiefes Kosmos-Schwarz (#0B0C10), Dunkles Stahlblau (#1F2833), leuchtendes Auron-Gold (#D4AF37) und ein Hauch Violett (#4A235A). Jede Szene bekommt ein eigenes, unverwechselbares Bildmotiv passend zum Szeneninhalt (keine Textbuchstaben im Bildprompt!).
   - {persona_block}

Das Array `"scenes"` MUSS exakt {target_n} Szenen enthalten. Gib NUR valides JSON auf einer sauberen Struktur zurück (keine unescaped Zeilenumbrüche in Strings)."""

    user_prompt = f"""Erstelle ein komplett neues, einzigartiges deutsches YouTube-Videopaket (Kreativ-Seed #{creative_seed}) für **AuronOrigin**:

THEMA / AKTUELLER AUFHÄNGER: {topic}
RECHERCHE-KONTEXT: {discovery_note}
SÄULE: {chosen_pillar}
ERZÄHL-ARCHETYP: {archetype_name}
FORMAT: {video_format}
UMFANG: {scene_count_spec}

DEUTSCHES RECHERCHE-DOSSIER (nutze konkrete Fakten hieraus und formuliere sie eigenständig und lebendig):
{facts_text}

{avoid_block}

Wähle für jede Szene ein passendes, wechselndes `visual_motif` aus:
{motifs_csv}

Wähle `camera_motion` abwechslungsreich aus: `zoom_in`, `zoom_out`, `pan_up`, `drift_right`

Antworte AUSSCHLIESSLICH mit diesem JSON-Schema (exakt {target_n} Szenen, alle Texte außer `image_prompt_en` zu 100% auf Deutsch):
{{
  "title": "Packender deutscher YouTube-Titel (max. 68 Zeichen)",
  "alt_titles": ["Deutscher Alternativtitel 1", "Deutscher Alternativtitel 2", "Deutscher Alternativtitel 3"],
  "thumbnail_text": "2 BIS 3 DEUTSCHE WORTE IN VERSALIEN",
  "thumbnail_subtext": "Kurzer deutscher Untertitel",
  "pillar": "{chosen_pillar}",
  "editorial_mode": "{editorial_mode}",
  "hook_3s": "Der exakte erste gesprochene deutsche Satz",
  "scenes": [
    {{
      "scene_number": 1,
      "phase": "HOOK",
      "fact_badge": "IMPULS",
      "on_screen_headline": "DEUTSCHER CINZEL TITEL",
      "on_screen_subline": "Kurze deutsche Fakten-Unterzeile",
      "narration": "100% deutscher, lebendig geschriebener Sprechertext dieser Szene ohne englische Wörter.",
      "pause_after": 0.85,
      "visual_motif": "quantum_lattice",
      "camera_motion": "zoom_in",
      "glitch_transition": true,
      "image_prompt_en": "Unique cinematic scene artwork for scene 1 in deep dark cosmic blue #1F2833, obsidian #0B0C10 and luminous gold #D4AF37, specific subject matching the scene narration, photorealistic sacred-tech lighting, no text, no letters"
    }}
  ],
  "youtube_seo": {{
    "description": "Ausführliche deutsche YouTube-Videobeschreibung (nutze \\\\n für Absätze) mit Fakten-Einordnung und Hashtags",
    "tags": ["AuronOrigin", "Wissenschaft", "Mystery", "Doku Deutsch"],
    "pinned_comment": "Deutscher angepinnter Kommentar mit konkreter Diskussionsfrage an die Zuschauer",
    "community_poll": {{
      "question": "Deutsche Abstimmungsfrage zum Thema",
      "options": ["Antwort A", "Antwort B", "Antwort C"]
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
    """Guarantee all required fields exist, assign unique visual seeds, and sanitize narration to 100% German."""
    chosen_pillar = raw.get("pillar") or pillar or detect_pillar(topic)
    scenes_in = raw.get("scenes") if isinstance(raw.get("scenes"), list) else []
    normalized_scenes: list[dict[str, Any]] = []

    motions = ["zoom_in", "zoom_out", "pan_up", "drift_right"]
    # Shuffle motif rotation per video so consecutive videos don't use the same motif order
    shuffled_motifs = list(VISUAL_MOTIFS)
    random.shuffle(shuffled_motifs)

    for idx, sc in enumerate(scenes_in):
        if not isinstance(sc, dict):
            continue
        headline = str(sc.get("on_screen_headline") or f"SEQUENZ {idx + 1}").strip().upper()
        raw_narration = str(sc.get("narration") or "").strip()
        narration = enforce_german_narration(raw_narration, fallback_topic=topic) if raw_narration else headline.title()

        motif = str(sc.get("visual_motif") or "").strip()
        if motif not in VISUAL_MOTIFS:
            motif = shuffled_motifs[idx % len(shuffled_motifs)]

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

        # Preserve existing visual_seed if editing, otherwise generate a fresh unique seed per scene!
        existing_seed = sc.get("visual_seed")
        try:
            visual_seed = int(existing_seed) if existing_seed is not None else random.randint(100_000, 99_999_999)
        except (TypeError, ValueError):
            visual_seed = random.randint(100_000, 99_999_999)

        default_prompt = (
            f"Bespoke cinematic artwork for '{headline}', {motif.replace('_', ' ')}, "
            "deep space obsidian #0B0C10, dark cosmic navy blue #1F2833 atmosphere, "
            "luminous metallic gold #D4AF37 filaments and sacred geometry, ultra-detailed 8k, no text, no words"
        )

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
                "visual_seed": visual_seed,
                "camera_motion": motion,
                "glitch_transition": bool(sc.get("glitch_transition", True)),
                "image_prompt_en": str(sc.get("image_prompt_en") or default_prompt),
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
            f"Was aktuelle Daten über {topic[:38]} verraten",
            f"Das ungelöste Muster hinter {topic[:38]} | AuronOrigin",
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
                "Forschung aktuell",
                "Bewusstsein",
                "Alte Kulturen",
                "Quantenphysik",
                "Doku Deutsch",
            ],
            "pinned_comment": str(
                seo_in.get("pinned_comment")
                or (
                    f"[FAKT vs. DEUTUNG] Wie ordnest du „{topic}“ ein? "
                    "Klassischer Zufall der Naturgesetze – oder blicken wir hier auf eine tiefere Ordnung? "
                    "Schreib deine Gedanken in die Kommentare und abonniere AuronOrigin."
                )
            ),
            "community_poll": {
                "question": str(poll_in.get("question") or f"Was steckt für dich hinter „{topic}“?"),
                "options": poll_in.get("options")
                or [
                    "Rein physikalisch erklärbar [FAKT]",
                    "Hinweis auf eine tiefere Informations-Struktur [DEUTUNG]",
                    "Beides greift ineinander – genau das macht es spannend!",
                ],
            },
        },
    }


def _default_description(title: str, topic: str, pillar: str) -> str:
    return (
        f"{title}\n\n"
        f"In dieser Analyse von AuronOrigin beleuchten wir „{topic}“ nach unserem Leitprinzip: "
        f"Zuerst überprüfbare Fakten, danach der Blick auf das größere Mysterium.\n\n"
        f"▸ Themen-Säule: {pillar}\n"
        f"▸ Jetzt abonnieren, um keine neue Entschlüsselung zu verpassen.\n"
        f"▸ Instagram: @the.auronorigin | Kontakt: contact@auronorigin.world\n\n"
        f"#AuronOrigin #{pillar.replace('-', '')} #Wissenschaft #Mystery #Bewusstsein #DokuDeutsch"
    )


def _pad_or_trim_scenes_to_count(
    scenes: list[dict[str, Any]],
    target_n: int,
    topic: str,
    dossier: dict[str, Any] | None,
    pillar: str,
) -> list[dict[str, Any]]:
    """Ensure the generated blueprint matches the exact requested number of scenes (2..30)."""
    if len(scenes) == target_n:
        return scenes
    if len(scenes) > target_n and target_n >= 2:
        trimmed = scenes[: target_n - 1] + [scenes[-1]]
        for i, sc in enumerate(trimmed):
            sc["scene_number"] = i + 1
        return trimmed

    de_facts = [
        enforce_german_narration(f, topic)
        for f in ((dossier or {}).get("verified_facts") or [])
        if is_pure_german(str(f))
    ]
    motions = ["zoom_in", "zoom_out", "pan_up", "drift_right"]
    extra_motifs = [m for m in VISUAL_MOTIFS if m not in ("eye_of_horus",)]
    random.shuffle(extra_motifs)

    expansion_templates = [
        ("PRÄZISIONS-MESSUNG", "STUDIE", "Moderne Messinstrumente machen dabei Strukturen sichtbar, die unseren bloßen Sinnen komplett verborgen bleiben."),
        ("HISTORISCHE BRÜCKE", "KONTEXT", "Überraschend ist vor allem, wie eng uralte Beobachtungen und modernste Datenmodelle hier ineinandergreifen."),
        ("DIE INFORMATIONS-EBENE", "ANALYSE", "Betrachtet man das Phänomen als reinen Informationsfluss, verschwindet der scheinbare Zufall fast vollständig."),
        ("OFFENE GRENZFRAGE", "FORSCHUNG", "Selbst führende Arbeitsgruppen betonen, dass unsere bisherigen Standardmodelle hier erst am Anfang stehen."),
        ("DER BEOBACHTER-FAKTOR", "DEUTUNG", "Immer wieder führt die Spur zurück zur selben Kernfrage: Welche Rolle spielt das messende Bewusstsein selbst?"),
        ("GEOMETRIE DER ORDNUNG", "STRUKTUR", "Hinter scheinbarem Chaos zeigt sich bei genauerer Auflösung eine wiederkehrende mathematische Symmetrie."),
    ]
    random.shuffle(expansion_templates)

    out = list(scenes[:-1]) if scenes else []
    cta_scene = scenes[-1] if scenes else {
        "phase": "OUTRO & CTA",
        "fact_badge": "AURONORIGIN",
        "on_screen_headline": "ABONNIERE AURONORIGIN",
        "on_screen_subline": "Deine Deutung in die Kommentare ↓",
        "narration": "Abonniere AuronOrigin für die nächste Entschlüsselung und schreib deine Sicht in die Kommentare.",
        "pause_after": 0.85,
        "visual_motif": "ouroboros_seal",
        "visual_seed": random.randint(100_000, 99_999_999),
        "camera_motion": "zoom_out",
        "glitch_transition": False,
    }

    pool_idx = 0
    while len(out) + 1 < target_n:
        head, badge, fallback_narr = expansion_templates[pool_idx % len(expansion_templates)]
        fact_idx = min(len(de_facts) - 1, pool_idx + 2)
        narr = de_facts[fact_idx] if (pool_idx + 2) < len(de_facts) else fallback_narr
        seq_num = len(out) + 1
        motif = extra_motifs[pool_idx % len(extra_motifs)]
        out.append(
            {
                "scene_number": seq_num,
                "phase": f"VERTIEFUNG {seq_num}",
                "fact_badge": badge,
                "on_screen_headline": head,
                "on_screen_subline": pillar.upper(),
                "narration": enforce_german_narration(narr, topic),
                "pause_after": 0.9,
                "visual_motif": motif,
                "visual_seed": random.randint(100_000, 99_999_999),
                "camera_motion": motions[seq_num % len(motions)],
                "glitch_transition": True,
                "image_prompt_en": (
                    f"Cinematic {motif.replace('_', ' ')} artwork illustrating {head}, "
                    "deep space obsidian #0B0C10, dark navy blue #1F2833, luminous gold #D4AF37 accents, 8k, no text"
                ),
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
    """Multi-archetype, non-repetitive 100% German composer when running without an API key."""
    target_n = resolve_target_scene_count(duration_target, scene_count)
    kw = ((dossier or {}).get("input_keyword") or topic).strip()
    short_kw = kw if len(kw) <= 38 else kw[:38].rsplit(" ", 1)[0]

    de_facts = [
        enforce_german_narration(f, topic)
        for f in ((dossier or {}).get("verified_facts") or [])
        if is_pure_german(str(f))
    ]
    while len(de_facts) < 4:
        de_facts.append(
            f"Präzisionsmessungen rund um {short_kw} legen gesetzmäßige Muster frei, die weit über bloßen Zufall hinausgehen."
        )

    hooks = [
        f"Ein einziger Blick auf die neuesten Daten zu {short_kw} reicht aus, um ein vertrautes Weltbild ins Wanken zu bringen.",
        f"Jahrzehntelang galt das Thema {short_kw} als weitgehend verstanden – doch aktuelle Messungen erzählen eine völlig andere Geschichte.",
        f"Mitten in den jüngsten Analysen zu {short_kw} taucht eine Signatur auf, die selbst erfahrene Forscher aufhorchen lässt.",
        f"Warum stößt unsere moderne Wissenschaft ausgerechnet bei {short_kw} an eine Grenze, an der Physik wie reiner Code aussieht?",
        f"Es gibt Entdeckungen, die leise in Fachjournalen erscheinen und dennoch alles verändern – genau das geschieht gerade rund um {short_kw}.",
        f"Auf den ersten Blick wirkt {short_kw} wie ein gewöhnliches Forschungsthema. Doch unter der Oberfläche verbirgt sich eine erstaunliche Architektur.",
        f"Wenn unabhängige Messinstrumente bei {short_kw} immer wieder dasselbe Muster zeigen, hört der Zufall auf.",
        f"Was verbindet neueste Hochtechnologie mit einer der ältesten Fragen der Menschheit? Die Spur führt direkt zu {short_kw}.",
    ]
    fact_openers_1 = [
        "Beginnen wir bei den überprüfbaren Fakten.",
        "Schauen wir zuerst auf das, was im Labor und in der Beobachtung eindeutig belegt ist.",
        "Die harten Daten liefern hier den entscheidenden Ausgangspunkt.",
        "Nüchtern betrachtet zeigt sich zunächst ein glasklarer Befund.",
    ]
    fact_openers_2 = [
        "Doch erst der zweite Befund macht die Tragweite sichtbar.",
        "Genau an dieser Stelle greift ein zweites Puzzleteil ineinander.",
        "Noch spannender wird es, wenn man die nächste Messung danebenlegt.",
        "Und das ist kein isolierter Einzelfall.",
    ]
    deutung_lines = [
        f"Wo die reine Messung endet, beginnt die große Frage: Blicken wir bei {short_kw} auf die grundlegende Informationsstruktur unserer Wirklichkeit?",
        f"Vielleicht zeigt uns {short_kw} genau deshalb so präzise Muster, weil Materie, Raum und Bewusstsein derselben mathematischen Grammatik folgen.",
        f"Je schärfer unsere Instrumente werden, desto weniger gleicht das Universum einem blinden Uhrwerk – und desto mehr einem präzise abgestimmten Informationsraum.",
        f"Ob klassische Naturkonstante oder tieferer Bauplan: {short_kw} zwingt uns dazu, die Grenze zwischen Beobachter und Realität neu zu denken.",
    ]
    cta_variants = [
        "Wenn du solche Verbindungen zwischen echter Spitzenforschung und den großen Mysterien liebst, abonniere jetzt AuronOrigin und teile deine Sicht in den Kommentaren.",
        "Zufall der Naturgesetze oder verborgene Architektur? Schreib deine Meinung unten in die Kommentare und abonniere AuronOrigin für die nächste Analyse.",
        "Folge AuronOrigin, um keine neue Entschlüsselung zu verpassen – und verrate uns in den Kommentaren, welches Thema wir als Nächstes untersuchen sollen.",
    ]

    tail_sig = (
        " Auron out. Die Matrix wackelt. Bleib wach."
        if editorial_mode == "matrix_narrativ"
        else " Bleib neugierig – bis zur nächsten Entschlüsselung."
    )

    motifs_pool = [m for m in VISUAL_MOTIFS]
    random.shuffle(motifs_pool)

    words_upper = [
        w.upper()
        for w in re.findall(r"[A-Za-zÄÖÜäöüß0-9]{3,}", short_kw)
        if w.lower() not in {"und", "der", "die", "das", "von", "mit", "für", "über", "was"}
    ]
    short_trigger = " ".join(words_upper[:3])[:28].strip() or "DER REALITÄTS-CODE"

    title_templates = [
        f"{short_kw}: Was aktuelle Forschungsdaten plötzlich enthüllen",
        f"Das ungelöste Muster hinter {short_kw} | AuronOrigin",
        f"{short_kw} neu entschlüsselt – Zufall oder tieferer Code?",
        f"Warum {short_kw} Forscher weltweit neu nachdenken lässt",
    ]

    base_scenes = [
        {
            "scene_number": 1,
            "phase": "HOOK",
            "fact_badge": "AKTUELL",
            "on_screen_headline": short_trigger,
            "on_screen_subline": "Fakten zuerst • Mystery als Deutung",
            "narration": random.choice(hooks),
            "pause_after": 0.85,
            "visual_motif": motifs_pool[0],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "zoom_in",
            "glitch_transition": True,
            "image_prompt_en": f"Dramatic dark cosmic opening artwork about {short_kw}, deep obsidian #0B0C10, dark steel blue #1F2833 nebula, glowing #D4AF37 gold geometry, cinematic 8k, no text",
        },
        {
            "scene_number": 2,
            "phase": "BEFUND 1",
            "fact_badge": "FAKT",
            "on_screen_headline": "BELEGTE MESSDATEN",
            "on_screen_subline": pillar.upper(),
            "narration": f"{random.choice(fact_openers_1)} {de_facts[0]}",
            "pause_after": 0.85,
            "visual_motif": motifs_pool[1],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "pan_up",
            "glitch_transition": True,
            "image_prompt_en": f"Scientific dark futuristic visualization of {de_facts[0][:80]}, dark navy #1F2833 and golden #D4AF37 light rays, obsidian shadows, 8k, no text",
        },
        {
            "scene_number": 3,
            "phase": "BEFUND 2",
            "fact_badge": "FORSCHUNG",
            "on_screen_headline": "ZWEITES INDIZ",
            "on_screen_subline": "Präzision bis ins Detail",
            "narration": f"{random.choice(fact_openers_2)} {de_facts[1]}",
            "pause_after": 0.9,
            "visual_motif": motifs_pool[2],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "zoom_out",
            "glitch_transition": True,
            "image_prompt_en": f"Sacred geometry and high-tech measurement of {short_kw}, deep space blue #1F2833, golden #D4AF37 filaments, subtle mystic violet #4A235A glow, no text",
        },
        {
            "scene_number": 4,
            "phase": "VERTIEFUNG",
            "fact_badge": "ANALYSE",
            "on_screen_headline": "DIE TIEFERE STRUKTUR",
            "on_screen_subline": "Information • Frequenz • Raum",
            "narration": de_facts[2],
            "pause_after": 0.95,
            "visual_motif": motifs_pool[3],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "drift_right",
            "glitch_transition": True,
            "image_prompt_en": f"Macro to cosmic scale visualization for {short_kw}, dark blue cosmic dust #1F2833, shimmering gold #D4AF37 orbital rings, obsidian #0B0C10, 8k, no text",
        },
        {
            "scene_number": 5,
            "phase": "PERSPEKTIVWECHSEL",
            "fact_badge": "DEUTUNG",
            "on_screen_headline": "WO DAS MODELL KIPPT",
            "on_screen_subline": "Wissenschaft trifft Mysterium",
            "narration": random.choice(deutung_lines),
            "pause_after": 1.05,
            "visual_motif": motifs_pool[4],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "zoom_in",
            "glitch_transition": True,
            "image_prompt_en": f"Mystical philosophical perspective on {short_kw}, golden ouroboros horizon in dark cosmic blue #1F2833 and #0B0C10, #D4AF37 volumetric light, no text",
        },
        {
            "scene_number": 6,
            "phase": "FINALE & CTA",
            "fact_badge": "AURONORIGIN",
            "on_screen_headline": "ABONNIERE AURONORIGIN",
            "on_screen_subline": "Deine Sicht in die Kommentare ↓",
            "narration": random.choice(cta_variants) + tail_sig,
            "pause_after": 0.8,
            "visual_motif": motifs_pool[5],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "zoom_out",
            "glitch_transition": False,
            "image_prompt_en": "Monumental golden cosmic portal in deep dark blue space #1F2833 and obsidian #0B0C10, AuronOrigin sacred geometry aesthetic, 8k, no text",
        },
    ]

    scenes = _pad_or_trim_scenes_to_count(base_scenes, target_n, topic, dossier, pillar)

    raw = {
        "title": random.choice(title_templates),
        "thumbnail_text": short_trigger,
        "thumbnail_subtext": "AKTUELLE FAKTEN & MYSTERIUM",
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
    """Generate a complete, non-repetitive 100% German AuronOrigin blueprint via Arena Router."""
    clean_topic = (topic or "").strip()
    if not clean_topic:
        clean_topic = (dossier or {}).get("topic") or "Quantenphysik & das Rätsel der Zeit"

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
            max_tokens=8192,
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
                if len(bp["scenes"]) != target_n:
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
    fallback["arena_warning"] = "Kein Arena API-Key gesetzt – variabler deutscher AuronOrigin-Entwurf erstellt."
    fallback["prompts_for_browser_router"] = {
        "system_prompt": sys_prompt,
        "user_prompt": usr_prompt,
    }
    return fallback
