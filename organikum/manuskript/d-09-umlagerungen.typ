// ============================================================================
//  D.9  Umlagerungen
// ============================================================================

#import "/vorlage/layout.typ": *

== Umlagerungen

Bei einer Umlagerung ändert sich das Kohlenstoffgerüst, ohne daß Atome hinzukommen
oder wegfallen. Die Reaktion ist präparativ wertvoll, weil sie in einem Schritt
ein neues Skelett aufbaut — und gefährlich, weil sie unkontrolliert abläuft,
sobald ein Carbeniumion entsteht.

=== Systematik

Man ordnet Umlagerungen nach der wandernden Gruppe und nach dem Zwischenzustand:

- *Wanderung zum Elektronenmangelzentrum* (Carbeniumion, Nitren): Wagner-Meerwein,
  Pinakol, Beckmann, Hofmann, Curtius, Schmidt, Baeyer-Villiger.
- *Wanderung zum Elektronenüberschußzentrum* (Carbanion): Stevens, Sommelet-Hauser,
  Favorskii.
- *Sigmatrope Umlagerungen*: Claisen, Cope, Benzidin — konzertiert, mit
  cyclischem Übergangszustand.

#figure(
  table(
    columns: (1.5fr, 1.5fr, 1.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Umlagerung*], [*Substrat*], [*Produkt*]),
    [Wagner-Meerwein], [Carbeniumion], [verzweigtes Skelett],
    [Pinakol], [1,2-Diol], [Keton],
    [Beckmann], [Oxim], [Amid, Lactam],
    [Hofmann], [Amid], [primäres Amin],
    [Curtius], [Acylazid], [Isocyanat, Amin],
    [Schmidt], [Carbonsäure + HN#sub[3]], [Amin],
    [Baeyer-Villiger], [Keton + Peroxycarbonsäure], [Ester, Lacton],
    [Claisen], [Allylvinylether], [γ,δ-ungesättigtes Carbonyl],
    [Cope], [1,5-Dien], [isomeres 1,5-Dien],
    [Favorskii], [α-Halogenketon + Base], [Carbonsäure],
  ),
  caption: [Wichtige Umlagerungen und ihre Substrate. Die Reihenfolge folgt dem
    Mechanismus, nicht der präparativen Bedeutung.],
) <tab:umlagerungen>

=== Wagner-Meerwein- und Pinakol-Umlagerung

Wandert eine Alkyl- oder Arylgruppe von einem Kohlenstoffatom zum benachbarten
Carbeniumion, spricht man von einer Wagner-Meerwein-Umlagerung. Der Übergangszustand
ist cyclisch; die wandernde Gruppe behält ihre Konfiguration.

Die *Pinakol-Umlagerung* ist der wichtigste präparative Fall: Ein 1,2-Diol wird
mit Säure behandelt, ein Hydroxyl wird protoniert und abgespalten, die
Nachbargruppe wandert unter gleichzeitiger Bildung einer Carbonylgruppe.

$ "R"_2"C(OH)–C(OH)R"_2 ->^("H"^+) "R"_2"C–CO–R"_2 $

Die Migrationsfähigkeit folgt der Fähigkeit, ein Carbeniumion zu stabilisieren:
Aryl > H > tertiär > sekundär > primär > Methyl. Bei unsymmetrischen Diolen
wandert deshalb bevorzugt der Arylrest.

#vorschrift("D.9.1", [Pinakolon aus Pinakol])[
  #reaktion(
    $ "C"_6"H"_14"O"_2 $,
    [#text(size: 6.5pt)[H#sub[2]SO#sub[4], 60 °C]],
    $ "C"_6"H"_12"O" + "H"_2"O" $,
  )

  #ansatz[
    118 g (1,0 mol) Pinakol (2,3-Dimethylbutan-2,3-diol), 300 mL 30-prozentige
    Schwefelsäure.
  ]

  In einem 1-l-Rundkolben mit Rückflußkühler und Thermometer werden Pinakol und
  Schwefelsäure vorgelegt. Man erhitzt langsam auf 60 °C; nach dem Auflösen des
  Diols setzt die Umlagerung ein, erkennbar an der Trübung und am Geruch nach
  Campher.

  Man rührt 1 h bei 60 °C, kühlt ab und trennt die organische Phase ab. Sie wird
  mit Wasser und Natriumcarbonatlösung gewaschen, über Magnesiumsulfat getrocknet
  und über eine Vigreux-Kolonne fraktioniert.

  #ausbeute[82 g (82 % d. Th.) farblose Flüssigkeit mit campherartigem Geruch.]

  #kenndaten[
    Sdp. 106 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4030 #h(2em)
    $rho_20$ = 0,851 g·cm#super[−3]
  ]
]

#gefahr[Schwefelsäure ist stark ätzend. Pinakolon ist leicht entzündbar und reizt
  Augen und Atemwege; Dämpfe nicht einatmen, im Abzug arbeiten.]

=== Beckmann-Umlagerung

Oxime lagern sich in Gegenwart von Säuren (H#sub[2]SO#sub[4],
P#sub[2]O#sub[5], SOCl#sub[2], Chlorosulfonsäure) zu Amiden um. Die Gruppe, die
zum Stickstoff *anti* steht, wandert; das Ergebnis ist ein Amid mit einer
Kohlenstoff-Stickstoff-Bindung, die im Substrat nicht existierte.

$ "R–C(=NOH)–R'" ->^("H"^+) "R–CO–NH–R'" $

Präparativ wichtig ist die Ringumwandlung: Aus Cyclohexanonoxim entsteht
ε-Caprolactam, das Monomer für Nylon-6. Aus Cyclododecanonoxim entsteht
Laurinlactam.

#vorschrift("D.9.2", [ε-Caprolactam aus Cyclohexanonoxim])[
  #reaktion(
    $ "C" _6"H" _10"=NOH" $,
    [#text(size: 6.5pt)[H#sub[2]SO#sub[4], 120 °C]],
    $ "C" _6"H" _11"NO" $,
  )

  #ansatz[
    113 g (1,0 mol) Cyclohexanonoxim, 400 mL konzentrierte Schwefelsäure (98 %).
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Thermometer und Tropftrichter wird die
  Schwefelsäure vorgelegt und auf 80 °C erwärmt. Man trägt das Oxim in kleinen
  Anteilen so ein, daß die Temperatur 120 °C nicht übersteigt (stark exotherm).

  Nach beendeter Zugabe rührt man 30 min bei 120 °C, kühlt auf 20 °C und gießt
  auf 1 kg Eis. Die saure Lösung wird mit Ammoniak auf pH 8 gestellt und mit
  Dichlormethan extrahiert (viermal 100 mL).

  Die vereinigten Extrakte werden über Magnesiumsulfat getrocknet, das
  Lösungsmittel abdestilliert und das Lactam im Vakuum destilliert.

  #ausbeute[96 g (85 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 69 °C #h(2em) Sdp. 139 °C (13 hPa) #h(2em) Reinheit > 98 %
  ]
]

#gefahr[Konzentrierte Schwefelsäure ist stark ätzend; bei der Umlagerung entsteht
  Wärme — Zugabe langsam, Kühlung bereit halten. Caprolactam reizt Augen und
  Atemwege. Ammoniak ist giftig und ätzend; Zusatz nur im Abzug.]

*Beweis der Konfiguration.* Die Beckmann-Umlagerung ist stereospezifisch: Nur
das *anti*-ständige Alkyl wandert. Damit läßt sich die Konfiguration eines
Oxims bestimmen — oder, bei bekanntem Oxim, gezielt ein Amid synthetisieren.

=== Hofmann-, Curtius- und Schmidt-Abbau

Alle drei Reaktionen verkürzen eine Kohlenstoffkette um ein Atom unter Bildung
eines Amins.

*Hofmann-Abbau.* Ein Amid wird mit Brom in wäßriger Natronlauge umgesetzt; es
entsteht ein Isocyanat, das zum Amin hydrolysiert.

$ "R–CONH" _2 + "Br" _2 + 4 "NaOH" -> "R–NH" _2 + "Na" _2"CO" _3 + 2 "NaBr" + 2 "H" _2"O" $

*Curtius-Abbau.* Ein Acylazid zerfällt beim Erwärmen zu Isocyanat und Stickstoff;
das Isocyanat wird mit Wasser, Alkohol oder Amin umgesetzt.

*Schmidt-Abbau.* Carbonsäure und Stickstoffwasserstoffsäure geben in
Schwefelsäure ein Isocyanat; die Reaktion ist die Grundlage der
Azid-Synthese aus Carbonsäuren in einem Schritt.

*Kinetik.* Alle drei Reaktionen verlaufen über das Isocyanat; der geschwindigkeits-
bestimmende Schritt ist die Umlagerung des Acylazids bzw. des N-Bromamids. Bei
Hofmann-Abbau ist die Konfiguration am α-Kohlenstoff nicht betroffen — ein
Vorteil gegenüber der Decarboxylierung.

#vorschrift("D.9.3", [Anthranilsäure aus Phthalsäureanhydrid durch Hofmann-Abbau])[
  #reaktion(
    $ "C"_6"H"_4"(COOH)"_2 $,
    [#text(size: 6.5pt)[1. NH#sub[3], 2. Br#sub[2]/NaOH]],
    $ "H"_2"N-C"_6"H"_4"-COOH" $,
  )

  #ansatz[
    148 g (1,0 mol) Phthalsäure, 400 mL konzentriertes Ammoniak (25 %),
    160 g (1,0 mol) Brom, 400 mL 30-prozentige Natriumhydroxidlösung.
  ]

  Phthalsäure wird mit Ammoniak im Autoklaven 3 h auf 200 °C erhitzt; nach dem
  Abkühlen erhält man Phthalsäureimid, das abgesaugt und getrocknet wird.

  Das Imid wird in Natronlauge gelöst, auf 0 °C gekühlt und mit Brom versetzt
  (Hofmann-Abbau). Man rührt 1 h bei 0 °C und erwärmt anschließend langsam auf
  80 °C, bis die Gasentwicklung beendet ist.

  Man kühlt, filtriert und säuert das Filtrat mit Essigsäure auf pH 5 an;
  Anthranilsäure fällt aus. Sie wird aus Wasser umkristallisiert.

  #ausbeute[96 g (70 % d. Th.) farblose Blättchen.]

  #kenndaten[
    Schmp. 146 °C #h(2em) Sdp. 284 °C (Subl.)
  ]
]

#gefahr[Brom ist stark ätzend und stark oxidierend; Natriumhydroxid ist ätzend,
  Ammoniak giftig und ätzend. Der Autoklav muß druckgeprüft sein. Hofmann-Abbau
  nur im Abzug; Bromdämpfe nicht einatmen.]

=== Claisen- und Cope-Umlagerung

Beide sind [3,3]-sigmatrope Umlagerungen mit cyclischem Übergangszustand; sie
laufen konzertiert ab.

*Claisen-Umlagerung.* Ein Allylvinylether lagert sich zum γ,δ-ungesättigten
Carbonyl um. Die Reaktion ist die Grundlage der Synthese von
Allylverbindungen und von Naturstoffen (z. B. Chorismat-Umlagerung).

*Cope-Umlagerung.* Ein 1,5-Dien lagert sich zu einem isomeren 1,5-Dien um. Die
Reaktion ist thermisch erlaubt und verläuft mit hoher Stereoselektivität;
die *anionische Oxy-Cope*-Variante (mit Kaliumhydrid) führt zum
δ,ε-ungesättigten Alkohol.

*Benzidin-Umlagerung.* Hydrazobenzol lagert sich in Säure zu 4,4'-Diaminobiphenyl
um. Die Reaktion ist die klassische Synthese von Benzidin und war lange Zeit
die Grundlage der Azofarbstoff-Industrie; wegen der Krebsgefahr der Benzidine
wird sie heute nur noch in geschlossenen Anlagen durchgeführt.

=== Aufgaben

- Warum wandert bei der Pinakol-Umlagerung bevorzugt der Phenylrest, bei der
  Wagner-Meerwein-Umlagerung dagegen häufig Wasserstoff?
- Ein Oxim des 2-Methylcyclohexanons wird der Beckmann-Umlagerung unterworfen.
  Zeichnen Sie beide möglichen Produkte und geben Sie an, welches aus welchem
  Isomer entsteht.
- Erklären Sie den Unterschied zwischen Hofmann-Abbau und Decarboxylierung
  hinsichtlich der Stereochemie.
