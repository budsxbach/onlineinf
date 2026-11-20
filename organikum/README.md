# Organikum — Buchprojekt

Eigenständig erstelltes Lehrbuch der präparativen organischen Chemie im Zuschnitt
eines Grundpraktikums (Teile A–H, ~200 Arbeitsvorschriften, Anhänge, Register).

Teile: A Laboratoriumstechnik · B Literatur und Protokollführung · C Allgemeine
Grundlagen · D Präparativer Teil · E Identifizierung · F Reagenzien und
Arbeitstechnik · G Gefahrstoffe und Sicherheit · H Anhang (Abkürzungen,
Konstanten, Register).

* Plan und Arbeitsstand: [PLAN.md](PLAN.md)
* Layoutprobe: `ausgabe/organikum-vorschau.pdf`

## Bauen

```bash
npm install                 # Typst-Compiler als Node-Paket
python3 tools/strukturen.py # Strukturformeln aus data/strukturen.json (RDKit)
python3 tools/apparate.py   # Apparatezeichnungen
python3 tools/schemata.py   # Schemata (Energieprofile, Stereochemie, Hammett …)
node tools/build.mjs        # PDF nach ausgabe/organikum-vorschau.pdf
node tools/build.mjs --zeichnungen  # zusätzlich alle SVGs neu erzeugen
node tools/stats.mjs        # Wörter, Vorschriften, Seitenprognose
```

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `vorlage/layout.typ` | Satzspiegel, Überschriftenhierarchie A/B/C …, Bausteine für Vorschriften |
| `vorlage/buch.typ` | Hauptdatei: Titelei, Inhaltsverzeichnis, Reihenfolge der Teile |
| `manuskript/` | ein Dokument je Kapitel (`d-01-…`, `d-02-…`) |
| `data/strukturen.json` | SMILES-Zeichenaufträge für die Strukturformeln |
| `bilder/strukturen/` | erzeugte Skelettformeln (SVG) |
| `tools/` | Build, Statistik, Zeichnung |

## Konventionen im Manuskript

* Kapitel: `==` (Ebene 2, ergibt z. B. `D.2`), Abschnitte `===`, Unterabschnitte `====`.
* Vorschriften immer über `#vorschrift("D.2.1", [Titel])[ … ]` mit
  `#ansatz`, `#ausbeute`, `#kenndaten`, `#gefahr` und `#reaktion`.
* Zahlen deutsch: Komma als Dezimaltrennzeichen, Einheiten mit schmalem Leerzeichen.
