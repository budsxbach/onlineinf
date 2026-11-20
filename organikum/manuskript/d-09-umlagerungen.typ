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

$ "CH" _2"=CH–CH" _2"–O–CH=CH" _2 ->^(140 "°C") "CH" _2"=CH–CH" _2"–CH" _2"–CHO" $

Der Übergangszustand ist ein sechsgliedriger Sessel; die Bindung zwischen C-3
und C-3' wird geknüpft, während die Sauerstoff-Kohlenstoff-Bindung bricht. Weil
der Übergangszustand sesselartig ist, verläuft die Umlagerung stereospezifisch:
Die Konfiguration an C-1 und C-3 bleibt erhalten, und die neue Doppelbindung
entsteht *E*-selektiv.

*Substituenteneffekte.* Alkylgruppen in 2- oder 6-Position beschleunigen die
Umlagerung, weil sie im Übergangszustand die Enolform stabilisieren; bei
2,6-disubstituierten Allylvinylethern sinkt die Reaktionstemperatur auf 80 °C.
Das *decarboxylierende Claisen* (Allyl-β-ketoester + Base) läuft schon bei
Raumtemperatur über ein Enolat.

*Aromatische Claisen-Umlagerung.* Allylphenylether lagern beim Erhitzen auf
200 °C zum *ortho*-Allylphenol um; die Reaktion ist der klassische Zugang zu
Allylphenolen und Eugenol-Derivaten. Bei besetzter *ortho*-Position wandert die
Allylgruppe weiter zum *para*-Produkt („abnormale" Claisen-Umlagerung).

#vorschrift("D.9.4", [o-Allylphenol aus Allylphenylether])[
  #reaktion(
    $ "C" _6"H" _5"–O–CH" _2"–CH=CH" _2 $,
    [#text(size: 6.5pt)[200 °C, 3 h]],
    $ "2-HO–C" _6"H" _4"–CH" _2"–CH=CH" _2 $,
  )

  #ansatz[
    134 g (1,0 mol) Allylphenylether, 200 mL Decalin.
  ]

  In einem 500-ml-Dreihalskolben mit Rührer, Rückflußkühler und Innenthermometer
  wird der Ether in Decalin vorgelegt und unter Stickstoff auf 200 °C erhitzt.
  Man rührt 3 h bei dieser Temperatur; die Reaktion wird dünnschicht-
  chromatographisch verfolgt (Kieselgel, Petrolether/Essigsäureethylester 9:1).

  Man kühlt ab und destilliert das Decalin im Vakuum ab. Der Rückstand wird in
  200 mL Essigsäureethylester aufgenommen, mit 2-prozentiger Natronlauge
  gewaschen, getrocknet und fraktioniert.

  #ausbeute[104 g (78 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 220 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5380 #h(2em)
    $rho_20$ = 1,028 g·cm#super[−3]
  ]
]

#gefahr[Allylphenylether ist gesundheitsschädlich und entzündbar. Decalin ist
  entzündbar und wirkt reizend; bei 200 °C steht die Apparatur unter
  Druckgefahr — geschlossene Anlage, Rückflußkühler mit Kühlung, kein
  Erhitzen im geschlossenen Gefäß. o-Allylphenol reizt die Haut.]

*Cope-Umlagerung.* Ein 1,5-Dien lagert sich zu einem isomeren 1,5-Dien um. Die
Reaktion ist thermisch erlaubt und verläuft mit hoher Stereoselektivität;
die *anionische Oxy-Cope*-Variante (mit Kaliumhydrid) führt zum
δ,ε-ungesättigten Alkohol. Weil das Alkoxid den Übergangszustand über eine
enolatartige Struktur stabilisiert, genügt für die Oxy-Cope-Umlagerung schon
Raumtemperatur — ein präparativer Vorteil, der in Naturstoffsynthesen genutzt
wird.

$ "CH" _2"=CH–CH" _2"–CH(OR)–CH" _2"–CH=CH" _2 -> "CH" _2"=CH–CH" _2"–CO–CH" _2"–CH" _2"–CH=CH" _2 $

*Benzidin-Umlagerung.* Hydrazobenzol lagert sich in Säure zu 4,4'-Diaminobiphenyl
um. Die Reaktion ist die klassische Synthese von Benzidin und war lange Zeit
die Grundlage der Azofarbstoff-Industrie; wegen der Krebsgefahr der Benzidine
wird sie heute nur noch in geschlossenen Anlagen durchgeführt.

*Fries-Umlagerung.* Phenolester lagern in Gegenwart von
Aluminiumchlorid zu Hydroxyarylketonen um; das Ortho/Para-Verhältnis hängt
von der Temperatur ab. Die Umlagerung ist eine der klassischen Methoden zur
Herstellung von Hydroxyketonen.

#vorschrift("D.9.6", [2'-Hydroxyacetophenon aus Phenylacetat])[
  #reaktion(
    $ "C" _6"H" _5"OOCCH"_3 $,
    [#text(size: 6.5pt)[AlCl#sub[3], 25 °C, dann 80 °C]],
    $ "C" _6"H" _4("OH")"COCH"_3 $,
  )

  #ansatz[
    34 g (30 mL; 0,25 mol) Phenylacetat, 35 g (0,26 mol)
    Aluminiumchlorid, 100 mL Nitrobenzol.
  ]

  In einem 250-mL-Rundkolben mit Rührer und Thermometer suspendiert man das
  Aluminiumchlorid in 100 mL Nitrobenzol und tropft das Phenylacetat bei
  25 °C zu. Man rührt 4 h bei Raumtemperatur, erwärmt anschließend 2 h auf
  80 °C und gießt dann auf 200 g Eis mit 50 mL konz. Salzsäure.

  Die Nitrobenzol-Phase wird mit Wasserdampf destilliert; das
  Ortho-Isomer (2'-Hydroxyacetophenon) geht mit dem Dampf über, das
  Para-Isomer bleibt im Rückstand. Das Destillat wird mit Ether
  ausgeschüttelt, über Natriumsulfat getrocknet und im Vakuum destilliert.

  #ausbeute[15 g (45 % d. Th.) ölige Flüssigkeit (Ortho-Produkt).]

  #kenndaten[
    Sdp. 213 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5580 #h(2em)
    $rho_20$ = 1,13 g·cm#super[−3] #h(2em)
    $M$ = 136,2 g·mol#super[−1] #h(2em)
    Para-Isomer: Schmp. 109–111 °C, nicht dampfflüchtig.
  ]
]

#gefahr[Aluminiumchlorid ist ätzend und raucht an feuchter Luft; Nitrobenzol
  ist giftig (Methämoglobin!) und wassergefährdend — nur im Abzug arbeiten,
  Abwässer getrennt sammeln. Phenylacetat reizt die Haut. Der Dampfstrom
  muß unterbrochen werden, wenn das Destillat ölig übergeht.]

=== Baeyer-Villiger- und Favorskii-Umlagerung

*Baeyer-Villiger-Oxidation.* Ketone werden von Peroxycarbonsäuren zu Estern
oxidiert; dabei wandert eine Alkylgruppe vom Carbonylkohlenstoff zum
Peroxidsauerstoff. Die Reaktion ist die einzige präparativ bedeutsame
Insertion eines Sauerstoffs in eine Kohlenstoff-Kohlenstoff-Bindung.

$ "R–CO–R'" + "R''CO" _3"H" -> "R–CO–O–R'" + "R''CO" _2"H" $

Die Migrationsfähigkeit folgt der Fähigkeit, im Übergangszustand eine
Elektronenpaar-Bindung zum Carbonylkohlenstoff zu lösen: tertiär > sekundär >
Phenyl > primär > Methyl. Bei cyclischen Ketonen entsteht ein Lacton; aus
Cyclohexanon erhält man ε-Caprolacton, das Monomer für Polycaprolacton.

#figure(
  table(
    columns: (1.6fr, 1.6fr, 1.2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Keton*], [*Produkt*], [*Typ*]),
    [Cyclohexanon], [ε-Caprolacton], [Lacton],
    [Cyclopentanon], [δ-Valerolacton], [Lacton],
    [Acetophenon], [Phenylacetat], [Ester],
    [Benzophenon], [Phenylbenzoat], [Ester],
    [Methylisopropylketon], [Isopropylacetat], [Ester],
    [Methyl-tert-butylketon], [tert-Butylacetat], [Ester],
  ),
  caption: [Produkte der Baeyer-Villiger-Oxidation. Bei unsymmetrischen Ketonen
    wandert die besser stabilisierte Gruppe; im letzten Beispiel tert-Butyl.],
) <tab:baeyer-villiger>

#vorschrift("D.9.5", [ε-Caprolacton aus Cyclohexanon])[
  #reaktion(
    $ "C" _6"H" _10"O" + "CH" _3"CO" _3"H" $,
    [#text(size: 6.5pt)[CH#sub[2]Cl#sub[2], 25 °C]],
    $ "C" _6"H" _10"O" _2 + "CH" _3"COOH" $,
  )

  #ansatz[
    98 g (1,0 mol) Cyclohexanon, 190 g (1,5 mol) 32-prozentige Peressigsäure,
    300 mL Dichlormethan, 20 g wasserfreies Natriumacetat.
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Thermometer und Tropftrichter werden
  Cyclohexanon, Natriumacetat und Dichlormethan vorgelegt und auf 20 °C gekühlt.
  Man tropft die Peressigsäure so zu, daß die Temperatur 30 °C nicht übersteigt.

  Nach beendeter Zugabe rührt man 2 h bei 25 °C; die Reaktion wird durch
  Iodometrie auf Restperoxid geprüft. Man wäscht mit Wasser, dann mit
  gesättigter Natriumcarbonatlösung bis zur neutralen Reaktion und trocknet
  über Magnesiumsulfat.

  Das Lösungsmittel wird abdestilliert und das Lacton im Vakuum fraktioniert.

  #ausbeute[96 g (84 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 96 °C (5 hPa) #h(2em) $n_D^20$ = 1,4630 #h(2em)
    $rho_20$ = 1,070 g·cm#super[−3]
  ]
]

#gefahr[Peressigsäure ist stark oxidierend, ätzend und explosionsgefährlich in
  höheren Konzentrationen; nur die verdünnte Lösung verwenden, keinen Kontakt
  mit Metallpulvern oder brennbaren Stoffen. Cyclohexanon und Dichlormethan sind
  entzündbar bzw. gesundheitsschädlich. Peroxide niemals bis zur Trockne
  eindampfen.]

*Favorskii-Umlagerung.* α-Halogenketone werden von Basen zu Carbonsäuren
umgelagert: Ein Cyclopropanon-Intermediat wird nucleophil angegriffen, der Ring
öffnet sich unter Wanderung. Die Reaktion ist der beste Weg zu gesättigten
Carbonsäuren mit verzweigtem Skelett, etwa von α,α-Dialkylketonen.

$ "R" _2"C(Cl)–CO–R'" + 3 "NaOH" -> "R" _2"CH–COONa" + "2 NaCl" + "H" _2"O" $

*Präparative Bewertung.* Die Baeyer-Villiger-Oxidation ist mild, billig und
skaliert gut; sie wird industriell für Caprolacton und für Lactone aus
Cyclododecanon genutzt. Ihre Grenze ist die Selektivität bei unsymmetrischen
Ketonen — hier hilft die Regel von der Migrationsfähigkeit, aber nicht immer.
Die Favorskii-Umlagerung ist dagegen eine Spezialität für cyclische
α-Halogenketone und für die Ringverengung.

=== Aufgaben

- Warum wandert bei der Pinakol-Umlagerung bevorzugt der Phenylrest, bei der
  Wagner-Meerwein-Umlagerung dagegen häufig Wasserstoff?
- Ein Oxim des 2-Methylcyclohexanons wird der Beckmann-Umlagerung unterworfen.
  Zeichnen Sie beide möglichen Produkte und geben Sie an, welches aus welchem
  Isomer entsteht.
- Erklären Sie den Unterschied zwischen Hofmann-Abbau und Decarboxylierung
  hinsichtlich der Stereochemie.
- Formulieren Sie den Mechanismus der Baeyer-Villiger-Oxidation am Beispiel
  von Acetophenon und begründen Sie, warum Phenyl und nicht Methyl wandert.
- Welches Produkt entsteht bei der Baeyer-Villiger-Oxidation von
  4-tert-Butylcyclohexanon? Berücksichtigen Sie die Konformation des
  Übergangszustands.
- Ein Allylphenylether mit besetzter *ortho*-Position wird auf 200 °C erhitzt.
  Erklären Sie, warum das *para*-Produkt entsteht, und skizzieren Sie den Weg
  über die zweite [3,3]-Umlagerung.
- Vergleichen Sie Claisen- und Cope-Umlagerung hinsichtlich Substrat,
  Triebkraft und Temperaturbedarf. Warum genügt bei der anionischen
  Oxy-Cope-Variante Raumtemperatur?
- Geben Sie für die Favorskii-Umlagerung von 2-Chlorcyclohexanon das Produkt an
  und erklären Sie, warum Ringverengung und nicht Ringöffnung eintritt.
- Ordnen Sie die folgenden Gruppen nach ihrer Migrationsfähigkeit bei der
  Pinakol-Umlagerung: Wasserstoff, Phenyl, Methyl, tert-Butyl, Cyclohexyl.
- Warum ist die Beckmann-Umlagerung stereospezifisch, die Pinakol-Umlagerung
  dagegen nicht in jedem Fall? Nennen Sie ein Gegenbeispiel.

#block(above: 10pt, below: 8pt, inset: (x: 8pt, y: 6pt), stroke: (left: 2pt + black), fill: luma(246))[
  *Was Sie aus diesem Kapitel mitnehmen sollten.* Eine Umlagerung ordnet man
  nach dem wandernden Zentrum ein: Carbeniumion (Wagner-Meerwein, Pinakol,
  Beckmann), Nitren (Hofmann, Curtius, Schmidt), Peroxid (Baeyer-Villiger)
  oder konzertiert (Claisen, Cope). In allen Fällen gilt dieselbe Faustregel:
  Die Gruppe wandert, die am besten ein positives Zentrum stabilisieren kann
  oder die im cyclischen Übergangszustand am günstigsten liegt. Präparativ
  entscheidend ist die Stereospezifität — bei Beckmann und Claisen ist sie
  vollständig, bei Pinakol und Baeyer-Villiger nur statistisch.
]
- Begründen Sie, warum bei der Fries-Umlagerung bei Raumtemperatur das
  Ortho-Produkt, bei höherer Temperatur das Para-Produkt überwiegt.
- Vergleichen Sie die Fries- mit der Claisen-Umlagerung (D.9.4): Was ist
  das Gemeinsame, was der Unterschied?
