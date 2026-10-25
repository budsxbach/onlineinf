"""Autonomous German Current-Topic Discovery & Scientific Research Engine for AuronOrigin.

Given even a single keyword (e.g. 'Quantencomputer', 'Gizeh', 'Bewusstsein', 'James Webb')
or an open trend request, this module:
1. Queries current German-language news & science feeds (Google News DE Science/Forschung RSS,
   Deutschlandfunk Forschung / Tagesschau Wissen RSS) for real current headlines.
2. Queries German Wikipedia (de.wikipedia.org) deep article extracts and related subtopics.
3. Strictly filters out any English-language fragments so 100% of verified_facts are pure German.
4. Synthesizes a fresh, non-repetitive AuronOrigin editorial angle (avoiding recent history).
"""
from __future__ import annotations

import html
import random
import re
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any
from urllib.parse import quote_plus

import requests

from .config import load_history

HEADERS = {
    "User-Agent": "AuronOriginStudio/2.0 (Ubuntu Research Engine; de-DE)",
    "Accept-Language": "de-DE,de;q=0.9",
}

# English stopword detector to guarantee ZERO English sentences enter German narration/facts
_ENGLISH_STOPWORDS = re.compile(
    r"\b(the|and|with|from|that|this|which|their|there|these|those|between|through|"
    r"researchers|scientists|study|university|published|evidence|suggests|however|"
    r"because|while|during|without|within|quantum\s+computing|artificial\s+intelligence|"
    r"consciousness\s+is|ancient\s+egypt|black\s+hole|we\s+show|our\s+results)\b",
    flags=re.IGNORECASE,
)

_GERMAN_MARKERS = re.compile(
    r"\b(der|die|das|den|dem|des|ein|eine|einer|einem|einen|eines|und|oder|aber|doch|"
    r"in|im|ins|an|am|auf|aus|bei|mit|nach|seit|von|vom|vor|zu|zum|zur|über|unter|"
    r"durch|für|ohne|um|gegen|zwischen|während|sich|nicht|kein|keine|ist|sind|war|"
    r"waren|wird|werden|wurde|wurden|hat|haben|kann|können|muss|mehr|als|auch|es|er|"
    r"sie|wir|ihr|was|wie|wo|warum|wenn|weil|dass|ob|hier|dort|schon|bereits|immer|"
    r"noch|nur|heute|forscher|wissenschaftler|studie|daten|zeit|raum|energie)\b|"
    r"[äöüßÄÖÜ]|\b\w+(?:ung|keit|heit|schaft|isch|lich)\b",
    flags=re.IGNORECASE,
)


def is_pure_german(text: str) -> bool:
    """Return True only if text is clearly German and free of English sentence prose."""
    if not text or len(text.strip()) < 14:
        return False
    en_hits = len(_ENGLISH_STOPWORDS.findall(text))
    de_hits = len(_GERMAN_MARKERS.findall(text))
    if en_hits >= 2:
        return False
    if en_hits == 1 and de_hits < 4:
        return False
    return de_hits >= 2


def clean_german_sentence(text: str) -> str:
    """Strip HTML tags, publisher suffixes, URLs, and English parentheticals."""
    t = html.unescape(str(text or ""))
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"https?://\S+", "", t)
    # Remove trailing RSS publisher suffix like ' - Spektrum der Wissenschaft'
    t = re.sub(r"\s+[-–|]\s+[A-ZÄÖÜ][\w\s.&-]{2,45}$", "", t.strip())
    # Remove parentheticals containing English words
    t = re.sub(
        r"\((?:[^()]*\b(?:the|of|and|in|for|with|press|journal|review)\b[^()]*)\)",
        "",
        t,
        flags=re.IGNORECASE,
    )
    t = re.sub(r"\s+", " ", t).strip()
    return t


# Rich 100% German Knowledge & Angle Matrix for AuronOrigin's 3 Pillars
AURON_KNOWLEDGE_MATRIX: dict[str, dict[str, Any]] = {
    "Simulations-News": {
        "keywords": [
            "quanten", "atomuhr", "simulation", "zeitkristall", "ki", "agent", "physik",
            "licht", "beobachter", "doppelspalt", "qubit", "verschränkung", "algorithmus",
            "matrix", "hologramm", "raumzeit", "entropie", "computer", "james webb", "jwst",
            "teleskop", "schwarzes loch", "schwarze löcher", "dunkle materie", "dunkle energie",
            "kosmos", "universum", "galaxie", "cern", "teilchen", "gravitation", "zeit",
        ],
        "search_modifiers": [
            "Quantenphysik Forschung Entdeckung",
            "Astrophysik Weltraumteleskop Messung",
            "Künstliche Intelligenz Durchbruch Studie",
            "Raumzeit Atomuhr Experiment",
        ],
        "curated_facts": [
            "Physiker erzeugten in supraleitenden Quantenprozessoren stabile Zeitkristalle – einen Materiezustand, der periodisch im Takt schwingt, ohne dabei jemals Wärmeenergie aufzunehmen.",
            "Der Physik-Nobelpreis bestätigte durch Messungen an verschränkten Photonen: Unser Universum ist nicht lokal-realistisch – Eigenschaften entstehen messbar erst im Moment der Wechselwirkung.",
            "Optische Strontium-Atomuhren der neuesten Generation ticken so präzise, dass sie bereits bei einem Höhenunterschied von nur einem einzigen Millimeter die Verlangsamung der Zeit durch Gravitation messen.",
            "Aufnahmen des James-Webb-Weltraumteleskops zeigen massereiche, voll ausgebildete Galaxien wenige hundert Millionen Jahre nach dem Urknall – deutlich früher, als klassische Kosmologiemodelle erlaubten.",
            "Nach dem holografischen Prinzip der theoretischen Physik lässt sich die gesamte Informationsmenge eines dreidimensionalen Raumvolumens vollständig auf seiner zweidimensionalen Grenzfläche codieren.",
            "In geschlossenen Multi-Agenten-Experimenten entwickeln lernfähige KI-Systeme spontan komprimierte Kurzprotokolle, um komplexe Zustände effizienter auszutauschen als in menschlicher Sprache.",
            "Messungen der kosmischen Hintergrundstrahlung und aktueller Supernovae zeigen eine wachsende Diskrepanz bei der Expansionsrate des Kosmos – die sogenannte Hubble-Spannung stellt das Standardmodell infrage.",
            "Der Physiker Melvin Vopson formulierte das zweite Gesetz der Infodynamik: In isolierten Informationssystemen nimmt Informationsentropie ab oder bleibt konstant – genau wie bei Datenkompression im Computer.",
        ],
        "topic_angles": [
            "Warum neueste Messungen zu „{kw}“ Physiker zwingen, unsere Vorstellung von Raum und Zeit neu zu schreiben",
            "„{kw}“ im Faktencheck: Zeigt sich hier die Rechengrenze unserer physikalischen Realität?",
            "Rätselhafte Anomalie rund um „{kw}“: Was aktuelle Labordaten verraten – und wo die Erklärung endet",
            "„{kw}“ und der Code des Kosmos: Warum dieses Phänomen kein bloßer Zufall der Naturgesetze ist",
            "Neue Entdeckung bei „{kw}“: Wenn moderne Spitzenforschung wie ein Blick hinter die Matrix wirkt",
        ],
    },
    "Alte Codes": {
        "keywords": [
            "thoth", "seshat", "horus", "ägypten", "pyramide", "gizeh", "tempel",
            "hieroglyphen", "sumer", "keilschrift", "geometrie", "goldener schnitt",
            "fibonacci", "ouroboros", "hermetik", "stein", "megalith", "gobekli", "göbekli",
            "radar", "myonen", "antik", "archäologie", "maya", "inka", "atlantis", "bibliothek",
            "alexandria", "antikythera", "sternkarte", "orion", "sphinx",
        ],
        "search_modifiers": [
            "Archäologie Entdeckung Scan",
            "Ägyptologie Forschung Pyramide",
            "Antike Technologie Rätsel",
            "Göbekli Tepe Megalith Studie",
        ],
        "curated_facts": [
            "Das internationale ScanPyramids-Projekt wies mithilfe kosmischer Myonen-Tomographie über der Großen Galerie der Cheops-Pyramide zwei bislang völlig unberührte Hohlräume nach.",
            "Die Seitenflächen der Großen Pyramide von Gizeh sind mit einer Abweichung von weniger als einem Zwanzigstel Grad exakt nach den vier geografischen Himmelsrichtungen ausgerichtet.",
            "Die über elftausend Jahre alte Tempelanlage von Göbekli Tepe in Anatolien wurde von Jägern und Sammlern aus tonnenschweren Kalksteinpfeilern errichtet – Jahrtausende vor der Erfindung des Rades.",
            "Der antike Mechanismus von Antikythera berechnete bereits vor über zweitausend Jahren über mehr als dreißig ineinandergreifende Bronzézahnräder Sonnen- und Mondfinsternisse im Voraus.",
            "Im alten Ägypten galten Thoth und Seshat als Hüter der kosmischen Bibliothek: Schrift und Zahl wurden nicht als bloßes Werkzeug, sondern als schöpferische Architektur der Wirklichkeit verstanden.",
            "Akustische Messungen in der Königskammer aus Rosengranit in Gizeh zeigen ausgeprägte tieffrequente stehende Wellen, die exakt im Bereich menschlicher Brustkorb- und Gehirnresonanzen liegen.",
            "Römischer Meeresbeton aus Vulkanasche und Branntkalk heilt Mikrorisse bei Kontakt mit Salzwasser selbstständig – eine Materialformel, die erst moderne Röntgenspektroskopie entschlüsseln konnte.",
        ],
        "topic_angles": [
            "„{kw}“ neu vermessen: Was moderne High-Tech-Scans unter jahrtausendealtem Stein sichtbar machen",
            "Vergessene Ingenieurskunst bei „{kw}“: Warum selbst heutige Forscher vor einem Präzisions-Rätsel stehen",
            "Der verborgene Code von „{kw}“: Zufall der Geschichte oder mathematischer Bauplan?",
            "„{kw}“ zwischen Archäologie und Hightech: Welche Botschaft in den alten Maßen steckt",
            "Neue Spuren bei „{kw}“: Warum das älteste Wissen der Menschheit plötzlich wieder hochaktuell wird",
        ],
    },
    "Bewusstseins-Hacks": {
        "keywords": [
            "bewusstsein", "gehirn", "schlaf", "traum", "rem", "luzid", "klartraum",
            "meditation", "frequenz", "fokus", "aufmerksamkeit", "zeitgefühl",
            "dopamin", "neuro", "synapse", "wahrnehmung", "intuition", "gedächtnis",
            "herz", "biophotonen", "schumann", "nervensystem", "vagus", "unterbewusstsein",
            "psyche", "flow", "gedanken", "nahtod",
        ],
        "search_modifiers": [
            "Neurowissenschaft Gehirn Studie",
            "Schlafforschung Bewusstsein Experiment",
            "Kognitionswissenschaft Wahrnehmung",
            "Gehirnwellen MRT Forschung",
        ],
        "curated_facts": [
            "In mehreren unabhängigen Schlaflaboren beantworteten geübte Klarträumer während der nachgewiesenen REM-Schlafphase Rechenaufgaben in Echtzeit durch vereinbarte Augenbewegungen.",
            "Das menschliche Gehirn empfängt jede Sekunde Millionen Bits an Sinnesreizen, konstruiert unser bewusstes Erleben jedoch mit rund hundert Millisekunden Verzögerung als aktives Vorhersagemodell.",
            "Hochauflösende EEG-Studien belegen, dass das sogenannte Ruhezustandsnetzwerk des Gehirns in tiefer fokussierter Meditation messbar herunterfährt, während schnelle Gamma-Wellen synchronisieren.",
            "Während des Tiefschlafs erweitert sich das glymphatische System der Gehirnzellen um bis zu sechzig Prozent und spült Stoffwechselprodukte aus dem neuronalen Gewebe.",
            "Neurowissenschaftliche Messungen zeigen bereits mehrere hundert Millisekunden vor einer bewussten Willensentscheidung ein elektrisches Bereitschaftspotenzial in den motorischen Arealen.",
            "Wenn Menschen im Zustand höchster Konzentration die Zeit vergessen, schaltet der präfrontale Kortex energieintensive Selbstkontroll-Schleifen vorübergehend ab – der messbare Flow-Zustand entsteht.",
            "Ultraschwache Photonenemissionen – sogenannte Biophotonen – entstehen messbar bei Stoffwechselprozessen in lebenden Nervenzellen, wobei ihre funktionelle Rolle intensiv erforscht wird.",
        ],
        "topic_angles": [
            "„{kw}“ im Gehirnscanner: Warum deine Wahrnehmung ganz anders funktioniert, als du denkst",
            "Das Rätsel um „{kw}“: Was Neurowissenschaftler jetzt im menschlichen Bewusstsein gemessen haben",
            "„{kw}“ entschlüsselt: Wie dein Gehirn im Hintergrund deine Wirklichkeit konstruiert",
            "Verblüffender Befund zu „{kw}“: Wo die Grenze zwischen Gehirnchemie und Bewusstsein verschwimmt",
            "„{kw}“ als Bewusstseins-Schlüssel: Was aktuelle Schlaflabor- und MRT-Daten wirklich zeigen",
        ],
    },
}

TRENDING_FALLBACK_KEYWORDS = [
    ("Quantencomputer & Zeitkristalle", "Simulations-News"),
    ("James-Webb-Teleskop & frühe Galaxien", "Simulations-News"),
    ("Myonen-Scans der Cheops-Pyramide", "Alte Codes"),
    ("Klarträumen & Echtzeit-Signale aus dem Schlaf", "Bewusstseins-Hacks"),
    ("Optische Atomuhren & gekrümmte Zeit", "Simulations-News"),
    ("Göbekli Tepe & astronomische Steincodes", "Alte Codes"),
    ("KI-Agenten & emergente Geheimsprache", "Simulations-News"),
    ("Gehirn-Vorhersagemodell & 100-Millisekunden-Illusion", "Bewusstseins-Hacks"),
]


def detect_pillar(topic: str) -> str:
    low = (topic or "").lower()
    scores = {p: 0 for p in AURON_KNOWLEDGE_MATRIX}
    for pillar, data in AURON_KNOWLEDGE_MATRIX.items():
        for kw in data["keywords"]:
            if kw in low:
                scores[pillar] += 2
    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return random.choice(list(AURON_KNOWLEDGE_MATRIX.keys()))
    return best


def fetch_google_news_de(query: str, limit: int = 6) -> list[dict[str, str]]:
    """Fetch fresh German news headlines via Google News DE RSS."""
    out: list[dict[str, str]] = []
    try:
        q = f"{query} (Forschung OR Studie OR Wissenschaft OR Entdeckung OR Physik OR Archäologie OR Gehirn)"
        url = f"https://news.google.com/rss/search?q={quote_plus(q)}&hl=de&gl=DE&ceid=DE:de"
        resp = requests.get(url, headers=HEADERS, timeout=6)
        if resp.status_code != 200 or not resp.text.strip():
            return out
        root = ET.fromstring(resp.content)
        for item in root.findall(".//item"):
            raw_title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            pub_date = (item.findtext("pubDate") or "").strip()
            source_el = item.find("source")
            pub_name = (source_el.text or "").strip() if source_el is not None else "Wissenschafts-News DE"

            cleaned = clean_german_sentence(raw_title)
            if len(cleaned) >= 28 and is_pure_german(cleaned):
                out.append(
                    {
                        "source": f"Aktuell ({pub_name})",
                        "title": cleaned,
                        "snippet": f"Aktuelle Meldung ({pub_name}): {cleaned}.",
                        "url": link,
                        "published": pub_date[:16],
                    }
                )
            if len(out) >= limit:
                break
    except Exception:
        pass
    return out


def fetch_german_science_rss(keyword: str, limit: int = 4) -> list[dict[str, str]]:
    """Query public German science RSS feeds (Tagesschau Wissen / DLF Forschung) for matching or trending stories."""
    feeds = [
        ("Tagesschau Wissen", "https://www.tagesschau.de/wissen/index~rss2.xml"),
        ("Deutschlandfunk Forschung", "https://www.deutschlandfunk.de/forschung-aktuell-100.rss"),
    ]
    kw_tokens = [w.lower() for w in re.findall(r"[A-Za-zÄÖÜäöüß]{4,}", keyword or "")]
    matches: list[dict[str, str]] = []
    general: list[dict[str, str]] = []

    for label, url in feeds:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=5)
            if resp.status_code != 200:
                continue
            root = ET.fromstring(resp.content)
            for item in root.findall(".//item")[:15]:
                title = clean_german_sentence(item.findtext("title") or "")
                desc = clean_german_sentence(item.findtext("description") or "")
                link = (item.findtext("link") or "").strip()
                combined = f"{title}. {desc}".strip(". ")
                if not is_pure_german(combined):
                    continue
                entry = {
                    "source": label,
                    "title": title,
                    "snippet": combined[:290] + ("…" if len(combined) > 290 else ""),
                    "url": link,
                }
                low_c = combined.lower()
                if kw_tokens and any(tok in low_c for tok in kw_tokens):
                    matches.append(entry)
                else:
                    general.append(entry)
        except Exception:
            continue

    if matches:
        return matches[:limit]
    return general[: max(0, limit - 2)] if not kw_tokens else []


def fetch_wikipedia_de_deep(query: str, limit: int = 4) -> list[dict[str, str]]:
    """Fetch deep, pure-German paragraphs from de.wikipedia.org."""
    out: list[dict[str, str]] = []
    if not query.strip():
        return out
    try:
        search_resp = requests.get(
            "https://de.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srsearch": query,
                "srlimit": limit,
                "format": "json",
            },
            headers=HEADERS,
            timeout=6,
        )
        if search_resp.status_code != 200:
            return out
        hits = search_resp.json().get("query", {}).get("search", [])
        titles = [h.get("title", "") for h in hits if h.get("title")][:limit]
        if not titles:
            return out

        ext_resp = requests.get(
            "https://de.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "prop": "extracts",
                "exchars": 1200,
                "explaintext": 1,
                "titles": "|".join(titles),
                "format": "json",
            },
            headers=HEADERS,
            timeout=6,
        )
        if ext_resp.status_code != 200:
            return out
        pages = ext_resp.json().get("query", {}).get("pages", {})
        for page in pages.values():
            title = page.get("title", "").strip()
            extract = (page.get("extract") or "").strip()
            if not title or not extract:
                continue
            # Split extract into crisp informative German sentences
            sentences = [
                clean_german_sentence(s)
                for s in re.split(r"(?<=[.!?])\s+", extract)
                if 45 <= len(s.strip()) <= 280
            ]
            de_sents = [s for s in sentences if is_pure_german(s)]
            if not de_sents:
                continue
            # Pick up to 2 distinct factual sentences per Wikipedia article
            for chosen in de_sents[:2]:
                out.append(
                    {
                        "source": "Wikipedia DE",
                        "title": title,
                        "snippet": chosen,
                        "url": f"https://de.wikipedia.org/wiki/{quote_plus(title.replace(' ', '_'))}",
                    }
                )
    except Exception:
        pass
    return out


def _recent_titles_and_topics() -> set[str]:
    try:
        hist = load_history()
        seen: set[str] = set()
        for item in hist[:25]:
            if item.get("topic"):
                seen.add(str(item["topic"]).strip().lower())
            if item.get("title"):
                seen.add(str(item["title"]).strip().lower())
        return seen
    except Exception:
        return set()


def synthesize_editorial_topic(
    raw_input: str,
    pillar: str,
    news_items: list[dict[str, str]],
    wiki_items: list[dict[str, str]],
) -> tuple[str, str]:
    """Turn a short keyword (or empty input) into a fresh, specific German AuronOrigin topic angle.

    Returns (resolved_topic, discovery_reason).
    """
    cleaned_kw = re.sub(r"\s+", " ", (raw_input or "").strip())
    recent = _recent_titles_and_topics()

    # Case 1: Empty input -> autonomous trending pick
    if not cleaned_kw:
        candidates = list(TRENDING_FALLBACK_KEYWORDS)
        random.shuffle(candidates)
        kw_choice, pil = candidates[0]
        cleaned_kw = kw_choice
        pillar = pil

    words = cleaned_kw.split()
    is_short_keyword = len(words) <= 5

    # If live German news headlines were found for this keyword, anchor on a fresh news story!
    fresh_news = [
        n for n in news_items
        if n.get("title") and n["title"].strip().lower() not in recent
    ]
    if is_short_keyword and fresh_news:
        picked_news = random.choice(fresh_news[: min(4, len(fresh_news))])
        headline = picked_news["title"]
        resolved = f"{headline} – Was aktuelle Daten über {cleaned_kw} verraten"
        return resolved, f"Aktuelle Recherche ({picked_news['source']}): {headline}"

    # If user gave a short keyword (e.g. 'Pyramiden', 'Quantencomputer') without live RSS, craft a fresh angle
    if is_short_keyword:
        angles = list(AURON_KNOWLEDGE_MATRIX[pillar]["topic_angles"])
        random.shuffle(angles)
        # Incorporate a related subtopic from Wikipedia DE if available
        sub_hint = ""
        if wiki_items:
            distinct_titles = [
                w["title"]
                for w in wiki_items
                if w.get("title") and w["title"].lower() != cleaned_kw.lower()
            ]
            if distinct_titles:
                sub_hint = f" ({random.choice(distinct_titles[:3])})"
        for tmpl in angles:
            candidate = tmpl.format(kw=f"{cleaned_kw}{sub_hint}")
            if candidate.lower() not in recent:
                return candidate, f"Autonomer Themen-Fokus in Säule „{pillar}“"
        return angles[0].format(kw=cleaned_kw), f"Autonomer Themen-Fokus in Säule „{pillar}“"

    # User already entered a full detailed topic sentence
    return cleaned_kw, f"Direkt-Thema mit Tiefenrecherche in Säule „{pillar}“"


def run_topic_research(
    topic: str = "",
    *,
    pillar: str | None = None,
    editorial_mode: str = "fakten_mystery",
    browser_sources: list[dict[str, Any]] | None = None,
    arena_settings: dict[str, Any] | None = None,
    auto_expand_keyword: bool = True,
) -> dict[str, Any]:
    """Run parallel 100% German research & autonomous current-topic selection."""
    raw_query = (topic or "").strip()
    chosen_pillar = (
        pillar
        if (pillar and pillar in AURON_KNOWLEDGE_MATRIX)
        else (detect_pillar(raw_query) if raw_query else random.choice(list(AURON_KNOWLEDGE_MATRIX.keys())))
    )
    search_seed = raw_query if raw_query else random.choice(AURON_KNOWLEDGE_MATRIX[chosen_pillar]["search_modifiers"])

    news_hits: list[dict[str, str]] = []
    sci_rss_hits: list[dict[str, str]] = []
    wiki_hits: list[dict[str, str]] = []

    with ThreadPoolExecutor(max_workers=4) as pool:
        f_news = pool.submit(fetch_google_news_de, search_seed, 6)
        f_rss = pool.submit(fetch_german_science_rss, search_seed, 4)
        f_wiki = pool.submit(fetch_wikipedia_de_deep, search_seed, 4)
        for fut, bucket in ((f_news, news_hits), (f_rss, sci_rss_hits), (f_wiki, wiki_hits)):
            try:
                bucket.extend(fut.result(timeout=7))
            except Exception:
                pass

    # Filter optional browser-side sources strictly to pure German
    clean_browser_hits: list[dict[str, str]] = []
    for bs in browser_sources or []:
        if not isinstance(bs, dict):
            continue
        b_snip = clean_german_sentence(bs.get("summary") or bs.get("snippet") or "")
        b_title = clean_german_sentence(bs.get("title") or "")
        if b_snip and is_pure_german(b_snip):
            clean_browser_hits.append(
                {
                    "source": str(bs.get("source") or "Wikipedia DE"),
                    "title": b_title or search_seed,
                    "snippet": b_snip,
                    "url": str(bs.get("url") or ""),
                }
            )

    all_external = news_hits + sci_rss_hits + wiki_hits + clean_browser_hits

    if auto_expand_keyword:
        resolved_topic, discovery_note = synthesize_editorial_topic(
            raw_query, chosen_pillar, news_hits + sci_rss_hits, wiki_hits + clean_browser_hits
        )
    else:
        resolved_topic = raw_query or "Rätsel der Raumzeit & menschlichen Wahrnehmung"
        discovery_note = f"Säule „{chosen_pillar}“"

    # Assemble 100% pure-German verified_facts (randomized curated supplements prevent repetition)
    verified_facts: list[str] = []
    seen_snippets: set[str] = set()

    for hit in all_external:
        snip = clean_german_sentence(hit.get("snippet", ""))
        if snip and is_pure_german(snip) and snip.lower() not in seen_snippets:
            seen_snippets.add(snip.lower())
            verified_facts.append(snip)

    curated_pool = list(AURON_KNOWLEDGE_MATRIX[chosen_pillar]["curated_facts"])
    random.shuffle(curated_pool)
    for fact in curated_pool:
        if len(verified_facts) >= 7:
            break
        if fact.lower() not in seen_snippets:
            seen_snippets.add(fact.lower())
            verified_facts.append(fact)

    mystery_pool = [
        f"Wo die rein physikalische Messung zu „{raw_query or chosen_pillar}“ endet, stellt sich die Frage nach einer tieferen mathematischen Informations-Architektur.",
        "Immer mehr unabhängige Befunde deuten darauf hin, dass Information und Geometrie fundamentaler sein könnten als Raum und Materie selbst.",
        "Genau an dieser Schnittstelle zwischen Laborbefund und menschlicher Wahrnehmung entsteht der faszinierende Perspektivwechsel von AuronOrigin.",
        "Ob klassisches Naturgesetz oder emergenter Code: Die Präzision dieser Muster fordert unser Alltagsverständnis der Realität heraus.",
    ]
    random.shuffle(mystery_pool)

    ui_sources = [
        {
            "kind": h.get("source", "Quelle"),
            "title": h.get("title", resolved_topic),
            "url": h.get("url", ""),
        }
        for h in all_external[:8]
    ]
    if not ui_sources:
        ui_sources.append(
            {
                "kind": f"AuronOrigin Archiv • {chosen_pillar}",
                "title": resolved_topic,
                "url": "",
            }
        )

    return {
        "input_keyword": raw_query,
        "topic": resolved_topic,
        "headline_angle": resolved_topic,
        "discovery_note": discovery_note,
        "pillar": chosen_pillar,
        "editorial_mode": editorial_mode,
        "live_sources_count": len(all_external),
        "external_sources": all_external[:10],
        "sources": ui_sources,
        "verified_facts": verified_facts[:8],
        "mystery_interpretation": mystery_pool[:2],
    }
