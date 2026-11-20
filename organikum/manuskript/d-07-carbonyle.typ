// ============================================================================
//  D.7  Carbonylverbindungen
// ============================================================================

#import "/vorlage/layout.typ": *

== Carbonylverbindungen

Das Carbonylkohlenstoffatom ist der vielseitigste Reaktionsort der organischen
Chemie: Es ist elektrophil, seine α-Stellung ist CH-acid, und beide Zentren
lassen sich getrennt ansprechen. Wer diese drei Zugänge beherrscht, kann einen
großen Teil der präparativen Chemie planen.

=== Struktur und Reaktivität

Die C=O-Bindung ist polarisiert: Am Sauerstoff liegt eine Partialladung von
−0,4 bis −0,5, am Kohlenstoff die entsprechende positive Ladung. Das
π\*-Orbital (LUMO) ist am Kohlenstoff am größten — dort greift das Nucleophil an.

Die Reaktivität folgt der Elektrophilie des Carbonylkohlenstoffs:

$ "R–CO–Cl" > "R–CHO" > "R–CO–R'" > "R–CO–OR'" > "R–CO–NH" _2 > "R–CO–O"^- $

Säurechloride reagieren am schnellsten, Amide und Carboxylate am langsamsten.
Der Grund ist die Donation des Heteroatoms in das π\*-Orbital: Je besser der
Donor, desto weniger elektrophil ist das Carbonyl.

#figure(
  table(
    columns: (1.4fr, auto, 2.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verbindungsklasse*], [*Wellenzahl in cm⁻¹*], [*Bemerkung*]),
    [Säurechlorid], [1800], [höchste Wellenzahl, sehr reaktiv],
    [Anhydrid], [1820 / 1760], [zwei Banden],
    [Aldehyd], [1725], [zwei Banden bei 2820/2720],
    [Keton], [1715], [offenkettig],
    [Cyclopentanon], [1745], [Ringspannung],
    [Ester], [1735], [breite Bande],
    [Carbonsäure], [1710], [breit, mit Wasserstoffbrücken],
    [Amid], [1650], [konjugiert, stabil],
    [Enolat], [1580–1650], [C=C-Anteil],
  ),
  caption: [IR-Wellenzahlen der Carbonylgruppe. Die Lage ist ein direktes Maß für
    die Elektrophilie.],
) <tab:carbonyl-ir>

=== Nucleophile Addition

Amine, Alkohole, Wasser, Hydride und Organometallverbindungen addieren an das
Carbonyl. Entscheidend ist, ob das Additionsprodukt stabil ist oder weiterreagiert:

- Mit Hydrid oder Grignard-Reagenzien entsteht ein Alkohol, der stehenbleibt.
- Mit Alkoholen entsteht ein Halbacetal, das nur bei Ketonen mit
  Elektronenanzug-Gruppen (z. B. Chloral) isolierbar ist; sonst folgt die
  Acetalisierung.
- Mit Aminen entsteht ein Halbaminal, das unter Wasserabspaltung in ein Imin
  übergeht.

#figure(
  table(
    columns: (1.5fr, 1.6fr, 1.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Nucleophil*], [*Produkt*], [*Bedingungen*]),
    [H⁻ (NaBH#sub[4])], [Alkohol], [Methanol, 0–25 °C],
    [H⁻ (LiAlH#sub[4])], [Alkohol], [Ether, 0–35 °C],
    [RMgX], [Alkohol], [Ether, dann H#sub[3]O⁺],
    [RLi], [Alkohol], [−78 °C, dann H#sub[3]O⁺],
    [R–OH], [Acetal], [H⁺, Wasserabspaltung],
    [R–NH#sub[2]], [Imin], [H⁺, Wasserabspaltung],
    [H#sub[2]N–OH], [Oxim], [pH 4–5],
    [H#sub[2]N–NH#sub[2]], [Hydrazon], [pH 4–5],
    [HCN], [Cyanhydrin], [schwach basisch],
  ),
  caption: [Nucleophile Additionen an Carbonylverbindungen und ihre Folge­
    produkte.],
) <tab:carbonyl-addition>

*Cram-Regel und Felkin-Anh-Modell.* Bei α-chiralen Carbonylverbindungen entscheidet
die Konformation, von welcher Seite das Nucleophil angreift. Im Felkin-Anh-Modell
steht die größte Gruppe senkrecht zur Carbonylebene; der Angriff erfolgt von der
Seite der kleineren Gruppe. Mit chelatbildenden Reagenzien (Zn²⁺, Mg²⁺) kehrt
sich die Selektivität um.

=== α-Reaktionen: Enole und Enolate

Die α-Wasserstoffatome einer Carbonylverbindung sind acid, weil das entstehende
Anion durch das Carbonyl stabilisiert wird. Das Enolat ist ein ambivalentes
Nucleophil: Es reagiert mit dem Kohlenstoff (C-Alkylierung) oder mit dem
Sauerstoff (O-Alkylierung), mit Elektrophilen am α-C, mit Carbonylen in der
Aldolreaktion.

*Kinetisches und thermodynamisches Enolat.* Mit LDA bei −78 °C entsteht das
Enolat an der weniger gehinderten Seite (kinetisch), mit Ethanolat bei
Raumtemperatur das am höchsten substituierte (thermodynamisch). Für die
Aldolreaktion ist diese Unterscheidung entscheidend: das Z-Enolat gibt *syn*-,
das E-Enolat *anti*-Aldole.

#figure(
  table(
    columns: (1.6fr, auto, 1.6fr, 1.4fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Carbonyl*], [*pK#sub[a] (α-H)*], [*Base*], [*Enolat*]),
    [Acetaldehyd], [16,7], [NaOH], [thermodynamisch],
    [Aceton], [19,3], [NaOEt], [thermodynamisch],
    [Essigsäureethylester], [24,5], [NaOEt], [thermodynamisch],
    [Acetylaceton], [9,0], [Na#sub[2]CO#sub[3]], [vollständig],
    [Malonester], [13,0], [NaOEt], [vollständig],
    [Acetessigester], [11,0], [NaOEt], [vollständig],
  ),
  caption: [Acidität von α-Wasserstoffatomen. Die β-Dicarbonylverbindungen sind
    so acid, daß die Enolatbildung quantitativ verläuft.],
) <tab:enolate>

*Aldolreaktion.* Zwei Carbonylmoleküle reagieren: Das Enolat des einen greift das
Carbonyl des anderen an. Das Produkt ist ein β-Hydroxycarbonyl, das unter
Wasserabspaltung in ein α,β-ungesättigtes Carbonyl übergeht.

$ "2 CH" _3"CHO" ->^("OH"^-) "CH" _3"CH(OH)CH" _2"CHO" ->^(minus "H"_2 "O") "CH" _3"CH=CHCHO" $

*Mischkondensation.* Mit zwei verschiedenen Carbonylen entstehen vier Produkte,
wenn beide enolisierbar sind. Präparativ arbeitet man deshalb mit
*gerichteter* Aldolreaktion: Ein Partner wird vollständig in das Enolat
überführt (mit LDA), der andere wird vorgelegt und ist nicht enolisierbar
(Formaldehyd, Benzaldehyd, Ester).

*Claisen-Kondensation.* Ester reagieren mit ihrem Enolat zu β-Ketoestern. Der
gebildete Alkoholatrest macht die Reaktion irreversibel; mit Natriumethanolat
werden Ausbeuten von 60–80 % erreicht.

*Perkin-, Knoevenagel- und Stobbe-Reaktion* sind Varianten mit aromatischen
Aldehyden, Malonsäureestern und Bernsteinsäureestern.

#vorschrift("D.7.1", [Dibenzalaceton aus Benzaldehyd und Aceton])[
  #reaktion(
    $ "2 C" _6"H" _5"CHO" + "CH" _3"COCH" _3 $,
    [#text(size: 6.5pt)[NaOH/EtOH, 25 °C]],
    $ "C"_6"H"_5"CH=CHCOCH=CHC"_6"H"_5 + 2 "H"_2"O" $,
  )

  #ansatz[
    106 g (101 mL; 1,0 mol) Benzaldehyd, 32 g (40 mL; 0,55 mol) Aceton,
    400 mL Ethanol (96 %), 100 mL 10-prozentige Natriumhydroxidlösung.
  ]

  In einem 1-l-Erlenmeyerkolben mit Magnetrührer werden Benzaldehyd und Aceton in
  Ethanol gelöst und auf 20 °C gekühlt. Man tropft die Natronlauge langsam zu,
  wobei die Lösung gelb wird und das Produkt nach einigen Minuten auszufallen
  beginnt.

  Man rührt 2 h bei Raumtemperatur, kühlt auf 5 °C, saugt den Niederschlag ab und
  wäscht ihn mit eiskaltem Ethanol und Wasser. Das Rohprodukt wird aus
  Essigsäureethylester oder Ethanol umkristallisiert.

  #ausbeute[108 g (92 % d. Th.) gelbe Kristalle.]

  #kenndaten[
    Schmp. 112 °C #h(2em) $lambda_max$ = 330 nm (Ethanol)
  ]
]

#gefahr[Benzaldehyd ist gesundheitsschädlich, entzündbar und wird über die Haut
  aufgenommen; es kann Allergien auslösen. Aceton ist leicht entzündbar und
  reizt Augen. Natronlauge ist ätzend. Dibenzalaceton ist lichtempfindlich und
  reizt die Haut; im Dunkeln aufbewahren.]

*Nachweis der Doppelbindung.* Dibenzalaceton entfärbt Bromwasser und addiert
Brom; der Schmelzpunkt allein genügt nicht, weil das Monokondensationsprodukt
(Benzylidenaceton, Schmp. 42 °C) ähnliche Löslichkeit hat. Die
Dünnschichtchromatographie mit Essigsäureethylester/Cyclohexan (1:4) trennt
beide sauber.

=== Carbonsäuren und ihre Derivate

*Säurechloride* entstehen aus Carbonsäuren mit Thionylchlorid, Oxalylchlorid oder
Phosphorpentachlorid. Thionylchlorid ist vorzuziehen, weil die Nebenprodukte
(SO#sub[2], HCl) gasförmig sind und das Produkt reiner bleibt.

$ "RCOOH" + "SOCl" _2 -> "RCOCl" + "SO" _2 + "HCl" $

*Veresterung.* Carbonsäure und Alkohol reagieren unter Säurekatalyse zu Ester und
Wasser. Das Gleichgewicht liegt bei etwa 70 % Umsatz; man verschiebt es durch
Überschuß eines Partners oder durch Entfernen des Wassers (azeotrope Destillation
mit Toluol, Molekularsieb).

*Amide.* Aus Säurechlorid und Amin (Schotten-Baumann) oder aus Carbonsäure und
Amin bei hoher Temperatur. Die Amidbindung ist stabil, aber hydrolysierbar; für
die Synthese von Peptiden braucht man Kupplungsreagenzien (DCC, EDC, HATU).

#figure(
  table(
    columns: (1.5fr, 1.5fr, 1.4fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Reaktion*], [*Reagenz*], [*Produkt*], [*Ausbeute*]),
    [Veresterung], [H#sub[2]SO#sub[4], Rückfluß], [Ester], [60–80 %],
    [Säurechlorid], [SOCl#sub[2]], [RCOCl], [85–95 %],
    [Amidbildung], [NH#sub[3], SOCl#sub[2]], [RCONH#sub[2]], [70–90 %],
    [Anhydridbildung], [Ac#sub[2]O], [Anhydrid], [80 %],
    [Decarboxylierung], [NaOH, CaO, 300 °C], [Kohlenwasserstoff], [50–70 %],
    [Reduktion zu Alkohol], [LiAlH#sub[4]], [Alkohol], [80–95 %],
  ),
  caption: [Reaktionen der Carbonsäuren. Die Veresterung ist die einzige
    Gleichgewichtsreaktion unter ihnen.],
) <tab:carbonsaeuren>

#vorschrift("D.7.2", [Essigsäureethylester aus Essigsäure und Ethanol])[
  #reaktion(
    $ "CH" _3"COOH" + "C" _2"H" _5"OH" $,
    [#text(size: 6.5pt)[H#sub[2]SO#sub[4], Rückfluß]],
    $ "CH" _3"COOC" _2"H" _5 + "H" _2"O" $,
  )

  #ansatz[
    120 g (114 mL; 2,0 mol) Essigsäure, 138 g (175 mL; 3,0 mol) Ethanol (96 %),
    20 mL konzentrierte Schwefelsäure.
  ]

  In einem 1-l-Rundkolben mit Rückflußkühler und Wasserabscheider werden
  Essigsäure, Ethanol und Schwefelsäure vorgelegt. Man erhitzt zum Sieden und
  trennt das übergehende Wasser-Ethanol-Azeotrop im Abscheider ab; das
  zurücklaufende Ethanol wird erneut umgesetzt.

  Nach 4 h ist die Wasserabscheidung beendet. Man kühlt ab, gießt auf 200 mL
  Eiswasser und trennt die organische Phase ab. Sie wird mit
  Natriumcarbonatlösung neutral gewaschen (Vorsicht: CO#sub[2]-Entwicklung),
  über Magnesiumsulfat getrocknet und über eine Vigreux-Kolonne destilliert.

  #ausbeute[150 g (85 % d. Th.) farblose, fruchtig riechende Flüssigkeit.]

  #kenndaten[
    Sdp. 77 °C (1013 hPa) #h(2em) $n_D^20$ = 1,3722 #h(2em)
    $rho_20$ = 0,902 g·cm#super[−3]
  ]
]

#gefahr[Essigsäure ist ätzend (konzentriert) und reizt die Atemwege; Schwefelsäure
  ist stark ätzend. Ethanol und der Ester sind leicht entzündbar; keine offene
  Flamme, Rückflußkühler mit Wasser betreiben. Beim Waschen mit Carbonat entsteht
  Kohlendioxid — Kolben nicht verschließen.]

#vorschrift("D.7.3", [Benzoin aus Benzaldehyd])[
  #reaktion(
    $ "2 C" _6"H" _5"CHO" $,
    [#text(size: 6.5pt)[KCN/EtOH, Rückfluß]],
    $ "C" _6"H" _5"CH(OH)COC" _6"H" _5 $,
  )

  #ansatz[
    106 g (101 mL; 1,0 mol) Benzaldehyd, 10 g (0,15 mol) Kaliumcyanid,
    300 mL Ethanol (96 %).
  ]

  In einem 1-l-Rundkolben mit Rückflußkühler werden Benzaldehyd und Ethanol
  vorgelegt; man gibt die Lösung von Kaliumcyanid in 50 mL Wasser zu und erhitzt
  2 h unter Rückfluß. Die Mischung färbt sich gelb, beim Abkühlen kristallisiert
  das Benzoin aus.

  Man kühlt auf 5 °C, saugt ab und wäscht mit wenig eiskaltem Ethanol. Das
  Rohprodukt wird aus Ethanol umkristallisiert.

  #ausbeute[93 g (88 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 137 °C #h(2em) Reinheit > 98 %
  ]
]

#gefahr[Kaliumcyanid ist sehr giftig und setzt mit Säuren Blausäure frei; niemals
  mit Säuren in Berührung bringen, Abfälle getrennt sammeln und mit
  Natriumhypochlorit oxidieren. Benzaldehyd ist gesundheitsschädlich und
  entzündbar, Ethanol leicht entzündbar.]

*Benzoin-Kondensation.* Das Cyanid-Ion ist hier kein Nucleophil am Kohlenstoff,
sondern eine Base: Es deprotoniert den Aldehyd, das entstehende Acyloin-Anion
greift ein zweites Aldehydmolekül an. Das Produkt ist ein α-Hydroxyketon, das
als Edukt für die Benzilsäure-Umlagerung und für die Synthese von
Diphenylketonen dient.

#vorschrift("D.7.4", [Benzilsäure aus Benzil])[
  #reaktion(
    $ "C" _6"H" _5"COCOC" _6"H" _5 $,
    [#text(size: 6.5pt)[KOH/EtOH, Rückfluß]],
    $ "C"_6"H"_5"COH(C"_6"H"_5")COOH" $,
  )

  #ansatz[
    105 g (0,50 mol) Benzil, 80 g (1,4 mol) Kaliumhydroxid, 500 mL Ethanol.
  ]

  In einem 1-l-Rundkolben mit Rückflußkühler werden Benzil und Ethanol
  vorgelegt, dann die Lösung von Kaliumhydroxid in 100 mL Wasser zugegeben. Man
  erhitzt 3 h unter Rückfluß; die Lösung färbt sich dunkel, beim Abkühlen fällt
  das Kaliumsalz der Benzilsäure aus.

  Man verdünnt mit 1 L Wasser, saugt ab und löst das Salz in 500 mL heißem
  Wasser. Beim Ansäuern mit Salzsäure fällt die freie Säure aus; sie wird aus
  Ethanol/Wasser umkristallisiert.

  #ausbeute[96 g (84 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 150 °C (Zersetzung)
  ]
]

#gefahr[Kaliumhydroxid ist stark ätzend, besonders in ethanolischer Lösung.
  Salzsäure ist ätzend. Benzilsäure reizt Augen und Atemwege.]

=== Oxime, Hydrazone und ihre Analytik

Carbonylverbindungen reagieren mit Hydroxylamin zu Oximen und mit
2,4-Dinitrophenylhydrazin zu Hydrazonen. Beide sind kristalline Derivate mit
scharfem Schmelzpunkt — das klassische Mittel zur Identifizierung.

#figure(
  table(
    columns: (1.5fr, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Carbonyl*], [*Oxim (Schmp./°C)*], [*2,4-DNPH (Schmp./°C)*]),
    [Aceton], [61], [126],
    [Benzaldehyd], [35], [237],
    [Cyclohexanon], [90], [160],
    [Acetophenon], [59], [249],
    [Zimtaldehyd], [118], [255],
    [Butanon], [30], [115],
  ),
  caption: [Schmelzpunkte gebräuchlicher Carbonyl-Derivate. Zur Identifizierung
    genügt die Übereinstimmung mit dem Literaturwert auf ± 2 °C.],
) <tab:carbonyl-derivate>

=== Reaktivität der Carbonsäurederivate

Alle Derivate der Carbonsäure reagieren nach demselben Muster: Das Nucleophil
greift am Carbonylkohlenstoff an, es entsteht ein tetraedrisches Zwischenprodukt,
und die Abgangsgruppe wird eliminiert. Die Reaktivität hängt davon ab, wie gut
die Abgangsgruppe ist und wie stark sie den Carbonylkohlenstoff desaktiviert.

#figure(
  table(
    columns: (1.4fr, 1.3fr, auto, 1.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Derivat*], [*Abgangsgruppe*], [*rel. Rate*], [*typische Umsetzung*]),
    [Säurechlorid], [Cl⁻], [1000], [Amid, Ester, Anhydrid],
    [Anhydrid], [RCOO⁻], [100], [Acylierung, Ester],
    [Ester], [RO⁻], [1], [Hydrolyse, Umesterung],
    [Carbonsäure], [HO⁻], [0,01], [nur mit Aktivierung],
    [Amid], [NH#sub[2]⁻], [0,001], [Hydrolyse, Dehydratisierung],
  ),
  caption: [Reaktivitätsreihe der Carbonsäurederivate. Die Reihe gilt für
    nucleophile Substitutionen am Acylkohlenstoff.],
) <tab:acyl-reaktivitaet>

*Anwendung in der Synthese.* Man wählt das Derivat so unreaktiv wie möglich, um
Selektivität zu gewinnen: Ein Säurechlorid setzt man nur dort ein, wo keine
anderen nucleophilen Gruppen im Molekül sind; für die Acylierung empfindlicher
Alkohole nimmt man ein Anhydrid oder aktiviert die Säure in situ mit DCC.

*Acylierung von Phenolen und Alkoholen.* Die Veresterung von Phenolen gelingt mit
Carbonsäuren nicht direkt, weil das Phenoxid zu schwach nucleophil und die
Gleichgewichtslage ungünstig ist. Man acyliert mit Anhydrid in Gegenwart von
Schwefelsäure oder Pyridin — die klassische Vorschrift für Acetylsalicylsäure.

#vorschrift("D.7.5", [Acetylsalicylsäure aus Salicylsäure])[
  #reaktion(
    $ "2-HOC" _6"H" _4"COOH" + "(CH" _3"CO)" _2"O" $,
    [#text(size: 6.5pt)[H#sub[2]SO#sub[4], 60 °C]],
    $ "2-CH" _3"COO-C" _6"H" _4"COOH" + "CH" _3"COOH" $,
  )

  #ansatz[
    138 g (1,0 mol) Salicylsäure, 153 g (142 mL; 1,5 mol) Essigsäureanhydrid,
    5 mL konzentrierte Schwefelsäure.
  ]

  In einem 1-l-Erlenmeyerkolben mit Thermometer werden Salicylsäure und
  Essigsäureanhydrid vorgelegt und mit der Schwefelsäure versetzt. Man erwärmt
  im Wasserbad auf 60 °C und hält diese Temperatur 30 min; die Salicylsäure
  löst sich, anschließend beginnt das Produkt zu kristallisieren.

  Man kühlt auf Raumtemperatur, gibt 300 mL Wasser zu und zerstört das
  überschüssige Anhydrid durch 30 min Rühren (Hydrolyse zu Essigsäure).

  Man saugt ab, wäscht mit kaltem Wasser und kristallisiert aus Ethanol/Wasser
  (1 : 3) um. Das Produkt wird bei 60 °C getrocknet — nicht höher, sonst
  entsteht aus Spuren von Schwefelsäure und Feuchtigkeit Essigsäuregeruch.

  #ausbeute[162 g (90 % d. Th.) farblose Nadeln.]

  #kenndaten[
    Schmp. 136 °C #h(2em) Gehalt (Titration) > 99,5 % #h(2em)
    Säurezahl 311 mg KOH·g#super[−1]
  ]
]

#gefahr[Essigsäureanhydrid ist ätzend, verursacht schwere Augenschäden und reizt
  die Atemwege; mit Wasser reagiert es heftig unter Wärmeentwicklung — nie in
  geschlossenen Gefäßen hydrolysieren. Schwefelsäure ist stark ätzend.
  Salicylsäure reizt Haut und Augen; Acetylsalicylsäure ist
  gesundheitsschädlich bei größeren Mengen (Salicylismus).]

*Prüfung auf Reinheit.* Acetylsalicylsäure riecht nach Essigsäure, wenn sie
teilweise hydrolysiert ist; der Gehalt wird durch Titration mit Natronlauge
bestimmt. Ein Gehalt unter 99 % zeigt, daß beim Trocknen zu hoch erhitzt wurde.

*Drei klassische Kondensationen.* Die folgenden Vorschriften zeigen
Reaktionen, die seit dem 19. Jahrhundert in keiner präparativen Sammlung
fehlen: die Perkin-Reaktion, die Claisen-Esterkondensation und die
Schotten-Baumann-Acylierung.

#vorschrift("D.7.6", [Zimtsäure aus Benzaldehyd])[
  #reaktion(
    $ "C" _6"H" _5"CHO" + ("CH"_3"CO")_2"O" $,
    [#text(size: 6.5pt)[NaOAc, 175 °C, 3 h]],
    $ "C" _6"H" _5"CH=CHCOOH" + "CH"_3"COOH" $,
  )

  #ansatz[
    26 g (25 mL; 0,25 mol) Benzaldehyd, 51 g (47 mL; 0,50 mol)
    Acetanhydrid, 25 g (0,25 mol) wasserfreies Natriumacetat.
  ]

  In einem 250-mL-Rundkolben mit Thermometer und aufsteigendem Kühler
  vermischt man Benzaldehyd, Acetanhydrid und Natriumacetat und erhitzt
  3 h auf 170–180 °C (Ölbad). Nach dem Abkühlen gießt man die braune
  Reaktionsmischung in 300 mL Wasser und destilliert den unverbrauchten
  Benzaldehyd mit Wasserdampf ab.

  Den Rückstand löst man in 10 %iger Natriumcarbonat-Lösung, filtriert
  ungelöste Harze ab und fällt die Zimtsäure durch Ansäuern mit
  Salzsäure. Der Niederschlag wird abgesaugt, mit Wasser gewaschen und aus
  Wasser umkristallisiert.

  #ausbeute[20 g (54 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 133 °C (trans-Form) #h(2em) löslich in Ethanol, heißem Wasser
    #h(2em) $M$ = 148,2 g·mol#super[−1] #h(2em)
    Das Produkt ist das Edukt der selektiven Hydrierung in D.4.3.
  ]
]

#gefahr[Benzaldehyd reizt die Atemwege, Acetanhydrid ist ätzend und
  rauchend. Bei 180 °C muß der Kühler sitzen; kein offenes Feuer.
  Natriumacetat wasserfrei einwiegen. Zimtsäure reizt die Schleimhäute.]

#vorschrift("D.7.7", [Ethylacetoacetat aus Ethylacetat])[
  #reaktion(
    $ 2 "CH"_3"COOC"_2"H"_5 $,
    [#text(size: 6.5pt)[Na, 78 °C]],
    $ "CH"_3"COCH"_2"COOC"_2"H"_5 + "C"_2"H"_5"OH" $,
  )

  #ansatz[
    8 g (0,35 mol) Natriumdraht, 100 g (110 mL; 1,2 mol) Ethylacetat
    (wasserfrei).
  ]

  In einem 250-mL-Rundkolben mit Rückflußkühler und Calciumchlorid-Rohr
  wird das wasserfreie Ethylacetat vorgelegt und portionsweise
  Natriumdraht zugegeben; die Reaktion setzt spontan ein. Man erwärmt
  vorsichtig auf 78 °C, bis das Natrium weitgehend gelöst ist (ca. 2 h).

  Nach dem Abkühlen zerstört man den Rest des Natriums vorsichtig mit
  10 mL Eisessig, wobei die Mischung schwach sauer reagiert. Man gibt
  50 mL gesättigte Natriumchlorid-Lösung zu, trennt die obere Phase ab
  und trocknet über Natriumsulfat. Die Reinigung erfolgt durch
  Vakuumdestillation.

  #ausbeute[26 g (57 % d. Th., ber. auf Na) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 181 °C (1013 hPa, Zersetzung) #h(2em) $n_D^20$ = 1,4194
    #h(2em) $rho_20$ = 1,03 g·cm#super[−3] #h(2em)
    $M$ = 130,2 g·mol#super[−1] #h(2em)
    Keto-Enol-Gleichgewicht: ca. 8 % Enol in reiner Substanz.
  ]
]

#gefahr[Natriumdraht ist hochreaktiv und entzündlich; nur mit trockenen
  Händen und Zange handhaben, Rückstände niemals in den Abfall geben,
  sondern vorsichtig mit Ethanol zerstören. Ethylacetat ist leicht
  entzündbar, Acetaldehyd-Verunreinigungen können Peroxide bilden.
  Der Ansatz steht hinter dem Schutzschild.]

#vorschrift("D.7.8", [Acetanilid aus Anilin])[
  #reaktion(
    $ "C" _6"H" _5"NH"_2 + "CH"_3"COCl" $,
    [#text(size: 6.5pt)[NaOH, H#sub[2]O, 0 °C]],
    $ "C" _6"H" _5"NHCOCH"_3 + "HCl" $,
  )

  #ansatz[
    23 g (0,25 mol) Anilin, 22 g (20 mL; 0,28 mol) Acetylchlorid,
    30 g Natriumhydroxid, 100 mL Wasser.
  ]

  In einem 250-mL-Becherglas rührt man Anilin und Natriumhydroxid in
  100 mL Wasser und kühlt auf 0 °C. Das Acetylchlorid wird tropfenweise
  zugegeben, wobei das Acetanilid sofort als weißer Feststoff ausfällt.
  Man rührt 30 min nach, saugt ab und wäscht mit kaltem Wasser.

  Zur Reinigung wird aus Wasser umkristallisiert.

  #ausbeute[27 g (80 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 114 °C #h(2em) löslich in Ethanol, heißem Wasser
    #h(2em) $M$ = 135,2 g·mol#super[−1] #h(2em)
    Typisches Derivat für die Identifizierung von Primärarminen (E.2).
  ]
]

#gefahr[Anilin ist giftig (Methämoglobinbildung); Handschuhe und Brille
  tragen, Hautkontakt sofort vermeiden. Acetylchlorid ist ätzend und raucht
  an feuchter Luft — nur im Abzug dosieren. Die Natronlauge ätzt.]

=== Störungen und ihre Ursachen

#figure(
  table(
    columns: (1.3fr, 1.3fr, 1.2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Störung*], [*Ursache*], [*Abhilfe*]),
    [Aldol: polymeres Harz], [Base zu stark, zu hohe Temperatur], [verdünnte Lauge, 0 °C],
    [Perkin: harzige Masse], [über 180 °C, Acetanhydrid verbraucht], [Temperatur halten, Anhydrid nachdosieren],
    [Veresterung: Gleichgewicht liegt links], [Wasser im Ansatz], [Molekularsieb, Benzol-Wasser-Abspaltung],
    [Claisen: keine Umsetzung], [Natrium oxidiert, Ethylacetat feucht], [frisches Natrium, Ester über CaCl#sub[2]],
    [Schotten-Baumann: öliges Produkt], [zu wenig Base, Acetylchlorid-Überschuß], [Base nachgeben, umkristallisieren],
  ),
  caption: [Typische Störungen bei Carbonyl-Kondensationen.],
) <tab:stoerungen-carbonyl>

=== Aufgaben

- Ordnen Sie die folgenden Verbindungen nach ihrer Reaktivität gegenüber
  Methanol: Acetylchlorid, Essigsäureanhydrid, Ethylacetat, Acetamid, Aceton.
- Warum gelingt die Acetalisierung von Aceton mit Methanol nur unter
  Wasserentzug, die von Chloral dagegen schon bei Raumtemperatur?
- Formulieren Sie die Synthese von 4-Phenylbut-3-en-2-on aus Benzaldehyd und
  Aceton und geben Sie an, welche Nebenprodukte entstehen können.
- Warum wird bei der Acylierung von Salicylsäure Schwefelsäure zugesetzt, obwohl
  die Reaktion ohne Katalysator auch abläuft?
- Ein Ester soll in ein Amid überführt werden. Welchen Weg wählen Sie, wenn der
  Ester eine säureempfindliche Gruppe trägt?
- Ordnen Sie die vier Derivate Acetylchlorid, Acetamid, Ethylacetat und
  Essigsäureanhydrid nach ihrer Hydrolysegeschwindigkeit in Wasser.
- Erklären Sie den Mechanismus der Perkin-Reaktion und begründen Sie, warum
  nur das trans-Isomer entsteht.
- Warum muß bei der Schotten-Baumann-Acylierung die Base im Überschuß
  vorliegen?
- Berechnen Sie die Atomökonomie der Claisen-Esterkondensation und
  vergleichen Sie mit der Veresterung.
