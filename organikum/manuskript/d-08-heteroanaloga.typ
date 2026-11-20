// ============================================================================
//  D.8  Weitere heteroanaloge Carbonylverbindungen
// ============================================================================

#import "/vorlage/layout.typ": *

== Weitere heteroanaloge Carbonylverbindungen

Ersetzt man den Carbonylsauerstoff durch Schwefel oder Stickstoff, entstehen
Verbindungsklassen mit eigener Chemie: Thiocarbonyle sind nucleophiler und
weicher, Imine und Nitrile reagieren an anderer Stelle als Carbonyle. Für die
Synthese sind sie unentbehrlich, weil sie Reaktionen erlauben, die am Carbonyl
nicht möglich sind.

=== Thiocarbonylverbindungen

*Thioaldehyde und Thioketone* sind instabil und neigen zur Dimerisierung; sie
werden in situ erzeugt und sofort umgesetzt. *Thioamide* dagegen sind stabil und
kristallisieren gut; sie dienen als Zwischenstufen für Heterocyclen
(Thiazole, Thiophene) und als Schwefelquelle.

*Thioharnstoff* entsteht aus Harnstoff und Phosphorpentasulfid oder aus
Ammoniumthiocyanat beim Erhitzen. Er ist der Ausgangspunkt für Guanidine und
für die Thiohydantoin-Bildung, die in der Peptidsequenzierung verwendet wurde.

$ "CS(NH" _2")" _2 + 2 "NH" _3 -> "C(NH" _2")" _2 + "S"^"2−" $

*Dithiocarbamate* entstehen aus Aminen und Schwefelkohlenstoff. Sie sind
Schwermetallfänger (Diethyldithiocarbamat, DDTC) und Vulkanisationsbeschleuniger;
in der Analytik dienen sie der fotometrischen Bestimmung von Kupfer.

*Xanthogenate* (Alkyldithiocarbonat-Salze) sind Zwischenstufen der
Viskose-Herstellung und Ausgangsmaterial für die Barton-McCombie-Desoxygenierung.

=== Imine und Enamine

*Iminbildung* ist eine Gleichgewichtsreaktion; das Wasser muß entfernt werden
(Molekularsieb, azeotrope Destillation). Mit reinen Aminen lassen sich Imine
isolieren; mit Ammoniak entstehen oft Polymere.

$ "R" _2"C=O" + "R'NH" _2 <-> "R" _2"C=NR'" + "H" _2"O" $

Die Reaktion hat drei präparative Anwendungen:

- *Reduktive Aminierung*: Imin und Reduktionsmittel in einem Topf (NaBH#sub[3]CN,
  Natriumtriacetoxyborhydrid). Aus Keton und primärem Amin entsteht ein
  sekundäres Amin.
- *Imin-Enamin-Tautomerie*: Aus sekundären Aminen entstehen Enamine, die als
  Nucleophile in Michael-Additionen und in der Stork-Enamin-Synthese dienen.
- *Chirale Auxiliare*: Aus (R)- oder (S)-α-Methylbenzylamin entstehen chirale
  Imine, deren Hydrierung diastereoselektiv verläuft.

*Imin-Hydrolyse* ist die Umkehr; sie läuft im Sauren schnell ab. Wer ein Imin
aufbewahren will, hält es trocken und im Dunkeln.

*Oxime* entstehen mit Hydroxylamin; sie sind kristallin und dienen der
Identifizierung. Die Beckmann-Umlagerung (siehe D.9) nutzt sie zur
Ringverengung und -erweiterung.

#figure(
  table(
    columns: (1.4fr, 1.3fr, 1.5fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verbindungsklasse*], [*Synthese*], [*Verwendung*]),
    [Imin], [Carbonyl + primäres Amin], [Reduktive Aminierung, Auxiliar],
    [Enamin], [Carbonyl + sekundäres Amin], [Nucleophil, Stork-Reaktion],
    [Oxim], [Carbonyl + Hydroxylamin], [Identifizierung, Beckmann],
    [Hydrazon], [Carbonyl + Hydrazin], [Fischer-Indol, Wolff-Kishner],
    [Semicarbazon], [Carbonyl + Semicarbazid], [Identifizierung],
    [Nitron], [Aldehyd + Nitron], [1,3-dipolare Cycloaddition],
  ),
  caption: [Stickstoffanaloge Carbonylverbindungen. Alle entstehen durch
    Kondensation und sind hydrolyseempfindlich.],
) <tab:stickstoffanaloga>

=== Nitrile

Nitrile sind Carbonsäurederivate mit Stickstoff als Heteroatom: Sie lassen sich
zu Carbonsäuren hydrolysieren, zu Aminen reduzieren und am α-Kohlenstoff
alkylieren. Der große Vorteil gegenüber Carbonsäuren ist die CH-Acidität der
α-Position (pK#sub[a] ≈ 25), die eine C–C-Verknüpfung erlaubt.

$ "R–X" + "NaCN" -> "R–CN" + "NaX" $

Die Cyanid-Substitution ist der klassische Kettenaufbau um ein Kohlenstoffatom —
aber nur für primäre und sekundäre Halogenide, weil mit tertiären Substraten
Eliminierung dominiert.

*Hydrolyse.* Nitrile hydrolysieren im Sauren oder Basischen über das Amid zur
Carbonsäure. Die basische Hydrolyse braucht längeres Kochen; die saure ist
schonender, kann aber die entstehende Säure amidieren.

*Reduktion.* LiAlH#sub[4] reduziert Nitrile zu primären Aminen; die Hydrierung an
Raney-Nickel ist die technische Variante.

*α-Alkylierung.* Mit LDA entsteht das Nitrilcarbanion, das mit Halogeniden oder
Carbonylen reagiert. Die Reaktion ist die Grundlage der Synthese von
2-Arylpropionsäuren (Ibuprofen-Typ).

#vorschrift("D.8.1", [Benzonitril aus Brombenzol])[
  #reaktion(
    $ "C" _6"H" _5"Br" + "CuCN" $,
    [#text(size: 6.5pt)[DMF, 150 °C]],
    $ "C" _6"H" _5"CN" + "CuBr" $,
  )

  #ansatz[
    157 g (105 mL; 1,0 mol) Brombenzol, 98 g (1,1 mol) Kupfer(I)-cyanid,
    300 mL Dimethylformamid.
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Rückflußkühler und Thermometer werden
  Brombenzol, Kupfer(I)-cyanid und Dimethylformamid vorgelegt. Man erhitzt unter
  Rühren auf 150 °C und hält diese Temperatur 6 h; die Suspension färbt sich
  dunkel.

  Nach dem Abkühlen gießt man auf 1 L Wasser und extrahiert dreimal mit je
  100 mL Ether. Die vereinigten Extrakte werden mit Wasser und gesättigter
  Kochsalzlösung gewaschen, über Magnesiumsulfat getrocknet und das
  Lösungsmittel abdestilliert.

  Das Rohprodukt wird im Vakuum über eine Vigreux-Kolonne fraktioniert; die bei
  95–98 °C (20 hPa) übergehende Fraktion ist reines Benzonitril.

  #ausbeute[88 g (86 % d. Th.) farblose Flüssigkeit mit bittermandelartigem
  Geruch.]

  #kenndaten[
    Sdp. 191 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5289 #h(2em)
    $rho_20$ = 1,001 g·cm#super[−3]
  ]
]

#gefahr[Kupfer(I)-cyanid ist giftig und setzt mit Säuren Blausäure frei; niemals
  mit Säuren in Berührung bringen. Dimethylformamid ist gesundheitsschädlich und
  wird über die Haut aufgenommen; im Abzug arbeiten. Benzonitril ist giftig und
  reizt die Augen. Cyanidabfälle getrennt sammeln und mit Natriumhypochlorit
  oxidieren.]

*Entsorgung von Cyanidabfällen.* Cyanidhaltige Lösungen werden mit
Natriumhypochlorit bei pH 10–11 oxidiert (Cyanat), erst danach dürfen sie in den
Abwasserstrom. Die Zugabe von Säure zu Cyanidabfällen ist die häufigste Ursache
von Blausäureunfällen im Labor.

#vorschrift("D.8.2", [N-Benzylidenanilin aus Benzaldehyd und Anilin])[
  #reaktion(
    $ "C" _6"H" _5"CHO" + "C" _6"H" _5"NH" _2 $,
    [#text(size: 6.5pt)[EtOH, Rückfluß, Wasserabscheider]],
    $ "C" _6"H" _5"CH=NC" _6"H" _5 + "H" _2"O" $,
  )

  #ansatz[
    106 g (101 mL; 1,0 mol) Benzaldehyd, 93 g (91 mL; 1,0 mol) Anilin,
    300 mL Ethanol.
  ]

  In einem 1-l-Rundkolben mit Wasserabscheider und Rückflußkühler werden
  Benzaldehyd, Anilin und Ethanol vorgelegt. Man erhitzt zum Sieden und trennt
  das übergehende Wasser im Abscheider ab, bis keine Wasserabscheidung mehr
  erfolgt (etwa 1,5 h).

  Man engt die Lösung auf 150 mL ein, kühlt auf 0 °C und saugt die ausfallenden
  Kristalle ab. Zur Reinigung wird aus Ethanol umkristallisiert; das Produkt
  wird unter Stickstoff im Dunkeln aufbewahrt.

  #ausbeute[163 g (90 % d. Th.) hellgelbe Kristalle.]

  #kenndaten[
    Schmp. 52 °C #h(2em) Sdp. 300 °C (Zersetzung)
  ]
]

#gefahr[Anilin ist giftig, wird über die Haut aufgenommen und steht im Verdacht,
  krebserzeugend zu sein; es verursacht Methämoglobinbildung. Nur im Abzug und
  mit Nitrilhandschuhen arbeiten. Benzaldehyd ist gesundheitsschädlich und
  entzündbar; Ethanol ist leicht entzündbar.]

*Nachweis der Iminbildung.* Das Verschwinden der Carbonylbande im IR
(1705 cm⁻¹) und das Auftreten der C=N-Bande (1640 cm⁻¹) zeigen den Umsatz an.
Reine Imine sind hydrolyseempfindlich; für die Analytik wird das Imin in situ
mit Natriumborhydrid zum Amin reduziert.

#vorschrift("D.8.3", [N-Benzylanilin aus Benzaldehyd und Anilin durch reduktive Aminierung])[
  #reaktion(
    $ "C" _6"H" _5"CHO" + "C" _6"H" _5"NH" _2 $,
    [#text(size: 6.5pt)[1. EtOH, 2. NaBH#sub[4]]],
    $ "C" _6"H" _5"CH" _2"NHC" _6"H" _5 + "H" _2"O" $,
  )

  #ansatz[
    106 g (101 mL; 1,0 mol) Benzaldehyd, 93 g (91 mL; 1,0 mol) Anilin,
    38 g (1,0 mol) Natriumborhydrid, 400 mL Ethanol.
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Thermometer und Tropftrichter werden
  Benzaldehyd und Anilin in 300 mL Ethanol vorgelegt und 1 h bei 40 °C gerührt;
  das Imin bildet sich als gelbe Lösung.

  Man kühlt auf 10 °C und trägt das Natriumborhydrid in kleinen Anteilen so ein,
  daß die Temperatur 25 °C nicht übersteigt (Wasserstoffentwicklung). Danach
  wird 2 h bei Raumtemperatur gerührt.

  Man gießt auf 1 L Eiswasser, saugt das ausfallende Produkt ab, wäscht mit
  Wasser und kristallisiert aus Ethanol um.

  #ausbeute[165 g (84 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 37 °C #h(2em) Sdp. 306 °C
  ]
]

#gefahr[Natriumborhydrid entwickelt mit Wasser und Säuren Wasserstoff; nicht in
  geschlossenen Gefäßen arbeiten. Anilin ist giftig und wird über die Haut
  aufgenommen — Abzug, Handschuhe, Hautkontakt vermeiden. Ethanol ist leicht
  entzündbar.]

=== Kohlensäurederivate

Harnstoff, Phosgen, Carbamate und Isocyanate sind formal Derivate der
Kohlensäure. Präparativ wichtig sind:

- *Harnstoff*: Aus Ammoniak und CO#sub[2] bei 180 °C und 200 bar; im Labor aus
  Ammoniumcyanat beim Erhitzen.
- *Phosgen*: Aus CO und Cl#sub[2] an Aktivkohle; wegen der Giftigkeit nur im
  geschlossenen System oder ersetzt durch Diphosgen/Triphosgen.
- *Carbamate*: Aus Amin und Phosgen oder aus Amin und Kohlensäureester;
  Zwischenstufen für Isocyanate und für Schutzgruppen (Boc, Cbz).
- *Isocyanate*: Aus Amin und Phosgen; sie reagieren mit Alkoholen zu Carbamaten
  und mit Aminen zu Harnstoffen — die Grundlage der Polyurethan-Chemie.

*Biuret-Reaktion.* Harnstoff bildet beim Erhitzen Biuret, das mit Kupfer(II)-Ionen
einen violetten Komplex gibt. Diese Reaktion ist der klassische Nachweis für
Peptidbindungen; sie ist unspezifisch, aber schnell.

=== Schwefel- und Phosphoranaloga

*Sulfonsäuren* und *Sulfonsäureamide* entstehen durch Sulfonierung bzw. durch
Umsetzung von Sulfonylchloriden mit Aminen. Die Sulfonamidgruppe ist in der
Medizinischen Chemie wichtig (Sulfonamide), präparativ dient sie als
Schutzgruppe für Amine, die unter sauren Bedingungen stabil ist und mit Thiolat
oder Natrium in flüssigem Ammoniak entfernt wird.

*Phosphorsäureester* und *Phosphonsäuren* sind in der Biochemie allgegenwärtig.
Präparativ entstehen sie aus Alkoholen und Phosphortrichlorid oder
Phosphoroxychlorid; für die Nucleotidsynthese verwendet man Phosphoramidite.

#figure(
  table(
    columns: (1.5fr, 1.5fr, 1.5fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Klasse*], [*Herstellung*], [*typische Reaktion*]),
    [Sulfonsäure], [Aromat + H#sub[2]SO#sub[4]], [Nucleophile Substitution],
    [Sulfonylchlorid], [Sulfonsäure + SOCl#sub[2]], [Amidbildung],
    [Sulfonamid], [Sulfonylchlorid + Amin], [Schutzgruppe, Abspaltung],
    [Phosphorsäureester], [Alkohol + POCl#sub[3]], [Hydrolyse, Umesterung],
    [Phosphoniumsalz], [Phosphin + Halogenid], [Wittig-Reaktion],
  ),
  caption: [Schwefel- und Phosphoranaloga der Carbonylverbindungen.],
) <tab:heteroanaloga>

*Carbonsäureamide.* Amide entstehen aus Carbonsäuren und Ammoniak über die
Ammoniumsalze, die beim Erhitzen Wasser abspalten, oder aus Säurechloriden mit
Ammoniak. Sie sind die Ausgangsverbindungen für Nitrile (Dehydratisierung mit
P#sub[2]O#sub[5] oder SOCl#sub[2]) und für den Hofmann-Abbau (D.9).

$ "R–COCl" + 2 "NH" _3 -> "R–CONH" _2 + "NH" _4"Cl" $

#vorschrift("D.8.4", [Harnstoff aus Ammoniumcyanat])[
  #reaktion(
    $ "NH" _4"OCN" $,
    [#text(size: 6.5pt)[60–90 °C, Wasser]],
    $ "(NH" _2")" _2"CO" $,
  )

  #ansatz[
    76 g (1,0 mol) Kaliumcyanat, 70 g (1,0 mol) Ammoniumchlorid, 300 mL Wasser.
  ]

  In einem 1-l-Becherglas werden Kaliumcyanat und Ammoniumchlorid in 250 mL
  Wasser gelöst; man erwärmt die Lösung 30 min auf 60 °C. Es entsteht zunächst
  Ammoniumcyanat, das sich langsam zu Harnstoff umlagert.

  Man dampft die Lösung auf 100 mL ein, kühlt auf 0 °C und saugt den Harnstoff
  ab. Das Filtrat enthält Kaliumchlorid; es wird verworfen.

  Das Rohprodukt wird aus Ethanol umkristallisiert (1 g in 10 mL).

  #ausbeute[48 g (80 % d. Th.) farblose Nadeln.]

  #kenndaten[
    Schmp. 133 °C #h(2em) Zers. > 150 °C (Biuret) #h(2em)
    Löslichkeit in Wasser: 108 g in 100 mL (20 °C)
  ]
]

#gefahr[Kaliumcyanat ist gesundheitsschädlich und reizt Haut und Augen; beim
  Ansäuern entsteht Cyanatsäure, die zu CO#sub[2] und NH#sub[3] zerfällt — nicht
  ansäuern. Harnstoff ist nicht als Gefahrstoff eingestuft, zersetzt sich aber
  beim Erhitzen über 150 °C zu Biuret und Ammoniak.]

*Wöhler-Synthese.* Die Umlagerung von Ammoniumcyanat zu Harnstoff (1828) war der
erste Fall, in dem eine Verbindung aus der belebten Natur aus einem anorganischen
Salz hergestellt wurde. Aus heutiger Sicht ist die Reaktion eine
nucleophile Addition des Ammoniaks an die Cyanatsäure; das Zwischenprodukt ist
ein Carbaminsäureamid, das zum Harnstoff tautomerisiert.

*Thio-Analoga.* Aus Ammoniumthiocyanat entsteht beim Erhitzen der Schmelze
Thioharnstoff — die Schwefel-Analoge der Wöhler-Synthese. Thiourea ist der
Ausgangsstoff für Sulfonamide, für Schwermetall-Nachweise und als
Schwefelquelle in der präparativen Chemie; die Carbonyl-Sauerstoffe werden
dabei formal gegen Schwefel ausgetauscht.

#vorschrift("D.8.5", [Thioharnstoff aus Ammoniumthiocyanat])[
  #reaktion(
    $ "NH" _4"SCN" $,
    [#text(size: 6.5pt)[170 °C, Schmelze]],
    $ "H" _2"N–CS–NH" _2 $,
  )

  #ansatz[
    76 g (1,0 mol) Ammoniumthiocyanat.
  ]

  In einem 250-mL-Rundkolben mit Thermometer wird das Ammoniumthiocyanat im
  Ölbad vorsichtig zum Schmelzen gebracht; bei etwa 150 °C schmilzt es, und
  oberhalb von 160 °C beginnt die Umlagerung. Man hält die Schmelze 30 min auf
  170 °C — dabei tritt Ammoniakgeruch auf, und die anfangs klare Schmelze
  wird zähflüssig.

  Die noch warme Schmelze wird in 100 mL heißes Wasser gegossen und gelöst.
  Beim Abkühlen kristallisiert der Thioharnstoff in farblosen Blättchen; man
  saugt ab, wäscht mit wenig kaltem Wasser und trocknet im Exsikkator.

  #ausbeute[61 g (80 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 182 °C (unter Zersetzung) #h(2em) löslich in heißem Wasser,
    schwer löslich in kaltem #h(2em) $M$ = 76,12 g·mol#super[−1]
  ]
]

#gefahr[Ammoniumthiocyanat zersetzt sich oberhalb von 170 °C unter Bildung von
  Blausäure und Schwefelwasserstoff — nur im Abzug arbeiten, die Temperatur
  genau kontrollieren und nie überhitzen. Beim Lösen der Schmelze tritt
  Ammoniak frei. Thiourea ist krebserzeugend verdächtig und wird nur mit
  Handschuhen gehandhabt; die Mutterlaugen werden gesammelt entsorgt.]

*Isocyanate und Carbamate.* Isocyanate entstehen aus Aminen und Phosgen oder aus
Acylaziden (Curtius, D.9). Mit Alkoholen geben sie Carbamate (Urethane), mit
Aminen Harnstoffe, mit Wasser instabile Carbaminsäuren, die zu Amin und CO#sub[2]
zerfallen. Diese Reaktivität ist die Grundlage der Polyurethan-Herstellung und
der Boc-Schutzgruppe, die als *tert*-Butylcarbamat des Amins vorliegt.

*Phosphor als C=C-Baumeister: die Wittig-Reaktion.* Phosphor-Ylide
setzen Carbonylverbindungen in Alkene um — mit präziser Position der
Doppelbindung. Die Reaktion gehört zu den wichtigsten C=C-Knüpfungen und
verdankt ihren Platz im Organikum der Rolle des Phosphors.

#vorschrift("D.8.6", [trans-Stilben aus Benzaldehyd])[
  #reaktion(
    $ "C" _6"H" _5"CHO" + "Ph"_3"P=CHC"_6"H" _5 $,
    [#text(size: 6.5pt)[NaOEt, Ethanol, 78 °C]],
    $ "C" _6"H" _5"CH=CHC"_6"H" _5 + "Ph"_3"P=O" $,
  )

  #ansatz[
    26 g (25 mL; 0,25 mol) Benzaldehyd, 97 g (0,25 mol)
    Benzyltriphenylphosphoniumchlorid, 200 mL Ethanol,
    6 g (0,26 mol) Natrium in 50 mL Ethanol.
  ]

  In einem 500-mL-Rundkolben mit Rückflußkühler löst man das Phosphoniumsalz
  in 200 mL Ethanol und tropft die frisch bereitete Natriumethanolat-Lösung
  zu; die orangefarbene Ylid-Lösung entsteht sofort. Man tropft den
  Benzaldehyd zu und erhitzt 2 h zum Sieden.

  Nach dem Abkühlen saugt man das auskristallisierte Stilben ab, wäscht mit
  kaltem Ethanol und trocknet. Die Mutterlauge wird eingeengt und der
  Rückstand aus Ethanol umkristallisiert.

  #ausbeute[23 g (65 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 124 °C (trans-Isomer) #h(2em) löslich in Chloroform, Benzol
    #h(2em) $M$ = 180,3 g·mol#super[−1] #h(2em)
    Das cis-Isomer (Schmp. 5–6 °C) entsteht nur in Spuren.
  ]
]

#gefahr[Natriumethanolat ist ätzend; Natrium nur in kleinen Stücken und mit
  trockener Zange. Benzaldehyd reizt die Schleimhäute. Triphenylphosphinoxid
  bleibt als Abfall zurück — nicht in den Abfluss. Ethanol ist leicht
  entzündlich.]

=== Störungen und ihre Ursachen

#figure(
  table(
    columns: (1.3fr, 1.3fr, 1.2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Störung*], [*Ursache*], [*Abhilfe*]),
    [Imin zerfällt bei der Aufarbeitung], [pH neutral, zu viel Wasser], [wasserfrei arbeiten, direkt reduzieren],
    [Reduktive Aminierung: sekundäres Amin], [Carbonyl-Überschuß, zu viel H#sub[2]], [Verhältnis 1:1, Druck senken],
    [Wittig: hoher cis-Anteil], [nicht-stabilisiertes Ylid, protische Lösungsmittel], [Ethanol weglassen, THF verwenden],
    [Harnstoff: Ammoniakverlust], [zu stark erhitzt], [Temperatur unter 150 °C halten],
    [Thioharnstoff riecht nach H#sub[2]S], [Zersetzung bei der Isolierung], [nicht übertrocknen, im Abzug lagern],
  ),
  caption: [Typische Störungen bei Stickstoff-, Schwefel- und Phosphorverbindungen.],
) <tab:stoerungen-hetero>

=== Aufgaben

- Warum läßt sich Cyclohexanon mit Ammoniak nicht zum Imin umsetzen, mit
  Hydroxylamin aber leicht zum Oxim?
- Erklären Sie, weshalb die Cyanid-Substitution bei tertiären Halogeniden
  versagt, und geben Sie ein Beispiel für ein Substrat, bei dem sie gut
  funktioniert.
- Formulieren Sie die Synthese von N-Methylbenzylamin aus Benzaldehyd und
  Methylamin.
- Warum lagert sich Ammoniumcyanat zu Harnstoff um, Ammoniumthiocyanat dagegen
  zu Thioharnstoff — und nicht zu einem Isothiocyanat?
- Erklären Sie die unterschiedliche Reaktivität von Carbonsäureamiden und
  Carbonsäureestern gegenüber Nucleophilen.
- Ein Amin soll mit einer Boc-Gruppe geschützt werden. Welches Reagenz wählen
  Sie, und wie wird die Gruppe wieder entfernt?
- Formulieren Sie den Unterschied zwischen der Wöhler-Synthese (D.8.4) und der
  Umlagerung des Ammoniumthiocyanats. Worin stimmen die Mechanismen überein?
- Warum darf die Schmelze beim Thioharnstoff nicht über 180 °C erhitzt werden?
- Ein Thiourea-Derivat soll als Schwermetall-Reagenz eingesetzt werden. Welche
  Strukturmerkmale sind dafür entscheidend?
- Erklären Sie, warum die Wittig-Reaktion mit nicht-stabilisierten Yliden
  bevorzugt das cis-Isomer liefert — und warum hier das trans-Isomer
  überwiegt.
- Vergleichen Sie Wittig-Reaktion und McMurry-Kupplung für die Synthese von
  Stilben.
