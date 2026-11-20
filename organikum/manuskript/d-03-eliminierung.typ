// ============================================================================
//  D.3  Eliminierungen — Bildung von C-C-Mehrfachbindungen
// ============================================================================

#import "/vorlage/layout.typ": *

== Eliminierung und C-C-Mehrfachbindungen

Die Eliminierung ist die Umkehr der Addition: Aus zwei benachbarten Atomen werden
zwei Substituenten unter Bildung einer Mehrfachbindung abgespalten. Präparativ ist
sie der wichtigste Zugang zu Alkenen und Alkinen — und der lästigste Konkurrent
jeder nucleophilen Substitution.

=== Mechanistische Grundlagen

Man unterscheidet drei Grenzfälle:

- *E1*: Vorgelagerte Heterolyse der Abgangsgruppe zum Carbeniumion, danach
  Abspaltung eines Protons. Erster Ordnung, in polaren protischen Medien,
  konkurriert mit S#sub[N]1.
- *E2*: Konzertierte Abspaltung von Proton und Abgangsgruppe in einer
  antiperiplanaren Anordnung. Zweiter Ordnung, bevorzugt mit starken Basen.
- *E1cb*: Vorgelagerte Deprotonierung in α-Stellung zur Abgangsgruppe, danach
  Abspaltung. Tritt bei β-ständigen Carbonylgruppen und bei schlechten
  Abgangsgruppen auf.

#figure(
  table(
    columns: (auto, 1.3fr, 1.3fr, 1.4fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Kriterium*], [*E1*], [*E2*], [*E1cb*]),
    [Kinetik], [erste Ordnung], [zweite Ordnung], [zweite Ordnung in Base],
    [Base], [schwach, oft Lösungsmittel], [stark, konzentriert], [stark],
    [Abgangsgruppe], [gut, ionisierbar], [beliebig], [sehr schlecht],
    [Zwischenstufe], [Carbeniumion], [keine], [Carbanion],
    [Stereochemie], [unselektiv], [antiperiplanar, stereospezifisch], [wechselnd],
    [typisches Substrat], [tertiäres Halogenid], [sekundäres Halogenid], [β-Carbonyl],
  ),
  caption: [Abgrenzung der Eliminierungsmechanismen. In der Praxis sind die
    Übergänge fließend; die Tabelle gibt die Tendenzen wieder.],
) <tab:eliminierung>

Die entscheidende präparative Frage lautet: Substitution oder Eliminierung? Vier
Faktoren bestimmen das Verhältnis:

- *Basizität des Nucleophils*: starke Basen (Ethoxid, t-Butoxid) eliminieren,
  schwache Basen mit gutem nucleophilem Charakter (Iodid, Thiolat, Cyanid)
  substituieren.
- *Substrat*: primär substituiert, tertiär eliminiert.
- *Temperatur*: Eliminierung hat die höhere Aktivierungsenergie und wird durch
  Erhitzen begünstigt (Regel von Hofmann).
- *Lösungsmittel*: unpolare, aprotische Medien begünstigen E2.

=== Regioselektivität

Bei unsymmetrischen Substraten konkurrieren zwei Produkte. Die *Saytzeff-Regel*
besagt, daß das stärker substituierte Alken überwiegt, weil die Base das
wasserstoffreichere β-C bevorzugt angreift und die Doppelbindung im Produkt
besser stabilisiert ist. Die *Hofmann-Regel* gilt für sperrige Basen und für
quaternäre Ammoniumsalze: Hier entsteht das weniger substituierte Alken, weil die
Base das sterisch zugängliche Proton abstrahiert.

$ "CH" _3"CH" _2"CHBrCH" _3 + "EtO"^- -> "CH" _3"CH=CHCH" _3 "(81 %)" + "CH" _2"=CHCH" _2"CH" _3 "(19 %)" $

Mit Kalium-t-butoxid kehrt sich das Verhältnis nahezu um. Wer ein bestimmtes
Alken braucht, wählt die Base nach diesem Kriterium, nicht nach dem Preis.

#figure(
  table(
    columns: (1.4fr, 1.4fr, 1.2fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Base*], [*Lösungsmittel*], [*Produkt*], [*Verhältnis*]),
    [Natriumethanolat], [Ethanol], [Saytzeff], [4:1],
    [Kalium-t-butoxid], [t-Butanol], [Hofmann], [1:4],
    [Natriumamid], [fl. Ammoniak], [Hofmann], [1:3],
    [DBU], [Toluol], [Hofmann], [1:5],
    [Kaliumhydroxid], [Ethanol, 80 °C], [Saytzeff], [5:1],
  ),
  caption: [Regioselektivität der Eliminierung von 2-Brombutan. Die Base, nicht
    das Substrat, entscheidet über das Produkt.],
) <tab:saytzeff>

=== Stereochemie der E2-Eliminierung

Die E2-Eliminierung verlangt eine antiperiplanare Anordnung von Proton und
Abgangsgruppe; der Übergangszustand ist planar. Daraus folgt:

- Aus einem cyclischen Substrat mit axialer Abgangsgruppe entsteht das
  *trans*-Alken, aus einem mit äquatorialer Abgangsgruppe das *cis*-Alken.
- Bei acyclischen Systemen ist die anti-Anordnung leicht erreichbar; es entsteht
  bevorzugt das stabilere (E)-Alken.
- Bei bicyclischen Systemen, in denen keine antiperiplanare Stellung erreichbar
  ist, läuft die Eliminierung nicht ab — ein präparatives Kriterium für die
  Konfiguration.

#vorschrift("D.3.1", [Cyclohexen aus Cyclohexanol])[
  #reaktion(
    $ "C" _6"H" _11"OH" $,
    [#text(size: 6.5pt)[H#sub[3]PO#sub[4], 160 °C]],
    $ "C" _6"H" _10 + "H" _2"O" $,
  )

  #ansatz[
    100 g (104 mL; 1,0 mol) Cyclohexanol, 10 mL sirupöse Phosphorsäure (85 %),
    20 mL konzentrierte Schwefelsäure.
  ]

  In einem 500-ml-Rundkolben mit Kolonnenaufsatz, absteigendem Kühler und
  Vorlage werden Cyclohexanol und Phosphorsäure vorgelegt. Man erhitzt im
  Ölbad auf 160 °C; das gebildete Cyclohexen destilliert mit Wasser über. Die
  Destillation wird fortgesetzt, bis die Temperatur im Dampfraum 95 °C
  übersteigt.

  Das Destillat wird mit 20 mL 10-prozentiger Natriumcarbonatlösung neutral
  gewaschen, die organische Phase abgetrennt und über Calciumchlorid getrocknet.
  Man destilliert über eine Vigreux-Kolonne; die bei 82–84 °C übergehende
  Fraktion ist reines Cyclohexen.

  #ausbeute[68 g (83 % d. Th.) farblose, leicht flüchtige Flüssigkeit.]

  #kenndaten[
    Sdp. 83 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4465 #h(2em)
    $rho_20$ = 0,811 g·cm#super[−3]
  ]
]

#gefahr[Phosphorsäure und Schwefelsäure sind ätzend und verursachen schwere
Augenschäden. Cyclohexen ist leicht entzündbar und wirkt reizend; Dämpfe nicht
einatmen. Bei der Destillation entsteht ein brennbares Wasser-Alken-Gemisch —
Vorlage kühlen, keine offene Flamme in der Nähe.]

#figure(
  grid(
    columns: (1fr, 1fr),
    align: (center, center),
    image("/bilder/strukturen/cyclohexanol.svg", width: 32mm),
    image("/bilder/strukturen/cyclohexen.svg", width: 32mm),
  ),
  caption: [Edukt (links) und Produkt (rechts) der Vorschrift D.3.1.],
) <fig:cyclohexen>

#vorschrift("D.3.2", [2-Methylbut-2-en aus 2-Methylbutan-2-ol])[
  #reaktion(
    $ "CH" _3"CH" _2"C"("CH" _3)_2"OH" $,
    [#text(size: 6.5pt)[H#sub[2]SO#sub[4], 85 °C]],
    $ "CH" _3"CH=C"("CH" _3)_2 + "H" _2"O" $,
  )

  #ansatz[
    88 g (108 mL; 1,0 mol) 2-Methylbutan-2-ol, 60 mL konzentrierte
    Schwefelsäure (98 %), 100 mL Wasser.
  ]

  Man legt die Schwefelsäure in einem 1-l-Dreihalskolben mit Rührer,
  Thermometer und absteigendem Kühler vor, verdünnt mit dem Wasser und läßt auf
  40 °C abkühlen. Dann tropft man das tertiäre Butanol so zu, daß die
  Innentemperatur 55 °C nicht übersteigt. Nach beendeter Zugabe erhitzt man auf
  85 °C und destilliert das Alken mit Wasser ab.

  Die obere Phase des Destillats wird abgetrennt, mit 20 mL Wasser gewaschen,
  über Kaliumcarbonat getrocknet und über eine kurze Kolonne fraktioniert. Die
  bei 36–39 °C übergehende Fraktion ist reines 2-Methylbut-2-en.

  #ausbeute[57 g (81 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 38 °C (1013 hPa) #h(2em) $n_D^20$ = 1,3870 #h(2em)
    $rho_20$ = 0,662 g·cm#super[−3]
  ]
]

#gefahr[Konzentrierte Schwefelsäure ist stark ätzend; beim Verdünnen entsteht
Wärme — Säure auf Eis, nie umgekehrt. Das Alken ist extrem leicht entzündbar
(Flammpunkt unter −20 °C); Vorlage in Eis, keine Zündquellen, Abzug.]

=== Dehydratisierung und ihre Grenzen

Die säurekatalysierte Dehydratisierung folgt der Leichtigkeit der
Carbeniumionbildung: tertiäre Alkohole > sekundäre > primäre. Primäre Alkohole
lassen sich so nicht dehydratisieren; hier hilft nur die Umsetzung über ein
Halogenid oder die Pyrolyse des Acetats.

*Umlagerungen.* Treten Carbeniumionen auf, sind Wanderungen von Alkyl- oder
Hydridgruppen möglich. Aus 3,3-Dimethylbutan-2-ol entsteht deshalb nicht das
erwartete Alken, sondern 2,3-Dimethylbut-2-en. Wer eine Umlagerung ausschließen
will, wählt den E2-Weg (Base, antiperiplanar) statt der Säurekatalyse.

*Dehydratisierung von Diolen.* 1,2-Diole geben mit Säure Carbonylverbindungen
(Pinakol-Umlagerung), 1,4- und 1,5-Diole cyclische Ether. Die Reaktion ist
präparativ wertvoll, weil sie in einem Schritt ein sauerstoffhaltiges
Ringsystem aufbaut.

*Milde Dehydratisierung ohne Umlagerung.* Der E2-Weg läßt sich auch ohne starke
Base gehen: Phosphoroxychlorid überführt den Alkohol in einen
Dichlorphosphorsäureester, und das Pyridin eliminiert diesen in
antiperiplanarer Anordnung. Es treten keine Carbeniumionen auf — Wanderungen
sind ausgeschlossen, und primäre Alkohole funktionieren ebenso wie tertiäre.
Das Verfahren ist die Methode der Wahl für säureempfindliche Substrate.

#vorschrift("D.3.5", [1-Methylcyclohexen aus 1-Methylcyclohexanol])[
  #reaktion(
    $ "1-CH" _3"-C" _6"H" _10"OH" $,
    [#text(size: 6.5pt)[POCl#sub[3], Pyridin, 70 °C]],
    $ "1-CH" _3"-C" _6"H" _9 + "HCl" + "HPO" _2"Cl" _2 $,
  )

  #ansatz[
    11,4 g (0,1 mol) 1-Methylcyclohexanol, 18,4 g (11 mL; 0,12 mol)
    Phosphoroxychlorid, 30 mL Pyridin.
  ]

  In einem 250-mL-Rundkolben mit Rückflußkühler und Tropftrichter werden 30 mL
  Pyridin vorgelegt und auf 0 °C gekühlt. Unter Rühren tropft man das
  Phosphoroxychlorid zu (heftige Reaktion!), läßt auf Raumtemperatur kommen und
  gibt den Alkohol langsam zu. Anschließend erwärmt man 2 h auf 70 °C; die
  anfangs klare Lösung scheidet dabei Pyridiniumchlorid ab.

  Man kühlt ab, gießt vorsichtig auf 150 mL Eiswasser und trennt die obere
  organische Phase ab. Die wäßrige Phase wird zweimal mit je 20 mL Petrolether
  ausgeschüttelt; die vereinigten organischen Phasen werden mit verdünnter
  Salzsäure (Pyridin entfernen), dann mit Natriumhydrogencarbonatlösung
  gewaschen, über Natriumsulfat getrocknet und über eine Vigreux-Kolonne
  destilliert.

  #ausbeute[7,5 g (78 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 110 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4503 #h(2em)
    $rho_20$ = 0,813 g·cm#super[−3]
  ]
]

#gefahr[Phosphoroxychlorid ist hochgiftig, ätzend und raucht an feuchter Luft
  unter Salzsäurebildung; mit Wasser reagiert es heftig unter Wärmeentwicklung.
  Es wird nur ins Pyridin getropft, nie umgekehrt und nie in wäßrige Lösungen.
  Pyridine ist giftig, gesundheitsschädlich und hat einen unangenehmen Geruch —
  nur im Abzug arbeiten. Die wäßrigen Phasen enthalten Phosphate und
  Pyridiniumsalze und werden getrennt entsorgt.]

=== Alkine: zweifache Eliminierung

Die zweifache Dehydrohalogenierung eines vicinalen Dihalogenids führt zum Alkin.
Als Base dient Kaliumhydroxid in Ethanol bei erhöhter Temperatur; für die zweite
Stufe ist ein Überschuß erforderlich, weil das gebildete Alkin schwach acid ist
und sonst als Acetylid der Base entzogen wird.

$ "CH" _2"BrCH" _2"Br" + 2 "KOH" -> "HC" equiv "CH" + 2 "KBr" + 2 "H" _2"O" $

#vorschrift("D.3.3", [Acetylen aus 1,2-Dibromethan])[
  #reaktion(
    $ "BrCH" _2"CH" _2"Br" + 2 "KOH" $,
    [#text(size: 6.5pt)[Ethanol, 80 °C]],
    $ "HC" equiv "CH" + 2 "KBr" + 2 "H" _2"O" $,
  )

  #ansatz[
    188 g (86 mL; 1,0 mol) 1,2-Dibromethan, 168 g (3,0 mol) Kaliumhydroxid,
    300 mL Ethanol (96 %).
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Tropftrichter und absteigendem Kühler
  werden Kaliumhydroxid und Ethanol vorgelegt und auf 60 °C erwärmt. Man tropft
  das Dibromethan langsam zu und steigert die Badtemperatur anschließend auf
  80 °C. Das entweichende Acetylen wird über einen mit Wasser gefüllten
  Waschkolben und einen Trockenturm (Calciumchlorid) in eine gekühlte Vorlage
  geleitet.

  Zur Reinigung wird das Gas durch konzentrierte Schwefelsäure und anschließend
  durch Natronlauge geleitet; es wird in Aceton bei −78 °C kondensiert.

  #ausbeute[18 g (69 % d. Th.) farbloses Gas.]

  #kenndaten[
    Sdp. −84 °C (Subl.) #h(2em) Dichte 1,10 g·L#super[−1] (0 °C)
  ]
]

#gefahr[Acetylen bildet mit Luft explosive Gemische (2,3–80,7 Vol.-%); es ist
extrem entzündbar und kann bei Verdichtung ohne Stabilisator zerfallen. Die
Apparatur darf kein Kupfer oder Silber enthalten (Acetylidbildung). Arbeiten nur
im Abzug mit Funkenfreiheit, Vorlage kühlen, Gasmenge klein halten.
1,2-Dibromethan ist giftig und steht im Verdacht, krebserzeugend zu sein.]

*Reinigung von Acetylen.* Technisches Acetylen enthält Phosphan, Schwefelwasserstoff
und Aceton. Für präparative Zwecke genügt die Wäsche mit Chromschwefelsäure und
Natronlauge; für spektroskopische Zwecke wird über Molekularsieb getrocknet.

#vorschrift("D.3.4", [Phenylacetylen aus 1,2-Dibrom-1-phenylethan])[
  #reaktion(
    $ "C" _6"H" _5"CHBrCH" _2"Br" $,
    [#text(size: 6.5pt)[KOH, Ethanol, Rückfluß]],
    $ "C" _6"H" _5"C" equiv "CH" + 2 "HBr" $,
  )

  #ansatz[
    132 g (0,50 mol) 1,2-Dibrom-1-phenylethan, 112 g (2,0 mol) Kaliumhydroxid,
    400 mL Ethanol (96 %).
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Rückflußkühler und Tropftrichter werden
  Kaliumhydroxid und Ethanol vorgelegt und auf 60 °C erwärmt. Man tropft das
  Dibromid zu und erhitzt anschließend 4 h unter Rückfluß.

  Nach dem Abkühlen gießt man auf 1 L Eiswasser, trennt die organische Phase ab
  und extrahiert die wäßrige Phase zweimal mit je 100 mL Ether. Die vereinigten
  organischen Phasen werden mit Wasser gewaschen und über Kaliumcarbonat
  getrocknet.

  Man destilliert das Lösungsmittel ab und fraktioniert den Rückstand im Vakuum;
  Phenylacetylen geht bei 60–62 °C (30 hPa) über und wird in brauner Flasche
  aufbewahrt.

  #ausbeute[38 g (74 % d. Th.) farblose, aromatisch riechende Flüssigkeit.]

  #kenndaten[
    Sdp. 142 °C (1013 hPa) #h(2em) $n_D^20$ = 1,5490 #h(2em)
    $rho_20$ = 0,930 g·cm#super[−3]
  ]
]

#gefahr[Phenylacetylen ist entzündbar, gesundheitsschädlich und polymerisiert
  bei Erwärmung oder unter Lichteinfluß. Kaliumhydroxid in Ethanol ist stark
  ätzend. Ether ist extrem entzündbar; keine Zündquellen, Destillation im
  Wasserbad.]

*Prüfung auf terminale Alkine.* Silbernitrat in ethanolischer Ammoniaklösung
gibt mit terminalen Alkinen einen weißen Niederschlag (Silberacetylid), Kupfer(I)
einen roten (Kupferacetylid). Beide Acetylide sind in trockenem Zustand
schlagempfindlich und dürfen nicht isoliert aufbewahrt werden.

=== Eliminierung als Reinigungsschritt

Gelegentlich ist die Eliminierung kein Ziel, sondern ein Mittel: Ein Alkohol, der
sich nicht destillieren läßt, wird zum Alken dehydratisiert, das Alken gereinigt
und anschließend wieder addiert. Diese Sequenz ist bei empfindlichen Naturstoffen
verbreitet und setzt voraus, daß die Addition selektiv verläuft.

Auch die Eliminierung folgt dem retrosynthetischen Prinzip: Das Alken wird auf
das Halogenid oder den Alkohol zurückgeführt, aus dem es entsteht. Für die
Konfiguration ist die Wahl des Weges entscheidend — E2 liefert das (E)-Alken,
Säurekatalyse über ein Carbeniumion oft ein Gemisch.

#figure(
  grid(
    columns: (1fr, 1fr),
    align: (center, center),
    image("/bilder/strukturen/stilben-e.svg", width: 40mm),
    image("/bilder/strukturen/stilben-z.svg", width: 40mm),
  ),
  caption: [(E)-Stilben (links) und (Z)-Stilben (rechts). Die beiden Isomere
    unterscheiden sich in Schmelzpunkt und Löslichkeit und sind durch
    Kristallisation trennbar.],
) <fig:stilbene>

=== Kenndaten und Prüfung

Alkene werden über Siedepunkt, Brechungsindex und Dichte charakterisiert; ein
zusätzlicher Beweis ist die Entfärbung von Bromwasser und von schwefelsaurer
Kaliumpermanganatlösung. Für die Reinheit entscheidend ist die gaschromatographische
Kontrolle: Ein Alken, das nach der Destillation noch 5 % Edukt enthält, ist für
die Weiterverarbeitung ungeeignet.

#figure(
  table(
    columns: (2fr, auto, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Alken*], [*Sdp./°C*], [*$n_D^20$*], [*$rho_20$ in g·cm#super[−3]*]),
    [Ethen], [−104], [—], [—],
    [Propen], [−48], [—], [—],
    [2-Methylpropen], [−7], [—], [—],
    [Cyclohexen], [83], [1,4465], [0,811],
    [2-Methylbut-2-en], [38], [1,3870], [0,662],
    [1-Octen], [121], [1,4088], [0,715],
    [(E)-Stilben], [124 (12 hPa)], [—], [—],
  ),
  caption: [Kenndaten ausgewählter Alkene. Bei den gasförmigen Alkenen entfallen
    Brechungsindex und Dichte als Kriterium.],
) <tab:alkene>

=== Aufgaben

- Warum liefert die Dehydratisierung von 3,3-Dimethylbutan-2-ol ein anderes
  Produkt als erwartet? Formulieren Sie den Mechanismus der Umlagerung.
- Welche Base wählen Sie, um aus 2-Bromhexan überwiegend Hex-1-en zu erhalten?
  Begründen Sie die Wahl mit der Regel von Hofmann.
- Erklären Sie, warum aus *trans*-1,2-Dibromcyclohexan mit Iodid kein Cyclohexen
  entsteht, aus dem *cis*-Isomer dagegen schon.
- Warum verläuft die Dehydratisierung von 1-Methylcyclohexanol mit
  POCl#sub[3]/Pyridin ohne Umlagerung, die mit Schwefelsäure dagegen nicht?
- Warum wird Phosphoroxychlorid ins Pyridin getropft und nicht umgekehrt?
- 3,3-Dimethylbutan-2-ol wird einmal mit Schwefelsäure, einmal mit
  POCl#sub[3]/Pyridin umgesetzt. Welche Produkte entstehen jeweils?
- Ordnen Sie nach der Leichtigkeit der säurekatalysierten Dehydratisierung:
  1-Butanol, 2-Butanol, 2-Methylpropan-2-ol, 1-Phenylethanol.
