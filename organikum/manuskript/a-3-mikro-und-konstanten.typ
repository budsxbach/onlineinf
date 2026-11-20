// ============================================================================
//  A.3  Arbeiten im Mikromaßstab · A.4 Physikalische Eigenschaften · A.5 Entsorgung
// ============================================================================

#import "/vorlage/layout.typ": *

== Arbeiten im Mikromaßstab

Im Mikromaßstab werden Ansätze von 0,1 bis 10 mmol ausgeführt — ein Zehntel bis
ein Hundertstel der klassischen Praktikumsgröße. Der Vorteil liegt nicht nur im
geringeren Verbrauch teurer oder gefährlicher Reagenzien: Kleine Ansätze
erwärmen und kühlen sich schnell, erreichen gleichmäßige Temperatur und lassen
sich vollständig aufarbeiten, ohne daß Verluste beim Umfüllen dominieren.

=== Geräte

#figure(
  table(
    columns: (auto, 1fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Gerät*], [*Verwendung im Mikromaßstab*], [*Nennvolumen*]),
    [Spitzkolben], [Umsetzungen mit Rückfluß, Aufarbeitung], [5, 10, 25 mL],
    [Zentrifugenglas], [Fällungen, Phasentrennung], [10, 15 mL],
    [Reaktionsröhrchen mit Schliff], [Umsetzungen unter Schutzgas], [5 mL],
    [Pipette mit Kolbenhub], [Dosieren von 10–1000 µL], [—],
    [Mikro-Scheidetrichter], [Ausschütteln], [5, 10 mL],
    [Mikro-Destillationsapparatur], [Kugelrohrdestillation], [1–5 mL],
    [Kapillarpipette], [Probenahme für DC und Spektren], [1–10 µL],
  ),
  caption: [Geräte für den Mikromaßstab.],
) <tab:mikrogeraete>

Für Umsetzungen unter Rückfluß genügt ein Spitzkolben von 10 mL mit einem
Kugelkühler, dessen Kugelvolumen den Dampfraum klein hält. Der
Wärmeeintrag erfolgt über ein Wasserbad, nicht über eine freie Heizplatte: Ein
10-mL-Ansatz überhitzt in Sekunden.

=== Mengen und Konzentrationen

Die Rechenregel bleibt dieselbe, nur die Bezugsgröße ändert sich. Für einen
Ansatz mit 2 mmol Edukt und einem Äquivalent Reagenz:

$ m = n dot M = 2 dot 10^(-3) "mol" dot M [ "g·mol"^(-1) ] $

Ein Reagenz mit M = 150 g·mol⁻¹ ist danach 0,300 g abzuwiegen. Für Flüssigkeiten
gilt entsprechend V = m/ρ; bei ρ = 1,10 g·cm⁻³ sind das 0,273 mL, also 273 µL.

#figure(
  table(
    columns: (auto, auto, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, right),
    fill: (x, y) => if y == 0 { luma(238) } else if calc.even(y) { luma(250) } else { none },
    stroke: none,
    table.header([*Maßstab*], [*Edukt*], [*Lösungsmittel*], [*Kolben*]),
    [Makro], [0,1–1 mol], [50–500 mL], [250–2000 mL],
    [Halbmikro], [10–50 mmol], [5–50 mL], [50–250 mL],
    [Mikro], [0,1–10 mmol], [0,5–10 mL], [5–25 mL],
  ),
  caption: [Maßstäbe in der präparativen organischen Chemie.],
) <tab:massstaebe>

=== Verluste beherrschen

Im Mikromaßstab entstehen Verluste vor allem beim Umfüllen und beim Trocknen.
Drei Regeln helfen:

- *Nichts umfüllen.* Aufarbeitung im Reaktionsgefäß, Abpipettieren der Phasen,
  Abzentrifugieren der Feststoffe.
- *Nicht trocknen, was nicht naß ist.* Ein Trockenmittel im Mikromaßstab bindet
  mehr Produkt als Wasser; man entfernt das Lösungsmittel am Rotationsverdampfer
  oder im Stickstoffstrom.
- *Wägen statt schätzen.* Die Ausbeute wird auf 0,1 mg genau bestimmt; ein
  Verlust von 20 mg sind bei 0,2 g Ansatz bereits 10 %.

=== Kugelrohrdestillation

Kleine Mengen (bis 1 g) werden im Kugelrohr bei 0,01–1 mbar destilliert. Der
Kolben wird im Heizblock langsam auf die Badtemperatur gebracht, das Destillat
kondensiert in der gekühlten Kugel. Kriterium für das Ende der Destillation ist
das Ausbleiben eines Films in der Kugel, nicht der Temperaturanstieg.

#gefahr[Im Mikromaßstab steigt das Verhältnis von Oberfläche zu Volumen stark
an: Dämpfe treten in größerer Konzentration aus, und Spritzer treffen wegen der
kurzen Wege sofort die Augen. Schutzbrille ist auch bei 1 mL Pflicht; Gase
werden über eine Kapillare in den Abzug geführt.]

== Bestimmung physikalischer Eigenschaften

Die physikalischen Konstanten dienen der Identifizierung und der Reinheits-
kontrolle. Wer sie sauber mißt, braucht oft keine Spektren, um ein Produkt
einzuschätzen.

=== Schmelzpunkt

Der Schmelzpunkt wird in einer Kapillare im Schmelzpunktapparat bestimmt; bei
reinen Stoffen ist er mit dem Gefrierpunkt identisch. Man
füllt die Substanz 2–3 mm hoch ein, erwärmt mit 2 K·min⁻¹ und notiert Beginn
und Ende des Schmelzens. Reine Stoffe schmelzen auf 0,5–1 K; Verunreinigungen
senken den Schmelzpunkt und verbreitern den Bereich.

#figure(
  table(
    columns: (auto, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Substanz*], [*Schmp./°C*], [*Schmelzbereich reiner Ware*]),
    [Benzoesäure], [122,4], [122–123],
    [Acetanilid], [114,3], [113–115],
    [Harnstoff], [132,7], [132–134],
    [Zimtsäure], [133], [132–134],
    [Naphthalin], [80,2], [79–81],
  ),
  caption: [Schmelzpunkte gebräuchlicher Vergleichssubstanzen.],
) <tab:schmelzpunkte>

Ein Mischschmelzpunkt mit der vermuteten Substanz bestätigt die Identität:
Stimmen beide Schmelzpunkte überein und zeigt das Gemisch keine Depression, ist
die Verbindung identisch.

=== Siedepunkt und Dampfdruck

Der Siedepunkt ist druckabhängig. Für die Umrechnung von Meßwerten auf
Normaldruck genügt im Bereich 20 bis 200 °C die Näherung

$ T_"norm" approx T_"mess" + (p_"norm" - p_"mess") \/ 3.3 $

mit Drücken in mbar und Temperaturen in K. Die Gleichung ist eine Faustformel;
für genaue Angaben verwendet man die Dampfdruckgleichung nach Clausius-Clapeyron
oder Tabellen (siehe Anhang).

=== Dichte

Die Dichte wird mit einem Pyknometer oder — bei kleinen Mengen — mit einer
kalibrierten Spritze bestimmt: Man wiegt 500 µL bei 20 °C und berechnet

$ rho = m \/ V dot (1 - (t - 20) dot 0.0009) $

Die Korrektur berücksichtigt die Wärmeausdehnung des Gefäßes. Für die
Reinheitskontrolle genügt eine Abweichung von weniger als 0,005 g·cm⁻³ vom
Literaturwert.

=== Brechungsindex

Das Refraktometer mißt den Brechungsindex bei 20 °C und der Natrium-D-Linie
(589 nm). Die Temperaturkorrektur beträgt −0,00045 pro Kelvin. Ein reiner Stoff
zeigt eine Abweichung von höchstens 0,0005 vom Literaturwert; größere
Abweichungen deuten auf Wasser oder Lösungsmittelreste.

=== Optische Drehung

Chirale Substanzen drehen die Ebene des polarisierten Lichts. Man mißt den
Drehwinkel α bei 589 nm in einem Polarimeter mit 1-dm-Rohr und berechnet die
spezifische Drehung

$ [alpha]_D^20 = alpha \/ (l dot c) $

mit l in dm und c in g·mL⁻¹. Die Angabe erfolgt mit Lösungsmittel, da die
Drehung stark vom Medium abhängt.

=== Molmasse und Elementaranalyse

*Molmasse aus der Gefrierniedrigung (Gefrierpunktserniedrigung,
Kryoskopie).* Löst man eine Substanz in einem
Lösungsmittel, sinkt dessen Schmelzpunkt proportional zur Molalität:

$ Delta T = K_k dot m quad "mit" quad m = n_"Stoff" \/ m_"Lösungsmittel" $

Die kryoskopische Konstante $K_k$ beträgt für Wasser 1,86, für Benzol 5,12, für
Campher 39,7 K·kg·mol⁻¹. Campher eignet sich deshalb für kleine Mengen
(Rast-Methode): 2–5 mg Substanz in 50 mg Campher, Schmelzpunkt vor und nach dem
Mischen.

Ein Beispiel: 4,0 mg Substanz in 50 mg Campher senken den Schmelzpunkt von
178 °C auf 168 °C. Dann ist $Delta T = 10$ K, $m = 10 \/ 39,7 = 0,252$
mol·kg⁻¹, und mit $m_"Lösungsmittel" = 5,0 dot 10^(-5)$ kg folgt
$n = 1,26 dot 10^(-5)$ mol, also $M = 4,0 dot 10^(-3) \/ 1,26 dot 10^(-5) = 317$
g·mol⁻¹.

*Elementaranalyse.* Die Verbrennung im Sauerstoffstrom liefert CO#sub[2],
H#sub[2]O und N#sub[2]; aus deren Massen ergeben sich die Massenanteile von C, H
und N. Der Rest ist Sauerstoff (oder Halogen, das separat bestimmt wird).

$ "C-Anteil" = m_("CO"_2) dot 12,011 \/ 44,009 \/ m_"Einwaage" dot 100 % $

*Summenformel und Unsättigungsgrad.* Aus den Massenanteilen und der Molmasse
ergibt sich die Summenformel; der Unsättigungsgrad folgt aus

$ I = (2 C + 2 - H + N - X) \/ 2 $

mit C, H, N, X als Anzahl der Atome. Ein $I$ von 4 bedeutet vier Ringe oder
Doppelbindungen — bei einem Aromaten mit einer Carbonylgruppe ist das der
Normalfall.

#figure(
  table(
    columns: (1.5fr, auto, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Substanz*], [*C in %*], [*H in %*], [*O in %*]),
    [Benzoesäure], [68,84], [4,95], [26,21],
    [Essigsäure], [40,00], [6,71], [53,29],
    [Acetanilid], [71,09], [6,71], [11,84],
    [Zimtsäure], [72,96], [5,44], [21,60],
    [Nitrobenzol], [58,54], [4,09], [25,98],
  ),
  caption: [Theoretische Elementarzusammensetzung. Die Abweichung einer
    Messung sollte unter 0,3 % absolut liegen.],
) <tab:elementaranalyse>

=== Spektroskopische Methoden

Für die Strukturaufklärung sind vier Verfahren Standard. Sie ergänzen sich:
IR zeigt funktionelle Gruppen, UV/VIS konjugierte Systeme, NMR das
Kohlenstoffgerüst, MS die Molmasse und Fragmente.

#figure(
  table(
    columns: (auto, 1fr, 1fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Methode*], [*Information*], [*Probenmenge*]),
    [IR], [funktionelle Gruppen, Wasserstoffbrücken], [1 mg],
    [UV/VIS], [Chromophore, Konjugation], [0,1 mg in 10 mL],
    [#super[1]H-NMR], [Wasserstoffumgebung, Integrale, Kopplungen], [2–5 mg],
    [\#super[13]C-NMR], [Kohlenstoffgerüst, Symmetrie], [10–20 mg],
    [MS], [Molmasse, Fragmentierung], [< 1 mg],
  ),
  caption: [Spektroskopische Methoden und ihr Probenbedarf.],
) <tab:spektren>

Für die Aufnahme genügt in der Regel eine Kapillarpipette Substanz; die
Reinheit wird vorher dünnschichtchromatographisch geprüft. Ein Spektrum eines
verunreinigten Produkts ist wertlos, ein DC-Bild sagt mehr als jede
Nachreinigung.

== Aufbewahrung von Chemikalien und Entsorgung

=== Aufbewahrung

Chemikalien werden nach Gefahrstoffklassen getrennt gelagert, nicht nach
Alphabet. Die entscheidenden Trennungen sind: Oxidationsmittel von
Reduktionsmitteln, Säuren von Basen, Wasserstoffbildner von Halogenen. Für
kleine Laborbestände genügt ein Sicherheitsschrank mit zwei Fächern.

#figure(
  table(
    columns: (auto, 1fr, 1fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Stoffgruppe*], [*Beispiele*], [*Nicht zusammen mit*]),
    [Oxidationsmittel], [Nitrate, Permanganate, Peroxide, Chlorate], [Reduktionsmitteln, organischen Stoffen],
    [Reduktionsmittel], [Hydride, Sulfide, Ameisensäure], [Oxidationsmitteln, Säuren],
    [Säuren], [Salzsäure, Schwefelsäure, Essigsäure], [Basen, Cyaniden, Sulfiden],
    [Basen], [Natronlauge, Ammoniak, Amine], [Säuren, Halogenen],
    [Alkalimetalle], [Natrium, Kalium, Lithium], [Wasser, Halogenen, Alkoholen],
    [Lösungsmittel], [Ether, Kohlenwasserstoffe, Alkohole], [Oxidationsmitteln, Hitzequellen],
  ),
  caption: [Trennung nach Gefahrstoffgruppen bei der Lagerung.],
) <tab:lagerung>

*Ether* bilden bei Lagerung Peroxide, die beim Destillieren schlagartig
zerfallen können. Vor Gebrauch prüft man mit Kaliumiodid-Stärke-Papier oder
Eisen(II)-thiocyanat; peroxidhaltige Ether werden verworfen, nicht destilliert.

=== Entsorgung

Abfälle werden am Entstehungsort getrennt und beschriftet. Ein Sammelgefäß ohne
Angabe von Inhalt und Datum ist ein Gefahrstoff ohne Sicherheitsdatenblatt.

#figure(
  table(
    columns: (auto, 1fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Abfallgruppe*], [*Behandlung*]),
    [halogenfreie organische Lösungsmittel], [Destillation oder Sammelstelle für Lösungsmittel],
    [halogenhaltige Lösungsmittel], [getrennt sammeln, Verbrennung],
    [wäßrige Säuren und Basen], [neutralisieren, nach Prüfung in den Ablauf],
    [Schwermetallsalze], [fällen, als Sonderabfall abgeben],
    [Feststoffe mit organischen Anteilen], [Sonderabfall, nicht in den Hausmüll],
    [Glasabfälle], [Borosilicatglas getrennt, Scherben in bruchsichere Behälter],
  ),
  caption: [Abfallgruppen und ihre Entsorgung.],
) <tab:abfall>

#gefahr[Nie Lösungsmittel in den Ausguß geben, auch nicht in kleinen Mengen.
Halogenierte Lösungsmittel dürfen nicht mit Alkalimetallen oder mit
Nitromethan in Berührung kommen; Natriumreste werden mit Isopropanol
abgetötet und erst danach entsorgt.]
