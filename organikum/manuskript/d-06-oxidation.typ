// ============================================================================
//  D.6  Oxidation und Dehydrierung
// ============================================================================

#import "/vorlage/layout.typ": *

== Oxidation und Dehydrierung

Die Oxidation ist in der organischen Chemie keine einheitliche Reaktion, sondern
eine Familie: Abgabe von Wasserstoff, Aufnahme von Sauerstoff, Abgabe von
Elektronen. Präparativ entscheidend ist die Frage, an welcher Stelle die
Oxidation stehenbleibt — man arbeitet deshalb mit milden Reagenzien und
kontrollierten Bedingungen.

=== Oxidationsstufen und Auswahl des Reagenzes

Die Oxidationsstufe eines Kohlenstoffatoms ergibt sich aus der Zahl der
Bindungen zu Heteroatomen. Für die Praxis genügt die Reihe:

$ "R–CH" _3 -> "R–CH" _2"OH" -> "R–CHO" -> "R–COOH" -> "CO" _2 $

Jede Stufe verlangt ein anderes Reagenz, und jede Stufe läßt sich mit dem
falschen Reagenz überspringen. Die Auswahl folgt der Tabelle.

#figure(
  table(
    columns: (1.5fr, 1.5fr, 1.6fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Reagenz*], [*greift an*], [*Produkt*], [*Selektivität*]),
    [KMnO#sub[4], sauer], [Alkyl, Alkohol, Aldehyd], [Carbonsäure], [unspezifisch],
    [KMnO#sub[4], neutral, kalt], [Alken], [1,2-Diol], [hoch],
    [K#sub[2]Cr#sub[2]O#sub[7]/H#sub[2]SO#sub[4]], [Alkohol], [Keton, Säure], [mittel],
    [PCC, PDC], [primärer Alkohol], [Aldehyd], [hoch],
    [Dess-Martin-Periodinan], [primärer Alkohol], [Aldehyd], [sehr hoch],
    [Swern (DMSO/Oxalylchlorid)], [Alkohol], [Aldehyd/Keton], [hoch],
    [H#sub[2]O#sub[2]/NaOH], [Alken], [Epoxid, Diol], [mittel],
    [O#sub[2]/Cu], [Alkohol], [Aldehyd], [industriell],
    [NaOCl/TEMPO], [primärer Alkohol], [Aldehyd], [hoch],
  ),
  caption: [Oxidationsmittel und ihre Angriffspunkte. „Selektivität" meint die
    Fähigkeit, auf einer Stufe stehenzubleiben.],
) <tab:oxidationsmittel>

=== Oxidation von Alkoholen

*Primäre Alkohole* lassen sich stufenweise oxidieren: Zum Aldehyd mit
PCC, PDC, Dess-Martin oder TEMPO; zur Carbonsäure mit Permanganat oder
Dichromat. Der Unterschied ist praktisch: Ein Aldehyd, der in wäßriger,
saurer Lösung entsteht, wird sofort weiteroxidiert; in wasserfreiem
Dichlormethan bleibt er stehen.

*Sekundäre Alkohole* geben Ketone; eine Weiteroxidation ist nur unter
C–C-Spaltung möglich. *Tertiäre Alkohole* werden unter sauren Bedingungen
dehydratisiert, nicht oxidiert.

#vorschrift("D.6.1", [Cyclohexanon aus Cyclohexanol])[
  #reaktion(
    $ "C" _6"H" _11"OH" $,
    [#text(size: 6.5pt)[Na#sub[2]Cr#sub[2]O#sub[7]/H#sub[2]SO#sub[4], 30 °C]],
    $ "C" _6"H" _10"O" $,
  )

  #ansatz[
    100 g (104 mL; 1,0 mol) Cyclohexanol, 105 g (0,35 mol) Natriumdichromat,
    90 mL konzentrierte Schwefelsäure, 300 mL Wasser.
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Thermometer und Tropftrichter wird die
  Oxidationslösung aus Natriumdichromat, Wasser und Schwefelsäure bereitet.
  Man kühlt auf 20 °C und tropft das Cyclohexanol so zu, daß die Temperatur
  30 °C nicht übersteigt; die Reaktion ist stark exotherm und an der
  Farbänderung von orange nach grün erkennbar.

  Nach beendeter Zugabe rührt man 1 h bei Raumtemperatur, gibt 200 mL Wasser zu
  und trennt die organische Phase ab. Die wäßrige Phase wird zweimal mit je
  50 mL Ether extrahiert; die vereinigten organischen Phasen werden mit
  Natriumcarbonatlösung neutral gewaschen und über Magnesiumsulfat getrocknet.

  Nach dem Abdestillieren des Ethers wird das Cyclohexanon über eine
  Vigreux-Kolonne fraktioniert; die bei 154–156 °C übergehende Fraktion ist
  reines Produkt.

  #ausbeute[83 g (85 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 155 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4507 #h(2em)
    $rho_20$ = 0,947 g·cm#super[−3]
  ]
]

#gefahr[Natriumdichromat und Chrom(VI)-Verbindungen sind krebserzeugend,
  erbgutverändernd und stark ätzend; sie dürfen nicht in den Abfluß gelangen —
  Chromabfall getrennt sammeln. Schwefelsäure ist stark ätzend. Cyclohexanon
  reizt Augen und Atemwege und ist entzündbar.]

*Entsorgung von Chromabfall.* Die grüne Lösung enthält Chrom(III). Sie wird mit
Natronlauge gefällt, der Niederschlag abfiltriert und als Schwermetallabfall
entsorgt; das Filtrat ist nach Neutralisation abwasserfähig. Wer Chrom(VI)
unbehandelt in den Ausguß gibt, verstößt gegen die Abwasserverordnung.

=== Oxidation von Aldehyden und Ketonen

Aldehyde sind leicht oxidierbar; sie reduzieren Silbernitrat zu Silber
(Silberspiegel) und Fehling-Lösung zu Kupfer(I)-oxid. Diese Reaktionen sind
Nachweise, keine präparativen Methoden. Für die Darstellung von Carbonsäuren aus
Aldehyden genügt meist Luftsauerstoff in Gegenwart eines Katalysators.

*Ketonoxidation* erfordert C–C-Spaltung: Mit Salpetersäure entstehen zwei
Carbonsäuren (oder eine Säure und CO#sub[2]), mit Peroxycarbonsäuren
(Baeyer-Villiger) ein Ester. Die Baeyer-Villiger-Oxidation ist präparativ
wertvoll, weil sie regioselektiv verläuft: Die migrierende Gruppe ist diejenige,
die das stabilere Carbeniumion bilden kann (tertiär > sekundär > phenyl >
primär > methyl).

#figure(
  table(
    columns: (1.6fr, 1.4fr, 1.4fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Keton*], [*migrierende Gruppe*], [*Produkt*]),
    [Acetophenon], [Phenyl], [Phenylacetat],
    [Cyclohexanon], [CH#sub[2]], [Caprolacton],
    [2-Methylcyclohexanon], [CH#sub[2] mit mehr Substituenten], [substituiertes Lacton],
    [Benzophenon], [Phenyl], [Phenylbenzoat],
    [Methylisopropylketon], [Isopropyl], [Isopropylester der Essigsäure],
  ),
  caption: [Regioselektivität der Baeyer-Villiger-Oxidation. Die migrierende
    Gruppe bestimmt das Produkt.],
) <tab:baeyer-villiger>

#vorschrift("D.6.3", [Benzaldehyd aus Benzylalkohol mit PCC])[
  #reaktion(
    $ "C" _6"H" _5"CH" _2"OH" $,
    [#text(size: 6.5pt)[PCC, CH#sub[2]Cl#sub[2], 25 °C]],
    $ "C" _6"H" _5"CHO" $,
  )

  #ansatz[
    108 g (103 mL; 1,0 mol) Benzylalkohol, 237 g (1,1 mol)
    Pyridiniumchlorochromat, 1 L Dichlormethan.
  ]

  In einem 2-l-Dreihalskolben mit Rührer und Thermometer legt man 600 mL
  Dichlormethan vor und trägt das PCC in Anteilen ein; es entsteht eine
  braunschwarze Suspension. Man tropft den Benzylalkohol in 100 mL
  Dichlormethan so zu, daß die Temperatur 30 °C nicht übersteigt.

  Nach beendeter Zugabe rührt man 3 h bei Raumtemperatur, bis die
  Dünnschichtchromatographie keinen Alkohol mehr zeigt. Man versetzt mit 500 mL
  Ether, filtriert über Kieselgel und wäscht den Rückstand mit Ether
  nach.

  Die vereinigten Filtrate werden mit Natriumhydroxidlösung gewaschen, über
  Magnesiumsulfat getrocknet und fraktioniert. Benzaldehyd geht bei 178–180 °C
  über; die Ausbeute wird durch Destillation unter Stickstoff verbessert.

  #ausbeute[85 g (80 % d. Th.) farblose, bittermandelartig riechende
  Flüssigkeit.]

  #kenndaten[
    Sdp. 179 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5450 #h(2em)
    $rho_20$ = 1,045 g·cm#super[−3]
  ]
]

#gefahr[Pyridiniumchlorochromat ist gesundheitsschädlich, stark oxidierend und
  steht im Verdacht, krebserzeugend zu sein; es ist mit brennbaren Stoffen
  explosionsgefährlich. Dichlormethan ist gesundheitsschädlich und narkotisierend;
  nur im Abzug arbeiten. Benzaldehyd ist entzündbar und kann Allergien auslösen.]

=== Dehydrierung

Die Dehydrierung entfernt Wasserstoff ohne Sauerstoff. Sie ist die Umkehr der
Hydrierung und wird durch Katalyse (Pt, Pd, Ni) oder durch Chinone erreicht.

*Dehydrierung von Alkoholen und Cyclohexanderivaten.* Cyclohexan gibt bei 300 °C
an Platin Benzol; Cyclohexanol gibt an Kupfer bei 250 °C Cyclohexanon. Beide
Reaktionen sind industriell, im Praktikum nur als Demonstration.

*Dehydrierung von Aromaten-Vorstufen.* Sechsgliedrige Ringe mit einer
Doppelbindung lagern sich in Gegenwart von Palladium in Aromaten um: Aus
1,3-Cyclohexadien entsteht Benzol, aus Tetralin Naphthalin.

*Dehydrierung mit Chinonen.* 2,3-Dichlor-5,6-dicyan-1,4-benzochinon (DDQ) und
Tetrachlor-1,4-benzochinon (Chloranil) abstrahieren Hydrid und Proton. Sie werden
für die Aromatisierung von Dihydroverbindungen und für die Oxidation von
Alkoholen zu Ketonen eingesetzt.

$ "Dihydroverbindung" + "DDQ" -> "Aromat" + "DDQH" _2 $

=== Oxidation von Alkenen und Aromaten

*Epoxidierung* mit Peroxycarbonsäuren wurde in D.4 behandelt; hier interessiert
die Spaltung. Epoxide lassen sich sauer zu 1,2-Diolen hydrolysieren, mit
Lithiumaluminiumhydrid zu Alkoholen reduzieren und mit Nucleophilen regioselektiv
öffnen: Im Sauren greift das Nucleophil am höher substituierten Kohlenstoff an
(Carbeniumion), im Basischen am weniger gehinderten.

*Ozonolyse.* Ozon spaltet Doppelbindungen zu Carbonylverbindungen. Die
reduktive Aufarbeitung (Zink/Essigsäure oder Dimethylsulfid) liefert Aldehyde
und Ketone, die oxidative (Wasserstoffperoxid) Carbonsäuren. Die Ozonolyse ist
die zuverlässigste Methode zur Lagebestimmung einer Doppelbindung.

$ "RCH=CHR'" ->[(1) "O" _3, (2) "Zn/H"^"+"] "RCHO" + "R'CHO" $

*Oxidation von Aromaten.* Benzol wird mit Sauerstoff an Vanadiumpentoxid zu
Maleinsäureanhydrid oxidiert; Naphthalin mit Chromsäure zu Phthalsäureanhydrid;
Anthracen zu Anthrachinon. Die Reaktionen laufen über Ringöffnung oder über
chinoiden Zwischenstufen.

#vorschrift("D.6.2", [Phthalsäureanhydrid aus Naphthalin])[
  #reaktion(
    $ "C" _10"H" _8 $,
    [#text(size: 6.5pt)[V#sub[2]O#sub[5], 350 °C, O#sub[2]]],
    $ "C" _8"H" _4"O" _3 $,
  )

  #ansatz[
    128 g (1,0 mol) Naphthalin, 5 g Vanadiumpentoxid auf Kieselgel (Katalysator),
    2 L Luft pro Minute.
  ]

  In einem beheizten Rohrreaktor aus Hartglas (oder einem Quarzrohr mit
  Temperaturregelung) wird der Katalysator auf 350 °C erhitzt. Man leitet ein
  Gemisch aus Naphthalindampf und Luft (2 L/min) durch das Rohr; das Naphthalin
  wird in einem Verdampfer bei 120 °C vorgelegt.

  Das Produkt sublimiert aus dem Reaktor und wird in einer gekühlten Vorlage
  aufgefangen. Das Rohprodukt wird aus Essigsäureanhydrid umkristallisiert oder
  im Vakuum sublimiert.

  #ausbeute[89 g (60 % d. Th.) farblose Nadeln.]

  #kenndaten[
    Schmp. 131 °C #h(2em) Sdp. 284 °C
  ]
]

#gefahr[Naphthalin ist gesundheitsschädlich und für Wasserorganismen giftig;
  Dämpfe nicht einatmen. Phthalsäureanhydrid reizt Atemwege und Augen stark und
  kann Asthma auslösen; Staub vermeiden, im Abzug arbeiten. Vanadiumpentoxid
  ist giftig und steht im Verdacht, krebserzeugend zu sein.]

=== Nachweisreaktionen und ihre Grenzen

Für die Prüfung, ob eine Oxidation vollständig verlaufen ist, genügen einfache
Nachweise:

- *Permanganat*: bleibende Violettfärbung zeigt vollständigen Verbrauch des
  Oxidationsmittels an.
- *Dichromat*: Farbumschlag orange → grün zeigt die Reduktion zu Chrom(III).
- *Tollens-Reagenz*: Silberspiegel bei Aldehyden, nicht bei Ketonen.
- *Fehling-Lösung*: rotes Kupfer(I)-oxid nur bei Aldehyden und α-Hydroxyketonen.

Die Nachweise ersetzen keine Analyse. Ein „negativer" Silberspiegel kann an
Verunreinigungen liegen; für die Identifikation ist der Schmelzpunkt des
Derivats oder ein Spektrum erforderlich.

=== Aufgaben

- Warum oxidiert Kaliumpermanganat Toluol zur Benzoesäure, tert-Butylbenzol
  dagegen nicht? Geben Sie den Mechanismus des ersten Schritts an.
- Ein primärer Alkohol soll zum Aldehyd oxidiert werden. Welche drei Reagenzien
  sind geeignet, welche nicht, und warum?
- Formulieren Sie die Ozonolyse von 2-Methylbut-2-en mit reduktiver und mit
  oxidativer Aufarbeitung.
