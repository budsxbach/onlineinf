// ============================================================================
//  A.2  Trennverfahren
// ============================================================================

#import "/vorlage/layout.typ": *

== Trennverfahren

Trennverfahren beruhen auf unterschiedlichen physikalischen Eigenschaften:
Dampfdruck (Destillation), Löslichkeit (Extraktion, Kristallisation),
Verteilung zwischen zwei Phasen (Chromatographie) und Adsorption. In der
präparativen Praxis werden sie nacheinander eingesetzt — erst destillativ, dann
durch Umkristallisieren, dann chromatographisch.

=== Destillation und Rektifikation

Beim Sieden stellt sich ein Gleichgewicht zwischen flüssiger und gasförmiger
Phase ein. Der Dampf ist an der leichter flüchtigen Komponente angereichert;
das Verhältnis der Molenbrüche in beiden Phasen ist der *relative
Flüchtigkeitskoeffizient* α. Für ein Zweistoffgemisch gilt

#block(above: 4pt, below: 6pt, align(center, $ alpha = (y_A \/ x_A) \/ (y_B \/ x_B) = p_A^"sat" \/ p_B^"sat" $))

Ist α größer als etwa 1,2, läßt sich das Gemisch durch Destillation trennen.
Daraus folgen drei Arbeitsweisen:

- *Einfache Destillation* trennt Flüssigkeiten mit großem Siedeabstand
  (über 60 K) oder eine Flüssigkeit von nichtflüchtigen Bestandteilen.
- *Rektifikation* verwendet eine Kolonne, in der sich Dampf und Kondensat im
  Gegenstrom austauschen. Mit etwa 10 theoretischen Trennstufen erreicht man
  eine Reinheit, die für präparative Zwecke ausreicht.
- *Fraktionierte Destillation* sammelt getrennte Fraktionen über definierte
  Siedebereiche.

#figure(
  table(
    columns: (auto, 1fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Kolonnentyp*], [*Wirkung*], [*Trennstufen*]),
    [Leerkolonne (Vigreux)], [Rücklaufkondensation an Einkerbungen], [2–4],
    [Füllkörperkolonne], [Glasringe, Raschig-Ringe, Sattelkörper], [5–15],
    [Drehbandkolonne], [rotierendes Band, hoher Durchsatz], [10–30],
    [Spaltrohrkolonne], [kleine Spalte, sehr kleiner Hold-up], [50–100],
  ),
  caption: [Kolonnentypen für die Rektifikation im Laboratorium.],
) <tab:kolonnen>

*Arbeitsregeln.* Die Kolonne wird langsam aufgeheizt, damit sich das
Gleichgewicht einstellt. Das Rücklaufverhältnis (zurückgeführtes zu
abgenommenem Kondensat) beträgt bei schwer trennbaren Gemischen 5 : 1 bis
10 : 1. Die Siedetemperatur wird am Kolonnenkopf gemessen, nicht im Kolben. Ein
Temperatursprung von 2 K während der Destillation zeigt den Wechsel der
Fraktion an.

#figure(
  image("/bilder/apparate/destillation.svg", width: 62mm),
  caption: [Einfache Destillation: (1) Thermometer, (2) Kühler, (3) Vorlage,
    (4) Heizbad. Der Thermometerkolben sitzt im Dampfraum unterhalb des
    Seitenabgangs.],
) <fig:destillation>

=== Azeotrope und Schleppmittel

Ein Azeotrop ist ein Gemisch, das bei konstanter Zusammensetzung und Temperatur
siedet; durch einfache Destillation läßt es sich nicht weiter trennen. Man
unterscheidet *heteroazeotrope* Gemische (zwei flüssige Phasen im Destillat)
und *homogene* Azeotrope.

#figure(
  table(
    columns: (1.7fr, auto, auto, 1.2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Gemisch*], [*Sdp. °C*], [*Anteil*], [*Typ*]),
    [Wasser/Ethanol], [78,2], [95,6 % EtOH], [homogen],
    [Wasser/Butanol], [92,7], [57,5 % BuOH], [heterogen],
    [Wasser/Toluol], [84,1], [80,6 % Toluol], [heterogen],
    [Wasser/Essigsäureethylester], [70,4], [91,5 % Ester], [heterogen],
    [Ethanol/Cyclohexan], [64,9], [45 % Cyclohexan], [heterogen],
    [Wasser/Diethylether], [34,2], [98,7 % Ether], [heterogen],
    [Chloroform/Aceton], [64,5], [80 % Chloroform], [homogen],
    [Wasser/Salzsäure], [108,6], [20,2 % HCl], [homogen],
  ),
  caption: [Azeotrope mit präparativer Bedeutung. Heteroazeotrope lassen sich
    durch Phasentrennung im Destillat überwinden.],
) <tab:azeotrope>

*Entfernen von Wasser durch Schleppmittel.* Für Reaktionen, die Wasser freisetzen
(Veresterung, Acetalbildung, Enamin-Synthese), wird das Wasser als Heteroazeotrop
mit Toluol oder Cyclohexan ausgetragen. Man erhitzt am Wasserabscheider, in dem
sich das Destillat trennt; das organische Lösungsmittel läuft in den Kolben
zurück, das Wasser bleibt in der Vorlage. Der Umsatz wird erst vollständig, wenn
kein Wasser mehr abgeschieden wird.

*Entwässern von Ethanol.* Der klassische Weg führt über das ternäre Azeotrop
Wasser/Benzol/Ethanol (64,9 °C); wegen der Cancerogenität des Benzols wird heute
Cyclohexan oder Toluol verwendet. Absolutiert wird im Praktikum mit
Magnesiumspänen (Grignard-Methode) oder über Molekularsieb 3 Å.

*Trennung eines Azeotrops.* Drei Möglichkeiten: Zugabe eines Schleppmittels,
das ein neues, günstiger gelegenes Azeotrop bildet; Druckwechseldestillation
(das Azeotrop verschiebt sich mit dem Druck); oder ein Trennverfahren, das nicht
auf dem Dampfdruck beruht (Extraktion, Adsorption, Pervaporation). Die
Zugabe eines Salzes (Aussalzen) verschiebt die Lage des Azeotrops ebenfalls.

=== Wasserdampfdestillation

Mit Wasserdampf lassen sich Substanzen schonend aus Gemischen austreiben, die
mit Wasser nicht mischbar sind und einen Dampfdruck von mindestens 1 mbar bei
100 °C besitzen. Das Destillat ist ein Zweiphasengemisch; die Siedetemperatur
liegt unter 100 °C und damit häufig unter dem Zersetzungspunkt der Substanz.

#figure(
  image("/bilder/apparate/wasserdampfdestillation.svg", width: 66mm),
  caption: [Wasserdampfdestillation: (1) Dampferzeuger, (2) Destillationskolben,
    (3) Kühler, (4) Vorlage. Der Dampf wird über ein bis zum Kolbenboden
    reichendes Rohr eingeleitet.],
) <fig:wasserdampf>

Die Ausbeute folgt aus dem Dampfdruckverhältnis. Für ein mit Wasser nicht
mischbares Gemisch gilt bei 100 °C

$ m_"org" \/ m_"H"_2"O" = (p_"org" dot M_"org") \/ (p_"H"_2"O" dot M_"H"_2"O") $

Ein Stoff mit einem Dampfdruck von 10 mbar und der Molmasse 150 g·mol⁻¹ geht
danach im Verhältnis 1 : 8 mit Wasser über. Das bedeutet: Für 10 g Substanz
sind etwa 80 g Wasser abzudestillieren — ein Volumen, das man vor dem Ansatz
berechnet, nicht während der Destillation.

=== Vakuumdestillation und Sublimation

Bei vermindertem Druck sinkt der Siedepunkt; die Faustregel lautet: Eine
Druckerniedrigung auf ein Zehntel senkt den Siedepunkt um etwa 60 bis 80 K.
Substanzen, die sich bei 200 °C zersetzen, lassen sich bei 15 mbar und 120 °C
destillieren.

#figure(
  image("/bilder/apparate/vakuumdestillation.svg", width: 62mm),
  caption: [Vakuumdestillation: (1) beheizter Kolben mit Claisen-Aufsatz,
    (2) Kühler und Saugvorlage. Zwischen Vorlage und Pumpe sitzt eine
    Kühlfalle.],
) <fig:vakuum>

*Sublimation* trennt feste Stoffe, die ohne zu schmelzen verdampfen. Man
erhitzt im Vakuum oder bei Normaldruck und kondensiert an einer gekühlten
Fläche (Kältefinger). Die Reinheit ist hoch, die Ausbeute bei kleinen Ansätzen
mäßig; für Mengen über 5 g ist Umkristallisieren meist wirtschaftlicher.

=== Extraktion

*Flüssig/flüssig.* Ein Stoff verteilt sich in einem Zweiphasensystem aus zwei
nicht mischbaren Lösungsmitteln nach dem Verteilungskoeffizienten

$ K = c_"org" \/ c_"H"_2"O" $

Mehrmaliges Ausschütteln mit kleinen Portionen ist wirksamer als einmaliges
Ausschütteln mit dem gesamten Volumen: Bei K = 10 und gleichem
Gesamtlösungsmittelvolumen verbleiben nach dreimaligem Ausschütteln mit je
einem Drittel nur 0,1 % der Substanz in der wäßrigen Phase, nach einmaligem
Ausschütteln dagegen 9 %.

#figure(
  image("/bilder/apparate/scheidetrichter.svg", width: 52mm),
  caption: [Ausschütteln im Scheidetrichter: (1) organische Phase, (2) wäßrige
    Phase, (3) Hahn. Vor dem Schütteln wird der Hahn kurz geöffnet, um
    Überdruck abzulassen.],
) <fig:scheidetrichter>

*Fest/flüssig.* Aus festen Stoffen extrahiert man durch Digerieren, durch
Heißextraktion im Soxhlet-Apparat (für schwer lösliche Anteile) oder im
Perforator (für dichtere Extraktionsgüter).

#figure(
  grid(
    columns: (1fr, 1fr),
    gutter: 6mm,
    figure(
      image("/bilder/apparate/soxhlet.svg", width: 40mm),
      caption: [Soxhlet-Extraktion: (1) Extraktionsraum mit Hülse, (2) Kolben
        mit Lösungsmittel.],
    ),
    figure(
      image("/bilder/apparate/perforator.svg", width: 36mm),
      caption: [Perforator: (1) Extraktionsraum, (2) Kolben. Der Dampf steigt
        außen auf und kondensiert im Extraktionsgut.],
    ),
  ),
) <fig:extraktionsapparate>

=== Kristallisation und Umkristallisieren

Die Löslichkeit fast aller Feststoffe steigt mit der Temperatur. Man löst in
der *Siedehitze* in möglichst wenig Lösungsmittel, filtriert heiß von
Unlöslichem ab und läßt langsam abkühlen. Entscheidend sind drei Größen:
Lösungsmittelmenge, Abkühlgeschwindigkeit und Keimbildung.

#figure(
  image("/bilder/apparate/umkristallisieren.svg", width: 58mm),
  caption: [Umkristallisieren: (1) heiße Lösung im Erlenmeyerkolben,
    (2) Trichter mit Faltenfilter und Heißwassertrichter, (3) Kristallisierschale
    mit Filtrat.],
) <fig:umkristallisieren>

*Lösungsmittelwahl.* Gesucht ist ein Lösungsmittel, in dem die Substanz bei
Siedehitze gut und bei Raumtemperatur schlecht löslich ist. Bewährt hat sich
die Prüfung in Reagenzgläsern mit den Stufen Petrolether, Cyclohexan, Toluol,
Essigsäureethylester, Aceton, Ethanol, Wasser. Löst sich der Stoff in keinem
der Lösungsmittel in der Kälte, aber in einem in der Wärme, ist das die Wahl.

*Arbeitsgang.* Man legt 1 g Rohprodukt vor, gibt 5 mL Lösungsmittel zu, erhitzt
zum Sieden und tropft weiteres Lösungsmittel bis zur klaren Lösung zu. Dann
gibt man 10 % Überschuß zu, um Verluste beim Heißfiltrieren auszugleichen,
filtriert durch ein Faltenfilter und läßt im Eisbad kristallisieren. Die
Kristalle werden abgesaugt, mit eiskaltem Lösungsmittel gewaschen und im
Exsikkator getrocknet.

#gefahr[Beim Umkristallisieren aus brennbaren Lösungsmitteln nie über offener
Flamme erhitzen; das Heißfiltrat nicht in geschlossenen Gefäßen abkühlen lassen.
Aktive Kohle zum Entfärben kann sich nach dem Trocknen selbst entzünden.]

=== Trocknen

*Trocknen von Flüssigkeiten.* Man setzt ein Trockenmittel zu, schwenkt um und
beobachtet, ob es verklumpt. Klumpt es, wird abfiltriert und frisches
Trockenmittel zugesetzt, bis es rieselfähig bleibt.

*Gefriertrocknung.* Wasserhaltige, hitzeempfindliche Substanzen (Naturstoffe,
Enzyme, Fermente) werden lyophilisiert: Die Probe wird tiefgefroren und das
Eis im Vakuum sublimiert. Die Struktur bleibt erhalten, das Pulver ist
unbegrenzt haltbar und leicht wieder löslich.

#figure(
  table(
    columns: (auto, 1fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Trockenmittel*], [*Geeignet für*], [*Restwassergehalt*]),
    [Calciumchlorid], [Kohlenwasserstoffe, Halogenkohlenwasserstoffe], [mittel],
    [Natriumsulfat], [fast alle Lösungsmittel, schonend], [mittel],
    [Magnesiumsulfat], [Ester, Ether, Amine], [gut],
    [Kaliumcarbonat], [Alkohole, Ketone, Amine], [gut],
    [Molekularsieb 3 Å], [Lösungsmittel, Gase, schonend], [sehr gut],
    [Natrium, Kalium], [Ether, Kohlenwasserstoffe (destillativ)], [sehr gut],
    [Phosphorpentoxid], [Gase, Kohlenwasserstoffe], [sehr gut],
  ),
  caption: [Trockenmittel und ihre Eignung. Calciumchlorid ist für Alkohole,
    Ketone und Amine ungeeignet, da es diese bindet.],
) <tab:trockenmittel>

=== Chromatographie

*Dünnschichtchromatographie (DC).* Auf einer mit Kieselgel beschichteten Platte
wandert der Stoff mit dem Fließmittel; der Rf-Wert ist der Quotient aus
Laufstrecke der Substanz und Laufstrecke des Fließmittels. Die DC dient der
Reaktionskontrolle und der Suche nach dem richtigen Fließmittel für die
Säulenchromatographie.

#figure(
  image("/bilder/apparate/dc-platte.svg", width: 54mm),
  caption: [Dünnschichtchromatogramm: (1) Fließmittelfront, (2) getrennte
    Zonen, (3) Startlinie.],
) <fig:dc>

*Säulenchromatographie.* Die stationäre Phase ist Kieselgel (normal) oder
Kieselgel mit Alkylketten (RP-18, umgekehrte Phase). Man füllt als Aufschlämmung
in das Laufmittel, trägt die Substanz gelöst oder an Kieselgel adsorbiert auf
und eluiert mit steigender Polarität. Das Verhältnis von Substanz zu Kieselgel
beträgt 1 : 30 bis 1 : 100.

#figure(
  image("/bilder/apparate/chromatographiesaeule.svg", width: 48mm),
  caption: [Säulenchromatographie: (1) Laufmittel, (2) Kieselgel,
    (3) Fraktionsgefäß.],
) <fig:saeule>

*Gaschromatographie (GC).* Für flüchtige Stoffe bis etwa 300 °C. Als Trägergas
dient Stickstoff oder Helium; die Trennung erfolgt an einer Kapillarsäule mit
Polysiloxan-Phase. Die GC ist analytisch; präparativ werden Proben von 0,1 bis
1 g getrennt.

*Hochdruckflüssigchromatographie (HPLC).* Für nichtflüchtige und thermolabile
Stoffe. Die Trennung erfolgt an feinen Kieselgelteilchen (3–10 µm) unter
Drücken von 50 bis 400 bar.

=== Die chromatographische Reinigung in der Praxis

Die Chromatographie ist im Praktikum die Methode der Wahl, wenn Destillation und
Kristallisation versagen: bei hitzeempfindlichen, bei isomerengemischen und bei
sehr polaren Substanzen. Drei Verfahren sind gebräuchlich.

#figure(
  table(
    columns: (1.3fr, 1.4fr, 1.5fr, 1.3fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verfahren*], [*Trennung nach*], [*typische Probe*], [*Maßstab*]),
    [Säulenchromatographie], [Adsorption], [0,1–10 g], [präparativ],
    [Dünnschichtchromatographie], [Adsorption], [1–10 µg], [analytisch],
    [Gaschromatographie], [Siedepunkt/Polarität], [1–10 µL], [analytisch],
    [HPLC], [Polarität, chiral], [1–100 µg], [analytisch],
    [Ionenaustausch], [Ladung], [Salze, Proteine], [präparativ],
  ),
  caption: [Chromatographische Verfahren und ihre Einsatzbereiche.],
) <tab:chrom-verfahren>

*Säulenchromatographie.* Man füllt Kieselgel 60 (0,063–0,200 mm) in
Petrolether/Essigsäureethylester als Slurry in die Säule, setzt das in wenig
Lösungsmittel gelöste Gemisch auf und eluiert mit dem Laufmittel. Die
Trennleistung hängt an vier Größen:

- *Korngröße*: feineres Material trennt besser, läuft aber langsamer.
- *Säulenlänge*: Die Auflösung wächst mit der Wurzel der Länge; verdoppelte Länge
  bringt 40 % mehr Auflösung.
- *Laufmittel*: Das Elutionsmittel wird so gewählt, daß der Zielstoff bei
  R#sub[f] 0,3–0,4 läuft. Ein R#sub[f] von 0,9 trennt nicht, ein R#sub[f] von 0,1
  kostet Zeit und Lösungsmittel.
- *Aufgabemenge*: 1 g Substanz auf 30–50 g Kieselgel; mehr führt zu überlappenden
  Zonen.

*Dünnschichtchromatographie.* Die DC ist das Kontrollinstrument für jede
chromatographische Trennung und für jede Reaktionskontrolle. Man trägt die Probe
mit einer Kapillare 1 cm über dem unteren Rand auf, entwickelt in einer
gesättigten Kammer bis 1 cm unter den oberen Rand und detektiert mit
UV-Licht (254 nm, Fluoreszenzlöschung) oder mit einem Tauchreagenz
(Kaliumpermanganat, Cer(IV)-sulfat, Iod).

$ R_f = "Laufstrecke der Substanz" \/ "Laufstrecke des Laufmittels" $

*Präparative DC.* Für Mengen bis 100 mg wird die Trennung auf einer
präparativen Platte (20 × 20 cm, 1 mm Schicht) durchgeführt. Die Zonen werden
unter UV markiert, abgeschabt und mit Lösungsmittel extrahiert. Das Verfahren ist
schnell, aber teuer und für empfindliche Substanzen ungeeignet.

*Gaschromatographie.* Für flüchtige Verbindungen (bis etwa 300 °C Siedepunkt)
ist die GC das schnellste Verfahren. Man arbeitet mit einer Kapillarsäule
(30 m, 0,25 mm Innendurchmesser, 5 % Phenylmethylsilikon) und einem
Flammenionisationsdetektor. Die Auswertung erfolgt über die Retentionszeit
(Identifizierung) und die Peakfläche (Quantifizierung).

*Fehlerquellen.* Die häufigsten Fehler sind zu viel Probe (überladene Säule),
zu polares Laufmittel (keine Trennung), fehlende Äquilibrierung der Kammer
(schiefe Fronten) und zu schnelles Auftragen (breite Zonen).

=== Ausbeute und Reinheit

Die Ausbeute wird in Prozent der Theorie angegeben (% d. Th.). Sie bezieht sich
auf das *unterschüssige* Edukt. Vor der Bilanzierung prüft man die Reinheit:

- Schmelzpunkt (scharf und gleich dem Literaturwert),
- Brechungsindex (Abweichung < 0,0005),
- Dünnschichtchromatogramm (ein Fleck),
- spektroskopische Daten (IR, NMR, MS).

Weicht der Schmelzpunkt um mehr als 2 K ab oder liegt er tiefer als der
Literaturwert, ist das Produkt verunreinigt und muß umkristallisiert oder
destilliert werden.

*Berechnung.* Die theoretische Ausbeute folgt aus dem unterschüssigen Edukt;
man rechnet in Mol, nicht in Gramm. Ein Beispiel: 10,0 g (0,108 mol) Cyclohexanol
werden mit 85-prozentiger Phosphorsäure dehydratisiert. Cyclohexen hat
$M = 82,1$ g·mol⁻¹, die Theorie beträgt also $0,108 dot 82,1 = 8,87$ g. Bei
78 % Ausbeute erhält man 6,9 g, entsprechend
$6,9 \/ 0,81 = 8,5$ mL.

*Reinheit prüfen.* Der Schmelzpunkt einer reinen Substanz ist scharf und
reproduzierbar; eine Verunreinigung senkt ihn und verbreitert das Intervall.
Zwei weitere Kriterien: die *Schmelzpunktsspanne* (Differenz zwischen Beginn und
Ende des Schmelzens — bei reiner Substanz unter 1 K) und der Vergleich mit einer
Mischprobe: Gibt man die vermutete Substanz zu und der Schmelzpunkt bleibt
unverändert, war die Annahme richtig.

#figure(
  table(
    columns: (1.6fr, auto, auto, 1.2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Befund*], [*Schmp.-Spanne*], [*Mischprobe*], [*Deutung*]),
    [scharf, Literaturwert], [< 1 K], [unverändert], [rein],
    [scharf, zu niedrig], [< 1 K], [sinkt], [falsche Substanz],
    [unscharf, zu niedrig], [> 2 K], [sinkt], [verunreinigt],
    [unscharf, zu hoch], [> 2 K], [—], [Zersetzung],
  ),
  caption: [Deutung von Schmelzpunktbefunden. Erst die Mischprobe entscheidet
    zwischen Verunreinigung und falscher Substanz.],
) <tab:schmp-deutung>

*Wann welche Methode.* Für Flüssigkeiten ist die Destillation die erste Wahl,
für Feststoffe die Umkristallisation, für kleine Mengen und Empfindliches die
Chromatographie. Wer die drei Verfahren beherrscht, kommt mit fast jeder
Aufarbeitung zurecht — und erkennt, wann eine vierte Methode nötig ist.
