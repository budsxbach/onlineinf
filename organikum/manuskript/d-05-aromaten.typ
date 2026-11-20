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

#vorschrift("D.5.2", [Brombenzol aus Anilin])[
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

*Oxidation von Phenolen und Aminen.* Phenole oxidieren leicht zu Chinonen, Amine
zu Nitroso- und Nitroverbindungen. Beide Reaktionen sind präparativ nutzbar, aber
auch die Ursache für Verfärbungen bei der Lagerung; deshalb werden Phenole unter
Stickstoff und im Dunkeln aufbewahrt.

#vorschrift("D.5.3", [Benzoesäure aus Toluol])[
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

=== Aufgaben

- Ordnen Sie die folgenden Verbindungen nach ihrer Reaktivität gegenüber
  Nitriersäure: Benzol, Toluol, Phenol, Nitrobenzol, Anilin, Chlorbenzol.
- Warum liefert die Nitrierung von Anilin in stark saurer Lösung überwiegend
  *meta*-Produkt, in schwach saurer dagegen *para*-Produkt?
- Formulieren Sie die Synthese von 4-Bromanilin aus Anilin in zwei Stufen und
  begründen Sie die Reihenfolge.
