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

Die Zahlen bezeichnen die Kapitel, in denen das Stichwort behandelt wird. Ein
Stichwort kann in mehreren Kapiteln erscheinen; die erste Nennung ist die
ausführliche.

#figure(
  table(
    columns: (1fr, auto, 1fr, auto),
    inset: (x: 5pt, y: 2.6pt),
    align: (left, right, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Stichwort*], [*Kap.*], [*Stichwort*], [*Kap.*]),
    [Abzug], [G.2], [Kältemischung], [A.1.7],
    [Aldolreaktion], [D.7.3], [Katalyse], [C.3],
    [Alkine], [D.3.5], [Kernresonanz], [E.2.3],
    [Alkohole, Oxidation], [D.6.2], [Kristallisation], [A.2.5],
    [Amine, Nachweis], [E.1.3], [Löslichkeitsschema], [E.1.2],
    [Analyse, elementar], [E.1.1], [Lösungsmittel], [F.1],
    [Aromaten], [D.5], [Massenspektrometrie], [E.2.4],
    [Ausbeute], [A.2.8], [Metallierung], [F.2.1],
    [Azokupplung], [D.5.1], [Mikromaßstab], [A.3.1],
    [Beckmann-Umlagerung], [D.9.3], [Nomenklatur], [B.5],
    [Beilstein-Probe], [E.1.1], [Nucleophile Substitution], [D.2],
    [Bindungsenergie], [C.2.1], [Optische Drehung], [A.4.5],
    [Brechungsindex], [A.4.4], [Oxidation], [D.6],
    [Chromatographie], [A.2.7], [Peroxide], [F.1.3],
    [Claisen-Kondensation], [D.7.3], [Phenol], [D.5.3],
    [Dampfdruck], [A.4.2], [pH-Wert], [C.4],
    [Dehydratisierung], [D.3.4], [Protokoll], [B.7],
    [Derivate], [E.2.1], [Racematspaltung], [C.7],
    [Destillation], [A.2.1], [Reduktion], [D.6.3],
    [Diazoniumsalze], [D.5.2], [Rückfluß], [A.1.4],
    [Diels-Alder], [D.4.7], [Säurechloride], [D.7.4],
    [Dihydroxylierung], [D.4.6], [Schmelzpunkt], [A.4.1],
    [Eliminierung], [D.3], [Siedepunkt], [A.4.2],
    [Enolate], [D.7.3], [Spektroskopie, IR], [E.2.2],
    [Epoxidierung], [D.4.6], [Stereoisomerie], [C.7],
    [Erste Hilfe], [G.3], [Stickstoff, flüssig], [A.1.7],
    [Extraktion], [A.2.4], [Substitution, aromatisch], [D.5.1],
    [Fehling-Lösung], [E.1.3], [Sublimation], [A.2.3],
    [Friedel-Crafts], [D.5.1], [Sulfonierung], [D.5.1],
    [Gefährdungsbeurteilung], [G.1.4], [Trockenmittel], [F.1.2],
    [Gefrierpunkt], [A.4.1], [Umlagerung], [D.9],
    [GHS], [G.1.1], [Vakuumdestillation], [A.2.3],
    [Grignard], [F.2.1], [Veresterung], [D.7.4],
    [Hammett], [C.5], [Vorprobe], [E.1.1],
    [Handschuh], [G.2.2], [Walden-Umkehr], [C.7],
    [Hydrierung], [D.4.4], [Wasserbad], [A.1.7],
    [Hydroborierung], [D.4.5], [Wasserdampfdestillation], [A.2.2],
    [Imin], [D.8.2], [Zersetzung], [A.5.2],
    [Iodoform-Probe], [E.1.3], [Zinkchlorid], [D.2.3],
    [Kältemittel], [A.1.7], [Zweiphasensystem], [A.2.4],
  ),
  caption: [Sachregister mit Kapitelverweisen.],
) <tab:register>
