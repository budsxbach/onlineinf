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
