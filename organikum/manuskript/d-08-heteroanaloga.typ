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

=== Aufgaben

- Warum läßt sich Cyclohexanon mit Ammoniak nicht zum Imin umsetzen, mit
  Hydroxylamin aber leicht zum Oxim?
- Erklären Sie, weshalb die Cyanid-Substitution bei tertiären Halogeniden
  versagt, und geben Sie ein Beispiel für ein Substrat, bei dem sie gut
  funktioniert.
- Formulieren Sie die Synthese von N-Methylbenzylamin aus Benzaldehyd und
  Methylamin.
