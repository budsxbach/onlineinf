"""Single-Topic Focused German Research Engine for AuronOrigin.

Core Editorial Principle (1 Video = 1 Thema):
- Never mix multiple news items or unrelated facts in a single dossier.
- Lock onto ONE concrete phenomenon, discovery, or mystery matching the title.
- Gather coherent, logically connected background points (What is it? How does it work
  in simple terms? What was observed? Why is it astonishing?) exclusively about THAT ONE topic.
- Strictly enforce 100% natural, accessible German without news-ticker prefixes.
"""
from __future__ import annotations

import html
import random
import re
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from typing import Any
from urllib.parse import quote_plus

import requests

from .config import load_history

HEADERS = {
    "User-Agent": "AuronOriginStudio/2.5 (Ubuntu Single-Topic Research Engine; de-DE)",
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
    """Strip HTML tags, publisher suffixes, news-ticker prefixes, phonetic brackets, and URLs."""
    t = html.unescape(str(text or ""))
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"https?://\S+", "", t)
    # Remove news-ticker prefixes if present
    t = re.sub(r"^(?:Aktuelle\s+Meldung|Eilmeldung|News|Bericht)\s*(?:\([^)]*\))?\s*:\s*", "", t.strip(), flags=re.I)
    # Remove trailing RSS publisher suffix like ' - Spektrum der Wissenschaft'
    t = re.sub(r"\s+[-–|]\s+[A-ZÄÖÜ][\w\s.&-]{2,45}$", "", t.strip())
    # Remove Wikipedia IPA / pronunciation / Greek-Latin etymology parentheticals for smooth comprehension
    t = re.sub(r"\([^()]*[ˈˌːəʊɪɔɛʃʒθð][^()]*\)", "", t)
    t = re.sub(
        r"\((?:[^()]*\b(?:the|of|and|in|for|with|press|journal|review|altgriechisch|lateinisch|englisch)\b[^()]*)\)",
        "",
        t,
        flags=re.IGNORECASE,
    )
    t = re.sub(r"\s+", " ", t).strip()
    return t


PILLAR_KEYWORDS: dict[str, list[str]] = {
    "Simulations-News": [
        "quanten", "atomuhr", "simulation", "zeitkristall", "ki", "agent", "physik",
        "licht", "beobachter", "doppelspalt", "qubit", "verschränkung", "algorithmus",
        "matrix", "hologramm", "raumzeit", "entropie", "computer", "james webb", "jwst",
        "teleskop", "schwarzes loch", "schwarze löcher", "ereignishorizont", "dunkle materie",
        "dunkle energie", "kosmos", "universum", "galaxie", "cern", "teilchen", "gravitation", "zeit",
    ],
    "Alte Codes": [
        "thoth", "seshat", "horus", "ägypten", "pyramide", "cheops", "gizeh", "tempel",
        "hieroglyphen", "sumer", "keilschrift", "geometrie", "goldener schnitt",
        "fibonacci", "ouroboros", "hermetik", "stein", "megalith", "gobekli", "göbekli",
        "radar", "myonen", "antik", "archäologie", "maya", "inka", "atlantis", "bibliothek",
        "alexandria", "antikythera", "sternkarte", "orion", "sphinx",
    ],
    "Bewusstseins-Hacks": [
        "bewusstsein", "gehirn", "schlaf", "traum", "rem", "luzid", "klartraum",
        "meditation", "frequenz", "fokus", "aufmerksamkeit", "zeitgefühl",
        "dopamin", "neuro", "synapse", "wahrnehmung", "intuition", "gedächtnis",
        "herz", "biophotonen", "schumann", "nervensystem", "vagus", "unterbewusstsein",
        "psyche", "flow", "gedanken", "nahtod", "deja", "déjà",
    ],
}


# Self-contained Single-Topic Monographs: Each entry covers EXCLUSIVELY ONE topic in short, logical, everyday German (~18-24 words per step).
SINGLE_TOPIC_MONOGRAPHS: list[dict[str, Any]] = [
    {
        "id": "quantenverschraenkung",
        "pillar": "Simulations-News",
        "match_terms": ["verschränkung", "quantenverschränkung", "spukhaft", "photon"],
        "core_subject": "Quantenverschränkung",
        "titles": [
            "Quantenverschränkung einfach erklärt: Zwei Teilchen, ein Zustand",
            "Das Rätsel der Quantenverschränkung: Verbunden ohne Signal",
            "Warum zwei Teilchen über jede Entfernung im selben Takt reagieren",
        ],
        "thumb_trigger": "VERBUNDENE TEILCHEN",
        "story_steps": {
            "hook": "Zwei winzige Lichtteilchen können Millionen Kilometer getrennt sein – und reagieren trotzdem im exakt selben Augenblick aufeinander.",
            "what_is_it": "Physiker nennen das Quantenverschränkung: Zwei Teilchen entstehen gemeinsam und bleiben danach wie ein einziges unsichtbares Paar gekoppelt.",
            "how_it_works": "Erst wenn man das erste Teilchen misst, legt es seinen Zustand fest – und genau in derselben Sekunde steht auch das zweite fest.",
            "why_astonishing": "Mit dem Physik-Nobelpreis ausgezeichnete Experimente zeigen: Zwischen den Teilchen reist kein Signal – sie waren schlicht nie wirklich getrennt.",
            "deeper_meaning": "Entfernung scheint im Universum also keine feste Mauer zu sein, sondern eine Oberfläche, hinter der alles über Information zusammenhängt.",
        },
    },
    {
        "id": "zeitkristalle",
        "pillar": "Simulations-News",
        "match_terms": ["zeitkristall", "quantencomputer", "qubit"],
        "core_subject": "Zeitkristalle im Quantencomputer",
        "titles": [
            "Zeitkristalle: Die rätselhafte Materie, die niemals zur Ruhe kommt",
            "Was ist ein Zeitkristall? Ein neuer Zustand der Materie einfach erklärt",
            "Im Quantencomputer: Wie ein Zeitkristall ohne Energieverlust schwingt",
        ],
        "thumb_trigger": "DER ZEITKRISTALL",
        "story_steps": {
            "hook": "Jedes Pendel bleibt irgendwann durch Reibung stehen – doch Physiker haben eine Materieform entdeckt, die von allein im Takt weiterschwingt.",
            "what_is_it": "Sie heißt Zeitkristall: Während Diamant seine Atome regelmäßig im Raum ordnet, wiederholt ein Zeitkristall sein Muster regelmäßig in der Zeit.",
            "how_it_works": "In modernen Quantencomputern wechseln gekoppelte Quantenbits dabei rhythmisch zwischen zwei Zuständen hin und her – ganz ohne Energie zu verbrauchen.",
            "why_astonishing": "Er bricht kein Naturgesetz, weil man ihm keine Energie abzapfen kann, zeigt aber erstmals eine Bewegung, die nicht im Chaos zerfällt.",
            "deeper_meaning": "Fast wirkt es wie ein stiller Grundtakt im Fundament der Materie: Selbst auf kleinster Ebene bevorzugt die Natur stabile Ordnung.",
        },
    },
    {
        "id": "atomuhr_zeitdilatation",
        "pillar": "Simulations-News",
        "match_terms": ["atomuhr", "zeitdilatation", "strontium", "relativität", "zeit vergeht"],
        "core_subject": "Wie Schwerkraft die Zeit verlangsamt",
        "titles": [
            "Deine Füße altern langsamer als dein Kopf – Atomuhren beweisen es",
            "Warum Zeit nicht überall gleich schnell vergeht: Einfach erklärt",
            "Ein Millimeter Höhenunterschied verändert bereits den Lauf der Zeit",
        ],
        "thumb_trigger": "GEKRÜMMTE ZEIT",
        "story_steps": {
            "hook": "Für deine Füße vergeht die Zeit in genau diesem Moment messbar langsamer als für deinen Kopf.",
            "what_is_it": "Schuld daran ist die Schwerkraft der Erde: Je näher etwas an einer großen Masse ist, desto langsamer tickt dort die Zeit.",
            "how_it_works": "Im Alltag spüren wir das nicht – doch moderne optische Atomuhren messen diesen Zeitunterschied heute schon bei einem einzigen Millimeter Höhenunterschied.",
            "why_astonishing": "Selbst dein Smartphone-Navi muss diesen Effekt täglich ausgleichen, weil Satellitenuhren hoch oben im All spürbar schneller laufen als auf der Erde.",
            "deeper_meaning": "Zeit ist also kein starrer Taktgeber im Hintergrund, sondern ein lebendiges Gewebe, das auf jeden Schritt im Raum reagiert.",
        },
    },
    {
        "id": "james_webb_fruehgalaxien",
        "pillar": "Simulations-News",
        "match_terms": ["james webb", "jwst", "weltraumteleskop", "frühe galaxien", "urknall"],
        "core_subject": "Die frühen Galaxien des James-Webb-Teleskops",
        "titles": [
            "Was das James-Webb-Teleskop am Anfang der Zeit sah, überrascht Forscher",
            "Zu groß und zu früh: Das Galaxien-Rätsel des James-Webb-Teleskops",
            "Blick zum Ursprung: Warum diese frühen Galaxien in kein Modell passen",
        ],
        "thumb_trigger": "ZU FRÜHE GALAXIEN",
        "story_steps": {
            "hook": "Als das James-Webb-Teleskop in die früheste Vergangenheit des Alls blickte, fand es etwas, das dort eigentlich noch nicht sein dürfte.",
            "what_is_it": "Weil fernes Sternenlicht Milliarden Jahre zu uns reist, wirkt das Teleskop wie eine Zeitmaschine direkt zurück kurz nach den Urknall.",
            "how_it_works": "Erwartet hatten Astronomen dort nur kleine, ungeordnete Gaswolken – doch auf den Bildern leuchteten bereits riesige, voll ausgereifte Galaxien.",
            "why_astonishing": "Nach bisherigen Modellen hätte die Schwerkraft in wenigen hundert Millionen Jahren niemals genug Zeit für so gewaltige Sternsysteme gehabt.",
            "deeper_meaning": "Entweder wächst Ordnung im Kosmos nach einem viel schnelleren Bauplan als gedacht – oder unser Bild vom Anfang ist noch unvollständig.",
        },
    },
    {
        "id": "doppelspalt_beobachter",
        "pillar": "Simulations-News",
        "match_terms": ["doppelspalt", "beobachtereffekt", "welle", "teilchen", "quantenradierer"],
        "core_subject": "Das Doppelspalt-Experiment",
        "titles": [
            "Das Doppelspalt-Experiment einfach erklärt: Wenn Messung Wirklichkeit formt",
            "Warum verhält sich Materie anders, sobald sie gemessen wird?",
            "Der Beobachtereffekt: Das berühmteste Rätsel der Physik kurz erklärt",
        ],
        "thumb_trigger": "DER BEOBACHTER-EFFEKT",
        "story_steps": {
            "hook": "Ein einzelnes Teilchen fliegt auf zwei schmale Schlitze zu – und verhält sich völlig anders, sobald ein Messgerät zusieht.",
            "what_is_it": "Ohne Messung entsteht auf dem Schirm dahinter ein Wellenmuster, als wäre jedes einzelne Teilchen durch beide Spalte gleichzeitig geglitten.",
            "how_it_works": "Misst man jedoch genau nach, welchen Spalt es nimmt, verschwindet die Welle sofort – und das Teilchen wählt wie ein festes Kügelchen einen Weg.",
            "why_astonishing": "Entscheidend ist dabei nicht das menschliche Auge, sondern die gespeicherte Information: Solange der Weg offenbleibt, existieren alle Möglichkeiten zugleich.",
            "deeper_meaning": "Unsere feste Alltagswelt entsteht auf kleinster Ebene also immer genau dort, wo offene Möglichkeiten zu eindeutiger Information werden.",
        },
    },
    {
        "id": "schwarze_loecher_ereignishorizont",
        "pillar": "Simulations-News",
        "match_terms": ["schwarzes loch", "schwarze löcher", "ereignishorizont", "hologramm", "hawking"],
        "core_subject": "Der Ereignishorizont Schwarzer Löcher",
        "titles": [
            "Was passiert am Rand eines Schwarzen Lochs wirklich mit der Zeit?",
            "Der Ereignishorizont einfach erklärt: Wo die Zeit stillzustehen scheint",
            "Schwarze Löcher: Warum ihre Oberfläche wie ein Datenspeicher wirkt",
        ],
        "thumb_trigger": "STILLSTAND DER ZEIT",
        "story_steps": {
            "hook": "Am Rand eines Schwarzen Lochs gibt es eine unsichtbare Grenze, an der von außen gesehen selbst die Zeit erstarrt.",
            "what_is_it": "Diese Grenze heißt Ereignishorizont: Dahinter ist die Schwerkraft so stark, dass nicht einmal mehr ein Lichtstrahl entkommen kann.",
            "how_it_works": "Lange dachte man, jede Information über hineinstürzende Materie sei für immer gelöscht – doch Berechnungen zeigten, dass sie auf der äußeren Hülle gespeichert bleibt.",
            "why_astonishing": "Deshalb hängt der Informationsgehalt eines Schwarzen Lochs nicht von seinem Volumen ab, sondern allein von seiner Oberfläche – genau wie bei einem Hologramm.",
            "deeper_meaning": "Daraus wuchs eine faszinierende Idee der Physik: Selbst unter extremsten Bedingungen geht im Universum keine Information wirklich verloren.",
        },
    },
    {
        "id": "cheops_myonen_kammer",
        "pillar": "Alte Codes",
        "match_terms": ["pyramide", "gizeh", "cheops", "myonen", "scanpyramids", "kammer"],
        "core_subject": "Die verborgene Kammer der Cheops-Pyramide",
        "titles": [
            "Mitten in der Cheops-Pyramide liegt ein Raum, den seit 4.500 Jahren niemand betrat",
            "Wie kosmische Teilchen eine geheime Kammer in der Cheops-Pyramide enthüllten",
            "Das Rätsel über der Großen Galerie: Der Pyramiden-Scan einfach erklärt",
        ],
        "thumb_trigger": "DIE GEHEIME KAMMER",
        "story_steps": {
            "hook": "Tief im massiven Stein der Cheops-Pyramide liegt ein dreißig Meter langer Raum, den seit viertausendfünfhundert Jahren kein Mensch betreten hat.",
            "what_is_it": "Gefunden wurde er ganz ohne Bohrer – mithilfe natürlicher kosmischer Teilchen aus dem All, die festen Kalkstein wie Röntgenlicht durchdringen.",
            "how_it_works": "Wo ein Hohlraum liegt, kommen mehr dieser Teilchen hindurch: So wurde direkt über der Großen Galerie eine vollkommen versiegelte Kammer sichtbar.",
            "why_astonishing": "Durch eine winzige Fuge zeigte eine Kamera bereits am Nordeingang präzise Entlastungsblöcke – doch der Zweck des großen Hauptraums bleibt ein Rätsel.",
            "deeper_meaning": "Selbst nach Jahrtausenden beweist das älteste Weltwunder der Erde, wie meisterhaft und vorausschauend die ägyptischen Baumeister geplant haben.",
        },
    },
    {
        "id": "goebekli_tepe",
        "pillar": "Alte Codes",
        "match_terms": ["göbekli", "gobekli", "anatolien", "steinzeit", "megalith"],
        "core_subject": "Göbekli Tepe",
        "titles": [
            "Göbekli Tepe: Wer baute diesen Monumental-Tempel vor 11.500 Jahren?",
            "Sechstausend Jahre älter als Gizeh: Göbekli Tepe einfach erklärt",
            "Warum Göbekli Tepe unser Bild der Menschheitsgeschichte veränderte",
        ],
        "thumb_trigger": "VOR DEN PYRAMIDEN",
        "story_steps": {
            "hook": "Auf einem Hügel in der heutigen Türkei stehen tonnenschwere Steinpfeiler, die über sechstausend Jahre älter sind als die Pyramiden.",
            "what_is_it": "Die Anlage heißt Göbekli Tepe und entstand vor rund elftausendfünfhundert Jahren – mitten in der Zeit einfacher Jäger und Sammler.",
            "how_it_works": "Ohne Metallwerkzeuge und vor der Erfindung des Rades meißelten Menschen dort meterhohe Kalkstein-Säulen aus dem Fels und verzierten sie mit Tierreliefs.",
            "why_astonishing": "Lange galt: Erst kam der Ackerbau, dann der Tempelbau. Göbekli Tepe beweist das Gegenteil – zuerst schuf ein gemeinsames Heiligtum die Gemeinschaft.",
            "deeper_meaning": "Nicht bloßes Überleben einte die frühe Menschheit zu Höchstleistungen, sondern die gemeinsame Suche nach Sinn und Ordnung.",
        },
    },
    {
        "id": "antikythera_computer",
        "pillar": "Alte Codes",
        "match_terms": ["antikythera", "zahnrad", "uhrwerk", "griechenland", "wrack"],
        "core_subject": "Der Mechanismus von Antikythera",
        "titles": [
            "Der 2.000 Jahre alte Computer aus dem Meer: Antikythera einfach erklärt",
            "Wie antike Baumeister Sonnenfinsternisse per Zahnrad berechneten",
            "Der Mechanismus von Antikythera: Ein Uhrwerk weit vor seiner Zeit",
        ],
        "thumb_trigger": "DER ANTIKE COMPUTER",
        "story_steps": {
            "hook": "Vor einer griechischen Insel bargen Taucher einen verkrusteten Bronzeklumpen, der sich als zweitausend Jahre alter mechanischer Computer entpuppte.",
            "what_is_it": "Bekannt als Mechanismus von Antikythera war das Gerät kaum größer als ein Schuhkarton und stammt aus dem ersten Jahrhundert vor Christus.",
            "how_it_works": "Röntgen-Scans zeigten im Inneren über dreißig feine Bronzeräder: Mit einer Kurbel ließ sich der Lauf von Sonne, Mond und Planeten vorausberechnen.",
            "why_astonishing": "Das Uhrwerk sagte sogar Finsternisse auf den Tag genau voraus – vergleichbare Feinmechanik baute Europa erst über tausendvierhundert Jahre später wieder.",
            "deeper_meaning": "Geschichte verläuft eben nicht immer geradlinig nach oben: Manches erstaunliche Wissen war längst da und geriet jahrhundertelang in Vergessenheit.",
        },
    },
    {
        "id": "klartraeumen_schlaflabor",
        "pillar": "Bewusstseins-Hacks",
        "match_terms": ["klartraum", "klarträumen", "luzid", "rem", "traum", "schlaflabor"],
        "core_subject": "Kommunikation aus dem Klartraum",
        "titles": [
            "Mitten im Traum wach werden: Was Forscher im Schlaflabor nachwiesen",
            "Antworten aus dem Schlaf: Das erstaunliche Klartraum-Experiment erklärt",
            "Klarträumen wissenschaftlich erklärt: Wenn Träumende live antworten",
        ],
        "thumb_trigger": "WACH IM TRAUM",
        "story_steps": {
            "hook": "Ein Mensch liegt tief schlafend im Labor – und löst trotzdem in Echtzeit Rechenaufgaben, die ein Forscher ihm leise stellt.",
            "what_is_it": "Möglich wird das im Klartraum: einem besonderen Zustand, in dem der Schlafende mitten im Traum klar erkennt, dass er gerade träumt.",
            "how_it_works": "Weil sich im Traumschlaf die Augen frei bewegen können, antworteten Teilnehmer per vereinbartem Blick-Code korrekt auf Aufgaben wie ‚acht minus sechs‘.",
            "why_astonishing": "Hirnströme bewiesen gleichzeitig tiefen Traumschlaf, während die Befragten später erzählten, die Frage habe wie durch ein Radio im Traum geklungen.",
            "deeper_meaning": "Schlaf ist also kein bloßes Abschalten, sondern ein eigener Bewusstseinsraum, in dem klares Denken mitten in inneren Welten möglich bleibt.",
        },
    },
    {
        "id": "gehirn_vorhersage_100ms",
        "pillar": "Bewusstseins-Hacks",
        "match_terms": ["wahrnehmung", "vorhersage", "100 millisekunden", "verzögerung", "gehirn", "bewusstsein"],
        "core_subject": "Die 100-Millisekunden-Vorhersage des Gehirns",
        "titles": [
            "Du lebst 100 Millisekunden in der Vergangenheit – so arbeitet dein Gehirn",
            "Warum du die Welt nie direkt siehst, sondern die Vorhersage deines Gehirns",
            "Das 100-Millisekunden-Geheimnis unserer Wahrnehmung einfach erklärt",
        ],
        "thumb_trigger": "DIE ZEIT-ILLUSION",
        "story_steps": {
            "hook": "Alles, was du genau jetzt zu sehen und zu hören glaubst, ist in Wahrheit schon vor einer Zehntelsekunde passiert.",
            "what_is_it": "Bis Signale von Augen und Ohren im dunklen Inneren des Schädels zu einem Bild zusammengesetzt sind, vergehen rund hundert Millisekunden.",
            "how_it_works": "Damit du im Alltag trotzdem einen schnellen Ball fangen kannst, berechnet dein Gehirn aus Erfahrung ständig einen Moment im Voraus, was gleich geschieht.",
            "why_astonishing": "Erst wenn etwas Unerwartetes passiert, korrigiert das Gehirn sein inneres Bild blitzschnell nach – und genau das fühlen wir als Überraschung.",
            "deeper_meaning": "Wir schauen also nie passiv wie durch ein Fenster nach draußen: Unsere erlebte Gegenwart ist eine aktive Schöpfung unseres Geistes.",
        },
    },
    {
        "id": "meditation_ruhezustandsnetzwerk",
        "pillar": "Bewusstseins-Hacks",
        "match_terms": ["meditation", "ruhezustandsnetzwerk", "gamma", "gedankenkarussell", "fokus", "stille"],
        "core_subject": "Was Stille im Gehirn verändert",
        "titles": [
            "Was im Gehirn passiert, wenn das Gedankenkarussell plötzlich schweigt",
            "Unter dem Hirnscanner: Wie tiefe Ruhe unsere Wahrnehmung umschaltet",
            "Das Ruhezustandsnetzwerk einfach erklärt: Warum Stille den Geist ordnet",
        ],
        "thumb_trigger": "MACHT DER STILLE",
        "story_steps": {
            "hook": "Immer wenn du scheinbar gar nichts tust, läuft im Hintergrund deines Gehirns ein bestimmtes Netzwerk auf Hochtouren.",
            "what_is_it": "Forscher nennen es das Ruhezustandsnetzwerk: Es grübelt über gestern, plant für morgen und hält unser endloses inneres Selbstgespräch am Laufen.",
            "how_it_works": "Richtet ein Mensch seine Aufmerksamkeit jedoch ruhig auf einen Punkt wie den Atem, fährt genau dieses Grübel-Netzwerk im Hirnscanner spürbar herunter.",
            "why_astonishing": "Gleichzeitig schwingen entfernte Hirnregionen plötzlich im gemeinsamen Takt – statt vieler lauter Einzelgedanken entsteht messbare geistige Klarheit.",
            "deeper_meaning": "Innere Stille ist neurologisch gesehen also kein Nichtstun, sondern der Moment, in dem der Geist aufhört, sich selbst im Weg zu stehen.",
        },
    },
]


def detect_pillar(topic: str) -> str:
    low = (topic or "").lower()
    scores = {p: 0 for p in PILLAR_KEYWORDS}
    for pillar, kw_list in PILLAR_KEYWORDS.items():
        for kw in kw_list:
            if kw in low:
                scores[pillar] += 2
    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return "Simulations-News"
    return best


def _find_matching_monograph(query: str, pillar: str | None = None) -> dict[str, Any] | None:
    low = (query or "").lower().strip()
    if not low:
        return None
    best_item = None
    best_score = 0
    for mono in SINGLE_TOPIC_MONOGRAPHS:
        score = 0
        for term in mono["match_terms"]:
            if term in low:
                score += len(term)
        if score > best_score:
            best_score = score
            best_item = mono
    return best_item


def _pick_fresh_monograph(pillar: str | None, recent: set[str]) -> dict[str, Any]:
    pool = [
        m for m in SINGLE_TOPIC_MONOGRAPHS
        if (not pillar or m["pillar"] == pillar)
    ] or list(SINGLE_TOPIC_MONOGRAPHS)
    random.shuffle(pool)
    for m in pool:
        if m["core_subject"].lower() not in recent:
            return m
    return pool[0]


def fetch_single_best_news_story(query: str) -> dict[str, str] | None:
    """Find AT MOST ONE relevant, pure-German science news story (never a multi-news list)."""
    if not query.strip():
        return None
    recent = _recent_titles_and_topics()
    kw_tokens = [w.lower() for w in re.findall(r"[A-Za-zÄÖÜäöüß]{4,}", query)]

    # 1. Check Tagesschau Wissen / DLF Forschung RSS first because they provide clean multi-sentence descriptions!
    feeds = [
        ("Tagesschau Wissen", "https://www.tagesschau.de/wissen/index~rss2.xml"),
        ("Deutschlandfunk Forschung", "https://www.deutschlandfunk.de/forschung-aktuell-100.rss"),
    ]
    for label, url in feeds:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=5)
            if resp.status_code != 200:
                continue
            root = ET.fromstring(resp.content)
            for item in root.findall(".//item")[:20]:
                title = clean_german_sentence(item.findtext("title") or "")
                desc = clean_german_sentence(item.findtext("description") or "")
                link = (item.findtext("link") or "").strip()
                if not title or len(title) < 20 or title.lower() in recent:
                    continue
                combined = f"{title}. {desc}".strip(". ")
                if not is_pure_german(combined):
                    continue
                if kw_tokens and any(tok in combined.lower() for tok in kw_tokens):
                    return {
                        "source": label,
                        "title": title,
                        "description": desc,
                        "url": link,
                    }
        except Exception:
            continue

    # 2. Check Google News DE for ONE single top science headline matching the query
    try:
        q = f"{query} (Forschung OR Studie OR Wissenschaft OR Physik OR Archäologie OR Gehirn)"
        url = f"https://news.google.com/rss/search?q={quote_plus(q)}&hl=de&gl=DE&ceid=DE:de"
        resp = requests.get(url, headers=HEADERS, timeout=5)
        if resp.status_code == 200 and resp.text.strip():
            root = ET.fromstring(resp.content)
            for item in root.findall(".//item")[:8]:
                raw_title = (item.findtext("title") or "").strip()
                link = (item.findtext("link") or "").strip()
                source_el = item.find("source")
                pub_name = (source_el.text or "").strip() if source_el is not None else "Forschung DE"
                cleaned = clean_german_sentence(raw_title)
                if len(cleaned) >= 26 and is_pure_german(cleaned) and cleaned.lower() not in recent:
                    if not kw_tokens or any(tok in cleaned.lower() for tok in kw_tokens):
                        return {
                            "source": pub_name,
                            "title": cleaned,
                            "description": "",
                            "url": link,
                        }
    except Exception:
        pass
    return None


def fetch_single_topic_wikipedia_de(query: str) -> dict[str, Any] | None:
    """Fetch coherent, consecutive German paragraphs from the SINGLE best-matching Wikipedia DE article."""
    clean_q = (query or "").strip()
    if not clean_q:
        return None
    try:
        search_resp = requests.get(
            "https://de.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srsearch": clean_q,
                "srlimit": 1,
                "format": "json",
            },
            headers=HEADERS,
            timeout=6,
        )
        if search_resp.status_code != 200:
            return None
        hits = search_resp.json().get("query", {}).get("search", [])
        if not hits or not hits[0].get("title"):
            return None
        best_title = str(hits[0]["title"]).strip()

        ext_resp = requests.get(
            "https://de.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "prop": "extracts",
                "exchars": 3400,
                "explaintext": 1,
                "titles": best_title,
                "format": "json",
            },
            headers=HEADERS,
            timeout=6,
        )
        if ext_resp.status_code != 200:
            return None
        pages = ext_resp.json().get("query", {}).get("pages", {})
        for page in pages.values():
            extract = (page.get("extract") or "").strip()
            if not extract:
                continue
            raw_sents = [clean_german_sentence(s) for s in re.split(r"(?<=[.!?])\s+", extract)]
            coherent_sents = [
                s for s in raw_sents
                if 38 <= len(s) <= 270 and is_pure_german(s) and "==" not in s
            ]
            if coherent_sents:
                return {
                    "title": best_title,
                    "url": f"https://de.wikipedia.org/wiki/{quote_plus(best_title.replace(' ', '_'))}",
                    "sentences": coherent_sents[:6],
                }
    except Exception:
        pass
    return None


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


def run_topic_research(
    topic: str = "",
    *,
    pillar: str | None = None,
    editorial_mode: str = "fakten_mystery",
    browser_sources: list[dict[str, Any]] | None = None,
    arena_settings: dict[str, Any] | None = None,
    auto_expand_keyword: bool = True,
) -> dict[str, Any]:
    """Build a strictly SINGLE-TOPIC German research dossier where every fact serves ONE coherent story."""
    raw_query = re.sub(r"\s+", " ", (topic or "").strip())
    recent = _recent_titles_and_topics()

    # 1. Determine single target subject
    matched_mono = _find_matching_monograph(raw_query, pillar)
    chosen_pillar = (
        pillar
        if (pillar and pillar in PILLAR_KEYWORDS)
        else (matched_mono["pillar"] if matched_mono else (detect_pillar(raw_query) if raw_query else random.choice(list(PILLAR_KEYWORDS.keys()))))
    )

    if not raw_query:
        # Autonomous discovery picks ONE complete single-topic focus
        matched_mono = _pick_fresh_monograph(chosen_pillar, recent)
        chosen_pillar = matched_mono["pillar"]
        search_focus = matched_mono["core_subject"]
    else:
        search_focus = matched_mono["core_subject"] if (matched_mono and len(raw_query.split()) <= 3) else raw_query

    # 2. Query ONLY for this ONE single subject in parallel (at most 1 news story + 1 main Wikipedia article)
    single_news: dict[str, str] | None = None
    single_wiki: dict[str, Any] | None = None
    with ThreadPoolExecutor(max_workers=2) as pool:
        f_news = pool.submit(fetch_single_best_news_story, raw_query or search_focus)
        f_wiki = pool.submit(fetch_single_topic_wikipedia_de, search_focus)
        try:
            single_news = f_news.result(timeout=6)
        except Exception:
            single_news = None
        try:
            single_wiki = f_wiki.result(timeout=6)
        except Exception:
            single_wiki = None

    # Use browser-fetched Wikipedia sentences ONLY if they come from ONE single primary article
    browser_article_title = ""
    browser_sents: list[str] = []
    for bs in browser_sources or []:
        if not isinstance(bs, dict):
            continue
        b_title = clean_german_sentence(bs.get("title") or "")
        if not browser_article_title:
            browser_article_title = b_title
        # Never mix sentences from a second unrelated Wikipedia page!
        if b_title and browser_article_title and b_title.lower() != browser_article_title.lower():
            continue
        b_snip = clean_german_sentence(bs.get("summary") or bs.get("snippet") or "")
        if b_snip and is_pure_german(b_snip) and b_snip not in browser_sents:
            browser_sents.append(b_snip)

    # 3. Assemble ONE unified core_subject, ONE clear title, and coherent single-topic background points
    ui_sources: list[dict[str, str]] = []
    coherent_facts: list[str] = []
    story_steps: dict[str, str] = {}
    thumb_trigger = ""

    if single_news and not matched_mono:
        # User searched a fresh current topic with a real German science report
        core_subject = single_wiki["title"] if single_wiki else (raw_query or single_news["title"])
        resolved_title = single_news["title"]
        discovery_note = f"Einzel-Thema aus aktueller Forschung ({single_news['source']})"
        ui_sources.append({"kind": single_news["source"], "title": single_news["title"], "url": single_news.get("url", "")})
        if single_news.get("description"):
            for s in re.split(r"(?<=[.!?])\s+", single_news["description"]):
                cs = clean_german_sentence(s)
                if len(cs) >= 30 and is_pure_german(cs):
                    coherent_facts.append(cs)
        else:
            coherent_facts.append(f"Im Zentrum steht ein konkreter Befund: {single_news['title']}.")
    elif matched_mono:
        core_subject = matched_mono["core_subject"]
        titles_pool = [t for t in matched_mono["titles"] if t.lower() not in recent] or matched_mono["titles"]
        # If user typed a long explicit title (>5 words), honor their exact title!
        if len(raw_query.split()) > 5:
            resolved_title = raw_query
        elif single_news and len(raw_query.split()) <= 4:
            resolved_title = single_news["title"]
            ui_sources.append({"kind": single_news["source"], "title": single_news["title"], "url": single_news.get("url", "")})
        else:
            resolved_title = random.choice(titles_pool)
        discovery_note = f"Fokussierte Einzel-Analyse zum Thema „{core_subject}“"
        story_steps = dict(matched_mono["story_steps"])
        thumb_trigger = matched_mono.get("thumb_trigger", "")
    else:
        # Custom user topic without a prebuilt monograph -> focus 100% on the single Wikipedia article / user topic
        core_subject = single_wiki["title"] if (single_wiki and len(raw_query.split()) <= 2) else (raw_query or "Rätsel der Wirklichkeit")
        if len(raw_query.split()) >= 5:
            resolved_title = raw_query
        else:
            resolved_title = f"{core_subject} einfach erklärt: Was wirklich dahintersteckt"
        discovery_note = f"Fokussierte Einzel-Recherche zu „{core_subject}“"

    # Append coherent sentences ONLY from the single matching Wikipedia article (never off-topic filler!)
    if single_wiki:
        ui_sources.append({"kind": "Wikipedia DE (Hauptartikel)", "title": single_wiki["title"], "url": single_wiki["url"]})
        for s in single_wiki["sentences"]:
            if s.lower() not in {x.lower() for x in coherent_facts}:
                coherent_facts.append(s)
    elif browser_sents:
        ui_sources.append({"kind": "Wikipedia DE (Hauptartikel)", "title": browser_article_title or core_subject, "url": ""})
        for s in browser_sents:
            if s.lower() not in {x.lower() for x in coherent_facts}:
                coherent_facts.append(s)

    # Include the monograph's structured, crystal-clear explanation points for this exact single topic
    if story_steps:
        for key in ("what_is_it", "how_it_works", "why_astonishing"):
            pt = story_steps.get(key, "")
            if pt and pt.lower() not in {x.lower() for x in coherent_facts}:
                coherent_facts.append(pt)

    # If custom offline topic had zero external hits, build clean single-topic explanation points strictly around core_subject
    if not coherent_facts:
        coherent_facts = [
            f"Im Mittelpunkt steht hier ein einziges Thema: {core_subject}.",
            "Vereinfacht gesagt zeigt sich dahinter ein klarer Zusammenhang, bei dem verborgene Ordnung unsere gewohnte Sicht verändert.",
            "Schaut man Schritt für Schritt genauer hin, greifen Ursache und Wirkung nach erstaunlich präzisen Regeln ineinander.",
        ]

    if not story_steps:
        # Derive logical 5-step arc strictly from coherent_facts of THIS ONE topic
        f0 = coherent_facts[0]
        f1 = coherent_facts[1] if len(coherent_facts) > 1 else "Bei genauer Betrachtung zeigt sich dabei, wie präzise kleinste Details zusammenwirken."
        f2 = coherent_facts[2] if len(coherent_facts) > 2 else "Das Erstaunliche daran ist, dass unsere gewohnte Alltagsvorstellung genau hier an ihre Grenzen stößt."
        story_steps = {
            "hook": f"Wer wirklich verstehen will, worum es beim Thema {core_subject} geht, stößt schnell auf einen verblüffend klaren Kern.",
            "what_is_it": f0,
            "how_it_works": f1,
            "why_astonishing": f2,
            "deeper_meaning": "Genau deshalb fasziniert dieses Thema bis heute: Je ruhiger man hinschaut, desto deutlicher wird eine Ordnung jenseits des Zufalls.",
        }

    if not ui_sources:
        ui_sources.append(
            {
                "kind": f"AuronOrigin Themen-Dossier • {chosen_pillar}",
                "title": core_subject,
                "url": "",
            }
        )

    mystery_note = story_steps.get(
        "deeper_meaning",
        f"Bei näherem Hinsehen zeigt „{core_subject}“ eine erstaunliche Ordnung hinter dem Offensichtlichen.",
    )

    return {
        "input_keyword": raw_query or core_subject,
        "core_subject": core_subject,
        "topic": resolved_title,
        "headline_angle": resolved_title,
        "thumb_trigger": thumb_trigger,
        "discovery_note": discovery_note,
        "pillar": chosen_pillar,
        "editorial_mode": editorial_mode,
        "live_sources_count": len(ui_sources),
        "external_sources": ui_sources,
        "sources": ui_sources,
        "story_steps": story_steps,
        "verified_facts": coherent_facts[:6],
        "mystery_interpretation": [mystery_note],
    }
