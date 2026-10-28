# Powerpack 2 kW — aus deinen Bauteilen gerechnet und geplant

Konfigurator, Stückliste, Schaltplan und Bauanleitung für ein tragbares
48-V-Powerpack im Stil einer Jackery/Powerstation — gebaut aus den Teilen auf
den zehn Fotos.

**Kernaussage:** Ja, die Teile passen zusammen. Es ergibt ein **13S-LiFePO4-Pack
mit 41,6 V und 4,16 kWh**, das über den bidirektionalen 2000-W-Inverter
dauerhaft 2000 W auf 230 V liefert und in gut 3 Stunden über das Netz wieder
voll ist. Notwendig sind nur Sicherung, Trennschalter, Kabel, DC-DC für USB und
ein Gehäuse.

```bash
cd powerpack
npm start          # → http://localhost:4173
npm test           # 35 Auslegungs- und Diagrammtests
npm run plan       # Schaltplan-SVG neu erzeugen
```

---

## Was auf den Fotos zu erkennen ist

| Teil | Lesbare Angaben | Rolle im System |
|---|---|---|
| BMS-Platine (Bild 4) | `B+`, `P+`, `P−`, `B−`, 14-poliger Sensorstecker, Temperaturfühler, „HTB053“, „DGND1“ | überwacht 13 Zellen, schaltet die **Minus**-Seite. Plus ist durchverbunden (`B+ = P+`) |
| Bidirektionaler Inverter (Bilder 6–8) | 2000 W, Eingang **35–50 V DC**, Ausgang **230 V AC**, Laden **1500 W**, Trafo EI33, XT90-Stecker | macht aus dem Akku 230 V **und** lädt ihn aus dem Netz |
| Board mit ER42-Trafo (Bilder 1, 5, 9, 10) | 230 V / 500 W, Netzfilter mit X2-Kondensator | zu klein für dieses Pack — Reserve oder Zweitprojekt |
| Relais mit „2“ und „7“ (Bild 2) | handschriftliche Nummern | Reparaturmarkierung, keine Typangabe |
| Lüfter + Kühlkörper (Bild 3) | 80 mm, zwei Alu-Kühlkörper | Kühlung des Inverters |

Nicht auf den Fotos, aber zwingend: **die Zellen**. Ein 13S-Pack braucht
13 LiFePO4-Zellen in Reihe (z. B. 13 × 3,2 V / 100 Ah prismatisch).

---

## Warum genau 13 Zellen?

Der Inverter akzeptiert 35–50 V DC. Für LiFePO4 heißt das:

| Konfiguration | voll | nominal | leer | passt? |
|---|---|---|---|---|
| 12S | 43,8 V | 38,4 V | 33,6 V | nur halb — der Pack fällt unter die 35 V und die letzten 15 % bleiben ungenutzt |
| **13S** | **47,45 V** | **41,6 V** | **36,4 V** | **ja, das ganze Fenster liegt innen** |
| 16S | 58,4 V | 51,2 V | 44,8 V | nein — Ladeschluss über 50 V, Inverter würde abschalten |

13S ist damit nicht Geschmackssache, sondern die einzige Konfiguration, die
Ladeschluss *und* Entladeschluss innerhalb der 35–50 V unterbringt.

---

## Die wichtigsten Zahlen (100 Ah, 2000 W)

| Größe | Wert | Rechnung |
|---|---|---|
| Energie | 4,16 kWh (nutzbar 3,74 kWh) | 41,6 V × 100 Ah |
| Strom bei Volllast | **61 A** bei leerem Pack | (2000 W / 0,9) / 36,4 V |
| Hauptsicherung | **80 A** | 1,25 × 61 A, aufgenormt |
| Leitung Akku → Inverter | **16 mm²**, 88 A belastbar | muss die 80-A-Sicherung tragen |
| Laufzeit bei 500 W | 6 h 44 min | 3744 Wh / (500 W / 0,9) |
| Laufzeit bei 2000 W | 1 h 41 min | bis zur BMS-Abschaltung |
| Ladezeit | ≈ 3 h 05 min | 4160 Wh / (1500 W × 0,9) |
| BMS-Anforderung | ≥ 100 A Dauerstrom | 61 A + Reserve |

---

## Aufbau in Kurzform

```
Zellen (13S) → BMS (B−/B+) → F1 80 A → S1 Trennschalter → DC-Bus
                                                            ├─ Inverter 2000 W → FI 30 mA → LS 16 A → 230 V
                                                            └─ F2 30 A → DC-DC 48→12 V → USB / 12-V-Dose
```

Zwei Details, die über Erfolg oder Rauch entscheiden:

1. **Vorladen.** Der Inverter hat große Eingangskondensatoren. Beim ersten
   Zusammenschalten fließt kurzzeitig ein Vielfaches des Nennstroms. Ein
   6,8-Ω-Widerstand parallel zum Trennschalter, 2–3 Sekunden über einen Taster
   vorgeladen, verhindert verschweißte Kontakte.
2. **Nur ein Ladegerät.** Der Inverter lädt selbst mit 1500 W. Ein zweites
   Netzteil parallel regelt gegen ihn — beide erhöhen den Strom, bis einer
   abschaltet. Entweder Bordlader oder externes Ladegerät, nie beides.

---

## Dateien

```
powerpack/
├── index.html              Oberfläche (Konfigurator, Stückliste, Bauanleitung)
├── styles.css              Layout, inkl. Druckansicht
├── app.js                  Oberflächenlogik: KPIs, Export, Checkliste
├── diagram.js              Verdrahtungsplan als SVG (reine Funktion)
├── core.js                 Auslegungs-Engine (reine Funktionen)
├── server.mjs              Static-Server, keine Abhängigkeiten
├── assets/
│   ├── schaltplan.svg      detaillierter Systemschaltplan
│   ├── gen-schaltplan.mjs  erzeugt den Schaltplan
│   └── fotos/              die vier aussagekräftigsten Originalfotos
└── test/calc.test.mjs      35 Tests für Rechenwege und Diagramm
```

`core.js` ist bewusst frei von DOM-Code: dieselben Formeln laufen im Browser und
im Test. Wer die Anlage anders auslegen will, ändert nur die Eingaben oben in
`buildPlan()`.

---

## Grenzen und Annahmen

- **Keine Zellen auf den Fotos.** Kapazität (100 Ah), Zelltyp und Zellanzahl
  sind Annahmen; die App rechnet jede andere Kapazität sofort mit.
- **Typenschild statt Datenblatt.** Beim BMS ist der Dauerstrom nicht ablesbar —
  angenommen sind 100 A. Steht auf deinem BMS weniger, zeigt der Konfigurator
  sofort einen Fehler und begrenzt die Dauerleistung.
- **Preise** sind Marktrichtwerte zur Orientierung, keine Angebote.
- **Keine Baumusterprüfung.** Das ist ein Eigenbau. Die 230-V-Seite gehört vor
  der ersten Nutzung von einer Elektrofachkraft abgenommen, und ein FI 30 mA
  ist bei mobilen Geräten Pflicht, nicht Kür.
- **LiFePO4 nicht unter 0 °C laden** — das BMS kann das oft nicht verhindern,
  wenn der Fühler falsch sitzt.

Die vollständige Schritt-für-Schritt-Anleitung steht in der App unter
„Bauanleitung“ — mit Hakchen, die im Browser gespeichert werden.
