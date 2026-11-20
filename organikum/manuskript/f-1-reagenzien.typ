// ============================================================================
//  F  Reagenzien, Lösungsmittel und Arbeitsmethoden
// ============================================================================

#import "/vorlage/layout.typ": *

== Lösungsmittel und ihre Reinigung

Das Lösungsmittel entscheidet über den Verlauf einer Reaktion oft stärker als das
Reagenz. Es bestimmt die Polarität des Mediums, die Nucleophilie der Anionen, die
Lage von Gleichgewichten und die Geschwindigkeit der Phasentrennung. Deshalb
beginnt jede Vorschrift mit der Angabe des Lösungsmittels — und jede Reinigung
eines Lösungsmittels mit der Frage, wofür es gebraucht wird.

=== Eigenschaften und Auswahl

#figure(
  table(
    columns: (1.5fr, auto, auto, auto, auto, 1.3fr),
    inset: (x: 5pt, y: 3.2pt),
    align: (left, right, right, right, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Lösungsmittel*], [*Sdp./°C*], [*ε*], [*ρ*], [*E#sub[T]*], [*Klasse*]),
    [n-Hexan], [69], [1,9], [0,66], [31], [unpolar],
    [Cyclohexan], [81], [2,0], [0,78], [33], [unpolar],
    [Toluol], [111], [2,4], [0,87], [34], [aromatisch],
    [Ether], [35], [4,3], [0,71], [34], [aprotisch],
    [Dichlormethan], [40], [8,9], [1,33], [41], [aprotisch, chloriert],
    [Chloroform], [61], [4,8], [1,49], [39], [aprotisch, chloriert],
    [Essigsäureethylester], [77], [6,0], [0,90], [38], [aprotisch],
    [Aceton], [56], [20,7], [0,79], [42], [aprotisch, polar],
    [Dimethylformamid], [153], [36,7], [0,94], [43], [aprotisch, polar],
    [Dimethylsulfoxid], [189], [46,7], [1,10], [45], [aprotisch, polar],
    [Acetonitril], [82], [37,5], [0,78], [46], [aprotisch, polar],
    [Ethanol], [78], [24,3], [0,79], [51], [protisch],
    [Methanol], [65], [32,6], [0,79], [55], [protisch],
    [Wasser], [100], [78,4], [1,00], [63], [protisch],
  ),
  caption: [Lösungsmittel für die präparative Arbeit. ε = Dielektrizitätskonstante,
    ρ = Dichte in g·cm⁻³, E#sub[T] = Dimroth-Reichardt-Parameter (Polarität).],
) <tab:loesungsmittel>

Für die Auswahl gelten drei Regeln:

- *Polare Reaktionen brauchen polare Lösungsmittel.* S#sub[N]2 mit Anionen läuft
  in DMSO oder DMF um Größenordnungen schneller ab als in Methanol.
- *Prothische Lösungsmittel stören Anionen.* Sie solvatisieren über
  Wasserstoffbrücken und machen das Nucleophil „unbeweglich“.
- *Unpolare Lösungsmittel trennen schlecht.* Salze bleiben ungelöst, die
  Reaktion findet an der Phasengrenze statt — ein Fall für Phasentransfer.

*Lösungsmittel im Überblick.* Die Lösungsmittelauswahl bestimmt
Kristallisation, Extraktion und Chromatographie. Die folgende Tabelle nennt
die wichtigsten Daten; die Reinigungsvorschriften stehen im folgenden
Abschnitt.

#figure(
  table(
    columns: (1.15fr, auto, auto, auto, auto),
    inset: (x: 5pt, y: 3.0pt),
    align: (left, right, right, right, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Lösungsmittel*], [*Sdp. °C*], [*Flammpunkt °C*], [*ρ*], [*$n_D^20$*]),
    [Wasser], [100], [—], [1,00], [1,3330],
    [Methanol], [64,7], [11], [0,79], [1,3284],
    [Ethanol], [78,3], [12], [0,79], [1,3611],
    [2-Propanol], [82,4], [12], [0,79], [1,3772],
    [Aceton], [56,1], [−18], [0,79], [1,3588],
    [Acetonitril], [81,6], [2], [0,78], [1,3441],
    [Essigester], [77,1], [−4], [0,90], [1,3724],
    [Essigsäure], [118,1], [39], [1,05], [1,3716],
    [Diethylether], [34,6], [−45], [0,71], [1,3526],
    [THF], [66,0], [−14], [0,89], [1,4050],
    [1,4-Dioxan], [101,1], [12], [1,03], [1,4224],
    [Dichlormethan], [39,8], [—], [1,33], [1,4242],
    [Chloroform], [61,2], [—], [1,49], [1,4459],
    [Tetrachlormethan], [76,7], [—], [1,59], [1,4601],
    [Pentan], [36,1], [−40], [0,63], [1,3575],
    [Hexan], [68,7], [−23], [0,66], [1,3749],
    [Heptan], [98,4], [−4], [0,68], [1,3877],
    [Petrolether (30–60)], [30–60], [−45], [0,65], [≈ 1,37],
    [Cyclohexan], [80,7], [−17], [0,78], [1,4262],
    [Benzol], [80,1], [−11], [0,88], [1,5011],
    [Toluol], [110,6], [4], [0,87], [1,4961],
    [Xylol (Isomerengem.)], [138–144], [25], [0,87], [≈ 1,50],
    [Pyridin], [115,3], [20], [0,98], [1,5093],
    [DMF], [153,0], [58], [0,95], [1,4305],
    [DMSO], [189,0], [89], [1,10], [1,4793],
    [Kohlenstoffdisulfid], [46,2], [−30], [1,26], [1,6319],
  ),
  caption: [Physikalische Daten gebräuchlicher Lösungsmittel (1013 hPa).
    ρ in g·cm#super[−3]. Benzol und Tetrachlormethan sind krebserzeugend —
    wo möglich durch Toluol bzw. Dichlormethan ersetzen.],
) <tab:loesungsmittel>

=== Trocknung

Wasser ist der häufigste Störfaktor. Für die Trocknung gibt es vier Wege:

- *chemisch*: Natriumsulfat (schwach), Magnesiumsulfat (mittel),
  Calciumchlorid (stark, aber bindet Alkohole), Phosphorpentoxid (sehr stark,
  für Kohlenwasserstoffe und Halogenide).
- *destillativ*: azeotrope Entfernung mit Toluol oder Benzol (Wasserabscheider).
- *physikalisch*: Molekularsieb 3 Å oder 4 Å, im Trockenschrank regenerierbar.
- *metallorganisch*: Natrium/Benzophenon für Ether und THF, Kalium für
  Toluol; die blaue Farbe des Benzophenon-Ketyls zeigt Wasserfreiheit an.

#figure(
  table(
    columns: (1.5fr, auto, 1.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Trockenmittel*], [*Restwassergehalt*], [*Einschränkung*]),
    [Natriumsulfat], [hoch], [billig, für präparative Zwecke ausreichend],
    [Magnesiumsulfat], [mittel], [Standard für Extrakte],
    [Calciumchlorid], [niedrig], [bindet Alkohole und Amine],
    [Kaliumcarbonat], [mittel], [für Alkohole und Ketone],
    [Phosphorpentoxid], [sehr niedrig], [für Kohlenwasserstoffe, aggressiv],
    [Molekularsieb 4 Å], [sehr niedrig], [regenerierbar, für Lösungsmittel],
    [Natrium/Benzophenon], [sehr niedrig], [nur für Ether, THF, Toluol],
  ),
  caption: [Trockenmittel und ihre Grenzen. Die Auswahl richtet sich nach der
    Empfindlichkeit des Produkts, nicht nach dem erreichbaren Minimum.],
) <tab:trockenmittel>

*Kapazität und Praxis.* Die theoretische Aufnahmefähigkeit entscheidet, wieviel
Trockenmittel man braucht; die Gleichgewichtsfeuchte entscheidet, wie trocken es
am Ende wird.

#figure(
  table(
    columns: (1.5fr, auto, auto, 1.4fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, right, right, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Trockenmittel*], [*Kapazität*], [*Geschwindigkeit*], [*Hydrat*]),
    [Natriumsulfat], [127], [schnell], [Na#sub[2]SO#sub[4]·10 H#sub[2]O],
    [Magnesiumsulfat], [105], [schnell], [MgSO#sub[4]·7 H#sub[2]O],
    [Calciumchlorid], [97], [mittel], [CaCl#sub[2]·6 H#sub[2]O],
    [Kaliumcarbonat], [20], [langsam], [K#sub[2]CO#sub[3]·1,5 H#sub[2]O],
    [Phosphorpentoxid], [76], [schnell], [4 H#sub[3]PO#sub[4]],
    [Molekularsieb 4 Å], [20], [mittel], [Adsorption],
  ),
  caption: [Theoretische Wasseraufnahme in g H#sub[2]O je 100 g Trockenmittel
    (nach der Hydratformel). In der Praxis rechnet man mit der Hälfte.],
) <tab:trockenmittel-kapazitaet>

*Wie man trocknet.* Man gibt soviel Trockenmittel zu, daß eine dünne Schicht des
pulvrigen Rests am Gefäßboden liegenbleibt (etwa 5–10 % der Extraktmasse bei
Magnesiumsulfat), schüttelt gut und läßt 10–15 min stehen. Klumpenbildung zeigt
Wasser; dann nachdosieren. Vor dem Abdestillieren oder Einengen wird das
Trockenmittel abfiltriert oder abdekantiert — mitgerissenes Pulver kann beim
Erhitzen stören. Die Wirksamkeit prüft man mit wasserfreiem Kupfersulfat
(bleibt weiß) oder durch den Brechungsindex der klaren Lösung.

*Trocknungsmittel und ihre Eignung.* Volumen, Tempo und chemische
Verträglichkeit entscheiden. „Verträglich" meint: kein Adduktbildner, keine
Protonenaustausch-Reaktion mit dem gelösten Produkt.

#figure(
  table(
    columns: (1fr, 0.9fr, 1.1fr),
    inset: (x: 5pt, y: 3.2pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Trocknungsmittel*], [*Geeignet für*], [*Nicht geeignet für*]),
    [Natriumsulfat], [die meisten organischen Phasen], [— (neutral, langsam, hohe Kapazität)],
    [Magnesiumsulfat], [Ester, Ketone, Ether], [alkalische Produkte (leicht sauer)],
    [Calciumchlorid], [Alkane, Halogenkohlenwasserstoffe], [Alkohole, Amine, Ketone (Addukte!)],
    [Kaliumcarbonat], [Amine, basische Lösungen], [säureempfindliche Produkte],
    [Phosphorpentoxid], [Alkane, Ether, Halogenkohlenwasserstoffe], [Alkohole, Amine, Basen],
    [Molsieb 3 Å / 4 Å], [fast alle Lösungsmittel, auch wasserarm], [— (stark, schnell, regenerierbar)],
    [Natriumdraht], [Ether, Alkane (nach Peroxidtest)], [Alkohole, alles Protische],
    [Baryumoxid], [Amine, Pyridin], [Ester, Säurechloride],
  ),
  caption: [Trocknungsmittel im Labor. Die Kapazität von Natriumsulfat ist
    hoch, das Tempo gering; Magnesiumsulfat trocknet schnell, aber weniger
    vollständig. Molsieb ist die Wahl für wasserempfindliche Ansätze.],
) <tab:trocknungsmittel>

=== Peroxide und ihre Entfernung

Ether, THF, Dioxan und Isopropanol bilden bei Lagerung an Luft Peroxide. Diese
sind explosives Gefahrgut und stören Radikalreaktionen. Man prüft mit
Kaliumiodid-Stärke-Papier oder mit Eisen(II)-thiocyanat-Lösung (Rotfärbung) und
entfernt Peroxide durch Ausschütteln mit Eisen(II)-sulfatlösung oder
Aluminiumoxid.

#gefahr[Peroxidhaltige Ether dürfen nicht destilliert werden — beim Einengen
können sie sich aufkonzentrieren und detonieren. Vor jeder Destillation prüfen;
Lagergefäße mit Datum versehen und nach sechs Monaten verwerfen. Natriumreste
in Ether nie mit Wasser in Berührung bringen.]

=== Absolutierung

Für Reaktionen mit metallorganischen Reagenzien, mit Alkalimetallen oder mit
Lewis-Säuren braucht man wasserfreie Lösungsmittel (< 50 ppm Wasser). Die
Absolutierung erfolgt durch

- *Destillation über Trockenmittel* (Calciumhydrid für Amine und DMSO),
- *Destillation über Natrium/Benzophenon* (Ether, THF, Toluol),
- *Lagerung über Molekularsieb* (Methanol, Acetonitril),
- *käufliche Absolutlösungsmittel* (AcroSeal, SureSeal) für kleine Mengen.

Die Wasserbestimmung erfolgt nach Karl Fischer (volumetrisch bis 0,1 %,
koulometrisch bis 1 ppm) oder, im Praktikum, über die azeotrope Destillation
mit Toluol und Messung des abgeschiedenen Wassers.

#figure(
  table(
    columns: (1.3fr, 1.7fr, 1.3fr, auto),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left, right),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Lösungsmittel*], [*Methode*], [*Achtung*], [*Sdp./°C*]),
    [Diethylether], [Na/Benzophenon], [Peroxide prüfen], [35],
    [THF], [Na/Benzophenon], [Peroxide prüfen], [66],
    [Toluol], [Natrium], [—], [111],
    [Dichlormethan], [CaH#sub[2], Dest.], [stabil], [40],
    [Chloroform], [CaCl#sub[2], Dest.], [Ethanol-Stabilisator], [61],
    [Methanol], [Mg/I#sub[2]], [nicht über Metall], [65],
    [Acetonitril], [K#sub[2]CO#sub[3], dann CaH#sub[2]], [—], [82],
    [DMF], [Molekularsieb 4 Å], [Amin-Geruch, giftig], [153],
    [DMSO], [CaH#sub[2], Vakuumdest.], [erstarrt kalt], [189],
    [Pyridin], [KOH, Dest.], [stark riechend], [115],
  ),
  caption: [Reinigung gebräuchlicher Lösungsmittel für wasserempfindliche
    Reaktionen. Alle Destillationen unter Rückschluß und mit Siedestein.],
) <tab:loesungsmittel-reinigung>

*Reihenfolge der Absolutierung.* Peroxidprüfung vor jeder Destillation von
Ether, THF und Dioxan — die Reihenfolge ist nicht verhandelbar. Erst trocknen,
dann destillieren, dann über Molekularsieb lagern; wer spart, trocknet zweimal.

=== Rückgewinnung und Entsorgung

Lösungsmittel werden getrennt gesammelt: halogeniert (Dichlormethan, Chloroform,
Tetrachlorkohlenstoff), nicht halogeniert (Ether, Toluol, Aceton, Alkohole),
Wasser (wäßrige Phasen). Die Rückgewinnung durch Destillation lohnt sich ab
etwa 5 L, im Praktikum meist nicht; die getrennte Sammlung ist Pflicht.

#figure(
  table(
    columns: (1.6fr, 1.4fr, 1.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Abfallgruppe*], [*Beispiele*], [*Behandlung*]),
    [Halogenierte Lösungsmittel], [DCM, CHCl#sub[3]], [Verbrennung, Sonderabfall],
    [Nicht halogeniert], [Ether, Toluol, Aceton], [Destillation oder Verbrennung],
    [Wäßrige Säuren], [HCl, H#sub[2]SO#sub[4]], [Neutralisieren, Abwasser],
    [Wäßrige Basen], [NaOH, Ammoniak], [Neutralisieren, Abwasser],
    [Schwermetallsalze], [Cr, Hg, Cu], [Fällen, Sonderabfall],
    [Cyanide], [KCN, CuCN], [Oxidation mit Hypochlorit],
  ),
  caption: [Abfallgruppen im organischen Praktikum. Die Reihenfolge folgt der
    Gefährlichkeit, nicht der Menge.],
) <tab:abfall>

== Reagenzien und ihre Handhabung

Manche Reagenzien sind so reaktiv, daß sie eigene Regeln verlangen. Die folgenden
Hinweise gelten für die im Buch verwendeten Stoffe.

=== Metallorganische Reagenzien

*Grignard-Reagenzien* (RMgX) entstehen bei der Metallierung von
Alkylhalogeniden mit Magnesiumspänen in absolutem Ether oder THF. Sie sind starke Basen und Nucleophile; sie reagieren
mit Wasser, Alkoholen, Carbonylen, Estern, Nitrilen und mit Sauerstoff.

- Vorbereitung: Magnesiumspäne mit Iod anätzen, Ether absolut, Stickstoff,
  langsames Zutropfen, Kühlung.
- Konzentrationsbestimmung: Titration mit sec-Butanol und 1,10-Phenanthrolin als
  Indikator (Farbumschlag farblos → rotbraun).
- Handhabung: Spritze oder Kanüle, Septum, kein Kontakt mit Luft.

*Organolithium-Verbindungen* (n-BuLi, t-BuLi, LDA) sind noch stärker basisch. Sie
werden bei −78 °C gehandhabt, in absolutem Ether oder THF, unter Argon.

#gefahr[Grignard- und Lithiumreagenzien entzünden sich an Luft und zersetzen sich
mit Wasser unter Feuererscheinung. Niemals mit Wasser löschen; mit trockenem
Sand oder Kohlendioxid ersticken. In kleinen Mengen arbeiten, Spritzen und
Kanülen bereithalten, Sicherheitsbrille und Gesichtsschutz tragen.]

=== Oxidations- und Reduktionsmittel

*Hydride.* Natriumborhydrid ist mild, in Alkoholen löslich und für Aldehyde und
Ketone geeignet; Lithiumaluminiumhydrid ist stärker und reduziert auch
Carbonsäuren, Ester und Nitrile; Diisobutylaluminiumhydrid (DIBAL-H) reduziert
Ester bei −78 °C zum Aldehyd.

$ "R–COOR'" ->^("DIBAL-H, −78 °C") "R–CHO" $

*Chinone und Peroxide.* DDQ und Chloranil sind Hydridacceptoren; m-CPBA und
Peressigsäure sind Epoxidierungsmittel. Peroxide sind schlagempfindlich und
müssen kühl und dunkel gelagert werden.

#gefahr[Lithiumaluminiumhydrid reagiert mit Wasser und Alkoholen unter
Wasserstoffentwicklung und Entzündung; Reste niemals mit Wasser oder Alkohol
zersetzen, sondern mit Ethylacetat und dann mit gesättigter
Natriumsulfatlösung. Natriumborhydrid ist weniger gefährlich, entwickelt aber
ebenfalls Wasserstoff.]

=== Säuren und Basen

*Konzentrierte Säuren* werden zum Verdünnen in Wasser gegeben, nie umgekehrt.
*Schwefelsäure* ist oxidierend und verkohlt Organisches; *Salpetersäure* ist
stark oxidierend und bildet mit organischen Stoffen explosive Gemische;
*Perchlorsäure* darf nie mit organischen Stoffen in Kontakt kommen (Explosion).

*Basen.* Natriumhydroxid und Kaliumhydroxid sind hygroskopisch und ätzend; sie
werden in Plätzchen oder als Maßlösung gehandhabt. Natriumamid und
Kalium-t-butoxid sind starke Basen, die unter Feuchtigkeitsausschluß gelagert
werden.

=== Katalysatoren

*Palladium auf Kohle* ist in trockenem Zustand selbstentzündlich, wenn es
Wasserstoff ausgesetzt wird; es wird feucht gehandhabt und nach Gebrauch in
Wasser gegeben. *Raney-Nickel* ist pyrophor; es wird unter Wasser aufbewahrt
und darf nicht trocken werden. *Platin(IV)-oxid* (Adams-Katalysator) wird als
Suspension eingesetzt.

#figure(
  table(
    columns: (1.6fr, 1.5fr, 1.5fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Reagenz*], [*Gefahr*], [*Schutzmaßnahme*]),
    [Pd/C], [selbstentzündlich], [feucht halten, erden],
    [Raney-Nickel], [pyrophor], [unter Wasser, nie trocken],
    [m-CPBA], [schlagempfindlich], [kühl, dunkel, kleine Mengen],
    [Diazomethan], [toxisch, explosiv], [nur in situ, Abzug],
    [Osmiumtetroxid], [sehr giftig, flüchtig], [Abzug, Handschuhe, kleine Mengen],
    [Phosgen], [sehr giftig], [geschlossenes System],
    [Natriumazid], [toxisch, explosiv mit Schwermetallen], [kein Kupfer, kein Blei],
  ),
  caption: [Besonders gefährliche Reagenzien und ihre Handhabung.],
) <tab:gefaehrliche-reagenzien>

=== Aufgaben

- Warum läuft die S#sub[N]2-Reaktion von Butylchlorid mit Kaliumiodid in Aceton
  schneller ab als in Ethanol, obwohl Aceton weniger polar ist?
- Sie brauchen absoluten Ether für eine Grignard-Reaktion. Beschreiben Sie die
  Absolutierung und die Prüfung auf Wasserfreiheit.
- Ein Ethervorrat ist fünf Jahre alt. Was prüfen Sie, bevor Sie ihn verwenden?
- Warum trocknet man einen Ethylacetat-Extrakt mit Magnesiumsulfat und nicht
  mit Calciumchlorid?
- Ein Ether soll für eine Grignard-Reaktion absolutiert werden. Schreiben Sie
  die Reihenfolge der einzelnen Schritte auf und begründen Sie sie.
- Wieviel Phosphorpentoxid (theoretisch) braucht man, um 50 mL Benzol mit
  0,1 % Wasser zu trocknen?
- Ein Lösungsmittel zeigt nach der Lagerung eine positive Peroxidprobe. Darf
  man es über Natrium/Benzophenon destillieren?
- Welches Lösungsmittel wählen Sie für die Umkristallisation eines
  Stoffes, der in heißem Wasser löslich, in kaltem unlöslich ist?
- Warum darf Calciumchlorid nicht zur Trocknung einer Amin-Lösung
  verwendet werden?
- Ein Ether ist über Natrium getrocknet worden. Welche Prüfung muß vorher
  durchgeführt werden, und warum?
