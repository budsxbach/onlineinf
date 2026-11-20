// ============================================================================
//  D.1  Radikalische Substitution
// ============================================================================

#import "/vorlage/layout.typ": *

== Radikalische Substitution

Die radikalische Substitution verläuft über kettenförmige Folgen von
Elementarschritten. Der Start erfolgt durch thermische oder photochemische
Bindungsspaltung, die Kette wird über Abstraktion eines Wasserstoffatoms durch
ein Radikal fortgeführt, und der Abbruch erfolgt durch Rekombination oder
Disproportionierung zweier Radikale.

=== Erzeugung und Stabilität von Radikalen

Radikale entstehen bevorzugt aus schwachen Bindungen: O–O-Bindungen in Peroxiden,
N–Br-Bindungen in N-Bromamiden, Halogen-Kohlenstoff-Bindungen in Gegenwart von
Licht oder Radikalstartern. Ihre Stabilität folgt der Reihe

$ "C"("CH" _3)_3 dot > "CH"("CH" _3)_2 dot > "CH" _2"CH" _3 dot > dot "CH" _3 > dot "CH" _2"Cl" $

und wird durch Hyperkonjugation, Delokalisation und sterische Abschirmung
erklärt. Benzylische und allylische Radikale sind besonders stabil, weil das
unpaarige Elektron über den Ring bzw. die Doppelbindung delokalisiert wird;
daraus folgt die hohe Reaktivität benzylischer Positionen.

#figure(
  table(
    columns: (2fr, auto, 2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Radikal*], [*rel. Stabilität*], [*Bemerkung*]),
    [Phenyl], [1], [Referenz],
    [Benzyl], [3], [delokalisiert, mesomeriestabilisiert],
    [tert-Butyl], [2,5], [Hyperkonjugation],
    [Isopropyl], [1,5], [zwei Nachbargruppen],
    [Ethyl], [1,2], [eine Nachbargruppe],
    [Methyl], [1,0], [keine Stabilisierung],
    [Trichlormethyl], [0,3], [elektronenziehende Gruppen destabilisieren],
  ),
  caption: [Relative Stabilität von Radikalen (bezogen auf Phenylradikal).
    Die Reihenfolge bestimmt die Regioselektivität jeder radikalischen
    Reaktion.],
) <tab:radikalstabilitaet>

*Startreaktionen.* Drei Wege sind gebräuchlich:

- *thermisch*: Azobisisobutyronitril (AIBN) zerfällt bei 70–80 °C unter
  Stickstoffabspaltung; Dibenzoylperoxid bei 80–90 °C.
- *photochemisch*: Halogen-Moleküle spalten im UV-Licht homolytisch; eine
  Wolframlampe oder eine Quecksilberdampflampe genügt.
- *redox*: Eisen(II)-Ionen reduzieren Hydroperoxide (Fenton-Reaktion);
  Kupfer(I) und Wasserstoffperoxid erzeugen Hydroxylradikale.

$ "AIBN" ->^(70 °C) 2 "R" dot + "N" _2 $

*Abbruchreaktionen.* Zwei Radikale rekombinieren oder disproportionieren. Bei
der Chlorierung von Methan entsteht neben Chlormethan auch Ethan (Rekombination
zweier Methylradikale) — ein Nebeneffekt, der bei der Ausbeuteberechnung oft
übersehen wird.

=== Reaktivität und Selektivität

Chlorierung ist wenig selektiv, Bromierung stark selektiv. Für die
Bromierung von 2-Methylbutan beobachtet man statistisch-normiert:

#figure(
  table(
    columns: (auto, auto, auto, auto),
    inset: (x: 5pt, y: 3.5pt),
    align: (left, right, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Wasserstofftyp*], [*Zahl der H*], [*rel. Reaktivität (Cl, 25 °C)*], [*rel. Reaktivität (Br, 127 °C)*]),
    [primär], [9], [1], [1],
    [sekundär], [2], [3,8], [82],
    [tertiär], [1], [5,2], [1600],
  ),
  caption: [Selektivität der radikalischen Halogenierung von Alkanen. Die Werte
    sind auf ein primäres Wasserstoffatom bezogen.],
) <tab:selektivitaet>

Aus den Zahlen folgt das Produktverhältnis: Bei der Chlorierung von
2-Methylbutan entstehen 65 % 1-Chlor-2-methylbutan und 35 % 2-Chlor-2-methylbutan;
bei der Bromierung überwiegt das tertiäre Produkt mit über 95 %.

*Warum ist Brom selektiver?* Die Abstraktion des Wasserstoffatoms ist bei Brom
endotherm und liegt nahe am Übergangszustand (Hammond-Postulat): Der
Übergangszustand ähnelt dem Radikal, und dessen Stabilität entscheidet. Bei Chlor
ist der Schritt exotherm, der Übergangszustand ähnelt den Edukten, und die
Unterschiede zwischen primär, sekundär und tertiär fallen kaum ins Gewicht.

*Quantitative Auswertung.* Das Verhältnis der Produkte ergibt sich aus

$ "Verhältnis" = (n_1 dot r_1) \/ (n_2 dot r_2) $

mit der Zahl der Wasserstoffatome $n$ und der relativen Reaktivität $r$. Wer die
Rechnung beherrscht, kann vorhersagen, ob ein Ansatz sinnvoll ist — und ob eine
Trennung nötig wird.

*Rechenbeispiel: Chlorierung und Bromierung von Isobutan.* Isobutan besitzt
neun primäre und ein tertiäres Wasserstoffatom. Mit den relativen
Reaktivitäten der folgenden Tabelle ergibt sich bei der Chlorierung:

$ (9 dot 1,0) \/ (9 dot 1,0 + 1 dot 5,0) = 0,64 $

Es entstehen also 64 % 1-Chlor-2-methylpropan und 36 % 2-Chlor-2-methylpropan —
die Trennung ist mühsam. Bei der Bromierung kehrt sich das Bild um:

$ (9 dot 1,0) \/ (9 dot 1,0 + 1 dot 1700) = 0,005 $

Hier liefert die Bromierung 99,5 % 2-Brom-2-methylpropan; die kleinen
Ausbeuteverluste gehen auf die eine Seite, die man haben will. Genau darum
greift man in der präparativen Praxis zur Bromierung, sobald ein tertiäres
Wasserstoffatom zur Verfügung steht.

#figure(
  table(
    columns: (1.3fr, auto, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*H-Atom*], [*Zahl n*], [*r (Cl·)*], [*r (Br·)*]),
    [primär (C–H)], [—], [1,0], [1,0],
    [sekundär (C–H)], [—], [3,8], [82],
    [tertiär (C–H)], [—], [5,0], [1700],
    [benzylisch/allylisch], [—], [≈ 10], [≈ 10#super[4]],
  ),
  caption: [Relative Reaktivitäten pro Wasserstoffatom bei der radikalischen
    Halogenierung (25 °C). Brom ist langsamer, aber um Größenordnungen
    selektiver — Selektivität kostet Geschwindigkeit.],
) <tab:radikal-selektivitaet>

=== Chlorierung von Alkanen

Die technische Chlorierung von Methan führt zu einem Gemisch von Chlormethan bis
Tetrachlormethan; im Labor ist sie nur für Reaktionen mit einheitlichem Produkt
sinnvoll (Neopentan, Cyclohexan unter bestimmten Bedingungen).

#vorschrift("D.1.1", [Chlorcyclohexan aus Cyclohexan])[
  #reaktion(
    $ "C" _6"H" _12 + "Cl" _2 $,
    [#text(size: 6.5pt)[h $nu$, 20 °C]],
    $ "C" _6"H" _11"Cl" + "HCl" $,
  )

  #ansatz[
    84 g (107 mL; 1,0 mol) Cyclohexan, 36 g (25 mL; 0,50 mol) Chlor,
    2 g Natriumcarbonat.
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Gaseinleitungsrohr, Thermometer und
  Rückflußkühler werden Cyclohexan und Natriumcarbonat vorgelegt und auf 20 °C
  gekühlt. Man leitet trockenes Chlor so langsam ein, daß die Temperatur
  25 °C nicht übersteigt und kein gelbgrüner Nebel über der Flüssigkeit steht;
  die Belichtung erfolgt mit einer Wolframlampe aus 30 cm Abstand.

  Nach beendeter Chlormenge (etwa 2 h) spült man mit Stickstoff, wäscht mit
  Wasser und 5-prozentiger Natriumcarbonatlösung und trocknet über
  Calciumchlorid.

  Das Rohprodukt wird über eine Vigreux-Kolonne fraktioniert. Die bei
  140–143 °C übergehende Fraktion ist reines Chlorcyclohexan; Vorlauf und
  Nachlauf enthalten das Ausgangsmaterial und Dichlorcyclohexan.

  #ausbeute[47 g (40 % d. Th., bezogen auf Chlor) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 142 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4626 #h(2em)
    $rho_20$ = 1,000 g·cm#super[−3]
  ]
]

#gefahr[Chlor ist stark giftig, ätzend und stark oxidierend; es reizt die Atemwege
  schon in geringer Konzentration und kann zum Lungenödem führen. Nur im Abzug
  arbeiten, Chlorgeruch als Warnsignal ernst nehmen. Chlorwasserstoff, der bei
  der Reaktion entsteht, ist ätzend; Abgas durch Natronlauge leiten.
  Cyclohexan ist leicht entzündbar, gesundheitsschädlich und
  reproduktionstoxisch.]

*Ausbeute und Selektivität.* Die Ausbeute ist bewußt niedrig gehalten (0,5 mol
Chlor auf 1 mol Cyclohexan), weil bei höherem Umsatz die Dichlorierung zunimmt.
Für die Praxis gilt: Bei radikalischen Chlorierungen wird der Umsatz begrenzt,
nicht maximiert.

=== Bromierung von Aromaten-Seitenketten

Benzylische Positionen sind besonders reaktiv. Toluol, Ethylbenzol und
Methylnaphthaline reagieren mit Brom unter Belichtung oder in Gegenwart von
Radikalstartern an der Seitenkette — nicht am Ring. Das ist der grundlegende
Unterschied zur elektrophilen Substitution, die einen Katalysator (FeBr#sub[3])
und Ringpositionen verlangt.

$ "Ar–CH" _3 + "Br" _2 ->^(h $nu$) "Ar–CH" _2"Br" + "HBr" $

*Selektivität in der Seitenkette.* Bei Alkylgruppen mit mehreren
Wasserstofftypen wird bevorzugt die benzylische Position substituiert. Bei
Ethylbenzol entsteht 1-Brom-1-phenylethan, bei Isopropylbenzol
2-Brom-2-phenylpropan; die Kettenenden werden nicht angegriffen, solange die
benzylische Position frei ist.

*N-Bromsuccinimid (NBS)* eignet sich für die Bromierung empfindlicher
Verbindungen, weil es Brom in niedriger Konzentration freisetzt und keine
Bromwasserstoffsäure im Reaktionsgemisch anreichert. Die Reaktion wird in
Tetrachlormethan oder Tetrahydrofuran bei Rückfluß durchgeführt, mit AIBN oder
Licht als Initiator.

#vorschrift("D.1.2", [Benzylbromid aus Toluol])[
  #reaktion(
    $ "C" _6"H" _5"CH" _3 + "Br" _2 $,
    [#text(size: 6.5pt)[h $nu$, 80 °C]],
    $ "C" _6"H" _5"CH" _2"Br" + "HBr" $,
  )

  #ansatz[
    92 g (106 mL; 1,0 mol) Toluol, 176 g (55 mL; 1,1 mol) Brom,
    4 g wasserfreies Natriumcarbonat.
  ]

  In einem 500-ml-Rundkolben mit Rückflußkühler und Tropftrichter legt man
  Toluol und Natriumcarbonat vor und erhitzt auf 80 °C. Unter Bestrahlung mit
  einer Wolframlampe tropft man Brom so zu, daß die Umsetzung gleichmäßig
  verläuft und kein freies Halogen in größerer Konzentration vorliegt.

  Nach beendeter Zugabe wird 1 h weiterbelichtet. Man wäscht mit Wasser und
  10-prozentiger Natriumcarbonatlösung, trennt die organische Phase, trocknet
  über Calciumchlorid und destilliert im Vakuum über eine kurze Kolonne.

  #ausbeute[129 g (76 % d. Th.) farblose, stechend riechende Flüssigkeit.]

  #kenndaten[
    Sdp. 198–199 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5751 #h(2em)
    $rho_20$ = 1,455 g·cm#super[−3]
  ]
]

#gefahr[Brom ist stark ätzend und wirkt stark oxidierend; es verursacht schwere
  Verbrennungen und ist für Wasserorganismen sehr giftig. Nur im Abzug und in
  kleinen Portionen arbeiten, Tropftrichter mit Überdruckventil verwenden. Die
  Bestrahlung mit UV-Licht erzeugt zusätzlich Reizstoffe. Benzylbromid ist
  giftig und tränenreizend; Hautkontakt vermeiden.]

*Reinheit und Zersetzung.* Benzylbromid hydrolysiert an feuchter Luft zu
Benzylalkohol und Bromwasserstoff; es wird in brauner Flasche über
Natriumcarbonat aufbewahrt. Für die Weiterverarbeitung ist frisch destilliertes
Material zu verwenden.

#vorschrift("D.1.3", [Benzylbromid aus Toluol mit N-Bromsuccinimid])[
  #reaktion(
    $ "C" _6"H" _5"CH" _3 + "NBS" $,
    [#text(size: 6.5pt)[AIBN, CCl#sub[4], Rückfluß]],
    $ "C" _6"H" _5"CH" _2"Br" + "Succinimid" $,
  )

  #ansatz[
    46 g (53 mL; 0,50 mol) Toluol, 98 g (0,55 mol) N-Bromsuccinimid,
    0,5 g Azobisisobutyronitril, 300 mL Tetrachlormethan.
  ]

  In einem 1-l-Rundkolben mit Rückflußkühler werden Toluol, N-Bromsuccinimid,
  AIBN und Tetrachlormethan vorgelegt. Man erhitzt zum Rückfluß und hält die
  Reaktion in Gang, bis sich das Succinimid als Feststoff am Kolbenboden
  absetzt (1–2 h).

  Man kühlt ab, filtriert das Succinimid ab und wäscht den Rückstand mit wenig
  Tetrachlormethan. Das Filtrat wird eingeengt und im Vakuum fraktioniert.

  #ausbeute[72 g (84 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 198–199 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5751
  ]
]

#gefahr[N-Bromsuccinimid reizt Augen und Atemwege und kann Allergien auslösen;
  Tetrachlormethan ist krebserzeugend und ozonschädigend — nur im Abzug und in
  geschlossenen Gefäßen arbeiten. AIBN zerfällt oberhalb 70 °C und ist
  explosionsgefährlich, wenn es trocken erhitzt wird.]

*Vergleich der Verfahren.* Die Bromierung mit elementarem Brom ist billiger,
aber weniger selektiv und erzeugt Bromwasserstoff, der die Reaktion hemmt. NBS
ist teurer, aber schonender und für empfindliche Substrate die Methode der Wahl.
Wer Toluol in größerer Menge umsetzt, wählt Brom; wer eine empfindliche
Verbindung bromiert, wählt NBS.

*Nicht nur benzylich.* Dieselbe Wohl-Ziegler-Bromierung erfaßt auch
allylische Positionen; das Succinimid fällt dabei als Feststoff aus und
treibt die Reaktion. Die folgende Vorschrift bromiert Cyclohexen in
Stellung 3 — die Doppelbindung bleibt erhalten.

#vorschrift("D.1.6", [3-Bromcyclohexen aus Cyclohexen])[
  #reaktion(
    $ "C" _6"H" _10 + "C" _4"H" _4"BrNO" _2 $,
    [#text(size: 6.5pt)[AIBN, 1,2-Dichlorethan, 83 °C]],
    $ "C" _6"H" _9"Br" + "C" _4"H" _5"NO" _2 $,
  )

  #ansatz[
    20,5 g (25 mL; 0,25 mol) Cyclohexen, 44,5 g (0,25 mol)
    N-Bromsuccinimid, 0,5 g AIBN, 100 mL 1,2-Dichlorethan.
  ]

  In einem 250-mL-Rundkolben mit Rückflußkühler und Magnetrührer wird das
  Cyclohexen mit N-Bromsuccinimid und dem Initiator in 100 mL
  1,2-Dichlorethan versetzt und 1,5 h zum Sieden erhitzt. Das Succinimid
  scheidet sich dabei als weißer Niederschlag ab; gegen Ende der Reaktion
  beginnt es wieder zu lösen, wenn das N-Bromsuccinimid verbraucht ist.

  Man saugt das Succinimid ab, wäscht den Rückstand mit 2 × 10 mL
  1,2-Dichlorethan und engt das Filtrat am Rotationsverdampfer ein. Der
  Rückstand wird im Vakuum destilliert.

  #ausbeute[22 g (55 % d. Th.) farblose, tränenreizende Flüssigkeit.]

  #kenndaten[
    Sdp. 55–58 °C (12 hPa) #h(2em) $n_D^20$ = 1,5340 #h(2em)
    $rho_20$ = 1,39 g·cm#super[−3] #h(2em) $M$ = 161,0 g·mol#super[−1]
  ]
]

#gefahr[N-Bromsuccinimid reizt Haut und Schleimhäute; 1,2-Dichlorethan ist
  krebserzeugend und wassergefährdend — nur im Abzug, mit Handschuhen, und
  getrennt sammeln. AIBN ist explosionsgefährlich, wenn es trocken erhitzt
  wird. 3-Bromcyclohexen ist alkylierend und tränenreizend; nicht einatmen,
  nicht mit der Haut in Berührung bringen.]

=== Radikalische Addition und Polymerisation

Radikale addieren an Doppelbindungen; die Reaktion ist die Grundlage der
Polymerisation und der technischen Kautschukherstellung.

*Anti-Markownikoff-Addition von HBr* wurde in D.4.3 behandelt.

*Polymerisation.* Styrol, Methylmethacrylat und Vinylchlorid polymerisieren
radikalisch; der Initiator zerfällt in Radikale, die an die Doppelbindung
addieren und eine Kette aufbauen. Die Reaktion wird durch Sauerstoff gehemmt
und durch Wärme beschleunigt.

$ n "CH" _2"=CHPh" ->^("AIBN") "[–CH" _2"–CHPh–]" _n $

Die Kettenlänge hängt von der Initiatorkonzentration ab: viel Initiator gibt
kurze Ketten (spröde, niedrigviskos), wenig Initiator lange Ketten (zäh,
mechanisch belastbar). Für die Präparative gilt: Der Inhibitor muß entfernt
werden, sonst dauert die Reaktion stundenlang unter Induktionszeit — die
üblichen Handelsqualitäten enthalten 10–50 ppm 4-*tert*-Butylbrenzcatechin.

#vorschrift("D.1.4", [Polystyrol aus Styrol])[
  #reaktion(
    $ n "CH" _2"=CHC" _6"H" _5 $,
    [#text(size: 6.5pt)[AIBN, 65 °C]],
    $ "[–CH" _2"–CH(C" _6"H" _5")–]" _n $,
  )

  #ansatz[
    20 g (21 mL; 0,19 mol) Styrol, 0,1 g (0,5 mmol) Azobis(isobutyronitril).
  ]

  Das Styrol wird zweimal mit 10 %iger Natronlauge ausgeschüttelt (Inhibitor
  entfernen), zweimal mit Wasser gewaschen und über Natriumsulfat getrocknet;
  die klare Flüssigkeit wird über ein Wattebausch in ein Reagenzglas
  umgefüllt.

  Man löst das AIBN im Styrol, verschließt das Glas nur locker (Watte oder
  loses Stopfendeckel — kein Druckgefäß!) und stellt es 2 h in ein Wasserbad
  von 65 °C, danach 1 h auf 80 °C. Dabei steigt die Viskosität sichtbar.

  Man kühlt langsam auf Raumtemperatur ab. Das Glas enthält einen klaren,
  glasigen Stab, der sich aus der Form heben läßt, wenn man das Glas kurz in
  heißes Wasser taucht.

  #ausbeute[18–19 g (90–95 % d. Th.) farbloses Polystyrol in Stabform.]

  #kenndaten[
    Glasübergangspunkt $T_g$ ≈ 100 °C #h(2em) löslich in Toluol, THF,
    Chloroform #h(2em) Dichte 1,05 g·cm#super[−3]
  ]
]

#gefahr[Styrol ist gesundheitsschädlich, entzündbar und reizt die Augen; es
  polymerisiert bei Erwärmung ohne Inhibitor spontan unter Wärmeentwicklung —
  nie in geschlossenen Gefäßen erhitzen. AIBN ist gesundheitsschädlich und
  zersetzt sich oberhalb von 100 °C heftig; nur in kleinen Mengen abwiegen
  und nicht überhitzen. Das Polymerisationsglas wird locker verschlossen: Der
  Druck des Stickstoffs aus dem Initiator muß entweichen können.]

*Anti-Markownikoff-Addition von Bromwasserstoff.* Radikale addieren an
Doppelbindungen nach dem Anti-Markownikoff-Prinzip: Das Bromradikal greift
das endständige Kohlenstoffatom an, weil dabei das stabilere sekundäre
Radikal entsteht. Mit Peroxid als Starter weicht das Produkt völlig von der
elektrophilen Addition ab (die in D.4.3 behandelt wird).

#vorschrift("D.1.7", [1-Bromoctan aus 1-Octen])[
  #reaktion(
    $ "C" _8"H" _16 + "HBr" $,
    [#text(size: 6.5pt)[Peroxid, 0–20 °C]],
    $ "C" _8"H" _17"Br" $,
  )

  #ansatz[
    28 g (35 mL; 0,25 mol) 1-Octen, 0,5 g Dibenzoylperoxid (feucht),
    24 g (0,30 mol) Bromwasserstoff.
  ]

  In einem 250-mL-Dreihalskolben mit Gasleitrohr, Thermometer und
  Magnetrührer wird das 1-Octen mit dem Peroxid versetzt und auf 0 °C
  gekühlt. Man leitet trockenes Bromwasserstoffgas (aus einer Stahlflasche
  oder aus Eisessig durch Erwärmen freigesetzt) langsam ein, wobei die
  Temperatur unter 20 °C bleiben muß. Nach Aufnahme der berechneten Menge
  läßt man auf Raumtemperatur erwärmen und rührt noch 30 min nach.

  Die wäbrige Phase wird abgetrennt, die organische Phase zweimal mit je
  20 mL Wasser gewaschen, über Natriumsulfat getrocknet und im Vakuum
  destilliert.

  #ausbeute[38 g (79 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 201–203 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4527 #h(2em)
    $rho_20$ = 1,11 g·cm#super[−3] #h(2em) $M$ = 193,1 g·mol#super[−1]
  ]
]

#gefahr[Bromwasserstoff ist ätzend und muß vollständig abgebunden werden;
  das Gas nicht einatmen, Apparatur nur im Abzug. Peroxide sind
  explosionsgefährlich — Dibenzoylperoxid feucht wägen, niemals trocken
  erhitzen. 1-Bromoctan ist alkylierend; Hautkontakt vermeiden.]

*Ohne Peroxid verläuft dieselbe Addition nach Markownikoff* (Abschnitt
D.4.3) und liefert 2-Bromoctan. Wer das Produkt vergleichen will, führt
beide Ansätze nebeneinander durch und prüft die Siedepunkte.

=== Autoxidation und Peroxide

Sauerstoff addiert an Radikale unter Bildung von Peroxiden. Diese Autoxidation
ist die Ursache für das Verderben von Ethern, Fetten und Terpenen; technisch wird
sie gezielt genutzt (Trocknungsöle, Alkydharze).

$ "R–H" ->^("O"_2) "R–OO" dot -> "R–OOH" $

*Konsequenz für die Praxis.* Ether werden über Kaliumhydroxid und unter
Lichtausschluß aufbewahrt; vor der Destillation wird auf Peroxide geprüft. Ein
Peroxidgehalt über 100 ppm macht den Ether unbrauchbar, weil beim Einengen eine
Explosion möglich ist.

*Peroxide aus Säurechloriden.* Gezielt hergestellte Peroxide entstehen aus
Säurechloriden und Wasserstoffperoxid in alkalischem Medium (Perhydrolyse).
Dibenzoylperoxid ist der gebräuchlichste Radikalinitiator für Polymerisationen
und radikalische Substitutionen — die Verbindung, die den Kreis zu AIBN
(D.1.4) und zur Autoxidation schließt.

#vorschrift("D.1.5", [Dibenzoylperoxid aus Benzoylchlorid])[
  #reaktion(
    $ 2 "C" _6"H" _5"COCl" + "H" _2"O" _2 + 2 "NaOH" $,
    [#text(size: 6.5pt)[5–10 °C]],
    $ "C" _6"H" _5"CO–O–O–COC" _6"H" _5 + 2 "NaCl" + 2 "H" _2"O" $,
  )

  #ansatz[
    14 g (12 mL; 0,1 mol) Benzoylchlorid, 5,7 g (0,055 mol H#sub[2]O#sub[2])
    30-prozentige Wasserstoffperoxidlösung, 4 g (0,1 mol) Natriumhydroxid in
    20 mL Wasser.
  ]

  In einem 250-mL-Erlenmeyerkolben werden Natronlauge und Wasserstoffperoxid
  vorgelegt und im Eisbad auf 5 °C gekühlt. Unter Schütteln tropft man das
  Benzoylchlorid zu und hält die Temperatur unter 10 °C; bald fällt das
  Peroxid als weißer Niederschlag aus.

  Man rührt 30 min im Eisbad nach, saugt ab und wäscht gründlich mit kaltem
  Wasser, bis das Waschwasser chloridfrei ist. Das Produkt wird an der Luft
  getrocknet und unter Wasser oder feucht im Dunkeln aufbewahrt.

  #ausbeute[10 g (85 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 103–105 °C (unter Zersetzung) #h(2em) unlöslich in Wasser,
    löslich in Chloroform, Ether #h(2em) $M$ = 242,2 g·mol#super[−1]
  ]
]

#gefahr[Trockenes Dibenzoylperoxid ist explosionsfähig und stoßempfindlich.
  Das Produkt wird niemals getrocknet, erhitzt, gerieben oder in größerer
  Menge aufbewahrt; es bleibt feucht und wird unter Wasser im Dunkeln
  gelagert. Handelsübliches Peroxid ist mit Wasser stabilisiert — im Zweifel
  käufliches Material verwenden statt eigenen. Benzoylchlorid ist ätzend und
  tränenreizend; die Reaktion wird nur im Abzug und in kleinen Ansätzen
  durchgeführt.]

=== Störungen und ihre Ursachen

#figure(
  table(
    columns: (1.3fr, 1.3fr, 1.2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Störung*], [*Ursache*], [*Abhilfe*]),
    [Succinimid fällt nicht aus], [zu wenig NBS, feuchtes Lösungsmittel], [NBS nachwiegen, Lösungsmittel trocknen],
    [Braunfärbung der Reaktionsmischung], [Bromüberschuß, Zersetzung], [mit Thiosulfat waschen, Kühlen],
    [Niedrige Ausbeute bei der NBS-Bromierung], [Licht abgeschaltet, Initiator zu alt], [Licht zulassen, frisches AIBN],
    [Polymerisation statt Addition], [Peroxid vergessen, zu hohe Temperatur], [Peroxid prüfen, auf 0 °C kühlen],
    [Druckanstieg in der Apparatur], [Gaszufluß zu schnell, verstopfte Leitung], [Zufluß drosseln, Leitung spülen],
    [Explosion bei Peroxid-Arbeiten], [Trockenerhitzung, Reibung], [feucht wägen, kleine Mengen, Abzug],
  ),
  caption: [Typische Störungen bei radikalischen Substitutionen und
    Additionen — und was man dagegen tut.],
) <tab:stoerungen-radikal>

=== Aufgaben

- Berechnen Sie das Produktverhältnis der Chlorierung von Propan bei 25 °C
  (relative Reaktivitäten 1 : 3,8).
- Warum liefert die Bromierung von Toluol mit Brom in Gegenwart von FeBr#sub[3]
  ein anderes Produkt als die Belichtung ohne Katalysator?
- Erklären Sie, weshalb NBS für die Bromierung von Allylpositionen geeignet ist,
  elementares Brom aber nicht.
- Warum muß der Inhibitor des Styrols vor der Polymerisation entfernt werden,
  obwohl er die Reaktion nur verzögert?
- Ein Ansatz mit viel AIBN liefert ein sprödes Polymer, einer mit wenig AIBN
  ein zähes. Erklären Sie den Zusammenhang.
- Das Reagenzglas wird bei der Polymerisation nur locker verschlossen. Was
  passierte bei einem festen Verschluß?
- Warum entsteht bei der Perhydrolyse von Benzoylchlorid kein Peroxid, wenn
  man ohne Natronlauge arbeitet?
- Dibenzoylperoxid wird unter Wasser gelagert, AIBN nicht. Begründen Sie den
  Unterschied.
- Ein Initiator für die Polymerisation von Styrol soll gewechselt werden.
  Vergleichen Sie Dibenzoylperoxid und AIBN hinsichtlich Handhabung und
  Zersetzungstemperatur.
- Berechnen Sie die Produktverhältnisse der Chlorierung und Bromierung von
  Propan bei 25 °C (primär : sekundär) und vergleichen Sie mit der
  Literatur.
- Warum liefert die radikalische HBr-Addition an 1-Octen
  Anti-Markownikoff-Produkt, die elektrophile Addition dagegen
  2-Bromoctan?
- Ein Ansatz zur NBS-Bromierung von Toluol wird im Dunkeln angesetzt; die
  Ausbeute ist schlecht. Erklären Sie, woran es liegt.
