"""High-CTR & High-Retention Single-Topic German Script Generator for AuronOrigin.

Engineered around two measurable YouTube performance targets:
1. HOME/BROWSE CTR > 4.5–6%:
   - Complementary Title + Thumbnail Curiosity-Gap Architecture (never repeat words between
     title and thumbnail; ban encyclopedic "Wiki-style" main titles; generate 3 distinct A/B/C
     titles AND 3 distinct 2–3 word thumbnail triggers for YouTube "Test & Compare").
2. 9-MINUTE AUDIENCE RETENTION > 40% AVD:
   - Strictly ONE single researched topic per video (zero multi-news mixing, 100% plain German).
   - 6-Act Open-Loop & Re-Hook Narrative Architecture for 9-minute videos (`docu_540`, 18 scenes,
     ~1,000–1,120 spoken words):
       Act I   (0:00–0:55): Cold Open Proof + Main Open Loop (#1)
       Act II  (0:55–2:20): Vivid Everyday Analogy + Minute-2 Re-Hook (#2)
       Act III (2:20–4:30): Detective-Style Experiment Story + Midpoint Twist (#3)
       Act IV  (4:30–6:45): Honest Skeptic Test & Anomaly Deepening
       Act V   (6:45–8:20): Main Open-Loop Payoff & AuronOrigin Perspective
       Act VI  (8:20–9:00): Resonant Final Thought + Seamless Binge Bridge (NO outro-signaling!)
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

STORYTELLING_STYLES = [
    (
        "DER WISSENSCHAFTS-KRIMI (OPEN-LOOP SPANNUNG)",
        "Erzähle dieses eine Thema wie eine ruhige, fesselnde Spurensuche: Öffne im ersten Moment eine konkrete Wissenslücke, führe mit klaren Alltagsbildern durch die Beweise und halte die Auflösung des Kernrätsels bis ins letzte Drittel spannend.",
    ),
    (
        "DAS PARADOXON & DIE AUFLÖSUNG",
        "Starte sofort mit dem scheinbaren Widerspruch, der unserem gesunden Menschenverstand widerspricht, und löse ihn Schritt für Schritt in einfacher, glasklarer Sprache auf.",
    ),
    (
        "VOM ALLTAGSBILD ZUM STAUNEN",
        "Hole den Zuschauer mit einem sofort greifbaren Bild aus seinem eigenen Alltag ab, baue bei jeder Wendung neue Neugier auf und zeige am Ende, was dieser Befund für unser Weltbild bedeutet.",
    ),
    (
        "DER BLICK HINTER DIE KULISSEN DER REALITÄT",
        "Nimm den Zuschauer ruhig an die Hand, prüfe selbst kritische Gegenfragen ehrlich durch und führe ihn logisch bis zu dem Punkt, an dem selbst Forscher ins Staunen geraten.",
    ),
]

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
    if duration_target == "long_300":
        return 10
    if duration_target == "docu_540":
        return 18
    return 6


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
    """Construct High-CTR Packaging + Open-Loop High-Retention prompts for Arena Router."""
    chosen_pillar = pillar or (dossier or {}).get("pillar") or detect_pillar(topic)
    target_n = resolve_target_scene_count(duration_target, scene_count)
    style_name, style_instr = random.choice(STORYTELLING_STYLES)
    creative_seed = random.randint(1000, 9999)

    core_subject = str((dossier or {}).get("core_subject") or topic).strip()
    researched_title = str((dossier or {}).get("topic") or topic).strip()
    is_long_docu = duration_target == "docu_540" or target_n >= 14

    if is_long_docu:
        w_per_scene_min = max(42, int(round(980 / max(1, target_n))))
        w_per_scene_max = max(55, int(round(1120 / max(1, target_n))))
        total_w_min = w_per_scene_min * target_n
        total_w_max = w_per_scene_max * target_n
        scene_count_spec = (
            f"exakt {target_n} Szenen für ein ca. 9-minütiges YouTube-Hauptvideo "
            f"(je Szene ca. {w_per_scene_min}–{w_per_scene_max} gesprochene Wörter in 3–4 kurzen, glasklaren Sätzen; "
            f"Gesamtumfang ca. {total_w_min}–{total_w_max} Wörter)"
        )
        retention_structure_rules = f"""4. **6-AKT RETENTION-DRAMATURGIE FÜR > 40 % WIEDERGABEDAUER BEI 9 MINUTEN**:
   - **Akt I – Cold Open & Haupt-Open-Loop (Szene 1 bis 2, 0:00–0:55)**:
     • Satz 1 steigt OHNE Begrüßung sofort mitten ins Versprechen von Titel & Thumbnail ein (kein „Hallo“, kein „Heute geht es um…“).
     • Szene 2 öffnet den **Großen Open Loop (#1)**: Benenne das konkrete ungelöste Kernrätsel oder Paradoxon dieses Themas, dessen Auflösung erst in Akt V enthüllt wird!
   - **Akt II – Das greifbare Alltagsbild & Minute-2-Schutzschild (Szene 3 bis 5, 0:55–2:20)**:
     • Erkläre das Phänomen mit einem lebendigen Alltagsvergleich so einfach, dass jeder sofort ein klares Bild im Kopf hat.
     • **PFLICHT am Ende von Szene 5 (gegen den klassischen 2-Minuten-Abbruch!)**: Setze **Re-Hook / Open Loop #2** (z. B.: „Bis hierhin klang alles noch logisch – doch als Forscher den nächsten Schritt wagten, geschah etwas, womit niemand gerechnet hatte…“).
   - **Akt III – Spurensuche & Das entscheidende Experiment (Szene 6 bis 9, 2:20–4:30)**:
     • Erzähle die reale Entdeckung oder Messung wie einen ruhigen Krimi.
     • **PFLICHT am Ende von Szene 9 (Halbzeit-Cliffhanger bei ~4:30!)**: Öffne **Mid-Video Twist / Open Loop #3** (die überraschende Wendung in den Daten).
   - **Akt IV – Der Realitäts-Test & Die Anomalie (Szene 10 bis {max(10, target_n - 5)}, 4:30–6:45)**:
     • Nimm den klügsten Einwand von Skeptikern ernst („War es nur ein Messfehler oder Zufall?“) und zeige klar verständlich, warum genau diese einfache Erklärung hier scheitert.
   - **Akt V – Der Große Payoff & Die AuronOrigin-Deutung (Szene {max(11, target_n - 4)} bis {max(12, target_n - 2)}, 6:45–8:20)**:
     • Löse jetzt den **Großen Open Loop (#1)** aus dem Cold Open befriedigend auf und zeige in ruhigen Worten, was das für unser Bild der Wirklichkeit bedeutet.
   - **Akt VI – Stiller Nachhall & Nahtlose Binge-Brücke (letzte 2 Szenen bis Szene {target_n}, 8:20–9:00)**:
     • **STRENGES VERBOT VON ABBRUCH-SIGNALWÖRTERN**: Sage NIEMALS „Zusammenfassend“, „Zum Schluss“, „Fazit“ oder „Danke fürs Zuschauen“ (sonst schalten Zuschauer sofort ab!).
     • Ende mit einem starken letzten Gedanken zum Thema, einer konkreten Entscheidungsfrage für die Kommentare und einem neugierig machenden Brücken-Satz auf das nächste verknüpfte AuronOrigin-Rätsel."""
    elif target_n <= 6:
        words_min = target_n * 16
        words_max = target_n * 22
        scene_count_spec = (
            f"exakt {target_n} Szenen (knackig & hochspannend: ca. 16–22 Wörter pro Szene, "
            f"insgesamt ca. {words_min}–{words_max} Wörter für 50–60 Sek.)"
        )
        retention_structure_rules = f"""4. **KOMPAKTE OPEN-LOOP-STRUKTUR FÜR MAXIMALE BINDUNG ({target_n} SZENEN)**:
   - Szene 1 (Cold Open Hook): Bestätigt in den ersten 3 Sekunden sofort Titel & Thumbnail mit einem verblüffenden Fakt + öffnet eine Mini-Spannungsfrage.
   - Szene 2 (Alltagsbild): Erklärt in einfachen Worten, worum es konkret geht.
   - Szene 3 (Der Mechanismus + Mini-Re-Hook): Zeigt anschaulich, wie es abläuft, und leitet direkt zur Überraschung über.
   - Szene 4 (Der Payoff / Knackpunkt): Enthüllt, warum genau dieser Befund unsere gewohnte Vorstellung sprengt.
   - Vorletzte Szene: Ruhige, tiefgründige AuronOrigin-Deutung genau dieses einen Themas.
   - Szene {target_n} (Ohne Abspann-Floskel!): Kein „Zusammenfassend“ – sondern eine direkte Streitfrage zum Thema für die Kommentare."""
    else:
        est_words_min = target_n * 28
        est_words_max = target_n * 38
        scene_count_spec = (
            f"exakt {target_n} Szenen (nummeriert 1 bis {target_n}, ca. 28–38 Wörter pro Szene, "
            f"insgesamt ca. {est_words_min}–{est_words_max} Wörter)"
        )
        retention_structure_rules = f"""4. **MEHRSTUFIGE OPEN-LOOP-DRAMATURGIE ({target_n} SZENEN)**:
   - Szene 1–2: Sofortiger Cold-Open-Beweis passend zum Titel + Öffnen eines Open Loops, der erst im letzten Drittel aufgelöst wird.
   - Frühe Mitte: Einfach verständliches Alltagsbild + Re-Hook vor Minute 2 („Doch genau hier beginnt der Teil, der selbst Fachleute verblüffte…“).
   - Späte Mitte: Das konkrete Experiment / der Befund + Prüfung möglicher Einwände.
   - Finale Szenen: Klare Auflösung des Open Loops, tiefgründige AuronOrigin-Perspektive und direkte Kommentar-Frage (ohne Abspann-Floskeln wie „Zusammenfassend“!)."""

    if editorial_mode == "matrix_narrativ":
        persona_block = (
            "MODUS: 'Auron – Der Code der Matrix' (ruhiger, weiser, tiefgründiger Erzähler). "
            "Letzter Satz ganz am Ende: 'Auron out. Die Matrix wackelt. Bleib wach.'"
        )
    else:
        persona_block = (
            "MODUS: 'Fakten zuerst, Mystery als Deutung' (ruhige, fesselnde Stimme eines alten Weisen: "
            "zuerst das reale Phänomen glasklar und spannend erzählen, danach die tiefere philosophische Einordnung)."
        )

    story_steps = (dossier or {}).get("story_steps") or {}
    deep_dive = (dossier or {}).get("deep_dive") or {}
    dossier_lines = [
        f"- Cold-Open-Kern: {story_steps.get('hook', '')}",
        f"- Haupt-Open-Loop: {deep_dive.get('open_loop_main', '')}",
        f"- Alltagsvergleich: {deep_dive.get('analogy') or story_steps.get('what_is_it', '')}",
        f"- Minute-2-Re-Hook: {deep_dive.get('rehook_min2', '')}",
        f"- Entdeckung / Experiment: {deep_dive.get('experiment') or story_steps.get('how_it_works', '')}",
        f"- Halbzeit-Twist: {deep_dive.get('mid_twist', '')}",
        f"- Skeptiker-Check: {deep_dive.get('skeptic_check') or story_steps.get('why_astonishing', '')}",
        f"- Großer Payoff: {deep_dive.get('payoff', '')}",
        f"- Tiefere Deutung: {story_steps.get('deeper_meaning', '')}",
    ]
    steps_block = "DRAMATURGISCHE BAUSTEINE ZU DIESEM EINEN THEMA:\n" + "\n".join(s for s in dossier_lines if len(s) > 25)

    de_facts = [f for f in (dossier or {}).get("verified_facts", []) if is_pure_german(str(f))]
    facts_text = "\n".join(f"- {f}" for f in de_facts[:6]) or f"- Kernthema: {core_subject}"
    recent_list = _recent_hooks()
    avoid_block = (
        "VERMEIDE Ähnlichkeiten zu diesen letzten Videotiteln:\n" + "\n".join(f"- {h}" for h in recent_list)
        if recent_list
        else ""
    )

    motifs_csv = ", ".join(f"`{m}`" for m in VISUAL_MOTIFS)

    system_prompt = f"""Du bist der Chef-Showrunner & Packaging-Stratege des deutschen YouTube-Kanals **AuronOrigin**. Gesprochen wird dein Skript von einer **tiefen, ruhigen, alten, weisen Männerstimme**.

UNVERHANDELBARE REGELN FÜR > 5 % STARTSEITEN-CTR & > 40 % ZUSCHAUERBINDUNG:
1. **STRENG NUR EIN EINZIGES THEMA (KEIN NEWS-MIX!)**:
   - Das gesamte Video behandelt **ausschließlich dieses eine Thema**: **{core_subject}**.
   - Lies NIEMALS mehrere verschiedene News-Meldungen vor und wechsle NIEMALS zu fremden Nebenthemen!
2. **HIGH-CTR TITEL + THUMBNAIL VERPACKUNG (ZIEL: > 5 % AUF DER YOUTUBE-STARTSEITE)**:
   - **Verbot von langweiligen Nachhilfe-Titeln**: Nutze als Haupttitel NIEMALS trockene Wiki-Formulierungen wie „Was ist …?“ oder „… einfach erklärt“. Auf der Startseite klicken Menschen auf **konkrete Anomalien, Paradoxien und ungelöste Spannungsfragen** (100 % wahrheitsgemäß, max. 62 Zeichen!).
   - **Komplementäre Spannungslücke (Curiosity Gap)**: `thumbnail_text` und die 3 `thumbnail_variants` (je **maximal 2 bis 3 kurze, wuchtige Wörter**!) dürfen NIEMALS einfach den Titel wiederholen – sie liefern den visuellen/emotionalen Zündfunken (z. B. `SEIT 4.500 JAHREN ZU`, `0 SEKUNDEN VERZÖGERUNG`, `100 MS ZU SPÄT`).
   - Liefere 3 psychologisch unterschiedliche A/B/C-Titel in `alt_titles` (1. Anomalie-Hook, 2. Persönlicher Realitäts-Hook mit „du“, 3. Offene Forscher-Kernfrage) für YouTube „Testen & Vergleichen“.
3. **ALLGEMEINVERSTÄNDLICHE, BILDHAFTE SPRACHE (FÜR JEDEN SOFORT KLAR)**:
   - Im gesprochenen Text (`narration`) erklärst du jeden Gedanken in kurzen, klaren, logisch aufeinander aufbauenden Sätzen. Keine trockene Fachsprache – jedes komplexe Detail wird sofort in einem greifbaren Alltagsbild lebendig!
{retention_structure_rules}
5. **100 % NATÜRLICHES DEUTSCH & MARKENWELT**:
   - Keine englischen Wörter im Sprechtext `narration`.
   - Erzählstil: **{style_name}** – {style_instr}
   - {persona_block}
   - Jede Szene erhält einen englischen Bildprompt (`image_prompt_en`) in Tiefschwarz (#0B0C10), Kosmos-Dunkelblau (#1F2833) und leuchtendem Gold (#D4AF37), ohne Text im Bild.

Das Array `"scenes"` MUSS exakt {target_n} Szenen enthalten. Antworte AUSSCHLIESSLICH mit validem JSON."""

    user_prompt = f"""Erstelle jetzt das High-CTR & High-Retention Produktions-Paket (Seed #{creative_seed}) für **AuronOrigin**:

EINZEL-THEMA: {core_subject}
RECHERCHIERTER STARTSEITEN-WINKEL: {researched_title}
SÄULE: {chosen_pillar}
FORMAT: {video_format}
ZIEL-UMFANG: {scene_count_spec}

{steps_block}

GEPRÜFTE HINTERGRUND-DETAILS ZU GENAU DIESEM EINEN THEMA:
{facts_text}

{avoid_block}

Verfügbare `visual_motif`-Werte:
{motifs_csv}

Verfügbare `camera_motion`-Werte: `zoom_in`, `zoom_out`, `pan_up`, `drift_right`

Antworte AUSSCHLIESSLICH mit diesem JSON-Schema (exakt {target_n} Szenen):
{{
  "title": "Starker deutscher Startseiten-Titel mit Curiosity Gap exakt zu {core_subject} (max. 62 Zeichen, kein Wiki-Titel)",
  "alt_titles": [
    "Variante A (Anomalie/Messwert-Hook, max. 62 Zeichen)",
    "Variante B (Persönlicher Du-Realitäts-Hook, max. 62 Zeichen)",
    "Variante C (Offene Kernfrage mit Spannungslücke, max. 62 Zeichen)"
  ],
  "thumbnail_text": "MAX 2-3 WORTE KONTRAST-TRIGGER (wiederholt NICHT den Titel!)",
  "thumbnail_variants": [
    "2-3 WORTE TRIGGER A (Kontrast-Fokus)",
    "2-3 WORTE TRIGGER B (Anomalie/Messwert)",
    "2 WORTE TRIGGER C (Rätsel-Frage)"
  ],
  "thumbnail_subtext": "",
  "pillar": "{chosen_pillar}",
  "editorial_mode": "{editorial_mode}",
  "hook_3s": "Der exakte erste gesprochene Cold-Open-Satz aus Szene 1",
  "scenes": [
    {{
      "scene_number": 1,
      "phase": "AKT I • COLD OPEN",
      "fact_badge": "DAS PARADOXON",
      "on_screen_headline": "KURZE KAPITEL-ÜBERSCHRIFT",
      "on_screen_subline": "Prägnante Einordnung",
      "narration": "Klarer, bildhafter, spannungsvoller deutscher Sprechtext exakt im Ziel-Wortumfang dieser Szene.",
      "pause_after": 1.1,
      "visual_motif": "quantum_lattice",
      "camera_motion": "zoom_in",
      "glitch_transition": true,
      "image_prompt_en": "High-contrast focal object on right golden ratio illustrating {core_subject}, bright luminous gold #D4AF37 rim lighting against deep cosmic blue #1F2833 and obsidian #0B0C10, 8k, no text"
    }}
  ],
  "youtube_seo": {{
    "description": "Spannende erste 2 Zeilen (vor ‚Mehr anzeigen‘) + klare deutsche Zusammenfassung zu {core_subject} inkl. Hashtags",
    "tags": ["AuronOrigin", "{core_subject}", "Wissenschaft", "Rätsel", "Doku Deutsch"],
    "pinned_comment": "Deutscher angepinnter Kommentar mit konkreter Entscheidungsfrage genau zu diesem Thema",
    "community_poll": {{
      "question": "Spannende deutsche Abstimmungsfrage zum Video-Kern",
      "options": ["Option A", "Option B", "Option C"]
    }}
  }},
  "social_pack": {{
    "youtube_quiz": {{
      "question": "Verständliche Quiz-Frage direkt zum entscheidenden Befund im Video (max. 120 Zeichen)",
      "options": [
        "Richtige, im Video aufgelöste Antwort (max. 75 Zeichen)",
        "Plausible falsche Antwort B (max. 75 Zeichen)",
        "Plausible falsche Antwort C (max. 75 Zeichen)",
        "Plausible falsche Antwort D (max. 75 Zeichen)"
      ],
      "correct_index": 0,
      "explanation": "Kurze, klare Erklärung der richtigen Antwort (max. 260 Zeichen)"
    }},
    "tiktok": {{
      "cover_text": "2-3 WORTE SAFE-ZONE HOOK",
      "search_keywords": "{core_subject} Rätsel",
      "caption": "Spannende deutsche TikTok-Beschreibung genau zu diesem Thema mit 5 Hashtags",
      "first_comment": "Kurze Entscheidungsfrage für die Kommentare"
    }},
    "instagram": {{
      "caption": "Fesselnde Instagram-Reel-Caption (erste Zeile < 115 Zeichen) mit exakt 5 Hashtags",
      "alt_text": "Deutscher Alternativtext zum AuronOrigin-Video über {core_subject}"
    }},
    "facebook": {{
      "title": "Starker deutscher Facebook-Videotitel (max. 62 Zeichen)",
      "ab_test_title": "Zweiter A/B-Test-Titel mit anderem Spannungs-Winkel",
      "description": "Verständlicher Beitragstext zu diesem Thema mit Diskussionsfrage und 4 Hashtags",
      "first_comment": "Kurze Diskussionsfrage genau zu diesem Thema"
    }}
  }}
}}"""
    return system_prompt, user_prompt


def _sanitize_thumb_trigger(raw_txt: str, fallback: str = "DAS WAHRE RÄTSEL") -> str:
    """Keep thumbnail trigger ultra-punchy (max 3–4 words, uppercase, mobile-readable in 0.3s)."""
    cleaned = re.sub(r'[„“"\']+', "", str(raw_txt or "")).strip().upper()
    cleaned = re.sub(r"\s+", " ", cleaned)
    if not cleaned:
        return fallback
    words = cleaned.split(" ")
    if len(words) > 4:
        cleaned = " ".join(words[:3])
    return cleaned[:28].strip()


def normalize_blueprint(
    raw: dict[str, Any],
    *,
    topic: str,
    video_format: str = "9:16",
    editorial_mode: str = "fakten_mystery",
    pillar: str | None = None,
) -> dict[str, Any]:
    """Guarantee all required High-CTR & High-Retention fields exist and sanitize narration to 100% German."""
    chosen_pillar = raw.get("pillar") or pillar or detect_pillar(topic)
    scenes_in = raw.get("scenes") if isinstance(raw.get("scenes"), list) else []
    normalized_scenes: list[dict[str, Any]] = []

    motions = ["zoom_in", "zoom_out", "pan_up", "drift_right"]
    shuffled_motifs = list(VISUAL_MOTIFS)
    random.shuffle(shuffled_motifs)

    for idx, sc in enumerate(scenes_in):
        if not isinstance(sc, dict):
            continue
        headline = str(sc.get("on_screen_headline") or f"KAPITEL {idx + 1}").strip().upper()
        raw_narration = str(sc.get("narration") or "").strip()
        narration = enforce_german_narration(raw_narration, fallback_topic=topic) if raw_narration else headline.title()

        motif = str(sc.get("visual_motif") or "").strip()
        if motif not in VISUAL_MOTIFS:
            motif = shuffled_motifs[idx % len(shuffled_motifs)]

        motion = str(sc.get("camera_motion") or motions[idx % len(motions)]).strip()
        if motion not in motions:
            motion = motions[idx % len(motions)]

        pause_val = sc.get("pause_after", 1.05)
        try:
            pause_after = max(0.35, min(2.6, float(pause_val)))
        except (TypeError, ValueError):
            pause_after = 1.05

        subline = str(sc.get("on_screen_subline") or "").strip()
        badge = str(sc.get("fact_badge") or ("COLD OPEN" if idx == 0 else "ANALYSE")).strip().upper()

        existing_seed = sc.get("visual_seed")
        try:
            visual_seed = int(existing_seed) if existing_seed is not None else random.randint(100_000, 99_999_999)
        except (TypeError, ValueError):
            visual_seed = random.randint(100_000, 99_999_999)

        default_prompt = (
            f"Cinematic AuronOrigin scene {idx + 1} illustrating {headline} ({topic[:55]}), "
            f"motif {motif.replace('_', ' ')}, bright luminous gold #D4AF37 hero focal object with rim lighting "
            "against dark cosmic blue #1F2833 and deep obsidian #0B0C10, photorealistic sacred-tech atmosphere, 8k, no text"
        )

        normalized_scenes.append(
            {
                "scene_number": idx + 1,
                "phase": str(sc.get("phase") or ("COLD OPEN" if idx == 0 else f"TEIL {idx + 1}")).upper(),
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
    thumb_text = _sanitize_thumb_trigger(raw.get("thumbnail_text") or "DAS WAHRE RÄTSEL")
    raw_variants = raw.get("thumbnail_variants") if isinstance(raw.get("thumbnail_variants"), list) else []
    thumb_variants: list[str] = []
    for tv in raw_variants:
        st = _sanitize_thumb_trigger(tv, "")
        if st and st not in thumb_variants:
            thumb_variants.append(st)
    for fallback_tv in (thumb_text, "KEIN ZUFALL?", "DER BEWEIS"):
        if len(thumb_variants) < 3 and fallback_tv not in thumb_variants:
            thumb_variants.append(fallback_tv)
    thumb_variants = thumb_variants[:3]
    # Keep thumbnail_text synced with primary Variant A while guaranteeing 3 distinct A/B/C triggers
    if raw.get("thumbnail_text"):
        thumb_variants = [thumb_text] + [v for v in thumb_variants if v != thumb_text]
        for fallback_tv in ("KEIN ZUFALL?", "DER BEWEIS", "DAS WAHRE RÄTSEL"):
            if len(thumb_variants) < 3 and fallback_tv not in thumb_variants:
                thumb_variants.append(fallback_tv)
        thumb_variants = thumb_variants[:3]

    # Keep thumbnail_subtext clean (empty by default for uncluttered High-CTR 16:9 Browse thumbnails, optional for user)
    thumb_sub = str(raw.get("thumbnail_subtext") or "").strip()

    seo_in = raw.get("youtube_seo") if isinstance(raw.get("youtube_seo"), dict) else {}
    poll_in = seo_in.get("community_poll") if isinstance(seo_in.get("community_poll"), dict) else {}
    social_in = raw.get("social_pack") if isinstance(raw.get("social_pack"), dict) else {}

    fact_ref = (
        normalized_scenes[2]["narration"]
        if len(normalized_scenes) > 2
        else (normalized_scenes[1]["narration"] if len(normalized_scenes) > 1 else (normalized_scenes[0]["narration"] if normalized_scenes else topic))
    )
    short_fact_opt = (fact_ref[:71] + "…") if len(fact_ref) > 72 else fact_ref
    quiz_in = social_in.get("youtube_quiz") if isinstance(social_in.get("youtube_quiz"), dict) else {}
    clean_quiz_subj = re.sub(r'[„“"\']+', "", topic[:40]).strip() or chosen_pillar
    default_quiz = {
        "question": str(
            quiz_in.get("question")
            or f"Welcher entscheidende Punkt macht „{clean_quiz_subj}“ für Forscher so erstaunlich?"
        )[:135],
        "options": (
            [str(o)[:76] for o in quiz_in["options"][:4]]
            if isinstance(quiz_in.get("options"), list) and len(quiz_in["options"]) >= 3
            else [
                short_fact_opt,
                "Es handelte sich nur um einen einmaligen Messfehler im Labor.",
                "Der Effekt existiert ausschließlich in theoretischen Rechnungen.",
                "Die Ursache wurde längst als gewöhnliche Alltagstäuschung abgehakt.",
            ]
        ),
        "correct_index": int(quiz_in.get("correct_index", 0) or 0),
        "explanation": str(
            quiz_in.get("explanation")
            or f"Genau dieser Befund steht im Zentrum dieser AuronOrigin-Episode ({chosen_pillar})."
        )[:320],
    }

    alt_titles_in = [str(t).strip() for t in (raw.get("alt_titles") or []) if str(t).strip()]
    if len(alt_titles_in) < 3:
        for cand in [
            f"Das ungelöste Rätsel hinter „{clean_quiz_subj}“"[:66],
            f"Warum „{clean_quiz_subj}“ jede gewohnte Erklärung sprengt"[:66],
            f"Was fast niemand über „{clean_quiz_subj}“ weiß"[:66],
        ]:
            if cand not in alt_titles_in and len(alt_titles_in) < 3:
                alt_titles_in.append(cand)

    return {
        "title": title,
        "alt_titles": alt_titles_in[:3],
        "thumbnail_text": thumb_text[:28],
        "thumbnail_variants": thumb_variants[:3],
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
                "Wissenschaft Dokumentation",
                "Rätsel der Physik",
                "Mysterium",
                "Doku Deutsch",
            ],
            "pinned_comment": str(
                seo_in.get("pinned_comment")
                or (
                    f"Hand aufs Herz zum Thema „{title}“: "
                    "Reicht für dich hier die klassische Alltagserklärung – oder blicken wir auf eine tiefere Ordnung? "
                    "Schreib deine Sicht unten in die Kommentare!"
                )
            ),
            "community_poll": {
                "question": str(poll_in.get("question") or f"Wie ordnest du das Rätsel um „{clean_quiz_subj}“ ein?"),
                "options": poll_in.get("options")
                or [
                    "Rein physikalisch lösbar – nur eine Frage der Zeit",
                    "Hinweis auf eine tiefere Ordnung unserer Realität",
                    "Genau die Verbindung aus beidem fasziniert mich!",
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
        f"In dieser AuronOrigin-Episode gehen wir ausschließlich einem einzigen Rätsel auf den Grund: „{topic}“ – "
        f"logisch aufgebaut, in klaren Bildern erzählt und bis zum entscheidenden Wendepunkt verfolgt.\n\n"
        f"▸ Themen-Säule: {pillar}\n"
        f"▸ Abonniere AuronOrigin für tiefgründige Dokumentationen zwischen Fakten und Mysterium.\n"
        f"▸ Instagram: @the.auronorigin | Kontakt: contact@auronorigin.world\n\n"
        f"#AuronOrigin #{pillar.replace('-', '')} #Dokumentation #Wissenschaft #Mysterium #DokuDeutsch"
    )


def _build_local_9min_18scene_story(
    *,
    core_subject: str,
    dossier: dict[str, Any] | None,
    editorial_mode: str,
    short_trigger: str,
) -> list[dict[str, Any]]:
    """Build a genuine 18-scene (~1,020+ words) 6-Act Open-Loop 9-minute documentary strictly on ONE topic."""
    steps = (dossier or {}).get("story_steps") or {}
    deep = (dossier or {}).get("deep_dive") or {}
    facts = [clean_german_sentence(f) for f in ((dossier or {}).get("verified_facts") or []) if is_pure_german(str(f))]

    hook_s = steps.get("hook") or f"Auf den ersten Blick wirkt das Thema {core_subject} fast vertraut – doch schon die erste genaue Messung legt einen tiefen Widerspruch frei."
    what_s = steps.get("what_is_it") or f"Im Zentrum steht dabei ein einziges Phänomen rund um {core_subject}, das sich mit gewöhnlichen Alltagsregeln kaum fassen lässt."
    how_s = steps.get("how_it_works") or "Untersucht man den genauen Ablauf im Detail, greifen kleinste Schritte mit einer Präzision ineinander, die selbst erfahrene Beobachter überrascht."
    why_s = steps.get("why_astonishing") or "Das Verblüffende daran ist, dass unabhängige Prüfungen immer wieder exakt denselben Befund bestätigen."
    meaning_s = steps.get("deeper_meaning") or "Je ruhiger man dieses Muster betrachtet, desto deutlicher zeigt sich hinter der Oberfläche unserer Alltagswelt eine tiefere Ordnung."

    open_loop_main = deep.get("open_loop_main") or "Doch der eigentliche Knackpunkt verbirgt sich an einer Stelle, die fast immer übersehen wird – und genau dort kippt jede bequeme Erklärung."
    analogy_s = deep.get("analogy") or "Man kann es sich vorstellen wie das Zifferblatt einer alten Uhr: Außen sehen wir nur den gleichmäßigen Zeiger, während im Verborgenen Dutzende Zahnräder lautlos ineinandergreifen."
    rehook_min2 = deep.get("rehook_min2") or "Bis zu genau diesem Punkt dachten selbst viele Fachleute, der Fall sei im Grunde erledigt. Doch als man einen entscheidenden Schritt weiterging, passierte etwas Unerwartetes."
    experiment_s = deep.get("experiment") or how_s
    mid_twist = deep.get("mid_twist") or "Mitten in der Auswertung tauchte plötzlich ein Befund auf, der jede vorschnelle Antwort auf den Kopf stellte."
    skeptic_s = deep.get("skeptic_check") or why_s
    payoff_s = deep.get("payoff") or "Damit löst sich unser Anfangsrätsel auf überraschende Weise: Nicht ein bloßer Messfehler steckt dahinter, sondern ein reales Prinzip der Natur."

    extra_wiki_1 = facts[0] if len(facts) > 0 and facts[0] not in (what_s, how_s) else f"Schon die grundlegende Einordnung von {core_subject} zeigt, warum Generationen von Forschern immer wieder genau an diesen einen Punkt zurückkehrten."
    extra_wiki_2 = facts[1] if len(facts) > 1 and facts[1] not in (what_s, how_s, extra_wiki_1) else "Entscheidend ist dabei nicht bloße Spekulation, sondern die nüchterne Wiederholbarkeit unter kontrollierten Bedingungen."

    tail_sig = " Auron out. Die Matrix wackelt. Bleib wach." if editorial_mode == "matrix_narrativ" else ""

    acts_blueprint: list[tuple[str, str, str, str, str]] = [
        # (phase, badge, headline, subline, narration ~56-64 words -> ~1,040 words across 18 scenes = ~9:00-9:20 min!)
        (
            "AKT I • COLD OPEN",
            "DER WIDERSPRUCH",
            short_trigger,
            core_subject[:54],
            f"{hook_s} Genau dieses Detail klingt im ersten Moment wie eine gewagte Behauptung – und doch beruht jedes einzelne Wort davon auf realen Messungen. Wer einmal verstanden hat, was hier tatsächlich vor sich geht, betrachtet unsere gewohnte Wirklichkeit von diesem Tag an mit völlig anderen Augen.",
        ),
        (
            "AKT I • OPEN LOOP",
            "DIE KERNFRAGE",
            "DAS OFFENE RÄTSEL",
            "Warum einfache Antworten scheitern",
            f"{open_loop_main} Um genau diese entscheidende Stelle wirklich zu durchschauen, müssen wir uns heute in keiner einzigen komplizierten Formel verlieren – wir folgen einfach ruhig, logisch und Schritt für Schritt einer einzigen Spur bis zu ihrer überraschenden Auflösung.",
        ),
        (
            "AKT II • FUNDAMENT",
            "KLAR ERKLÄRT",
            "WORUM ES WIRKLICH GEHT",
            "Ohne Fachsprache auf den Punkt",
            f"Beginnen wir ganz am sicheren Boden der Tatsachen. {what_s} Lässt man alle sperrigen Fachbegriffe für einen Augenblick weg, bleibt ein erstaunlich klarer und greifbarer Kern übrig, den sich wirklich jeder Mensch sofort bildhaft vor dem inneren Auge vorstellen kann.",
        ),
        (
            "AKT II • ALLTAGSBILD",
            "GREIFBARES BILD",
            "EINFACH VORGESTELLT",
            "Ein Vergleich aus unserer Welt",
            f"{analogy_s} Genau dieses einfache Bild aus unserem Alltag hilft uns gleich enorm weiter – denn es macht auf einen Schlag sichtbar, warum uns unser sonst so verlässliches Bauchgefühl im nächsten Schritt auf eine völlig falsche Fährte lockt.",
        ),
        (
            "AKT II • RE-HOOK",
            "WENDEPUNKT 1",
            "ALS DIE LOGIK KIPPTE",
            "Der Moment vor dem Durchbruch",
            f"{rehook_min2} Denn eine noch so einleuchtende Vermutung auf dem Papier reicht in der echten Forschung niemals aus. Alles hing nun an einer einzigen Frage: Was passiert, wenn man genau diese Annahme einem kompromisslosen Praxistest unterzieht?",
        ),
        (
            "AKT III • SPURENSUCHE",
            "DIE AUSGANGSLAGE",
            "DER BLICK INS DETAIL",
            core_subject[:54],
            f"{extra_wiki_1} Über lange Zeit fehlten schlicht die feinen Instrumente, um sauber in diesen Bereich vorzudringen. Erst als moderne Detektoren empfindlich genug wurden, ließ sich zum allerersten Mal direkt sichtbar machen, was bis dahin komplett im Dunkeln lag.",
        ),
        (
            "AKT III • EXPERIMENT",
            "DER BEWEISLAUF",
            "DER ENTSCHEIDENDE TEST",
            "Messung statt bloßer Theorie",
            f"{experiment_s} Jeder einzelne Schritt im Versuchsaufbau war dabei so präzise geplant, dass äußere Störungen von vornherein ausgeschlossen wurden. Gespannt richteten sich nun alle Augen auf die einlaufenden Messkurven – und auf das, was dort erschien.",
        ),
        (
            "AKT III • BEOBACHTUNG",
            "MESSDATEN",
            "WAS DIE DATEN ZEIGTEN",
            "Präzision bis ins Kleinste",
            f"{how_s} Und das wirklich Bemerkenswerte daran war: Es handelte sich um keinen einmaligen Zufallstreffer. Immer dann, wenn unabhängige Teams die Untersuchung unter denselben strengen Bedingungen wiederholten, trat exakt dasselbe klare Muster wieder hervor.",
        ),
        (
            "AKT III • HALBZEIT-TWIST",
            "DIE ANOMALIE",
            "DER MOMENT DES STAUNENS",
            "Hier bricht das gewohnte Bild",
            f"{mid_twist} Plötzlich stand eine Frage im Raum, der niemand mehr ausweichen konnte: Hatten sämtliche Messgeräte zur gleichen Zeit denselben raffinierten Streich gespielt – oder folgt die Natur hier tatsächlich einer tieferen Regel, die unserer Alltagserfahrung widerspricht?",
        ),
        (
            "AKT IV • SKEPTIKER-TEST",
            "KRITISCHE PRÜFUNG",
            "NUR EIN MESSFEHLER?",
            "Der härteste Gegentest",
            f"Jede seriöse Entdeckung muss zuerst durch das Feuer des Zweifels gehen. Deshalb suchten kritische Köpfe weltweit sofort nach übersehenen Fehlerquellen, nach kleinen Schwankungen im Material oder nach verborgenen Einflüssen aus der Umgebung. {extra_wiki_2}",
        ),
        (
            "AKT IV • AUSSCHLUSS",
            "HÄRTETEST BESTANDEN",
            "KEIN SCHLUPFLOCH MEHR",
            "Unabhängig bestätigt",
            f"{skeptic_s} Genau dieser Härtetest macht das Ergebnis heute so belastbar: Je strenger die Kontrollen wurden und je feiner die Sensoren hinschauten, desto deutlicher bestätigte sich der Befund, anstatt sich wie ein Irrtum aufzulösen.",
        ),
        (
            "AKT IV • VERTIEFUNG",
            "DER ZUSAMMENHANG",
            "WARUM WIR ES ÜBERSEHEN",
            core_subject[:54],
            f"{why_s} Im gewöhnlichen Alltag fällt uns davon nur deshalb nichts auf, weil unsere menschlichen Sinne für das schnelle Überleben im Großen gebaut wurden – und nicht für die stillen Gesetzmäßigkeiten hinter den Kulissen.",
        ),
        (
            "AKT IV • ZUSPITZUNG",
            "VOR DER AUFLÖSUNG",
            "DIE LETZTE SCHWELLE",
            "Zurück zur großen Anfangsfrage",
            "Und genau jetzt stehen wir unmittelbar vor der Antwort auf die große Frage, die wir ganz zu Beginn dieses Videos offengelassen haben: Wenn weder ein bloßer Messfehler noch eine einfache Täuschung dahintersteckt – wie fügt sich dieses Puzzle dann logisch zusammen?",
        ),
        (
            "AKT V • DER PAYOFF",
            "DIE AUFLÖSUNG",
            "DES RÄTSELS KERN",
            "Die Antwort auf den Cold Open",
            f"{payoff_s} Sobald man genau diesen einen ungewohnten Gedanken zulässt, fällt jedes Puzzleteil plötzlich sauber an seinen Platz – und aus einem scheinbaren Widerspruch wird eine erstaunlich klare Ordnung.",
        ),
        (
            "AKT V • KONSEQUENZ",
            "NEUES WELTBILD",
            "WAS SICH VERÄNDERT",
            "Hinter dem Sichtbaren",
            f"{meaning_s} Vieles von dem, was wir im täglichen Leben als starr, getrennt oder selbstverständlich hinnehmen, entpuppt sich bei genauer Betrachtung als ein präzise aufeinander abgestimmtes Gefüge.",
        ),
        (
            "AKT V • DEUTUNG",
            "AURON PERSPEKTIVE",
            "ORDNUNG STATT ZUFALL",
            "Fakten zuerst • Mystery als Deutung",
            f"Genau an dieser schmalen Schwelle zwischen nüchterner Messung und ehrlichem Staunen liegt für mich die zeitlose Kraft des Themas {core_subject}: Je tiefer die moderne Forschung gräbt, desto weniger gleicht unsere Welt einem blinden Zufall.",
        ),
        (
            "AKT VI • NACHHALL",
            "DER GEDANKE BLEIBT",
            "EIN STILLER MOMENT",
            "Was uns das Phänomen lehrt",
            "Vielleicht nehmen wir aus dieser Spurensuche vor allem eine stille Erkenntnis mit: Die größten Rätsel warten nicht erst am fernen Rand des Kosmos – sie wirken leise, zuverlässig und fast unbemerkt mitten in unserem eigenen Leben.",
        ),
        (
            "AKT VI • AUSBLICK",
            "DEINE SICHT",
            "ZUFALL ODER ORDNUNG?",
            "Schreib deine Sicht & bleib dran",
            f"Wie ordnest du diese Fakten für dich ein: Reicht hier die rein nüchterne Gleichung – oder blicken wir auf eine tiefere Architektur der Wirklichkeit? Schreib deine Gedanken unten in die Kommentare, abonniere AuronOrigin – und öffne direkt daneben das nächste Rätsel, das nahtlos hier anknüpft.{tail_sig}",
        ),
    ]

    motifs_pool = list(VISUAL_MOTIFS)
    random.shuffle(motifs_pool)
    motions = ["zoom_in", "pan_up", "zoom_out", "drift_right"]

    scenes: list[dict[str, Any]] = []
    for idx, (phase, badge, head, sub, narr) in enumerate(acts_blueprint):
        motif = motifs_pool[idx % len(motifs_pool)]
        scenes.append(
            {
                "scene_number": idx + 1,
                "phase": phase,
                "fact_badge": badge,
                "on_screen_headline": head,
                "on_screen_subline": sub,
                "narration": enforce_german_narration(narr, core_subject),
                "pause_after": 1.25 if idx in (1, 4, 8, 12, 13, 16) else 1.05,
                "visual_motif": motif,
                "visual_seed": random.randint(100_000, 99_999_999),
                "camera_motion": motions[idx % len(motions)],
                "glitch_transition": idx != len(acts_blueprint) - 1,
                "image_prompt_en": (
                    f"High-contrast cinematic AuronOrigin documentary still for {core_subject} ({head}), "
                    f"motif {motif.replace('_', ' ')}, luminous gold #D4AF37 focal glow against dark cosmic blue #1F2833 "
                    "and deep obsidian #0B0C10, 8k, no text"
                ),
            }
        )
    return scenes


def _pad_or_trim_scenes_to_count(
    scenes: list[dict[str, Any]],
    target_n: int,
    topic: str,
    dossier: dict[str, Any] | None,
    pillar: str,
) -> list[dict[str, Any]]:
    """Adjust scene count (2..30) while maintaining Open-Loop narrative progression on the SINGLE topic."""
    if len(scenes) == target_n:
        return scenes

    core_subject = str((dossier or {}).get("core_subject") or topic).strip()

    if len(scenes) > target_n and target_n >= 2:
        if target_n == 2:
            trimmed = [scenes[0], scenes[-1]]
        else:
            # Evenly sample middle narrative beats so Cold Open, Midpoint, Payoff, and Finale all survive!
            middle = scenes[1:-1]
            needed_mid = target_n - 2
            picked_mid = [
                middle[min(len(middle) - 1, int(round(i * (len(middle) - 1) / max(1, needed_mid - 1))))]
                for i in range(needed_mid)
            ] if needed_mid > 0 and middle else []
            trimmed = [scenes[0], *picked_mid, scenes[-1]]
        for i, sc in enumerate(trimmed):
            sc["scene_number"] = i + 1
        return trimmed

    deep = (dossier or {}).get("deep_dive") or {}
    used_narrs = {str(s.get("narration") or "").strip().lower() for s in scenes}
    rich_candidates = [
        deep.get("open_loop_main", ""),
        deep.get("analogy", ""),
        deep.get("rehook_min2", ""),
        deep.get("experiment", ""),
        deep.get("mid_twist", ""),
        deep.get("skeptic_check", ""),
        deep.get("payoff", ""),
        *[str(f) for f in ((dossier or {}).get("verified_facts") or [])],
    ]
    same_topic_beats = [
        enforce_german_narration(c, core_subject)
        for c in rich_candidates
        if c and is_pure_german(str(c)) and enforce_german_narration(c, core_subject).strip().lower() not in used_narrs
    ]

    motions = ["zoom_in", "zoom_out", "pan_up", "drift_right"]
    extra_motifs = list(VISUAL_MOTIFS)
    random.shuffle(extra_motifs)

    deepening_steps = [
        (
            "DIE OFFENE SPUR",
            "OPEN LOOP",
            f"Doch genau hier stellt sich beim Thema „{core_subject}“ die Frage, an der jede oberflächliche Antwort scheitert – und die uns direkt zum Kern führt.",
        ),
        (
            "GREIFBARES BILD",
            "ANSCHAULICH",
            f"Man kann sich „{core_subject}“ wie ein präzises Uhrwerk vorstellen, bei dem schon eine winzige Verschiebung das gesamte sichtbare Muster verändert.",
        ),
        (
            "DER HÄRTETEST",
            "PRÜFUNG",
            "Selbst als Skeptiker nach gewöhnlichen Messfehlern suchten, hielt genau dieser Befund jeder unabhängigen Nachprüfung stand.",
        ),
        (
            "DER WENDEPUNKT",
            "ANOMALIE",
            "An genau dieser Schwelle zeigt sich, warum unsere gewohnte Alltagsvorstellung nur die äußere Oberfläche der Wirklichkeit abbildet.",
        ),
        (
            "SCHLUSSSTEIN",
            "ERKENNTNIS",
            "Fügt man alle Beobachtungen ruhig zusammen, entsteht statt bloßem Zufall ein erstaunlich klares, logisches Gesamtbild.",
        ),
    ]

    out = list(scenes[:-1]) if scenes else []
    cta_scene = scenes[-1] if scenes else {
        "phase": "AUSBLICK",
        "fact_badge": "DEINE SICHT",
        "on_screen_headline": "ZUFALL ODER ORDNUNG?",
        "on_screen_subline": "Schreib es in die Kommentare ↓",
        "narration": "Was denkst du darüber – reiner Zufall oder eine tiefere Ordnung? Schreib deine Sicht in die Kommentare und entdecke direkt das nächste AuronOrigin-Rätsel.",
        "pause_after": 1.0,
        "visual_motif": "ouroboros_seal",
        "visual_seed": random.randint(100_000, 99_999_999),
        "camera_motion": "zoom_out",
        "glitch_transition": False,
    }

    pool_idx = 0
    while len(out) + 1 < target_n:
        head, badge, fallback_narr = deepening_steps[pool_idx % len(deepening_steps)]
        narr = same_topic_beats[pool_idx] if pool_idx < len(same_topic_beats) else fallback_narr
        seq_num = len(out) + 1
        motif = extra_motifs[pool_idx % len(extra_motifs)]
        out.append(
            {
                "scene_number": seq_num,
                "phase": f"KAPITEL {seq_num}",
                "fact_badge": badge,
                "on_screen_headline": head,
                "on_screen_subline": core_subject[:54].upper(),
                "narration": enforce_german_narration(narr, core_subject),
                "pause_after": 1.05,
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
    """High-CTR + Open-Loop single-topic storyteller when running locally without Arena API key."""
    target_n = resolve_target_scene_count(duration_target, scene_count)
    core_subject = str((dossier or {}).get("core_subject") or (dossier or {}).get("input_keyword") or topic).strip()
    matched_title = str((dossier or {}).get("topic") or topic).strip()
    steps = (dossier or {}).get("story_steps") or {}

    preset_trigger = _sanitize_thumb_trigger((dossier or {}).get("thumb_trigger") or "", "")
    if preset_trigger:
        short_trigger = preset_trigger
    else:
        short_trigger = "DAS WAHRE RÄTSEL"

    dossier_thumb_vars = (dossier or {}).get("thumb_variants") or [short_trigger, "KEIN ZUFALL?", "DER BEWEIS"]
    dossier_alt_titles = (dossier or {}).get("alt_titles") or [
        f"Das ungelöste Rätsel hinter „{core_subject}“"[:66],
        f"Warum „{core_subject}“ unser gewohntes Weltbild herausfordert"[:66],
        f"Was fast niemand über „{core_subject}“ weiß"[:66],
    ]

    if duration_target == "docu_540" or target_n >= 12:
        long_scenes_18 = _build_local_9min_18scene_story(
            core_subject=core_subject,
            dossier=dossier,
            editorial_mode=editorial_mode,
            short_trigger=short_trigger,
        )
        scenes = _pad_or_trim_scenes_to_count(long_scenes_18, target_n, core_subject, dossier, pillar)
    else:
        hook_line = enforce_german_narration(
            steps.get("hook")
            or f"Hinter {core_subject} verbirgt sich ein Befund, der auf den ersten Blick unmöglich scheint – und doch messbar bewiesen ist.",
            core_subject,
        )
        what_line = enforce_german_narration(
            steps.get("what_is_it")
            or f"Im Kern geht es bei {core_subject} um eine konkrete Beobachtung, die zeigt, wie präzise unsere Welt im Verborgenen geordnet ist.",
            core_subject,
        )
        how_line = enforce_german_narration(
            steps.get("how_it_works")
            or "Vereinfacht gesagt greifen dabei kleinste Abläufe so exakt ineinander, dass selbst modernste Messgeräte immer wieder dasselbe Muster zeigen.",
            core_subject,
        )
        why_line = enforce_german_narration(
            steps.get("why_astonishing")
            or "Das Erstaunliche daran ist: Unsere gewohnte Alltagsvorstellung reicht plötzlich nicht mehr aus, um dieses Ergebnis zu erklären.",
            core_subject,
        )
        meaning_line = enforce_german_narration(
            steps.get("deeper_meaning")
            or f"Genau deshalb lohnt sich der ruhige Blick auf {core_subject}: Manchmal verrät ein einziges Phänomen mehr über die Realität als tausend Schlagzeilen.",
            core_subject,
        )

        tail_sig = " Auron out. Die Matrix wackelt. Bleib wach." if editorial_mode == "matrix_narrativ" else ""
        cta_options = [
            f"Kanntest du diesen Befund schon, oder hat dich ein Detail überrascht? Schreib deine Sicht in die Kommentare und folge AuronOrigin.{tail_sig}",
            f"Reiner Zufall der Natur oder eine tiefere Ordnung? Teile deine Gedanken in den Kommentaren und abonniere AuronOrigin.{tail_sig}",
        ]

        motifs_pool = list(VISUAL_MOTIFS)
        random.shuffle(motifs_pool)

        base_scenes = [
            {
                "scene_number": 1,
                "phase": "COLD OPEN",
                "fact_badge": "DAS PARADOXON",
                "on_screen_headline": short_trigger,
                "on_screen_subline": core_subject[:54],
                "narration": hook_line,
                "pause_after": 0.96,
                "visual_motif": motifs_pool[0],
                "visual_seed": random.randint(100_000, 99_999_999),
                "camera_motion": "zoom_in",
                "glitch_transition": True,
                "image_prompt_en": f"High-contrast cosmic opening artwork focused strictly on {core_subject}, bright #D4AF37 gold focal object against dark steel blue #1F2833 and obsidian #0B0C10, cinematic 8k, no text",
            },
            {
                "scene_number": 2,
                "phase": "WORUM ES GEHT",
                "fact_badge": "KLARES BILD",
                "on_screen_headline": "WAS DAHINTERSTECKT",
                "on_screen_subline": "Anschaulich auf den Punkt",
                "narration": what_line,
                "pause_after": 0.96,
                "visual_motif": motifs_pool[1],
                "visual_seed": random.randint(100_000, 99_999_999),
                "camera_motion": "pan_up",
                "glitch_transition": True,
                "image_prompt_en": f"Clear visual metaphor illustrating {core_subject}, dark navy #1F2833 and golden #D4AF37 light rays, obsidian shadows #0B0C10, 8k, no text",
            },
            {
                "scene_number": 3,
                "phase": "DER ABLAUF",
                "fact_badge": "DIE MESSUNG",
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
                "phase": "DER PAYOFF",
                "fact_badge": "DER WENDEPUNKT",
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
                "phase": "IMPULS",
                "fact_badge": "DEINE MEINUNG",
                "on_screen_headline": "ZUFALL ODER ORDNUNG?",
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
        "alt_titles": dossier_alt_titles,
        "thumbnail_text": short_trigger,
        "thumbnail_variants": dossier_thumb_vars,
        "thumbnail_subtext": "",
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
    """Generate a High-CTR, High-Retention single-topic AuronOrigin blueprint via Arena Router."""
    clean_topic = (topic or "").strip()
    if not clean_topic:
        clean_topic = (dossier or {}).get("topic") or "Das Experiment, das Einstein bis zuletzt nicht glauben wollte"

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
    req_tokens = 12288 if target_n >= 12 else 8192

    if api_key:
        router_res = call_arena_router(
            api_key=api_key,
            system_prompt=sys_prompt,
            user_prompt=usr_prompt,
            gateway_url=cfg.get("arena_gateway_url", "https://api.preview.arena.ai"),
            model=cfg.get("arena_model", "coding-router-preview"),
            protocol=cfg.get("arena_protocol", "auto"),
            max_tokens=req_tokens,
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
    fallback["arena_warning"] = "Kein Arena API-Key gesetzt – fokussiertes High-CTR & Open-Loop Skript erstellt."
    fallback["prompts_for_browser_router"] = {
        "system_prompt": sys_prompt,
        "user_prompt": usr_prompt,
    }
    return fallback
