/**
 * diagram.js — erzeugt den kompakten Verdrahtungsplan als SVG-String.
 * Reine Funktion, kein DOM: dadurch im Browser und im Test nutzbar.
 */

/** Farbpalette des dunklen Plans. */
export const C = {
  red: '#ef4444',
  blk: '#94a3b8',
  org: '#fb923c',
  blu: '#60a5fa',
  ink: '#e2e8f0',
  dim: '#94a3b8',
  box: '#1e293b',
  edge: '#334155',
};

const nf = (digits = 0) => new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
});

export function diagram(plan) {
  const { pack, mainCable, chargerCable, dc12, inputCurrent, maxContinuousW } = plan;
  const iMax = Math.round(inputCurrent.iAtEmpty);
  const q = (x) => nf(0).format(x);

  const box = (x, y, w, h, title, lines, accent = C.edge) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${C.box}" stroke="${accent}" stroke-width="1.4"/>
    <text x="${x + 12}" y="${y + 22}" font-size="10.5" font-weight="700" fill="${C.ink}" letter-spacing=".09em">${title}</text>
    ${lines.map((t, i) => `<text x="${x + 12}" y="${y + 44 + i * 17.5}" font-size="11.5" fill="${C.dim}">${t}</text>`).join('')}`;

  const wire = (d, color, w = 4) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  const dot = (x, y, color) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${color}" stroke="#0b1220" stroke-width="1.5"/>`;
  const bridge = (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="#0b1220"/>`;
  const label = (x, y, t, color = C.dim, size = 10.5, anchor = 'middle') =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${t}</text>`;

  const fuse = (x, y, w, h, name, value, color) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#0b1220" stroke="${color}" stroke-width="1.6"/>
    <line x1="${x + 5}" y1="${y + h / 2}" x2="${x + w - 5}" y2="${y + h / 2}" stroke="${color}" stroke-width="2"/>
    ${label(x + w / 2, y + h / 2 + 4, name, color, 10)}
    ${label(x + w / 2, y - 6, value, color, 10)}`;

  const Y_P = 120;   // Plus-Schiene
  const Y_N = 180;   // Minus-Schiene
  const BUS_P = 520; // vertikale Plus-Schiene
  const BUS_N = 560; // vertikale Minus-Schiene
  const Y_12V = 290; // Abgriff 12-V-Zweig (Plus)
  const Y_12VG = 322; // Abgriff 12-V-Zweig (Minus)

  const parts = [];

  // Gehäuse/Blöcke
  parts.push(box(14, 56, 150, 138, 'AKKUPACK', [
    `${pack.series}S ${pack.chemistryLabel}`,
    `${nf(2).format(pack.nominalV)} V nominal`,
    `${nf(1).format(pack.vEmpty)}–${nf(1).format(pack.vFull)} V`,
    `${q(pack.wh)} Wh · ${q(pack.capacityAh)} Ah`,
    `≈ ${nf(1).format(pack.weightKg)} kg`,
  ]));
  parts.push(box(186, 56, 122, 138, 'BMS', [
    `${q(plan.input.bmsA)} A Dauer`,
    `${pack.series}S Balancer`,
    'P+ = B+ gebrückt',
    `Last max. ${iMax} A`,
  ]));
  parts.push(box(612, 56, 138, 138, 'INVERTER', [
    `${q(plan.inverter.acWatts)} W Dauer`,
    `${q(maxContinuousW)} W nutzbar`,
    `Akku ${iMax} A max.`,
    `η ${q(plan.inverter.efficiency * 100)} %`,
    '36–50 V DC',
  ]));
  parts.push(box(792, 46, 194, 158, 'AC 230 V', [
    `${q(plan.inverter.acWatts / 230)} A max.`,
    'FI 30 mA + LS 16 A',
    'PE am Gehäuse',
    `Motor bis ${q(Math.round(plan.inverter.acWatts / 3))} W`,
  ], '#fdba74'));
  parts.push(box(648, 258, 138, 112, 'DC-DC 12 V', [
    '48 V → 12 V, 20 A',
    `Sicherung ${q(dc12.fuseA)} A`,
    `${nf(1).format(dc12.mm2)} mm² Leitung`,
  ]));
  parts.push(box(812, 258, 174, 112, '12 V / USB', [
    '12-V-Dose 10 A',
    'USB-C PD 100 W',
    '2× USB-A 18 W',
  ], '#93c5fd'));

  // Leitungen
  parts.push(wire(`M164,${Y_P} H186`, C.red));
  parts.push(wire(`M308,${Y_P} H340`, C.red));
  parts.push(wire(`M384,${Y_P} H414`, C.red));
  parts.push(wire(`M462,${Y_P} H612`, C.red));
  parts.push(wire(`M${BUS_P},${Y_P} V${Y_12V}`, C.red, 5.5));

  parts.push(wire(`M164,${Y_N} H186`, C.blk));
  parts.push(wire(`M308,${Y_N} H612`, C.blk));
  parts.push(wire(`M${BUS_N},${Y_N} V${Y_12VG}`, C.blk, 5.5));

  parts.push(wire('M750,110 H792', C.org));

  // 12-V-Zweig
  parts.push(wire(`M${BUS_P},${Y_12V} H648`, C.red));
  parts.push(wire(`M${BUS_N},${Y_12VG} H648`, C.blk));
  parts.push(wire('M786,300 H812', C.blu));

  // Bauteile auf den Leitungen
  parts.push(fuse(340, Y_P - 16, 44, 32, 'F1', `${q(mainCable.fuseA)} A`, C.red));
  parts.push(`<circle cx="418" cy="${Y_P}" r="4" fill="#0b1220" stroke="${C.ink}" stroke-width="1.6"/>
    <line x1="422" y1="${Y_P - 2}" x2="452" y2="${Y_P - 18}" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="456" cy="${Y_P}" r="4" fill="#0b1220" stroke="${C.ink}" stroke-width="1.6"/>`);
  parts.push(fuse(578, Y_12V - 16, 44, 32, 'F2', `${q(dc12.fuseA)} A`, C.red));

  // Kreuzungen ohne Verbindung (nach den Leitungen!)
  parts.push(bridge(BUS_P, Y_N));
  parts.push(bridge(BUS_N, Y_12V));

  // Verbindungspunkte
  parts.push(dot(BUS_P, Y_12V, C.red));
  parts.push(dot(BUS_N, Y_12VG, C.blk));

  // Beschriftung
  parts.push(label(176, Y_P - 8, 'B+', C.red, 10));
  parts.push(label(176, Y_N + 16, 'B−', C.blk, 10));
  parts.push(label(316, Y_P - 8, 'P+', C.red, 10, 'start'));
  parts.push(label(316, Y_N + 16, 'P−', C.blk, 10, 'start'));
  parts.push(label(430, 84, 'S1 Trennschalter', C.ink, 10));
  parts.push(label(BUS_P + 8, Y_P - 8, 'DC+', C.red, 10, 'start'));
  parts.push(label(BUS_N + 8, Y_N + 16, 'DC−', C.blk, 10, 'start'));

  // Fußzeile
  parts.push(label(14, 400, `Hauptleitung ${nf(1).format(mainCable.mm2)} mm² · ${nf(1).format(mainCable.lengthM * 2)} m gesamt · Verlust ${nf(1).format(mainCable.dropPercent)} % (${q(mainCable.lossW)} W) · Ladeleitung ${nf(0).format(chargerCable.mm2)} mm²`, C.dim, 10.5, 'start'));
  parts.push(label(986, 400, `${pack.series}S · ${nf(2).format(pack.nominalV)} V · ${q(pack.wh)} Wh`, C.dim, 10.5, 'end'));

  return `<svg viewBox="0 0 1000 410" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" role="img" aria-label="Verdrahtungsplan">
  <rect width="1000" height="410" fill="#0b1220"/>
  ${parts.join('\n  ')}
  </svg>`;
}

