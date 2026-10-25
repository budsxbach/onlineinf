"""Single-Topic Cohesive German Script & Storyboard Generator for AuronOrigin.

Editorial Mandate:
- ONE SINGLE TOPIC PER VIDEO: Never read multiple news items or jump between topics.
- 100% TITLE <-> RESEARCH <-> SCRIPT ALIGNMENT: The script explains and narrates the exact
  single topic researched beforehand and promised in the video title.
- SHORT, LOGICAL & UNIVERSALLY UNDERSTANDABLE: Crisp sentences, vivid everyday comparisons,
  zero dry jargon, and a seamless logical thread from the first sentence to the final question.
"""
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

# Single-Topic Storytelling Styles — every style keeps 100% focus on ONE topic and plain-German clarity
STORYTELLING_STYLES = [
    (
        "KLARE ENTSCHLÜSSELUNG",
        "Steige direkt beim spannenden Kern dieses einen Phänomens ein und erkläre es Schritt für Schritt so klar und bildhaft, dass jeder Zuschauer sofort versteht, wie es funktioniert.",
    ),
    (
        "DAS GREIFBARE ALLTAGSBILD",
        "Hole den Zuhörer mit einem einfachen, sofort vorstellbaren Vergleich aus dem Alltag ab und führe ihn ruhig und logisch zum erstaunlichen Kern dieses einen Themas.",
    ),
    (
        "DIE RUHIGE ERZÄHLUNG",
        "Erzähle das Thema wie eine kurze, fesselnde Geschichte aus einem Guss: Was wurde entdeckt, was passiert dabei genau, und warum bringt es uns zum Staunen?",
    ),
    (
        "DIE EINE KERNFRAGE",
        "Stelle genau die zentrale Frage aus dem Titel in den Mittelpunkt und beantworte sie konzentriert, logisch aufeinander aufbauend und ohne jeden Umweg.",
    ),
    (
        "VOM EINFACHEN ZUM TIEFGRÜNDIGEN",
        "Beginne mit der einfachsten Grundtatsache dieses Themas und zeige in klaren logischen Schritten, welche große Bedeutung sich dahinter verbirgt.",
    ),
    (
        "DER BLICK HINTER DEN VORHANG",
        "Zeige zuerst, was wir im Alltag für selbstverständlich halten, und erkläre dann ruhig und allgemeinverständlich, was dieses eine Thema daran verändert.",
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
    """Guarantee that spoken narration is 100% clean, natural German without news-ticker prefixes or English."""
    if not text:
        return ""
    t = str(text)
    t = re.sub(r"https?://\S+", "", t)
    t = re.sub(r"\[\d+\]", "", t)
    t = re.sub(r"[*_`#<>]+", "", t)
    t = re.sub(r"^(?:Aktuelle\s+Meldung|Eilmeldung|News|Bericht)\s*(?:\([^)]*\))?\s*:\s*", "", t.strip(), flags=re.I)
    for pattern, repl in _SPOKEN_GERMAN_REPLACEMENTS:
        t = pattern.sub(repl, t)

    raw_sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", t) if s.strip()]
    kept: list[str] = []
    for sent in raw_sentences:
        cleaned_s = clean_german_sentence(sent)
        if not cleaned_s:
            continue
        if len(cleaned_s) < 22:
            if not re.search(r"\b(the|and|with|from|this|that|study|research)\b", cleaned_s, re.I):
                kept.append(cleaned_s)
        elif is_pure_german(cleaned_s):
            kept.append(cleaned_s)

    result = " ".join(kept).strip()
    if not result:
        short_t = clean_german_sentence(fallback_topic)[:70] or "diesem Thema"
        return f"Genau hier zeigt sich bei {short_t} ein erstaunlich klarer Zusammenhang."
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
        return [str(h.get("title", "")) for h in hist[:8] if h.get("title")]
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
    """Construct single-topic, logical, plain-German storytelling prompts for Arena Router."""
    chosen_pillar = pillar or (dossier or {}).get("pillar") or detect_pillar(topic)
    target_n = resolve_target_scene_count(duration_target, scene_count)
    style_name, style_instr = random.choice(STORYTELLING_STYLES)
    creative_seed = random.randint(1000, 9999)

    core_subject = str((dossier or {}).get("core_subject") or topic).strip()
    researched_title = str((dossier or {}).get("topic") or topic).strip()

    if target_n <= 6:
        words_min = target_n * 15
        words_max = target_n * 21
        scene_count_spec = (
            f"exakt {target_n} Szenen (knackig & intensiv: nur ca. 15–21 Wörter pro Szene, "
            f"insgesamt ca. {words_min}–{words_max} Wörter für ein kurzes 45–58 Sek. Video)"
        )
    elif target_n <= 8:
        scene_count_spec = (
            f"exakt {target_n} Szenen (ca. 22–28 Wörter pro Szene, insgesamt ca. 175–225 Wörter, "
            "intensiv bei diesem EINEN Thema bleibend)"
        )
    else:
        est_words_min = target_n * 22
        est_words_max = target_n * 30
        scene_count_spec = (
            f"exakt {target_n} Szenen (nummeriert 1 bis {target_n}, ca. 22–30 Wörter pro Szene, "
            f"insgesamt ca. {est_words_min}–{est_words_max} Wörter – vertiefe ausschließlich dieses EINE Thema Schritt für Schritt)"
        )

    if editorial_mode == "matrix_narrativ":
        persona_block = (
            "MODUS: 'Auron – Der Code der Matrix' (ruhiger, weiser, tiefgründiger Erzähler). "
            "Letzter Satz im Finale: 'Auron out. Die Matrix wackelt. Bleib wach.'"
        )
    else:
        persona_block = (
            "MODUS: 'Fakten zuerst, Mystery als Deutung' (ruhige, fesselnde Erzählung eines weisen Erzählers: "
            "zuerst das Phänomen klar und einfach erklären, danach ein ruhiger, staunender Gedanke zur tieferen Bedeutung)."
        )

    story_steps = (dossier or {}).get("story_steps") or {}
    steps_block = ""
    if isinstance(story_steps, dict) and story_steps:
        steps_lines = [
            f"- Kern-Einstieg: {story_steps.get('hook', '')}",
            f"- Worum es konkret geht: {story_steps.get('what_is_it', '')}",
            f"- Wie es einfach erklärt funktioniert: {story_steps.get('how_it_works', '')}",
            f"- Warum genau das erstaunlich ist: {story_steps.get('why_astonishing', '')}",
            f"- Tiefere Bedeutung: {story_steps.get('deeper_meaning', '')}",
        ]
        steps_block = "ROTER FADEN ZU DIESEM EINEN THEMA:\n" + "\n".join(s for s in steps_lines if len(s) > 25)

    de_facts = [f for f in (dossier or {}).get("verified_facts", []) if is_pure_german(str(f))]
    facts_text = "\n".join(f"- {f}" for f in de_facts[:5]) or f"- Kernthema: {core_subject}"
    recent_list = _recent_hooks()
    avoid_block = (
        "VERMEIDE Ähnlichkeiten zu diesen letzten Videotiteln:\n" + "\n".join(f"- {h}" for h in recent_list)
        if recent_list
        else ""
    )

    motifs_csv = ", ".join(f"`{m}`" for m in VISUAL_MOTIFS)

    system_prompt = f"""Du bist der Chef-Autor des deutschen Kanals **AuronOrigin**. Gesprochen wird dein Skript von einer **tiefen, ruhigen, alten, weisen Männerstimme**.

UNVERHANDELBARE HAUPTREGELN FÜR DAS SKRIPT:
1. **STRENG NUR EIN EINZIGES THEMA (KEIN NEWS-VORLESEN!)**:
   - Behandle im gesamten Skript **ausschließlich ein einziges Thema**: **{core_subject}** (passend zum recherchierten Fokus „{researched_title}“).
   - **ABSOLUTES VERBOT**: Lies NIEMALS mehrere News-Meldungen vor! Mische NIEMALS mehrere verschiedene Themen, Studien oder Nebenschauplätze! Keine Sätze wie „Aktuelle Meldung“, „Eine andere Studie zeigt“, „Außerdem haben Forscher…“ oder „Kommen wir zum nächsten Punkt“.
2. **TITEL & SKRIPT MÜSSEN ZU 100 % ZUSAMMENPASSEN**:
   - Der Videotitel (`title`) benennt glasklar genau dieses eine Thema – und jede einzelne Szene von Szene 1 bis Szene {target_n} beschreibt und erzählt **exakt dieses Thema**, das der Titel verspricht.
3. **KURZ, LOGISCH & ALLGEMEINVERSTÄNDLICH ERZÄHLEN**:
   - Schreibe **kurz, ruhig und auf den Punkt** (1 bis 2 klare Sätze pro Szene). Kein Abschweifen, kein Fülltext!
   - **Allgemeinverständlich für jeden**: Erkläre das Thema so anschaulich, logisch und lebensnah, dass wirklich jeder Zuschauer – auch komplett ohne Fachwissen – sofort versteht, worum es geht und wie es zusammenhängt. Wenn ein Fachbegriff vorkommt, erkläre ihn sofort mit einem einfachen Alltagsbild.
   - **Logischer roter Faden aus einem Guss**: Jede Szene knüpft direkt und logisch an den Gedanken der vorherigen Szene an (z.B. mit natürlichen Übergängen wie „Denn dahinter steckt etwas Einfaches:“, „Genau hier wird es erstaunlich:“, „Und das bedeutet:“):
     • Szene 1: Packender, klarer Einstieg mitten ins Thema (passend zum Titel).
     • Szene 2: Einfach und verständlich erklären, worum es dabei konkret geht.
     • Szene 3: Logisch weiterführen – wie funktioniert das genau bzw. was wurde beobachtet?
     • Szene 4: Der Knackpunkt – warum ist genau das so verblüffend?
     • Vorletzte Szene: Ruhige, tiefgründige AuronOrigin-Einordnung genau dieses einen Themas.
     • Letzte Szene: Kurzer Schlussgedanke zum selben Thema + eine einfache Frage an die Zuschauer & Abo-Hinweis.
4. **100 % NATÜRLICHES DEUTSCH**:
   - Keine englischen Wörter oder Sätze im Sprechtext `narration`, keine Zahlenkolonnen, keine Abkürzungen, keine Floskeln wie „Hallo Leute“ oder „Stell dir vor“.
   - Erzählstil für dieses Video: **{style_name}** – {style_instr}
   - {persona_block}
5. **MARKENWELT AURONORIGIN**:
   - Jede Szene erhält einen englischen Bildprompt (`image_prompt_en`) exakt passend zum jeweiligen Satz dieses Themas in Tiefschwarz (#0B0C10), Dunkelblau (#1F2833) und Gold (#D4AF37), ohne Textbuchstaben im Bild.

Das Array `"scenes"` MUSS exakt {target_n} Szenen enthalten. Antworte AUSSCHLIESSLICH mit validem JSON."""

    user_prompt = f"""Schreibe jetzt ein kurzes, intensives, logisch aufgebautes und allgemeinverständliches Einzel-Thema-Skript (Seed #{creative_seed}) für **AuronOrigin**:

RECHERCHIERTES EINZEL-THEMA: {core_subject}
TITEL-FOKUS AUS DER RECHERCHE: {researched_title}
SÄULE: {chosen_pillar}
FORMAT: {video_format}
UMFANG: {scene_count_spec}

{steps_block}

HINTERGRUND-DETAILS ZU GENAU DIESEM EINEN THEMA (wähle nur das aus, was demselben roten Faden dient – erfinde keine zweiten Themen dazu!):
{facts_text}

{avoid_block}

Verfügbare `visual_motif`-Werte (wähle abwechslungsreich passend zum Thema):
{motifs_csv}

Verfügbare `camera_motion`-Werte: `zoom_in`, `zoom_out`, `pan_up`, `drift_right`

Antworte AUSSCHLIESSLICH mit diesem JSON-Schema (exakt {target_n} Szenen, alle Texte außer `image_prompt_en` zu 100% auf Deutsch):
{{
  "title": "Klarer, neugierig machender deutscher Titel exakt zu diesem einen Thema (max. 68 Zeichen)",
  "alt_titles": ["Alternativtitel 1 zum selben Thema", "Alternativtitel 2 zum selben Thema", "Alternativtitel 3 zum selben Thema"],
  "thumbnail_text": "2 BIS 3 WORTE ZUM THEMA",
  "thumbnail_subtext": "Kurze klare Unterzeile",
  "pillar": "{chosen_pillar}",
  "editorial_mode": "{editorial_mode}",
  "hook_3s": "Der exakte erste gesprochene Satz aus Szene 1",
  "scenes": [
    {{
      "scene_number": 1,
      "phase": "EINSTIEG",
      "fact_badge": "DAS THEMA",
      "on_screen_headline": "KURZE KLARE ÜBERSCHRIFT",
      "on_screen_subline": "Kurze verständliche Unterzeile",
      "narration": "Kurzer, logischer, allgemeinverständlicher deutscher Erzählsatz (15-22 Wörter), der nahtlos zum roten Faden gehört.",
      "pause_after": 0.95,
      "visual_motif": "quantum_lattice",
      "camera_motion": "zoom_in",
      "glitch_transition": true,
      "image_prompt_en": "Unique cinematic scene artwork matching this exact moment of {core_subject} in deep obsidian #0B0C10, dark cosmic blue #1F2833 and warm gold #D4AF37, no text, no letters"
    }}
  ],
  "youtube_seo": {{
    "description": "Klare deutsche Videobeschreibung exakt zu diesem einen Thema (nutze \\\\n für Absätze) inkl. Hashtags",
    "tags": ["AuronOrigin", "{core_subject}", "Einfach erklärt", "Wissenschaft", "Mysterium"],
    "pinned_comment": "Deutscher angepinnter Kommentar mit einer klaren Frage genau zu diesem Thema",
    "community_poll": {{
      "question": "Kurze deutsche Abstimmungsfrage genau zu diesem Thema",
      "options": ["Antwort A", "Antwort B", "Antwort C"]
    }}
  }},
  "social_pack": {{
    "youtube_quiz": {{
      "question": "Verständliche deutsche Quiz-Frage direkt zum erklärten Kern dieses Videos (max. 120 Zeichen)",
      "options": [
        "Die richtige, im Video erklärte Antwort (max. 75 Zeichen)",
        "Plausible falsche Antwort B (max. 75 Zeichen)",
        "Plausible falsche Antwort C (max. 75 Zeichen)",
        "Plausible falsche Antwort D (max. 75 Zeichen)"
      ],
      "correct_index": 0,
      "explanation": "Kurze, leicht verständliche Erklärung der richtigen Antwort (max. 260 Zeichen)"
    }},
    "tiktok": {{
      "cover_text": "KURZER THEMEN-TRIGGER",
      "search_keywords": "{core_subject} einfach erklärt",
      "caption": "Kurze, klare deutsche TikTok-Beschreibung genau zu diesem Thema mit 5 passenden Hashtags",
      "first_comment": "Kurze Frage zum Thema für die Kommentare"
    }},
    "instagram": {{
      "caption": "Klare deutsche Instagram-Reel-Beschreibung (erste Zeile unter 120 Zeichen) zu genau diesem Thema mit exakt 5 Hashtags",
      "alt_text": "Deutscher Alternativtext zum AuronOrigin-Video über {core_subject}"
    }},
    "facebook": {{
      "title": "Klarer deutscher Facebook-Videotitel zum Thema (max. 62 Zeichen)",
      "ab_test_title": "Zweiter klarer Titel für den A/B-Test zum selben Thema",
      "description": "Verständlicher deutscher Beitragstext zu diesem einen Thema mit Diskussionsfrage und 4 Hashtags",
      "first_comment": "Kurze Diskussionsfrage genau zu diesem Thema"
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
    shuffled_motifs = list(VISUAL_MOTIFS)
    random.shuffle(shuffled_motifs)

    for idx, sc in enumerate(scenes_in):
        if not isinstance(sc, dict):
            continue
        headline = str(sc.get("on_screen_headline") or f"SCHRITT {idx + 1}").strip().upper()
        raw_narration = str(sc.get("narration") or "").strip()
        narration = enforce_german_narration(raw_narration, fallback_topic=topic) if raw_narration else headline.title()

        motif = str(sc.get("visual_motif") or "").strip()
        if motif not in VISUAL_MOTIFS:
            motif = shuffled_motifs[idx % len(shuffled_motifs)]

        motion = str(sc.get("camera_motion") or motions[idx % len(motions)]).strip()
        if motion not in motions:
            motion = motions[idx % len(motions)]

        pause_val = sc.get("pause_after", 0.95)
        try:
            pause_after = max(0.35, min(2.5, float(pause_val)))
        except (TypeError, ValueError):
            pause_after = 0.95

        subline = str(sc.get("on_screen_subline") or "").strip()
        badge = str(sc.get("fact_badge") or ("ERKLÄRUNG" if idx in (1, 2, 3) else "BEDEUTUNG")).strip().upper()

        existing_seed = sc.get("visual_seed")
        try:
            visual_seed = int(existing_seed) if existing_seed is not None else random.randint(100_000, 99_999_999)
        except (TypeError, ValueError):
            visual_seed = random.randint(100_000, 99_999_999)

        default_prompt = (
            f"Cinematic AuronOrigin scene {idx + 1} illustrating {headline} ({topic[:55]}), "
            f"motif {motif.replace('_', ' ')}, deep space obsidian #0B0C10, dark cosmic blue #1F2833, "
            "luminous gold #D4AF37 accents, photorealistic sacred-tech atmosphere, 8k, no text, no watermark"
        )

        normalized_scenes.append(
            {
                "scene_number": idx + 1,
                "phase": str(sc.get("phase") or ("EINSTIEG" if idx == 0 else "ERKLÄRUNG")).upper(),
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

    title = str(raw.get("title") or topic).strip()
    thumb_text = str(raw.get("thumbnail_text") or "DAS RÄTSEL ERKLÄRT").strip().upper()
    thumb_sub = str(raw.get("thumbnail_subtext") or "KURZ & VERSTÄNDLICH").strip()

    seo_in = raw.get("youtube_seo") if isinstance(raw.get("youtube_seo"), dict) else {}
    poll_in = seo_in.get("community_poll") if isinstance(seo_in.get("community_poll"), dict) else {}
    social_in = raw.get("social_pack") if isinstance(raw.get("social_pack"), dict) else {}

    fact_ref = (
        normalized_scenes[1]["narration"]
        if len(normalized_scenes) > 1
        else (normalized_scenes[0]["narration"] if normalized_scenes else topic)
    )
    short_fact_opt = (fact_ref[:71] + "…") if len(fact_ref) > 72 else fact_ref
    quiz_in = social_in.get("youtube_quiz") if isinstance(social_in.get("youtube_quiz"), dict) else {}
    clean_quiz_subj = re.sub(r'[„“"\']+', "", thumb_text.title()).strip() or chosen_pillar
    default_quiz = {
        "question": str(
            quiz_in.get("question")
            or f"Was ist der zentrale Punkt beim Thema „{clean_quiz_subj}“ in diesem Video?"
        )[:135],
        "options": (
            [str(o)[:76] for o in quiz_in["options"][:4]]
            if isinstance(quiz_in.get("options"), list) and len(quiz_in["options"]) >= 3
            else [
                short_fact_opt,
                "Es handelt sich nur um einen alten Messfehler ohne reale Grundlage.",
                "Das Phänomen tritt ausschließlich in theoretischen Modellen auf.",
                "Die Ursache ist bereits als gewöhnliche Sinnestäuschung abgehakt.",
            ]
        ),
        "correct_index": int(quiz_in.get("correct_index", 0) or 0),
        "explanation": str(
            quiz_in.get("explanation")
            or f"Genau dieser Zusammenhang steht im Mittelpunkt dieser AuronOrigin-Erklärung ({chosen_pillar})."
        )[:320],
    }

    return {
        "title": title,
        "alt_titles": raw.get("alt_titles")
        or [
            f"{title[:48]} – einfach erklärt",
            f"Was wirklich hinter „{clean_quiz_subj}“ steckt",
            f"{clean_quiz_subj}: Kurz, logisch & verständlich | AuronOrigin",
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
                clean_quiz_subj,
                chosen_pillar,
                "Einfach erklärt",
                "Wissenschaft verständlich",
                "Mysterium",
                "Doku Deutsch",
            ],
            "pinned_comment": str(
                seo_in.get("pinned_comment")
                or (
                    f"Wie siehst du das Thema „{title}“? "
                    "Kanntest du diesen Zusammenhang schon – oder hat dich ein Detail überrascht? "
                    "Schreib deine Gedanken unten in die Kommentare!"
                )
            ),
            "community_poll": {
                "question": str(poll_in.get("question") or f"Was fasziniert dich an „{clean_quiz_subj}“ am meisten?"),
                "options": poll_in.get("options")
                or [
                    "Die klare wissenschaftliche Erklärung [FAKT]",
                    "Die tiefere Bedeutung dahinter [DEUTUNG]",
                    "Genau die Verbindung aus beidem!",
                ],
            },
        },
        "social_pack": {
            "youtube_quiz": default_quiz,
            "tiktok": social_in.get("tiktok") if isinstance(social_in.get("tiktok"), dict) else {},
            "instagram": social_in.get("instagram") if isinstance(social_in.get("instagram"), dict) else {},
            "facebook": social_in.get("facebook") if isinstance(social_in.get("facebook"), dict) else {},
        },
    }


def _default_description(title: str, topic: str, pillar: str) -> str:
    return (
        f"{title}\n\n"
        f"In diesem Video widmen wir uns intensiv und allgemeinverständlich genau einem Thema: „{topic}“ – "
        f"kurz, logisch aufgebaut und Schritt für Schritt erklärt.\n\n"
        f"▸ Themen-Säule: {pillar}\n"
        f"▸ Abonniere AuronOrigin für weitere ruhige, tiefgründige Erklärungen.\n"
        f"▸ Instagram: @the.auronorigin | Kontakt: contact@auronorigin.world\n\n"
        f"#AuronOrigin #{pillar.replace('-', '')} #EinfachErklärt #Wissenschaft #Mysterium #DokuDeutsch"
    )


def _pad_or_trim_scenes_to_count(
    scenes: list[dict[str, Any]],
    target_n: int,
    topic: str,
    dossier: dict[str, Any] | None,
    pillar: str,
) -> list[dict[str, Any]]:
    """Adjust scene count (2..30) while staying 100% locked onto the SINGLE researched topic."""
    if len(scenes) == target_n:
        return scenes

    core_subject = str((dossier or {}).get("core_subject") or topic).strip()

    if len(scenes) > target_n and target_n >= 2:
        if target_n == 2:
            # Ultra-compact 2-scene summary: core explanation + conclusion
            trimmed = [scenes[0], scenes[-1]]
        else:
            # Keep opening, logical core scenes, and closing scene
            trimmed = scenes[: target_n - 1] + [scenes[-1]]
        for i, sc in enumerate(trimmed):
            sc["scene_number"] = i + 1
        return trimmed

    # Only pull extra sentences that belong strictly to THIS ONE dossier (never unrelated topics!)
    used_narrs = {str(s.get("narration") or "").strip().lower() for s in scenes}
    same_topic_facts = [
        enforce_german_narration(f, core_subject)
        for f in ((dossier or {}).get("verified_facts") or [])
        if is_pure_german(str(f)) and enforce_german_narration(f, core_subject).strip().lower() not in used_narrs
    ]

    motions = ["zoom_in", "zoom_out", "pan_up", "drift_right"]
    extra_motifs = [m for m in VISUAL_MOTIFS]
    random.shuffle(extra_motifs)

    # Single-topic logical deepening steps (all grammatically natural regardless of subject phrasing)
    deepening_steps = [
        (
            "EINFACH VORGESTELLT",
            "ANSCHAULICH",
            f"Man kann sich das Thema „{core_subject}“ wie ein feines Uhrwerk vorstellen, bei dem schon ein winziges Detail das gesamte Bild verändert.",
        ),
        (
            "WARUM DAS WICHTIG IST",
            "HINTERGRUND",
            "Entscheidend ist dabei vor allem eines: Genau dieser Zusammenhang lässt sich immer wieder zuverlässig beobachten und nachprüfen.",
        ),
        (
            "DER ZWEITE BLICK",
            "VERTIEFUNG",
            "Auf den ersten Blick wirkt das Phänomen ungewöhnlich – doch Schritt für Schritt betrachtet folgt dahinter eine verblüffend klare Logik.",
        ),
        (
            "OFFENE FRAGE",
            "GRENZE",
            "Trotz aller präzisen Messungen bleibt genau hier ein Punkt offen, über den selbst Fachleute bis heute staunen.",
        ),
        (
            "WAS DARAUS FOLGT",
            "KONSEQUENZ",
            "Denkt man diesen Gedanken ruhig zu Ende, zeigt sich unsere gewohnte Alltagswelt plötzlich von einer ganz neuen Seite.",
        ),
    ]

    out = list(scenes[:-1]) if scenes else []
    cta_scene = scenes[-1] if scenes else {
        "phase": "ABSCHLUSS",
        "fact_badge": "AURONORIGIN",
        "on_screen_headline": "DEINE SICHT ZUM THEMA",
        "on_screen_subline": "Schreib es in die Kommentare ↓",
        "narration": "Was denkst du darüber – reiner Zufall oder eine tiefere Ordnung? Schreib deine Sicht in die Kommentare und folge AuronOrigin.",
        "pause_after": 0.95,
        "visual_motif": "ouroboros_seal",
        "visual_seed": random.randint(100_000, 99_999_999),
        "camera_motion": "zoom_out",
        "glitch_transition": False,
    }

    pool_idx = 0
    while len(out) + 1 < target_n:
        head, badge, fallback_narr = deepening_steps[pool_idx % len(deepening_steps)]
        narr = same_topic_facts[pool_idx] if pool_idx < len(same_topic_facts) else fallback_narr
        seq_num = len(out) + 1
        motif = extra_motifs[pool_idx % len(extra_motifs)]
        out.append(
            {
                "scene_number": seq_num,
                "phase": f"SCHRITT {seq_num}",
                "fact_badge": badge,
                "on_screen_headline": head,
                "on_screen_subline": core_subject[:54].upper(),
                "narration": enforce_german_narration(narr, core_subject),
                "pause_after": 0.95,
                "visual_motif": motif,
                "visual_seed": random.randint(100_000, 99_999_999),
                "camera_motion": motions[seq_num % len(motions)],
                "glitch_transition": True,
                "image_prompt_en": (
                    f"Cinematic {motif.replace('_', ' ')} artwork illustrating {core_subject} ({head}), "
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
    """Single-topic, logical, plain-German storyteller when running without an Arena API key."""
    target_n = resolve_target_scene_count(duration_target, scene_count)
    core_subject = str((dossier or {}).get("core_subject") or (dossier or {}).get("input_keyword") or topic).strip()
    matched_title = str((dossier or {}).get("topic") or topic).strip()
    steps = (dossier or {}).get("story_steps") or {}

    hook_line = enforce_german_narration(
        steps.get("hook")
        or f"Hinter {core_subject} verbirgt sich ein Zusammenhang, der auf den ersten Blick verblüfft – und doch ganz logisch erklärbar ist.",
        core_subject,
    )
    what_line = enforce_german_narration(
        steps.get("what_is_it")
        or f"Im Kern geht es bei {core_subject} um eine konkrete Beobachtung, die zeigt, wie präzise unsere Welt im Verborgenen geordnet ist.",
        core_subject,
    )
    how_line = enforce_german_narration(
        steps.get("how_it_works")
        or f"Vereinfacht gesagt greifen dabei kleinste Abläufe so exakt ineinander, dass selbst modernste Messgeräte immer wieder dasselbe klare Muster bestätigen.",
        core_subject,
    )
    why_line = enforce_german_narration(
        steps.get("why_astonishing")
        or f"Das Erstaunliche daran ist: Unsere gewohnte Alltagsvorstellung reicht plötzlich nicht mehr aus, um dieses Ergebnis vollständig zu erklären.",
        core_subject,
    )
    meaning_line = enforce_german_narration(
        steps.get("deeper_meaning")
        or f"Genau deshalb lohnt sich der ruhige Blick auf {core_subject}: Manchmal zeigt ein einziges Phänomen mehr über die Wirklichkeit als tausend Schlagzeilen.",
        core_subject,
    )

    tail_sig = (
        " Auron out. Die Matrix wackelt. Bleib wach."
        if editorial_mode == "matrix_narrativ"
        else ""
    )
    cta_options = [
        f"Kanntest du diesen Zusammenhang schon, oder hat dich ein Detail überrascht? Schreib es in die Kommentare und folge AuronOrigin.{tail_sig}",
        f"Was denkst du darüber – steckt dahinter reiner Zufall oder eine tiefere Ordnung? Teile deine Sicht in den Kommentaren und abonniere AuronOrigin.{tail_sig}",
    ]

    motifs_pool = list(VISUAL_MOTIFS)
    random.shuffle(motifs_pool)

    preset_trigger = str((dossier or {}).get("thumb_trigger") or "").strip().upper()
    if preset_trigger:
        short_trigger = preset_trigger[:28]
    else:
        words_upper = [
            w.upper()
            for w in re.findall(r"[A-Za-zÄÖÜäöüß0-9]{3,}", core_subject)
            if w.lower() not in {"und", "der", "die", "das", "von", "mit", "für", "über", "was", "wie", "warum"}
        ]
        short_trigger = " ".join(words_upper[:3])[:28].strip() or "DAS RÄTSEL ERKLÄRT"

    base_scenes = [
        {
            "scene_number": 1,
            "phase": "EINSTIEG",
            "fact_badge": "DAS THEMA",
            "on_screen_headline": short_trigger,
            "on_screen_subline": core_subject[:54],
            "narration": hook_line,
            "pause_after": 0.98,
            "visual_motif": motifs_pool[0],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "zoom_in",
            "glitch_transition": True,
            "image_prompt_en": f"Dramatic dark cosmic opening artwork focused strictly on {core_subject}, deep obsidian #0B0C10, dark steel blue #1F2833, glowing #D4AF37 gold geometry, cinematic 8k, no text",
        },
        {
            "scene_number": 2,
            "phase": "WORUM ES GEHT",
            "fact_badge": "EINFACH ERKLÄRT",
            "on_screen_headline": "WAS DAHINTERSTECKT",
            "on_screen_subline": "Kurz & verständlich",
            "narration": what_line,
            "pause_after": 0.98,
            "visual_motif": motifs_pool[1],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "pan_up",
            "glitch_transition": True,
            "image_prompt_en": f"Clear visual metaphor illustrating {core_subject}, dark navy #1F2833 and golden #D4AF37 light rays, obsidian shadows #0B0C10, 8k, no text",
        },
        {
            "scene_number": 3,
            "phase": "WIE ES FUNKTIONIERT",
            "fact_badge": "DER ABLAUF",
            "on_screen_headline": "SCHRITT FÜR SCHRITT",
            "on_screen_subline": core_subject[:54],
            "narration": how_line,
            "pause_after": 0.98,
            "visual_motif": motifs_pool[2],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "zoom_out",
            "glitch_transition": True,
            "image_prompt_en": f"Detailed sacred-tech illustration of how {core_subject} works, deep space blue #1F2833, golden #D4AF37 filaments, subtle mystic violet #4A235A glow, no text",
        },
        {
            "scene_number": 4,
            "phase": "DER KNACKPUNKT",
            "fact_badge": "ERSTAUNLICH",
            "on_screen_headline": "WARUM ES VERBLÜFFT",
            "on_screen_subline": "Beobachtung & Logik",
            "narration": why_line,
            "pause_after": 1.0,
            "visual_motif": motifs_pool[3],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "drift_right",
            "glitch_transition": True,
            "image_prompt_en": f"Focal revelation artwork for {core_subject}, dark blue cosmic dust #1F2833, shimmering gold #D4AF37 orbital rings, obsidian #0B0C10, 8k, no text",
        },
        {
            "scene_number": 5,
            "phase": "BEDEUTUNG",
            "fact_badge": "DEUTUNG",
            "on_screen_headline": "DER TIEFERE BLICK",
            "on_screen_subline": "AuronOrigin Perspektive",
            "narration": meaning_line,
            "pause_after": 1.05,
            "visual_motif": motifs_pool[4],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "zoom_in",
            "glitch_transition": True,
            "image_prompt_en": f"Calm philosophical cosmic perspective on {core_subject}, golden ouroboros horizon in dark cosmic blue #1F2833 and #0B0C10, #D4AF37 volumetric light, no text",
        },
        {
            "scene_number": 6,
            "phase": "ABSCHLUSS",
            "fact_badge": "AURONORIGIN",
            "on_screen_headline": "DEINE MEINUNG ↓",
            "on_screen_subline": "Abonniere AuronOrigin",
            "narration": random.choice(cta_options),
            "pause_after": 0.9,
            "visual_motif": motifs_pool[5],
            "visual_seed": random.randint(100_000, 99_999_999),
            "camera_motion": "zoom_out",
            "glitch_transition": False,
            "image_prompt_en": "Monumental golden cosmic portal in deep dark blue space #1F2833 and obsidian #0B0C10, AuronOrigin sacred geometry aesthetic, 8k, no text",
        },
    ]

    scenes = _pad_or_trim_scenes_to_count(base_scenes, target_n, core_subject, dossier, pillar)

    raw = {
        "title": matched_title,
        "alt_titles": [
            f"{core_subject} einfach erklärt: Was wirklich dahintersteckt",
            f"Das Rätsel um {core_subject} – kurz & verständlich",
            f"Warum {core_subject} unser gewohntes Bild verändert | AuronOrigin",
        ],
        "thumbnail_text": short_trigger,
        "thumbnail_subtext": "KURZ & VERSTÄNDLICH ERKLÄRT",
        "pillar": pillar,
        "scenes": scenes,
    }
    return normalize_blueprint(
        raw,
        topic=core_subject,
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
    """Generate a single-topic, short, logical, plain-German AuronOrigin script via Arena Router."""
    clean_topic = (topic or "").strip()
    if not clean_topic:
        clean_topic = (dossier or {}).get("topic") or "Quantenverschränkung einfach erklärt"

    core_subject = str((dossier or {}).get("core_subject") or clean_topic).strip()
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
                    topic=core_subject,
                    video_format=video_format,
                    editorial_mode=editorial_mode,
                    pillar=chosen_pillar,
                )
                if len(bp["scenes"]) != target_n:
                    bp["scenes"] = _pad_or_trim_scenes_to_count(
                        bp["scenes"], target_n, core_subject, dossier, chosen_pillar
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
    fallback["arena_warning"] = "Kein Arena API-Key gesetzt – fokussiertes deutsches Einzel-Thema-Skript erstellt."
    fallback["prompts_for_browser_router"] = {
        "system_prompt": sys_prompt,
        "user_prompt": usr_prompt,
    }
    return fallback
