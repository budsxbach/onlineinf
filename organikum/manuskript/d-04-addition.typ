// ============================================================================
//  D.4  Addition an nichtaktivierte C-C-Mehrfachbindungen
// ============================================================================

#import "/vorlage/layout.typ": *

== Addition an nichtaktivierte C-C-Mehrfachbindungen

Die Doppelbindung ist ein Elektronenpaarspender. Sie reagiert mit Elektrophilen,
mit Radikalen und — nach Aktivierung durch Übergangsmetalle — mit
Wasserstoff. Die Addition ist die Umkehr der Eliminierung, und wie diese verläuft
sie stereospezifisch.

=== Energetische und strukturelle Grundlagen

Ein Alken ist nucleophil, weil das π-Orbital hoch liegt und leicht zugänglich
ist. Die Reaktivität nimmt mit der Substitution zu: Je mehr Alkylgruppen am
Doppelbindungskohlenstoff stehen, desto höher liegt das HOMO und desto leichter
erfolgt der elektrophile Angriff.

$ "H" _2"C=CH" _2 < "CH" _3"CH=CH" _2 < ("CH" _3)_2"C=CH" _2 < ("CH" _3)_2"C=C"("CH" _3)_2 $

Alkine sind weniger nucleophil als Alkene, weil das π-System aus zwei
senkrechten Orbitalpaaren besteht und die Elektronendichte über vier Zentren
verteilt ist. Die Addition erfolgt deshalb langsamer, führt aber bei gleichen
Bedingungen bis zur doppelten Addition, wenn nicht mit einem Katalysator
gearbeitet wird.

=== Elektrophile Addition

*Halogenierung.* Das Halogen wird polarisiert, das elektrophile Ende greift an.
Es entsteht ein cyclisches Haloniumion, das von der Rückseite geöffnet wird —
daher *anti*-Addition. In Wasser entsteht daneben das Halogenhydrin.

#figure(
  table(
    columns: (auto, 1.2fr, 1.2fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Reagenz*], [*Produkt*], [*Stereochemie*], [*rel. Geschw.*]),
    [Br#sub[2]], [1,2-Dibromid], [anti], [1],
    [Cl#sub[2]], [1,2-Dichlorid], [anti], [0,3],
    [HBr], [Alkylbromid], [Markownikoff], [1],
    [HCl], [Alkylchlorid], [Markownikoff], [0,1],
    [H#sub[2]O/H#super[+]], [Alkohol], [Markownikoff], [—],
    [HBr/Peroxid], [Alkylbromid], [anti-Markownikoff], [—],
    [Br#sub[2]/H#sub[2]O], [Halogenhydrin], [anti], [—],
  ),
  caption: [Elektrophile Additionen an Alkene. Die relativen Geschwindigkeiten
    beziehen sich auf Cyclohexen bei 25 °C.],
) <tab:elektrophile-addition>

Die *Markownikoff-Regel* folgt aus der Stabilität des Carbeniumions: Das Proton
lagert sich so an, daß das stabilere Carbeniumion entsteht. Bei HBr in Gegenwart
von Peroxiden verläuft die Reaktion radikalisch und liefert das umgekehrte
Produkt (*Kharasch-Effekt*).

*Hydratisierung.* Wasser addiert sich nur in Gegenwart von Säure. Das
Gleichgewicht liegt bei einfachen Alkenen auf der Eduktseite; präparativ nutzt
man deshalb die Umsetzung des Alkens mit Schwefelsäure und anschließende
Hydrolyse oder die Hydroborierung.

*Additionsreihenfolge bei konjugierten Dienen.* Bei 1,3-Butadien erfolgt der
Angriff am endständigen Kohlenstoff; das Carbeniumion ist allylisch und wird an
C2 oder C4 abgefangen. Bei tiefer Temperatur entsteht das 1,2-Produkt
(kinetisch), bei höherer das 1,4-Produkt (thermodynamisch).

#vorschrift("D.4.1", [1,2-Dibromcyclohexan aus Cyclohexen])[
  #reaktion(
    $ "C" _6"H" _10 + "Br" _2 $,
    [#text(size: 6.5pt)[$"CH"_2"Cl"_2$, −10 °C]],
    $ "C" _6"H" _10"Br" _2 $,
  )

  #ansatz[
    41 g (50 mL; 0,50 mol) Cyclohexen, 88 g (28 mL; 0,55 mol) Brom,
    100 mL Dichlormethan.
  ]

  In einem 500-ml-Dreihalskolben mit Rührer, Tropftrichter und Thermometer legt
  man Cyclohexen in 100 mL Dichlormethan vor und kühlt auf −10 °C (Eis-Kochsalz).
  Unter Rühren tropft man das Brom so zu, daß die Temperatur 0 °C nicht
  übersteigt und die Orangefärbung jeweils verschwindet.

  Nach beendeter Zugabe rührt man 30 min bei 0 °C, gießt auf 100 g Eis und
  trennt die organische Phase ab. Sie wird mit 50 mL 10-prozentiger
  Natriumhydrogensulfitlösung (Entfernung von Restbrom), dann mit Wasser
  gewaschen, über Calciumchlorid getrocknet und das Lösungsmittel abdestilliert.

  Das Rohprodukt wird aus Ethanol umkristallisiert; man erhält farblose
  Kristalle.

  #ausbeute[101 g (84 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 110 °C (trans-Isomer) #h(2em) Sdp. 214 °C
  ]
]

#gefahr[Brom ist stark ätzend, stark oxidierend und für Wasserorganismen sehr
giftig; es verursacht schwere Verbrennungen und Atemwegsreizungen. Nur im Abzug
arbeiten, Schutzbrille und Säurehandschuhe tragen, Tropftrichter mit
Überdruckventil verwenden. Dichlormethan ist gesundheitsschädlich und
betäubend; Dämpfe nicht einatmen.]

*Nachweis der anti-Addition.* Aus Cyclohexen entsteht ausschließlich das
*trans*-1,2-Dibromid. Bei der Addition an (Z)-But-2-en entsteht das *racemische*
2,3-Dibrombutan, bei (E)-But-2-en das *meso*-Isomer. Diese Stereochemie ist der
klassische Beleg für den cyclischen Haloniumion-Mechanismus.

=== Radikalische Addition

*Anti-Markownikoff-Addition von HBr.* In Gegenwart von Peroxiden oder Licht
zerfällt HBr radikalisch; das Bromradikal addiert an das endständige
Kohlenstoffatom, weil dort das stabilere Radikal entsteht.

$ "RCH=CH" _2 + "HBr" ->^("Peroxid") "RCH" _2"CH" _2"Br" $

Die Reaktion ist auf HBr beschränkt. HCl und HI geben unter diesen Bedingungen
keine radikalische Addition: HCl ist zu fest gebunden, HI wird durch das Radikal
zu Iod oxidiert.

*Thiol-En-Addition.* Thiole addieren an Alkene unter Radikalbedingungen oder
photochemisch. Die Reaktion ist für die Polymerchemie und für die
oberflächengebundene Derivatisierung wichtig; im Praktikum dient sie zum
Nachweis von Doppelbindungen.

=== Hydrierung

Die katalytische Hydrierung ist die sauberste Methode zur Reduktion einer
Doppelbindung: kein Reagenzüberschuß, kein Salzabfall, keine Stereochemie am
Kohlenstoffgerüst. Die Addition erfolgt *syn*, beide Wasserstoffatome kommen von
der Katalysatoroberfläche.

#figure(
  table(
    columns: (1.4fr, 1.5fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Katalysator*], [*Eignung*], [*Bedingungen*]),
    [Pd/C (5 oder 10 %)], [Alkene, Alkine, Nitro, Benzyl], [1–3 bar, RT],
    [PtO#sub[2] (Adams)], [Alkene, Ketone, Aromaten], [1–4 bar, RT],
    [Raney-Nickel], [Alkene, Nitrile], [1–5 bar, 60–100 °C],
    [Rh/Al#sub[2]O#sub[3]], [selektiv, Aromaten], [1–5 bar, RT],
    [Lindlar (Pd/CaCO#sub[3])], [Alkin → cis-Alken], [1 bar, RT, Chinolin],
    [Na/NH#sub[3] (fl.)], [Alkin → trans-Alken], [−33 °C],
  ),
  caption: [Katalysatoren für die Hydrierung. Die Wahl entscheidet über
    Selektivität und über die Menge an Wasserstoff, die verbraucht wird.],
) <tab:hydrierung>

#vorschrift("D.4.2", [Cyclohexan aus Cyclohexen])[
  #reaktion(
    $ "C" _6"H" _10 + "H" _2 $,
    [#text(size: 6.5pt)[Pd/C, RT]],
    $ "C" _6"H" _12 $,
  )

  #ansatz[
    41 g (50 mL; 0,50 mol) Cyclohexen, 1,0 g Palladium-Kohle (10 %),
    100 mL Cyclohexan (als Lösungsmittel).
  ]

  In einem 500-ml-Hydrierkolben mit Magnetrührer und Gaseinleitung wird der
  Katalysator in 100 mL Cyclohexan suspendiert und mit Wasserstoff gespült. Man
  gibt das Cyclohexen zu und hydriert bei Normaldruck und Raumtemperatur, bis
  die berechnete Menge Wasserstoff (11,2 L) aufgenommen ist; das dauert
  1–2 h.

  Der Katalysator wird über Celite abfiltriert und mit 20 mL Cyclohexan
  nachgewaschen. Das Filtrat wird über eine Vigreux-Kolonne destilliert; die bei
  80–81 °C übergehende Fraktion ist reines Cyclohexan.

  #ausbeute[38 g (90 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 81 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4262 #h(2em)
    $rho_20$ = 0,779 g·cm#super[−3]
  ]
]

#gefahr[Wasserstoff ist extrem entzündbar und bildet mit Luft ein explosives
Gemisch (4–75 Vol.-%). Keine Zündquellen, Apparatur erden, Abzug verwenden.
Palladium-Kohle ist in trockenem Zustand selbstentzündlich, wenn es
Wasserstoff und Luft gleichzeitig ausgesetzt wird; Katalysator feucht halten und
nach dem Versuch in Wasser geben. Cyclohexan ist leicht entzündbar und
gesundheitsschädlich; Dämpfe nicht einatmen.]

*Kontrolle der Wasserstoffaufnahme.* Die Menge wird über eine Gasbürette oder
über eine Waage (Druckflasche) gemessen. Wer nach Augenmaß hydriert, riskiert
die Hydrierung des Lösungsmittels oder des Katalysators („Überhydrierung") und
eine schlechte Ausbeute.

=== Hydroborierung

Diboran addiert *syn* und *anti-Markownikoff* an Alkene. Die anschließende
Oxidation mit Wasserstoffperoxid und Natronlauge liefert den Alkohol; die
Gesamtreaktion ist eine Wasseranlagerung gegen die Markownikoff-Regel.

$ "RCH=CH" _2 + "BH" _3 -> "RCH" _2"CH" _2"BH" _2 ->^(H_2 O_2 "\/ OH"^-) "RCH" _2"CH" _2"OH" $

Die Selektivität ist hoch: Bei 1-Octen entsteht zu über 90 % Octan-1-ol, bei
2-Methylbut-2-en zu über 90 % 3-Methylbutan-2-ol. Wer einen primären Alkohol aus
einem terminalen Alken braucht, hat hier den kürzesten Weg.

=== Dihydroxylierung und Epoxidierung

*Epoxidierung.* Mit Peroxycarbonsäuren (m-CPBA, Peressigsäure) entsteht ein
Epoxid unter Erhaltung der Konfiguration. Die Reaktion ist stereospezifisch: Aus
(Z)-Alken entsteht das *cis*-Epoxid, aus (E)-Alken das *trans*-Epoxid.

*Dihydroxylierung.* Kaliumpermanganat in verdünnter, kalter Lösung liefert
*cis*-1,2-Diole; Osmiumtetroxid mit N-Methylmorpholin-N-oxid liefert dieselben
Produkte in besserer Ausbeute, ist aber giftig und teuer.

#figure(
  table(
    columns: (1.5fr, 1.4fr, 1.3fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Reagenz*], [*Produkt*], [*Stereochemie*], [*Maßstab*]),
    [m-CPBA], [Epoxid], [Erhaltung], [0,1–1 mol],
    [KMnO#sub[4], verdünnt], [1,2-Diol], [cis], [0,01–0,1 mol],
    [OsO#sub[4]/NMO], [1,2-Diol], [cis], [0,001–0,01 mol],
    [Br#sub[2]/H#sub[2]O], [Halogenhydrin], [anti], [0,1–1 mol],
    [Hg(OAc)#sub[2]/H#sub[2]O], [Alkohol], [Markownikoff], [0,1 mol],
    [BH#sub[3]/H#sub[2]O#sub[2]], [Alkohol], [anti-Markownikoff], [0,1–1 mol],
  ),
  caption: [Sauerstoffhaltige Additionen an Alkene. Die Stereochemie ist in allen
    Fällen Ausdruck des Mechanismus.],
) <tab:sauerstoffaddition>

=== Cycloadditionen

Die Diels-Alder-Reaktion ist eine [4+2]-Cycloaddition zwischen einem Dien und
einem Dienophil. Sie verläuft konzertiert, stereospezifisch (*cis*-Prinzip) und
mit hoher Regioselektivität bei elektronisch unterschiedlichen Partnern.

$ "Dien" + "Dienophil" -> "Cyclohexen-Derivat" $

Präparativ wichtig:

- Die Reaktion läuft bei Raumtemperatur oder mäßiger Wärme ab; Katalyse durch
  Lewis-Säuren beschleunigt sie.
- Elektronenreiche Diene reagieren mit elektronenarmen Dienophilen (reaktive
  Dienophil-Seite: Maleinsäureanhydrid, Acrolein, Chinone).
- Die *endo*-Regel gilt für bicyclische Produkte: Das kinetisch bevorzugte
  Produkt hat die Substituenten unter dem Ring.

#vorschrift("D.4.3", [Bernsteinsäureanhydrid aus Maleinsäureanhydrid und Ethen])[
  #reaktion(
    $ "C" _4"H" _2"O" _3 + "H" _2"C=CH" _2 $,
    [#text(size: 6.5pt)[150 °C, 20 bar]],
    $ "C" _4"H" _4"O" _3 $,
  )

  #ansatz[
    98 g (1,0 mol) Maleinsäureanhydrid, 40 g (1,4 mol) Ethen.
  ]

  In einem 1-l-Autoklaven mit Rührer und Manometer werden 98 g Maleinsäureanhydrid
  vorgelegt und auf 150 °C erhitzt. Man preßt Ethen bis zu einem Druck von
  20 bar auf und rührt 4 h bei dieser Temperatur; der Druck fällt mit dem
  Umsatz ab.

  Nach dem Abkühlen wird der Autoklav entspannt, das Rohprodukt in 200 mL
  Essigsäureethylester gelöst, mit Aktivkohle behandelt und filtriert. Durch
  Zugabe von Petrolether wird das Anhydrid gefällt und abgesaugt.

  #ausbeute[96 g (76 % d. Th.) farblose Kristalle.]

  #kenndaten[
    Schmp. 120 °C #h(2em) Sdp. 261 °C
  ]
]

#gefahr[Ethen ist extrem entzündbar und bildet mit Luft explosive Gemische;
Autoklav nur mit Berstscheibe und Druckentlastung betreiben. Maleinsäureanhydrid
ist ätzend, sensibilisierend und verursacht schwere Augenschäden; Staub nicht
einatmen, Handschuhe tragen. Bernsteinsäureanhydrid reizt Haut und Atemwege.]

*Prüfung auf Vollständigkeit.* Nach dem Abkühlen wird eine Probe in Wasser
gelöst: Maleinsäureanhydrid hydrolysiert schnell zu Maleinsäure (Schmp. 130 °C),
Bernsteinsäureanhydrid langsam. Der Schmelzpunkt des Rohprodukts zeigt, ob
Ausgangsmaterial zurückgeblieben ist.

#vorschrift("D.4.4", [2-Brompropan aus Propen])[
  #reaktion(
    $ "CH" _3"CH=CH" _2 + "HBr" $,
    [#text(size: 6.5pt)[25 °C, ohne Peroxid]],
    $ "CH" _3"CHBrCH" _3 $,
  )

  #ansatz[
    42 g (1,0 mol) Propen, 89 g (1,1 mol) Bromwasserstoff (getrocknet),
    200 mL Dichlormethan.
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Gaseinleitungsrohr und
  Trockeneiskühler werden 200 mL Dichlormethan vorgelegt und auf −10 °C gekühlt.
  Man leitet Propen bis zur Sättigung ein und anschließend trockenen
  Bromwasserstoff so langsam, daß die Temperatur 0 °C nicht übersteigt.

  Nach beendeter Gaszugabe rührt man 30 min bei 0 °C und läßt auf Raumtemperatur
  kommen. Man wäscht mit Wasser, mit Natriumhydrogencarbonatlösung und trocknet
  über Calciumchlorid.

  Die Destillation über eine Vigreux-Kolonne liefert bei 59–60 °C reines
  2-Brompropan.

  #ausbeute[98 g (80 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 59 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4251 #h(2em)
    $rho_20$ = 1,310 g·cm#super[−3]
  ]
]

#gefahr[Propen ist extrem entzündbar und bildet mit Luft explosive Gemische.
  Bromwasserstoff ist ätzend und giftig; nur im Abzug, Abgas durch Natronlauge
  leiten. 2-Brompropan ist leicht entzündbar und reizt die Atemwege.]

#vorschrift("D.4.5", [Octan-1-ol aus 1-Octen durch Hydroborierung])[
  #reaktion(
    $ "CH" _3("CH" _2")" _5"CH=CH" _2 $,
    [#text(size: 6.5pt)[1. BH#sub[3]·THF, 2. H#sub[2]O#sub[2]/NaOH]],
    $ "CH" _3("CH" _2")" _6"CH" _2"OH" $,
  )

  #ansatz[
    112 g (1,0 mol) 1-Octen, 170 mL Boran-THF-Addukt (1 M; 0,17 mol BH#sub[3]),
    100 mL 3 M Natriumhydroxidlösung, 100 mL Wasserstoffperoxid (30 %).
  ]

  In einem 1-l-Dreihalskolben mit Rührer, Thermometer und Tropftrichter werden
  170 mL Boran-THF-Lösung vorgelegt und auf 0 °C gekühlt. Man tropft das 1-Octen
  so zu, daß die Temperatur 10 °C nicht übersteigt, und rührt anschließend 2 h
  bei Raumtemperatur.

  Man kühlt wieder auf 0 °C und tropft gleichzeitig Natronlauge und
  Wasserstoffperoxid so zu, daß die Temperatur 30 °C nicht übersteigt (stark
  exotherm). Danach rührt man 1 h bei 50 °C.

  Nach dem Abkühlen trennt man die organische Phase ab, wäscht mit Wasser und
  gesättigter Kochsalzlösung, trocknet über Magnesiumsulfat und fraktioniert im
  Vakuum.

  #ausbeute[105 g (81 % d. Th.) farblose Flüssigkeit.]

  #kenndaten[
    Sdp. 195 °C (1013 hPa) #h(2em) $n_D^20$ = 1,4290 #h(2em)
    $rho_20$ = 0,827 g·cm#super[−3]
  ]
]

#gefahr[Boran-THF ist selbstentzündlich an Luft, reagiert mit Wasser unter
  Wasserstoffentwicklung und ist giftig. Nur mit Spritze und Kanüle unter Argon
  handhaben, niemals mit Wasser in Berührung bringen. Wasserstoffperoxid ist
  stark oxidierend und ätzend; mit organischen Stoffen Explosionsgefahr.
  1-Octen ist entzündbar.]

=== Aufgaben

- Warum addiert HBr an 3,3,3-Trifluorpropen gegen die Markownikoff-Regel?
- Erklären Sie, weshalb die Hydrierung von Alkinen mit Lindlar-Katalysator bei
  *cis*-Alkenen stehenbleibt, die Reduktion mit Natrium in flüssigem Ammoniak
  dagegen *trans*-Alkene liefert.
- Formulieren Sie die Produkte der Diels-Alder-Reaktion von Cyclopentadien mit
  Maleinsäureanhydrid und mit Acrolein; geben Sie die Stereochemie an.
