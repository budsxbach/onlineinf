#!/usr/bin/env python3
"""Prüft Sachregister-Verweise inhaltlich gegen das PDF.

tools/check-index.py testet nur, ob eine Kapitelnummer existiert. Dieses
Skript prüft zusätzlich, ob das Stichwort (oder sein Wortstamm) im Text des
angegebenen Abschnitts überhaupt vorkommt. Meldungen sind Hinweise zur
manuellen Sichtung - nicht jeder Treffer ist ein Fehler (Synonyme, alte
Bezeichnungen), aber jeder gemeldete Eintrag sollte angeschaut werden.

Aufruf:  python3 tools/check-refs.py
"""
import pathlib
import re
import sys

import pymupdf

ROOT = pathlib.Path(__file__).resolve().parent.parent
PDF = ROOT / "ausgabe" / "organikum-vorschau.pdf"
SRC = ROOT / "manuskript" / "h-anhang.typ"

HEADING_RE = re.compile(r"^([A-H]\.\d+(?:\.\d+)*)\s+(\S.*)$")
VORSCHR_RE = re.compile(r"^VORSCHRIFT (D\.\d+\.\d+)\s+(.+)$")


def norm(s: str) -> str:
    s = s.replace("\u00ad", "").replace("-\n", "").replace("\n", " ")
    return (
        s.lower()
        .replace("ä", "a").replace("ö", "o").replace("ü", "u").replace("ß", "ss")
    )


def heading_map(doc):
    """(nummer -> (titel, startseite, endseite)) aus den Körperseiten.

    Erfasst Abschnittsüberschriften UND Vorschriften (VORSCHRIFT D.x.y),
    weil das Register beides referenzieren kann. Bei Nummernkollisionen
    (z. B. D.7.5 als Abschnitt und als Vorschrift) wird der Seitenbereich
    beider Vorkommen vereinigt.
    """
    heads = []
    for pno in range(4, len(doc)):  # Titelei (S. 1-4) überspringen
        for line in doc[pno].get_text().splitlines():
            line = line.strip()
            m = HEADING_RE.match(line)
            v = VORSCHR_RE.match(line)
            if m:
                num, title = m.group(1), m.group(2).strip()
                # Inhaltsverzeichnis-Zeilen enden mit Seitenzahl - ausschließen
                if re.search(r"\s\d{1,3}$", title) and pno < 6:
                    continue
                heads.append((num, title, pno))
            elif v:
                heads.append((v.group(1), v.group(2).strip(), pno))
    seen = {}
    for num, title, pno in heads:
        if num not in seen:
            seen[num] = [title, pno, pno]
        else:
            seen[num][1] = min(seen[num][1], pno)
            seen[num][2] = max(seen[num][2], pno)
    out = {}

    def key(n):
        parts = n.split(".")
        return (parts[0], [int(x) for x in parts[1:]])

    nums = sorted(seen, key=key)

    def depth(n):
        return len(n.split(".")) - 1

    for i, num in enumerate(nums):
        title, start, last = seen[num]
        nxt = len(doc)
        for num2 in nums[i + 1:]:
            # Abschnitt endet bei der nächsten Überschrift gleicher/shallower
            # Ebene (Unterabschnitte gehören dazu), nie bei eigenen Kindern.
            if depth(num2) <= depth(num):
                nxt = seen[num2][1]
                break
        # Seitenüberlappung: Inhalt läuft neben der Folgeüberschrift weiter
        out[num] = (title, start, max(nxt + 1, last + 1))
    return out


def register_pairs():
    s = SRC.read_text()
    sec = s[s.index("== Sachregister"):]
    pairs = re.findall(r"\[([^\]]+)\], \[([A-H]\.\d+(?:\.\d+)?)\]", sec)
    d = {}
    for w, r in pairs:
        d.setdefault(w, r)
    return d


def main():
    if not PDF.exists():
        sys.exit(f"PDF fehlt: {PDF}")
    doc = pymupdf.open(PDF)
    heads = heading_map(doc)
    pairs = register_pairs()

    # Abschnittstexte (normiert) einmalig vorbereiten
    cache = {}

    def section_text(num):
        if num not in cache:
            title, start, end = heads[num]
            txt = norm(" ".join(doc[p].get_text() for p in range(start, end)))
            cache[num] = txt
        return cache[num]

    bad = []
    for word in sorted(pairs, key=lambda w: norm(w)):
        ref = pairs[word]
        if ref not in heads:
            bad.append((word, ref, "Nummer existiert nicht"))
            continue
        stem = norm(word)
        # einfacher Stamm: bei Komposita genügt ein Teilwort (min. 5 Zeichen)
        parts = [p for p in re.split(r"[ ,\[\]\-]+", stem) if len(p) >= 5]
        probes = [stem] + parts
        hay = section_text(ref)
        compact_hay = re.sub(r"[\s\-]+", "", hay)
        ok = any(p in hay for p in probes) or any(
            re.sub(r"[\s\-]+", "", p) in compact_hay for p in probes
        )
        if not ok:
            bad.append((word, ref, f"nicht im Abschnitt '{heads[ref][0]}'"))

    print(f"{len(pairs)} Einträge geprüft, {len(bad)} auffällig:")
    for word, ref, why in bad:
        print(f"  [{word}] -> {ref}  ({why})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
