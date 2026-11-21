// ============================================================================
//  D.5  Substitutionen am aromatischen Kohlenstoff
// ============================================================================

#import "/vorlage/layout.typ": *

== Substitutionen am aromatischen Kohlenstoff

Am Aromaten wird nicht addiert, sondern substituiert: Das π-System stellt
Elektronen zur Verfügung, ohne seine Stabilität zu verlieren. Der Preis dafür ist
die hohe Aktivierungsenergie — die aromatische Substitution braucht ein starkes
Elektrophil, und sie wird durch Katalyse oder durch Substituenten am Ring
gesteuert.

=== Elektrophile aromatische Substitution (S#sub[E])

Der Mechanismus verläuft über einen σ-Komplex (Areniumion): Das Elektrophil
greift am Ring an, die Aromatizität geht vorübergehend verloren, ein Proton wird
abgespalten und die Aromatizität zurückgewonnen. Das Areniumion ist die
energetisch höchste Stelle des Weges und damit der Punkt, an dem Substituenten
wirken.

#figure(
  table(
    columns: (1.5fr, 1.7fr, 1.5fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Reaktion*], [*Elektrophil*], [*Bedingungen*], [*Bemerkung*]),
    [Nitrierung], [NO#sub[2]⁺], [HNO#sub[3]/H#sub[2]SO#sub[4], 0–50 °C], [Standardreaktion],
    [Sulfonierung], [SO#sub[3]], [H#sub[2]SO#sub[4] rauchend, 40 °C], [reversibel],
    [Halogenierung], [Br⁺, Cl⁺], [Halogen/FeX#sub[3]], [Katalysator nötig],
    [Friedel-Crafts-Alkylierung], [R⁺], [RX/AlCl#sub[3]], [Polyalkylierung],
    [Friedel-Crafts-Acylierung], [RCO⁺], [RCOCl/AlCl#sub[3]], [kein Überreagieren],
    [Formylierung], [HCO⁺-Äquivalent], [HCOCl/AlCl#sub[3]], [Gattermann-Koch],
    [Azokupplung], [Ar–N#sub[2]⁺], [Diazoniumsalz, 0 °C], [Farbstoffe],
  ),
  caption: [Elektrophile aromatische Substitutionen und ihre Elektrophile.],
) <tab:se-aromaten>

*Substituenteneffekte erster und zweiter Art.* Substituenten mit freiem
Elektronenpaar am Ring (OH, OR, NH#sub[2], NR#sub[2]) und Alkylgruppen
aktivieren und dirigieren *ortho/para*; Substituenten mit starker
Elektronenanziehung (NO#sub[2], CN, COOR, SO#sub[3]H, CF#sub[3]) desaktivieren und
dirigieren *meta*. Halogene sind ein Sonderfall: Sie desaktivieren (induktiv),
dirigieren aber *ortho/para* (mesomer).

#figure(
  table(
    columns: (1.3fr, auto, 1.4fr, 2.2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Substituent*], [*Effekt*], [*Dirigierung*], [*Reaktivität*]),
    [NH#sub[2], OH, OR], [+M, −I], [ortho/para], [stark aktivierend],
    [Alkyl, Ar], [+I, Hyperkonjugation], [ortho/para], [schwach aktivierend],
    [F, Cl, Br, I], [−I, +M], [ortho/para], [desaktivierend],
    [CHO, COR, COOR], [−M, −I], [meta], [desaktivierend],
    [NO#sub[2], CN], [−M, −I], [meta], [stark desaktivierend],
    [SO#sub[3]H, CF#sub[3]], [−I, −M], [meta], [stark desaktivierend],
    [N#sub[2]⁺], [−M], [meta], [sehr stark desaktivierend],
  ),
  caption: [Richtwirkung von Substituenten. Die Reihenfolge entspricht der Stärke
    des Effekts.],
) <tab:dirigierung>

*Mehrfachsubstitution.* Zwei Substituenten wirken zusammen: Der stärker
aktivierende gibt die Position vor; stehen zwei gleich starke in meta-Stellung,
greift das Elektrophil zwischen ihnen an. In der Praxis entstehen oft Gemische,
die destillativ oder chromatographisch getrennt werden müssen.

*Reversibilität und Thermodynamik.* Sulfonierung und Friedel-Crafts-Alkylierung
sind reversibel. Bei höherer Temperatur verschiebt sich das Produktverhältnis auf
das thermodynamisch stabilere Isomer; bei tiefer Temperatur entsteht das
kinetisch bevorzugte. Die Sulfonierung von Naphthalin bei 40 °C liefert
überwiegend die 1-Sulfonsäure, bei 160 °C die 2-Sulfonsäure.

#vorschrift("D.5.1", [Nitrobenzol aus Benzol])[
  #reaktion(
    $ "C" _6"H" _6 + "HNO" _3 $,
    [#text(size: 6.5pt)[H#sub[2]SO#sub[4], 50 °C]],
    $ "C" _6"H" _5"NO" _2 + "H" _2"O" $,
  )

  #ansatz[
    78 g (88 mL; 1,0 mol) Benzol, 130 g (73 mL; 2,0 mol) konzentrierte Salpetersäure
    (65 %), 200 g (110 mL) konzentrierte Schwefelsäure (98 %).
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Thermometer und Tropftrichter bereitet
  man aus Schwefelsäure und Salpetersäure das Nitriergemisch, indem man die
  Salpetersäure unter Kühlung in die Schwefelsäure einträgt. Man kühlt auf 20 °C
  und tropft das Benzol so zu, daß die Temperatur 35 °C nicht übersteigt.

  Nach beendeter Zugabe erwärmt man 1 h auf 50 °C, kühlt ab und gießt auf 500 g
  Eis. Das Nitrobenzol scheidet sich als schwere, gelbliche Phase ab. Man trennt
  sie ab, wäscht mit Wasser, dann mit verdünnter Natriumcarbonatlösung, bis die
  wäßrige Phase neutral reagiert.

  Das Rohprodukt wird mit Wasserdampf destilliert; Nitrobenzol geht mit Wasser
  über, während Dinitrobenzol und Sulfonsäuren zurückbleiben. Das Destillat wird
  getrennt, über Calciumchlorid getrocknet und im Vakuum fraktioniert.

  #ausbeute[111 g (90 % d. Th.) schwach gelbe, nach Bittermandeln riechende
  Flüssigkeit.]

  #kenndaten[
    Sdp. 210 °C (1013 hPa) #h(2em) Schmp. 5,7 °C #h(2em)
    $n_D^20$ = 1,5510 #h(2em) $rho_20$ = 1,204 g·cm#super[−3]
  ]
]

#gefahr[Salpetersäure und Schwefelsäure sind stark ätzend; das Nitriergemisch
wirkt stark oxidierend und kann organische Stoffe entzünden. Benzol ist
krebserzeugend (Kategorie 1A), entzündbar und gesundheitsschädlich — Arbeiten nur
im Abzug, mit Schutzbrille und geeigneten Handschuhen, Mengen klein halten.
Nitrobenzol ist giftig und wird über die Haut aufgenommen.]

*Nitrierung im Mikromaßstab.* Für die Prüfung der Reaktivität genügen 0,5 mL
Benzol und 2 mL Nitriergemisch in einem Reagenzglas mit Rückfluß. Die
Ausbeutebestimmung erfolgt gaschromatographisch; die Vorschrift dient dann dem
Nachweis, nicht der Darstellung.

#figure(
  table(
    columns: (1.2fr, auto, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verbindung*], [*Sdp./°C*], [*Schmp./°C*], [*$rho_20$*]),
    [Nitrobenzol], [210], [5,7], [1,204],
    [o-Nitrotoluol], [222], [−4], [1,163],
    [p-Nitrotoluol], [238], [52], [1,286],
    [m-Dinitrobenzol], [301], [90], [1,575],
    [2,4-Dinitrotoluol], [—], [70], [1,521],
    [Brombenzol], [156], [−31], [1,495],
    [Chlorbenzol], [132], [−45], [1,106],
    [Benzolsulfonsäure], [—], [44], [—],
  ),
  caption: [Kenndaten aromatischer Substitutionsprodukte. Die Schmelzpunkte
    eignen sich zur Identifizierung, die Siedepunkte zur Reinheitskontrolle.],
) <tab:aromaten-kenndaten>

#vorschrift("D.5.2", [p-Nitrotoluol aus Toluol])[
  #reaktion(
    $ "C" _6"H" _5"CH" _3 + "HNO" _3 $,
    [#text(size: 6.5pt)[H#sub[2]SO#sub[4], 40 °C]],
    $ "p-CH" _3"C" _6"H" _4"NO" _2 + "H" _2"O" $,
  )

  #ansatz[
    92 g (106 mL; 1,0 mol) Toluol, 90 g (1,4 mol) Salpetersäure (65 %),
    140 g (76 mL) konzentrierte Schwefelsäure.
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Thermometer und Tropftrichter wird das
  Nitriergemisch aus Schwefelsäure und Salpetersäure bei 20 °C bereitet. Man
  tropft Toluol so zu, daß die Temperatur 35 °C nicht übersteigt, und rührt
  anschließend 2 h bei 40 °C.

  Man gießt auf 500 g Eis, trennt die organische Phase ab, wäscht mit Wasser und
  Natriumhydrogencarbonatlösung und trocknet über Calciumchlorid.

  Das Rohprodukt (Gemisch aus ortho und para) wird durch fraktionierte
  Kristallisation getrennt: p-Nitrotoluol kristallisiert aus Ethanol bei
  −10 °C, o-Nitrotoluol bleibt in der Mutterlauge. Zur Reinigung wird zweimal
  aus Ethanol umkristallisiert.

  #ausbeute[52 g (38 % d. Th.) blaßgelbe Nadeln; daneben 30 % ortho-Isomer.]

  #kenndaten[
    Schmp. 52 °C #h(2em) Sdp. 238 °C #h(2em) $rho_20$ = 1,286 g·cm#super[−3]
  ]
]

#gefahr[Nitriergemisch ist stark ätzend und stark oxidierend; es kann organische
  Stoffe entzünden. Toluol ist gesundheitsschädlich und reproduktionstoxisch,
  Nitrotoluole sind giftig und werden über die Haut aufgenommen. Ausschließlich
  im Abzug arbeiten, Mengen unter 1 mol halten.]

*Isomerentrennung.* Die Nitrierung von Toluol liefert etwa 58 % ortho, 37 % para
und 5 % meta. Da sich die Siedepunkte kaum unterscheiden, wird über die
Schmelzpunkte getrennt: p-Nitrotoluol (52 °C) kristallisiert aus, o-Nitrotoluol
(−4 °C) bleibt flüssig. Wer die Ausbeute maximieren will, arbeitet mit
Lösungsmittelkristallisation statt mit Destillation.

*Sulfonierung.* Mit rauchender Schwefelsäure bringt man die
Sulfogruppe in den Ring; die Reaktion ist reversibel und eignet sich als
Schutzgruppe für die para-Stellung. Das Produkt fällt beim Eingießen in
Salzwasser als Natriumsalz aus.

#vorschrift("D.5.7", [Benzolsulfonsäure aus Benzol])[
  #reaktion(
    $ "C" _6"H" _6 + "SO" _3 $,
    [#text(size: 6.5pt)[rauchende H#sub[2]SO#sub[4], 25 °C]],
    $ "C" _6"H" _5"SO" _3"H" $,
  )

  #ansatz[
    78 g (100 mL; 1,0 mol) Benzol, 80 g rauchende Schwefelsäure
    (65 % SO#sub[3]).
  ]

  In einem 500-mL-Rundkolben mit Rührer und Eisbad tropft man die rauchende
  Schwefelsäure unter Rühren zum Benzol; die Temperatur steigt auf 25 °C.
  Man rührt 1 h bei Raumtemperatur nach und gießt die klare Lösung vorsichtig
  auf 300 g Eis. Die ausgefallene Benzolsulfonsäure wird mit 50 mL
  gesättigter Natriumchlorid-Lösung versetzt und abgesaugt.

  Zur Reinigung kristallisiert man aus verdünnter Salzsäure um.

  #ausbeute[130 g (82 % d. Th.) farblose Blättchen.]

  #kenndaten[
    Schmp. 50–51 °C #h(2em) sehr hygroskopisch, löslich in Wasser und Ethanol
    #h(2em) $M$ = 158,2 g·mol#super[−1]
  ]
]

#gefahr[Rauchende Schwefelsäure ist hochätzend und raucht; nur im Abzug
  tropfenweise dosieren, Schutzschleier und Handschuhe. Benzol ist
  krebserzeugend — Ersatzstoffe wie Toluol erwägen. Das Eingießen in Eis
  erfolgt langsam unter Rühren, damit nicht überschäumt.]

*Friedel-Crafts-Acylierung.* Aluminiumchlorid aktiviert das Säurechlorid
zu einem Acylium-Ion, das den Aromaten angreift. Wichtig: Im Gegensatz zur
Alkylierung läuft die Acylierung ohne Umlagerung ab und stoppt nach einer
Substitution, weil das Ketone die Aktivierung des Rings herabsetzt.

#vorschrift("D.5.8", [Acetophenon aus Benzol])[
  #reaktion(
    $ "C" _6"H" _6 + "CH"_3"COCl" $,
    [#text(size: 6.5pt)[AlCl#sub[3], 25 °C]],
    $ "C" _6"H" _5"COCH"_3 + "HCl" $,
  )

  #ansatz[
    78 g (100 mL; 1,0 mol) Benzol, 40 g (0,50 mol) Acetylchlorid,
    70 g (0,52 mol) Aluminiumchlorid.
  ]

  In einem 250-mL-Dreihalskolben mit Rückflußkühler, Tropftrichter und
  Gaseinleitung versetzt man das Benzol unter Rühren und Kühlen mit dem
  Aluminiumchlorid und tropft das Acetylchlorid so zu, daß die Temperatur
  25 °C nicht überschreitet. Das entweichende Chlorwasserstoff wird in eine
  Natronlauge-Falle geleitet. Man rührt 1 h bei Raumtemperatur nach.

  Das Reaktionsgemisch wird auf 200 g Eis mit 50 mL konz. Salzsäure
  gegossen, die organische Phase abgetrennt, zweimal mit Wasser gewaschen,
  mit Natriumhydrogencarbonat-Lösung neutralisiert und über Magnesiumsulfat
  getrocknet. Nach dem Abdestillieren des Benzols wird im Vakuum
  destilliert.

  #ausbeute[45 g (75 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 202 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5342 #h(2em)
    $rho_20$ = 1,03 g·cm#super[−3] #h(2em) $M$ = 120,2 g·mol#super[−1]
  ]
]

#gefahr[Aluminiumchlorid ist ätzend und raucht an feuchter Luft — schnell
  wägen, gut verschließen. Acetylchlorid ist ätzend und rauchend. Benzol ist
  krebserzeugend; der Aufbau steht im Abzug. Chlorwasserstoff nicht
  einatmen.]

=== Nucleophile aromatische Substitution

Ein Nucleophil greift einen Aromaten nur an, wenn die Elektronendichte niedrig
ist: durch Abgangsgruppen in *ortho*- oder *para*-Stellung zu einer
Elektronenanzug-Gruppe. Der Mechanismus verläuft über ein Meisenheimer-Addukt.

$ "Ar–Cl" + "Nu"^- -> "Ar–Nu" + "Cl"^- $

Präparativ wichtig ist die Variante mit aktivierten Halogenaromaten:
2,4-Dinitrochlorbenzol reagiert bei Raumtemperatur mit Aminen, Phenolen und
Alkoxiden; Chlorbenzol selbst braucht 300 °C und Druck.

*Umlagerung von Halogenaromaten.* Bei starker Base und tiefen Temperaturen
entsteht über ein Arin (Dehydrobenzol) ein Isomerengemisch: Aus Chlorbenzol mit
Kaliumamid entsteht Anilin, aber auch *ortho*- und *meta*-substituierte Produkte,
wenn ein Nucleophil anwesend ist. Für die Synthese ist das ein Nachteil, für den
Mechanismusbeweis ein Beweis.

*Von den Diazoniumsalzen aus.* Das Diazoniumsalz ist der Zugang zu allem, was
sich nicht direkt einführen läßt: Hydroxy, Halogenid, Cyanid, Azid, Wasserstoff.
Die Sandmeyer-Reaktion nutzt Kupfer(I)-Salze, die Schiemann-Reaktion
Tetrafluoroborat, die Hydrolyse einfach Wasser.

#figure(
  table(
    columns: (1.4fr, 1.6fr, 1.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Zielgruppe*], [*Reagenz*], [*Bedingungen*]),
    [–OH], [H#sub[2]O], [Erwärmen der sauren Lösung],
    [–Cl, –Br], [CuCl, CuBr], [Sandmeyer, 0–60 °C],
    [–I], [KI], [Erwärmen, ohne Kupfer],
    [–F], [HBF#sub[4]], [Schiemann, thermisch],
    [–CN], [CuCN], [Sandmeyer, 60 °C],
    [–H], [H#sub[3]PO#sub[2]], [hypophosphorige Säure],
    [–N#sub[3]], [NaN#sub[3]], [0–20 °C],
    [–Ar], [ArH, Cu], [Gomberg-Bachmann],
  ),
  caption: [Reaktionen von Diazoniumsalzen. Die Reihenfolge entspricht der
    praktischen Bedeutung.],
) <tab:diazonium>

#vorschrift("D.5.3", [Brombenzol aus Anilin])[
  #reaktion(
    $ "C" _6"H" _5"NH" _2 + "NaNO" _2 + "HBr" $,
    [#text(size: 6.5pt)[0–5 °C, dann CuBr]],
    $ "C" _6"H" _5"Br" + "N" _2 + "NaBr" + 2 "H" _2"O" $,
  )

  #ansatz[
    93 g (91 mL; 1,0 mol) Anilin, 76 g (1,1 mol) Natriumnitrit,
    400 mL 48-prozentige Bromwasserstoffsäure, 150 g (1,05 mol) Kupfer(I)-bromid.
  ]

  In einem 2-l-Dreihalskolben mit Rührer, Thermometer und Tropftrichter werden
  Anilin und 250 mL Bromwasserstoffsäure vorgelegt und mit Eis auf 0–5 °C
  gekühlt. Man tropft die Lösung von Natriumnitrit in 100 mL Wasser so zu, daß
  die Temperatur 5 °C nicht übersteigt; der Endpunkt ist an der bleibenden
  Blaufärbung mit Iod-Stärke-Papier erkennbar.

  Die Diazoniumlösung wird in eine auf 60 °C erwärmte Suspension von Kupfer(I)-bromid
  in 150 mL Bromwasserstoffsäure eingetragen. Nach dem Ende der
  Stickstoffentwicklung wird 30 min auf 80 °C erhitzt, abgekühlt und mit
  Wasserdampf destilliert.

  Das Destillat wird mit Natriumhydroxidlösung gewaschen, über Calciumchlorid
  getrocknet und über eine Vigreux-Kolonne fraktioniert. Die bei 154–157 °C
  übergehende Fraktion ist reines Brombenzol.

  #ausbeute[125 g (80 % d. Th.) farblose, stark lichtbrechende Flüssigkeit.]

  #kenndaten[
    Sdp. 156 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5597 #h(2em)
    $rho_20$ = 1,495 g·cm#super[−3]
  ]
]

#gefahr[Anilin ist giftig, wird über die Haut aufgenommen und steht im Verdacht,
krebserzeugend zu sein; es verursacht Methämoglobinbildung. Diazoniumsalze sind
explosiv und zerfallen oberhalb 5 °C; Lösungen niemals aufbewahren, sondern
sofort umsetzen. Bromwasserstoffsäure ist ätzend. Kupfer(I)-bromid reizt Augen
und Atemwege.]

=== Oxidation und Reduktion am Aromaten

*Aromaten sind schwer zu oxidieren*, weil die Aromatizität erhalten bleibt. Mit
Kaliumpermanganat werden Alkylseitenketten zu Carbonsäuren oxidiert, der Ring
bleibt unangetastet. Aus Toluol entsteht Benzoesäure, aus Ethylbenzol Benzoesäure
(auch die Methylengruppe wird abgebaut), aus tert-Butylbenzol keine Reaktion
(kein benzylischer Wasserstoff).

*Reduktion.* Die Birch-Reduktion (Natrium in flüssigem Ammoniak) hydriert den
Ring zu einem 1,4-Cyclohexadien; die Elektronen werden von der Lösung geliefert,
die Protonen vom Alkohol. Für Aromaten mit Elektronenanzug-Gruppen läuft die
Reaktion bereitwillig ab.

$ "ArH" + 2 "Na" + 2 "EtOH" -> "Cyclohexadien" + 2 "NaOEt" $

*Nitrogruppen zu Aminen.* Die Reduktion der Nitrogruppe ist die wichtigste
Stufe am Aromaten: metallisch (Zinn oder Eisen in Salzsäure) oder katalytisch
(Wasserstoff an Palladium). Die Metallreduktion läuft über Nitroso- und
Hydroxylamin-Zwischenstufen; in Säure fällt das Anilin als Aniliniumchlorid
an und wird erst bei der Aufarbeitung freigesetzt.

*Oxidation von Phenolen und Aminen.* Phenole oxidieren leicht zu Chinonen, Amine
zu Nitroso- und Nitroverbindungen. Beide Reaktionen sind präparativ nutzbar, aber
auch die Ursache für Verfärbungen bei der Lagerung; deshalb werden Phenole unter
Stickstoff und im Dunkeln aufbewahrt.

#vorschrift("D.5.4", [Benzoesäure aus Toluol])[
  #reaktion(
    $ "C" _6"H" _5"CH" _3 $,
    [#text(size: 6.5pt)[KMnO#sub[4], H#sub[2]O, 100 °C]],
    $ "C" _6"H" _5"COOH" $,
  )

  #ansatz[
    46 g (53 mL; 0,50 mol) Toluol, 160 g (1,0 mol) Kaliumpermanganat,
    1,5 L Wasser.
  ]

  In einem 2-l-Dreihalskolben mit Rührer und Rückflußkühler werden Toluol und
  1 L Wasser vorgelegt und zum Sieden erhitzt. Man trägt das Kaliumpermanganat in
  Anteilen so ein, daß die Reaktion gleichmäßig verläuft; nach jeder Zugabe wird
  gewartet, bis die violette Farbe verschwunden ist.

  Nach beendeter Zugabe wird 2 h unter Rückfluß gerührt, bis keine Violettfärbung
  mehr auftritt. Man saugt das ausgefällte Mangan(IV)-oxid heiß ab, wäscht mit
  heißem Wasser und engt das Filtrat auf 500 mL ein.

  Beim Ansäuern mit konzentrierter Salzsäure fällt Benzoesäure aus. Sie wird
  abgesaugt, mit kaltem Wasser gewaschen und aus Wasser umkristallisiert.

  #ausbeute[48 g (79 % d. Th.) farblose Blättchen.]

  #kenndaten[
    Schmp. 122 °C #h(2em) Sdp. 249 °C #h(2em) Säuregehalt > 99,5 %
  ]
]

#gefahr[Kaliumpermanganat ist stark oxidierend und ätzend; es darf nicht mit
brennbaren Stoffen (Papier, Alkohol, Glycerin) in Berührung kommen — sonst
Selbstentzündung. Toluol ist gesundheitsschädlich, entzündbar und
reproduktionstoxisch; im Abzug arbeiten. Salzsäure ist ätzend.]

#vorschrift("D.5.5", [Anilin aus Nitrobenzol])[
  #reaktion(
    $ "C" _6"H" _5"NO" _2 + 3 "Sn" + 7 "HCl" $,
    [#text(size: 6.5pt)[Rückfluß, dann NaOH]],
    $ "C" _6"H" _5"NH" _2 + 3 "SnCl" _2 + 2 "H" _2"O" $,
  )

  #ansatz[
    25 g (21 mL; 0,2 mol) Nitrobenzol, 72 g (0,6 mol) Zinn granuliert,
    100 mL konzentrierte Salzsäure, 40-prozentige Natronlauge.
  ]

  In einem 500-mL-Rundkolben mit Rückflußkühler werden das Zinn und 50 mL
  Salzsäure vorgelegt. Unter Rühren tropft man das Nitrobenzol zu; die
  Reaktion läuft von selbst warm bis zum Sieden. Nach beendeter Zugabe
  erhitzt man 30 min zum mäßigen Rückfluß, bis keine Öltröpfchen mehr zu
  sehen sind und die Lösung klar geworden ist.

  Man verdünnt mit 150 mL Wasser, filtriert unverbrauchtes Zinn ab und stellt
  das Filtrat in ein Eisbad. Unter Rühren wird soviel 40-prozentige
  Natronlauge zugesetzt, bis die Lösung stark alkalisch reagiert — die
  Zugabe ist stark exotherm und erfolgt tropfenweise.

  Das freie Anilin wird mit Wasserdampf übergetrieben; das Destillat wird mit
  Natriumchlorid gesättigt, die obere wäßrige Phase abgetrennt und die
  organische Phase über Kaliumhydroxid getrocknet. Man destilliert; die bei
  182–185 °C übergehende Fraktion ist reines Anilin.

  #ausbeute[14 g (75 % d. Th.) gelblich ölige Flüssigkeit.]

  #kenndaten[
    Sdp. 184 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5863 #h(2em)
    $rho_20$ = 1,022 g·cm#super[−3]
  ]
]

#gefahr[Nitrobenzol und Anilin sind hochgiftig: Beide bilden im Körper
  Methämoglobin und führen zu Sauerstoffmangel — Gift geht auch über die Haut!
  Nur im Abzug mit Handschuhen und Schutzbrille arbeiten, Spritzer sofort
  abwaschen. Salzsäure und Natronlauge sind stark ätzend; die Alkalizugabe
  erfolgt unter Eisbadkühlung. Anilinhaltige Abfälle werden getrennt
  gesammelt und nicht in den Abfluß gegeben.]

=== Aromaten mit Heteroatomen

Pyridin, Pyrrol, Furan und Thiophen verhalten sich wie Aromaten mit
unterschiedlicher Elektronendichte: Pyrrol und Furan sind elektronenreich und
reagieren leicht mit Elektrophilen (bevorzugt in 2-Stellung), Pyridin ist
elektronenarm und reagiert nur unter drastischen Bedingungen (bevorzugt in
3-Stellung).

#figure(
  table(
    columns: (1.2fr, auto, auto, 2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Heterocyclus*], [*pK#sub[a] (konj. Säure)*], [*π-Elektronen*], [*Verhalten*]),
    [Pyrrol], [−3,8], [6 (N frei)], [sehr elektronenreich, säureempfindlich],
    [Furan], [−2,1], [6 (O frei)], [elektronenreich, empfindlich],
    [Thiophen], [−3,8], [6 (S frei)], [elektronenreich, stabil],
    [Pyridin], [5,2], [6 (N im Ring)], [elektronenarm, nucleophil],
    [Imidazol], [7,0], [6], [beides, biologisch wichtig],
  ),
  caption: [Fünf- und sechsgliedrige Heteroaromaten. Die Lage des freien
    Elektronenpaares entscheidet über die Reaktivität.],
) <tab:heteroaromaten>

*Präparative Konsequenz.* Pyrrol polymerisiert in starken Säuren; man nitriert
deshalb mit Acetylnitrat bei tiefer Temperatur. Pyridin wird mit
Kaliumpermanganat zu Pyridin-2,3-dicarbonsäure oxidiert, mit Natriumamid am
2-C-Stellungswechsel metalliert.

=== Weitere Funktionalisierungen am Ring

Nicht jede Einführung einer funktionellen Gruppe am Aromaten ist eine
elektrophile Substitution. Zwei präparativ wichtige Wege laufen über
Organometallverbindungen und ergänzen das Spektrum:

- *Metallierung*: Brombenzol + Magnesium → Phenylmagnesiumbromid; Umsetzung mit
  Elektrophilen (CO#sub[2], DMF, Oxiran, Halogen) führt zu Carbonsäuren,
  Aldehyden, Alkoholen und Halogeniden.
- *Lithiierung*: Mit n-Butyllithium entsteht aus Brombenzol bei −78 °C
  Phenyllithium; die Reaktion ist schneller und erlaubt tiefere Temperaturen.

$ "Ph–Br" ->^("Mg, Et"_2"O") "Ph–MgBr" ->^("CO"_2", dann H"_3"O"^+) "Ph–COOH" $

#vorschrift("D.5.6", [Benzoesäure aus Brombenzol über das Grignard-Reagenz])[
  #reaktion(
    $ "C" _6"H" _5"Br" + "Mg" + "CO" _2 $,
    [#text(size: 6.5pt)[Ether, dann H#sub[3]O⁺]],
    $ "C" _6"H" _5"COOH" $,
  )

  #ansatz[
    157 g (105 mL; 1,0 mol) Brombenzol, 27 g (1,1 mol) Magnesiumspäne,
    500 mL absoluter Ether, Trockeneis (Überschuß).
  ]

  In einem 2-l-Dreihalskolben mit Rührer, Rückflußkühler, Tropftrichter und
  Calciumchloridrohr werden Magnesiumspäne und 50 mL Ether vorgelegt; man
  versetzt mit einer Spatelspitze Iod und tropft 10 mL Brombenzol zu, bis die
  Reaktion anspringt. Dann wird der Rest des Brombenzols in 200 mL Ether so
  zugetropft, daß der Ether gelinde siedet.

  Nach beendeter Zugabe erhitzt man 30 min unter Rückfluß, kühlt auf 0 °C und
  gießt die Lösung auf einen Überschuß gepulverter Trockeneis. Nach dem
  Auftauen wird mit 300 mL Eiswasser und anschließend mit verdünnter Salzsäure
  bis pH 2 versetzt.

  Man trennt die etherische Phase ab, extrahiert die wäßrige Phase zweimal mit
  Ether und engt die vereinigten Extrakte ein. Der Rückstand wird aus Wasser
  umkristallisiert.

  #ausbeute[98 g (80 % d. Th.) farblose Blättchen.]

  #kenndaten[
    Schmp. 122 °C #h(2em) Sdp. 249 °C
  ]
]

#gefahr[Ether ist extrem entzündbar und bildet mit Luft explosive Gemische sowie
  explosive Peroxide. Magnesiumspäne und Grignard-Lösungen entzünden sich an
  Luft und zersetzen sich mit Wasser unter Feuererscheinung;
  Trockeneis-Einsatz ohne Wasser, Schutzbrille und Gesichtsschutz tragen.
  Salzsäure ist ätzend.]


*Über das Diazoniumsalz.* Anilin läßt sich über das Diazoniumsalz in eine
Vielzahl von Verbindungen überführen; die wäßrige Hydrolyse liefert Phenol.
Die Schlüsselreaktion, die Diazotierung, muß streng bei 0–5 °C erfolgen —
das Diazoniumsalz zersetzt sich sonst unter Stickstoffentwicklung.

#vorschrift("D.5.9", [Phenol aus Anilin über das Diazoniumsalz])[
  #reaktion(
    $ "C" _6"H" _5"NH"_2 $,
    [#text(size: 6.5pt)[1) NaNO#sub[2], HCl, 0–5 °C 2) 60 °C]],
    $ "C" _6"H" _5"OH" $,
  )

  #ansatz[
    23 g (0,25 mol) Anilin, 18 g (0,26 mol) Natriumnitrit, 60 mL
    konz. Salzsäure, 100 mL Wasser.
  ]

  Das Anilin wird in 60 mL konz. Salzsäure und 100 mL Wasser gelöst und im
  Eis-Salz-Bad auf 0 °C gekühlt. Die Nitritlösung (18 g in 30 mL Wasser)
  tropft man so zu, daß die Temperatur 5 °C nicht überschreitet; der
  Jodid-Stärke-Nachweis muß positiv bleiben. Man rührt 15 min nach.

  Anschließend erwärmt man im Wasserbad langsam auf 60–70 °C, bis die
  Stickstoffentwicklung beendet ist, und destilliert das Phenol mit
  Wasserdampf. Das Destillat wird mit Chloroform ausgeschüttelt, die
  organische Phase über Natriumsulfat getrocknet und das Lösungsmittel
  entfernt.

  #ausbeute[12 g (50 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 41 °C #h(2em) Sdp. 182 °C #h(2em) löslich in Wasser, Ethanol,
    Chloroform #h(2em) $M$ = 94,1 g·mol#super[−1]
  ]
]

#gefahr[Diazoniumsalze sind explosionsfähig, wenn sie trocken werden — niemals
  einengen oder isolieren, stets in wäßriger Lösung und unter 5 °C halten.
  Phenol ist giftig und ätzend (Hautverbrennungen); Handschuhe und Brille,
  Kontamination sofort mit PEG oder Ethanol abwaschen, nicht mit Wasser.
  Salpetrige Säure und Stickoxide nur im Abzug.]

=== Störungen und ihre Ursachen

#figure(
  table(
    columns: (1.3fr, 1.3fr, 1.2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Störung*], [*Ursache*], [*Abhilfe*]),
    [Nitrierung: Dinitrobenzol], [Temperatur über 60 °C, Säure zu konzentriert], [unter 55 °C arbeiten, Säure verdünnen],
    [Diazotierung: Stickstoffentwicklung], [zu hohe Temperatur, Nitritüberschuß], [streng 0–5 °C, Nitrit langsam],
    [Friedel-Crafts: keine Umsetzung], [AlCl#sub[3] hydrolysiert, Feuchtigkeit], [frisches AlCl#sub[3], wasserfreies Benzol],
    [Sulfonierung: keine Kristalle], [zu verdünnt, zu warm], [rauchende Säure, Salzwasser-Zugabe],
    [Grignard setzt nicht an], [Restfeuchte, Säure im Edukt], [wasserfrei destillieren, Mg aktivieren],
  ),
  caption: [Typische Störungen bei Reaktionen am Aromaten.],
) <tab:stoerungen-aromaten>

*Zwei Wege zum Alkylbenzol und zur Carbonsäure.* Die
Friedel-Crafts-Alkylierung ist die Schwester der Acylierung — mit dem
Unterschied, daß Umlagerungen möglich sind. Die Kolbe-Schmitt-Reaktion
bringt direkt eine Carboxylgruppe in den Phenolat-Ring; sie ist der
industrielle Weg zur Salicylsäure und damit zum Aspirin (D.7.5).

#vorschrift("D.5.10", [Salicylsäure aus Natriumphenolat])[
  #reaktion(
    $ "C" _6"H" _5"ONa" + "CO" _2 $,
    [#text(size: 6.5pt)[125 °C, 6 bar, 6 h]],
    $ "C" _6"H" _4("OH")"COONa" $,
  )

  #ansatz[
    29 g (0,25 mol) Natriumphenolat (getrocknet), 15 g (0,34 mol)
    Kohlendioxid, 100 mL Wasser (zur Aufarbeitung).
  ]

  In einem 300-mL-Autoklaven mit Rührer erhitzt man das getrocknete
  Natriumphenolat unter Kohlendioxid-Überdruck (6 bar) 6 h auf 125 °C.
  Nach dem Abkühlen läßt man den Druck ab und löst die geschmolzene Masse
  in 100 mL heißem Wasser.

  Man filtriert ungelöste Bestandteile ab und säuert das Filtrat mit
  konz. Salzsäure auf pH 1 an; die Salicylsäure fällt als weißes Pulver
  aus. Nach dem Absaugen und Waschen mit kaltem Wasser wird aus Wasser
  umkristallisiert.

  #ausbeute[22 g (64 % d. Th.) weiße Kristalle.]

  #kenndaten[
    Schmp. 159 °C #h(2em) löslich in Ethanol, heißem Wasser
    #h(2em) $M$ = 138,1 g·mol#super[−1] #h(2em)
    Mit Eisen(III)-chlorid violette Färbung — Phenol-Nachweis.
  ]
]

#gefahr[Natriumphenolat ist ätzend und muß wasserfrei vorliegen —
  Restfeuchte senkt die Ausbeute drastisch. Der Autoklav wird nur mit
  geprüften Bauteilen und Druckminderer betrieben; nach dem Abkühlen
  langsam druckentlasten. Salicylsäure reizt die Haut.]

#vorschrift("D.5.11", [tert-Butylbenzol aus Benzol])[
  #reaktion(
    $ "C" _6"H" _6 + ("CH"_3)_2"C=CH"_2 $,
    [#text(size: 6.5pt)[H#sub[3]PO#sub[4], 25 °C]],
    $ "C" _6"H" _5"C(CH"_3)_3 $,
  )

  #ansatz[
    78 g (100 mL; 1,0 mol) Benzol, 28 g (0,50 mol) Isobuten (aus
    tert-Butanol/Schwefelsäure), 5 mL Phosphorsäure (85 %).
  ]

  In einem 250-mL-Dreihalskolben mit Gasleitrohr, Thermometer und Rührer
  versetzt man das Benzol mit 5 mL Phosphorsäure und leitet Isobuten
  (durch Erwärmen von tert-Butanol über Schwefelsäure erzeugt) bei
  25–30 °C ein. Man rührt 1 h nach, trennt die Säurephase ab und wäscht
  die organische Phase mit Wasser und Natriumhydrogencarbonat-Lösung.

  Nach dem Trocknen über Calciumchlorid destilliert man über eine
  Vigreux-Kolonne; bei 168–170 °C geht das tert-Butylbenzol über.

  #ausbeute[38 g (57 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 169 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4920 #h(2em)
    $rho_20$ = 0,87 g·cm#super[−3] #h(2em) $M$ = 134,2 g·mol#super[−1]
  ]
]

#gefahr[Benzol ist krebserzeugend — im Abzug arbeiten, wo möglich Toluol
  als Ersatz erwägen. Isobuten ist extrem entzündbar; Gasleitung dicht
  halten, keine Zündquellen. Phosphorsäure ätzend.]

*Umlagerung als Warnung.* Würde man 1-Chlor-2-methylpropan mit
Aluminiumchlorid alkylieren, entstünde über die Umlagerung zum tert-Butyl-
Carbenium ebenfalls tert-Butylbenzol — nicht das lineare Produkt. Genau
deshalb greift man für definierte Ketten zur Acylierung mit anschließender
Clemmensen- oder Wolff-Kishner-Reduktion.

=== Aufgaben

- Ordnen Sie die folgenden Verbindungen nach ihrer Reaktivität gegenüber
  Nitriersäure: Benzol, Toluol, Phenol, Nitrobenzol, Anilin, Chlorbenzol.
- Warum liefert die Nitrierung von Anilin in stark saurer Lösung überwiegend
  *meta*-Produkt, in schwach saurer dagegen *para*-Produkt?
- Formulieren Sie die Synthese von 4-Bromanilin aus Anilin in zwei Stufen und
  begründen Sie die Reihenfolge.
- Warum fällt das Anilin bei der Reduktion nicht sofort aus, sondern erst
  nach der Zugabe von Natronlauge?
- Vergleichen Sie die Reduktion mit Zinn/Salzsäure und mit Wasserstoff an
  Palladium: Welche Vor- und Nachteile hat jedes Verfahren?
- p-Nitrotoluol soll zu p-Toluidin reduziert werden. Übertragen Sie den
  Ansatz von D.5.5 und berechnen Sie die Mengen für 0,2 mol.
- Warum wird das Ende der Reduktion an verschwundenen Öltröpfchen erkannt?
- Erklären Sie, warum die Sulfonierung reversibel ist und wie man das zur
  para-Selektivität nutzt.
- Warum gelingt die Friedel-Crafts-Acylierung an Aminobenzol nicht?
- Berechnen Sie die theoretische Ausbeute der Diazotierung von 0,25 mol
  Anilin und vergleichen Sie mit der erhaltenen Menge Phenol.
- Erklären Sie anhand der Carbeniumion-Stabilitäten, warum die
  Friedel-Crafts-Alkylierung von 1-Chlorpropan kein n-Propylbenzol
  liefert.
- Vergleichen Sie Kolbe-Schmitt- und Gattermann-Reaktion zur Synthese von
  Hydroxybenzoesäuren.
- Wie gelangt man von tert-Butylbenzol zu p-tert-Butylphenol?
