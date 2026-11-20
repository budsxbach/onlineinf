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

#vorschrift("D.6.2", [Benzaldehyd aus Benzylalkohol mit PCC])[
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

*Milde Hydroxylierung.* Verdünntes Kaliumpermanganat oxydiert Alkene bei
niedriger Temperatur zu *cis*-1,2-Diolen; die Syn-Addition läuft über einen
cyclischen Mangat-Ester. Entscheidend sind Temperatur und Konzentration: Bei
mehr als 15 °C oder hohen Konzentrationen spaltet sich die Doppelbindung
stattdessen — der Weg zu Adipinsäure (D.6.4) und der Grund, weshalb der
Baeyer-Nachweis nur für qualitative Zwecke taugt.

#vorschrift("D.6.5", [cis-1,2-Cyclohexandiol aus Cyclohexen])[
  #reaktion(
    $ "C" _6"H" _10 + "KMnO" _4 + "H" _2"O" $,
    [#text(size: 6.5pt)[0–10 °C, neutral]],
    $ "cis-1,2-C" _6"H" _10"(OH)" _2 + "MnO" _2 + "KOH" $,
  )

  #ansatz[
    8,2 g (10 mL; 0,1 mol) Cyclohexen, 16 g (0,1 mol) Kaliumpermanganat,
    300 mL Wasser.
  ]

  In einem 500-mL-Dreihalskolben mit Rührer, Tropftrichter und Thermometer
  werden 300 mL Wasser mit dem Permanganat versetzt und im Eis-Salz-Bad auf
  5 °C gekühlt. Unter kräftigem Rühren tropft man das Cyclohexen so zu, daß
  die Temperatur 10 °C nicht überschreitet (exotherm!); dabei entfärbt sich
  die Lösung unter Braunfärbung.

  Nach beendeter Zugabe rührt man 1 h bei Raumtemperatur nach. Der
  Braunstein-Niederschlag wird über eine Faltenfilternutsche abgesaugt und
  zweimal mit heißem Wasser nachgewaschen. Das Filtrat wird am Rotations-
  verdampfer auf ein Volumen von etwa 50 mL eingeengt, mit Natriumchlorid
  gesättigt und viermal mit je 30 mL Essigsäureethylester extrahiert.

  Die vereinigten Extrakte werden über Natriumsulfat getrocknet und eingeengt;
  der Rückstand wird aus Ethylacetat umkristallisiert.

  #ausbeute[7,0 g (60 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 98 °C #h(2em) cis-Isomer #h(2em)
    löslich in Wasser und Ethanol, unlöslich in Petrolether
  ]
]

#gefahr[Kaliumpermanganat ist stark oxidierend und brandfördernd; die Lösung
  färbt Haut und Textilien braun (mit verdünnter Ascorbinsäure oder
  Natriumbisulfit reduzieren). Der Braunsteinschlamm enthält Permanganatreste
  und wird gesammelt entsorgt, nicht in den Abfluss. Beim Zutropfen des
  Cyclohexens strenge Temperaturkontrolle halten — oberhalb von 15 °C setzt
  die Ringöffnung ein. Cyclohexen ist leicht entzündbar.]

*Oxidation von Aromaten.* Benzol wird mit Sauerstoff an Vanadiumpentoxid zu
Maleinsäureanhydrid oxidiert; Naphthalin mit Chromsäure zu Phthalsäureanhydrid;
Anthracen zu Anthrachinon. Die Reaktionen laufen über Ringöffnung oder über
chinoiden Zwischenstufen.

#vorschrift("D.6.3", [Phthalsäureanhydrid aus Naphthalin])[
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

#vorschrift("D.6.4", [Adipinsäure aus Cyclohexanol])[
  #reaktion(
    $ "C" _6"H" _11"OH" $,
    [#text(size: 6.5pt)[HNO#sub[3] (65 %), V#sub[2]O#sub[5], 80 °C]],
    $ "HOOC–(CH" _2")" _4"–COOH" $,
  )

  #ansatz[
    100 g (1,0 mol) Cyclohexanol, 500 g (7,7 mol) Salpetersäure (65 %),
    1 g Ammoniumvanadat.
  ]

  In einem 2-l-Dreihalskolben mit Rührer, Thermometer, Tropftrichter und
  absteigender Destillation werden 400 mL Salpetersäure vorgelegt, mit
  Ammoniumvanadat versetzt und auf 60 °C erwärmt.

  Man tropft das Cyclohexanol so zu, daß die Temperatur 80 °C nicht übersteigt;
  die Reaktion ist stark exotherm und setzt nitrose Gase frei. Nach beendeter
  Zugabe erhitzt man 1 h auf 90 °C und destilliert dabei das Wasser teilweise ab.

  Man kühlt auf 10 °C, saugt die ausgeschiedene Adipinsäure ab, wäscht mit
  eiskaltem Wasser und trocknet. Zur Reinigung wird aus Wasser umkristallisiert
  (1 g in 8 mL).

  #ausbeute[112 g (77 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 152 °C #h(2em) Sdp. 337 °C (Zers.) #h(2em)
    Säuregehalt > 99 %
  ]
]

#gefahr[Salpetersäure ist stark ätzend und stark oxidierend; bei der Reaktion
  entstehen nitrose Gase (NO#sub[x]), die zu Lungenödem führen können — nur im
  Abzug und mit Gaswaschflasche arbeiten. Cyclohexanol ist gesundheitsschädlich
  und entzündbar. Die Reaktion kann durchgehen; Kühlung und langsame Zugabe sind
  Pflicht. Nitrose Gase niemals in die Raumluft leiten.]

*Ringöffnung.* Die Oxidation von Cyclohexanol führt über Cyclohexanon und
Cyclohexenon; die Doppelbindung wird oxidativ gespalten, und beide Enden werden
zum Carboxyl oxidiert. Salpetersäure ist das klassische Reagenz; heute wird
industriell mit Luft und Cobalt-Katalysator gearbeitet. Adipinsäure ist die
Ausgangsverbindung für Nylon-6,6.

*Seitenkettenoxidation.* Für aromatische Carbonsäuren ist die Oxidation der
Seitenkette der Standardweg (Vorschrift D.5.4). Voraussetzung ist ein
benzylischer Wasserstoff: Toluol, Ethylbenzol und Isopropylbenzol werden
oxidiert, tert-Butylbenzol nicht. Die Kette wird dabei bis zum Carboxyl
abgebaut, unabhängig von ihrer Länge — aus Ethylbenzol entsteht ebenfalls
Benzoesäure.

*Milder: Wasserstoffperoxid und Natriumhypochlorit.* Für empfindliche Substrate
ersetzt man Permanganat durch Natriumhypochlorit (NaOCl) mit einem
Phasentransfer-Katalysator oder durch Wasserstoffperoxid mit Natriumwolframat.
Beide arbeiten bei 60–80 °C und hinterlassen keinen Braunstein.

*Kinetik der Seitenkettenoxidation.* Der geschwindigkeitsbestimmende Schritt ist
die Wasserstoffabstraktion am benzylischen Kohlenstoff; die Reaktion folgt
einem Radikalmechanismus mit Kettenfortpflanzung. Daraus folgt die
Selektivität: Ein Benzylwasserstoff wird 30-mal schneller abstrahiert als ein
tertiärer aliphatischer. Elektronenziehende Substituenten am Ring beschleunigen
die Reaktion, weil sie das gebildete Benzylradikal stabilisieren — der
Hammett-Exponent ist positiv.

*Spaltung von Doppelbindungen: die Ozonolyse.* Ozon addiert sich in
einer 1,3-dipolaren Cycloaddition zum Molozonid, das zum Ozonid
umlagert. Die reduktive Aufarbeitung mit Zink/Essigsäure liefert Aldehyde —
oxidative Bedingungen würden die Carbonsäuren ergeben. Die Ozonolyse ist die
reinste Methode, um Doppelbindungen präparativ zu öffnen.

#vorschrift("D.6.6", [Heptanal aus 1-Octen])[
  #reaktion(
    $ "C" _8"H" _16 $,
    [#text(size: 6.5pt)[1) O#sub[3], MeOH, −78 °C 2) Zn, Essigsäure]],
    $ "C" _7"H" _14"O" + "HCHO" $,
  )

  #ansatz[
    28 g (35 mL; 0,25 mol) 1-Octen, 150 mL Methanol, 0,30 mol Ozon,
    30 g Zinkstaub, 40 mL Eisessig.
  ]

  In einem 500-mL-Dreihalskolben mit Gaseinleitung, Thermometer und
  Rührer löst man das 1-Octen in 150 mL Methanol und kühlt auf −78 °C
  (Aceton/Trockeneis). Man leitet Ozon aus einem Generator (2–5 % in
  Sauerstoff) ein, bis die Lösung eine bleibende Blaufärbung zeigt.

  Anschließend läßt man auf 0 °C erwärmen, gibt 30 g Zinkstaub und 40 mL
  Eisessig zu und rührt 1 h bei Raumtemperatur. Man filtriert den
  Zinkrückstand ab, wäscht mit Methanol nach und engt das Filtrat am
  Rotationsverdampfer ein. Der Rückstand wird im Vakuum destilliert.

  #ausbeute[18 g (65 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 153 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4113 #h(2em)
    $rho_20$ = 0,82 g·cm#super[−3] #h(2em) $M$ = 114,2 g·mol#super[−1]
  ]
]

#gefahr[Ozon ist giftig und reizend; der Ozongenerator wird nur im Abzug
  betrieben, Abluft durch Aktivkohle oder Thiosulfat zerstört. Ozonide sind
  explosionsfähig — niemals zur Trockne einengen, immer reduktiv
  aufarbeiten. Methanol ist giftig und entzündbar, Zinkstaub kann
  pyrophor sein.]

*Oxidation von Aromatenseitenketten.* Mit Permanganat in alkalischer
Suspension lassen sich Alkylgruppen am Aromaten zur Carbonsäure
durchoxidieren; p-Xylol liefert dabei Terephthalsäure, die als Feststoff
ausfällt und leicht zu isolieren ist.

#vorschrift("D.6.7", [Terephthalsäure aus p-Xylol])[
  #reaktion(
    $ "C" _6"H" _4("CH"_3)_2 $,
    [#text(size: 6.5pt)[KMnO#sub[4], NaOH, 100 °C]],
    $ "C" _6"H" _4("COOH")_2 $,
  )

  #ansatz[
    27 g (0,25 mol) p-Xylol, 120 g (0,75 mol) Kaliumpermanganat,
    20 g Natriumhydroxid, 500 mL Wasser.
  ]

  In einem 1-L-Rundkolben mit Rückflußkühler suspendiert man das
  Kaliumpermanganat und Natriumhydroxid in 500 mL Wasser, gibt das p-Xylol
  zu und erhitzt 2 h zum Sieden. Die anfangs violette Lösung entfärbt sich
  unter Abscheidung von Braunstein.

  Man saugt heiß ab und wäscht den Rückstand mit 2 × 50 mL heißem Wasser.
  Das Filtrat wird mit konz. Salzsäure auf pH 1 gebracht; Terephthalsäure
  fällt als weißer Niederschlag aus. Man saugt ab, wäscht mit Wasser und
  trocknet bei 100 °C.

  #ausbeute[29 g (70 % d. Th.) weißes Pulver.]

  #kenndaten[
    Schmp. > 300 °C (Zersetzung) #h(2em) unlöslich in kaltem Wasser,
    löslich in Alkalihydroxid-Lösung #h(2em) $M$ = 166,1 g·mol#super[−1]
  ]
]

#gefahr[Kaliumpermanganat ist ein starkes Oxidationsmittel und färbt alles
  braun; Handschuhe tragen, Flecken mit Bisulfit entfernen. Die alkalische
  Suspension spritzt beim Erhitzen leicht über — Siedesteine verwenden.
  Konz. Salzsäure ätzend; nur im Abzug ansäuern.]

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

=== Störungen und ihre Ursachen

#figure(
  table(
    columns: (1.3fr, 1.3fr, 1.2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Störung*], [*Ursache*], [*Abhilfe*]),
    [Ozonolyse: niedrige Ausbeute], [Ozon entweicht, Leck in der Apparatur], [Dichtheit prüfen, Einleitrohr tief],
    [Permanganat: Filtration stockt], [Braunstein zu fein, zu viel organisches Material], [heiß absaugen, Celite-Zugabe],
    [PCC: braune Emulsion], [Wasser im Lösungsmittel, zu viel PCC], [DCM trocknen, 1,2 Äquivalente],
    [Cyclohexanon riecht nach Säure], [Überoxidation, Säurerest], [mit NaHCO#sub[3] neutral waschen],
    [Überhitzung bei der Ozonolyse], [zu schnelle Ozonzufuhr], [Bad kühlen, Zufuhr drosseln],
  ),
  caption: [Typische Störungen bei Oxidationen.],
) <tab:stoerungen-oxidation>

=== Aufgaben

- Warum oxidiert Kaliumpermanganat Toluol zur Benzoesäure, tert-Butylbenzol
  dagegen nicht? Geben Sie den Mechanismus des ersten Schritts an.
- Ein primärer Alkohol soll zum Aldehyd oxidiert werden. Welche drei Reagenzien
  sind geeignet, welche nicht, und warum?
- Formulieren Sie die Ozonolyse von 2-Methylbut-2-en mit reduktiver und mit
  oxidativer Aufarbeitung.
- Warum liefert die Oxidation von Ethylbenzol Benzoesäure und nicht
  Phenylessigsäure? Geben Sie die Zwischenstufen an.
- Ein Gemisch aus Toluol und 4-Nitrotoluol soll oxidiert werden. Welches Isomer
  reagiert schneller, und wie läßt sich das für eine Trennung nutzen?
- Berechnen Sie die Ausbeute, wenn aus 25 g Cyclohexanol 22 g Cyclohexanon
  erhalten werden. Ist der Wert plausibel?
- Nennen Sie zwei Oxidationsmittel, die selektiv einen primären Alkohol zum
  Aldehyd oxidieren, und zwei, die bis zur Carbonsäure oxidieren.
- Warum läuft die Permanganat-Oxidation von Cyclohexen bei 25 °C zu anderen
  Produkten als bei 5 °C? Formulieren Sie beide Wege.
- Das Ansatzprodukt der D.6.5 enthält *trans*-Cyclohexandiol-Verunreinigungen
  nicht. Woher wissen Sie das?
- Wie würden Sie prüfen, ob die Doppelbindung vollständig umgesetzt ist?
- Warum wird der Extrakt mit gesättigter Natriumchloridlösung behandelt?
- Vergleichen Sie die Ozonolyse von 1-Octen unter reduktiver und
  oxidativer Aufarbeitung. Welche Produkte entstehen jeweils?
- Warum entfällt bei der Permanganat-Oxidation von p-Xylol keine
  Stufenoxidation zum Aldehyd?
- Berechnen Sie den Permanganat-Verbrauch (in Mol) für 0,25 mol p-Xylol
  und begründen Sie den Überschuß.
