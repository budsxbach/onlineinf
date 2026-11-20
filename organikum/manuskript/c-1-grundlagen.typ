// ============================================================================
//  C  Einige allgemeine Grundlagen
// ============================================================================

#import "/vorlage/layout.typ": *

Wer eine Vorschrift nacharbeitet, ohne die Reaktion zu verstehen, merkt nicht,
wenn etwas schiefgeht — und kann beim nächsten Mal nicht korrigieren. Dieses
Kapitel stellt die Grundlagen zusammen, die für die präparative Arbeit
unmittelbar nützlich sind: Reaktionstypen, Energetik, Kinetik, Säure-Base-
Verhalten, Substituenteneffekte, Stereochemie und Syntheseplanung.

== Klassifizierung organisch-chemischer Reaktionen

Organische Reaktionen lassen sich nach zwei unabhängigen Gesichtspunkten
ordnen: nach dem *stofflichen Ergebnis* und nach dem *Mechanismus*. Beide
Ordnungen sind nützlich; die erste für die Suche, die zweite für das Verständnis.

#figure(
  table(
    columns: (auto, 1fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Typ*], [*Schema*], [*Beispiel*]),
    [Substitution], [A–B + C → A–C + B], [CH₃Br + OH⁻ → CH₃OH + Br⁻],
    [Addition], [A=B + C–D → A–C–B–D], [H₂C=CH₂ + Br₂ → BrCH₂CH₂Br],
    [Eliminierung], [A–B–C–D → A=B + C–D], [C₂H₅Br → H₂C=CH₂ + HBr],
    [Umlagerung], [A–B–C → B–A–C], [Pinakolon-Umlagerung],
    [Oxidation], [Elektronenabgabe], [R–CH₂OH → R–CHO],
    [Reduktion], [Elektronenaufnahme], [R–CHO → R–CH₂OH],
  ),
  caption: [Reaktionstypen nach dem stofflichen Ergebnis.],
) <tab:reaktionstypen>

Nach dem Mechanismus unterscheidet man radikalische, nucleophile und
elektrophile Reaktionen; jede kann als Substitution, Addition oder
Eliminierung ablaufen. Entscheidend für die Einordnung ist die Frage, *wer*
den ersten Schritt tut: ein Radikal, ein Nucleophil oder ein Elektrophil.

#figure(
  table(
    columns: (auto, 1fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Mechanismus*], [*Erster Schritt*], [*Beispiel*]),
    [radikalisch], [Homolyse, Radikalbildung], [Chlorierung von Methan],
    [nucleophil (S#sub[N])], [Angriff eines Elektronenpaardonors], [Hydrolyse von Alkylhalogeniden],
    [elektrophil (S#sub[E])], [Angriff eines Elektronenpaarakzeptors], [Nitrierung von Benzol],
    [pericyclisch], [konzertierter Ringschluß], [Diels-Alder-Reaktion],
    [übergangsmetallkatalysiert], [oxidative Addition, Ligandenaustausch], [Suzuki-Kupplung],
  ),
  caption: [Mechanistische Klassen. Die Kurzschreibweise S#sub[E] und S#sub[N]
    wird im ganzen Buch verwendet.],
) <tab:mechanismen>

== Energieänderungen bei chemischen Reaktionen

=== Bindungsspaltung und Bindungsenergien

Jede Umwandlung beginnt mit dem Bruch einer chemischen Bindung. Man
unterscheidet zwei Grenzfälle:

- *Homolyse*: Die Bindungselektronen werden geteilt; es entstehen zwei Radikale.
  Sie ist der Normalfall in der Gasphase und bei thermischer oder photochemischer
  Anregung.
- *Heterolyse*: Beide Elektronen bleiben bei einem Fragment; es entstehen ein
  Carbeniumion und ein Anion. Sie wird durch polare Lösungsmittel und durch
  Abgangsgruppen mit niedriger Basizität begünstigt.

$ "R–X" -> "R· + X·" quad "bzw." quad "R–X" -> "R⁺ + X⁻" $

Die Bindungsenergien erklären, welche Reaktion überhaupt in Frage kommt.

#figure(
  table(
    columns: (2fr, auto, 3fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Bindung*], [*Energie*], [*Bemerkung*]),
    [C–H], [414], [Mittelwert über Alkane],
    [C–C], [347], [Ethan],
    [C=C], [611], [Ethen; die zweite Bindung ist schwächer],
    [C–Cl], [339], [Chlorethan],
    [C–Br], [285], [Bromethan],
    [C–I], [218], [Iodmethan],
    [O–H], [464], [Wasser],
    [O–O], [146], [Peroxid; Ursache der Radikalbildner],
    [C=O], [745], [Formaldehyd],
    [N–H], [391], [Ammoniak],
  ),
  caption: [Mittlere Bindungsenergien in kJ·mol⁻¹ für 298 K, gemittelt über die
    jeweilige Verbindungsklasse.],
) <tab:bindungsenergien>

Aus der Tabelle folgt eine einfache Regel für die Praxis: Reaktionen, die eine
O–O-Bindung spalten, laufen leicht an (Peroxide als Initiatoren); Reaktionen, die
eine C–H-Bindung in einem Alkan spalten, brauchen Energiezufuhr oder ein
reaktives Radikal.

Ob eine Reaktion abläuft, entscheidet nicht die Enthalpie allein, sondern die
freie Enthalpie:

$ Delta G = Delta H - T dot Delta S $

Für präparative Zwecke folgt daraus eine einfache Ordnung:

- $Delta G$ stark negativ (> 20 kJ·mol⁻¹): Reaktion läuft ab, oft schon bei
  Raumtemperatur.
- $Delta G$ nahe null: Gleichgewicht; der Umsatz wird durch Überschuß eines
  Reagenzes oder durch Entfernen eines Produkts verschoben.
- $Delta G$ positiv: Reaktion läuft nicht ab; Kopplung an eine exergone Reaktion
  oder Aktivierung (Licht, Katalysator, Elektrolyse) ist nötig.

Bei Reaktionen, die bei Raumtemperatur nicht ablaufen, aber beim Erhitzen, ist
$Delta G$ nahe null und der zweite Term entscheidend: Die Reaktion ist
*enthalpisch getrieben*, der Entropieterm behindert sie bei tiefer Temperatur.

#figure(
  image("/bilder/schemata/energieprofil.svg", width: 96mm),
  caption: [Energieprofil einer einstufigen Reaktion. Der Weg mit der niedrigeren
    Barriere (B) läuft bei gleicher Temperatur schneller ab, obwohl beide Wege
    zum selben Produkt führen.],
) <fig:energieprofil>

Die Aktivierungsenergie $E_A$ folgt aus der Arrhenius-Gleichung

$ k = A dot e^(-E_A \/ (R T)) $

Eine Erhöhung der Temperatur um 10 K steigert die Geschwindigkeit bei
$E_A = 60$ kJ·mol⁻¹ etwa um den Faktor 2,2. Das ist der Grund, warum
„eine Stunde bei 80 °C" nicht durch „drei Stunden bei 40 °C" ersetzt werden
kann: Die Ausbeute mag stimmen, die Selektivität nicht.

*Das Hammond-Postulat.* Der Übergangszustand einer Reaktion ähnelt in seiner
Struktur dem Zustand, dem er energetisch am nächsten liegt. Bei einer exergonen
Reaktion mit hoher Barriere ähnelt er den Edukten, bei einer endergonen den
Produkten. Praktische Folge: Bei einer Reaktion, die ein instabiles
Carbeniumion durchläuft, ist der Übergangszustand „carbeniumionartig"; alles, was
ein Carbeniumion stabilisiert (Substituenten, polares Lösungsmittel), senkt die
Barriere und beschleunigt die Reaktion.

*Abschätzung der Reaktionswärme.* Die Reaktionsenthalpie läßt sich in guter
Näherung aus den Bindungsenergien berechnen:

$ Delta H approx sum "gebrochene Bindungen" - sum "geknüpfte Bindungen" $

Für die Chlorierung von Methan ergibt sich damit:

$ Delta H = (414 + 243) - (339 + 431) = -113 thin "kJ·mol"^(-1) $

Die Rechnung erklärt, warum die Reaktion thermisch stark getrieben ist — und
warum sie trotzdem erst bei erhöhter Temperatur in Gang kommt: Die erste
C–H-Spaltung durch das Chlorradikal benötigt eine Aktivierungsenergie, die
zunächst aufgebracht werden muß.

== Zum zeitlichen Ablauf organisch-chemischer Reaktionen

*Folgereaktionen.* Das gebildete Produkt reagiert weiter. Man erkennt sie daran,
daß die Ausbeute mit längerer Reaktionszeit sinkt und Nebenprodukte zunehmen.
Gegenmittel: Reaktionskontrolle (Dünnschichtchromatographie), Kühlung, geringerer
Umsatz.

*Konkurrenzreaktionen.* Zwei Reaktionen laufen vom selben Edukt aus
nebeneinander ab. Ihr Verhältnis hängt vom Verhältnis der
Geschwindigkeitskonstanten ab:

$ "Verhältnis" = k_1 \/ k_2 = e^(-(E_(A,1) - E_(A,2)) \/ (R T)) $

Bei großen Unterschieden der Aktivierungsenergien ist das Produktverhältnis
temperaturunabhängig; bei kleinen Unterschieden entscheidet die Temperatur.
Das ist der Hintergrund der *kinetischen* und der *thermodynamischen Kontrolle*:
Bei tiefer Temperatur entsteht das Produkt mit der kleineren Barriere, bei hoher
Temperatur das stabilere.

#figure(
  image("/bilder/schemata/energieprofil-sn1.svg", width: 84mm),
  caption: [Zweistufige Reaktion mit Zwischenstufe (Carbeniumion). Der zweite
    Schritt ist geschwindigkeitsbestimmend, wenn seine Barriere höher liegt —
    dann ist die Reaktion erster Ordnung im Substrat.],
) <fig:energieprofil-sn1>

*Einfluß von Lösungsmitteln.* Ein polares Lösungsmittel stabilisiert geladene
Zwischenstufen und beschleunigt Reaktionen mit polarem Übergangszustand. Für
S#sub[N]2-Reaktionen gilt die Reihe der Lösungsmittel:

$ "DMSO" > "DMF" > "MeCN" > "Aceton" > "EtOH" > "MeOH" > "H"_2"O" $

für den Angriff eines Anions; für S#sub[N]1-Reaktionen kehrt sich die Reihe um.

*Katalyse.* Ein Katalysator senkt die Aktivierungsenergie, ohne die Lage des
Gleichgewichts zu verändern. Man unterscheidet homogene Katalyse (Katalysator in
derselben Phase), heterogene Katalyse (feste Oberfläche) und Biokatalyse
(Enzyme). Für präparative Zwecke wichtig sind Säure- und Basenkatalyse,
Übergangsmetallkatalyse und Phasentransferkatalyse.

=== Reaktionsordnung und Zeitgesetze

Die Reaktionsordnung ergibt sich aus dem Zeitgesetz, nicht aus der
Reaktionsgleichung. Für die drei praktisch wichtigen Fälle gilt:

#figure(
  table(
    columns: (2fr, 1fr, 1.6fr, 3fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Ordnung*], [*Zeitgesetz*], [*Halbwertszeit*], [*graphische Auswertung*]),
    [0], [v = k], [c₀/(2k)], [c gegen t: Gerade],
    [1], [v = k·c], [ln 2 / k], [ln c gegen t: Gerade],
    [2], [v = k·c²], [1/(k·c₀)], [1/c gegen t: Gerade],
  ),
  caption: [Zeitgesetze und ihre Auswertung. Die Halbwertszeit ist nur bei
    Reaktionen erster Ordnung unabhängig von der Startkonzentration.],
) <tab:ordnung>

Für präparative Fragen genügt meist die Unterscheidung: Reaktionen erster
Ordnung (S#sub[N]1, Solvolyse) sind unabhängig von der Konzentration des
Nucleophils; Reaktionen zweiter Ordnung (S#sub[N]2, E2) beschleunigen sich mit
steigender Konzentration beider Partner. Wer eine Vorschrift variiert, sollte
wissen, welcher Fall vorliegt: Bei einer S#sub[N]2-Reaktion hilft ein
Konzentrationsüberschuß des Nucleophils, bei einer S#sub[N]1-Reaktion nicht.

*Nachweis der Ordnung.* Im Praktikum wird die Ordnung selten gemessen, sondern
aus dem Mechanismus abgeleitet. Wer sie prüfen will, arbeitet mit einer
Reihe von Ansätzen unterschiedlicher Anfangskonzentration und bestimmt den
Umsatz nach gleicher Zeit (Probenentnahme, gaschromatographische Analyse). Der
Quotient der Anfangsgeschwindigkeiten ergibt die Ordnung.

*Katalyse durch Produkte.* Ein Sonderfall, der im Praktikum oft übersehen wird:
Autokatalyse. Die Reaktion kommt langsam in Gang und beschleunigt sich, weil ein
Produkt als Katalysator wirkt. Typisch für Oxidationsreaktionen mit
Permanganat und für manche Veresterungen. Die Beobachtung „es passiert lange
nichts, dann plötzlich alles" ist ein Hinweis darauf.

=== Auswertung kinetischer Messungen

Wer im Praktikum eine Reaktionsgeschwindigkeit bestimmt, hat selten mehr als
eine Handvoll Meßpunkte. Für die Auswertung genügt meist die Auftragung
$ln c$ gegen $t$ (Ordnung 1) oder $1\/c$ gegen $t$ (Ordnung 2); die Gerade mit
dem besseren Bestimmtheitsmaß gibt die Ordnung an.

#figure(
  table(
    columns: (auto, 1.3fr, auto, 1.3fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*t/min*], [*c/mol·L⁻¹*], [*ln (c/c₀)*], [*1/c in L·mol⁻¹*]),
    [0], [0,100], [0,000], [10,0],
    [10], [0,061], [−0,494], [16,4],
    [20], [0,037], [−0,995], [27,0],
    [30], [0,022], [−1,514], [45,5],
    [40], [0,014], [−1,966], [71,4],
    [50], [0,008], [−2,526], [125],
  ),
  caption: [Meßreihe einer Hydrolyse. Die Auftragung $ln c$ gegen $t$ ist linear
    (Steigung −0,0505 min⁻¹), die Auftragung $1\/c$ nicht — die Reaktion ist
    erster Ordnung.],
) <tab:kinetik-daten>

*Durchrechnung.* Aus der Steigung von $ln c$ gegen $t$ folgt direkt die
Geschwindigkeitskonstante: $k = 0,0505$ min⁻¹. Damit ist die Halbwertszeit
$t_(1\/2) = ln 2 \/ k = 13,7$ min, und 90 % Umsatz sind nach
$t = ln 10 \/ k = 45,6$ min erreicht — die letzte Zeile der Tabelle bestätigt
das (bei 50 min restieren 8 %). Für die Vorschrift heißt das: Eine Stunde
Reaktionsdauer genügt, anderthalb Stunden bringen nichts mehr.

*Reaktion zweiter Ordnung.* Zur Kontrolle dieselbe Rechnung für einen Fall
zweiter Ordnung: Die Veresterung von Essigsäure mit Methanol (pseudo-zweite
Ordnung) liefert $1\/c$ gegen $t$ als Gerade. Zwei Punkte genügen:
$c = 1,00$ mol·L⁻¹ bei $t = 0$ und $c = 0,50$ mol·L⁻¹ bei $t = 90$ min. Dann ist
$k = (1\/0,50 - 1\/1,00) \/ 90 = 0,011$ L·mol⁻¹·min⁻¹, die Halbwertszeit
$t_(1\/2) = 1 \/ (k dot c_0) = 91$ min. Der Unterschied zur ersten Ordnung ist
präparativ wichtig: Die Halbwertszeit verdoppelt sich, wenn man die
Anfangskonzentration halbiert.

*Temperaturabhängigkeit.* Aus zwei Messungen bei verschiedenen Temperaturen
lassen sich Aktivierungsenergie und präexponentieller Faktor berechnen:

$ ln (k_2 \/ k_1) = -E_A \/ R dot (1\/T_2 - 1\/T_1) $

Ein Beispiel: $k_1 = 1,0 dot 10^(-3)$ s⁻¹ bei 300 K, $k_2 = 4,3 dot 10^(-3)$ s⁻¹
bei 310 K. Dann ist $ln 4,3 = 1,46$, und mit $1\/300 - 1\/310 = 1,075 dot 10^(-4)$
K⁻¹ folgt $E_A = 1,46 dot 8,314 \/ 1,075 dot 10^(-4) approx 113$ kJ·mol⁻¹ — ein
Wert, der zu einer Reaktion mit Bindungsspaltung im geschwindigkeitsbestimmenden
Schritt paßt.

*Fehlerquellen bei der Auswertung*

- Der Startzeitpunkt ist unbekannt (Aufheizzeit, Mischen). Bei schnellen
  Reaktionen wird die Zeit ab Zugabe des letzten Reagenzes gemessen, nicht ab
  dem Beginn des Mischens.
- Die Temperatur muß konstant sein; ein Wasserbad mit ± 0,5 K genügt für die
  Praxis, ein Thermostat mit ± 0,05 K für kinetische Messungen.
- Die Probenentnahme verändert das Volumen; bei kleinen Ansätzen wird
  spektroskopisch in situ gemessen (UV, NMR, Leitfähigkeit).

=== Katalyse in der Praxis

Ein Katalysator senkt die Aktivierungsenergie, ohne die Lage des Gleichgewichts
zu verschieben. Für die präparative Arbeit sind vier Formen wichtig:

#figure(
  table(
    columns: (1.4fr, 1.4fr, 1.9fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Form*], [*Beispiel*], [*Wirkung*]),
    [Säurekatalyse], [H#sub[2]SO#sub[4] bei Veresterung], [Protonierung des Carbonyls],
    [Basenkatalyse], [NaOH bei Aldolkondensation], [Deprotonierung zum Enolat],
    [Übergangsmetall], [Pd/C bei Hydrierung], [Aktivierung von H#sub[2] und Substrat],
    [Phasentransfer], [Tetrabutylammoniumbromid], [Transport von Anionen in die organische Phase],
    [Biokatalyse], [Lipase bei Veresterung], [enantioselektiv, milde Bedingungen],
  ),
  caption: [Katalyseformen und ihre Wirkung. Die Wahl entscheidet über
    Selektivität und Aufarbeitung.],
) <tab:katalyse>

*Vergiftung und Desaktivierung.* Katalysatoren verlieren ihre Wirkung durch
Schwermetalle (Pb, Hg, S-Verbindungen bei Pd), durch Polymerisation auf der
Oberfläche oder durch Blockierung der Poren. Bei Hydrierungen zeigt sich das als
plötzlich abbrechende Wasserstoffaufnahme; Abhilfe: frischer Katalysator,
Lösungsmittelwechsel, Filtration über Aktivkohle.

=== Aufgaben

- Eine Reaktion erster Ordnung hat $k = 2,5 dot 10^(-3)$ min⁻¹. Nach welcher
  Zeit sind 95 % umgesetzt? Wie lange dauert eine Halbwertszeit?
- Aus einer Meßreihe erhält man in der Auftragung $1\/c$ gegen $t$ eine Gerade
  mit der Steigung 0,024 L·mol⁻¹·min⁻¹. Berechnen Sie $k$ und die
  Halbwertszeit bei $c_0 = 0,5$ mol·L⁻¹.
- Warum läßt sich die Ordnung nicht aus der Reaktionsgleichung ablesen?
  Erläutern Sie am Beispiel der Hydrolyse eines Esters in Natronlauge.
- Eine Reaktion läuft bei 20 °C zehnmal schneller als bei 10 °C. Wie groß ist
  die Aktivierungsenergie näherungsweise?

== Säure-Base-Reaktionen

Der pK#sub[a]-Wert beschreibt die Stärke einer Säure in Wasser. In der
organischen Chemie interessieren vor allem die pK#sub[a]-Werte von
Kohlenstoff-Wasserstoff-Bindungen, weil sie die Bildung von Carbanionen
bestimmen.

#figure(
  table(
    columns: (2fr, 1fr, 2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verbindung*], [*pK#sub[a]*], [*korrespondierende Base*]),
    [Trifluoressigsäure], [0,2], [Trifluoracetat],
    [Ameisensäure], [3,8], [Formiat],
    [Benzoesäure], [4,2], [Benzoat],
    [Essigsäure], [4,8], [Acetat],
    [Kohlensäure], [6,4], [Hydrogencarbonat],
    [Ammonium-Ion], [9,2], [Ammoniak],
    [Phenol], [10,0], [Phenolat],
    [Wasser], [15,7], [Hydroxid],
    [Ethanol], [16,0], [Ethoxid],
    [Cyclopentadien], [16,0], [Cyclopentadienid],
    [Aceton], [19,3], [Enolat],
    [Acetylaceton], [9,0], [Enolat, doppelt stabilisiert],
    [Essigsäureethylester], [24,5], [Enolat],
    [Acetonitril], [25,0], [Nitrilcarbanion],
    [Ammoniak], [38], [Amid],
  ),
  caption: [pK#sub[a]-Werte in Wasser bei 25 °C. Maßgeblich ist das
    Lösungsmittel: In Dimethylsulfoxid liegen die Werte für CH-acide Verbindungen
    um 5 bis 8 Einheiten niedriger.],
) <tab:pks>

Für die Praxis folgt daraus die *Regel vom schwächeren Partner*: Eine
Säure-Base-Reaktion läuft nur ab, wenn die entstehende Base schwächer ist als die
eingesetzte. Natriumethanolat deprotoniert Aceton (pK#sub[a] 19,3) nicht
quantitativ, Natriumamid (pK#sub[a] 38 im korrespondierenden Ammoniak) dagegen
vollständig.

#figure(
  image("/bilder/schemata/hammett.svg", width: 68mm),
  caption: [Hammett-Gerade. Die Steigung ρ gibt an, wie empfindlich die Reaktion
    auf Substituenten am Aromaten reagiert; ein negatives ρ bedeutet, daß
    elektronenschiebende Gruppen die Reaktion beschleunigen.],
) <fig:hammett>

*Harte und weiche Zentren.* Nucleophile mit hoher Ladungsdichte (F⁻, RO⁻)
greifen harte Elektrophile an, solche mit hoher Polarisierbarkeit (I⁻, RS⁻,
CN⁻) weiche. Für die präparative Steuerung ist das wichtiger als die reine
Basizität: Iodid ist ein gutes Nucleophil, obwohl es eine schwache Base ist.

*Säurekonstanten und ihre Messung.* Der pK#sub[a]-Wert ergibt sich aus der
elektrometrischen Titration: Man titriert die halbneutralisierte Lösung und
mißt den pH-Wert. Bei wasserunlöslichen Verbindungen arbeitet man in
Dimethylsulfoxid oder in einem Wasser-Dioxan-Gemisch und rechnet um. Für die
Praxis genügt die Ordnung der Größen; die vierte Dezimalstelle interessiert
niemanden.

*Lewis-Säuren.* Neben dem Proton gibt es Elektronenpaarakzeptoren, die ebenfalls
Säuren sind: BF₃, AlCl₃, ZnCl₂, FeBr₃, TiCl₄. Sie werden in der organischen
Chemie vor allem für zwei Zwecke gebraucht:

- als Katalysatoren elektrophiler Substitutionen und Friedel-Crafts-Reaktionen;
- als Abfangreagenzien für Abgangsgruppen (Alkohol + BF₃ → Carbeniumion).

Für die Handhabung gilt: wasserfrei arbeiten, Glasgeräte vortrocknen, Zugabe
langsam und unter Kühlung. AlCl₃ hydrolysiert an feuchter Luft unter
HCl-Entwicklung.

*Basen in der Praxis.* Man unterscheidet:

#figure(
  table(
    columns: (2fr, 2fr, 4fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Base*], [*Charakter*], [*typische Verwendung*]),
    [NaOH, KOH], [stark, anorganisch], [Verseifung, Hydrolyse, Salzbildung],
    [Na#sub[2]CO#sub[3], K#sub[2]CO#sub[3]], [schwach, anorganisch], [Neutralisation empfindlicher Ansätze],
    [NaH], [stark, wasserfrei], [Deprotonierung von Alkoholen, CH-Acidität],
    [n-BuLi], [sehr stark, metallorganisch], [Metallierung, Enolatbildung bei −78 °C],
    [LDA], [stark, sterisch gehindert], [kinetisches Enolat, keine Addition an Carbonyl],
    [Pyridin, NEt#sub[3]], [schwach, organisch], [Abfangen von HCl bei Acylierungen],
    [DBU, DABCO], [stark, nicht nucleophil], [Eliminierungen, Umlagerungen],
  ),
  caption: [Basen für präparative Zwecke. Die Wahl folgt aus zwei Fragen: Wie
    stark muß die Base sein, und darf sie als Nucleophil stören?],
) <tab:basen>

Der zweite Gesichtspunkt ist oft der wichtigere. Hydroxid deprotoniert ein
Keton, greift aber auch das Carbonylkohlenstoffatom an; LDA deprotoniert und
greift nicht an. Deshalb entsteht mit LDA bei −78 °C das kinetische Enolat,
mit Hydroxid bei Raumtemperatur das thermodynamische.

*Nichtwäßrige Medien.* In aprotichen Lösungsmitteln fehlt Wasser als
protonenliefernder Partner. Carbanionen leben dort länger, Nucleophile sind
reaktiver („nackte" Anionen), und Säuren erscheinen schwächer. Wer pK-Werte
aus verschiedenen Lösungsmitteln vergleicht, muß diesen Effekt berücksichtigen —
er beträgt bis zu acht Einheiten.

== Einflüsse von Substituenten

Substituenten wirken über drei Wege auf die Reaktivität:

- *induktiv* (I): Elektronenzug oder -schub über σ-Bindungen, abstandsabhängig;
- *mesomer* (M): Delokalisierung über π-Systeme, nur bei Konjugation;
- *sterisch*: Behinderung des Angriffs, besonders bei ortho-Substitution.

Die quantitative Erfassung erfolgt über die *Hammett-Gleichung*

$ log (k \/ k_0) = rho dot sigma $

mit der Reaktionskonstanten ρ und der Substituentenkonstanten σ. Für die
Nitrierung von Benzolderivaten ist ρ = −6; für die Bromierung von
Seitenketten ρ = −1,4. Aus dem Vorzeichen von ρ folgt, ob ein
elektronenreicher oder elektronenarmer Übergangszustand durchlaufen wird.

#figure(
  table(
    columns: (2fr, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Substituent*], [*σ#sub[meta]*], [*σ#sub[para]*]),
    [NO₂], [0,71], [0,78],
    [CN], [0,56], [0,66],
    [Cl], [0,37], [0,23],
    [H], [0], [0],
    [CH₃], [−0,07], [−0,17],
    [OCH₃], [0,12], [−0,27],
    [NH₂], [−0,16], [−0,66],
  ),
  caption: [Hammett-Konstanten ausgewählter Substituenten. Der Unterschied
    zwischen meta und para zeigt den Anteil des mesomeren Effekts.],
) <tab:hammett>

*Sterische Effekte* lassen sich nicht über σ erfassen. Man verwendet die
Taft-Konstanten $E_s$ oder — für die Abschätzung im Praktikum — den
*A-Wert* (freie Enthalpie der Konformationsänderung am Cyclohexan): CH₃ 1,7;
C₂H₅ 1,75; i-C₃H₇ 2,15; t-C₄H₉ > 4,5 kJ·mol⁻¹.

*Anwendung auf die Reaktivität.* Das Hammett-Verfahren beantwortet drei
praktische Fragen:

- *Läuft die Reaktion über einen positiven oder negativen Übergangszustand?*
  Das Vorzeichen von ρ gibt es an.
- *An welcher Stelle greift der Substituent an?* Der Vergleich von σ#sub[meta]
  und σ#sub[para] zeigt, ob ein mesomerer Effekt beteiligt ist.
- *Wie stark ist der Effekt?* Der Betrag von ρ vergleicht Reaktionen
  untereinander.

Ein Beispiel: Die Verseifung von substituierten Benzoesäureestern hat ρ = +2,5.
Positive Ladung entsteht im Übergangszustand am Carbonylkohlenstoff; ein
elektronenziehender Substituent stabilisiert sie. Die Nitrierung von Benzol hat
ρ = −6; hier entsteht die positive Ladung im σ-Komplex, und elektronenschiebende
Gruppen beschleunigen.

*Grenzen.* Die Hammett-Gleichung versagt bei:

- ortho-Substitution (sterische Effekte überlagern den elektronischen);
- starken Mesomerieeffekten, die über das aromatische System hinausreichen;
- Reaktionen, bei denen der Substituent selbst in die Reaktion eingreift.

Für diese Fälle gibt es erweiterte Parametersätze (σ⁺, σ⁻, Taft-Konstanten), die
in der Originalliteratur nachzuschlagen sind.

*Der sterische Effekt in Zahlen.* Für die Veresterung von 2-substituierten
Benzoesäuren mit Methanol gilt die Reihenfolge der Ausbeuten: H 95 %, CH₃ 70 %,
Cl 65 %, NO₂ 55 %, i-C₃H₇ 20 %, t-C₄H₉ 5 %. Der Einfluß eines einzigen
Nachbaratoms übertrifft jeden elektronischen Effekt.

=== Chirurgische Trennung von Enantiomeren

Für die präparative Arbeit ist die Frage entscheidend, ob ein Racemat vorliegt
und wie es getrennt wird. Drei Verfahren stehen zur Verfügung:

#figure(
  table(
    columns: (1.4fr, 1.4fr, 1.8fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verfahren*], [*Prinzip*], [*Beispiel*]),
    [Diastereomerenbildung], [Salzbildung mit chiraler Base/Säure], [Brucin mit rac-Säure],
    [Chirale Chromatographie], [unterschiedliche Wechselwirkung], [Amylose-Phase, HPLC],
    [Enzymatische Spaltung], [selektive Umsetzung], [Lipase, Acetylierung],
    [Kristallisation], [kongruente Schmelze], [Bildung von Konglomeraten],
    [Kinetische Racematspaltung], [unterschiedliche Reaktionsgeschwindigkeit], [Sharpless-Epoxidierung],
  ),
  caption: [Verfahren zur Trennung von Enantiomeren. Die Auswahl richtet sich
    nach Maßstab und Empfindlichkeit der Verbindung.],
) <tab:racemat>

*Diastereomerenbildung im Detail.* Man setzt das Racemat mit einem
enantiomerenreinen Hilfsstoff um, der ein Salz oder ein kovalentes Derivat
bildet. Die beiden entstehenden Diastereomere haben unterschiedliche
Schmelzpunkte und Löslichkeiten und lassen sich daher kristallisieren. Nach der
Trennung wird der Hilfsstoff zurückgewonnen.

$ "rac-RCOOH" + "(R)-Base" -> "(R,R)-Salz" + "(S,R)-Salz" $

*Berechnung der Ausbeute.* Bei einer Racemattrennung ist die maximale Ausbeute
50 % des eingesetzten Materials, wenn ein Enantiomer gebraucht wird. Wird das
andere Enantiomer racemisiert und erneut eingesetzt, steigt die Gesamtausbeute auf
über 80 % — ein Verfahren, das in der Industrie Standard ist.

*Enantiomerenüberschuß.* Der ee-Wert berechnet sich aus dem Verhältnis der
Enantiomere:

$ "ee" = (n_R - n_S) \/ (n_R + n_S) dot 100 % $

Ein ee von 98 % bedeutet 99 : 1; ein ee von 90 % bedeutet 95 : 5. Für
pharmazeutische Wirkstoffe gilt heute ein ee über 99 % als Standard.

=== Konformation und Reaktivität

Die Gestalt eines Moleküls entscheidet mit über seine Reaktivität. Vier Fälle
sind präparativ bedeutsam:

- *Cyclohexan-Konformation*: Substituenten stehen axial oder äquatorial; die
  äquatoriale Lage ist um 7,6 kJ·mol⁻¹ (CH₃) günstiger. Bei der E2-Eliminierung
  muß die Abgangsgruppe axial stehen — deshalb reagiert *trans*-1,2-Dibromcyclohexan
  anders als das *cis*-Isomer.
- *Anomerer Effekt*: In Pyranosen ist die axiale Stellung eines Heteroatoms
  bevorzugt, weil die antibindende Wechselwirkung mit dem Ring-Sauerstoff
  günstiger ist. Folge: α-Glucoside sind stabiler als β-Glucoside.
- *Gauche-Effekt*: Elektronegative Substituenten stehen bevorzugt gauche
  zueinander (1,2-Difluorethan).
- *Wasserstoffbrücken*: Intramolekulare Brücken fixieren eine Konformation und
  verändern die Reaktivität (z. B. Salicylsäure, Enole).

#figure(
  table(
    columns: (1.5fr, auto, 2.3fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Substituent*], [*A-Wert in kJ·mol⁻¹*], [*Bemerkung*]),
    [F], [0,25], [klein, wenig gehindert],
    [CH#sub[3]], [7,3], [Standardfall],
    [CH#sub[2]CH#sub[3]], [7,5], [kaum größer],
    [i-C#sub[3]H#sub[7]], [9,0], [deutlich gehindert],
    [t-C#sub[4]H#sub[9]], [> 20], [praktisch immer äquatorial],
    [OCH#sub[3]], [2,5], [klein, aber elektronisch wirksam],
    [OH], [2,1], [Wasserstoffbrücken möglich],
  ),
  caption: [A-Werte (freie Enthalpie der Konformationsänderung am Cyclohexan).
    Der A-Wert ist das praktische Maß für die sterische Größe eines
    Substituenten.],
) <tab:a-werte>

=== Aufgaben

- Zeichnen Sie die beiden Sesselkonformationen von *cis*- und *trans*-4-tert-Butylcyclohexanol
  und geben Sie an, welche Form jeweils überwiegt.
- Ein Racemat hat einen ee von 96 %. Wieviel Prozent des Materials sind das
  (S)-Enantiomer, wenn das (R)-Enantiomer im Überschuß vorliegt?
- Warum ist die templatgesteuerte Synthese in der Natur so erfolgreich, obwohl
  sie nur mit schwachen Wechselwirkungen arbeitet?

== Zur Behandlung der Reaktivität

Die Molekülorbitaltheorie erklärt Reaktivität über die Lage der Grenzorbitale:
Das höchste besetzte Orbital (HOMO) des Nucleophils wechselwirkt mit dem
niedrigsten unbesetzten Orbital (LUMO) des Elektrophils. Je kleiner die
Energiedifferenz, desto stärker die Wechselwirkung und desto schneller die
Reaktion — das ist die Begründung für die Regel von der *Weichheit* der
Partner.

#figure(
  image("/bilder/schemata/orbital-overlap.svg", width: 74mm),
  caption: [Bindende Überlappung. Bei der σ-Bindung liegen die beteiligten
    Orbitale auf der Verbindungsachse, beim π-System oberhalb und unterhalb
    davon.],
) <fig:orbitale>

Für präparative Zwecke genügt meist eine qualitative Anwendung: Elektronenreiche
Doppelbindungen reagieren mit Elektrophilen, elektronenarme mit Nucleophilen.
Die Störungstheorie liefert die Zahlen, die Praxis liefert die Reihenfolge.

*Grenzorbitale in Zahlen.* Das HOMO eines Nucleophils und das LUMO eines
Elektrophils lassen sich für einfache Fälle abschätzen:

#figure(
  table(
    columns: (2fr, auto, 3fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Teilchen*], [*Orbital*], [*Charakter*]),
    [H#sub[2]C=CH#sub[2]], [π (HOMO)], [nucleophil, reagiert mit Elektrophilen],
    [H#sub[2]C=CH–CHO], [π\* (LUMO)], [elektrophil am β-C],
    [Benzol], [π (HOMO)], [nucleophil, aromatische Substitution],
    [Carbeniumion], [p (LUMO)], [hartes Elektrophil],
    [Enolat], [π (HOMO)], [nucleophil am α-C],
    [Carbonyl], [π\* (LUMO)], [elektrophil am Carbonyl-C],
  ),
  caption: [Grenzorbitale und ihr Reaktionsverhalten. Die Lage der Orbitale
    entscheidet, welches Ende eines ambivalenten Teilchens angegriffen wird.],
) <tab:grenzorbitale>

*Ambivalenz.* Manche Teilchen können an zwei Stellen reagieren. Das Enolat greift
mit dem α-Kohlenstoff an (C-Alkylierung) oder mit dem Sauerstoff (O-Alkylierung);
welches Produkt entsteht, hängt vom Lösungsmittel und vom Gegenion ab: In
protischen Medien und mit harten Elektrophilen überwiegt O-Alkylierung, in
aprotischen mit weichen Elektrophilen C-Alkylierung. Dieselbe Überlegung gilt für
das Nitrilcarbanion und für das Cyanid-Ion.

*Regioselektivität aus Orbitalen.* Bei der Addition an α,β-ungesättigte Carbonyle
greift ein Nucleophil am β-Kohlenstoff an (1,4-Addition), wenn das LUMO dort die
größere Amplitude hat; bei harten Nucleophilen und kinetischer Kontrolle entsteht
das 1,2-Produkt. Beide Produkte sind oft ineinander umwandelbar — ein Fall von
thermodynamischer und kinetischer Kontrolle.

== Stereoisomerie

Stereoisomere haben dieselbe Konstitution, aber unterschiedliche räumliche
Anordnung. Zwei Grundtypen sind zu unterscheiden:

- *Enantiomere*: Spiegelbilder, nicht zur Deckung zu bringen; identische
  physikalische Eigenschaften außer dem Drehsinn des polarisierten Lichts.
- *Diastereomere*: nicht spiegelbildlich; unterschiedliche physikalische
  Eigenschaften, trennbar durch Kristallisation oder Chromatographie.

#figure(
  image("/bilder/schemata/stereo-r-s.svg", width: 104mm),
  caption: [Konfiguration am stereogenen Zentrum. Nach CIP-Regeln wird die
    Priorität der Substituenten bestimmt; zeigt der rangniedrigste Substituent
    nach hinten, entspricht der Drehsinn im Uhrzeigersinn der R-Konfiguration.],
) <fig:stereo>

*Racemattrennung.* Enantiomere lassen sich nicht durch Destillation oder
Kristallisation trennen. Drei Wege führen zum Ziel:

- *Diastereomerenbildung*: Umsetzung mit einem enantiomerenreinen Hilfsstoff,
  Trennung der Diastereomere, Rückgewinnung.
- *Chromatographie an chiraler Phase*: HPLC mit Cyclodextrin- oder
  Polysaccharidphase.
- *Enzymatische Racematspaltung*: selektive Umsetzung eines Enantiomers.

*Stereoselektivität und Stereospezifität.* Stereoselektiv bedeutet, daß ein
Produkt bevorzugt entsteht; stereospezifisch, daß der Reaktionsweg die
Konfiguration bestimmt. Die S#sub[N]2-Reaktion ist stereospezifisch (Umkehr),
die S#sub[N]1-Reaktion stereoselektiv (Racemisierung mit Bevorzugung eines
Produkts bei ionischen Effekten).

#figure(
  image("/bilder/schemata/sn2-stereo.svg", width: 104mm),
  caption: [Walden-Umkehr bei der S#sub[N]2-Reaktion. Nucleophil und
    Abgangsgruppe stehen im Übergangszustand auf gegenüberliegenden Seiten.],
) <fig:sn2-stereo>

Am Übergangszustand selbst ist die Umkehr abzulesen: Das Kohlenstoffatom ist
fünfach koordiniert, Nucleophil und Abgangsgruppe stehen auf einer Achse, die
drei übrigen Substituenten liegen in einer Ebene. Diese Anordnung ist nur
erreichbar, wenn das Nucleophil von der Rückseite angreift — daher der Name
*Rückseitenangriff*.

#figure(
  image("/bilder/schemata/walden-zyklus.svg", width: 74mm),
  caption: [Übergangszustand der S#sub[N]2-Reaktion. Die gestrichelten Bindungen
    deuten die partiellen Bindungen zu Nucleophil und Abgangsgruppe an.],
) <fig:walden>

*Chiralität ohne stereogenes Zentrum.* Nicht jedes chirale Molekül hat ein
asymmetrisches Kohlenstoffatom. Zwei Fälle sind im Praktikum wichtig:

- *Axiale Chiralität*: Allene und ortho,ortho'-disubstituierte Biphenyle. Die
  Moleküle sind chiral, weil die Drehung um eine Achse gehindert ist.
- *Planare Chiralität*: Cyclophane und einige Metallocene.

Für die Trennung gilt dasselbe wie für zentrale Chiralität: Diastereomere bilden
oder chiral chromatographieren.

*Konformation und Konfiguration.* Die Konfiguration ist die Anordnung der Atome
im Raum, die sich nicht durch Drehung um Einfachbindungen ändern läßt. Die
Konformation ist die Gestalt, die durch Drehung entsteht. Für die Reaktivität ist
oft die Konformation entscheidend: Die E2-Eliminierung verlangt eine antiperiplanare
Anordnung von H und Abgangsgruppe; steht sie nicht zur Verfügung, läuft die
Reaktion langsamer oder über einen anderen Weg (E1).

*Stereochemische Nomenklatur.* Im Text werden verwendet:

#figure(
  table(
    columns: (auto, 3fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Zeichen*], [*Bedeutung*]),
    [(R), (S)], [Konfiguration nach CIP-Regeln],
    [(E), (Z)], [Konfiguration an der Doppelbindung],
    [(+), (−)], [Drehsinn des polarisierten Lichts],
    [(rac)], [Racemat, 1:1-Gemisch der Enantiomere],
    [(ee)], [enantiomeric excess in Prozent],
    [(de)], [diastereomeric excess in Prozent],
  ),
  caption: [Stereochemische Kurzzeichen. Die Zeichen (R)/(S) und (+)/(−) sind
    unabhängig voneinander: (R)-Milchsäure ist (−)-Milchsäure.],
) <tab:stereo-zeichen>

*Reaktionen mit hoher Stereoselektivität.* Für die Syntheseplanung wichtig sind:

- *Substitution*: S#sub[N]2 kehrt um, S#sub[N]1 racemisiert.
- *Addition an Alkene*: syn (z. B. Hydrierung, Hydroborierung) oder anti
  (z. B. Bromierung über das Bromoniumion).
- *Reduktion von Ketonen*: Hydrid von der weniger gehinderten Seite
  (Cram-Regel, Felkin-Anh-Modell); mit chelatbildenden Reagenzien umgekehrt.
- *Aldolreaktion*: Z-Enolat gibt syn, E-Enolat anti.

== Syntheseplanung

Die Planung einer Synthese geht vom Zielmolekül rückwärts. Man zerlegt es in
gedachte Bruchstücke (Retrosynthese), prüft für jede Zerlegung die verfügbaren
Bausteine und wählt den Weg mit den wenigsten Schritten und den sichersten
Reagenzien.

#figure(
  image("/bilder/schemata/retrosynthese.svg", width: 104mm),
  caption: [Prinzip der Retrosynthese: Das Zielmolekül wird in Bausteine zerlegt,
    die als Edukte verfügbar sind.],
) <fig:retrosynthese>

*Regeln für die Praxis*

- Jede Stufe muß eine Ausbeute über 60 % haben; sonst ist der Weg zu lang.
- Schutzgruppen so spät wie möglich einführen und so früh wie möglich entfernen.
- Reaktionen mit gefährlichen Reagenzien (Diazomethan, Osmiumtetroxid,
  Dimethylsulfat) nur, wenn eine Alternative fehlt.
- Die Reihenfolge der Stufen so wählen, daß Zwischenprodukte stabil und
  reinigbar sind.
- Am Ende steht die Bilanz: Wie viele Stufen, welche Gesamtausbeute, welche
  Abfälle?

#figure(
  table(
    columns: (auto, 1fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Zielbindung*], [*Retrosynthese*], [*Reagenz*]),
    [C–C (Aldol)], [α,β-Hydroxycarbonyl → Carbonyl + Enolat], [LDA, dann Aldehyd],
    [C–C (Grignard)], [Alkohol → Carbonyl + Organometall], [RMgX, dann H₃O⁺],
    [C=C (Wittig)], [Alken → Carbonyl + Ylid], [Ph₃P=CHR],
    [C–N], [Amin → Halogenid + Amin], [S#sub[N]2 oder Buchwald-Hartwig],
    [C–O (Ether)], [Ether → Alkoxid + Halogenid], [Williamson],
  ),
  caption: [Häufige Retrosyntheseschnitte und ihre Reagenzien.],
) <tab:retro>

*Beispiel einer Retrosynthese.* Zielverbindung: 4-Phenylbutan-2-ol. Der
Schnitt erfolgt an der Bindung zwischen C2 und C3, weil dort ein Aldol- oder
Grignard-Zugang möglich ist:

- Schnitt 1: 4-Phenylbutan-2-ol → Benzylchlorid + Aceton (via Grignard) oder
  → Phenylacetaldehyd + Methylmagnesiumiodid.
- Schnitt 2: Rückwärts weiter zu Toluol (radikalische Chlorierung) und
  Aceton (Kaufprodukt).

Die zweite Variante hat zwei Stufen, die erste drei; die zweite ist zu wählen.

#block(above: 5pt, below: 6pt, align(center)[
  #text(size: 10pt)[Ph–CH#sub[2]–CH#sub[2]–CH(OH)–CH#sub[3] #h(0.6em) ← #h(0.6em)
  Ph–CH#sub[2]–CHO + CH#sub[3]MgI]
])

#figure(
  table(
    columns: (2fr, auto, 3fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Kriterium*], [*Gewicht*], [*Frage im Praktikum*]),
    [Schrittzahl], [hoch], [Kann ich die Stufen in einer Woche schaffen?],
    [Ausbeute je Stufe], [hoch], [Bleiben nach der Reinigung mehr als 50 %?],
    [Gefährlichkeit], [sehr hoch], [Brauche ich Diazomethan, OsO₄, DMSO-Hydrid?],
    [Reinigung], [hoch], [Ist das Zwischenprodukt kristallisierbar oder destillierbar?],
    [Kosten], [mittel], [Sind die Edukte im Praktikum verfügbar?],
    [Entsorgung], [mittel], [Wie viel halogenorganischer Abfall entsteht?],
  ),
  caption: [Kriterien der Wegewahl. Die Reihenfolge entspricht der
    Entscheidungspraxis: erst Machbarkeit, dann Ausbeute, dann Sicherheit.],
) <tab:planungskriterien>

*Schutzgruppen.* Eine Schutzgruppe ist ein Kompromiß: Sie kostet zwei Stufen
(Schutzung, Entschützung) und muß unter den Bedingungen der übrigen Stufen
stabil sein. Für Alkohole gebräuchlich sind Silylether (TMS, TBS), Acetate,
Benzylether und THP-Ether. Die Auswahl folgt aus der Stabilitätsreihenfolge:

$ "TBS" > "THP" approx "Benzyl" > "Acetyl" > "TMS" $

für basische Bedingungen, und umgekehrt für saure. Wer die Reihenfolge kennt,
kann eine Synthese mit mehreren funktionellen Gruppen planen, ohne in jeder
Stufe neu zu entscheiden.

*Literaturhinweise.* Für die Vertiefung sei auf die Lehrbücher der organischen
Chemie und auf die Monographien von Corey und Warren zur Syntheseplanung
verwiesen. Wer im Praktikum eine unbekannte Verbindung darstellen soll, plant
zuerst die *Reinigung* — ein Syntheseweg ohne tragfähige Aufarbeitung ist
kein Syntheseweg.

=== Mehrstufige Synthesen planen

Eine Mehrstufensynthese mit mehr als drei Stufen ist ein Problem der
Reihenfolge, nicht der Reaktionen. Drei Fragen bestimmen die Planung:

- *Welche Stufe ist die kritische?* Sie bestimmt die Ausbeute und wird zuerst
  geplant.
- *In welcher Reihenfolge werden die funktionellen Gruppen eingeführt?* Erst die
  reaktiven, dann die empfindlichen; Schutzgruppen so spät wie möglich.
- *Wo wird gereinigt?* Nach jeder Stufe, die ein unreines Zwischenprodukt
  liefert — oder nach mehreren, wenn die Zwischenprodukte stabil sind.

Beispiel: 2,4-Dinitrophenylhydrazin aus 2,4-Dinitrochlorbenzol und Hydrazin.
Zwei Stufen, beide gut dokumentiert, Gesamtausbeute über 60 %. Die kritische
Stufe ist die zweite (Hydrazin ist toxisch, das Produkt schwer löslich).

*Ausbeutebilanz.* Bei fünf Stufen mit je 80 % Ausbeute bleiben 33 % der
theoretischen Gesamtausbeute. Bei je 60 % bleiben 7,8 %. Deshalb gilt: Eine
Stufe unter 60 % ist ein Planungsfehler, nicht ein Pech.

#figure(
  table(
    columns: (auto, auto, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (center, center, center, center),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Stufen*], [*60 %*], [*80 %*], [*95 %*]),
    [1], [60 %], [80 %], [95 %],
    [2], [36 %], [64 %], [90 %],
    [3], [22 %], [51 %], [86 %],
    [5], [7,8 %], [33 %], [77 %],
    [8], [1,7 %], [17 %], [66 %],
  ),
  caption: [Gesamtausbeute in Abhängigkeit von Stufenzahl und Einzelausbeute.
    Die Tabelle ist das wichtigste Argument gegen lange Synthesen.],
) <tab:ausbeutebilanz>

*Schutzgruppenstrategie.* Für eine Synthese mit drei funktionellen Gruppen
braucht man höchstens zwei Schutzgruppen, und diese müssen orthogonal sein: Sie
werden unter Bedingungen entfernt, die einander nicht beeinflussen. Die
klassische Kombination ist Boc (sauer) und Benzyl (Hydrierung); eine weitere ist
TBS (fluorid) und Acetyl (Base).

#figure(
  table(
    columns: (1.2fr, 1.4fr, 1.4fr, 1.3fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Gruppe*], [*schützt*], [*stabil gegen*], [*entfernt mit*]),
    [Boc], [Amin], [Base, Hydrierung], [TFA, HCl],
    [Cbz], [Amin], [Base, Säure], [H#sub[2]/Pd],
    [Fmoc], [Amin], [Säure], [Piperidin],
    [TBS], [Alkohol], [Base, Oxidation], [F⁻, HF·Pyridin],
    [Acetyl], [Alkohol, Amin], [Säure, Oxidation], [NaOH, NH#sub[3]],
    [Benzyl], [Alkohol], [Base, Säure], [H#sub[2]/Pd],
    [THP], [Alkohol], [Base, Hydrid], [H#sub[3]O⁺],
    [Acetal], [Keton], [Base, Hydrid], [H#sub[3]O⁺],
  ),
  caption: [Schutzgruppen und ihre Orthogonalität. Zwei Gruppen sind orthogonal,
    wenn sie unter Bedingungen entfernt werden, die die andere nicht
    angreifen.],
) <tab:schutzgruppen>

*Retrosynthetische Strategien.* Vier Vorgehensweisen haben sich bewährt:

- *Zerlegung in zwei gleich große Hälften* („halbe-halbe"): günstig, weil beide
  Teile parallel aufgebaut werden können.
- *Aufbau durch Kettenverlängerung*: von einem Ende her, mit C–C-Verknüpfungen
  (Grignard, Aldol, Wittig).
- *Aufbau durch Ringschluß*: zuletzt den Ring schließen, weil Ringschlüsse
  empfindlich sind.
- *Funktionalisierung eines Gerüsts*: zuerst das Kohlenstoffgerüst, dann die
  funktionellen Gruppen — die klassische Strategie der Terpensynthese.

=== Aufgaben

- Eine Synthese hat vier Stufen mit 75, 60, 90 und 85 % Ausbeute. Wie hoch ist
  die Gesamtausbeute? Lohnt sich eine fünfte Stufe mit 95 %, wenn sie die
  Ausbeute der dritten auf 95 % hebt?
- Warum ist Boc für ein Amin geeignet, das anschließend mit Natronlauge
  behandelt wird, Fmoc dagegen nicht?
- Formulieren Sie eine Retrosynthese für 4-Phenylbutan-2-on und prüfen Sie, ob
  die Edukte im Praktikum verfügbar sind.

== Literaturhinweise

- *March, Advanced Organic Chemistry*. Mechanismus, Reaktionsbedingungen,
  Ausbeuten; das Nachschlagewerk für die Frage „warum so und nicht anders".
- *Carey, Sundberg, Advanced Organic Chemistry*, Teile A und B. Mechanistische
  Grundlagen und Synthesemethoden mit Übungsaufgaben.
- *Clayden, Greeves, Warren, Organic Chemistry*. Einführung mit durchgehender
  Begründung aus Orbitalen und Konformation.
- *Anslyn, Dougherty, Modern Physical Organic Chemistry*. Für die quantitative
  Behandlung von Energetik, Kinetik und Substituenteneffekten.
- *Corey, Cheng, The Logic of Chemical Synthesis*. Retrosynthese und
  Syntheseplanung an Beispielen.
- *Reichardt, Welton, Solvents and Solvent Effects in Organic Chemistry*. Für
  die Abschätzung von Lösungsmitteleinflüssen.
