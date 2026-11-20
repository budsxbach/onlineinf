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

=== Aufgaben

- Ordnen Sie die folgenden Verbindungen nach ihrer Reaktivität gegenüber
  Methanol: Acetylchlorid, Essigsäureanhydrid, Ethylacetat, Acetamid, Aceton.
- Warum gelingt die Acetalisierung von Aceton mit Methanol nur unter
  Wasserentzug, die von Chloral dagegen schon bei Raumtemperatur?
- Formulieren Sie die Synthese von 4-Phenylbut-3-en-2-on aus Benzaldehyd und
  Aceton und geben Sie an, welche Nebenprodukte entstehen können.
