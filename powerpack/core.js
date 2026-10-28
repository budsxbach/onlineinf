/**
 * core.js — Auslegungs-Engine für das 48-V-Powerpack.
 *
 * Reine Funktionen, keine DOM-Abhängigkeit: läuft im Browser (app.js)
 * und in den Tests (test/calc.test.mjs).
 *
 * Alle Formeln sind bewusst konservativ und transparent. Wo genormt wird,
 * steht die Norm bzw. Faustregel im Kommentar daneben.
 */

/* ─────────────────────────── Konstanten ─────────────────────────── */

/** Spezifischer Widerstand Kupfer bei 20 °C in Ω·mm²/m. */
export const RHO_CU = 0.0175;

/** Zellchemie: Nenn-, Ladeschluss- und Entladeschlussspannung pro Zelle. */
export const CHEMISTRY = {
  lifepo4: { key: 'lifepo4', label: 'LiFePO4', nominal: 3.2, full: 3.65, empty: 2.8, maxLoadC: 1.0 },
  nmc: { key: 'nmc', label: 'NMC / Li-Ion', nominal: 3.7, full: 4.2, empty: 3.0, maxLoadC: 0.5 },
};

/**
 * Dauerstrombelastbarkeit (A) von Kupfer-Einaderleitungen in freier Luft
 * bei 30 °C Umgebung, Isolierung 70 °C (PVC) — angelehnt an DIN EN 60228 /
 * gängige Kabeltabellen. Werte sind Richtwerte, keine Normzusage.
 */
export const AMPACITY = [
  { mm2: 1.5, a: 20 },
  { mm2: 2.5, a: 27 },
  { mm2: 4, a: 37 },
  { mm2: 6, a: 47 },
  { mm2: 10, a: 65 },
  { mm2: 16, a: 88 },
  { mm2: 25, a: 115 },
  { mm2: 35, a: 140 },
  { mm2: 50, a: 175 },
  { mm2: 70, a: 220 },
  { mm2: 95, a: 265 },
];

/** Temperatur-Derating für 70-°C-Isolierung, Basis 30 °C. */
export const TEMP_DERATE = [
  { ambient: 30, factor: 1.0 },
  { ambient: 40, factor: 0.87 },
  { ambient: 50, factor: 0.71 },
  { ambient: 60, factor: 0.5 },
];

/** Genormte Sicherungswerte (A) — ANL, Class-T, MIDI, KFZ-Streifensicherung. */
export const FUSE_STEPS = [20, 25, 30, 40, 50, 60, 75, 80, 100, 125, 150, 175, 200, 250, 300, 400];

/** Sinnvolle Zellkonfigurationen für 48-V-Klasse. */
export const PACKS = {
  12: { label: '12 V (4S)', series: 4 },
  24: { label: '24 V (8S)', series: 8 },
  48: { label: '48 V (13S)', series: 13 },
};

/* ─────────────────────────── Hilfsfunktionen ─────────────────────────── */

export const round = (v, digits = 1) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

/** Nächstgrößerer Tabellenwert. */
export function nextUp(list, value, pick = (x) => x) {
  const sorted = [...list].sort((a, b) => pick(a) - pick(b));
  return sorted.find((item) => pick(item) >= value - 1e-9) ?? sorted[sorted.length - 1];
}

/** Nächstkleinerer Tabellenwert. */
export function nextDown(list, value, pick = (x) => x) {
  const sorted = [...list].sort((a, b) => pick(a) - pick(b));
  const lower = sorted.filter((item) => pick(item) <= value);
  return lower.length ? lower[lower.length - 1] : sorted[0];
}

/** Derating-Faktor interpolieren (linear zwischen Stützstellen). */
export function derate(ambient) {
  if (ambient <= TEMP_DERATE[0].ambient) return TEMP_DERATE[0].factor;
  for (let i = 1; i < TEMP_DERATE.length; i++) {
    const a = TEMP_DERATE[i - 1];
    const b = TEMP_DERATE[i];
    if (ambient <= b.ambient) {
      const t = (ambient - a.ambient) / (b.ambient - a.ambient);
      return a.factor + (b.factor - a.factor) * t;
    }
  }
  return TEMP_DERATE[TEMP_DERATE.length - 1].factor;
}

/* ─────────────────────────── Akkupack ─────────────────────────── */

/**
 * Pack aus Zellkonfiguration berechnen.
 * @param {{series:number, capacityAh:number, chemistry?:string}} cfg
 */
export function packConfig({ series = 13, capacityAh = 100, chemistry = 'lifepo4' }) {
  const chem = CHEMISTRY[chemistry] ?? CHEMISTRY.lifepo4;
  const nominalV = round(series * chem.nominal, 2);
  const vFull = round(series * chem.full, 2);
  const vEmpty = round(series * chem.empty, 2);
  const wh = round(nominalV * capacityAh, 0);
  return {
    chemistry: chem.key,
    chemistryLabel: chem.label,
    series,
    capacityAh,
    nominalV,
    vFull,
    vEmpty,
    wh,
    kwh: round(wh / 1000, 2),
    /** Nutzbar, wenn man 10 % Reserve lässt (BMS-Abschaltung vermeiden). */
    usableWh: round(wh * 0.9, 0),
    /** Grober Gewichtsrahmen: 100–110 Wh/kg auf Packebene inkl. Gehäuse. */
    weightKg: round(wh / 100, 1),
    /** Zellanzahl. */
    cells: series,
  };
}

/* ─────────────────────────── Ströme im System ─────────────────────────── */

/**
 * Eingangsstrom des Inverters aus der AC-Last.
 * Der Strom ist bei leerem Akku am höchsten — das ist der Auslegefall.
 */
export function inverterInput({ acWatts = 2000, efficiency = 0.9, vLow = 36.4, vNom = 41.6 }) {
  const dcWatts = acWatts / efficiency;
  return {
    acWatts,
    dcWatts: round(dcWatts, 0),
    iAtEmpty: round(dcWatts / vLow, 1),
    iAtNominal: round(dcWatts / vNom, 1),
  };
}

/* ─────────────────────────── Leiterquerschnitt ─────────────────────────── */

/**
 * Querschnitt aus zulässigem Spannungsfall.
 * A = (2 · ρ · L · I · 100) / (ΔU% · U)
 */
export function sectionForDrop({ current, lengthM = 1, dropPct = 3, voltage = 41.6 }) {
  const a = (2 * RHO_CU * lengthM * current * 100) / (dropPct * voltage);
  return round(a, 2);
}

/**
 * Komplette Leiterauslegung: Spannungsfall, Belastbarkeit, Sicherung.
 * Der Querschnitt muss beide Kriterien erfüllen; die Sicherung darf die
 * Leitung nie überlasten (Sicherung ≤ Belastbarkeit der Leitung).
 */
export function cableSizing({
  current,
  lengthM = 1,
  dropPct = 3,
  voltage = 41.6,
  ambient = 30,
  fuseFactor = 1.25,
  minMm2 = 1.5,
}) {
  const byDrop = sectionForDrop({ current, lengthM, dropPct, voltage });
  const factor = derate(ambient);
  const rated = (entry) => entry.a * factor;

  // Reihenfolge ist entscheidend: erst die Sicherung festlegen (1,25 × I),
  // dann muss die Leitung diese Sicherung dauerhaft tragen können.
  const fuseTarget = current * fuseFactor;
  const fuseRated = nextUp(FUSE_STEPS, fuseTarget);
  const byAmpacity = nextUp(AMPACITY, fuseRated, rated);

  const needed = Math.max(byDrop, minMm2, byAmpacity.mm2);
  const chosen = nextUp(AMPACITY, needed, (e) => e.mm2);

  const ampacityOfChosen = chosen.a * factor;
  const fuseCeil = nextDown(FUSE_STEPS, ampacityOfChosen);
  const fuse = Math.min(fuseRated, fuseCeil);

  const dropV = (2 * RHO_CU * lengthM * current) / chosen.mm2;
  const dropPercent = (dropV / voltage) * 100;
  const lossW = dropV * current;

  return {
    current: round(current, 1),
    lengthM,
    byDrop,
    byAmpacityMm2: byAmpacity.mm2,
    mm2: chosen.mm2,
    ampacityA: round(ampacityOfChosen, 0),
    ampacityFactor: round(factor, 2),
    dropV: round(dropV, 3),
    dropPercent: round(dropPercent, 2),
    lossW: round(lossW, 1),
    fuseA: fuse,
    fuseIdealA: round(fuseTarget, 1),
    fuseOk: fuse >= fuseTarget - 1e-9,
    adequate: dropPercent <= dropPct + 0.01,
    /** Passende Aderendhülsen / Klemmen für den Querschnitt. */
    lug: chosen.mm2 <= 6 ? 'M6-Ringöse' : chosen.mm2 <= 16 ? 'M8-Ringöse' : 'M10-Bolzenklemme',
  };
}

/* ─────────────────────────── Sicherung ─────────────────────────── */

/**
 * Sicherungswert: 1,25 × Betriebsstrom, aber nie über der Leitungsbelastbarkeit.
 */
export function fuseFor({ current, cableAmpacity, fuseFactor = 1.25 }) {
  const target = current * fuseFactor;
  const picked = nextUp(FUSE_STEPS, target);
  const capped = cableAmpacity ? Math.min(picked, nextDown(FUSE_STEPS, cableAmpacity)) : picked;
  return {
    targetA: round(target, 1),
    ratingA: capped,
    /** ok = die Sicherung löst nicht schon im Nennbetrieb aus. */
    ok: capped >= target - 1e-9,
    /** Die Leitung trägt die Sicherung dauerhaft. */
    cableOk: !cableAmpacity || capped <= cableAmpacity,
  };
}

/* ─────────────────────────── Laufzeit / Laden ─────────────────────────── */

/** Laufzeit in Stunden bei gegebener AC-Last. */
export function runtime({ usableWh, loadW, efficiency = 0.9 }) {
  if (loadW <= 0) return { hours: Infinity, minutes: Infinity, text: '—' };
  const dcW = loadW / efficiency;
  const hours = usableWh / dcW;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return {
    hours: round(hours, 2),
    minutes: Math.round(hours * 60),
    text: hours >= 1 ? `${h} h ${m} min` : `${Math.round(hours * 60)} min`,
  };
}

/** Ladezeit von leer auf voll mit gegebener Ladeleistung. */
export function chargeTime({ wh, chargeW, chargeEfficiency = 0.9, capacityAh, chargeA }) {
  const eff = chargeW ?? chargeA * 48 * 1.0;
  const hours = wh / (eff * chargeEfficiency);
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return {
    hours: round(hours, 2),
    text: `${h} h ${m} min`,
    cRate: chargeA && capacityAh ? round(chargeA / capacityAh, 2) : null,
  };
}

/* ─────────────────────────── Grenzen prüfen ─────────────────────────── */

/**
 * Prüft, ob die Bauteile zusammenpassen. Liefert Warnungen und Fehler,
 * damit die Oberfläche sie sofort anzeigen kann.
 */
export function checkCompatibility({ pack, inverter, bmsA, cable, motorLimitW }) {
  const issues = [];
  const iMax = inverterInput({
    acWatts: inverter.acWatts,
    efficiency: inverter.efficiency,
    vLow: pack.vEmpty,
    vNom: pack.nominalV,
  }).iAtEmpty;

  if (bmsA < iMax * 1.1) {
    issues.push({
      level: 'error',
      title: 'BMS zu schwach',
      text: `Bei ${inverter.acWatts} W fließen bis zu ${iMax} A. Das BMS kann ${bmsA} A — es würde abschalten oder überhitzen. Nötig: mindestens ${Math.ceil((iMax * 1.1) / 10) * 10} A Dauerstrom.`,
    });
  }

  if (pack.vFull > inverter.maxDcV) {
    issues.push({
      level: 'error',
      title: 'Ladeschlussspannung zu hoch',
      text: `Der Pack erreicht ${pack.vFull} V, der Inverter erlaubt maximal ${inverter.maxDcV} V. Eine Zelle weniger (12S) oder ein anderer Inverter ist nötig.`,
    });
  }

  if (pack.vEmpty < inverter.minDcV) {
    issues.push({
      level: 'warn',
      title: 'Entladeschluss unter Inverter-Minimum',
      text: `Der Pack fällt bis auf ${pack.vEmpty} V, der Inverter braucht mindestens ${inverter.minDcV} V. Das BMS schaltet also erst ab, wenn der Inverter längst aus ist — die letzten Prozente bleiben ungenutzt.`,
    });
  }

  if (motorLimitW && motorLimitW > inverter.acWatts / 3) {
    issues.push({
      level: 'warn',
      title: 'Motorlast grenzwertig',
      text: `Ein Motor mit ${motorLimitW} W zieht beim Anlauf kurzzeitig bis zu ${motorLimitW * 3} W. Der Inverter kann ${inverter.acWatts} W — Anlaufstrom begrenzen oder Sanftanlauf vorsehen.`,
    });
  }

  if (cable && !cable.adequate) {
    issues.push({
      level: 'warn',
      title: 'Spannungsabfall hoch',
      text: `Der gewählte Querschnitt ergibt ${cable.dropPercent} % Verlust (${cable.dropV} V, ${cable.lossW} W Wärme). Kürzeres Kabel oder größerer Querschnitt hilft.`,
    });
  }

  return issues;
}

/* ─────────────────────────── Gesamtplan ─────────────────────────── */

/**
 * Ein Aufruf, kompletter Plan. Das ist die Funktion, die die Oberfläche nutzt.
 */
export function buildPlan(input) {
  const cfg = {
    series: 13,
    capacityAh: 100,
    chemistry: 'lifepo4',
    acWatts: 2000,
    efficiency: 0.9,
    bmsA: 100,
    lengthM: 1,
    dropPct: 3,
    ambient: 30,
    loadW: 500,
    chargeW: 1500,
    motorLimitW: 0,
    ...input,
  };

  const pack = packConfig(cfg);
  const inverter = {
    acWatts: cfg.acWatts,
    efficiency: cfg.efficiency,
    minDcV: 36,
    maxDcV: 50,
  };

  const inputCurrent = inverterInput({
    acWatts: cfg.acWatts,
    efficiency: cfg.efficiency,
    vLow: pack.vEmpty,
    vNom: pack.nominalV,
  });

  const mainCable = cableSizing({
    current: inputCurrent.iAtEmpty,
    lengthM: cfg.lengthM,
    dropPct: cfg.dropPct,
    voltage: pack.vEmpty,
    ambient: cfg.ambient,
    minMm2: 16,
  });

  const chargerCable = cableSizing({
    current: cfg.chargeW / pack.nominalV / cfg.efficiency,
    lengthM: Math.max(0.5, cfg.lengthM),
    dropPct: cfg.dropPct,
    voltage: pack.nominalV,
    ambient: cfg.ambient,
    fuseFactor: 1.25,
    minMm2: 4,
  });

  const dc12 = cableSizing({
    current: 20,
    lengthM: 1,
    dropPct: 3,
    voltage: 12,
    ambient: cfg.ambient,
    minMm2: 2.5,
  });

  /** Tatsächlich dauerhaft fahrbare AC-Leistung: Minimum aus Inverter und BMS. */
  const bmsLimitW = cfg.bmsA * pack.vEmpty * cfg.efficiency;
  const maxContinuousW = Math.min(cfg.acWatts, round(bmsLimitW, 0));

  const run = runtime({ usableWh: pack.usableWh, loadW: cfg.loadW, efficiency: cfg.efficiency });
  const charge = chargeTime({
    wh: pack.wh,
    chargeW: Math.min(cfg.chargeW, pack.kwh > 1 ? cfg.chargeW : cfg.chargeW),
    capacityAh: pack.capacityAh,
    chargeA: cfg.chargeW / pack.nominalV / cfg.efficiency,
  });

  const issues = checkCompatibility({
    pack,
    inverter,
    bmsA: cfg.bmsA,
    cable: mainCable,
    motorLimitW: cfg.motorLimitW,
  });

  return {
    input: cfg,
    pack,
    inverter,
    inputCurrent,
    mainCable,
    chargerCable,
    dc12,
    maxContinuousW,
    bmsLimited: bmsLimitW < cfg.acWatts,
    runtime: run,
    charge,
    issues,
    /** Wie viele Minuten Volllast der Pack durchhält (Peak-Betrieb). */
    peakMinutes: round((pack.usableWh / (cfg.acWatts / cfg.efficiency)) * 60, 0),
  };
}
