/**
 * Tests für die Auslegungs-Engine.  Start: node test/calc.test.mjs
 * Kein Test-Framework nötig — reines Node.
 */
import assert from 'node:assert/strict';
import {
  packConfig,
  inverterInput,
  sectionForDrop,
  cableSizing,
  fuseFor,
  runtime,
  chargeTime,
  derate,
  checkCompatibility,
  buildPlan,
  nextUp,
  AMPACITY,
  FUSE_STEPS,
} from '../core.js';

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
};

console.log('\nAkkupack');
test('13S LiFePO4 ergibt 41,6 V nominal', () => {
  const p = packConfig({ series: 13, capacityAh: 100 });
  assert.equal(p.nominalV, 41.6);
});
test('13S LiFePO4: 47,45 V voll und 36,4 V leer', () => {
  const p = packConfig({ series: 13, capacityAh: 100 });
  assert.equal(p.vFull, 47.45);
  assert.equal(p.vEmpty, 36.4);
});
test('100 Ah bei 41,6 V sind 4,16 kWh', () => {
  const p = packConfig({ series: 13, capacityAh: 100 });
  assert.equal(p.wh, 4160);
  assert.equal(p.kwh, 4.16);
});
test('nutzbar sind 90 % (BMS-Reserve)', () => {
  const p = packConfig({ series: 13, capacityAh: 100 });
  assert.equal(p.usableWh, 3744);
});
test('12S liegt über 48 V voll nicht mehr im Fenster', () => {
  const p = packConfig({ series: 12, capacityAh: 100 });
  assert.equal(p.vEmpty, 33.6);
});
test('4S LiFePO4 = 12,8 V', () => {
  assert.equal(packConfig({ series: 4, capacityAh: 100 }).nominalV, 12.8);
});

console.log('\nStröme');
test('2000 W bei 36,4 V und 90 % Wirkungsgrad → 61 A', () => {
  const i = inverterInput({ acWatts: 2000, efficiency: 0.9, vLow: 36.4, vNom: 41.6 });
  assert.equal(i.iAtEmpty, 61.1);
});
test('bei Nennspannung fließen weniger Ampere', () => {
  const i = inverterInput({ acWatts: 2000, efficiency: 0.9, vLow: 36.4, vNom: 41.6 });
  assert.equal(i.iAtNominal, 53.4);
  assert.ok(i.iAtNominal < i.iAtEmpty);
});
test('Wirkungsgrad verschlechtert den Strom', () => {
  const good = inverterInput({ acWatts: 1000, efficiency: 0.95, vLow: 40, vNom: 40 });
  const bad = inverterInput({ acWatts: 1000, efficiency: 0.8, vLow: 40, vNom: 40 });
  assert.ok(bad.iAtEmpty > good.iAtEmpty);
});

console.log('\nLeiterquerschnitt');
test('Spannungsfallformel: 2·ρ·L·I / (ΔU·U)', () => {
  // 2 · 0,0175 · 1 m · 61 A über 16 mm² = 0,1334 V
  const a = sectionForDrop({ current: 61, lengthM: 1, dropPct: 3, voltage: 36.4 });
  assert.ok(Math.abs(a - 1.954) < 0.02, `erwartet ≈1,95 mm², war ${a}`);
});
test('längeres Kabel braucht mehr Querschnitt', () => {
  const kurz = sectionForDrop({ current: 61, lengthM: 1 });
  const lang = sectionForDrop({ current: 61, lengthM: 3 });
  assert.ok(lang > kurz * 2.9);
});
test('16 mm² reicht für 61 A bei 1 m', () => {
  const c = cableSizing({ current: 61, lengthM: 1, voltage: 36.4 });
  assert.equal(c.mm2, 16);
  assert.ok(c.adequate);
});
test('Sicherung bleibt unter der Leitungsbelastbarkeit', () => {
  const c = cableSizing({ current: 61, lengthM: 1, voltage: 36.4 });
  assert.ok(c.fuseA <= c.ampacityA, `${c.fuseA} A > ${c.ampacityA} A`);
  assert.equal(c.fuseA, 80);
});
test('70 °C Umgebung reduziert die Belastbarkeit', () => {
  assert.ok(derate(70) < derate(30));
  const warm = cableSizing({ current: 61, lengthM: 1, voltage: 36.4, ambient: 60 });
  const kalt = cableSizing({ current: 61, lengthM: 1, voltage: 36.4, ambient: 30 });
  assert.ok(warm.mm2 >= kalt.mm2);
});
test('Verlustleistung ist positiv und plausibel', () => {
  const c = cableSizing({ current: 61, lengthM: 1, voltage: 36.4 });
  assert.ok(c.lossW > 0 && c.lossW < 60, `Verlust ${c.lossW} W`);
});

console.log('\nSicherungen');
test('Sicherung = 1,25 × Strom, aufgenormt', () => {
  assert.equal(fuseFor({ current: 61, cableAmpacity: 88 }).ratingA, 80);
});
test('Sicherung nie über Leitungsbelastbarkeit', () => {
  const f = fuseFor({ current: 61, cableAmpacity: 47 });
  assert.ok(f.ratingA <= 47, `${f.ratingA} A`);
  assert.equal(f.ok, false, 'Sicherung löst im Nennbetrieb aus');
  assert.equal(f.cableOk, true, 'Leitung bleibt geschützt');
});
test('nächster Tabellenwert wird gewählt', () => {
  assert.equal(nextUp(FUSE_STEPS, 33).valueOf(), 40);
  assert.equal(nextUp(AMPACITY, 61, (e) => e.a).mm2, 10);
});

console.log('\nLaufzeit und Laden');
test('3744 Wh Nutzenergie bei 500 W AC → 6,7 h', () => {
  const r = runtime({ usableWh: 3744, loadW: 500, efficiency: 0.9 });
  assert.equal(r.hours, 6.74);
  assert.match(r.text, /6 h 44 min/);
});
test('Volllast 2000 W hält gut 1,5 h durch', () => {
  const r = runtime({ usableWh: 3744, loadW: 2000, efficiency: 0.9 });
  assert.ok(r.hours > 1.6 && r.hours < 1.8, `${r.hours} h`);
});
test('Ladezeit mit 1500 W ist plausibel', () => {
  const c = chargeTime({ wh: 4160, chargeW: 1500, chargeEfficiency: 0.9 });
  assert.ok(c.hours > 2.9 && c.hours < 3.2, `${c.hours} h`);
});
test('0,2 C ist ein gesunder Ladestrom für LiFePO4', () => {
  const c = chargeTime({ wh: 4160, chargeA: 20, capacityAh: 100 });
  assert.equal(c.cRate, 0.2);
});

console.log('\nKompatibilität');
const base = buildPlan({});
test('Standardplan ist ohne Fehler lauffähig', () => {
  assert.equal(base.issues.filter((i) => i.level === 'error').length, 0);
});
test('BMS mit 60 A wird als Fehler erkannt', () => {
  const plan = buildPlan({ bmsA: 60 });
  const err = plan.issues.find((i) => i.title === 'BMS zu schwach');
  assert.ok(err, 'Warnung fehlt');
  assert.equal(err.level, 'error');
});
test('16S-Pack sprengt das 50-V-Fenster', () => {
  const plan = buildPlan({ series: 16 });
  assert.ok(plan.issues.some((i) => i.title === 'Ladeschlussspannung zu hoch'));
});
test('Dauerleistung wird vom BMS begrenzt', () => {
  const plan = buildPlan({ bmsA: 60, acWatts: 2000 });
  assert.equal(plan.bmsLimited, true);
  assert.ok(plan.maxContinuousW < 2000);
});
test('2000 W sind mit 100-A-BMS dauerhaft möglich', () => {
  assert.equal(base.maxContinuousW, 2000);
  assert.equal(base.bmsLimited, false);
});
test('Peak-Minuten bei Volllast sind plausibel', () => {
  assert.ok(base.peakMinutes > 90 && base.peakMinutes < 130, `${base.peakMinutes} min`);
});
test('Plan liefert alle Teilstücke', () => {
  for (const key of ['pack', 'inverter', 'inputCurrent', 'mainCable', 'chargerCable', 'dc12', 'runtime', 'charge']) {
    assert.ok(base[key], `fehlt: ${key}`);
  }
});
test('Kompatibilitätsprüfung ist eigenständig nutzbar', () => {
  const issues = checkCompatibility({
    pack: packConfig({ series: 13 }),
    inverter: { acWatts: 2000, efficiency: 0.9, minDcV: 36, maxDcV: 50 },
    bmsA: 100,
    cable: { adequate: true, dropPercent: 1 },
    motorLimitW: 2000,
  });
  assert.equal(issues.length, 1);
  assert.equal(issues[0].level, 'warn');
});


/* ─────────────────────────── Diagramm ─────────────────────────── */
const { diagram } = await import('../diagram.js');

console.log('\nDiagramm');
test('SVG ist wohlgeformt umschlossen', () => {
  const svg = diagram(buildPlan({}));
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.trimEnd().endsWith('</svg>'));
});
test('SVG enthält keine Platzhalter oder NaN', () => {
  const svg = diagram(buildPlan({}));
  assert.ok(!svg.includes('NaN'));
  assert.ok(!svg.includes('undefined'));
  assert.ok(!svg.includes('[object Object]'));
});
test('berechnete Werte stehen im Plan', () => {
  const plan = buildPlan({});
  const svg = diagram(plan);
  assert.ok(svg.includes(`${plan.mainCable.fuseA} A`), 'Sicherung fehlt');
  assert.ok(svg.includes(`${plan.mainCable.mm2.toFixed(1).replace('.', ',')} mm²`), 'Querschnitt fehlt');
  assert.ok(svg.includes('INVERTER'));
  assert.ok(svg.includes('BMS'));
});
test('Änderung der Eingaben ändert den Plan', () => {
  const a = diagram(buildPlan({ bmsA: 100 }));
  const b = diagram(buildPlan({ bmsA: 200 }));
  assert.notEqual(a, b);
  assert.ok(b.includes('200 A Dauer'));
});
test('kleine Anlage bleibt ein gültiges SVG', () => {
  const svg = diagram(buildPlan({ series: 4, capacityAh: 20, acWatts: 300, bmsA: 40 }));
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.includes('12,80 V') || svg.includes('12,8 V'));
});

console.log(`\n${passed} Tests bestanden${process.exitCode ? ' — mit Fehlern' : ''}\n`);
