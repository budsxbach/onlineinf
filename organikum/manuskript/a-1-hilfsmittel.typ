// ============================================================================
//  A.1  Hilfsmittel und Methoden zur Durchführung organisch-chemischer Reaktionen
// ============================================================================

#import "/vorlage/layout.typ": *

== Hilfsmittel und Methoden zur Durchführung organisch-chemischer Reaktionen

Organisch-präparatives Arbeiten verlangt eine kleine, aber wohldefinierte
Grundausstattung: Geräte aus Glas mit genormten Schliffen, eine Wärmequelle mit
feiner Regelung, eine Rührmöglichkeit und eine Vakuumquelle. Wer diese vier
Dinge beherrscht, kann nahezu jede Vorschrift dieses Buches ausführen. Die
folgenden Abschnitte beschreiben die Geräte, ihre Verbindung untereinander und
die Handgriffe, die den Unterschied zwischen einer sauberen und einer
verlorenen Umsetzung ausmachen.

=== Glassorten und -verbindungen

Im Laboratorium wird fast ausschließlich Borosilicatglas 3.3 verwendet. Es hat
einen linearen Ausdehnungskoeffizienten von 3,3·10#super[−6] K#super[−1], hält
Temperaturwechsel von etwa 120 K ohne Riß aus und ist gegen Wasser, Säuren und
die meisten organischen Lösungsmittel beständig. Schwach alkalische Lösungen
greifen die Oberfläche an; für längeres Erhitzen mit Laugen verwendet man
Glasgeräte der Klasse 1 oder Quarz.

#figure(
  table(
    columns: (1.05fr, 1.5fr, 1.35fr, 0.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header(
      [*Werkstoff*], [*Beständigkeit*], [*Anwendung*], [*Einsatzgrenze*],
    ),
    [Borosilicat 3.3], [Säuren, Lösungsmittel; nicht für heiße Laugen], [Kolben, Kühler, Rohre, Schliffe], [500 °C],
    [Natronglas], [wie oben, geringere Temperaturwechselbeständigkeit], [Vorlagen, Flaschen, Messzylinder], [120 °C],
    [Quarzglas], [fast universell, auch Halogene bei Rotglut], [Hochtemperaturreaktionen, Photochemie], [1000 °C],
    [Polypropylen], [Laugen, Flußsäure], [Vorratsgefäße, Waschflaschen], [100 °C],
    [Polytetrafluorethylen (PTFE)], [fast alle Chemikalien], [Hähne, Dichtungen, Rührblätter], [250 °C],
  ),
  caption: [Werkstoffe im Laboratorium.],
) <tab:werkstoffe>

#stichwort[Schliffe][
  Normschliffe nach DIN 12242 verbinden Geräteteile gasdicht und lösungsmittelfest. Man bezeichnet sie mit Kern (männlich) und Hülse (weiblich), zum Beispiel NS 29/32: größter Durchmesser 29 mm, Länge 32 mm. Kleine Geräte haben NS 14,5/23, mittlere NS 29/32, große NS 45/40. Jeder Schliff wird *vor* dem Zusammenbau dünn gefettet — bei Lösungsmitteln, die Fett lösen (Kohlenwasserstoffe, Ether, Chloroform), verwendet man PTFE-Hülsen oder fettfreie Schliffe. Nicht gefettete Schliffe setzen sich nach dem Erhitzen fest und lassen sich nur noch mit Gewalt lösen.
]

*Normschliff-Kegel* dürfen nicht verkantet werden: Man setzt sie senkrecht auf
und dreht sie unter leichtem Druck. Zum Befestigen von Schlaucholiven genügt
Gummischlauch; für Vakuum verwendet man dickwandige, gewebeverstärkte Schläuche.
Klammern (Kreuz- oder Zweizackklammern) sichern jede Verbindung gegen
Auseinandergleiten.

=== Arbeitsgefäße

Man unterscheidet Rundkolben (ein- und mehrhalsig), Stehkolben,
Erlenmeyerkolben, Bechergläser und Saugflaschen. Für Umsetzungen unter Rückfluß
und im Vakuum ist der *Rundkolben* die richtige Wahl: er ist druckstabil und
läßt sich gleichmäßig rühren. Erlenmeyerkolben dienen zum Auffangen von
Destillaten und zum Umkristallisieren, Bechergläser für wäßrige Arbeiten ohne
Rückfluß.

#figure(
  table(
    columns: (auto, 1fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Gerät*], [*Verwendung*], [*Füllgrad*]),
    [Rundkolben, einhalsig], [Rückfluß, Destillation, Vakuum], [⅓–⅔],
    [Rundkolben, zwei-/dreihalsig], [gleichzeitiges Rühren, Zutropfen, Thermometrie], [⅓–½],
    [Stehkolben], [Fraktionierung, Kristallisation], [⅓–⅔],
    [Erlenmeyerkolben], [Vorlage, Umkristallisieren, Titration], [¼–⅔],
    [Becherglas], [wäßrige Umsetzungen, Ausfällen], [⅓–½],
    [Saugflasche], [Absaugen, Vakuumvorlage], [bis ⅔],
    [Standzylinder], [Gasentwicklung, Bromierung], [⅓],
  ),
  caption: [Gefäße und ihr günstiger Füllgrad. Der Füllgrad bezieht sich auf das
    Nennvolumen; bei Siedevorgängen bleibt mindestens ein Drittel als
    Schaumraum frei.],
) <tab:gefaesse>

Größe und Ansatz gehören zusammen: Ein Ansatz von 1 mol in einem 250-ml-Kolben
kocht über, ein Ansatz von 0,05 mol in einem 2-l-Kolben erwärmt sich zu
langsam und läßt sich nicht rühren. Als Regel gilt: Das Reaktionsvolumen füllt
etwa ein Drittel des Kolbens.

=== Kühler

Der Kühler führt die Verdampfungswärme ab und hält das Lösungsmittel im
Kolben. Bauart und Kühlmitteltemperatur richten sich nach dem Siedepunkt des
Mediums — nicht nach der verfügbaren Wassermenge.

#figure(
  image("/bilder/apparate/kuehlerarten.svg", width: 96mm),
  caption: [Kühlerbauarten. *a* Liebig-Kühler (Mantelkühler), *b* Kugelkühler,
    *c* Schlangenkühler, *d* Intensivkühler mit eingeschmolzenen Stäben.],
) <fig:kuehlerarten>

#figure(
  table(
    columns: (auto, auto, 1fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Kühler*], [*Kühlfläche*], [*Einsatz*]),
    [Liebig], [klein], [Siedepunkte 60–130 °C, absteigend bei Destillationen],
    [Kugel], [mittel], [Rückfluß bei mittleren Siedepunkten, gute Rückhaltewirkung],
    [Schlange], [groß], [leichtsiedende Medien, absteigend],
    [Intensiv], [groß], [Rückfluß bei niedrigem Siedepunkt, geringer Druckverlust],
    [Kryostat-Kühler], [groß], [Siedepunkte unter 0 °C, Kühlmittel −20 bis −78 °C],
  ),
  caption: [Auswahl des Kühlers nach Siedepunkt und Aufgabenstellung.],
) <tab:kuehler>

Für Siedepunkte unter 40 °C genügt Leitungswasser nicht; man kühlt mit
Eiswasser (0 °C), mit Methanol/Trockeneis (−78 °C) oder mit einem Kryostaten.
Für Siedepunkte über 130 °C kann Luftkühlung ausreichen; ein Wassermantel ist
dann wirkungslos und täuscht Sicherheit vor.

#gefahr[Kühler sind kein geschlossenes System: Beim Verstopfen des
Kühlwasserzuflusses steigt der Druck, der Schlauch rutscht ab, und heißes
Lösungsmittel spritzt aus. Schläuche mit Schlauchschellen sichern, Ablauf frei
in den Ausguß führen, nie mit dem Mund ansaugen.]

=== Schliffe und Dichtungen

Glasgeräte werden über Normschliffe verbunden; die Bezeichnung NS 29/32 gibt
Durchmesser und Länge des Schliffes in Millimetern an. Kleinere Schliffe (14/23)
dienen Thermometern und Mikroaufsätzen, die größeren (45/40) den
Destillationsköpfen. Ein Schliff hält nur, wenn er sauber, fettarm geschmiert
und nicht verkantet ist.

#figure(
  table(
    columns: (1.2fr, 1.8fr, 1.4fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verbindung*], [*Einsatz*], [*Dichtung*]),
    [NS 14/23], [Thermometer, kleine Aufsätze], [dünner Fettfilm],
    [NS 29/32], [Kolben, Kühler, Standardapparatur], [Ketten- oder Vakuumfett],
    [NS 45/40], [Destillationsköpfe, große Apparaturen], [Vakuumfett],
    [Gummiseptum], [Inertgas, Probenahme], [PTFE-beschichtet],
    [Schlaucholive], [Gas- und Kühlwasserleitungen], [Schlauchklemme],
  ),
  caption: [Schliffe, Anschlüsse und ihre Dichtung. Für Vakuum wird festeres
    Fett verwendet als für Apparaturen unter Atmosphärendruck.],
) <tab:schliffe>

*Schmieren und Lösen.* Gefettet wird sparsam: ein dünner Film auf dem inneren
Teil, danach drehend aufsetzen — ein fettsauberer Schluß zeigt zuviel Fett.
Festsitzende Schliffe löst man mit Heißluft (Fön) oder Schleifenlöser
(Glycerin mit wenig Kalilauge); wer gleichzeitig drebt und hebelt, sprengt
das Glas. Zum Abdichten von Schläuchen und Anschlüssen dient PTFE-Band;
Gummistopfen sind für organische Dämpfe nur kurzfristig geeignet.

=== Standardapparaturen für organisch-chemische Reaktionen

Vier Anordnungen decken den größten Teil der präparativen Arbeit ab. Alle
werden von unten beheizt, von oben gekühlt und über Klammern am Stativ geführt;
der Kolben darf nie frei am Kühler hängen.

#figure(
  grid(
    columns: (1fr, 1fr),
    gutter: 6mm,
    figure(
      image("/bilder/apparate/rueckfluss.svg", width: 40mm),
      caption: [Rückflußapparatur: (1) Kühler, (2) Rundkolben, (3) Heizbad.],
    ),
    figure(
      image("/bilder/apparate/reaktionsapparatur.svg", width: 44mm),
      caption: [Dreihalsapparatur mit Rührer, Tropftrichter und Thermometer:
        (1) Tropftrichter, (2) Thermometer, (3) Heizbad.],
    ),
  ),
) <fig:standardapparaturen>

#stichwort[Rückfluß][
  Der Kolben trägt einen senkrecht stehenden Kühler. Das Lösungsmittel siedet, kondensiert im Kühler und läuft zurück. Die Reaktionstemperatur ist durch den Siedepunkt festgelegt — ein Vorteil, denn sie regelt sich selbst. Zum Zutropfen von Reagenzien verwendet man einen Tropftrichter im zweiten Hals; die Zugabegeschwindigkeit bestimmt dann die Reaktionsgeschwindigkeit.
]

#stichwort[Dreihalsapparatur][
  Sie erlaubt gleichzeitig Rühren, Zutropfen und Messen. Der mittlere Hals trägt den Rührer (oder den Kühler, wenn gerührt wird), die Seitenhälse Tropftrichter und Thermometer. Der Rührer wird mit einer PTFE-Hülse im Hals geführt; die Welle muß senkrecht stehen, sonst schlägt sie aus.
]

#stichwort[Destillation][
  Der Destillationskopf (Claisen-Aufsatz) trennt Dampfweg und Rücklauf. Das Thermometer sitzt so, daß sein Quecksilbergefäß vom aufsteigenden Dampf umspült wird — also unterhalb des Seitenabgangs, nicht im Kolbenhals. Der absteigende Kühler wird mit Wasser im Gegenstrom gekühlt.
]

#stichwort[Vakuumdestillation][
  Bei vermindertem Druck sinkt der Siedepunkt; die Apparatur muß druckfest und dicht sein. Als Vorlage dient eine Saugflasche, die über eine Kühlfalle mit der Pumpe verbunden ist. Siedesteine wirken im Vakuum schlecht; man verwendet eine Kapillare mit feiner Öffnung oder einen Magnetrührer mit Siedesteinchen.
]

#figure(
  grid(
    columns: (1fr, 1fr),
    gutter: 6mm,
    figure(
      image("/bilder/apparate/destillation.svg", width: 44mm),
      caption: [Destillation: (1) Thermometer, (2) Kühler, (3) Vorlage, (4) Heizbad.],
    ),
    figure(
      image("/bilder/apparate/vakuumdestillation.svg", width: 44mm),
      caption: [Vakuumdestillation: (1) beheizter Kolben, (2) Kühler, Vorlage über
        Kühlfalle an der Pumpe.],
    ),
  ),
) <fig:destillationen>

=== Rühren und Schütteln

Rühren verhindert örtliche Überkonzentrationen, hält suspendierte Feststoffe in
Bewegung und glättet die Temperatur im Kolben. Ein Magnetrührer genügt bis
etwa 500 mL Ansatzvolumen; darüber verwendet man einen KPG- oder
Propellerrührer mit Motor.

#figure(
  table(
    columns: (auto, 1fr, 1fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Rührer*], [*Eignung*], [*Grenzen*]),
    [Magnetrührkern, zylindrisch], [klare Lösungen, kleine Ansätze], [suspendiert schlecht, springt bei Viskosität],
    [Magnetrührkern, oval], [runde Kolben, geringe Füllhöhe], [geringe Rührleistung],
    [KPG-Rührer], [viskose Medien, Suspensionen], [Dichtung verschleißt, nicht für Vakuum ohne Gleitring],
    [Propellerrührer], [große Volumina, Emulgieren], [Wirbelbildung, Gaseintrag],
    [Blattrührer], [Fällungen, Kristallisation], [wandnah, Gefahr des Festlaufens],
  ),
  caption: [Rührertypen und ihre Grenzen.],
) <tab:ruehrer>

Beim Schütteln im Scheidetrichter wird der Stopfen festgehalten und der Hahn
zuerst kurz geöffnet, bevor man kräftig schüttelt — sonst sprengt der
Überdruck den Stopfen ab. Nach dem Schütteln läßt man die Phasen ruhen, bis
die Grenzfläche scharf ist.

=== Dosieren und Einleiten von Gasen

Flüssigkeiten werden über Tropftrichter, Kolbenhubpipette oder
Dosierpumpe zugegeben. Für die Zugabe unter Inertgas setzt man einen
Tropftrichter mit Druckausgleich auf; der Innendruck der Apparatur bleibt dann
konstant.

Gase leitet man über eine Waschflasche und ein Trockenrohr ein. Die Reihenfolge
ist immer: Gasquelle → Waschflasche (Entfernen saurer Begleiter) → Trockenrohr →
Reaktionsgefäß → Blasenzähler. Der Blasenzähler zeigt den Gasdurchfluß und
verhindert gleichzeitig das Zurücksaugen.

#figure(
  image("/bilder/apparate/gaswaschflasche.svg", width: 62mm),
  caption: [Gaszuführung: (1) Waschflasche mit Tauchrohr, (2) Trockenrohr mit
    Trockenmittel. Der Gasaustritt wird über einen Blasenzähler geführt.],
) <fig:gaswaschflasche>

Die Durchflußmenge stellt man mit einem Nadelventil oder Rotameter ein und
kontrolliert sie über die Blasenzahl pro Minute. Als Faustregel gelten 2 bis 5
Blasen pro Sekunde für präparative Ansätze.

=== Arbeiten unter Inertgas

Für wasser- und luftempfindliche Reagenzien (Grignard, Alkalimetalle, viele
Metallkomplexe) wird die Apparatur mit Stickstoff oder Argon geflutet. Argon
ist teurer, aber schwerer als Luft und deckt die Oberfläche besser ab;
Stickstoff aus der Bombe muß über eine Säule mit Kupferkatalysator und
Molekularsieb von Sauerstoff und Wasser befreit werden.

*Der Vakuum-Inertgas-Zyklus.* Man evakuiert die Apparatur, füllt mit Inertgas
und wiederholt das dreimal; erst dann gilt die Atmosphäre als inert. Bei
Schlenkkolben genügt die gleiche Prozedur über den Hahn, an dem Pumpe und
Gasleitung anschließbar sind.

*Spritzen und Kanülen.* Flüssigkeiten werden mit Spritzen durch ein Septum
zugeführt. Die Spritze wird vorher dreimal mit Inertgas gespült und mit der
Kanüle gefüllt, indem man das Gas aus dem Vorratsgefäß ansaugt; beim
Einleiten gleicht eine zweite, feine Kanüle den Druck aus. Feststoffe füllt
man unter Gegenstrom oder im Handschuhkasten.

#gefahr[Spritzenkanülen sind Hohlnadeln: sie werden nie abgedeckt, nie in den
Mund genommen und in dafür vorgesehene Behälter entsorgt. Druckgasflaschen
stehen gesichert am Stativ, das Ventil zeigt vom Arbeitsplatz weg; der
Minderdruckregler wird nie mehr als halb geöffnet.]

=== Heizen und Kühlen

#figure(
  table(
    columns: (auto, auto, 1fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Bad*], [*Bereich/°C*], [*Hinweise*]),
    [Wasserbad], [20–95], [billig, gute Regelung; verdampft, Bad regelmäßig nachfüllen],
    [Ölbad (Silikonöl)], [60–250], [gleichmäßig; Rauch beim Überhitzen, Ölwechsel jährlich],
    [Metallbad (Legierung)], [80–400], [hohe Wärmeleitfähigkeit, oxidiert an Luft],
    [Sandbad], [100–400], [träge, für kleine Kolben; Wärmeverteilung ungleichmäßig],
    [Heizpilz], [20–400], [schnell, sehr direkte Wärme; Kolben nie ganz einschließen],
    [Eis/Wasser], [0], [Kühlung wäßriger Reaktionen],
    [Eis/Natriumchlorid], [−18], [Kältemischung, 3 : 1],
    [Methanol/Trockeneis], [−78], [Dewargefäß, Methanol vorher trocknen],
    [flüssiger Stickstoff], [−196], [nur mit Dewar und Schutzbrille, nie in geschlossene Gefäße],
  ),
  caption: [Temperaturbäder und Kältemischungen.],
) <tab:baeder>

Bei Reaktionen, deren Temperatur genau gehalten werden muß, taucht man ein
Thermometer in das *Bad*, nicht nur in das Reaktionsgemisch: Die Badtemperatur
führt, die Innentemperatur folgt. Differenzen von mehr als 20 K zwischen Bad
und Inhalt deuten auf mangelnde Wärmeübertragung oder auf eine stark
endotherme Reaktion hin.

#gefahr[Ölbäder über 250 °C und Heizpilze ohne Regelung sind die häufigste
Ursache von Laborbränden. Heizquellen nie ohne Aufsicht betreiben, brennbare
Lösungsmitteldämpfe von der Heizplatte fernhalten, Bad und Kolben gegen
Umkippen sichern.]

=== Arbeiten unter vermindertem und erhöhtem Druck

#stichwort[Vakuum][
  Eine Wasserstrahlpumpe erreicht etwa 15 mbar, eine Drehschieberpumpe 0,1 mbar, eine Öldiffusionspumpe 10#super[−5] mbar. Für Destillationen bis 200 °C genügt die Wasserstrahlpumpe. Zwischen Reaktionsgefäß und Pumpe gehört immer eine Kühlfalle, sonst zieht die Pumpe Lösungsmitteldampf in das Öl.
]

Zur Dichtheitsprüfung saugt man kurz an, schließt den Hahn und beobachtet die
Druckanzeige: Fällt der Druck nicht innerhalb einer Minute um mehr als 5 mbar
ab, ist die Apparatur dicht. Häufige Leckstellen sind Schliffe, Schlaucholiven
und poröse Stopfen.

#stichwort[Überdruck][
  Reaktionen unter Druck (Hydrierungen, Carbonylierungen) werden in Druckautoklaven mit Berstscheibe und Manometer ausgeführt. Die Füllung beträgt höchstens die Hälfte des Autoklavenvolumens; vor dem Öffnen entspannt man langsam und spült mit Inertgas.
]

=== Reinigung und Pflege der Glasgeräte

Sauberes Glas ist die Voraussetzung für saubere Produkte. Die Reinigung richtet
sich nach dem Rückstand: organische Reste gehen in Lösungsmittelbad oder
Spülmaschine, harzige in warme Lauge, Kalk in verdünnte Salpetersäure, Fett in
fettlösendes Bad. Nach dem Bad wird gründlich mit Leitungswasser und zuletzt
destilliertem Wasser gespült.

#gefahr[Piranha-Lauge (konzentrierte Schwefelsäure mit Wasserstoffperoxyd) und
Chromschwefelsäure lösen auch hartnäckigste Rückstände, sind aber extrem
ätzend und explosionsgefährlich beim Kontakt mit organischem Material. Sie
gehören nicht in das Grundpraktikum; wo sie unausweichlich sind, nur in
geeigneten Abzügen mit Schutzausrüstung ansetzen und niemals mit Ethanol oder
Aceton nachspülen.]

Gefäßteile werden getrocknet, bevor sie zusammengesetzt werden: im
Trockenschrank bei 110 °C, mit Heißluft oder über Nacht an der Luft.
Zusammengesetzte Apparaturen werden vor dem Füllen auf Dichtheit geprüft —
nicht erst, wenn das Lösungsmittel siedet.

=== Die erste Ausrüstung

Für ein Grundpraktikum genügen folgende Geräte: zwei Rundkolben (100, 250, 500
mL), je ein Zweihals- und Dreihalskolben (250 mL), zwei Erlenmeyerkolben
(100, 250 mL), zwei Bechergläser (100, 400 mL), ein Liebig- und ein
Kugelkühler, ein Destillationskopf, ein absteigender Kühler, zwei
Tropftrichter (50, 100 mL), ein Scheidetrichter (250 mL), drei Glasstopfen,
ein Satellit, ein Thermometer (−10 bis 200 °C, 1-K-Teilung), eine
Siedekapillare, ein Mörser, ein Trichter mit Fritte (G 3), Rundfilter,
Siedesteine, Stativmaterial mit Klammern, eine Heizplatte mit Magnetrührer und
ein Ölbad.

#figure(
  table(
    columns: (1fr, 1fr),
    inset: (x: 6pt, y: 4pt),
    align: (left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Chemikalien*], [*Gefäße*]),
    [Natriumchlorid, Natriumsulfat (wasserfrei), Calciumchlorid], [Vorratsflaschen 250 mL, braun],
    [Natriumhydrogencarbonat, Natriumcarbonat], [Tropfflaschen 50 mL],
    [Salzsäure 37 %, Schwefelsäure 96 %, Salpetersäure 65 %], [Säureflasche mit Tropfeinsatz],
    [Natronlauge 10 %, Ammoniaklösung 25 %], [Waschflasche],
    [Ethanol, Aceton, Essigsäureethylester, Petrolether], [Lösungsmittelflasche mit Sicherheitsheber],
  ),
  caption: [Grundausstattung an Chemikalien und Vorratsgefäßen.],
) <tab:grundausstattung>

=== Literaturhinweise

Die in diesem Kapitel gemachten Angaben zu Werkstoffen, Schliffen und
Temperaturbereichen folgen den einschlägigen Normblättern (DIN 12242,
DIN ISO 3585) und den Gerätehandbüchern der Hersteller. Für die Sicherheit im
Laboratorium sei auf Teil G verwiesen, für Trennverfahren auf das folgende
Kapitel.
