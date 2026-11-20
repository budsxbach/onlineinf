// ============================================================================
//  Anhang: Abkürzungen, Konstanten, Register
// ============================================================================

#import "/vorlage/layout.typ": *

== Abkürzungen und Zeichen

#figure(
  table(
    columns: (auto, 1fr, auto, 1fr),
    inset: (x: 5pt, y: 2.8pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Zeichen*], [*Bedeutung*], [*Zeichen*], [*Bedeutung*]),
    [Ac], [Acetyl], [LDA], [Lithiumdiisopropylamid],
    [Ar], [Aryl], [m-CPBA], [3-Chlorperoxybenzoesäure],
    [Bn], [Benzyl], [NBS], [N-Bromsuccinimid],
    [Bu], [Butyl], [NMO], [N-Methylmorpholin-N-oxid],
    [Bz], [Benzoyl], [PCC], [Pyridiniumchlorochromat],
    [DCM], [Dichlormethan], [PDC], [Pyridiniumdichromat],
    [DDQ], [2,3-Dichlor-5,6-dicyanbenzochinon], [Ph], [Phenyl],
    [DIBAL-H], [Diisobutylaluminiumhydrid], [Pr], [Propyl],
    [DMAP], [4-Dimethylaminopyridin], [RT], [Raumtemperatur],
    [DMF], [Dimethylformamid], [TBS], [tert-Butyldimethylsilyl],
    [DMSO], [Dimethylsulfoxid], [THF], [Tetrahydrofuran],
    [ee], [enantiomeric excess], [TMS], [Trimethylsilyl],
    [Et], [Ethyl], [Ts], [Tosyl],
    [Kat.], [Katalysator], [Z], [Benzyloxycarbonyl],
  ),
  caption: [Abkürzungen, wie sie in den Vorschriften verwendet werden.],
) <tab:abkuerzungen>

#figure(
  table(
    columns: (auto, 1fr, auto, 1fr),
    inset: (x: 5pt, y: 2.8pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Symbol*], [*Bedeutung*], [*Einheit*], [*Bemerkung*]),
    [$rho$], [Dichte], [g·cm⁻³], [auf 20 °C bezogen],
    [$n_D^20$], [Brechungsindex], [—], [Natrium-D-Linie, 20 °C],
    [$alpha$], [spezifische Drehung], [°·mL·g⁻¹·dm⁻¹], [bei 589 nm],
    [$Delta H$], [Reaktionsenthalpie], [kJ·mol⁻¹], [Druck konstant],
    [$Delta G$], [freie Enthalpie], [kJ·mol⁻¹], [Standardbedingungen],
    [$E_A$], [Aktivierungsenergie], [kJ·mol⁻¹], [Arrhenius],
    [$k$], [Geschwindigkeitskonstante], [s⁻¹ bzw. L·mol⁻¹·s⁻¹], [Ordnung beachten],
    [$K$], [Gleichgewichtskonstante], [—], [thermodynamisch],
    [pK#sub[a]], [Säureexponent], [—], [in Wasser, 25 °C],
    [$sigma$], [Hammett-Konstante], [—], [substituentenabhängig],
    [$rho$], [Reaktionskonstante], [—], [reaktionsabhängig],
    [$delta$], [chemische Verschiebung], [ppm], [NMR],
    [$nu tilde$], [Wellenzahl], [cm⁻¹], [IR],
  ),
  caption: [Formelzeichen und Einheiten.],
) <tab:formelzeichen>

== Konstanten und Umrechnungen

#figure(
  table(
    columns: (1.6fr, auto, 2fr),
    inset: (x: 5pt, y: 3.0pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Größe*], [*Wert*], [*Bemerkung*]),
    [Gaskonstante $R$], [8,314 J·mol⁻¹·K⁻¹], [0,08206 L·atm·mol⁻¹·K⁻¹],
    [Avogadro-Konstante], [6,022·10²³ mol⁻¹], [Teilchen pro Mol],
    [Faraday-Konstante], [96 485 C·mol⁻¹], [Elektrolyse],
    [Normdruck], [1013,25 hPa], [1 atm = 760 Torr],
    [Normtemperatur], [273,15 K], [0 °C],
    [Molvolumen (Gas)], [22,414 L·mol⁻¹], [bei 0 °C und 1013 hPa],
    [Atommasse C], [12,011], [relativ],
    [Elektronenladung], [1,602·10⁻¹⁹ C], [Elementarladung],
  ),
  caption: [Naturkonstanten für Rechnungen im Praktikum.],
) <tab:konstanten>

#figure(
  table(
    columns: (auto, 1fr, auto, 1fr),
    inset: (x: 5pt, y: 2.8pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Einheit*], [*Umrechnung*], [*Einheit*], [*Umrechnung*]),
    [1 bar], [10⁵ Pa], [1 cal], [4,184 J],
    [1 atm], [1,013 bar], [1 eV], [96,5 kJ·mol⁻¹],
    [1 Torr], [1,333 mbar], [1 ppm], [1 mg·kg⁻¹],
    [1 Å], [0,1 nm], [1 %], [10 g·L⁻¹],
    [1 kWh], [3,6 MJ], [1 M], [1 mol·L⁻¹],
  ),
  caption: [Umrechnungen, die im Labor gebraucht werden.],
) <tab:umrechnungen>

== Sicherheitsabkürzungen im Text

In den Vorschriften werden Gefahrenhinweise abgekürzt. Die folgende Liste ordnet
die Kürzel den vollständigen Angaben zu; die vollständigen Sätze stehen in
Tabelle G.3 und G.4.

#figure(
  table(
    columns: (auto, 1fr),
    inset: (x: 5pt, y: 3.0pt),
    align: (left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Kürzel*], [*Bedeutung im Text*]),
    [ätzend], [verursacht Verätzungen, Schutzbrille und Säurehandschuhe],
    [entzündbar], [Flammpunkt unter 60 °C, Zündquellen fernhalten],
    [giftig], [H301/H311/H331, Mengen minimieren, Abzug],
    [krebserzeugend], [H350, Substitution prüfen, geschlossenes System],
    [sensibilisierend], [H317, Handschuhe, Hautkontakt vermeiden],
    [umweltgefährlich], [H400/H411, nicht in den Abfluß],
    [explosiv], [Peroxide, Azide, Druckgefäße, Schutzeinrichtung],
  ),
  caption: [Kürzel in den Gefahrenhinweisen der Vorschriften.],
) <tab:sicherheitskuerzel>

== Sachregister

Die Zahlen bezeichnen das Kapitel, in dem das Stichwort ausführlich behandelt
wird. Verwandte Stichwörter stehen jeweils im Text des angegebenen Kapitels.

#figure(
  table(
    columns: (1fr, auto, 1fr, auto),
    inset: (x: 5pt, y: 2.6pt),
    align: (left, right, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Stichwort*], [*Kap.*], [*Stichwort*], [*Kap.*]),
    [3-Bromcyclohexen], [D.1.6], [Absolutierung], [F.1.4],
    [Abzug], [G.2], [Acetanilid], [D.7.8],
    [Acetylid], [D.3.5], [Acetylsalicylsäure], [D.7.5],
    [Aktivierungsenergie], [C.3.2], [Aldolreaktion], [D.7.3],
    [Alkine], [D.3.5], [Alkohole, Oxidation], [D.6.2],
    [Allylphenylether], [D.9.5], [Amine, Nachweis], [E.1.3],
    [Ammoniumthiocyanat], [D.8.5], [Analyse, elementar], [E.1.1],
    [Anilin], [D.5.5], [Anti-Markownikoff-Addition], [D.1.7],
    [Aromaten], [D.5], [Arrhenius-Gleichung], [C.3.2],
    [Atemschutz], [G.2.2], [Ausbeute], [A.2.10],
    [Autokatalyse], [C.3.1], [Autoxidation], [D.1.6],
    [Azeotrop], [A.2.2], [Azokupplung], [D.5.1],
    [Beckmann-Umlagerung], [D.9.3], [Beilstein-Probe], [E.1.1],
    [Benzilsäure-Umlagerung], [D.7.4], [Benzoin-Kondensation], [D.7.3],
    [Benzolsulfonsäure], [D.5.7], [Benzoylperoxid], [D.1.5],
    [Bindungsenergie], [C.2.1], [Birch-Reduktion], [D.5.3],
    [Brandklasse], [G.3.2], [Brechungsindex], [A.4.4],
    [Bromierung, Seitenkette], [D.1.2], [Caprolactam], [D.9.3],
    [Carbamat], [D.8.4], [Carbonsäurederivate], [D.7.6],
    [Chalcon], [B.7], [chemische Verschiebung], [E.2.3],
    [Chlorierung], [D.1.3], [Chromatographie], [A.2.8],
    [CIP-Regeln], [C.5.2], [Claisen-Esterkondensation], [D.7.7],
    [Claisen-Kondensation], [D.7.3], [Claisen-Umlagerung], [D.9.5],
    [Cope-Umlagerung], [D.9.5], [Cyclohexenoxid], [D.4.8],
    [Cyclopropanon], [D.9.6], [Dampfdruck], [A.4.2],
    [Dehydratisierung], [D.3.4], [Derivate], [E.2.1],
    [Derivatisierung], [E.2.1], [Destillation], [A.2.1],
    [Detektionsmittel], [E.1.4], [Diastereomere], [C.7],
    [Diazoniumsalze], [D.5.2], [Diazotierung], [D.5.9],
    [Diels-Alder], [D.4.7], [Diels-Alder-Reaktion], [D.4.9],
    [Dihydroxylierung], [D.4.6], [Dünnschichtchromatographie], [A.2.8],
    [Durchbruchzeit], [G.2.2], [Elementaranalyse], [A.4.6],
    [Eliminierung], [D.3], [Enantiomere], [C.7],
    [Enantiomerenüberschuß], [C.7], [Enolate], [D.7.3],
    [Entsorgung], [G.3.3], [Epoxidierung], [D.4.6],
    [Erste Hilfe], [G.3.1], [Esterpyrolyse], [D.3.7],
    [Ethersynthese], [D.2.7], [Extraktion], [A.2.5],
    [Favorskii-Umlagerung], [D.9.6], [Fehlerquellen], [E.1.8],
    [Fehling-Lösung], [E.1.3], [Finkelstein-Reaktion], [D.2.4],
    [Fragmentierung], [E.2.4], [Friedel-Crafts], [D.5.1],
    [Friedel-Crafts-Acylierung], [D.5.8], [Fries-Umlagerung], [D.9.6],
    [Gefährdungsbeurteilung], [G.1.4], [Gefrierniedrigung], [A.4.6],
    [Gefrierpunkt], [A.4.1], [Gefriertrocknung], [A.2.7],
    [Gegenprobe], [E.1.8], [GHS], [G.1.1],
    [Glasreinigung], [A.1.11], [Grignard], [F.2.1],
    [Grignard-Addition], [D.7.9], [Grundausstattung], [A.1.12],
    [Halbwertszeit], [C.3.1], [Hammett], [C.5],
    [Handschuh], [G.2.2], [Harnstoff], [D.8.4],
    [Henderson-Hasselbalch], [C.4], [Hofmann-Abbau], [D.9.4],
    [Hofmann-Produkt], [D.3.6], [Hydrazon], [D.7.5],
    [Hydrierung], [D.4.4], [Hydroborierung], [D.4.5],
    [Hydroxylierung], [D.6.5], [Hydrozimtsäure], [D.4.3],
    [Imin], [D.8.2], [Inertgas], [A.1.8],
    [Inhibitor], [D.1.5], [], [],
  ),
  caption: [Sachregister, Teil 1: A–K.],
)

#pagebreak(weak: true)

#figure(
  table(
    columns: (1fr, auto, 1fr, auto),
    inset: (x: 5pt, y: 2.6pt),
    align: (left, right, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Stichwort*], [*Kap.*], [*Stichwort*], [*Kap.*]),
    [Iodoform-Probe], [E.1.3], [Ionenpaar], [D.2.2],
    [IR-Spektroskopie], [E.2.2], [Isobutan, Chlorierung], [D.1.2],
    [Isocyanat], [D.8.4], [Kaliumpermanganat], [D.6.5],
    [Kältemischung], [A.1.9], [Kältemittel], [A.1.9],
    [Karl Fischer], [F.1.4], [Katalyse], [C.3],
    [Katalyse, Phasentransfer], [C.3.3], [Kernresonanz], [E.2.3],
    [Kristallisation], [A.2.6], [Kryoskopie], [A.4.6],
    [Kucherov-Reaktion], [D.4.8], [Lacton], [D.9.6],
    [Leitfähigkeit], [C.3.2], [Lindlar-Katalysator], [D.4.4],
    [Literaturrecherche], [B.7], [Löslichkeitsschema], [E.1.2],
    [Lösungsmittel], [F.1], [Lösungsmittelauswahl], [F.1.1],
    [Markownikoff-Regel], [D.4.2], [Massenspektrometrie], [E.2.4],
    [Mehrstufensynthese], [C.8.1], [Metallierung], [F.2.1],
    [Mikromaßstab], [A.3.1], [Mischprobe], [E.1.8],
    [Molekularsieb], [F.1.2], [Musterprotokoll], [B.8],
    [Neopentyl], [D.2.2], [Ninhydrin], [E.1.4],
    [Nitrierung], [D.5.1], [Nitrobenzol], [D.5.1],
    [NMR-Spektroskopie], [E.2.3], [Nomenklatur], [B.5],
    [Normschliff], [A.1.4], [Nucleophile Substitution], [D.2],
    [Optische Drehung], [A.4.5], [Oxidation], [D.6],
    [Oxidation, Baeyer-Villiger], [D.9.6], [Oxim], [D.7.5],
    [Oxy-Cope-Umlagerung], [D.9.5], [Ozonolyse], [D.6.6],
    [PCC], [D.6.2], [Peressigsäure], [D.9.6],
    [Perkin-Kondensation], [D.7.6], [Peroxide], [F.1.3],
    [pH-Wert], [C.4], [Phenol], [D.5.3],
    [Phenylacetylen], [D.3.4], [Phosphoroxychlorid], [D.3.5],
    [Polymerisation], [D.1.5], [Polystyrol], [D.1.4],
    [Protokoll], [B.8], [Protokollbewertung], [B.8],
    [Puffer], [C.4], [Racematspaltung], [C.7],
    [Reaktionsordnung], [C.3.1], [Recherche], [B.7],
    [Reduktion], [D.5.3], [Reduktive Aminierung], [D.8.2],
    [Rückfluß], [A.1.5], [Sandmeyer-Reaktion], [D.5.2],
    [Säurechloride], [D.7.4], [Schlenk-Technik], [A.1.8],
    [Schmelzpunkt], [A.4.1], [Schmelzpunktstandard], [A.4.1],
    [Schutzgruppe], [C.8.1], [Siedepunkt], [A.4.2],
    [sigmatrope Umlagerung], [D.9.5], [Solvolyse], [D.2.2],
    [Soxhlet-Extraktion], [A.2.5], [Spektroskopie, IR], [E.2.2],
    [Standardapparaturen], [A.1.5], [Stereoisomerie], [C.7],
    [Stereoselektivität], [C.7], [Stickstoff, flüssig], [A.1.9],
    [Störfall], [G.3.3], [Sublimation], [A.2.4],
    [Substitution, aromatisch], [D.5.1], [Sulfonierung], [D.5.1],
    [Terephthalsäure], [D.6.7], [tert-Butylbromid], [D.2.8],
    [Thioharnstoff], [D.8.5], [Thionylchlorid], [D.2.9],
    [Triphenylmethanol], [D.7.9], [Trockenmittel], [F.1.2],
    [Trocknungsmittel], [F.1.2], [Umlagerung], [D.9],
    [Umlagerung, Beckmann], [D.9.3], [Umlagerung, Pinakol], [D.9.2],
    [UV-Spektrum], [E.2.5], [Vakuumdestillation], [A.2.4],
    [Valenzschwingungen], [E.2.2], [Veresterung], [D.7.4],
    [Vorprobe], [E.1.1], [Walden-Umkehr], [C.7],
    [Wasserbad], [A.1.9], [Wasserdampfdestillation], [A.2.3],
    [Williamson-Ethersynthese], [D.2.7], [Wittig-Reaktion], [D.8.6],
    [Wöhler-Synthese], [D.8.4], [Zeitgesetz], [C.3.1],
    [Zersetzung], [A.2.10], [Zinkchlorid], [D.2.3],
    [Zweiphasensystem], [A.2.5], [], [],
  ),
  caption: [Sachregister, Teil 2: L–Z.],
)
