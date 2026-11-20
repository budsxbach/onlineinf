// ============================================================================
//  E.2  Derivate und Spektren
// ============================================================================

#import "/vorlage/layout.typ": *

== Derivate und Spektren

Die Kombination von Derivat und Spektrum ist die sicherste Identifizierung: Das
Derivat liefert eine unabhängige, gut reproduzierbare Konstante, das Spektrum
liefert die Struktur. Wer nur eines von beiden hat, identifiziert mit
Wahrscheinlichkeit, nicht mit Sicherheit.

=== Derivate: Auswahl und Praxis

Ein Derivat ist nur dann brauchbar, wenn es

- schnell und in kleiner Menge entsteht,
- kristallin und gut umkristallisierbar ist,
- einen Schmelzpunkt hat, der deutlich vom Edukt abweicht,
- in der Literatur für viele Verbindungen beschrieben ist.

Diese vier Forderungen erfüllt in der Praxis eine kleine Gruppe von Reagenzien.

#figure(
  table(
    columns: (1.4fr, 1.5fr, 1.4fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Reagenz*], [*für*], [*Derivat*], [*Ansatz*]),
    [2,4-Dinitrophenylhydrazin], [Aldehyde, Ketone], [Hydrazon], [50 mg],
    [Hydroxylamin], [Aldehyde, Ketone], [Oxim], [100 mg],
    [Semicarbazid], [Aldehyde, Ketone], [Semicarbazon], [100 mg],
    [3,5-Dinitrobenzoylchlorid], [Alkohole, Phenole], [Ester], [100 mg],
    [Phenylisocyanat], [Alkohole, Amine], [Urethan, Harnstoff], [100 mg],
    [Essigsäureanhydrid], [Amine], [Acetamid], [200 mg],
    [Benzoylchlorid], [Amine, Phenole], [Benzamid, Benzoat], [200 mg],
    [Brom], [Phenole, Aromaten], [Bromderivat], [100 mg],
  ),
  caption: [Derivatreagenzien und der übliche Ansatz. Die Mengen gelten für die
    Identifizierung, nicht für die Darstellung.],
) <tab:derivat-ansatz>

*Praktische Regeln*

- Die Probe wird in möglichst wenig Lösungsmittel gelöst; ein Überschuß an
  Reagenz stört die Kristallisation.
- Nach der Umsetzung wird gekühlt, abgesaugt und aus einem geeigneten
  Lösungsmittel umkristallisiert (Ethanol/Wasser für hydrophile, Petrolether
  für lipophile Derivate).
- Der Schmelzpunkt wird langsam bestimmt (1 °C/min); schnelles Erhitzen gibt
  Werte, die um 3–5 °C zu hoch liegen.
- Der Schmelzpunkt des Derivats und der Mischschmelzpunkt mit einem authentischen
  Präparat müssen übereinstimmen.

*Derivatisierung im Mikromaßstab.* Für die Identifizierung genügen 20–50 mg
Substanz. Man löst in 0,5 mL Ethanol, gibt das Reagenz (20 % Überschuß) zu und
erwärmt kurz. Entsteht kein Niederschlag, wird eingeengt und mit einem Tröpfchen
Wasser angesetzt; ölige Ausscheidungen werden mit einem Glasstab gerieben, bis
sie kristallisieren. Nach 15 min im Eisbad wird abgesaugt, mit wenig kaltem
Lösungsmittel gewaschen und aus Ethanol/Wasser umkristallisiert. Ein Derivat,
das auch nach mehreren Versuchen als Öl anfällt, taugt nicht — man wechselt das
Reagenz (z. B. vom Oxim zum Semicarbazon).

=== IR-Spektroskopie in der Identifizierung

Das IR-Spektrum ist schnell, zerstörungsfrei und billig. Für die Organik sind
drei Bereiche entscheidend:

- *3100–3600 cm⁻¹*: O–H (breit), N–H (schärfer, oft zwei Banden), ≡C–H.
- *1650–2250 cm⁻¹*: C=O, C=C, C≡C, C≡N, N=O.
- *600–1500 cm⁻¹* (Fingerprint): Vergleich mit Referenzspektren.

#figure(
  table(
    columns: (1.6fr, auto, 2.2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Gruppe*], [*Wellenzahl in cm⁻¹*], [*Charakter der Bande*]),
    [O–H (Alkohol)], [3200–3600], [breit, konzentrationsabhängig],
    [O–H (Carbonsäure)], [2500–3300], [sehr breit, mit C=O bei 1710],
    [N–H], [3300–3500], [scharf, ein oder zwei Banden],
    [C–H (sp³)], [2850–2960], [stark],
    [C–H (sp²)], [3000–3100], [mittel],
    [C≡C], [2100–2260], [schwach, bei terminalen Alkinen],
    [C≡N], [2210–2260], [scharf, mittel],
    [C=O], [1650–1800], [sehr stark],
    [C=C], [1600–1680], [mittel, aromatisch bei 1600 und 1500],
    [N=O], [1350 und 1530], [zwei Banden, Nitroverbindung],
  ),
  caption: [IR-Banden und ihre Zuordnung. Die Lage der C=O-Bande unterscheidet
    die Carbonylklassen (siehe Abschnitt D.7.1).],
) <tab:ir-banden>

*Fehlerquellen.* Ein Spektrum in KBr kann Wasser enthalten (breite Bande bei
3400 cm⁻¹); ein Film auf NaCl zeigt Wasser nicht. Für die Identifizierung wird
deshalb immer unter gleichen Bedingungen gemessen wie die Referenz.

=== NMR-Spektroskopie

Die Kernresonanzspektroskopie (#super[1]H-NMR) liefert drei Informationen auf einmal: chemische
Verschiebung (Umgebung), Integral (Anzahl) und Aufspaltung (Nachbarschaft). Für
die Identifizierung einer einfachen Verbindung genügt oft die Kombination
dieser drei Angaben.

#figure(
  table(
    columns: (1.6fr, auto, 2.4fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Protonentyp*], [*δ in ppm*], [*Bemerkung*]),
    [Alkyl, CH#sub[3]], [0,9–1,2], [Triplett oder Singulett],
    [Alkyl, CH#sub[2]], [1,2–1,6], [Multiplett],
    [Allyl, benzylisch], [2,0–2,5], [Multiplett],
    [α zu Carbonyl], [2,1–2,6], [Singulett bei Methylketon],
    [O–CH#sub[3]], [3,3–3,9], [Singulett],
    [O–CH#sub[2]], [4,0–4,5], [Quartett bei Ethylester],
    [Aromat], [6,5–8,0], [Multiplett],
    [Aldehyd], [9,5–10,5], [Singulett oder Dublett],
    [Carbonsäure], [10–13], [breit],
  ),
  caption: [#super[1]H-chemische Verschiebungen. Die Werte gelten für CDCl#sub[3]
    als Lösungsmittel.],
) <tab:nmr-verschiebungen>

*Aufspaltung.* Die Multiplett-Struktur folgt der n+1-Regel: Ein Proton mit n
äquivalenten Nachbarn erscheint als n+1 Linien. Bei aromatischen und
diastereotopen Protonen versagt die Regel; hier hilft nur der Vergleich mit
Referenzspektren.

*#super[13]C-NMR.* Die Zahl der Signale zeigt die Zahl der nicht äquivalenten
Kohlenstoffatome, die chemische Verschiebung die Hybridisierung: sp³ bei
10–60 ppm, sp² bei 100–160 ppm, Carbonyl bei 165–210 ppm.

=== Massenspektrometrie

Das Massenspektrum liefert die Molmasse und, über die Fragmentierung, Hinweise auf
die Struktur. Für die Identifizierung genügt oft die Kombination von
Molekülion und zwei Schlüsselfragmenten.

#figure(
  table(
    columns: (1.6fr, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verbindung*], [*M*#super[plus]], [*Hauptfragment*]),
    [Aceton], [58], [43 (M–CH#sub[3])],
    [Benzaldehyd], [106], [105 (M–H), 77 (Ph)],
    [Ethylacetat], [88], [43 (Acetyl), 61],
    [Anilin], [93], [66, 39],
    [Toluol], [92], [91 (M–H), 65],
    [Cyclohexanon], [98], [55, 42],
  ),
  caption: [Molekülionen und Hauptfragmente. Die Fragmentierung folgt der
    Stabilität der Carbeniumionen.],
) <tab:ms>

*Isotopenmuster.* Chlor zeigt ein Muster im Verhältnis 3:1 (³⁵Cl : ³⁷Cl), Brom
1:1 (⁷⁹Br : ⁸¹Br). Damit ist die Anwesenheit dieser Halogene im Massenspektrum
sofort erkennbar — ein Vorteil gegenüber der Elementaranalyse.

*Charakteristische Verluste.* Die Differenz zwischen Molekülion und Fragment
verrät die Abgangsgruppe. Die folgenden Verluste sind so häufig, daß sie im
Zweifelsfall zuerst geprüft werden.

#figure(
  table(
    columns: (auto, auto, 2fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (right, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verlust*], [*Fragment*], [*Hinweis auf*]),
    [1], [H], [Aldehyd, Alkin],
    [15], [CH#sub[3]], [Methylgruppe],
    [18], [H#sub[2]O], [Alkohol, Aldoxim],
    [28], [CO, C#sub[2]H#sub[4]], [Phenol, Ethylester],
    [29], [CHO, C#sub[2]H#sub[5]], [Aldehyd, Ethylgruppe],
    [31], [OCH#sub[3]], [Methylester],
    [43], [C#sub[3]H#sub[7], CH#sub[3]CO], [Propyl, Acetyl],
    [44], [CO#sub[2]], [Carbonsäureester, Anhydrid],
    [45], [OC#sub[2]H#sub[5], COOH], [Ethylester, Carbonsäure],
    [77], [C#sub[6]H#sub[5]], [Phenylrest],
  ),
  caption: [Charakteristische Massenverluste und ihre Zuordnung. Mehrere passende
    Verluste zusammen sind aussagekräftiger als einer allein.],
) <tab:ms-verluste>

=== UV-Spektren und optische Drehung

Das UV-Spektrum spielt für die Identifizierung eine Nebenrolle, ist aber schnell
gemessen. Konjugierte Doppelbindungen und Aromaten zeigen Banden zwischen 200
und 300 nm; die Verschiebung bei Substituenten (auxochrome Gruppen) ist
charakteristisch. Ein reines Alkan zeigt im UV nichts — die Probe ist dann
entweder gesättigt oder die Konzentration zu gering.

#figure(
  table(
    columns: (1.7fr, auto, auto, 1.8fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Chromophor*], [*λ*], [*ε*], [*Beispiel*]),
    [C=C], [175–195], [5000], [Ethen],
    [C=O (n→π\*)], [270–290], [15], [Aceton],
    [Aromaten], [250–280], [200], [Benzol (Banden)],
    [konjugiertes Diens], [215–245], [10 000], [Butadien],
    [Nitrogruppe], [270–280], [15], [Nitrobenzol],
  ),
  caption: [UV-Banden einfacher Chromophoren (λ in nm). ε ist der molare
    dekadische Extinktionskoeffizient.],
) <tab:uv>

*Optische Drehung.* Für chirale Verbindungen ist die spezifische Drehung
$[alpha]_D^20$ eine Konstante wie der Schmelzpunkt. Gemessen wird im
Polarimeter bei 20 °C mit der Natrium-D-Linie; angegeben werden Konzentration
(g/100 mL) und Lösungsmittel. Eine racemische Probe dreht nicht — die Prüfung
auf optische Reinheit ist damit in zwei Minuten erledigt.

=== Kombinierte Auswertung

Ein Beispiel: Eine unbekannte Verbindung gibt im IR eine starke Bande bei
1715 cm⁻¹ (Carbonyl), im #super[1]H-NMR ein Singulett bei 2,1 ppm (3 H) und ein
Multiplett bei 7,4 ppm (5 H), im MS ein Molekülion bei m/z 120. Damit ist die
Verbindung Acetophenon: Carbonyl + Methylketon + Phenyl + Molmasse 120.

#block(above: 8pt, below: 8pt, inset: (x: 8pt, y: 6pt), stroke: (left: 2pt + black), fill: luma(246))[
  *Prüfschema.* 1. Molmasse aus MS (ungerade Masse → ungerade N-Zahl). 2. Heteroatome
  aus Isotopenmuster und IR. 3. Carbonyl aus IR. 4. Protonentypen aus NMR.
  5. Anzahl der C-Atome aus #super[13]C-NMR. 6. Konsistenz prüfen: Summenformel
  aufstellen, Index der Unsättigung berechnen ($I = (2C + 2 - H + N - X)\/2$).
  7. Mit Referenzspektrum vergleichen.
]

=== Aufgaben

- Ein Derivat hat einen Schmelzpunkt von 158–166 °C. Ist es rein? Was tun Sie?
- Warum ist der Mischschmelzpunkt aussagekräftiger als der Schmelzpunkt allein?
- Ein Massenspektrum zeigt ein Molekülion bei m/z 122 mit einem 1:1-Muster bei
  m/z 122 und 124. Welches Halogen ist enthalten, und wie viele C-Atome sind
  wahrscheinlich vorhanden?
- Eine Flüssigkeit zeigt im IR eine breite Bande bei 3350 cm⁻¹, im MS ein
  Molekülion bei m/z 60 und einen Verlust von 18. Die Substanz dreht die
  Ebene des polarisierten Lichts nicht. Schlussfolgerung?
- Ordnen Sie zu: Acetaldehyd, Essigsäure, Anilin, 1-Butanol — anhand der
  folgenden Daten: (a) δ 9,8 als Singulett; (b) sehr breite OH-Bande und
  δ 12 im NMR; (c) zwei NH-Banden im IR bei 3300–3500; (d) breite OH-Bande,
  Molekülion m/z 74.
- Ein Derivat schmilzt bei 162–163 °C, der Literaturwert für das vermutete
  Semicarbazon liegt bei 163 °C, die Mischprobe schmilzt bei 148–156 °C. Was
  folgen Sie daraus, und wie gehen Sie weiter vor?
