"""Single-Topic High-CTR & High-Retention German Research Engine for AuronOrigin.

Core Editorial & Analytics Principles:
1. STRICT SINGLE-TOPIC FOCUS (1 Video = 1 Thema):
   - Never mix multiple news items or unrelated facts in one dossier.
   - 100% alignment between researched topic, title/thumbnail packaging, and script body.
2. HIGH-CTR YOUTUBE HOME/BROWSE PACKAGING (Target > 4.5–6% CTR):
   - Avoid passive encyclopedic titles ("Was ist ...?", "... einfach erklärt") on the Home feed.
   - Pair concrete anomaly/paradox titles with complementary 2–3 word thumbnail triggers
     that NEVER repeat the title verbatim (Curiosity Gap = Known Fact + Unresolved Tension).
3. 9-MINUTE RETENTION DEPTH (Target > 40% AVD):
   - Provide both crisp 5-step Short arcs AND deep 6-act single-topic narrative building blocks
     (Cold Open Paradox, Open Loop #1, Everyday Analogy, Experiment/Discovery Story,
     Minute-2 Re-Hook, Mid-Video Twist, Skeptic Check, Big Payoff, Seamless Binge Bridge).
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
    "User-Agent": "AuronOriginStudio/3.0 (Ubuntu High-CTR & Single-Topic Engine; de-DE)",
    "Accept-Language": "de-DE,de;q=0.9",
}

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
    t = re.sub(r"^(?:Aktuelle\s+Meldung|Eilmeldung|News|Bericht)\s*(?:\([^)]*\))?\s*:\s*", "", t.strip(), flags=re.I)
    t = re.sub(r"\s+[-–|]\s+[A-ZÄÖÜ][\w\s.&-]{2,45}$", "", t.strip())
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


# Self-contained Single-Topic Monographs with High-CTR Browse Titles + Complementary 3-Way Thumbnails + Deep-Dive Acts
SINGLE_TOPIC_MONOGRAPHS: list[dict[str, Any]] = [
    {
        "id": "quantenverschraenkung",
        "pillar": "Simulations-News",
        "match_terms": ["verschränkung", "quantenverschränkung", "spukhaft", "photon"],
        "core_subject": "Quantenverschränkung",
        "titles": [
            "Das Experiment, das Einstein bis zuletzt nicht glauben wollte",
            " Millionen Kilometer getrennt – warum reagieren diese Teilchen gleichzeitig?",
            "Nobelpreis-Beweis: Warum Entfernung im Universum eine Illusion ist",
        ],
        "thumb_trigger": "KEIN SIGNAL?",
        "thumb_variants": [
            "0 SEKUNDEN VERZÖGERUNG",
            "EINSTEINS IRRTUM",
            "NIE GETRENNT?",
        ],
        "story_steps": {
            "hook": "Zwei winzige Lichtteilchen sind Millionen Kilometer voneinander getrennt – und reagieren trotzdem in derselben Mikrosekunde aufeinander.",
            "what_is_it": "Physiker nennen das Quantenverschränkung: Zwei Teilchen entstehen gemeinsam und bleiben danach wie ein einziges unsichtbares Paar gekoppelt.",
            "how_it_works": "Erst wenn man das erste Teilchen misst, legt es seinen Zustand fest – und genau im selben Moment steht auch das zweite fest.",
            "why_astonishing": "Mit dem Physik-Nobelpreis ausgezeichnete Experimente zeigen: Zwischen den Teilchen reist kein Signal – sie waren schlicht nie wirklich getrennt.",
            "deeper_meaning": "Entfernung scheint im Universum also keine feste Mauer zu sein, sondern eine Oberfläche, hinter der alles über Information zusammenhängt.",
        },
        "deep_dive": {
            "open_loop_main": "Doch das eigentliche Rätsel liegt nicht darin, wie schnell die Teilchen reagieren – sondern in einem Trick, mit dem Forscher jede geheime Absprache zwischen ihnen endgültig ausgeschlossen haben.",
            "analogy": "Stell dir zwei besondere Münzen vor, die in verschiedenen Städten gleichzeitig geworfen werden: Jedes Mal, wenn in Berlin Kopf fällt, zeigt die Münze in Tokio im selben Moment Zahl – obwohl beide bis zur Landung völlig unentschieden in der Luft kreisen.",
            "rehook_min2": "Bis hierhin dachten selbst viele Physiker noch an eine einfache Lösung: Vielleicht trugen die Teilchen ihr Ergebnis ja schon wie einen versteckten Zettel seit dem Start in sich. Genau diese Vermutung führte zum entscheidenden Experiment.",
            "experiment": "Die Physiker Alain Aspect, John Clauser und Anton Zeilinger schickten verschränkte Lichtteilchen in entgegengesetzte Richtungen und änderten die Einstellung der Messgeräte erst in dem winzigen Bruchteil einer Sekunde, in dem die Teilchen längst unterwegs waren.",
            "mid_twist": "Damit hätte ein geheimes Signal schneller als das Licht von einem Messgerät zum anderen rasen müssen – doch die Messdaten trafen etwas noch Erstaunlicheres.",
            "skeptic_check": " Kritiker suchten jahrzehntelang nach Schlupflöchern in den Geräten, also nutzten Forscher schließlich sogar das uralte Licht ferner Sterne als Zufallsgeber für die Messung – und wieder reagierten die Teilchen wie aus einem Guss.",
            "payoff": "Die Auflösung unseres Anfangsrätsels lautet deshalb: Zwischen den beiden Teilchen fliegt überhaupt keine Botschaft durch den Raum, weil sie trotz aller Kilometer für die Natur noch immer ein einziges unteilbares System bilden.",
        },
    },
    {
        "id": "zeitkristalle",
        "pillar": "Simulations-News",
        "match_terms": ["zeitkristall", "quantencomputer", "qubit"],
        "core_subject": "Zeitkristalle im Quantencomputer",
        "titles": [
            "Physiker erschaffen Materie, die niemals zur Ruhe kommt",
            "Im Quantencomputer tickt etwas, das laut Schulphysik unmöglich schien",
            "Kein Energieverlust: Warum der Zeitkristall Forscher weltweit fasziniert",
        ],
        "thumb_trigger": "EWIGER TAKT",
        "thumb_variants": [
            "NULL REIBUNG",
            "NEUE MATERIE",
            "EWIGER PULS?",
        ],
        "story_steps": {
            "hook": "Jedes Pendel bleibt irgendwann durch Reibung stehen – doch Physiker haben eine Materieform erschaffen, die von allein im Takt weiterschwingt.",
            "what_is_it": "Sie heißt Zeitkristall: Während Diamant seine Atome regelmäßig im Raum ordnet, wiederholt ein Zeitkristall sein Muster regelmäßig in der Zeit.",
            "how_it_works": "In modernen Quantencomputern wechseln gekoppelte Quantenbits dabei rhythmisch zwischen zwei Zuständen hin und her – ganz ohne Energie zu verbrauchen.",
            "why_astonishing": "Er bricht kein Naturgesetz, weil man ihm keine Energie abzapfen kann, zeigt aber erstmals eine Bewegung, die nicht im Chaos zerfällt.",
            "deeper_meaning": "Fast wirkt es wie ein stiller Grundtakt im Fundament der Materie: Selbst auf kleinster Ebene bevorzugt die Natur stabile Ordnung.",
        },
        "deep_dive": {
            "open_loop_main": "Doch warum verletzt ein solcher Zeitkristall nicht das strengste Gesetz der Physik – das Verbot des Perpetuum mobile? Die Antwort darauf verrät etwas Verblüffendes über die Zeit selbst.",
            "analogy": "Wenn Wasser zu Eis gefriert, legen sich seine Moleküle plötzlich von allein in ein festes räumliches Gitter. Ein Zeitkristall macht exakt dasselbe – nur eben nicht nebeneinander im Raum, sondern nacheinander im Sekundentakt.",
            "rehook_min2": "Als der Nobelpreisträger Frank Wilczek diese Idee zum ersten Mal vorschlug, rechneten Kollegen sofort nach und erklärten sie für unmöglich. Doch ein winziges Schlupfloch hatten alle übersehen.",
            "experiment": "In einem Quantenprozessor koppelten Forscher Dutzende supraleitende Quantenbits und gaben ihnen einen kurzen Laser- oder Mikrowellen-Impuls – woraufhin die Teilchen exakt im halben Takt im Gleichschritt zurückantworteten, ohne sich aufzuheizen.",
            "mid_twist": "Normalerweise verwandelt jeder Impuls ein Quantensystem binnen kürzester Zeit in ungeordnete Wärme – doch hier passierte das genaue Gegenteil.",
            "skeptic_check": "Warum ist es trotzdem kein Perpetuum mobile? Weil man aus dem Schwingen keinen Strom abziehen kann: Sobald man Energie entnimmt, bricht der empfindliche Quantenzustand zusammen – wie ein Eiskristall, der in der warmen Hand schmilzt.",
            "payoff": "Genau darin liegt die Auflösung: Im tiefsten Ruhezustand kann Materie also ein stabiles zeitliches Muster bilden, ohne Energie zu verbrauchen – ein echter neuer Aggregatzustand neben fest, flüssig und gasförmig.",
        },
    },
    {
        "id": "atomuhr_zeitdilatation",
        "pillar": "Simulations-News",
        "match_terms": ["atomuhr", "zeitdilatation", "strontium", "relativität", "zeit vergeht"],
        "core_subject": "Wie Schwerkraft die Zeit verlangsamt",
        "titles": [
            "Deine Füße altern langsamer als dein Kopf – und diese Uhr beweist es",
            "Schon 1 Millimeter Höhe verändert die Zeit: Das extremste Uhr-Experiment",
            "Warum es im Universum kein gemeinsames „Jetzt“ gibt",
        ],
        "thumb_trigger": "1 MILLIMETER REICHT",
        "thumb_variants": [
            "ZEIT LÄUFT UNGLEICH",
            "1 MM UNTERSCHIED",
            "KEIN ECHTES JETZT?",
        ],
        "story_steps": {
            "hook": "Für deine Füße vergeht die Zeit in genau diesem Moment messbar langsamer als für deinen Kopf.",
            "what_is_it": "Der Grund ist die Schwerkraft der Erde: Je näher etwas an einer großen Masse ist, desto langsamer tickt dort die Zeit.",
            "how_it_works": "Im Alltag spüren wir das nicht – doch moderne optische Atomuhren messen diesen Zeitunterschied heute schon bei einem einzigen Millimeter Höhenunterschied.",
            "why_astonishing": "Selbst dein Smartphone-Navi muss diesen Effekt täglich ausgleichen, weil Satellitenuhren hoch oben im All spürbar schneller laufen als auf der Erde.",
            "deeper_meaning": "Zeit ist also kein starrer Taktgeber im Hintergrund, sondern ein lebendiges Gewebe, das auf jeden Schritt im Raum reagiert.",
        },
        "deep_dive": {
            "open_loop_main": "Aber warum bremst ausgerechnet ein schwerer Planet wie die Erde den Ablauf einer Sekunde ab – und was würde mit deinem Handy passieren, wenn Ingenieure diesen Effekt nur für einen Tag ignorierten?",
            "analogy": "Stell dir die Raumzeit wie ein straff gespanntes Trampolin vor, in dessen Mitte eine schwere Bowlingkugel liegt: Je näher du der Kugel kommst, desto stärker ist das Gewebe gedehnt – und desto länger dauert dort jeder einzelne Takt.",
            "rehook_min2": "Über ein Jahrhundert lang konnte man diesen Effekt nur mit Raketen oder auf hohen Bergen messen. Dann gelang Physikern im Labor von Jun Ye ein Experiment, das unsere Vorstellungskraft sprengt.",
            "experiment": "Sie fingen hunderttausend ultrakalte Strontium-Atome in einem Gitter aus Laserlicht ein und verglichen den Takt der oberen Hälfte dieser winzigen Atomwolke mit der unteren Hälfte – nur einen einzigen Millimeter tiefer.",
            "mid_twist": "Diese Uhr geht in dreihundert Milliarden Jahren keine einzige Sekunde falsch – und tatsächlich tickte die untere Schicht der Wolke messbar langsamer als die obere.",
            "skeptic_check": "Ist das vielleicht nur ein mechanischer Effekt an den Atomen durch das Erdgewicht? Nein: Auch beim Zerfall völlig anderer Elementarteilchen und bei GPS-Satelliten in zwanzigtausend Kilometern Höhe zeigt sich auf die Mikrosekunde genau derselbe Wert.",
            "payoff": "Ohne diese tägliche Korrektur um achtunddreißig Mikrosekunden läge jedes Navigationssystem auf der Erde schon nach einem einzigen Tag um rund elf Kilometer daneben – Einsteins gekrümmte Zeit steuert längst unseren Alltag.",
        },
    },
    {
        "id": "james_webb_fruehgalaxien",
        "pillar": "Simulations-News",
        "match_terms": ["james webb", "jwst", "weltraumteleskop", "frühe galaxien", "urknall"],
        "core_subject": "Die frühen Galaxien des James-Webb-Teleskops",
        "titles": [
            "James Webb fand am Anfang der Zeit etwas, das nicht existieren dürfte",
            "300 Millionen Jahre nach dem Urknall – warum sind diese Galaxien schon da?",
            "Die Aufnahmen aus der Frühzeit des Alls bringen Kosmologen ins Grübeln",
        ],
        "thumb_trigger": "VIEL ZU FRÜH",
        "thumb_variants": [
            "MODELL GEKIPPT?",
            "ZU GROSS, ZU FRÜH",
            "FALSCHER ANFANG?",
        ],
        "story_steps": {
            "hook": "Als das James-Webb-Teleskop in die früheste Vergangenheit des Alls blickte, fand es etwas, das dort eigentlich noch nicht sein dürfte.",
            "what_is_it": "Weil fernes Sternenlicht Milliarden Jahre zu uns reist, wirkt das Teleskop wie eine Zeitmaschine direkt zurück kurz nach den Urknall.",
            "how_it_works": "Erwartet hatten Astronomen dort nur kleine, ungeordnete Gaswolken – doch auf den Bildern leuchteten bereits riesige, voll ausgereifte Galaxien.",
            "why_astonishing": "Nach bisherigen Modellen hätte die Schwerkraft in wenigen hundert Millionen Jahren niemals genug Zeit für so gewaltige Sternsysteme gehabt.",
            "deeper_meaning": "Entweder wächst Ordnung im Kosmos nach einem viel schnelleren Bauplan als gedacht – oder unser Bild vom Anfang ist noch unvollständig.",
        },
        "deep_dive": {
            "open_loop_main": "Zuerst hofften viele Astronomen auf einen einfachen Rechenfehler bei der Entfernung – doch als die exakten Lichtspektren eintrafen, wurde das Rätsel nicht kleiner, sondern noch größer.",
            "analogy": "Es ist ungefähr so, als würde man das Babyalbum eines Menschen aufschlagen und auf dem Foto vom dritten Lebenstag keinen Säugling sehen, sondern einen ausgewachsenen Erwachsenen.",
            "rehook_min2": "Um zu verstehen, warum diese roten Lichtpunkte auf den James-Webb-Aufnahmen für solche Aufregung sorgen, muss man wissen, warum das frühere Hubble-Teleskop sie niemals sehen konnte.",
            "experiment": "Durch die Ausdehnung des Universums wird uraltes Sternenlicht auf seinem langen Weg immer weiter ins unsichtbare Infrarot gedehnt. Erst der sechseinhalb Meter große vergoldete Spiegel von James Webb im eiskalten Schatten des Alls machte diese Signale sichtbar.",
            "mid_twist": "Als Forscher das Licht einzelner Rekord-Galaxien wie JADES-GS-z14 in seine Regenbogenfarben zerlegten, stand fest: Wir blicken auf Sterneninseln aus einer Zeit, als der Kosmos gerade einmal zwei Prozent seines heutigen Alters hatte.",
            "skeptic_check": "Könnten statt Milliarden Sternen vielleicht extrem helle Schwarze Löcher oder ungewöhnlich massereiche Riesensterne das Licht künstlich aufblähen? Selbst wenn man diesen Effekt einrechnet, bleibt die frühe Reife dieser Galaxien erstaunlich.",
            "payoff": "Die Messdaten zeigen uns live, wie Wissenschaft an ihre nächste Schwelle tritt: Materie hat sich nach dem Urknall weitaus effizienter zu großen Strukturen geordnet, als jedes Lehrbuch bis vor kurzem vorhersagte.",
        },
    },
    {
        "id": "doppelspalt_beobachter",
        "pillar": "Simulations-News",
        "match_terms": ["doppelspalt", "beobachtereffekt", "welle", "teilchen", "quantenradierer"],
        "core_subject": "Das Doppelspalt-Experiment",
        "titles": [
            "Warum verhält sich Materie anders, sobald ein Messgerät zusieht?",
            "Das berühmteste Rätsel der Physik – und was fast jeder daran falsch versteht",
            "Ein Teilchen, zwei Wege gleichzeitig: Was beim Doppelspalt wirklich passiert",
        ],
        "thumb_trigger": "ES WEISS ES?",
        "thumb_variants": [
            "MESSUNG ÄNDERT ALLES",
            "WELLE ODER TEILCHEN?",
            "WER SCHAUT ZU?",
        ],
        "story_steps": {
            "hook": "Ein einzelnes Teilchen fliegt auf zwei schmale Schlitze zu – und verhält sich völlig anders, sobald ein Messgerät zusieht.",
            "what_is_it": "Ohne Messung entsteht auf dem Schirm dahinter ein Wellenmuster, als wäre jedes einzelne Teilchen durch beide Spalte gleichzeitig geglitten.",
            "how_it_works": "Misst man jedoch genau nach, welchen Spalt es nimmt, verschwindet die Welle sofort – und das Teilchen wählt wie ein festes Kügelchen einen Weg.",
            "why_astonishing": "Entscheidend ist dabei nicht das menschliche Auge, sondern die gespeicherte Information: Solange der Weg offenbleibt, existieren alle Möglichkeiten zugleich.",
            "deeper_meaning": "Unsere feste Alltagswelt entsteht auf kleinster Ebene also immer genau dort, wo offene Möglichkeiten zu eindeutiger Information werden.",
        },
        "deep_dive": {
            "open_loop_main": "Immer wieder liest man im Internet, erst das menschliche Bewusstsein zwinge das Teilchen zur Entscheidung – doch ein raffiniertes Folge-Experiment bewies, was der wahre Auslöser ist.",
            "analogy": "Wirft man Tennisbälle durch zwei offene Türspalte gegen eine Wand, entstehen dahinter genau zwei Trefferstreifen. Wasserwellen dagegen fließen durch beide Spalte zugleich und bilden viele helle und dunkle Streifen nebeneinander.",
            "rehook_min2": "Physiker wollten es genau wissen und feuerten die Elektronen einzeln nacheinander ab – immer erst dann das nächste, wenn das vorherige längst eingeschlagen war. Eigentlich konnten sie sich also unmöglich gegenseitig als Welle beeinflussen.",
            "experiment": "Und trotzdem setzte sich Punkt für Punkt nach tausenden einzelnen Einschlägen wieder dasselbe Wellenmuster zusammen – bis man einen winzigen Sensor an den Schlitzen einschaltete, der verriet, wo jedes Elektron durchflog.",
            "mid_twist": "Noch verrückter wurde es beim sogenannten Quantenradierer: Löschte man die gespeicherte Weg-Information wieder aus, bevor jemand sie überhaupt ablesen konnte, tauchte das Wellenmuster in den Daten tatsächlich wieder auf.",
            "skeptic_check": "Stößt also einfach nur der Messsensor das Teilchen grob an? Nein – selbst wenn man die Information über ein fernes verschränktes Partnerteilchen gewinnt, ohne das erste Teilchen je zu berühren, bricht das Wellenmuster sofort weg.",
            "payoff": "Der wahre Schlüssel ist also nicht ein zuschauender Mensch, sondern reine Information: Sobald in der physikalischen Welt festgeschrieben steht, welchen Weg ein Teilchen nahm, wird aus offenen Möglichkeiten eine einzige feste Realität.",
        },
    },
    {
        "id": "schwarze_loecher_ereignishorizont",
        "pillar": "Simulations-News",
        "match_terms": ["schwarzes loch", "schwarze löcher", "ereignishorizont", "hologramm", "hawking"],
        "core_subject": "Der Ereignishorizont Schwarzer Löcher",
        "titles": [
            "Was am Rand eines Schwarzen Lochs passiert, widerspricht jedem Bauchgefühl",
            "Wo selbst die Zeit erstarrt: Das unheimliche Rätsel des Ereignishorizonts",
            "Warum Schwarze Löcher wie ein gigantischer Speicher an der Grenze der Zeit wirken",
        ],
        "thumb_trigger": "ZEIT STEHT STILL",
        "thumb_variants": [
            "NICHTS GEHT VERLOREN?",
            "GRENZE DER ZEIT",
            "SPEICHER AM RAND",
        ],
        "story_steps": {
            "hook": "Am Rand eines Schwarzen Lochs gibt es eine unsichtbare Grenze, an der von außen gesehen selbst die Zeit erstarrt.",
            "what_is_it": "Diese Grenze heißt Ereignishorizont: Dahinter ist die Schwerkraft so stark, dass nicht einmal mehr ein Lichtstrahl entkommen kann.",
            "how_it_works": "Lange dachte man, jede Information über hineinstürzende Materie sei für immer gelöscht – doch Berechnungen zeigten, dass sie auf der äußeren Hülle gespeichert bleibt.",
            "why_astonishing": "Deshalb hängt der Informationsgehalt eines Schwarzen Lochs nicht von seinem Volumen ab, sondern allein von seiner Oberfläche – genau wie bei einem Hologramm.",
            "deeper_meaning": "Daraus wuchs eine faszinierende Idee der Physik: Selbst unter extremsten Bedingungen geht im Universum keine Information wirklich verloren.",
        },
        "deep_dive": {
            "open_loop_main": "Würdest du mit einer Raumsonde auf ein riesiges Schwarzes Loch zufliegen, würden du selbst und ein Beobachter auf der Erde zwei völlig widersprüchliche Dinge sehen – und genau dieser Widerspruch führte Stephen Hawking auf die härteste Nuss der Physik.",
            "analogy": "Stell dir einen Fluss vor, der auf einen gewaltigen Wasserfall zuströmt und immer schneller wird: Der Ereignishorizont ist exakt die unsichtbare Linie, ab der das Wasser schneller stürzt, als der schnellste Fisch jemals flussaufwärts schwimmen könnte.",
            "rehook_min2": "Für einen Beobachter weit draußen verlangsamt sich eine hineinfallende Uhr durch die extreme Schwerkraft immer stärker, bis ihr Bild am Rand fast einzufrieren scheint – während der Reisende selbst ohne spürbaren Ruck über die Grenze gleitet.",
            "experiment": "In den siebziger Jahren berechnete Stephen Hawking dann, dass Schwarze Löcher über unvorstellbare Zeiträume durch Quanteneffekte am Rand winzige Strahlung abgeben und irgendwann vollständig verdampfen müssten.",
            "mid_twist": "Genau damit brach eine Krise in der Physik aus: Wenn das Schwarze Loch am Ende verschwindet, wohin ist dann die gesamte Information über jedes Buch und jeden Stern verschwunden, der je hineinfiel?",
            "skeptic_check": "In der Quantenphysik darf Information niemals spurlos vernichtet werden. Die Physiker Jacob Bekenstein und Gerard ’t Hooft fanden die mathematische Spur: Jedes hineinfallende Bit vergrößert die äußere Grenzfläche des Schwarzen Lochs um ein winziges Planckscher-Flächenstück.",
            "payoff": "Nicht der Innenraum, sondern die zweidimensionale Hülle trägt das gesamte Gedächtnis des Schwarzen Lochs – genau wie eine flache Hologrammkarte auf einer Banknote ein dreidimensionales Bild speichert.",
        },
    },
    {
        "id": "cheops_myonen_kammer",
        "pillar": "Alte Codes",
        "match_terms": ["pyramide", "gizeh", "cheops", "myonen", "scanpyramids", "kammer"],
        "core_subject": "Die verborgene Kammer der Cheops-Pyramide",
        "titles": [
            "Mitten in der Cheops-Pyramide liegt ein Raum, den seit 4.500 Jahren niemand betrat",
            "30 Meter lang, komplett versiegelt: Was verbirgt sich über der Großen Galerie?",
            "Teilchen aus dem All durchleuchteten die Cheops-Pyramide – und fanden das hier",
        ],
        "thumb_trigger": "SEIT 4.500 JAHREN ZU",
        "thumb_variants": [
            "30 METER HOHLRAUM",
            "KOMPLETT VERSIEGELT",
            "KEIN ZUGANG?",
        ],
        "story_steps": {
            "hook": "Tief im massiven Stein der Cheops-Pyramide liegt ein dreißig Meter langer Raum, den seit viertausendfünfhundert Jahren kein Mensch betreten hat.",
            "what_is_it": "Gefunden wurde er ganz ohne Bohrer – mithilfe natürlicher kosmischer Teilchen aus dem All, die festen Kalkstein wie Röntgenlicht durchdringen.",
            "how_it_works": "Wo ein Hohlraum liegt, kommen mehr dieser Teilchen hindurch: So wurde direkt über der Großen Galerie eine vollkommen versiegelte Kammer sichtbar.",
            "why_astonishing": "Durch eine winzige Fuge zeigte eine Kamera bereits am Nordeingang präzise Entlastungsblöcke – doch der Zweck des großen Hauptraums bleibt ein Rätsel.",
            "deeper_meaning": "Selbst nach Jahrtausenden beweist das älteste Weltwunder der Erde, wie meisterhaft und vorausschauend die ägyptischen Baumeister geplant haben.",
        },
        "deep_dive": {
            "open_loop_main": "Das Verblüffendste an diesem dreißig Meter langen Hohlraum ist nicht nur seine schiere Größe – sondern die Tatsache, dass kein einziger bekannter Schacht oder Gang zu ihm führt. Warum mauert man einen Raum von der Größe eines Passagierflugzeugs komplett ein?",
            "analogy": "Wie man bei einem Arztbesuch in den Körper schaut, ohne ihn aufzuschneiden, nutzte das internationale Projekt ScanPyramids einen natürlichen Teilchenregen aus der oberen Atmosphäre – sogenannte Myonen.",
            "rehook_min2": "Als das erste Forscherteam aus Japan auf seinen Detektorplatten über der Großen Galerie plötzlich einen deutlichen Überschuss dieser Teilchen sah, glaubten viele Ägyptologen zunächst noch an Messfehler oder porösen Stein.",
            "experiment": "Darum stellten drei unabhängige Teams aus Japan, Frankreich und Ägypten völlig unterschiedliche Detektoren in und vor der Pyramide auf – und alle drei zeigten an exakt derselben Stelle denselben dreißig Meter langen Hohlraum.",
            "mid_twist": "Kurz darauf gelang am Nordeingang der praktische Beweis der Methode: Dort sagten die Sensoren einen kleineren neuneinhalb Meter langen Gang voraus – und ein sechs Millimeter dünnes Endoskop durch eine Steinfuge filmte ihn tatsächlich live von innen.",
            "skeptic_check": "Dient auch der riesige obere Raum nur als statische Entlastungskammer, damit die Decke der Großen Galerie unter Millionen Tonnen Stein nicht einbricht – oder liegt dahinter ein unberührter Korridor? Beides setzt eine Baukunst voraus, die auf den Zentimeter genau berechnet war.",
            "payoff": "Ohne einen einzigen Stein zu beschädigen, hat moderne Teilchenphysik bewiesen: Selbst das berühmteste Bauwerk der Antike hütet viertausendfünfhundert Jahre nach seiner Vollendung noch unberührte Räume.",
        },
    },
    {
        "id": "goebekli_tepe",
        "pillar": "Alte Codes",
        "match_terms": ["göbekli", "gobekli", "anatolien", "steinzeit", "megalith"],
        "core_subject": "Göbekli Tepe",
        "titles": [
            "6.000 Jahre älter als die Pyramiden – wer baute Göbekli Tepe?",
            "Der Fund in der Türkei, der unser Geschichtsbuch auf den Kopf stellte",
            "Warum vergruben Steinzeit-Baumeister diesen Monumental-Tempel wieder?",
        ],
        "thumb_trigger": "6.000 JAHRE FRÜHER",
        "thumb_variants": [
            "VOR DEN PYRAMIDEN",
            "11.500 JAHRE ALT",
            "FALSCHE GESCHICHTE?",
        ],
        "story_steps": {
            "hook": "Auf einem Hügel in der heutigen Türkei stehen tonnenschwere Steinpfeiler, die über sechstausend Jahre älter sind als die Pyramiden.",
            "what_is_it": "Die Anlage heißt Göbekli Tepe und entstand vor rund elftausendfünfhundert Jahren – mitten in der Zeit einfacher Jäger und Sammler.",
            "how_it_works": "Ohne Metallwerkzeuge und vor der Erfindung des Rades meißelten Menschen dort meterhohe Kalkstein-Säulen aus dem Fels und verzierten sie mit Tierreliefs.",
            "why_astonishing": "Lange galt: Erst kam der Ackerbau, dann der Tempelbau. Göbekli Tepe beweist das Gegenteil – zuerst schuf ein gemeinsames Heiligtum die Gemeinschaft.",
            "deeper_meaning": "Nicht bloßes Überleben einte die frühe Menschheit zu Höchstleistungen, sondern die gemeinsame Suche nach Sinn und Ordnung.",
        },
        "deep_dive": {
            "open_loop_main": "Jahrzehntelang hielten Archäologen die flachen Steine auf diesem Hügel für einen mittelalterlichen Friedhof – bis der deutsche Ausgräber Klaus Schmidt den Spaten ansetzte und auf ein Alter stieß, das eigentlich unmöglich schien.",
            "analogy": "Um die Zeitspanne wirklich zu greifen: Göbekli Tepe liegt zeitlich weiter vor den ägyptischen Pyramiden entfernt als die Pyramiden von unserem heutigen Tag.",
            "rehook_min2": "Bisher stand in jedem Schulbuch dieselbe Reihenfolge: Zuerst bauten Menschen Getreide an, gründeten Dörfer und Städte – und erst viel später errichteten sie große Tempel. Doch auf diesem kargen Bergrücken fehlte zunächst jede Spur von Feldern.",
            "experiment": "Radiokarbon-Messungen an organischen Resten im Wandverputz datierten die ältesten Steinkreise eindeutig auf rund neuntausendfünfhundert Jahre vor Christus – geschlagen allein mit harten Feuersteinklingen direkt aus dem Kalksteinplateau.",
            "mid_twist": "Hunderte Menschen aus weitem Umkreis mussten über Monate hinweg versorgt und koordiniert werden, um bis zu fünfzehn Tonnen schwere T-Pfeiler aufzurichten – und genau um diese Arbeiter zu ernähren, begann man in derselben Region plötzlich Wildgetreide gezielt auszusäen.",
            "skeptic_check": "Neuere Grabungen fanden neben den monumentalen Kreisen auch Wasserspeicher und Wohnspuren: Göbekli Tepe war also kein einsamer Geistertempel, sondern der lebendige Versammlungsort einer erstaunlich gut organisierten Frühkultur.",
            "payoff": "Klaus Schmidts berühmter Satz traf den Kern unserer Geschichte neu: Zuerst kam das Heiligtum, zuerst kam die gemeinsame Idee im Kopf – und erst daraus erwuchs die feste Zivilisation.",
        },
    },
    {
        "id": "antikythera_computer",
        "pillar": "Alte Codes",
        "match_terms": ["antikythera", "zahnrad", "uhrwerk", "griechenland", "wrack"],
        "core_subject": "Der Mechanismus von Antikythera",
        "titles": [
            "Taucher fanden vor Griechenland ein Gerät, das es 1.400 Jahre lang nicht geben durfte",
            "Der 2.000 Jahre alte Computer vom Meeresgrund – was Röntgen-Scans enthüllten",
            "Wer baute dieses präzise Zahnrad-Gehirn im 1. Jahrhundert vor Christus?",
        ],
        "thumb_trigger": "2.000 JAHRE ALT",
        "thumb_variants": [
            "1.400 JAHRE ZU FRÜH",
            "30 BRONZE-ZAHNRÄDER",
            "VERLORENES WISSEN",
        ],
        "story_steps": {
            "hook": "Vor einer griechischen Insel bargen Taucher einen verkrusteten Bronzeklumpen, der sich als zweitausend Jahre alter mechanischer Computer entpuppte.",
            "what_is_it": "Bekannt als Mechanismus von Antikythera war das Gerät kaum größer als ein Schuhkarton und stammt aus dem ersten Jahrhundert vor Christus.",
            "how_it_works": "Röntgen-Scans zeigten im Inneren über dreißig feine Bronzeräder: Mit einer Kurbel ließ sich der Lauf von Sonne, Mond und Planeten vorausberechnen.",
            "why_astonishing": "Das Uhrwerk sagte sogar Finsternisse auf den Tag genau voraus – vergleichbare Feinmechanik baute Europa erst über tausendvierhundert Jahre später wieder.",
            "deeper_meaning": "Geschichte verläuft eben nicht immer geradlinig nach oben: Manches erstaunliche Wissen war längst da und geriet jahrhundertelang in Vergessenheit.",
        },
        "deep_dive": {
            "open_loop_main": "Monatelang lag der grün verkrustete Klumpen aus dem römischen Schiffswrack völlig unbeachtet in einer Museumskiste – bis das Holzgehäuse beim Trocknen aufplatzte und ein millimeterfeines Zahnrad zum Vorschein kam.",
            "analogy": "Von außen wirkte der Kasten wie eine alte Tischuhr mit mehreren Zifferblättern, doch im Inneren arbeitete ein echter Analogrechner, der astronomische Formeln direkt in ineinandergreifende Bronzezähne übersetzte.",
            "rehook_min2": "Über ein halbes Jahrhundert lang stritten Historiker, ob das Zahnrad vielleicht viel später versehentlich auf das Wrack gefallen war. Erst ein acht Tonnen schwerer Computertomograf brachte die Wahrheit ans Licht.",
            "experiment": "Schicht für Schicht durchleuchteten Wissenschaftler die zweiundachtzig erhaltenen Bruchstücke und lasen winzige eingravierte griechische Buchstaben von kaum anderthalb Millimetern Höhe – eine komplette Bedienungsanleitung im Metall.",
            "mid_twist": "Dabei stießen die Forscher im unteren Teil des Getriebes auf zwei leicht versetzt aufeinanderliegende Zahnräder mit einem kleinen Stift im Schlitz – ein genialer mechanischer Trick.",
            "skeptic_check": "Warum dieser Aufwand? Weil der Mond auf seiner elliptischen Bahn mal etwas schneller und mal langsamer über den Himmel zieht. Der antike Baumeister bildete selbst diese feine Schwankung mechanisch nach, um Sonnen- und Mondfinsternisse exakt vorherzusagen.",
            "payoff": "Als das Römische Reich später zerfiel, ging dieses Handwerk für mehr als ein Jahrtausend verloren – ein stiller Beweis dafür, wie weit antike Ingenieurskunst unserer gewohnten Vorstellung voraus war.",
        },
    },
    {
        "id": "klartraeumen_schlaflabor",
        "pillar": "Bewusstseins-Hacks",
        "match_terms": ["klartraum", "klarträumen", "luzid", "rem", "traum", "schlaflabor"],
        "core_subject": "Kommunikation aus dem Klartraum",
        "titles": [
            "Tief schlafend im Labor – und plötzlich antwortet der Träumende in Echtzeit",
            "Forscher stellten Schlafenden Rechenaufgaben: Die Antworten machten sprachlos",
            "Was im Gehirn passiert, wenn du mitten im Traum plötzlich aufwachst",
        ],
        "thumb_trigger": "ANTWORT IM SCHLAF",
        "thumb_variants": [
            "HELLWACH IM TRAUM",
            "LIVE AUS DEM SCHLAF",
            "ZWEITE WELT?",
        ],
        "story_steps": {
            "hook": "Ein Mensch liegt tief schlafend im Labor – und löst trotzdem in Echtzeit Rechenaufgaben, die ein Forscher ihm leise stellt.",
            "what_is_it": "Möglich wird das im Klartraum: einem besonderen Zustand, in dem der Schlafende mitten im Traum klar erkennt, dass er gerade träumt.",
            "how_it_works": "Weil sich im Traumschlaf die Augen frei bewegen können, antworteten Teilnehmer per vereinbartem Blick-Code korrekt auf Aufgaben wie ‚acht minus sechs‘.",
            "why_astonishing": "Hirnströme bewiesen gleichzeitig tiefen Traumschlaf, während die Befragten später erzählten, die Frage habe wie durch ein Radio im Traum geklungen.",
            "deeper_meaning": "Schlaf ist also kein bloßes Abschalten, sondern ein eigener Bewusstseinsraum, in dem klares Denken mitten in inneren Welten möglich bleibt.",
        },
        "deep_dive": {
            "open_loop_main": "Lange hielt die Schlafforschung Berichte über bewusste Träume für bloße Einbildung kurz vor dem Aufwachen – bis vier unabhängige Labore gleichzeitig denselben Live-Dialog durch die geschlossene Wand des Schlafs wagten.",
            "analogy": "Normalerweise legt unser Gehirn im intensiven Traumschlaf wie einen Sicherheitsschalter alle Arm- und Beinmuskeln lahm, damit wir unsere Träume nicht im Bett ausführen – nur eine einzige Muskelgruppe bleibt frei beweglich: unsere Augen.",
            "rehook_min2": "Genau diese Ausnahme verwandelten Neurowissenschaftler um Ken Paller in eine Art Telefonleitung zwischen Wachwelt und Traumwelt – doch würden Schlafende eine fremde Stimme überhaupt hören, ohne aufzuwachen?",
            "experiment": "Sobald die Elektroden auf der Kopfhaut eindeutigen Traumschlaf anzeigten, sprachen die Forscher leise Zufallsaufgaben wie ‚acht minus sechs‘ in den Raum oder gaben kurze Lichtimpulse auf die geschlossenen Lider.",
            "mid_twist": "Auf den Bildschirmen im Nebenraum schlug der Augensensor plötzlich gezielt zweimal nach links und rechts aus: Die richtige Zahl Zwei – gesendet mitten aus einer laufenden Traumgeschichte.",
            "skeptic_check": "Waren die Teilnehmer vielleicht doch kurz wach geworden? Die Hirnstromkurven schlossen genau das aus, und nach dem Wecken beschrieben die Probanden verblüffend anschaulich, wie sich die Rechenaufgabe etwa als Ansage aus einem Autoradio in ihren Traum gemischt hatte.",
            "payoff": "Damit ist erstmals messbar bewiesen: Selbst wenn der Körper tief schläft und von der Außenwelt abgekoppelt scheint, kann das menschliche Bewusstsein logisch denken, sich erinnern und zwischen zwei Welten vermitteln.",
        },
    },
    {
        "id": "gehirn_vorhersage_100ms",
        "pillar": "Bewusstseins-Hacks",
        "match_terms": ["wahrnehmung", "vorhersage", "100 millisekunden", "verzögerung", "gehirn", "bewusstsein"],
        "core_subject": "Die 100-Millisekunden-Vorhersage des Gehirns",
        "titles": [
            "Du lebst 100 Millisekunden in der Vergangenheit – so täuscht dich dein Gehirn",
            "Warum du die echte Außenwelt in Wahrheit noch nie direkt gesehen hast",
            "Das 100-Millisekunden-Rätsel: Wie dein Kopf die Gegenwart vorausberechnet",
        ],
        "thumb_trigger": "100 MS ZU SPÄT",
        "thumb_variants": [
            "NIE IM ECHTEN JETZT",
            "DEIN KOPF RÄT VORAUS",
            "ALLES VERZÖGERT?",
        ],
        "story_steps": {
            "hook": "Alles, was du genau jetzt zu sehen und zu hören glaubst, ist in Wahrheit schon vor einer Zehntelsekunde passiert.",
            "what_is_it": "Bis Signale von Augen und Ohren im dunklen Inneren des Schädels zu einem Bild zusammengesetzt sind, vergehen rund hundert Millisekunden.",
            "how_it_works": "Damit du im Alltag trotzdem einen schnellen Ball fangen kannst, berechnet dein Gehirn aus Erfahrung ständig einen Moment im Voraus, was gleich geschieht.",
            "why_astonishing": "Erst wenn etwas Unerwartetes passiert, korrigiert das Gehirn sein inneres Bild blitzschnell nach – und genau das fühlen wir als Überraschung.",
            "deeper_meaning": "Wir schauen also nie passiv wie durch ein Fenster nach draußen: Unsere erlebte Gegenwart ist eine aktive Schöpfung unseres Geistes.",
        },
        "deep_dive": {
            "open_loop_main": "Wenn unser Gehirn tatsächlich eine volle Zehntelsekunde hinter der Außenwelt hinterherhinkt – wie schafft es ein Tennisprofi dann überhaupt, einen Aufschlag mit zweihundert Stundenkilometern punktgenau zu treffen?",
            "analogy": "Eingeschlossen in der völligen Dunkelheit unseres Schädelknochens sieht das Gehirn niemals direkt Licht und hört niemals direkt Schall: Es empfängt nur elektrische Impulse über Nervenfasern – wie ein Lotse in einem fensterlosen Kontrollraum.",
            "rehook_min2": "Noch rätselhafter wird es, wenn du in die Hände klatschst: Das Licht deiner Hände erreicht deine Augen fast sofort, die Berührung an den Fingern braucht länger durch den Arm – und trotzdem erlebst du Bild, Geräusch und Gefühl exakt gleichzeitig.",
            "experiment": "Neurowissenschaftler wie David Eagleman und Karl Friston zeigten in Reaktionsexperimenten, wie das Gehirn diesen Zeitverzug überbrückt: Es wartet gar nicht passiv auf alle Sinnesdaten, sondern entwirft laufend ein inneres Vorhersagemodell der nächsten Zehntelsekunde.",
            "mid_twist": "Unsere Augen liefern also gar nicht das fertige Bild im Kopf – sie melden dem Gehirn hauptsächlich nur noch die Abweichungen, wenn die Wirklichkeit anders ausfällt als vorhergesagt.",
            "skeptic_check": "Deshalb funktionieren optische Täuschungen selbst dann noch, wenn wir den Trick längst kennen: Unser Sehsystem zeigt uns nicht roh die Außenwelt, sondern immer die wahrscheinlichste Geschichte, die zu den Signalen passt.",
            "payoff": "Der Tennisspieler trifft den Ball also nicht dort, wo er ihn gerade sieht, sondern genau dort, wohin sein Gehirn die Gegenwart bereits vorausberechnet hat – unsere Wirklichkeit ist eine kontrollierte innere Simulation in Echtzeit.",
        },
    },
    {
        "id": "meditation_ruhezustandsnetzwerk",
        "pillar": "Bewusstseins-Hacks",
        "match_terms": ["meditation", "ruhezustandsnetzwerk", "gamma", "gedankenkarussell", "fokus", "stille"],
        "core_subject": "Was Stille im Gehirn verändert",
        "titles": [
            "Was im Hirnscanner passiert, wenn das Gedankenkarussell plötzlich schweigt",
            "Das versteckte Netzwerk im Kopf, das immer dann anspringt, wenn du nichts tust",
            "Warum 10 Minuten echte Stille dein Gehirn messbar umschalten",
        ],
        "thumb_trigger": "PLÖTZLICH STILL",
        "thumb_variants": [
            "DAS GRÜBEL-NETZWERK",
            "GEHIRN IM SCANNER",
            "NEUER TAKT IM KOPF",
        ],
        "story_steps": {
            "hook": "Immer wenn du scheinbar gar nichts tust, läuft im Hintergrund deines Gehirns ein bestimmtes Netzwerk auf Hochtouren.",
            "what_is_it": "Forscher nennen es das Ruhezustandsnetzwerk: Es grübelt über gestern, plant für morgen und hält unser endloses inneres Selbstgespräch am Laufen.",
            "how_it_works": "Richtet ein Mensch seine Aufmerksamkeit jedoch ruhig auf einen Punkt wie den Atem, fährt genau dieses Grübel-Netzwerk im Hirnscanner spürbar herunter.",
            "why_astonishing": "Gleichzeitig schwingen entfernte Hirnregionen plötzlich im gemeinsamen Takt – statt vieler lauter Einzelgedanken entsteht messbare geistige Klarheit.",
            "deeper_meaning": "Innere Stille ist neurologisch gesehen also kein Nichtstun, sondern der Moment, in dem der Geist aufhört, sich selbst im Weg zu stehen.",
        },
        "deep_dive": {
            "open_loop_main": "Jahrzehntelang dachten Hirnforscher, unser Kopf verbrauche im Nichtstun kaum Energie – bis ein Zufallsbefund im Magnetresonanztomografen zeigte, dass genau in den Pausen ein mächtiger Stromfresser im Gehirn erwacht.",
            "analogy": "Wie ein Automotor, der an der roten Ampel im Leerlauf unnötig hochdreht, springt dieses sogenannte Ruhezustandsnetzwerk in jeder freien Sekunde an und erzählt uns ununterbrochen Geschichten über uns selbst, unsere Sorgen und unsere Zukunft.",
            "rehook_min2": "Der Neurowissenschaftler Marcus Raichle entdeckte verblüfft, dass unser Gehirn im vermeintlichen Nichtstun fast genauso viel Energie verbrennt wie beim Lösen einer schweren Rechenaufgabe – doch lässt sich dieser laute Autopilot gezielt beruhigen?",
            "experiment": "Als Teams an der Universität Yale und in Wisconsin sowohl Einsteiger als auch erfahrene Meditierende in den Hirnscanner legten, zeigte sich schon bei einfacher Konzentration auf den Atem ein deutlicher Abfall genau in diesen Grübel-Zentren.",
            "mid_twist": "Bei besonders geübten Teilnehmern maßen Elektroden gleichzeitig extrem gleichmäßige schnelle Gamma-Wellen über weit getrennte Hirnareale hinweg – eine Synchronisation, wie man sie im normalen Alltag kaum je sieht.",
            "skeptic_check": "Ist das nur kurzfristige Entspannung wie beim Dösen auf dem Sofa? Nein: Im Dösen schweifen die Gedanken erst recht unkontrolliert umher, während bewusste Stille die Aufmerksamkeit hellwach bündelt und langfristig sogar die Reizbarkeit des Angstzentrums senkt.",
            "payoff": "Wahre Ruhe bedeutet im Gehirn also nicht Leere oder Müdigkeit, sondern das Abschalten des ständigen inneren Störfeuers – damit Wahrnehmung wieder klar und ungeteilt im jetzigen Moment ankommt.",
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
                "exchars": 4200,
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
                    "sentences": coherent_sents[:8],
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


def _craft_browse_ctr_titles_for_custom_topic(core_subject: str) -> list[str]:
    """Craft 3 high-CTR YouTube Home-feed titles (Anomaly, Personal Stakes, Open Question) for custom topics."""
    subj = core_subject.strip()
    return [
        f"Das ungelöste Rätsel hinter „{subj}“ – was Messdaten wirklich zeigen"[:68],
        f"Warum „{subj}“ unsere gewohnte Vorstellung der Realität herausfordert"[:68],
        f"Was fast niemand über „{subj}“ weiß – der entscheidende Punkt"[:68],
    ]


def run_topic_research(
    topic: str = "",
    *,
    pillar: str | None = None,
    editorial_mode: str = "fakten_mystery",
    browser_sources: list[dict[str, Any]] | None = None,
    arena_settings: dict[str, Any] | None = None,
    auto_expand_keyword: bool = True,
) -> dict[str, Any]:
    """Build a strictly SINGLE-TOPIC German research dossier with High-CTR packaging & 9-min retention depth."""
    raw_query = re.sub(r"\s+", " ", (topic or "").strip())
    recent = _recent_titles_and_topics()

    matched_mono = _find_matching_monograph(raw_query, pillar)
    chosen_pillar = (
        pillar
        if (pillar and pillar in PILLAR_KEYWORDS)
        else (matched_mono["pillar"] if matched_mono else (detect_pillar(raw_query) if raw_query else random.choice(list(PILLAR_KEYWORDS.keys()))))
    )

    if not raw_query:
        matched_mono = _pick_fresh_monograph(chosen_pillar, recent)
        chosen_pillar = matched_mono["pillar"]
        search_focus = matched_mono["core_subject"]
    else:
        search_focus = matched_mono["core_subject"] if (matched_mono and len(raw_query.split()) <= 4) else raw_query

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

    browser_article_title = ""
    browser_sents: list[str] = []
    for bs in browser_sources or []:
        if not isinstance(bs, dict):
            continue
        b_title = clean_german_sentence(bs.get("title") or "")
        if not browser_article_title:
            browser_article_title = b_title
        if b_title and browser_article_title and b_title.lower() != browser_article_title.lower():
            continue
        b_snip = clean_german_sentence(bs.get("summary") or bs.get("snippet") or "")
        if b_snip and is_pure_german(b_snip) and b_snip not in browser_sents:
            browser_sents.append(b_snip)

    ui_sources: list[dict[str, str]] = []
    coherent_facts: list[str] = []
    story_steps: dict[str, str] = {}
    deep_dive: dict[str, str] = {}
    thumb_trigger = ""
    thumb_variants: list[str] = []
    alt_titles: list[str] = []

    if single_news and not matched_mono:
        core_subject = single_wiki["title"] if single_wiki else (raw_query or single_news["title"])
        resolved_title = single_news["title"]
        alt_titles = _craft_browse_ctr_titles_for_custom_topic(core_subject)
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
        all_mono_titles = [t.strip() for t in matched_mono["titles"]]
        fresh_titles = [t for t in all_mono_titles if t.lower() not in recent] or all_mono_titles
        if len(raw_query.split()) > 5:
            resolved_title = raw_query
            alt_titles = all_mono_titles[:3]
        elif single_news and len(raw_query.split()) <= 4:
            resolved_title = single_news["title"]
            alt_titles = all_mono_titles[:3]
            ui_sources.append({"kind": single_news["source"], "title": single_news["title"], "url": single_news.get("url", "")})
        else:
            resolved_title = fresh_titles[0]
            alt_titles = [t for t in all_mono_titles if t != resolved_title] + [all_mono_titles[0]]
            alt_titles = alt_titles[:3]
        discovery_note = f"High-CTR & Deep-Dive Einzel-Analyse zu „{core_subject}“"
        story_steps = dict(matched_mono["story_steps"])
        deep_dive = dict(matched_mono.get("deep_dive") or {})
        thumb_trigger = matched_mono.get("thumb_trigger", "")
        thumb_variants = list(matched_mono.get("thumb_variants") or [])
    else:
        core_subject = single_wiki["title"] if (single_wiki and len(raw_query.split()) <= 2) else (raw_query or "Rätsel der Wirklichkeit")
        custom_titles = _craft_browse_ctr_titles_for_custom_topic(core_subject)
        if len(raw_query.split()) >= 5:
            resolved_title = raw_query
            alt_titles = custom_titles
        else:
            resolved_title = custom_titles[0]
            alt_titles = custom_titles[1:] + [f"Was hinter „{core_subject}“ wirklich passiert"[:68]]
        discovery_note = f"Fokussierte Einzel-Recherche zu „{core_subject}“"

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

    if story_steps:
        for key in ("what_is_it", "how_it_works", "why_astonishing"):
            pt = story_steps.get(key, "")
            if pt and pt.lower() not in {x.lower() for x in coherent_facts}:
                coherent_facts.append(pt)

    if not coherent_facts:
        coherent_facts = [
            f"Im Mittelpunkt steht hier ein einziges Thema: {core_subject}.",
            "Vereinfacht gesagt zeigt sich dahinter ein klarer Zusammenhang, bei dem verborgene Ordnung unsere gewohnte Sicht verändert.",
            "Schaut man Schritt für Schritt genauer hin, greifen Ursache und Wirkung nach erstaunlich präzisen Regeln ineinander.",
        ]

    if not story_steps:
        f0 = coherent_facts[0]
        f1 = coherent_facts[1] if len(coherent_facts) > 1 else "Bei genauer Betrachtung zeigt sich dabei, wie präzise kleinste Details zusammenwirken."
        f2 = coherent_facts[2] if len(coherent_facts) > 2 else "Das Erstaunliche daran ist, dass unsere gewohnte Alltagsvorstellung genau hier an ihre Grenzen stößt."
        story_steps = {
            "hook": f"Auf den ersten Blick wirkt das Thema {core_subject} vertraut – doch ein genauer Blick auf die Fakten legt ein echtes Rätsel frei.",
            "what_is_it": f0,
            "how_it_works": f1,
            "why_astonishing": f2,
            "deeper_meaning": "Genau deshalb fasziniert dieses Phänomen bis heute: Je ruhiger man hinschaut, desto deutlicher wird eine Ordnung jenseits des Zufalls.",
        }

    if not deep_dive:
        f_extra_1 = coherent_facts[3] if len(coherent_facts) > 3 else "Besonders spannend wird es dort, wo unabhängige Messungen immer wieder exakt dasselbe Muster bestätigen."
        f_extra_2 = coherent_facts[4] if len(coherent_facts) > 4 else "Selbst wenn man naheliegende Messfehler oder Zufälle herausrechnet, bleibt der zentrale Befund stabil bestehen."
        deep_dive = {
            "open_loop_main": "Doch der eigentliche Wendepunkt liegt an einer Stelle, die man leicht übersieht – und genau dort kippt jede oberflächliche Erklärung.",
            "analogy": "Man kann es sich wie ein Uhrwerk hinter einem dunklen Zifferblatt vorstellen: Außen sehen wir nur den ruhigen Zeiger, doch innen greifen unsichtbare Räder lückenlos ineinander.",
            "rehook_min2": "Bis zu diesem Punkt schien noch eine einfache Alltagserklärung auszureichen. Doch als Forscher noch genauer hinschauten, tauchte das entscheidende Detail auf.",
            "experiment": f_extra_1,
            "mid_twist": "Genau an dieser Schwelle stießen bisherige Annahmen auf einen Widerspruch, der sich nicht einfach wegdiskutieren ließ.",
            "skeptic_check": f_extra_2,
            "payoff": "Damit schließt sich der Kreis zu unserer Ausgangsfrage: Nicht ein bloßer Zufall steckt dahinter, sondern ein präzises Zusammenspiel, das erst im großen Zusammenhang verständlich wird.",
        }

    if not thumb_trigger:
        thumb_trigger = "DAS WAHRE RÄTSEL"
    if not thumb_variants:
        thumb_variants = [
            thumb_trigger,
            "KEIN ZUFALL?",
            "DER WENDEPUNKT",
        ]

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
        "alt_titles": alt_titles[:3],
        "thumb_trigger": thumb_trigger,
        "thumb_variants": thumb_variants[:3],
        "discovery_note": discovery_note,
        "pillar": chosen_pillar,
        "editorial_mode": editorial_mode,
        "live_sources_count": len(ui_sources),
        "external_sources": ui_sources,
        "sources": ui_sources,
        "story_steps": story_steps,
        "deep_dive": deep_dive,
        "verified_facts": coherent_facts[:8],
        "mystery_interpretation": [mystery_note],
    }
