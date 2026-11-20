// ============================================================================
//  E  Identifizierung organischer Verbindungen
// ============================================================================

#import "/vorlage/layout.typ": *

== Vorproben und Prüfung funktioneller Gruppen

Die Identifizierung einer unbekannten Verbindung verläuft in Stufen: Aussehen und
Geruch, Löslichkeit, Elementaranalyse, funktionelle Gruppen, Derivat, Spektrum,
Vergleich mit der Literatur. Wer eine Stufe überspringt, sucht länger; wer die
Reihenfolge einhält, kommt mit wenigen Gramm aus.

=== Äußere Merkmale und Vorproben

*Aggregatzustand und Farbe.* Feststoffe sind bei Raumtemperatur meist
carbonsäure- oder phenolhaltig, Amide, Zucker oder Salze; Flüssigkeiten sind
Alkohole, Ketone, Ester, Amine oder Kohlenwasserstoffe. Farblose Verbindungen
sind die Regel; gelbe bis rote Farbe deutet auf konjugierte Systeme, Chinone,
Nitroverbindungen oder Azofarbstoffe.

*Geruch.* Der Geruch ist ein Hinweis, kein Beweis — aber ein sehr schneller:

- stechend, essigsäureartig: kurzkettige Carbonsäuren;
- fruchtig: Ester;
- bittermandelartig: Benzaldehyd, Nitrobenzol, Benzonitril;
- campherartig: Cyclohexanon, Campher, Pinakolon;
- aminartig, fischig: Amine;
- schwefelig, lauchartig: Thiole, Sulfide.

*Brennbarkeit.* Eine kleine Probe auf einem Porzellanschiffchen verbrennt:
Kohlenwasserstoffe mit rußender Flamme, sauerstoffhaltige Verbindungen mit
blauer Flamme, halogenhaltige mit grünstichiger Flamme.

*Beilstein-Probe.* Ein Kupferdraht wird in der oxidierenden Flamme erhitzt und
in die Probe getaucht: Grünfärbung zeigt Halogen an. Die Probe ist empfindlich
und unspezifisch (auch andere Heteroatome geben Grün), aber als Vorprobe
nützlich.

*Soda-Probe.* Erhitzen mit Soda auf einem Spatel: Entwicklung von
Kohlendioxid zeigt Carbonsäuren an; Bräunung und Ammoniakgeruch deuten auf
stickstoffhaltige Verbindungen.

#figure(
  table(
    columns: (1.4fr, 1.7fr, 1.7fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Vorprobe*], [*Beobachtung*], [*Hinweis auf*]),
    [Verbrennen], [rußende Flamme], [aromatisch, hoher C-Anteil],
    [Verbrennen], [grünstichige Flamme], [Halogen],
    [Beilstein], [Grünfärbung], [Halogen],
    [Soda-Probe], [CO#sub[2]-Entwicklung], [Carbonsäure],
    [Soda-Probe], [Ammoniakgeruch], [Amin, Amid],
    [Glühen mit CuO], [Stickoxide], [N-haltig],
    [Flammentest], [gelbe Flamme], [Natriumsalz],
  ),
  caption: [Vorproben und ihre Aussage. Keine der Proben ist beweisend; sie
    schränken die Möglichkeiten ein.],
) <tab:vorproben>

=== Löslichkeitsverhalten

Das Löslichkeitsschema ordnet eine Verbindung nach ihrem Verhalten in Wasser,
Natronlauge, Salzsäure, Natriumhydrogencarbonat und Ether ein. Es ist die
schnellste Klassifizierung und braucht nur wenige Milligramm.

#figure(
  table(
    columns: (1.2fr, auto, auto, auto, 1.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Gruppe*], [*H#sub[2]O*], [*NaOH*], [*HCl*], [*Verbindungsklassen*]),
    [S1], [löslich], [—], [—], [Salze, Zucker, kurzkettige Alkohole],
    [S2], [unlöslich], [löslich], [—], [Carbonsäuren, Phenole, Sulfonamide],
    [B], [unlöslich], [unlöslich], [löslich], [Amine, Amidine],
    [N], [unlöslich], [unlöslich], [unlöslich], [Aldehyde, Ketone, Ester, Ether, Alkohole],
    [I], [unlöslich], [unlöslich], [unlöslich], [Alkane, Alkene, Aromaten, Halogenide],
  ),
  caption: [Löslichkeitsgruppen nach Shriner. Die Zugehörigkeit zu S2 oder B
    schließt die andere Gruppe aus; N und I werden über weitere Proben
    unterschieden.],
) <tab:loeslichkeit>

*Durchführung.* In einem Reagenzglas werden 20 mg Substanz mit 1 mL Lösungsmittel
geschüttelt; löslich heißt klar löslich, nicht nur dispergiert. Bei S2 ist die
Gasentwicklung mit Hydrogencarbonat ein zusätzlicher Beweis für eine Carbonsäure
(pK#sub[a] < 6).

=== Nachweis funktioneller Gruppen

#figure(
  table(
    columns: (1.5fr, 1.5fr, 1.6fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Gruppe*], [*Reagenz*], [*Beobachtung*], [*Empfindlichkeit*]),
    [Alken, Alkin], [Brom in CCl#sub[4]], [Entfärbung], [hoch],
    [Alken, Alkin], [KMnO#sub[4], verdünnt], [Braunstein], [hoch],
    [terminales Alkin], [AgNO#sub[3]/NH#sub[3]], [weißer Niederschlag], [hoch],
    [Alkohol], [Cer(IV)-ammoniumnitrat], [Rotfärbung], [hoch],
    [Phenol], [FeCl#sub[3]], [Violettfärbung], [hoch],
    [Aldehyd], [Tollens-Reagenz], [Silberspiegel], [hoch],
    [Aldehyd], [Fehling-Lösung], [rotes Cu#sub[2]O], [mittel],
    [Methylketon], [Iodoform-Probe], [gelber Niederschlag], [hoch],
    [Carbonsäure], [NaHCO#sub[3]], [CO#sub[2]], [hoch],
    [Amin], [Hinsberg-Probe], [Fällung oder Lösung], [hoch],
    [Amid], [NaOH, Erwärmen], [NH#sub[3]-Geruch], [mittel],
  ),
  caption: [Nachweisreaktionen für funktionelle Gruppen. Die Reihenfolge folgt der
    praktischen Erprobung im Kurs.],
) <tab:nachweise>

*Grenzen der Nachweise.* Jede Nachweisreaktion hat Störungen: Phenol gibt auch
mit anderen Oxidationsmitteln Farbe, die Iodoform-Probe spricht auf alle
Methylketone und auf Acetaldehyd an, der Silberspiegel kann durch Aldehydspuren
im Lösungsmittel vorgetäuscht werden. Ein Nachweis ist erst dann verwertbar,
wenn er mit einer Gegenprobe (bekannte Substanz) und einer Blindprobe
(Lösungsmittel) verglichen wurde.

=== Herstellung von Derivaten

Derivate sind der klassische Beweis: Eine Verbindung wird in eine kristalline
Verbindung mit scharfem Schmelzpunkt überführt und mit dem Literaturwert
verglichen.

#figure(
  table(
    columns: (1.5fr, 1.6fr, 1.5fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verbindung*], [*Reagenz*], [*Derivat*], [*Schmp./°C*]),
    [Alkohol], [3,5-Dinitrobenzoylchlorid], [Ester], [90–130],
    [Alkohol], [Phenylisocyanat], [Phenylurethan], [50–120],
    [Phenol], [Brom], [Bromderivat], [80–120],
    [Aldehyd/Keton], [2,4-Dinitrophenylhydrazin], [Hydrazon], [110–260],
    [Aldehyd/Keton], [Hydroxylamin], [Oxim], [30–130],
    [Carbonsäure], [Anilin], [Anilid], [80–160],
    [Carbonsäure], [S-Benzylisothiuroniumsalz], [Salz], [120–160],
    [Amin], [Essigsäureanhydrid], [Acetamid], [60–130],
    [Amin], [Benzoylchlorid], [Benzamid], [100–180],
  ),
  caption: [Derivate für die Identifizierung. Der Schmelzpunkt des Derivats ist
    spezifischer als der der Ausgangsverbindung.],
) <tab:derivate>

*Kriterium der Reinheit.* Ein Schmelzpunkt, der über 2 °C breit ist, zeigt
Verunreinigung an. Man kristallisiert um, bis der Schmelzpunkt konstant bleibt —
erst dann ist der Vergleich mit der Literatur zulässig.

=== Spektroskopische Methoden

Für die Strukturaufklärung sind die spektroskopischen Methoden heute führend; die
klassischen Nachweise dienen der Vorauswahl und der Bestätigung.

- *IR*: Carbonyl bei 1650–1800 cm⁻¹, O–H breit bei 3300, N–H bei 3300–3500,
  C≡N bei 2250. Das Fingerprint-Gebiet erlaubt den Vergleich mit einer
  Referenzsubstanz.
- *#super[1]H-NMR*: Anzahl der Signale = Anzahl chemisch nicht äquivalenter
  Protonen; Integral = Verhältnis; Aufspaltung = Nachbarschaft.
- *#super[13]C-NMR*: Anzahl der Signale = Anzahl nicht äquivalenter
  Kohlenstoffatome; chemische Verschiebung zeigt die Umgebung.
- *MS*: Molmasse aus dem Molekülion, Fragmente aus dem Zerfall. Für die
  Identifizierung ist die Kombination mit dem IR entscheidend.

#figure(
  table(
    columns: (1.6fr, auto, auto, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Verbindung*], [*C=O in cm⁻¹*], [*δ#sub[H] in ppm*], [*m/z*]),
    [Aceton], [1715], [2,17], [58],
    [Benzaldehyd], [1705], [10,0], [106],
    [Essigsäure], [1710], [2,08], [60],
    [Ethylacetat], [1735], [2,05 / 4,12], [88],
    [Anilin], [—], [3,5 / 6,6–7,2], [93],
    [Phenol], [—], [5,0 / 6,8–7,3], [94],
  ),
  caption: [Spektroskopische Kennzahlen ausgewählter Verbindungen. Die Werte
    dienen der Orientierung; für die Identifizierung wird mit Referenzspektren
    verglichen.],
) <tab:spektren>

=== Systematisches Vorgehen bei einer unbekannten Verbindung

1. Menge und Zustand notieren; Geruch, Farbe, Konsistenz.
2. Löslichkeitsschema durchführen (5 × 20 mg).
3. Elemente nachweisen (Beilstein, Lassaigne-Probe auf N/S/Halogen).
4. Nachweisreaktionen für die wahrscheinliche Klasse.
5. Derivat herstellen, Schmelzpunkt bestimmen, umkristallisieren.
6. Spektren aufnehmen und mit der Literatur vergleichen.
7. Ergebnis im Protokoll mit allen Beobachtungen festhalten.

#block(above: 8pt, below: 8pt, inset: (x: 8pt, y: 6pt), stroke: (left: 2pt + black), fill: luma(246))[
  *Beispiel.* Eine farblose Flüssigkeit, Sdp. 155 °C, riecht campherartig, ist in
  Wasser unlöslich, in Natronlauge unlöslich, in Salzsäure unlöslich; sie gibt
  mit 2,4-Dinitrophenylhydrazin ein gelbes Hydrazon (Schmp. 160 °C), keinen
  Silberspiegel, aber eine positive Iodoform-Probe. Damit ist die Verbindung ein
  Methylketon; der Vergleich der Kennzahlen führt auf Cyclohexanon — es ist
  jedoch kein Methylketon. Die Iodoform-Probe war falsch positiv durch
  Verunreinigung mit Aceton. Der Fall zeigt, warum Gegenproben nötig sind.
]

=== Aufgaben

- Eine Verbindung ist in Wasser löslich, gibt mit Natriumhydrogencarbonat kein
  Gas, mit Fehling-Lösung keinen Niederschlag. Welche Klassen bleiben übrig?
- Warum ist die Beilstein-Probe für Fluor unzuverlässig?
- Sie haben 50 mg einer unbekannten Verbindung. Stellen Sie die Reihenfolge der
  Untersuchungen auf und begründen Sie, welche Probe Sie zuerst machen.
