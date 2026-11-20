// ============================================================================
//  B  Organisch-chemische Literatur und Protokollführung
// ============================================================================

#import "/vorlage/layout.typ": *

Wer eine Verbindung darstellen will, steht vor zwei Fragen: Ist die Substanz
bereits beschrieben, und welche Vorschrift führt am schnellsten zum Ziel? Beide
Fragen beantwortet die Literatur — nicht das Ausprobieren. Dieses Kapitel
beschreibt die Quellen, ihre Ordnung und die Form, in der das Ergebnis
festgehalten wird.

== Originalliteratur

*Fachzeitschriften.* Die präparative Organische Chemie publiziert ihre
Vorschriften in wenigen Zeitschriften. Für die Praxis entscheidend ist, ob eine
Vorschrift *geprüft* ist: Wer sie nacharbeitet, muß sie reproduzieren können.

#figure(
  table(
    columns: (auto, 1fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Zeitschrift*], [*Inhalt*], [*Jahrgang*]),
    [Organic Syntheses], [geprüfte Vorschriften mit Nacharbeitungskontrolle], [seit 1921],
    [Justus Liebigs Annalen der Chemie], [ausführliche Experimentalteile], [1832–1997],
    [Chemische Berichte], [klassische präparative Arbeiten], [1868–1997],
    [European Journal of Organic Chemistry], [Nachfolger beider Zeitschriften], [seit 1998],
    [Journal of Organic Chemistry], [moderne Synthesen, knappe Experimentalteile], [seit 1936],
    [Tetrahedron Letters], [Kurzmitteilungen, schnelle Veröffentlichung], [seit 1959],
    [Synthesis], [Methoden und präparative Anwendungen], [seit 1969],
    [Organic Reactions], [Monographien zu einzelnen Reaktionen], [seit 1942],
  ),
  caption: [Zeitschriften mit präparativem Schwerpunkt.],
) <tab:zeitschriften>

*Organic Syntheses* nimmt unter diesen Quellen eine Sonderstellung ein: Jede
Vorschrift wird von einem unabhängigen Labor nachgearbeitet, bevor sie
erscheint. Die Bände enthalten Ansätze im 0,1- bis 1-mol-Maßstab und sind
daher für das Praktikum besonders geeignet. Sammelbände fassen die
Vorschriften nach Verbindungsklassen zusammen.

*Patentschriften.* Patente enthalten häufig die einzige ausführliche
Beschreibung einer technischen Umsetzung, sind aber rechtlich formuliert: Die
Ansprüche sind weit gefaßt, die Beispiele eng. Für die Laborpraxis sind die
Ausführungsbeispiele brauchbar, die Ansprüche nicht.

== Zusammenfassungen und Übersichten

Referateorgane referieren die Originalliteratur mit Verzögerung von einigen
Monaten und mit verkürztem Experimentalteil. Sie dienen der Orientierung, nicht
der Nacharbeit:

- *Chemical Abstracts* (seit 1907), heute in *SciFinder* aufgegangen,
- *Chemisches Zentralblatt* (1830–1969), historisch wichtig,
- *Current Abstracts of Chemistry* (1960–1999),
- *Methods in Organic Synthesis* (1984–2007).

Übersichtsartikel (*Reviews*) fassen ein Gebiet zusammen und nennen die
Originalliteratur. Sie sind der schnellste Weg zu einer belastbaren
Einschätzung, welche Methode für eine Verbindungsklasse geeignet ist.

== Referierende Literatur

*Handbücher.* Das *Beilstein-Handbuch der organischen Chemie* ordnet alle
bekannten Verbindungen nach einem festen System: Hauptwerk, Ergänzungswerk,
vier Ergänzungsreihen. Innerhalb einer Verbindung folgen die Daten einem
Schema — Darstellung, physikalische Eigenschaften, chemisches Verhalten,
Analyse, Salze. Aus der vierten Ergänzungsreihe ist die Datenbank *Reaxys*
hervorgegangen, die Beilstein, Gmelin und die Patentliteratur vereinigt.

#figure(
  table(
    columns: (auto, 1fr, 1fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Werk*], [*Inhalt*], [*Zugang*]),
    [Beilstein / Reaxys], [Verbindungen, Darstellungen, Daten, Patente], [Datenbank, kostenpflichtig],
    [Houben-Weyl], [Methoden der organischen Chemie], [Buch, Bibliothek],
    [Science of Synthesis], [Synthesemethoden, kritisch gesichtet], [Datenbank, Buch],
    [Ullmann], [technische Chemie und Verfahren], [Buch, Bibliothek],
    [Comprehensive Organic Synthesis], [Reaktionstypen, mehrbändig], [Buch, Bibliothek],
  ),
  caption: [Referierende Werke der organischen Chemie.],
) <tab:handbuecher>

*Landolt-Börnstein* enthält numerische Daten: Dampfdrücke, Dichten,
Brechungsindizes, spektroskopische Konstanten. Wer einen Literaturwert für eine
Kenndatenzeile braucht, findet ihn hier mit Angabe der Meßbedingungen.

== Tabellenbücher

Für die tägliche Arbeit wichtiger als die großen Handbücher sind die kleinen
Tabellenwerke am Arbeitsplatz. Sie liefern die Daten, die in eine Kenndatenzeile
gehören, und die Größen, mit denen Ansätze gerechnet werden.


#figure(
  table(
    columns: (auto, 1fr, 1fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Werk*], [*Inhalt*], [*Zugang*]),
    [CRC Handbook], [Konstanten, Dichten, Lösungsmittel, Sicherheitsdaten], [Buch, online],
    [Landolt-Börnstein], [physikalische und spektroskopische Daten], [Buch, Bibliothek],
    [Handbook of Chemistry and Physics], [Thermodynamik, Spektren, Materialdaten], [Buch],
    [Vogel, Practical Organic Chemistry], [Kenndaten und Nachweisreaktionen], [Buch],
    [Sicherheitsdatenblätter], [GHS, Grenzwerte, Schutzmaßnahmen], [Online, Hersteller],
    [Lösungsmittel-Handbuch], [Reinheit, Trocknung, Peroxide], [Buch],
  ),
  caption: [Tabellenwerke für die tägliche Arbeit. Die drei rechten Spalten der
    Kenndatenzeile einer Vorschrift stammen in der Regel aus diesen Werken.],
) <tab:tabellenbuecher>

*Umgang mit Tabellenwerten.* Ein Literaturwert ist nur so gut wie seine
Meßbedingungen. Zu jedem übernommenen Wert gehören Temperatur, Druck und — bei
optischen Daten — die Wellenlänge. Wer den Brechungsindex ohne Angabe der
Temperatur zitiert, hat keine Meßgröße, sondern eine Zahl.

== Nomenklaturrichtlinien

Verbindungsnamen folgen den Empfehlungen der IUPAC. Für deutschsprachige Texte
gilt zusätzlich die deutsche Rechtschreibung mit den eingedeutschten
Trivialnamen: *Essigsäure* statt *Ethansäure*, *Toluol* statt *Methylbenzol*,
*Anilin* statt *Aminobenzol*. In dieser Reihenfolge wird auch zitiert: IUPAC-Name
zuerst, Trivialname in Klammern.

#figure(
  table(
    columns: (1fr, 1fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Regel*], [*Beispiel*]),
    [längste Kette, dann Substituenten], [2-Methylbutan],
    [niedrigste Locanten], [2,3-Dimethylpentan, nicht 3,4-Dimethylpentan],
    [alphabetische Ordnung], [1-Brom-2-chlorethan],
    [funktionelle Gruppe als Suffix], [Butansäure],
    [Stereodeskriptoren vor dem Namen], [(R)-2-Butanol],
    [Doppelbindung vor Einfachbindung], [But-2-en, nicht But-3-en],
  ),
  caption: [Grundregeln der IUPAC-Nomenklatur, wie sie in diesem Buch verwendet
    werden.],
) <tab:nomenklatur>

== Digitale Recherche

Die Recherche am Bildschirm hat die Wälzen der Bände ersetzt — nicht aber das
Urteilen über die gefundene Quelle. Drei Arten von Datenbanken sind zu
unterscheiden:

#figure(
  table(
    columns: (1.4fr, 1.5fr, 1.5fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Datenbank*], [*Inhalt*], [*Zugang*]),
    [Reaxys], [Struktur- und Reaktionsdatenbank, Nachfolger von Beilstein und
      Gmelin], [lizenzpflichtig, über die Hochschule],
    [SciFinder-n], [CAplus, Medline, Reaktionen, Patente], [lizenzpflichtig],
    [PubChem], [Verbindungen, Bioassays, Literaturverweise], [frei],
    [ChemSpider], [Strukturen mit Verweisen auf Lieferanten], [frei],
    [CSD], [Kristallstrukturen kleiner Moleküle], [lizenzpflichtig],
    [NIST WebBook], [Spektren, thermodynamische Daten], [frei],
    [Sigma-Aldrich], [Kataloge, Sicherheitsdatenblätter], [frei],
  ),
  caption: [Datenbanken für die Recherche. Frei zugängliche Quellen sind für
    Kenndaten gut, für präparative Vorschriften reichen sie nicht.],
) <tab:datenbanken>

*Struktursuche.* Der eigentliche Gewinn der digitalen Recherche ist die Suche
nach Teilstrukturen: Man zeichnet ein Fragment (etwa ein α,β-ungesättigtes
Keton) und erhält alle Verbindungen, die es enthalten. Damit findet man
Reaktionsvorschriften, ohne den Namen der Zielverbindung zu kennen — der
umgekehrte Weg zur Suche im Register.

*Treffer bewerten.* Eine Trefferliste ist keine Bibliothek. Drei Fragen
entscheiden, ob ein Treffer brauchbar ist:

- Ist die Vorschrift *primär* (Originalarbeit) oder nur ein Referat?
- Sind Ausbeute und Maßstab angegeben — läuft die Reaktion im Gramm- oder im
  Kilogrammbereich?
- Ist die Arbeit nach 1990 erschienen? Ältere Vorschriften sind nicht falsch,
  aber die Arbeitstechnik und die Sicherheitsanforderungen haben sich geändert.

*Zitieren.* Im Protokoll wird jede Vorschrift mit Autor, Zeitschrift, Jahr,
Band und Seite belegt; bei Datenbanken zusätzlich mit dem Zugriffsdatum.
Direkte Übernahme ohne Beleg ist ein Plagiat, auch im Praktikumsprotokoll.

== Durchführung einer Recherche

*Recherche über eine definierte Verbindung.* Man sucht den Namen in Reaxys oder
SciFinder und prüft die Trefferliste auf Darstellungen. Von jeder Darstellung
interessieren drei Angaben: Edukte, Ausbeute, Bedingungen. Vorschriften mit
Ausbeuten über 70 % und ohne aufwendige Reinigung sind zuerst zu prüfen.

*Recherche über eine Reaktion.* Man sucht nach der Reaktion, nicht nach dem
Produkt: „Reduktion von Nitroverbindungen mit Zinn(II)-chlorid" führt zu
belastbaren Treffern, „Synthese von Anilin" zu einer unübersehbaren Zahl.

*Recherche über eine Verbindungsklasse.* Übersichtsartikel und Monographien
(Houben-Weyl, Science of Synthesis) sind hier effizienter als die
Einzelliteratur. Man liest die Einleitung, wählt zwei Verfahren und schlägt die
Originalliteratur nach.

#block(above: 8pt, below: 8pt, inset: (x: 8pt, y: 6pt), stroke: (left: 2pt + black), fill: luma(246))[
  *Rechercheschema.* 1. Name und Struktur sichern (CAS-Nummer). 2. Datenbank
  nach Darstellungen durchsuchen. 3. Drei Vorschriften auswählen. 4. Nach
  Verfügbarkeit der Edukte ordnen. 5. Sicherheitsdatenblätter der Edukte lesen.
  6. Ansatzgröße festlegen und Mengen berechnen. 7. Erst dann die Apparatur
  aufbauen.
]

*Recherchebeispiel: Chalcon.* Die Fragestellung sei: Wie stellt man Chalcon
(1,3-Diphenylprop-2-en-1-on) dar? Der Weg durch die Datenbank dauert keine
zehn Minuten, wenn man systematisch vorgeht.

1. *Substanz klären.* IUPAC-Name, Trivialname, CAS-Nummer (94-41-7) und
  Struktur notieren. Wer hier schlampert, sucht später mit dem falschen
  Stichwort.
2. *Datenbank abfragen.* In Reaxys oder SciFinder nach der CAS-Nummer suchen,
  auf „Darstellungen" filtern. Chalcon hat Dutzende Vorschriften; die
  Trefferliste wird nach Ausbeute absteigend sortiert.
3. *Vorschriften auswählen.* Drei Kandidaten genügen: die klassische
  Aldolkondensation von Benzaldehyd mit Acetophenon in Ethanol/NaOH
  (Ausbeute 80–85 %), eine Variante in wäßrigem Medium und eine mit
  Feststoffkatalysator. Für den Anfang ist die klassische Vorschrift die
  beste: gängige Edukte, Umkristallisation statt Chromatographie.
4. *Originalarbeit nachschlagen.* Der Literaturhinweis wird verfolgt; in der
  Originalvorschrift stehen Angaben, die in der Datenbank fehlen: Rührezeit,
  Temperatur, Grad des Auskristallisierens, Umkristallisationsverhältnis.
5. *Mengen rechnen.* 0,05 mol Benzaldehyd (5,3 g) und 0,055 mol Acetophenon
  (6,6 g) liefern theoretisch 10,4 g Chalcon; bei 85 % erwartet man 8,8 g.
  Diese Zahlen stehen im Protokoll, bevor die Apparatur aufgebaut wird.
6. *Sicherheit.* Sicherheitsdatenblätter von Benzaldehyd (Sensibilisator),
  Acetophenon und Natronlauge lesen; Gefahrstoffkataster prüfen.

#block(above: 8pt, below: 8pt, inset: (x: 8pt, y: 6pt), stroke: (left: 2pt + black), fill: luma(246))[
  *Merke.* Eine Recherche ist erst fertig, wenn man die Vorschrift in der
  Originalquelle gelesen hat. Datenbanken zeigen, *daß* es eine Vorschrift
  gibt — die Originalarbeit sagt, *wie* sie geht.
]

*Übung.* Suchen Sie nach einer Vorschrift für 4-Methoxychalcon und für die
Reduktion von Benzophenon zu Benzhydrol. Notieren Sie jeweils: CAS-Nummer,
zwei Darstellungen mit Ausbeute und Bedingungen, die Originalstelle und die
Mengen für einen 0,05-mol-Ansatz. Vergleichen Sie, ob die Datenbankangabe mit
der Originalarbeit übereinstimmt.

== Protokollführung

Das Protokoll ist die einzige Spur, die von einem Versuch bleibt. Es wird
*während* des Versuchs geschrieben, nicht danach, und enthält alle Angaben, die
ein anderer braucht, um den Versuch zu wiederholen.

#figure(
  table(
    columns: (auto, 1fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Abschnitt*], [*Inhalt*]),
    [Kopf], [Datum, Versuch, Name, Betreuer],
    [Aufgabe], [Reaktionsgleichung mit Strukturformeln, Literaturstelle],
    [Ansatz], [Substanzen mit Menge, Mol, Äquivalenten, Dichte, Molmasse],
    [Durchführung], [Geräte, Reihenfolge der Zugabe, Temperaturen, Zeiten, Beobachtungen],
    [Aufarbeitung], [Trennung, Waschen, Trocknen, Reinigung, Verluste],
    [Ergebnis], [Ausbeute in g, mol, %, Kenndaten mit Sollwerten],
    [Auswertung], [Abweichungen, Fehlerquellen, spektroskopische Daten, Diskussion],
  ),
  caption: [Aufbau eines Versuchsprotokolls.],
) <tab:protokoll>

*Beobachtungen* werden so notiert, wie sie sind: Farbe, Gasentwicklung,
Temperaturverlauf, Niederschlag, Geruch. Ein Protokoll, das nur das Ergebnis
nennt, ist keine Dokumentation, sondern ein Merkzettel. Abweichungen von der
Vorschrift werden ausdrücklich vermerkt — sie sind später die Erklärung für
eine ausgebliebene oder überraschend gute Ausbeute.

#block(above: 8pt, below: 8pt, inset: (x: 8pt, y: 6pt), stroke: (left: 1pt + luma(120)), fill: luma(250))[
  *Beispiel einer Ansatzrechnung.* 10,0 g (0,108 mol) Cyclohexanol, M = 100,2
  g·mol⁻¹, sollen mit 85-prozentiger Phosphorsäure dehydratisiert werden.
  Cyclohexen hat M = 82,1 g·mol⁻¹. Theoretische Ausbeute: 0,108 mol · 82,1
  g·mol⁻¹ = 8,87 g. Bei 78 % Ausbeute erhält man 6,9 g, entsprechend 7,6 mL
  (ρ = 0,81 g·cm⁻³). Wer diese drei Zahlen vor dem Versuch aufschreibt, erkennt
  sofort, ob das Ergebnis plausibel ist.
]

== Literaturhinweise

Die im Text genannten Werke sind im folgenden zusammengefaßt; die Liste ist für
die Arbeit im Praktikum gedacht, nicht als Bibliographie.

- *Organic Syntheses*, Collective Volumes 1–10. Geprüfte Vorschriften mit
  Nacharbeitung; für den Einstieg in eine Verbindungsklasse die erste Adresse.
- *Houben-Weyl, Methoden der organischen Chemie*, 4. Auflage. Nach Reaktionstypen
  geordnet; für die Suche nach Alternativen zu einer Vorschrift.
- *Science of Synthesis*. Nachfolger von Houben-Weyl, kritisch gesichtet, mit
  Angabe der Ausbeuten.
- *Beilstein / Reaxys*. Vollständige Datensammlung; für Kenndaten und für die
  Frage, ob eine Verbindung schon beschrieben ist.
- *Landolt-Börnstein*, Neue Serie. Numerische Daten mit Meßbedingungen.
- *IUPAC Nomenclature of Organic Chemistry*. Verbindliche Grundlage der Namen,
  die in diesem Buch verwendet werden.
- *Safety in the Chemical Laboratory*. Praktische Hinweise zum Umgang mit
  Gefahrstoffen, die in Sicherheitsdatenblättern zu kurz kommen.
- *Organikum*, 20. Auflage. Das vorliegende Buch; Vorschriften mit
  Arbeitstechnik, Tabellen und theoretischen Einleitungen.
- *Vogel's Textbook of Practical Organic Chemistry*, 5. Auflage. Ausführliche
  Arbeitstechnik in englischer Sprache, mit Vorschriften im Halbmikromaßstab.
- *Handbook of Chemistry and Physics*. Für Dichten, Brechungsindizes und
  Löslichkeiten, wenn die Vorschrift keine Angabe macht.
- *Bretherick's Handbook of Reactive Chemical Hazards*. Für die Frage, welche
  Stoffkombinationen gefährlich sind — vor dem ersten Versuch lesen, nicht
  danach.

=== Wie man eine Vorschrift liest

Eine Vorschrift ist kein Kochrezept, sondern ein Protokoll mit Lücken. Wer sie
vor dem Versuch vollständig durcharbeitet, findet die Lücken; wer sie während
des Versuchs liest, findet sie zu spät.

*Vier Durchgänge.*

- *Erster Durchgang — Mengen.* Molzahlen nachrechnen, Äquivalente prüfen,
  Maßstab wählen. Stimmen Ansatz und Ausbeute zusammen?
- *Zweiter Durchgang — Apparatur.* Welche Glasgeräte, welche Rührform, welcher
  Kühler? Was muß vorher getrocknet werden?
- *Dritter Durchgang — Gefahren.* Welche Stoffe sind giftig, entzündbar, ätzend?
  Wo entsteht Gas, wo entsteht Wärme, wo ist Druck?
- *Vierter Durchgang — Aufarbeitung.* Welche Phasen, welche Trockenmittel,
  welche Reinigung? Wie erkennt man, daß die Reaktion fertig ist?

*Beispiel.* Eine Vorschrift verlangt „20 g (0,1 mol) Keton, gelöst in 100 mL
absolutem Ether; Zugabe von 1,2 Äquivalenten Grignard-Reagenz". Man rechnet:
0,12 mol Reagenz, bei einer 1-molaren Lösung also 120 mL. Zusammen mit dem
Ether sind das 220 mL Flüssigkeit — der Kolben muß mindestens 500 mL fassen.
Der Ether muß absolut sein, sonst zerstört das Reagenz einen Teil des
Grignard-Reagenzes. Und die Zugabe erfolgt bei 0 °C, weil die Reaktion exotherm
ist.

*Typische Lücken.* Ältere Vorschriften nennen keine Konzentration der
Schwefelsäure, kein Trockenmittel und keine Rührdauer. Man ergänzt sie aus dem
Theorieteil, aus einer neueren Vorschrift derselben Verbindung oder aus dem
Sicherheitsdatenblatt — und schreibt im Protokoll, welche Ergänzung man
vorgenommen hat.
