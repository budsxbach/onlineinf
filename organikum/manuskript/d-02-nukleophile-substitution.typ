// ============================================================================
//  D.2 — Nukleophile Substitution am gesättigten Kohlenstoffatom
// ============================================================================

#import "/vorlage/layout.typ": *

== Nukleophile Substitution am gesättigten Kohlenstoffatom

Die nucleophile Substitution ist neben der Eliminierung die zentrale Reaktion
gesättigter Kohlenstoffverbindungen. In diesem Kapitel werden die beiden
Grenzmechanismen, ihre kinetischen und stereochemischen Konsequenzen und die
präparativ wichtigen Varianten behandelt; daran schließen sich erprobte
Arbeitsvorschriften an.

=== Allgemeiner Verlauf und Mechanismen

==== Der bimolekulare Mechanismus — S#sub[(N)]2

Beim S#sub[(N)]2-Mechanismus greift das Nucleophil das Elektrophil von der der
Abgangsgruppe gegenüberliegenden Seite an. Nucleophilaufnahme und Abgabe der
Abgangsgruppe erfolgen gleichzeitig; der Übergangszustand ist fünffach
koordiniert, die beiden nicht umgesetzten Substituenten und das zentrale
Kohlenstoffatom liegen in einer Ebene#footnote[Die stereochemische Analyse
beschreibt den Übergangszustand als trigonal-bipyramidal, wobei das nucleophile
Zentrum und die Abgangsgruppe die axialen Positionen besetzen.]. Die Reaktion
ist von *zweiter* Ordnung:

$ v = k_2 dot c("R–X") dot c("Nu"^(-)) $

Als Folge des Rückseitenangriffs verläuft die Substitution unter vollständiger
Konfigurationsumkehr (Walden-Umkehr). Bei einem chiralen Substrat am sekundären
Kohlenstoffatom ist das Produkt daher das Enantiomere des Edukts — vorausgesetzt,
die Reaktion verläuft ohne konkurrierende Racemisierung ab.

#figure(
  table(
    columns: (auto, 1fr, 1fr),
    inset: (x: 5pt, y: 3.5pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header(
      [*Größe*], [*Einfluß auf die S#sub[(N)]2-Geschwindigkeit*], [*Begründung*],
    ),
    [Substrat], [Methyl ≫ primär ≫ sekundär; tertiär praktisch nicht], [sterische Abschirmung des Rückseitenangriffs],
    [Nucleophil], [stark nucleophil = schnell], [Weichheit und Polarisierbarkeit],
    [Abfolge], [$ "RS"^- > "I"^- > "CN"^- > "HO"^- > "Br"^- > "Cl"^- $], [Nucleophilie gegenüber CH₃I in Methanol],
    [Lösungsmittel], [polar-aprotisch ≫ polar-protisch], [Solvatation des Nucleophils],
    [Abgangsgruppe], [$ "OTs"^- > "I"^- > "Br"^- > "Cl"^- $], [Stabilität der Abgangsgruppe],
  ),
  caption: [Grobregeln zur Steuerung der S#sub[(N)]2-Reaktion.],
) <tab:sn2>

==== Der monomolekulare Mechanismus — S#sub[(N)]1

Bei tertiären und sekundären Substraten mit guter Abgangsgruppe ist die
heterolytische Dissoziation zum Carbeniumion häufig geschwindigkeitsbestimmend.
Das Nucleophil greift erst danach an; die Reaktion ist von *erster* Ordnung und
verläuft über ein planar koordiniertes Carbeniumion, das von beiden Seiten
angegriffen werden kann. Das Ergebnis ist Racemisierung, bei Abfang durch
schwache Nucleophile häufig mit allylischer Umlagerung.

#gefahr[Die Abgrenzung der beiden Mechanismen ist keine Formalie: Sie entscheidet
über Produktverteilung, Stereochemie und die Wahl des Lösungsmittels. Bei
sekundären Substraten liegen beide Wege oft dicht beieinander, so daß
Substratkonzentration, Temperatur und Nucleophilkonzentration das Ergebnis
bestimmen.]

=== Abgrenzung der Mechanismen

Zwischen S#sub[N]1 und S#sub[N]2 gibt es keinen Schalter, sondern ein Kontinuum.
Vier Größen verschieben das Gleichgewicht:

#figure(
  table(
    columns: (1.3fr, 1.5fr, 1.5fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Größe*], [*begünstigt S#sub[N]1*], [*begünstigt S#sub[N]2*]),
    [Substrat], [tertiär, benzylisch, allylisch], [methyl, primär, sekundär],
    [Nucleophil], [schwach, gut solvatisiert], [stark, wenig solvatisiert],
    [Lösungsmittel], [polar-protisch (Wasser, Alkohol)], [polar-aprotisch (DMSO, DMF, Aceton)],
    [Temperatur], [hoch (Dissoziation)], [mäßig (keine Eliminierung)],
  ),
  caption: [Steuerung der Mechanismen. In der Praxis werden die Größen
    kombiniert, um ein Produkt zu erzwingen.],
) <tab:sn1-sn2>

*Sonderfall sekundäres Substrat.* Hier liegen beide Wege dicht beieinander, und
das Ergebnis hängt von Details ab: Ein Überschuß an Nucleophil begünstigt
S#sub[N]2, ein polares Lösungsmittel ohne Nucleophil begünstigt S#sub[N]1, und
eine starke Base führt zur Eliminierung. Wer eine Vorschrift für ein sekundäres
Substrat schreibt, legt deshalb alle drei Bedingungen fest — nicht nur das
Reagenz.

*Nachweis des Mechanismus.* Drei Experimente entscheiden:

- *Kinetik*: erste Ordnung → S#sub[N]1, zweite Ordnung → S#sub[N]2.
- *Stereochemie*: Umkehr → S#sub[N]2, Racemisierung → S#sub[N]1.
- *Mischungsverhalten*: Zusatz eines anderen Nucleophils führt bei S#sub[N]1 zu
  einem Produktgemisch, bei S#sub[N]2 zu einem einheitlichen Produkt aus dem
  zugesetzten Nucleophil.

=== Reaktionsführung und Reagenzien

Alkohole lassen sich mit den wäßrigen Halogenwasserstoffsäuren, mit
Phosphorhalogeniden oder über die Sulfonsäureester in die Halogenide überführen.
Für präparative Zwecke ist die Umsetzung mit Bromwasserstoffsäure in Gegenwart
von Schwefelsäure am einfachsten; sie liefert die Alkylbromide in guten
Ausbeuten und ist auch im Halbmikromaßstab zuverlässig.

#gefahr[Bromwasserstoffsäure und konzentrierte Schwefelsäure sind stark ätzend;
beim Verdünnen und beim Erwärmen entstehen ätzende Dämpfe. Arbeiten im Abzug,
Schutzbrille und Säureschutzhandschuhe tragen, Bromidabfälle getrennt sammeln.]

=== Arbeitsvorschriften

#vorschrift("D.2.1", [1-Brombutan aus Butan-1-ol])[
  #reaktion(
    $ "CH"_3"CH"_2"CH"_2"CH"_2"OH" + "HBr" $,
    [#text(size: 6.5pt)[H#sub[2]SO#sub[4] · 110–120 °C]],
    $ "CH"_3"CH"_2"CH"_2"CH"_2"Br" + "H"_2"O" $,
  )

  #ansatz[
    74 g (92 mL; 1,0 mol) Butan-1-ol, 250 g (1,5 mol) wäßrige Bromwasserstoffsäure
    (48 %), 100 g konzentrierte Schwefelsäure.
  ]

  In einem 1-l-Dreihalskolben mit Rückflußkühler, Thermometer und Tropftrichter
  werden Butan-1-ol und Bromwasserstoffsäure vorgelegt. Man erhitzt auf 100 °C
  und tropft innerhalb von 30 min die Schwefelsäure so zu, daß die Temperatur
  110 °C nicht übersteigt. Anschließend wird 3 h unter Rückfluß erhitzt; das
  abgeschiedene Rohbromid sammelt sich als obere Phase.

  Nach dem Abkühlen trennt man die organische Phase ab, wäscht sie zweimal mit
  je 30 mL Wasser und anschließend mit 20 mL gesättigter
  Natriumhydrogencarbonatlösung, bis keine Kohlendioxidentwicklung mehr zu
  beobachten ist. Man trocknet über Calciumchlorid und destilliert über eine
  kurze Vigreux-Kolonne. Die bei 99–103 °C übergehende Fraktion wird aufgefangen.

  #ausbeute[118 g (86 % d. Th.) farblose, stechend riechende Flüssigkeit.]

  #kenndaten[
    Sdp. 101,6 °C (1013 hPa) #h(2em) Brechungsindex $n_D^20$ = 1,4398
    #h(2em) Dichte $rho_20$ = 1,276 g·cm#super[−3]
  ]
]

Für die Gleichgewichtslage ist die Konzentration der Bromwasserstoffsäure
entscheidend: Da Wasser als Nucleophil mit dem Bromidion konkurriert, wird das
Gleichgewicht erst durch die wasserentziehende Wirkung der Schwefelsäure
ausreichend auf die Produktseite verschoben. Ein Überschuß an Alkohol ist zu
vermeiden, da sonst bei der Destillation Azeotrope mit dem Bromid auftreten.

#figure(
  grid(
    columns: (1fr, 1fr),
    align: (center, center),
    image("/bilder/strukturen/butan-1-ol.svg", width: 34mm),
    image("/bilder/strukturen/1-brombutan.svg", width: 34mm),
  ),
  caption: [Edukt (links) und Produkt (rechts) der Vorschrift D.2.1.],
) <fig:butylbromid>

#vorschrift("D.2.2", [1-Iodbutan aus Butan-1-ol])[
  #reaktion(
    $ "CH"_3"CH"_2"CH"_2"CH"_2"OH" + "KI" + "H"_3"PO"_4 $,
    [#text(size: 6.5pt)[120 °C]],
    $ "CH"_3"CH"_2"CH"_2"CH"_2"I" + "KH"_2"PO"_4 $,
  )

  #ansatz[
    74 g (92 mL; 1,0 mol) Butan-1-ol, 166 g (1,0 mol) fein gepulvertes
    Kaliumiodid, 180 g (1,1 mol) sirupöse Phosphorsäure (85 %).
  ]

  Butan-1-ol, Kaliumiodid und Phosphorsäure werden im 1-l-Kolben mit
  Rückflußkühler und Thermometer vorgelegt. Man erhitzt langsam auf 120 °C und
  hält diese Badtemperatur 2 h. Das gebildete Iodbutan destilliert man direkt
  aus dem Reaktionsgemisch ab, solange noch ölige Tropfen übergehen.

  Das Destillat wird mit 20 mL Wasser, dann mit 20 mL 10-prozentiger
  Natriumhydroxidlösung und erneut mit Wasser gewaschen, über Calciumchlorid
  getrocknet und über eine kurze Kolonne fraktioniert. Die bei 128–131 °C
  übergehende Hauptfraktion wird aufgefangen; sie wird in brauner Flasche
  aufbewahrt, da sich Iodalkane am Licht unter Iodabscheidung zersetzen.

  #ausbeute[156 g (85 % d. Th.) farblose Flüssigkeit mit süßlichem Geruch.]

  #kenndaten[
    Sdp. 130,5 °C #h(2em) $n_D^20$ = 1,4997 #h(2em) $rho_20$ = 1,617 g·cm#super[−3]
  ]
]

#vorschrift("D.2.3", [2-Methyl-1-chlorpropan aus 2-Methylpropan-1-ol])[
  #reaktion(
    $ "CH"_3"CH"("CH"_3")CH"_2"OH" + "HCl" $,
    [#text(size: 6.5pt)[ZnCl#sub[2]]],
    $ "CH"_3"CH"("CH"_3")CH"_2"Cl" + "H"_2"O" $,
  )

  #ansatz[
    74 g (92 mL; 1,0 mol) 2-Methylpropan-1-ol, 250 g (6,9 mol)
    konzentrierte Salzsäure, 50 g wasserfreies Zinkchlorid.
  ]

  Man legt das Zinkchlorid im 1-l-Kolben vor, setzt Rückflußkühler und
  Gasableitungsrohr auf, gibt die Salzsäure zu und leitet das entweichende
  Chlorwasserstoffgas in eine eisgekühlte Vorlage. Nach kurzer Zeit ist das
  Zinkchlorid gelöst; man gibt nun das Isobutanol in Anteilen zu, wobei die
  Temperatur durch Kühlen unter 40 °C gehalten wird. Danach erhitzt man 2 h auf
  90–100 °C.

  Das Rohprodukt wird abgetrennt, mit 20 mL Wasser und 20 mL
  Natriumcarbonatlösung gewaschen, über Calciumchlorid getrocknet und über eine
  Vigreux-Kolonne destilliert. Die bei 68–70 °C übergehende Fraktion ist reines
  Produkt.

  #ausbeute[74 g (68 % d. Th.) farblose, leicht flüchtige Flüssigkeit.]

  #kenndaten[
    Sdp. 68,9 °C #h(2em) $n_D^20$ = 1,3980 #h(2em) $rho_20$ = 0,877 g·cm#super[−3]
  ]
]

#vorschrift("D.2.4", [1-Bromhexan aus Hexan-1-ol])[
  #reaktion(
    $ "CH" _3("CH" _2")" _4"CH" _2"OH" + "HBr" $,
    [#text(size: 6.5pt)[H#sub[2]SO#sub[4], Rückfluß]],
    $ "CH" _3("CH" _2")" _4"CH" _2"Br" + "H" _2"O" $,
  )

  #ansatz[
    102 g (125 mL; 1,0 mol) Hexan-1-ol, 243 g (1,4 mol) Bromwasserstoffsäure
    (48 %), 60 mL konzentrierte Schwefelsäure.
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Rückflußkühler und Tropftrichter werden
  Hexan-1-ol und Bromwasserstoffsäure vorgelegt. Man erhitzt zum Rückfluß und
  tropft die Schwefelsäure innerhalb von 45 min zu; anschließend wird 4 h unter
  Rückfluß gerührt.

  Nach dem Abkühlen trennt man die organische Phase ab, wäscht sie mit Wasser,
  mit gesättigter Natriumhydrogencarbonatlösung und erneut mit Wasser. Man
  trocknet über Natriumsulfat und fraktioniert über eine Vigreux-Kolonne.

  #ausbeute[140 g (85 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 155 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4478 #h(2em)
    $rho_20$ = 1,176 g·cm#super[−3]
  ]
]

#gefahr[Bromwasserstoffsäure und Schwefelsäure sind stark ätzend; beim Erwärmen
  entstehen ätzende Dämpfe. Im Abzug arbeiten, Schutzbrille und Säurehandschuhe
  tragen. 1-Bromhexan reizt Augen und Atemwege.]

#vorschrift("D.2.5", [1-Iodbutan aus 1-Chlorbutan])[
  #reaktion(
    $ "CH" _3"CH" _2"CH" _2"CH" _2"Cl" + "NaI" $,
    [#text(size: 6.5pt)[Aceton, Rückfluß]],
    $ "CH" _3"CH" _2"CH" _2"CH" _2"I" + "NaCl" $,
  )

  #ansatz[
    92 g (103 mL; 1,0 mol) 1-Chlorbutan, 165 g (1,1 mol) wasserfreies
    Natriumiodid, 400 mL Aceton.
  ]

  In einem 1-l-Rundkolben mit Rückflußkühler und Rührer werden Natriumiodid und
  Aceton vorgelegt; man erhitzt zum Rückfluß, bis das Salz gelöst ist. Dann gibt
  man das 1-Chlorbutan zu und rührt 6 h unter Rückfluß.

  Man kühlt ab, filtriert ausgeschiedenes Natriumchlorid ab und engt das Filtrat
  am Rotationsverdampfer ein. Der Rückstand wird in 200 mL Wasser aufgenommen,
  die organische Phase abgetrennt und über Natriumsulfat getrocknet.

  Die Destillation über eine kurze Kolonne liefert bei 128–131 °C reines
  1-Iodbutan; es wird in brauner Flasche aufbewahrt.

  #ausbeute[150 g (82 % d. Th.) farblose Flüssigkeit mit süßlichem Geruch.]

  #kenndaten[
    Sdp. 130,5 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4997 #h(2em)
    $rho_20$ = 1,617 g·cm#super[−3]
  ]
]

#gefahr[Natriumiodid ist gesundheitsschädlich; Aceton ist leicht entzündbar und
  reizt Augen. 1-Iodbutan zersetzt sich am Licht unter Iodabscheidung — in
  brauner Flasche, kühl und dunkel lagern.]

*Finkelstein-Reaktion.* Der Austausch von Chlorid gegen Iodid in Aceton ist ein
S#sub[N]2-Prozess, der durch die Löslichkeitsverhältnisse getrieben wird:
Natriumchlorid fällt in Aceton aus, Natriumiodid ist löslich. Damit wird das
Gleichgewicht vollständig auf die Produktseite verschoben. Für Bromide und
Chloride ist der Austausch weniger günstig, weil die Salzlöslichkeiten ähnlich
sind.

$ "R–Cl" + "NaI" ->^("Aceton") "R–I" + "NaCl" arrow.b $

#vorschrift("D.2.6", [Diethylether aus Ethanol])[
  #reaktion(
    $ "2 C" _2"H" _5"OH" $,
    [#text(size: 6.5pt)[H#sub[2]SO#sub[4], 140 °C]],
    $ "C" _2"H" _5"OC" _2"H" _5 + "H" _2"O" $,
  )

  #ansatz[
    200 g (253 mL; 4,3 mol) Ethanol (96 %), 100 mL konzentrierte Schwefelsäure.
  ]

  In einem 1-l-Dreihalskolben mit Thermometer, Tropftrichter und absteigendem
  Kühler werden Ethanol und Schwefelsäure vorgelegt; man erhitzt im Ölbad auf
  140 °C. Das gebildete Ether-Wasser-Gemisch destilliert ab; man tropft laufend
  Ethanol nach, so daß der Kolbeninhalt etwa konstant bleibt.

  Das Destillat wird mit Natriumhydroxidlösung gewaschen, über Kaliumhydroxid
  getrocknet und über eine Vigreux-Kolonne fraktioniert. Diethylether geht bei
  34–35 °C über; er wird über Natriumhydroxid in brauner Flasche aufbewahrt.

  #ausbeute[92 g (62 % d. Th.) farblose, leicht flüchtige Flüssigkeit.]

  #kenndaten[
    Sdp. 34,6 °C (1013 hPa) #h(2em) $n_D^20$ = 1,3526 #h(2em)
    $rho_20$ = 0,713 g·cm#super[−3]
  ]
]

#gefahr[Diethylether ist extrem entzündbar (Flammpunkt −40 °C), bildet mit Luft
  explosive Gemische und beim Lagern explosive Peroxide. Keine Zündquellen,
  Apparatur erden, Destillation im Wasserbad, Vorlage kühlen. Vor jeder
  Destillation auf Peroxide prüfen (Kaliumiodid-Stärke-Papier).
  Schwefelsäure ist stark ätzend.]

#vorschrift("D.2.7", [Ethylphenyl ether aus Phenol und Bromethan])[
  #reaktion(
    $ "C" _6"H" _5"OH" + "C" _2"H" _5"Br" $,
    [#text(size: 6.5pt)[K#sub[2]CO#sub[3], Aceton, Rückfluß]],
    $ "C" _6"H" _5"OC" _2"H" _5 + "KBr" + "H" _2"O" + "CO" _2 $,
  )

  #ansatz[
    94 g (1,0 mol) Phenol, 120 g (80 mL; 1,1 mol) Bromethan,
    152 g (1,1 mol) gepulvertes Kaliumcarbonat, 400 mL Aceton.
  ]

  In einem 1-l-Dreihalskolben mit Rührer und Rückflußkühler werden Phenol,
  Kaliumcarbonat und Aceton vorgelegt. Man erhitzt zum Rückfluß und tropft das
  Bromethan zu; anschließend wird 6 h unter Rückfluß gerührt.

  Man kühlt ab, filtriert die Salze ab und wäscht sie mit Aceton. Das Filtrat
  wird eingeengt, der Rückstand in 200 mL Wasser aufgenommen und die organische
  Phase abgetrennt.

  Man trocknet über Kaliumcarbonat und fraktioniert; der Ether geht bei
  169–172 °C über.

  #ausbeute[98 g (80 % d. Th.) farblose Flüssigkeit mit aromatischem Geruch.]

  #kenndaten[
    Sdp. 170 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5080 #h(2em)
    $rho_20$ = 0,966 g·cm#super[−3]
  ]
]

#gefahr[Phenol ist ätzend, giftig und wird über die Haut aufgenommen; es
  verursacht schwere Verätzungen. Bromethan ist entzündbar und
  gesundheitsschädlich. Aceton ist leicht entzündbar. Nur im Abzug arbeiten —
  Phenol hat einen niedrigen Schmelzpunkt (41 °C) und ist leicht flüchtig.]

*Williamson-Ethersynthese.* Der Angriff eines Phenoxids auf ein Alkylhalogenid
verläuft als S#sub[N]2; damit ist die Reaktion auf primäre Halogenide
beschränkt. Mit sekundären und tertiären Halogeniden entsteht überwiegend
Eliminierungsprodukt. Für Methylarylether sind Dimethylsulfat oder
Methyliodid die Reagenzien der Wahl — Dimethylsulfat ist jedoch krebserzeugend
und wird heute ersetzt.

=== Störungen und ihre Ursachen

*Keine Umsetzung.* Bei zu geringer Säurekonzentration bleibt das Gleichgewicht
auf der Eduktseite; die wäßrige Phase ist dann halogenidarm. Abhilfe: frisch
bereitete, konzentrierte Halogenwasserstoffsäure einsetzen.

*Emulsionsbildung.* Durch überschüssiges Schwefelsäuredialkylsulfat oder
Alkoholreste kann die Phasentrennung ausbleiben. Man verdünnt mit Eiswasser,
trennt erneut und trocknet gründlich.

*Zu niedrige Ausbeute infolge Verlusts beim Trocknen.* Calciumchlorid bindet
Alkohole; bei größeren Alkoholmengen im Rohprodukt empfiehlt sich wasserfreies
Natriumsulfat.

=== Kenndaten der Butylhalogenide

#figure(
  table(
    columns: (auto, auto, auto, auto),
    inset: (x: 5pt, y: 3.5pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header(
      [*Substrat*], [*Sdp./°C*], [*$n_D^20$*], [*$rho_20$ in g·cm#super[−3]*],
    ),
    [1-Chlorbutan], [78,4], [1,4021], [0,886],
    [1-Brombutan], [101,6], [1,4398], [1,276],
    [1-Iodbutan], [130,5], [1,4997], [1,617],
  ),
  caption: [Siedepunkte und Brechungsindizes der Butylhalogenide bei 20 °C.],
) <tab:butylhalogenide>
