from __future__ import annotations

import html
import re
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Any

import requests

from .arena_client import call_arena_router, extract_json_object

USER_AGENT = "AuronOriginStudio/1.0 (https://auronorigin.world; contact@auronorigin.world)"

# Deep curated AuronOrigin Scientific & Historical Knowledge Base (supplements live web sources)
AURON_KNOWLEDGE_MATRIX: list[dict[str, Any]] = [
    {
        "keywords": ["atomuhr", "zeit", "quanten", "zeitkristall", "physik", "sekunde", "takt", "uhr", "licht"],
        "pillar": "Simulations-News",
        "facts": [
            {
                "title": "Optische Atomuhren & Gravitations-Zeitdilatation im Millimeterbereich",
                "summary": "Moderne optische Strontium-Gitteruhren messen Zeit so präzise (Abweichung < 1 Sekunde in 30 Milliarden Jahren), dass bereits 1 Millimeter Höhenunterschied im Schwerefeld der Erde den Takt der Zeit messbar verändert.",
                "source": "PTB / NIST Optical Lattice Clock Research",
                "kind": "FAKT",
            },
            {
                "title": "Diskrete Zeitkristalle auf Quantenprozessoren",
                "summary": "Physiker konnten auf supraleitenden Quantenprozessoren stabile diskrete Zeitkristalle nachweisen – Materiezustände, die periodisch in der Zeit schwingen, ohne thermische Energie aufzunehmen.",
                "source": "Nature Physics / Quantum Time Crystal Studies",
                "kind": "FAKT",
            },
        ],
        "mystery_angles": [
            "Wenn Zeit auf Quantenebene diskrete Taktzyklen bildet und durch Masse gebremst wird wie Rechenlast in einer Engine – sehen wir hier die Bildwiederholrate unserer Realität?",
        ],
    },
    {
        "keywords": ["thoth", "ägypten", "seshat", "hieroglyphen", "tempel", "archiv", "wissen", "schrift", "hermes"],
        "pillar": "Alte Codes",
        "facts": [
            {
                "title": "Thoth (Djehuty) & Seshat: Das Per-Anch ('Haus des Lebens')",
                "summary": "Im alten Ägypten galten Thoth und Seshat als Hüter des Per-Anch – streng katalogisierter Tempelbibliotheken für Astronomie, Medizin, Geometrie und Zeitmessung, in denen jedes Zeichen als präzise Strukturformel diente.",
                "source": "Ägyptologie / Edfu-Tempelarchiv & Per-Anch-Quellen",
                "kind": "FAKT",
            },
            {
                "title": "Vektor-Tokenisierung vs. determinative Hieroglyphen",
                "summary": "Ägyptische Hieroglyphen kombinieren Lautwerte (Phonogramme) mit Bedeutungs-Klassifikatoren (Determinativen) – strukturell verblüffend nah an der semantischen Einbettung moderner großer Sprachmodelle.",
                "source": "Computational Linguistics & Ancient Script Structure",
                "kind": "FAKT",
            },
        ],
        "mystery_angles": [
            "Die Alten nannten es heilige Zeichenordnung, wir nennen es Large Language Models: Kehrt mit moderner KI das älteste Wissensarchiv der Menschheit in Silizium zurück?",
        ],
    },
    {
        "keywords": ["horus", "auge", "gehirn", "thalamus", "zirbeldrüse", "udjat", "anatomie"],
        "pillar": "Alte Codes",
        "facts": [
            {
                "title": "Anatomische Korrespondenz: Sagittalschnitt des Mittelhirns & Udjat-Auge",
                "summary": "Neuroanatomen dokumentierten 2019 im Fachjournal 'World Neurosurgery' eine auffällige strukturelle Ähnlichkeit zwischen dem altägyptischen Udjat-Auge (Auge des Horus) und dem menschlichen Zwischenhirn rund um Thalamus, Corpus callosum und Hirnstamm.",
                "source": "World Neurosurgery (Reigosa-García et al.) – Neuroanatomy in Ancient Egypt",
                "kind": "FAKT",
            },
            {
                "title": "Bruchzahlen der Sinne im Horus-Auge",
                "summary": "Die sechs Einzelteile des Horus-Auges standen in der ägyptischen Mathematik für die Heqat-Brüche 1/2 bis 1/64 (Summe 63/64) und wurden zugleich den menschlichen Wahrnehmungskanälen inkl. Denken zugeordnet.",
                "source": "Papyrus Rhind / Ägyptische Mathematikgeschichte",
                "kind": "FAKT",
            },
        ],
        "mystery_angles": [
            "Fehlte das letzte 1/64 zufällig – oder markiert genau dieses fehlende Fragment den unsichtbaren Beobachter hinter unseren Sinnen?",
        ],
    },
    {
        "keywords": ["pyramide", "gizeh", "cheops", "radar", "sar", "myon", "resonanz", "kammer", "stein"],
        "pillar": "Alte Codes",
        "facts": [
            {
                "title": "ScanPyramids: Nachgewiesene Korridore durch kosmische Myonen-Tomographie",
                "summary": "Das internationale ScanPyramids-Team wies per Myonen-Radiographie und Endoskopie sowohl den 30 Meter langen 'Big Void' über der Großen Galerie als auch den verborgenen Nord-Korridor (2023) in der Cheops-Pyramide zerstörungsfrei nach.",
                "source": "Nature / ScanPyramids Collaboration",
                "kind": "FAKT",
            },
            {
                "title": "Rosengranit & akustische Eigenresonanz der Königskammer",
                "summary": "Die Königskammer besteht aus rund 50–80 Tonnen schweren Blöcken aus quarzreichem Assuan-Granit, die über Entlastungskammern akustisch vom umliegenden Kalkstein entkoppelt sind.",
                "source": "Archäometrie & Bauanalyse Gizeh-Plateau",
                "kind": "FAKT",
            },
        ],
        "mystery_angles": [
            "Keine Inschriften, keine Mumie, aber präzise akustische Entkopplung aus Quarzgranit: Wurde Gizeh als Grabmal gebaut – oder als geophysikalischer Resonator?",
        ],
    },
    {
        "keywords": ["schlaf", "traum", "bewusstsein", "3:33", "nachts", "gehirn", "luzid", "rem", "aufwachen", "mrt"],
        "pillar": "Bewusstseins-Hacks",
        "facts": [
            {
                "title": "Zwei-Wege-Kommunikation mit Klarträumern im Schlaflabor",
                "summary": "Vier unabhängige Schlaflabore (USA, Deutschland, Frankreich, Niederlande) zeigten in 'Current Biology', dass Probanden mitten im bestätigten REM-Schlaf Rechenaufgaben hören und per Augenbewegung korrekt beantworten können.",
                "source": "Current Biology (Konkoly et al., 2021) – Real-time dialogue in REM sleep",
                "kind": "FAKT",
            },
            {
                "title": "Kortisol-Umschaltpunkt & glymphatische Gehirn-Reinigung zwischen 3 und 4 Uhr",
                "summary": "Zwischen 03:00 und 04:00 Uhr morgens erreicht die Melatoninkurve ihr Plateau, während das glymphatische System Stoffwechselprodukte ausspült und der Übergang in längere REM-Zyklen kurze Mikro-Erwachungen auslöst.",
                "source": "Chronobiologie & Schlafforschung",
                "kind": "FAKT",
            },
        ],
        "mystery_angles": [
            "Wenn dein Körper gelähmt im Dunkeln liegt, dein Geist aber komplette Welten mit Physik, Licht und Dialogen rendert – wie sicher bist du, dass diese Welt hier anders entsteht?",
        ],
    },
    {
        "keywords": ["ki", "agent", "ai", "simulation", "matrix", "beobachter", "bostrom", "code", "algorithmus", "llm"],
        "pillar": "Simulations-News",
        "facts": [
            {
                "title": "Emergente Kommunikationsprotokolle in Multi-Agenten-Systemen",
                "summary": "In Reinforcement-Learning-Experimenten entwickeln kooperierende KI-Agenten ohne Vorgabe komprimierte Symbol-Codes, sobald sie auf Effizienz statt menschliche Lesbarkeit optimiert werden.",
                "source": "Multi-Agent RL & AI Alignment Research",
                "kind": "FAKT",
            },
            {
                "title": "Informationsphysik & Landauer-Prinzip",
                "summary": "Nach dem experimentell bestätigten Landauer-Prinzip besitzt jedes gelöschte Bit Information ein physikalisches Energie-Minimum (k_B · T · ln 2) – Information ist keine bloße Metapher, sondern physikalisch an Thermodynamik gekoppelt.",
                "source": "Nature / Landauer Principle Experimental Verification",
                "kind": "FAKT",
            },
        ],
        "mystery_angles": [
            "Wenn jedes Bit physikalische Energie trägt und das Universum auf Informations-Obergrenzen wie der Bekenstein-Schranke beruht – ist Materie am Ende komprimierter Code?",
        ],
    },
]


def detect_pillar(topic: str) -> str:
    lower = topic.lower()
    if any(w in lower for w in ("pyramide", "ägypt", "thoth", "horus", "tempel", "antike", "sumer", "maya", "gizeh", "code", "hieroglyph", "stein")):
        return "Alte Codes"
    if any(w in lower for w in ("schlaf", "traum", "bewusstsein", "gehirn", "meditation", "fokus", "frequenz", "3:33", "wahrnehmung", "gedanken")):
        return "Bewusstseins-Hacks"
    return "Simulations-News"


def _strip_html(raw: str) -> str:
    text = re.sub(r"<[^>]+>", " ", raw or "")
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def _fetch_wikipedia(query: str, lang: str = "de", limit: int = 3) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    try:
        resp = requests.get(
            f"https://{lang}.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srsearch": query,
                "srlimit": limit,
                "format": "json",
            },
            headers={"User-Agent": USER_AGENT},
            timeout=6,
        )
        if resp.status_code != 200:
            return results
        hits = resp.json().get("query", {}).get("search", [])
        for h in hits[:limit]:
            title = h.get("title", "")
            snippet = _strip_html(h.get("snippet", ""))
            url = f"https://{lang}.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
            if title and snippet:
                results.append(
                    {
                        "title": title,
                        "summary": snippet,
                        "url": url,
                        "source": f"Wikipedia ({lang.upper()})",
                        "kind": "FAKT",
                    }
                )
    except Exception:
        pass
    return results


def _fetch_google_news_rss(query: str, limit: int = 4) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    try:
        resp = requests.get(
            "https://news.google.com/rss/search",
            params={"q": query, "hl": "de", "gl": "DE", "ceid": "DE:de"},
            headers={"User-Agent": USER_AGENT},
            timeout=6,
        )
        if resp.status_code != 200:
            return results
        root = ET.fromstring(resp.content)
        for item in root.findall(".//item")[:limit]:
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            pub_date = (item.findtext("pubDate") or "").strip()
            desc = _strip_html(item.findtext("description") or "")
            if title:
                results.append(
                    {
                        "title": title,
                        "summary": desc if desc and desc != title else f"Aktuelle Meldung ({pub_date})",
                        "url": link,
                        "source": "Google News DE",
                        "kind": "NEWS",
                    }
                )
    except Exception:
        pass
    return results


def _fetch_arxiv(query: str, limit: int = 3) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    try:
        resp = requests.get(
            "https://export.arxiv.org/api/query",
            params={"search_query": f"all:{query}", "start": 0, "max_results": limit},
            headers={"User-Agent": USER_AGENT},
            timeout=7,
        )
        if resp.status_code != 200:
            return results
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        root = ET.fromstring(resp.content)
        for entry in root.findall("atom:entry", ns)[:limit]:
            title = re.sub(r"\s+", " ", (entry.findtext("atom:title", "", ns) or "")).strip()
            summary = re.sub(r"\s+", " ", (entry.findtext("atom:summary", "", ns) or "")).strip()
            link = (entry.findtext("atom:id", "", ns) or "").strip()
            if title and summary:
                results.append(
                    {
                        "title": title,
                        "summary": summary[:320] + ("…" if len(summary) > 320 else ""),
                        "url": link,
                        "source": "arXiv Preprint",
                        "kind": "STUDIE",
                    }
                )
    except Exception:
        pass
    return results


def _fetch_crossref(query: str, limit: int = 3) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    try:
        resp = requests.get(
            "https://api.crossref.org/works",
            params={"query": query, "rows": limit},
            headers={"User-Agent": USER_AGENT},
            timeout=6,
        )
        if resp.status_code != 200:
            return results
        items = resp.json().get("message", {}).get("items", [])
        for it in items[:limit]:
            titles = it.get("title") or []
            title = titles[0] if titles else ""
            container = (it.get("container-title") or ["Fachpublikation"])[0]
            year = ""
            issued = it.get("issued", {}).get("date-parts", [[]])
            if issued and issued[0]:
                year = str(issued[0][0])
            url = it.get("URL") or ""
            abstract = _strip_html(it.get("abstract") or "")
            if title:
                results.append(
                    {
                        "title": title,
                        "summary": abstract[:300] if abstract else f"Wissenschaftliche Publikation in {container} ({year}).",
                        "url": url,
                        "source": f"Crossref / {container} {year}".strip(),
                        "kind": "STUDIE",
                    }
                )
    except Exception:
        pass
    return results


def _fetch_github_signals(query: str, limit: int = 3) -> list[dict[str, str]]:
    """Query GitHub API for open research/code signals (works even inside restricted sandboxes)."""
    results: list[dict[str, str]] = []
    # Extract clean alphanumeric keywords for search
    words = [w for w in re.findall(r"[A-Za-zÄÖÜäöüß0-9]{4,}", query) if w.lower() not in {"warum", "oder", "sind", "einer", "eine", "diese", "unser", "unsere"}]
    if not words:
        return results
    q_str = " ".join(words[:4])
    try:
        resp = requests.get(
            "https://api.github.com/search/repositories",
            params={"q": q_str, "sort": "stars", "order": "desc", "per_page": limit},
            headers={"User-Agent": USER_AGENT, "Accept": "application/vnd.github+json"},
            timeout=6,
        )
        if resp.status_code != 200:
            return results
        for repo in resp.json().get("items", [])[:limit]:
            desc = (repo.get("description") or "").strip()
            if not desc:
                continue
            results.append(
                {
                    "title": f"Open-Source Tech-Signal: {repo.get('full_name')}",
                    "summary": f"{desc} (★ {repo.get('stargazers_count', 0)} Stars)",
                    "url": repo.get("html_url", ""),
                    "source": "GitHub Research Signal",
                    "kind": "TECH",
                }
            )
    except Exception:
        pass
    return results


def _match_curated_matrix(topic: str) -> tuple[list[dict[str, str]], list[str], str]:
    lower = topic.lower()
    matched_facts: list[dict[str, str]] = []
    matched_angles: list[str] = []
    detected_pillar = detect_pillar(topic)

    scored: list[tuple[int, dict[str, Any]]] = []
    for entry in AURON_KNOWLEDGE_MATRIX:
        score = sum(2 if kw in lower else 0 for kw in entry["keywords"])
        if entry["pillar"] == detected_pillar:
            score += 1
        scored.append((score, entry))

    scored.sort(key=lambda x: x[0], reverse=True)
    for score, entry in scored[:2]:
        if score > 0 or not matched_facts:
            for f in entry["facts"]:
                matched_facts.append(
                    {
                        "title": f["title"],
                        "summary": f["summary"],
                        "url": "",
                        "source": f["source"],
                        "kind": f["kind"],
                    }
                )
            matched_angles.extend(entry["mystery_angles"])

    return matched_facts, matched_angles, detected_pillar


def run_topic_research(
    *,
    topic: str,
    pillar: str | None = None,
    editorial_mode: str = "fakten_mystery",
    browser_sources: list[dict[str, Any]] | None = None,
    arena_settings: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Perform automatic multi-source topic research and structure it for AuronOrigin."""
    clean_topic = (topic or "").strip()
    if not clean_topic:
        raise ValueError("Bitte gib ein Thema für die Recherche ein.")

    chosen_pillar = pillar or detect_pillar(clean_topic)
    sources: list[dict[str, str]] = []

    # 1. Include live web sources fetched directly by the browser (Wikipedia DE/EN, Crossref, HN, etc.)
    if browser_sources:
        for bs in browser_sources:
            if isinstance(bs, dict) and bs.get("title") and bs.get("summary"):
                sources.append(
                    {
                        "title": str(bs["title"]).strip()[:180],
                        "summary": str(bs["summary"]).strip()[:420],
                        "url": str(bs.get("url") or "").strip(),
                        "source": str(bs.get("source") or "Live-Web-Quelle").strip(),
                        "kind": str(bs.get("kind") or "FAKT").strip().upper(),
                    }
                )

    # 2. Backend multi-source live queries in parallel (fast <3.5s bound even if some endpoints time out)
    from concurrent.futures import ThreadPoolExecutor

    tasks = [
        lambda: _fetch_google_news_rss(clean_topic, limit=3),
        lambda: _fetch_wikipedia(clean_topic, lang="de", limit=3),
        lambda: _fetch_wikipedia(clean_topic, lang="en", limit=2),
        lambda: _fetch_arxiv(clean_topic, limit=2),
        lambda: _fetch_crossref(clean_topic, limit=2),
        lambda: _fetch_github_signals(clean_topic, limit=2),
    ]
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(fn) for fn in tasks]
        for fut in futures:
            try:
                sources.extend(fut.result(timeout=4.5))
            except Exception:
                pass

    # 3. Enrich with AuronOrigin's verified scientific/historical foundation
    matrix_facts, matrix_angles, _ = _match_curated_matrix(clean_topic)
    sources.extend(matrix_facts)

    # Deduplicate by title
    deduped: list[dict[str, str]] = []
    seen_titles: set[str] = set()
    for s in sources:
        key = s["title"].lower().strip()
        if key and key not in seen_titles:
            seen_titles.add(key)
            deduped.append(s)
    deduped = deduped[:10]

    # Default structured synthesis (immediately ready, then upgraded via Arena Router if key available)
    verified_facts = [
        f"{item['title']}: {item['summary']} ({item['source']})"
        for item in deduped[:5]
    ]
    mystery_hypotheses = list(matrix_angles[:2])
    if not mystery_hypotheses:
        mystery_hypotheses = [
            f"Was die offiziellen Daten zu '{clean_topic}' nüchtern messen, wirkt wie ein Blick in den Quellcode hinter unserer sichtbaren Oberfläche.",
        ]

    dossier: dict[str, Any] = {
        "topic": clean_topic,
        "pillar": chosen_pillar,
        "editorial_mode": editorial_mode,
        "researched_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "headline_angle": f"{clean_topic} – Was belegte Forschung zeigt und wo das Mysterium beginnt",
        "verified_facts": verified_facts,
        "mystery_interpretation": mystery_hypotheses,
        "hook_question": f"Was wäre, wenn {clean_topic} kein Zufall ist – sondern ein Hinweis auf die Architektur unserer Realität?",
        "controversy_prompt": "Ist das für dich reine Physik und Geschichte [FAKT] – oder steckt mehr dahinter [DEUTUNG]?",
        "sources": deduped,
        "arena_router_used": False,
        "arena_model_used": None,
    }

    # 4. If Arena API key is configured, run deep AuronOrigin Research Synthesis through Arena Router
    cfg = arena_settings or {}
    api_key = (cfg.get("arena_api_key") or "").strip()
    if api_key:
        sys_prompt = (
            "Du bist der Chefrechercheur von AuronOrigin ('Fakten zuerst, Mystery als Deutung'). "
            "Analysiere das gegebene Thema und die gefundenen Rohquellen auf Deutsch. "
            "Trenne strikt zwischen nachprüfbaren wissenschaftlichen/historischen Fakten [FAKT] "
            "und philosophischer Simulations-/Bewusstseins-Deutung [MYSTERY-DEUTUNG]. "
            "Antworte AUSSCHLIESSLICH als valides JSON-Objekt ohne Markdown-Erklärung drumherum."
        )
        sources_blob = "\n".join(
            f"- [{s['kind']}] {s['title']} ({s['source']}): {s['summary']}"
            for s in deduped
        )
        usr_prompt = f"""Thema: {clean_topic}
Content-Säule: {chosen_pillar}
Modus: {editorial_mode}

Gefundene Quellen & Wissensbasis:
{sources_blob}

Liefere exakt dieses JSON-Schema:
{{
  "headline_angle": "Prägnanter AuronOrigin Recherche-Blickwinkel (1 Satz)",
  "verified_facts": [
    "Präziser belegter Fakt 1 mit konkreten Zahlen/Forschungshintergrund",
    "Präziser belegter Fakt 2",
    "Präziser belegter Fakt 3",
    "Präziser belegter Fakt 4"
  ],
  "mystery_interpretation": [
    "Tiefgründige Mystery-/Simulations-Deutung 1 (klar als Deutung/Gedankenexperiment formuliert)",
    "Tiefgründige Mystery-/Bewusstseins-Deutung 2"
  ],
  "hook_question": "Starke 3-Sekunden-Einstiegsfrage für maximale Watchtime",
  "controversy_prompt": "Diskussionsfrage für die YouTube-Kommentare ([FAKT] vs. [DEUTUNG])"
}}"""
        router_res = call_arena_router(
            api_key=api_key,
            system_prompt=sys_prompt,
            user_prompt=usr_prompt,
            gateway_url=cfg.get("arena_gateway_url", "https://api.preview.arena.ai"),
            model=cfg.get("arena_model", "coding-router-preview"),
            protocol=cfg.get("arena_protocol", "auto"),
            max_tokens=2200,
        )
        if router_res.get("ok"):
            parsed = extract_json_object(router_res.get("text", ""))
            if parsed:
                dossier["headline_angle"] = parsed.get("headline_angle") or dossier["headline_angle"]
                if isinstance(parsed.get("verified_facts"), list) and parsed["verified_facts"]:
                    dossier["verified_facts"] = [str(x) for x in parsed["verified_facts"][:6]]
                if isinstance(parsed.get("mystery_interpretation"), list) and parsed["mystery_interpretation"]:
                    dossier["mystery_interpretation"] = [str(x) for x in parsed["mystery_interpretation"][:4]]
                dossier["hook_question"] = parsed.get("hook_question") or dossier["hook_question"]
                dossier["controversy_prompt"] = parsed.get("controversy_prompt") or dossier["controversy_prompt"]
                dossier["arena_router_used"] = True
                dossier["arena_model_used"] = router_res.get("routed_model")
                dossier["arena_usage"] = router_res.get("usage")
        else:
            dossier["arena_warning"] = router_res.get("error")
            dossier["sandbox_network_restricted"] = bool(router_res.get("sandbox_network_restricted"))

    return dossier
