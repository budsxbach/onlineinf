// ============================================================================
//  ORGANIKUM — Satzvorlage (Typst)
//  Alle Regeln stecken in der Template-Funktion `buch`, damit sie auf das
//  ganze Dokument wirken:  #show: buch
// ============================================================================

#let buch-breite = 168mm
#let buch-hoehe = 240mm

// 1 -> "A", 2 -> "B", ... (nur bis 26 nötig)
#let teilbuchstabe(n) = {
  let letters = ("A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z")
  letters.at(calc.rem(n - 1, 26))
}

// Teilanfang: Buchstabe wird über einen Zähler gesetzt, damit die Numerierung
// auch nach einzelnen, unabhängig geschriebenen Teilen stimmt.
#let teil-index(b) = ("A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7, "H": 8).at(b)

#let teil(buchstabe, titel) = {
  // Teilseite ohne Kolumnentitel und ohne Seitenzahl. Der Zähler wird vor der
  // Ebene-1-Überschrift gesetzt, damit die Kapitel als A.1, B.1, D.3 … zählen.
  context counter(heading).update(teil-index(buchstabe) - 1)
  counter(figure.where(kind: table)).update(0)
  counter(figure.where(kind: image)).update(0)
  page(header: none, footer: none, numbering: none)[
    #heading(level: 1)[#titel]
  ]
}

#let buch(body) = {
  set document(
    title: "Organikum — Organisch-chemisches Grundpraktikum",
    author: "Autorenkollektiv",
  )

  set page(
    width: buch-breite,
    height: buch-hoehe,
    margin: (top: 18mm, bottom: 19mm, inside: 19mm, outside: 15mm),
    numbering: "1",
    header: context {
      let p = counter(page).get().first()
      if p <= 12 { return }
      // Teilseiten (Teilanfang) tragen keine Kolumnentitel
      let teilseite = query(selector(heading.where(level: 1)).before(here()))
      if teilseite.len() > 0 {
        let lp = counter(page).at(teilseite.last().location()).first()
        if lp == p { return }
      }
      set text(size: 7.5pt, fill: luma(70))
      // Läuft ein Kapitel auf dieser Seite an, trägt der Kolumnentitel dessen Namen
      let auf_dieser_seite = query(selector(heading.where(level: 2)).after(here()))
      let kapitel = query(selector(heading.where(level: 2)).before(here()))
      let startet_hier = auf_dieser_seite.len() > 0
      if startet_hier {
        startet_hier = counter(page).at(auf_dieser_seite.first().location()).first() == p
      }
      let titel = if startet_hier {
        auf_dieser_seite.first().body
      } else if kapitel.len() == 0 {
        []
      } else {
        kapitel.last().body
      }
      grid(
        columns: (1fr, 1fr),
        align: (left, right),
        if calc.odd(p) { titel } else { [Organikum] },
        if calc.odd(p) { [Organikum] } else { titel },
      )
    },
    footer: context {
      let p = counter(page).get().first()
      if p <= 12 { return }
      set text(size: 8.5pt)
      align(if calc.odd(p) { right } else { left })[#p]
    },
  )

  set text(
    font: ("Libertinus Serif", "DejaVu Serif", "DejaVu Sans"),
    size: 9.8pt,
    lang: "de",
    hyphenate: true,
    ligatures: true,
  )

  // Buchsatz: Erstzeileneinzug, kein Durchschuß zwischen Absätzen.
  // `all: false` läßt den ersten Absatz nach einer Überschrift ohne Einzug.
  set par(
    justify: true,
    leading: 0.56em,
    spacing: 0.55em,
    first-line-indent: (amount: 5mm, all: false),
  )

  // --------------------------------------------------------------- Kapitel
  // Teile (Ebene 1) bekommen Buchstaben A, B, C …, die Kapitel darunter eine
  // laufende Nummer, die je Teil neu beginnt:  A.1, A.2 … D.1 … D.9 …
  set heading(numbering: (..n) => {
    let v = n.pos()
    if v.len() == 0 { "" } else {
      let rest = v.slice(1)
      if rest.len() == 0 { teilbuchstabe(v.first()) }
      else { teilbuchstabe(v.first()) + "." + numbering("1.1.1", ..rest) }
    }
  })
  show heading: it => {
    if it.level == 1 {
      let buchstabe = context teilbuchstabe(counter(heading).at(it.location()).first())
      block(above: 0pt, below: 20pt)[
        #v(14pt)
        #text(size: 8.5pt, tracking: 0.28em, fill: luma(60))[TEIL #buchstabe]
        #v(6pt)
        #text(size: 19pt, weight: "bold")[#it.body]
        #v(4pt)
        #line(length: 45%, stroke: 0.9pt)
      ]
    } else if it.level == 2 {
      block(above: 17pt, below: 12pt)[
        #context {
          let nr = numbering(it.numbering, ..counter(heading).at(it.location()))
          text(size: 12pt, weight: "bold")[#nr #h(0.5em) #it.body]
        }
      ]
    } else if it.level == 3 {
      set par(first-line-indent: 0pt)
      block(above: 14pt, below: 11pt)[
        #context {
          if it.numbering == none {
            text(size: 10.2pt, weight: "bold")[#it.body]
          } else {
            let nr = numbering(it.numbering, ..counter(heading).at(it.location()))
            text(size: 10.2pt, weight: "bold")[#nr #h(0.5em) #it.body]
          }
        }
      ]
    } else {
      set par(first-line-indent: 0pt)
      block(above: 12pt, below: 10pt)[
        #context {
          let nr = numbering(it.numbering, ..counter(heading).at(it.location()))
          text(size: 9.3pt, weight: "bold", style: "italic")[#nr #h(0.5em) #it.body]
        }
      ]
    }
  }

  // --------------------------------------------------------- Abbildungen/Tabellen
  set figure(supplement: [Abb.], gap: 8pt)
  show figure.where(kind: table): set figure(supplement: [Tab.])
  show figure.where(kind: table): it => {
    set text(size: 8.6pt, hyphenate: false)
    set par(justify: false, first-line-indent: 0pt, leading: 0.5em)
    set table(inset: (x: 5pt, y: 3.4pt), stroke: none)
    set align(left)
    it
  }
  // Tabellenkopf und -zeilen: feine Linien nur waagerecht, Kopf abgesetzt
  show table.cell.where(y: 0): set text(weight: "bold")
  // Abbildungen und Tabellen werden getrennt und je Teil gezählt:  Tab. D.3
  show figure.caption: it => block(above: 4pt, below: 7pt, width: 100%)[
    #set text(size: 8pt, font: ("Libertinus Serif", "DejaVu Serif"))
    #set par(justify: false)
    #set align(left)
    #set text(size: 8pt)
    #context {
      let teilnr = query(selector(heading.where(level: 1)).before(it.location())).last()
      let praefix = if teilnr == none { "" } else {
        let c = counter(heading).at(teilnr.location())
        if c.len() == 0 { "" } else { teilbuchstabe(c.first()) + "." }
      }
      let n = counter(figure.where(kind: it.kind)).at(it.location())
      let nummer = praefix + numbering("1", ..n)
      it.supplement + " " + nummer + ": " + it.body
    }
  ]
  show figure: set block(breakable: false)
  // Abbildungen nie oben an eine Seite kleben, wenn darunter kein Text steht
  show figure.where(kind: image): set block(above: 6pt, below: 6pt)

  // ---------------------------------------------------------------- Fußnoten
  set footnote(numbering: "1)")
  show footnote.entry: set text(size: 7.8pt)
  show footnote.entry: it => block(above: 1.5pt, it)

  body
}

// -------------------------------------------------------- Bausteine (Vorschrift)
// Reaktionsgleichung:  links -> (Bedingungen) rechts
// Bedingungen stehen als kleine Zeile unter dem Pfeil: bei langen Angaben
// (Lösungsmittel, Temperatur, Katalysator) sonst Kollision mit den Formeln.
#let reaktion(links, bedingungen, rechts) = block(
  width: 100%,
  breakable: false,
  sticky: true,
  above: 6pt,
  below: 7pt,
  align(center)[
    #math.equation(block: false, $#links -> #rechts$)
    #v(1pt)
    #text(size: 6.8pt, fill: luma(45))[#bedingungen]
  ],
)

// Reaktionspfeil mit Bedingungen über/unter dem Pfeil
#let pfeil(oben: none, unten: none) = {
  let o = if oben == none { [] } else { oben }
  let u = if unten == none { [] } else { unten }
  $arrow(l: 3em, t: #o, b: #u)$
}

// Absatz mit vorangestelltem Stichwort („Rückfluß." …): kein Einzug
#let stichwort(titel, body) = block(
  above: 0.85em,
  below: 0pt,
)[
  #set par(first-line-indent: (amount: 0pt, all: true), spacing: 0pt)
  *#titel.* #body
]

// Gefahrenhinweis, am linken Rand markiert
#let gefahr(body) = block(
  width: 100%,
  above: 7pt,
  below: 7pt,
  inset: (left: 7pt, right: 5pt, y: 4pt),
  stroke: (left: 2pt + black),
  fill: luma(246),
  text(size: 8.6pt)[*Gefahrenhinweis.* #body],
)

// Kenndaten-Zeile unter einer Vorschrift
#let kenndaten(..zellen) = block(
  width: 100%,
  above: 5pt,
  below: 5pt,
  text(size: 8.4pt)[#zellen.pos().join([ #h(2em) ])],
)

// Der Kern des Buches: die Arbeitsvorschrift
#let vorschrift(nr, titel, body) = block(
  breakable: true,
  width: 100%,
  above: 13pt,
  below: 12pt,
  inset: (left: 8pt, right: 4pt, top: 6pt, bottom: 2pt),
  stroke: (left: 1pt + black),
)[
  #set par(spacing: 0.55em)
  #block(sticky: true, below: 5pt)[
    #text(size: 8pt, weight: "bold", tracking: 0.06em)[VORSCHRIFT #nr]
    #h(0.7em)
    #text(size: 10.2pt, weight: "bold")[#titel]
  ]
  #body
]

#let ansatz(body) = block(above: 2pt, below: 4pt, text(size: 9.2pt)[*Ansatz:* #body])
#let ausbeute(body) = block(above: 5pt, below: 2pt)[*Ausbeute:* #body]
