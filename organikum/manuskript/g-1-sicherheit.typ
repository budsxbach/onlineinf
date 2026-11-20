// ============================================================================
//  G  Gefahrstoffe, Sicherheit und Erste Hilfe
// ============================================================================

#import "/vorlage/layout.typ": *

== Rechtliche Grundlagen und Kennzeichnung

Der Umgang mit Gefahrstoffen ist in Europa durch die CLP-Verordnung (EG
Nr. 1272/2008) und die Gefahrstoffverordnung geregelt. Für das Praktikum sind
drei Dinge maßgeblich: die Kennzeichnung der Stoffe, die Substitutionsprüfung und
die Dokumentation der Gefährdungsbeurteilung.

=== GHS-Piktogramme

#figure(
  table(
    columns: (auto, 1.6fr, 2.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Kürzel*], [*Bedeutung*], [*Beispiele*]),
    [GHS01], [explosiv], [Peroxide, Azide, Pikrinsäure],
    [GHS02], [entzündbar], [Ether, Aceton, Wasserstoff],
    [GHS03], [oxidierend], [Nitrate, Permanganate, Peroxide],
    [GHS04], [Gase unter Druck], [Druckflaschen, Stickstoff],
    [GHS05], [ätzend], [Schwefelsäure, Natronlauge, Brom],
    [GHS06], [giftig], [Cyanide, Anilin, Osmiumtetroxid],
    [GHS07], [reizend, gesundheitsschädlich], [viele Lösungsmittel],
    [GHS08], [chronische Gesundheitsschäden], [Benzol, Chrom(VI)],
    [GHS09], [umweltgefährlich], [Brom, Chlorpyrifos],
  ),
  caption: [GHS-Piktogramme und typische Vertreter. Ein Stoff kann mehrere
    Piktogramme tragen.],
) <tab:ghs>

=== H- und P-Sätze

H-Sätze beschreiben die Gefahr, P-Sätze die Schutzmaßnahmen. Für das Praktikum
genügen die häufigsten; die vollständige Liste steht im Sicherheitsdatenblatt.

#figure(
  table(
    columns: (auto, 2.6fr),
    inset: (x: 5pt, y: 3.2pt),
    align: (left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*H-Satz*], [*Wortlaut (gekürzt)*]),
    [H225], [Flüssigkeit und Dampf leicht entzündbar],
    [H226], [Flüssigkeit und Dampf entzündbar],
    [H301], [giftig beim Verschlucken],
    [H304], [kann beim Verschlucken und Eindringen in die Atemwege tödlich sein],
    [H311], [giftig bei Hautkontakt],
    [H314], [verursacht schwere Verätzungen der Haut und schwere Augenschäden],
    [H315], [verursacht Hautreizungen],
    [H317], [kann allergische Hautreaktionen verursachen],
    [H318], [verursacht schwere Augenschäden],
    [H319], [verursacht schwere Augenreizung],
    [H331], [giftig beim Einatmen],
    [H335], [kann die Atemwege reizen],
    [H340], [kann genetische Defekte verursachen],
    [H350], [kann Krebs erzeugen],
    [H361], [kann die Fruchtbarkeit beeinträchtigen],
    [H372], [schädigt Organe bei längerer Exposition],
    [H400], [sehr giftig für Wasserorganismen],
    [H411], [giftig für Wasserorganismen, mit langfristiger Wirkung],
  ),
  caption: [H-Sätze, die im Praktikum am häufigsten vorkommen.],
) <tab:hsatz>

#figure(
  table(
    columns: (auto, 2.6fr),
    inset: (x: 5pt, y: 3.2pt),
    align: (left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*P-Satz*], [*Wortlaut (gekürzt)*]),
    [P210], [von Hitze, Funken und offenen Flammen fernhalten],
    [P233], [Behälter dicht verschlossen halten],
    [P260], [Staub und Dampf nicht einatmen],
    [P280], [Schutzhandschuhe und Augenschutz tragen],
    [P301+P330], [bei Verschlucken Mund ausspülen],
    [P303+P361], [bei Hautkontakt Kleidung ausziehen und mit Wasser spülen],
    [P305+P351], [bei Augenkontakt mehrere Minuten mit Wasser spülen],
    [P310], [sofort Giftnotruf oder Arzt anrufen],
    [P403+P235], [an gut belüftetem Ort und kühl lagern],
    [P501], [Inhalt der Problemabfallentsorgung zuführen],
  ),
  caption: [P-Sätze für die Arbeit im Labor.],
) <tab:psatz>

=== Substitutionsprüfung

Vor jeder Vorschrift ist zu prüfen, ob ein gefährlicher Stoff durch einen
weniger gefährlichen ersetzt werden kann. Die Prüfung folgt einer festen
Reihenfolge:

1. Kann die Reaktion ganz entfallen?
2. Gibt es ein weniger gefährliches Verfahren (andere Methode)?
3. Gibt es ein weniger gefährliches Reagenz (Substitution)?
4. Gibt es eine geringere Menge (Maßstabsverkleinerung)?
5. Welche Schutzmaßnahmen sind nötig?

Für die Praxis bedeutet das: Benzol wird durch Toluol ersetzt, wo es geht;
Chrom(VI) durch Permanganat oder TEMPO; Phosgen durch Diphosgen; Ether durch
MTBE; Dichlormethan durch Essigsäureethylester, wo die Löslichkeit es erlaubt.

=== Gefährdungsbeurteilung

Die Gefährdungsbeurteilung ist die schriftliche Antwort auf fünf Fragen:

- Welche Gefahrstoffe werden eingesetzt, und wie sind sie gekennzeichnet?
- Welche Menge, welche Konzentration, welche Dauer?
- Wer ist gefährdet (auch Schwangere, Auszubildende)?
- Welche Schutzmaßnahmen (technisch, organisatorisch, persönlich)?
- Was ist im Notfall zu tun?

Die Beurteilung wird vor dem Versuch erstellt, nicht danach. Sie ist Teil des
Protokolls und wird mit diesem abgezeichnet.

== Arbeiten mit Gefahrstoffen

=== Abzug und Lüftung

Der Abzug ist die wichtigste Schutzmaßnahme. Er arbeitet mit einer
Anströmgeschwindigkeit von 0,3–0,5 m/s an der Frontscheibe; die Scheibe wird so
tief wie möglich geschlossen. Wer den Abzug als Ablage benutzt, hebt seine
Wirkung auf.

#figure(
  table(
    columns: (1.6fr, 1.6fr, 1.8fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Tätigkeit*], [*Ort*], [*Bemerkung*]),
    [Umgang mit flüchtigen Stoffen], [Abzug], [Scheibe tief, keine Lagerung],
    [Arbeiten mit Giftstoffen], [Abzug + Handschuhe], [Mengen minimieren],
    [Arbeiten mit Infektionsmaterial], [Sicherheitswerkbank], [Klasse II],
    [Trocknen von Glasgeräten], [Trockenschrank], [nicht im Abzug],
    [Aufbewahrung von Chemikalien], [Sicherheitsschrank], [nicht im Abzug],
  ),
  caption: [Arbeitsplätze und ihre Zuordnung.],
) <tab:arbeitsplaetze>

=== Persönliche Schutzausrüstung

*Schutzbrille* ist im Labor Pflicht, ohne Ausnahme. *Handschuhe* werden nach
Stoff gewählt: Nitril für wäßrige Lösungen und Lösungsmittel, Butyl für Ketone
und Ester, Viton für aromatische Kohlenwasserstoffe; Latex ist ungeeignet.
*Labormantel* aus Baumwolle, geschlossen, ausreichend lang. *Atemschutz* nur bei
Stäuben und bei Arbeiten außerhalb des Abzugs.

#figure(
  table(
    columns: (1.4fr, 1.6fr, 1.8fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Handschuh*], [*geeignet für*], [*nicht geeignet für*]),
    [Nitril], [wäßrige Lösungen, Alkohole, Öle], [Ketone, chlorierte Lösungsmittel],
    [Butyl], [Ketone, Ester, Säuren], [Kohlenwasserstoffe],
    [Neopren], [Säuren, Basen, Alkohole], [aromatische Kohlenwasserstoffe],
    [Viton], [Aromaten, chlorierte Lösungsmittel], [Ketone],
    [Latex], [wäßrige Lösungen], [fast alle organischen Lösungsmittel],
  ),
  caption: [Handschuhmaterialien und ihre Grenzen. Kein Handschuh schützt
    dauerhaft; Durchbruchzeiten beachten.],
) <tab:handschuhe>

=== Lagergruppen

Chemikalien werden nach Lagergruppen getrennt; die Zuordnung folgt der
Gefährlichkeit, nicht dem Alphabet.

#figure(
  table(
    columns: (1.4fr, 1.6fr, 1.8fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Gruppe*], [*Beispiele*], [*nicht zusammen mit*]),
    [A: entzündbare Flüssigkeiten], [Ether, Aceton, Toluol], [Oxidationsmitteln],
    [B: oxidierende Stoffe], [Nitrate, Permanganate], [brennbaren Stoffen],
    [C: giftige Stoffe], [Cyanide, Anilin], [Säuren],
    [D: ätzende Stoffe], [Schwefelsäure, NaOH], [Cyaniden, Metallen],
    [E: Gase], [Druckflaschen], [Wärmequellen],
    [F: Wasser gefährdend], [Brom, Quecksilber], [Ablauf],
  ),
  caption: [Lagergruppen nach TRGS 510. Die Trennung verhindert die häufigsten
    Laborunfälle.],
) <tab:lagergruppen>

== Erste Hilfe und Notfälle

=== Sofortmaßnahmen

#figure(
  table(
    columns: (1.4fr, 2.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Fall*], [*Maßnahme*]),
    [Hautkontakt mit Säure], [Mit viel Wasser spülen (15 min), Kleidung entfernen],
    [Hautkontakt mit Base], [Mit viel Wasser spülen, nicht neutralisieren],
    [Hautkontakt mit Brom], [Mit viel Wasser spülen, ärztliche Hilfe],
    [Augenkontakt], [Augendusche 15 min, Lid spreizen, Arzt],
    [Einatmen von Dämpfen], [Frische Luft, Lagerung, Arzt],
    [Verschlucken], [Mund spülen, kein Erbrechen bei Lösungsmitteln, Arzt],
    [Verbrennung], [Kühlen mit Wasser (10 min), sterile Abdeckung],
    [Schnittwunde], [Blutung stillen, Wunde spülen, Arzt],
    [Bewußtlosigkeit], [Stabile Seitenlage, Atemkontrolle, Notruf],
  ),
  caption: [Erste-Hilfe-Maßnahmen. Nach jeder Maßnahme ist ärztliche Hilfe
    einzuholen, auch wenn die Symptome gering erscheinen.],
) <tab:erste-hilfe>

*Notrufnummern.* Im Praktikum sind die Nummern der Giftnotrufzentrale, des
Betriebsarztes und des Rettungsdienstes am Ausgang angeschlagen. Die europäische
Notrufnummer 112 gilt überall; die Giftnotrufnummern sind regional
unterschiedlich.

=== Brände

#figure(
  table(
    columns: (1.4fr, 1.6fr, 1.8fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Brandklasse*], [*Material*], [*Löschmittel*]),
    [A], [feste Stoffe], [Wasser, Schaum],
    [B], [Flüssigkeiten], [Schaum, CO#sub[2], Pulver],
    [C], [Gase], [Pulver, CO#sub[2]],
    [D], [Metalle], [Sand, Spezialpulver],
    [F], [Speisefette], [Fettbrandlöscher],
  ),
  caption: [Brandklassen und Löschmittel. Wasser ist bei Klasse B und D
    ungeeignet und bei Metallen gefährlich.],
) <tab:brandklassen>

*Verhalten im Brandfall.* Alarmieren, in Sicherheit bringen, löschen — in dieser
Reihenfolge. Wer einen Fettbrand mit Wasser löscht, erzeugt eine Stichflamme.
Wer einen Metallbrand mit Wasser löscht, erzeugt Wasserstoff.

=== Störungen und Störfälle

Die meisten Laborunfälle sind keine Katastrophen, sondern kleine Störungen,
die falsch beantwortet werden. Die Reihenfolge ist immer dieselbe: Menschen
schützen, Gefahr begrenzen, dann melden. Wer unsicher ist, räumt den Abzug
und holt Hilfe — das ist nie ein Fehler.

#figure(
  table(
    columns: (1.5fr, 2.2fr, 1.5fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Störung*], [*Sofortmaßnahme*], [*Nachsorge*]),
    [Säure oder Lauge verschüttet], [Bindemittel von außen nach innen aufstreuen, nicht in den Abfluß], [Reste sammeln, Fläche mit Wasser nachspülen],
    [Brom verschüttet], [Abzug voll auf, mit Natriumthiosulfatlösung oder Bindemittel bedecken], [Fläche lüften, Flecken mit Ascorbinsäure],
    [Lösungsmittel verschüttet], [Zündquellen fern, Bindemittel (kein Wasser bei leichten LM)], [Kanister sammeln, lüften],
    [Quecksilber ausgelaufen], [Perlen mit Spachtel sammeln, Schwefelpulver aufstreuen], [Spalten und Reste fachgerecht entsorgen],
    [Gasleitung oder Schlauch undicht], [Ventil schließen, nicht schalten, Fenster und Abzug öffnen], [Anlage prüfen lassen, melden],
    [Kühlwasser ausgefallen], [Heizung aus, Reaktion abbrechen oder kühlen], [Apparatur überwachen, Störung melden],
    [Stromausfall], [Heizquellen aus, Hähne schließen, Abzug notlüften], [Anlagen kontrolliert wieder in Betrieb nehmen],
    [Druckanstieg im Gefäß], [Ins Abzug bringen, Hahn öffnen, kühlen — nie am Stopfen drehen], [Ursache klären, Gefäß prüfen],
    [Unbekannte Substanz verschüttet], [Nicht berühren, Bereich absperren, Personal informieren], [Identität klären lassen, dann reinigen],
  ),
  caption: [Störungsszenarien im Labor und die richtige Reihenfolge der
    Maßnahmen. Im Zweifel gilt: abbrechen, abräumen, melden.],
) <tab:stoerfaelle>

*Meldung und Dokumentation.* Jede Störung mit Personenschaden, Gefahrstoffaustritt
oder Feuer wird dem Laborleiter gemeldet und im Verbandbuch eingetragen — auch
dann, wenn nichts passiert zu sein scheint. Nur aus dokumentierten Beinahe-Fällen
lassen sich Gefährdungsbeurteilungen verbessern.

=== Entsorgung

Abfälle werden getrennt gesammelt und gekennzeichnet. Die häufigsten Fehler sind
das Vermischen von halogenierten und nicht halogenierten Lösungsmitteln und das
Einleiten von Schwermetallsalzen in den Abfluß.

#figure(
  table(
    columns: (1.6fr, 1.4fr, 1.6fr),
    inset: (x: 5pt, y: 3.4pt),
    align: (left, left, left),
    stroke: (x, y) => if y == 0 { (bottom: 0.8pt) } else { (top: 0.25pt + luma(175)) },
    table.header([*Abfall*], [*Behälter*], [*Vorbehandlung*]),
    [Lösungsmittel halogeniert], [Kanister, gekennzeichnet], [keine],
    [Lösungsmittel nicht halogeniert], [Kanister, gekennzeichnet], [keine],
    [Wäßrige Säuren und Basen], [Kunststoffkanne], [neutralisieren],
    [Schwermetallsalze], [Kunststoffkanne], [fällen, filtrieren],
    [Cyanidabfälle], [eigener Behälter], [Oxidation mit Hypochlorit],
    [Glasabfälle], [Bruchglasbehälter], [keine],
    [Spritzen und Kanülen], [Sicherheitsbehälter], [keine],
  ),
  caption: [Abfallgruppen und ihre Behandlung.],
) <tab:abfall-g>

=== Aufgaben

- Ein Kollege vergießt 50 mL Brom auf den Abzugsboden. Beschreiben Sie Ihr
  Vorgehen in der richtigen Reihenfolge.
- Warum darf man eine Säure nicht mit Natronlauge auf der Haut neutralisieren?
- Ordnen Sie die folgenden Stoffe den Lagergruppen zu: Aceton, Kaliumnitrat,
  Natriumcyanid, Schwefelsäure, Brom.
- Ein Kühlwasserschlauch reißt während einer Rückflußreaktion mit Ether. Skizzieren Sie die ersten drei Handgriffe.
- Warum wird Brom nicht mit Wasser weggespült, sondern mit Thiosulfatlösung behandelt?
- Nach einem Quecksilberaustritt riecht der Raum nach nichts. Warum ist trotzdem Handlungsbedarf gegeben?
