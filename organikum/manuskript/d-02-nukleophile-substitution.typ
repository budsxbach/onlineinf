// ============================================================================
//  Musterkapitel D.2 — Nukleophile Substitution am gesättigten Kohlenstoffatom
//  Vorführkapitel für die Layoutprobe: Theorie + drei vollständige Vorschriften
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
