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
#let teil-index(b) = ("A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7).at(b)

#let teil(buchstabe, titel) = [
  // Zähler auf den Buchstaben-Index setzen; die Überschrift selbst zählt hoch
  #context counter(heading).update(teil-index(buchstabe) - 1)
  #counter(figure.where(kind: table)).update(0)
  #counter(figure.where(kind: image)).update(0)
  #heading(level: 1)[#titel]
]

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
      set text(size: 7.5pt, fill: luma(70))
      let vorherige = query(selector(heading.where(level: 2)).before(here()))
      let titel = if vorherige.len() == 0 { [] } else { vorherige.last().body }
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
      align(center)[#p]
    },
  )

  set text(
    font: ("Libertinus Serif", "DejaVu Serif", "DejaVu Sans"),
    size: 9.8pt,
    lang: "de",
    hyphenate: true,
    ligatures: true,
  )

  set par(justify: true, leading: 0.56em, spacing: 0.8em)

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
      block(above: 0pt, below: 14pt)[
        #v(18pt)
        #text(size: 8.5pt, tracking: 0.28em, fill: luma(60))[TEIL #buchstabe]
        #v(6pt)
        #text(size: 19pt, weight: "bold")[#it.body]
        #v(4pt)
        #line(length: 45%, stroke: 0.9pt)
      ]
      pagebreak(weak: false)
    } else if it.level == 2 {
      block(above: 16pt, below: 6pt)[
        #context {
          let nr = numbering(it.numbering, ..counter(heading).at(it.location()))
          text(size: 12pt, weight: "bold")[#nr #h(0.5em) #it.body]
        }
      ]
    } else if it.level == 3 {
      block(above: 11pt, below: 5pt)[
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
      block(above: 9pt, below: 4pt)[
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
  // Abbildungen und Tabellen werden getrennt und je Teil gezählt:  Tab. D.3
  show figure.caption: it => block(above: 3pt, below: 9pt)[
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

  // ---------------------------------------------------------------- Fußnoten
  set footnote(numbering: "1)")
  show footnote.entry: set text(size: 7.8pt)
  show footnote.entry: it => block(above: 1.5pt, it)

  body
}

// -------------------------------------------------------- Bausteine (Vorschrift)
// Reaktionsgleichung:  links -> (Bedingungen) rechts
#let reaktion(links, bedingungen, rechts) = block(
  width: 100%,
  above: 5pt,
  below: 6pt,
  align(center, math.equation(block: false, $#links ->^(#bedingungen) #rechts$)),
)

// Reaktionspfeil mit Bedingungen über/unter dem Pfeil
#let pfeil(oben: none, unten: none) = {
  let o = if oben == none { [] } else { oben }
  let u = if unten == none { [] } else { unten }
  $arrow(l: 3em, t: #o, b: #u)$
}

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
  #block(below: 5pt)[
    #text(size: 8pt, weight: "bold", tracking: 0.06em)[VORSCHRIFT #nr]
    #h(0.7em)
    #text(size: 10.2pt, weight: "bold")[#titel]
  ]
  #body
]

#let ansatz(body) = block(above: 2pt, below: 4pt, text(size: 9.2pt)[*Ansatz:* #body])
#let ausbeute(body) = block(above: 5pt, below: 2pt)[*Ausbeute:* #body]
