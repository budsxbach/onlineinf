// ============================================================================
//  Hauptdatei — bindet Vorlage und Manuskriptkapitel zusammen
//  Neues Kapitel: Datei in manuskript/ anlegen und unten mit #include einbinden
// ============================================================================

#import "layout.typ": *

#show: buch

// ------------------------------------------------------------------ Vorsatz
#set page(numbering: none)
#set par(justify: false)

#page(header: none, footer: none)[
  #v(40mm)
  #align(center)[
    #text(size: 8pt, tracking: 0.35em)[LEHRBUCH DER PRÄPARATIVEN ORGANISCHEN CHEMIE]
    #v(14mm)
    #text(size: 34pt, weight: "bold", tracking: 0.02em)[Organikum]
    #v(6mm)
    #line(length: 60%, stroke: 0.6pt)
    #v(6mm)
    #text(size: 13pt)[Organisch-chemisches Grundpraktikum]
    #v(34mm)
    #text(size: 10pt)[Autorenkollektiv]
    #v(50mm)
    #text(size: 9pt, fill: luma(80))[
      Arbeitsvorschriften, Arbeitstechniken und theoretische Grundlagen
    ]
  ]
]

#pagebreak()

// --------------------------------------------------------------- Impressum
#set text(size: 8.5pt)
#v(150mm)
#align(left)[
  Dieses Buch ist ein eigenständig erstelltes Lehrbuch der präparativen
  organischen Chemie. Aufbau, Kapitelgliederung und Vorschriften wurden für
  dieses Werk neu erarbeitet; es handelt sich nicht um einen Nachdruck oder
  eine Reproduktion eines bestehenden Titels.
  \
  #v(3mm)
  Alle Arbeitsvorschriften sind für den Gebrauch im Ausbildungslabor
  vorgesehen. Gefahrstoffe dürfen nur nach Kenntnis der zugehörigen
  Sicherheitsdatenblätter und in geeigneter Schutzkleidung gehandhabt werden.
  \
  #v(3mm)
  Satz: Typst. Strukturformeln: RDKit.
]

#pagebreak()

// ---------------------------------------------------------------- Inhaltsverzeichnis
#set text(size: 9.5pt)
#block(below: 10pt)[
  #text(size: 16pt, weight: "bold")[Inhalt]
  #v(2pt)
  #line(length: 100%, stroke: 0.7pt)
]
#outline(title: none, depth: 2, indent: auto)

// ------------------------------------------------------------------ Kapitel
#set page(numbering: "1")

#teil("A", [Einführung in die Laboratoriumstechnik])

#include "/manuskript/a-1-hilfsmittel.typ"
#include "/manuskript/a-2-trennverfahren.typ"
#include "/manuskript/a-3-mikro-und-konstanten.typ"

#teil("B", [Organisch-chemische Literatur und Protokollführung])

#include "/manuskript/b-1-literatur.typ"

#teil("C", [Einige allgemeine Grundlagen])

#include "/manuskript/c-1-grundlagen.typ"

#teil("D", [Präparativer Teil])

#include "/manuskript/d-01-radikalische-substitution.typ"
#include "/manuskript/d-02-nukleophile-substitution.typ"
