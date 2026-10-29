#!/usr/bin/env node
/**
 * Erzeugt assets/schaltplan.svg — Systemschaltplan des 2-kW-Powerpacks.
 * Reines Node-Skript ohne Abhängigkeiten:  node gen-schaltplan.mjs
 * PNG daraus:  npx --yes --package=@resvg/resvg-js node -e "…"  (siehe README)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RED = '#dc2626';
const BLK = '#111827';
const ORG = '#c2410c';
const BLU = '#1d4ed8';
const GRY = '#475569';
const INK = '#0f172a';
const LINE = '#e2e8f0';

const Y_TOP = 190;   // Plus-Schiene
const Y_BOT = 320;   // Minus-Schiene
const BOX_T = 150;
const BOX_B = 338;
const BMS_L = 300;
const BMS_R = 480;
const BUS_P = 715;
const BUS_N = 775;

const cells = (x, y, n = 13) => {
  let out = '';
  for (let i = 0; i < n; i++) {
    out += `<rect x="${x + i * 13}" y="${y}" width="9" height="30" rx="1.5" fill="#cbd5e1" stroke="#334155" stroke-width="1"/>`;
  }
  return out;
};
const bridge = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#ffffff"/>`;
const dot = (x, y, color = INK) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${color}" stroke="#ffffff" stroke-width="2"/>`;
const wire = (x1, y1, x2, y2, color, w = 5) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1330 930" width="1330" height="930" font-family="DejaVu Sans, Verdana, Arial, sans-serif">
<defs><style>
  .t { font-size: 13px; fill: ${INK}; }
  .s { font-size: 11.5px; fill: ${GRY}; }
  .h { font-size: 13px; font-weight: 700; fill: ${INK}; letter-spacing: .07em; }
  .v { font-size: 12.5px; font-weight: 700; }
  .box { fill: #f8fafc; stroke: ${INK}; stroke-width: 1.6; }
</style></defs>
<rect width="1330" height="930" fill="#ffffff"/>

<text x="40" y="46" font-size="25" font-weight="700" fill="${INK}">Powerpack 2 kW — Systemschaltplan</text>
<text x="40" y="74" font-size="13.5" fill="${GRY}">13S LiFePO4 · 48-V-Klasse · 2000-W-Bidirektionalinverter · BMS mit gemeinsamer Plusklemme (B+ = P+)</text>
<line x1="40" y1="92" x2="1290" y2="92" stroke="${LINE}" stroke-width="2"/>

<!-- ═════════ AKKUPACK ═════════ -->
<rect x="40" y="${BOX_T}" width="204" height="${BOX_B - BOX_T}" rx="10" class="box"/>
<text x="56" y="${BOX_T + 28}" class="h">AKKUPACK</text>
${cells(56, BOX_T + 42)}
<text x="56" y="${BOX_T + 100}" class="t">13S × 3,2 V LiFePO4</text>
<text x="56" y="${BOX_T + 122}" class="s">41,6 V nominal</text>
<text x="56" y="${BOX_T + 140}" class="s">47,5 V voll · 36,4 V leer</text>
<text x="56" y="${BOX_T + 164}" class="t">100 Ah · 4,16 kWh</text>
<text x="56" y="${BOX_T + 184}" class="s">Zellverbinder 25 mm²</text>

${wire(244, Y_TOP, BMS_L, Y_TOP, RED)}
${wire(244, Y_BOT - 68, BMS_L, Y_BOT - 68, BLK)}
<text x="272" y="${Y_TOP - 10}" class="v" fill="${RED}" text-anchor="middle">B+</text>
<text x="272" y="${Y_BOT - 46}" class="v" fill="${BLK}" text-anchor="middle">B−</text>

<!-- ═════════ BMS ═════════ -->
<rect x="${BMS_L}" y="${BOX_T}" width="${BMS_R - BMS_L}" height="${BOX_B - BOX_T}" rx="10" class="box"/>
<text x="316" y="${BOX_T + 28}" class="h">BMS</text>
<text x="316" y="${BOX_T + 52}" class="s">13S · ≥ 100 A Dauerstrom</text>
<text x="316" y="${BOX_T + 72}" class="s">Zellspannung überwacht</text>
<text x="316" y="${BOX_T + 92}" class="s">Kurzschluss · Temperatur</text>
<text x="316" y="${BOX_T + 112}" class="s">Balancer für 13S</text>
<text x="316" y="${BOX_T + 136}" class="s">schaltet die Minus-Seite</text>
<text x="316" y="${BOX_T + 156}" class="s">B+ und P+ sind gebrückt</text>
<text x="316" y="${BOX_T + 176}" class="s">Sensorleitung 14-polig</text>

${wire(BMS_R, Y_TOP, 520, Y_TOP, RED)}
${wire(BMS_R, Y_BOT, 700, Y_BOT, BLK)}
${bridge(BUS_P, Y_BOT)}
<text x="492" y="${Y_TOP - 10}" class="v" fill="${RED}">P+</text>
<text x="492" y="${Y_BOT - 12}" class="v" fill="${BLK}">P−</text>

<!-- ═════════ F1 Hauptsicherung ═════════ -->
<rect x="520" y="${Y_TOP - 18}" width="56" height="36" rx="5" fill="#fff1f2" stroke="${RED}" stroke-width="2"/>
<line x1="524" y1="${Y_TOP}" x2="572" y2="${Y_TOP}" stroke="${RED}" stroke-width="2.5"/>
<text x="548" y="${Y_TOP + 5}" class="v" text-anchor="middle" fill="${RED}">F1</text>
<text x="548" y="${Y_TOP - 26}" class="v" text-anchor="middle" fill="${RED}">100 A ANL</text>

<!-- ═════════ S1 Trennschalter ═════════ -->
${wire(576, Y_TOP, 612, Y_TOP, RED)}
<circle cx="616" cy="${Y_TOP}" r="4.5" fill="#fff" stroke="${INK}" stroke-width="2"/>
<line x1="620" y1="${Y_TOP - 2}" x2="654" y2="${Y_TOP - 20}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
<circle cx="658" cy="${Y_TOP}" r="4.5" fill="#fff" stroke="${INK}" stroke-width="2"/>
<text x="658" y="${Y_TOP - 26}" class="v" text-anchor="middle">S1 · 150 A</text>
<text x="588" y="${Y_TOP - 46}" class="s" text-anchor="middle">Hauptsicherung, max. 20 cm ab Zelle</text>
${wire(662, Y_TOP, BUS_P, Y_TOP, RED)}

<!-- Vorladezweig -->
<path d="M608,${Y_TOP + 4} L608,250 L612,250" fill="none" stroke="${GRY}" stroke-width="3"/>
<rect x="612" y="236" width="58" height="28" rx="4" fill="#f1f5f9" stroke="${GRY}" stroke-width="2"/>
<text x="641" y="255" font-size="11.5" text-anchor="middle" fill="${INK}">6,8 Ω</text>
<path d="M670,250 L700,250 L700,${Y_TOP + 4}" fill="none" stroke="${GRY}" stroke-width="3"/>
<circle cx="685" cy="250" r="4" fill="#fff" stroke="${GRY}" stroke-width="2"/>
<text x="530" y="352" class="s">Vorladen: Taster 2–3 s,</text>
<text x="530" y="370" class="s">dann S1 schließen.</text>

<!-- ═════════ DC-Schienen ═════════ -->
${wire(BUS_P, Y_TOP, BUS_P, 556, RED, 7)}
${wire(BUS_N, Y_BOT, BUS_N, 556, BLK, 7)}
<text x="690" y="400" font-size="10.5" font-weight="700" text-anchor="end" fill="${GRY}">DC-BUS</text>

<!-- ═════════ INVERTER ═════════ -->
${wire(BUS_P, Y_TOP, 880, Y_TOP, RED)}
${wire(BUS_N, Y_BOT, 880, Y_BOT, BLK)}
<rect x="880" y="${BOX_T}" width="240" height="${BOX_B - BOX_T}" rx="10" class="box"/>
<text x="896" y="${BOX_T + 28}" class="h">INVERTER / LADER</text>
<text x="896" y="${BOX_T + 54}" class="t">bidirektional, 2000 W</text>
<text x="896" y="${BOX_T + 76}" class="s">DC 36–50 V ↔ AC 230 V</text>
<text x="896" y="${BOX_T + 96}" class="s">Entladen 2000 W (≈ 53 A)</text>
<text x="896" y="${BOX_T + 114}" class="s">Laden 1500 W aus dem Netz</text>
<text x="896" y="${BOX_T + 132}" class="s">Wirkungsgrad ≈ 90 %</text>
<text x="896" y="${BOX_T + 154}" class="s">Lüfter + Temperaturschutz</text>
<text x="896" y="${BOX_T + 174}" class="s">Kühlkörper frei anströmen</text>

<!-- ═════════ AC-Ausgang ═════════ -->
${wire(1120, 220, 1152, 220, ORG)}
<rect x="1150" y="${BOX_T}" width="158" height="${BOX_B - BOX_T}" rx="10" fill="#fff7ed" stroke="${ORG}" stroke-width="1.8"/>
<text x="1164" y="${BOX_T + 28}" class="h" fill="${ORG}">AC-AUSGANG</text>
<text x="1164" y="${BOX_T + 54}" class="t">230 V / 50 Hz</text>
<text x="1164" y="${BOX_T + 76}" class="s">FI 30 mA + LS 16 A</text>
<text x="1164" y="${BOX_T + 94}" class="s">Schuko + CEE blau</text>
<text x="1164" y="${BOX_T + 112}" class="s">PE am Gehäuse</text>
<text x="1164" y="${BOX_T + 134}" class="s">2000 W dauerhaft</text>
<text x="1164" y="${BOX_T + 154}" class="s">Motoren: 3× Anlauf</text>
<text x="1164" y="${BOX_T + 172}" class="s">→ max. ≈ 650 W</text>

<!-- ═════════ DC-DC 12 V ═════════ -->
${wire(BUS_P, 440, 800, 440, RED)}
${bridge(BUS_N, 440)}
<rect x="800" y="422" width="52" height="36" rx="5" fill="#eff6ff" stroke="${BLU}" stroke-width="2"/>
<text x="826" y="446" class="v" text-anchor="middle" fill="${BLU}">F2</text>
<text x="826" y="414" class="s" text-anchor="middle">30 A</text>
${wire(852, 440, 880, 440, RED)}
${bridge(BUS_P, 492)}
${wire(BUS_N, 492, 880, 492, BLK)}
<rect x="880" y="408" width="240" height="118" rx="10" class="box"/>
<text x="896" y="434" class="h">DC-DC-WANDLER</text>
<text x="896" y="458" class="t">48 V → 12 V, 20 A</text>
<text x="896" y="480" class="s">versorgt USB und 12-V-Dose</text>
<text x="896" y="500" class="s">nicht für Wechselrichterlast</text>

${wire(1120, 466, 1152, 466, BLU)}
<rect x="1150" y="408" width="158" height="118" rx="10" fill="#eff6ff" stroke="${BLU}" stroke-width="1.8"/>
<text x="1164" y="434" class="h" fill="${BLU}">12 V / USB</text>
<text x="1164" y="458" class="t">12-V-Dose 10 A</text>
<text x="1164" y="480" class="s">USB-C PD 100 W</text>
<text x="1164" y="500" class="s">2× USB-A 18 W</text>

<!-- ═════════ Optionales Ladegerät ═════════ -->
<rect x="40" y="408" width="330" height="164" rx="10" fill="#fff7ed" stroke="${ORG}" stroke-width="2" stroke-dasharray="9 6"/>
<text x="58" y="434" class="h" fill="${ORG}">OPTIONAL — NETZLADEGERÄT</text>
<text x="58" y="458" class="t">2× 500-W-Ladegerät</text>
<text x="58" y="480" class="s">230 V AC → 52–58 V DC, 10 A</text>
<text x="58" y="502" class="s">nur nutzen, wenn der Bordlader aus</text>
<text x="58" y="520" class="s">ist — sonst arbeiten zwei Regler</text>
<text x="58" y="538" class="s">gegeneinander. Zusammen ≤ 20 A.</text>
${wire(370, 448, 470, 448, ORG, 4)}
<rect x="470" y="430" width="52" height="36" rx="5" fill="#fff7ed" stroke="${ORG}" stroke-width="2"/>
<text x="496" y="454" class="v" text-anchor="middle" fill="${ORG}">F3</text>
<text x="496" y="422" class="s" text-anchor="middle">20 A</text>
${wire(522, 448, BUS_P, 448, ORG, 4)}
${bridge(BUS_N, 448)}
${dot(BUS_P, 448, ORG)}
${bridge(BUS_P, 528)}
${wire(370, 528, BUS_N, 528, BLK, 4)}
${dot(BUS_N, 528, BLK)}

<!-- ═════════ Legende ═════════ -->
<line x1="40" y1="628" x2="1290" y2="628" stroke="${LINE}" stroke-width="2"/>
<text x="40" y="660" class="h">LEGENDE</text>
${wire(40, 692, 86, 692, RED, 6)}
<text x="96" y="696" class="s">DC-Plus 16 mm² (rot)</text>
${wire(300, 692, 346, 692, BLK, 6)}
<text x="356" y="696" class="s">DC-Minus 16 mm² (schwarz)</text>
${wire(580, 692, 626, 692, ORG, 6)}
<text x="636" y="696" class="s">AC 230 V bzw. Ladezweig</text>
${wire(870, 692, 916, 692, BLU, 6)}
<text x="926" y="696" class="s">12 V / USB</text>
<circle cx="1106" cy="692" r="9" fill="#ffffff" stroke="${GRY}" stroke-width="1.5"/>
<text x="1122" y="696" class="s">Kreuzung ohne Verbindung</text>

<!-- ═════════ Sicherheitshinweise ═════════ -->
<rect x="40" y="722" width="1250" height="176" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4"/>
<text x="60" y="750" class="h">SICHERHEIT — VOR DEM ERSTEN EINSCHALTEN PRÜFEN</text>
<text x="60" y="778" class="s">1. Alle 13 Zellspannungen einzeln messen — Abweichung unter 0,03 V.  2. Polarität an BMS und Inverter zweimal kontrollieren, bevor Stecker einrasten.</text>
<text x="60" y="802" class="s">3. Erste Einschaltung ausschließlich über den Vorlade-Widerstand (6,8 Ω / 25 W) — sonst schweißt der Einschaltstrom die Kontakte.</text>
<text x="60" y="826" class="s">4. 230-V-Seite nur mit FI 30 mA, geerdetem Metallgehäuse und Zugentlastung betreiben.  5. Niemals ohne F1 direkt an den Zellen arbeiten: Kurzschlussstrom &gt; 1000 A.</text>
<text x="60" y="850" class="s">6. LiFePO4 unter 0 °C nicht laden.  7. Zellen mechanisch fixieren, Gehäuse druckentlastet und spritzwassergeschützt ausführen.</text>
<text x="60" y="874" class="s">Alle Werte gelten für 1 m Kabellänge bei 25 °C und dienen als Auslegungshilfe — mit dem Konfigurator im Browser an die eigenen Bauteile anpassen.</text>
</svg>`;

const out = path.join(__dirname, '..', 'assets', 'schaltplan.svg');
fs.writeFileSync(out, svg);
console.log('geschrieben:', out, `(${svg.length} Bytes)`);
