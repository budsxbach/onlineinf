/**
 * app.js — Oberfläche des Powerpack-Konfigurators.
 * Rechnet mit core.js, zeichnet den Verdrahtungsplan, erzeugt Stückliste
 * und Bau-Checkliste. Zustand liegt in localStorage.
 */
import { buildPlan } from './core.js';
import { diagram } from './diagram.js';

const STORE_INPUTS = 'powerpack.inputs.v1';
const STORE_STEPS = 'powerpack.steps.v1';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const nf = (digits = 0) => new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
});
const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

const DEFAULTS = {
  series: 13,
  chemistry: 'lifepo4',
  capacityAh: 100,
  acWatts: 2000,
  efficiency: 0.9,
  bmsA: 100,
  lengthM: 1,
  dropPct: 3,
  ambient: 30,
  loadW: 500,
  chargeW: 1500,
  motorLimitW: 0,
};

const SLIDERS = [
  { id: 'capacityAh', suffix: ' Ah', digits: 0 },
  { id: 'acWatts', suffix: ' W', digits: 0 },
  { id: 'efficiency', suffix: '', digits: 0, map: (v) => `${Math.round(v * 100)} %` },
  { id: 'bmsA', suffix: ' A', digits: 0 },
  { id: 'lengthM', suffix: ' m', digits: 1 },
  { id: 'dropPct', suffix: ' %', digits: 1 },
  { id: 'ambient', suffix: ' °C', digits: 0 },
  { id: 'loadW', suffix: ' W', digits: 0 },
  { id: 'chargeW', suffix: ' W', digits: 0 },
  { id: 'motorLimitW', suffix: ' W', digits: 0, map: (v) => (v === 0 ? 'keiner' : `${nf(0).format(v)} W`) },
];

/* ─────────────────────────── Zustand ─────────────────────────── */

function readInputs() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_INPUTS) || '{}');
    return { ...DEFAULTS, ...raw };
  } catch {
    return { ...DEFAULTS };
  }
}

const state = { inputs: readInputs(), plan: null };

function saveInputs() {
  try {
    localStorage.setItem(STORE_INPUTS, JSON.stringify(state.inputs));
  } catch { /* privater Modus — egal */ }
}

/* ─────────────────────────── Diagramm ─────────────────────────── */

const C = {
  red: '#ef4444',
  blk: '#94a3b8',
  org: '#fb923c',
  blu: '#60a5fa',
  ink: '#e2e8f0',
  dim: '#94a3b8',
  box: '#1e293b',
  edge: '#334155',
};

/* ─────────────────────────── KPI ─────────────────────────── */

function renderKpi(plan) {
  const { pack, mainCable, runtime, charge, inputCurrent, maxContinuousW } = plan;
  const items = [
    {
      label: 'Kapazität',
      value: `${nf(2).format(pack.kwh)} <small>kWh</small>`,
      note: `${nf(0).format(pack.wh)} Wh · nutzbar ${nf(0).format(pack.usableWh)} Wh`,
      accent: true,
    },
    {
      label: 'Dauerleistung AC',
      value: `${nf(0).format(maxContinuousW)} <small>W</small>`,
      note: plan.bmsLimited ? 'vom BMS begrenzt' : 'vom Inverter freigegeben',
    },
    {
      label: 'Akku-Strom max.',
      value: `${nf(1).format(inputCurrent.iAtEmpty)} <small>A</small>`,
      note: `bei ${nf(1).format(pack.vEmpty)} V (leerer Pack)`,
    },
    {
      label: 'Hauptsicherung',
      value: `${nf(0).format(mainCable.fuseA)} <small>A</small>`,
      note: `${nf(1).format(mainCable.mm2)} mm² Leitung, ${nf(0).format(mainCable.ampacityA)} A belastbar`,
    },
    {
      label: `Laufzeit bei ${nf(0).format(state.inputs.loadW)} W`,
      value: runtime.text.replace(' h ', ' <small>h</small> ').replace(' min', ' <small>min</small>'),
      note: `${nf(0).format(plan.input.loadW / plan.inverter.efficiency)} W aus dem Akku`,
    },
    {
      label: 'Ladezeit leer → voll',
      value: charge.text.replace(' h ', ' <small>h</small> ').replace(' min', ' <small>min</small>'),
      note: `mit ${nf(0).format(state.inputs.chargeW)} W Ladeleistung`,
    },
    {
      label: 'Peak bei Volllast',
      value: `${nf(0).format(plan.peakMinutes)} <small>min</small>`,
      note: `${nf(0).format(plan.inverter.acWatts)} W bis zur BMS-Abschaltung`,
    },
    {
      label: 'Spannungsfenster',
      value: `${nf(1).format(pack.vEmpty)}–${nf(1).format(pack.vFull)} <small>V</small>`,
      note: `${pack.series}S × ${nf(2).format(pack.nominalV / pack.series)} V · ${pack.chemistryLabel}`,
    },
  ];

  $('#kpi').innerHTML = items.map((it) => `
    <div class="kpi${it.accent ? ' accent' : ''}">
      <div class="k-label">${it.label}</div>
      <div class="k-value">${it.value}</div>
      <div class="k-note">${it.note}</div>
    </div>`).join('');
}

function renderIssues(plan) {
  const list = [...plan.issues];
  if (!list.length) {
    list.push({
      level: 'ok',
      title: 'Alle Bauteile passen zusammen',
      text: `BMS, Pack und Inverter sind für ${nf(0).format(plan.inverter.acWatts)} W ausgelegt. Sicherung ${nf(0).format(plan.mainCable.fuseA)} A bei ${nf(1).format(plan.mainCable.mm2)} mm² Leitung.`,
    });
  }
  const icon = { error: '✕', warn: '!', ok: '✓' };
  $('#issues').innerHTML = list.map((i) => `
    <div class="issue ${i.level}">
      <span class="ic" aria-hidden="true">${icon[i.level]}</span>
      <div><strong>${i.title}</strong>${i.text}</div>
    </div>`).join('');
}

/* ─────────────────────────── Rechenweg ─────────────────────────── */

function renderMath(plan) {
  const { pack, inverter, inputCurrent, mainCable, charge, runtime } = plan;
  const rows = [
    ['Packspannung', `<code>${pack.series} × ${nf(2).format(pack.nominalV / pack.series)} V = ${nf(2).format(pack.nominalV)} V</code> nominal, voll ${nf(2).format(pack.vFull)} V, leer ${nf(1).format(pack.vEmpty)} V`],
    ['Energie', `<code>${nf(2).format(pack.nominalV)} V × ${nf(0).format(pack.capacityAh)} Ah = ${nf(0).format(pack.wh)} Wh</code> · 10 % Reserve → nutzbar ${nf(0).format(pack.usableWh)} Wh`],
    ['Akku-Strom', `<code>(P / η) / U<sub>min</sub> = (${nf(0).format(inverter.acWatts)} / ${nf(2).format(inverter.efficiency)}) / ${nf(1).format(pack.vEmpty)} = ${nf(1).format(inputCurrent.iAtEmpty)} A</code>`],
    ['Leitung (Spannungsfall)', `<code>A = 2·ρ·L·I / ΔU = 2 · 0,0175 · ${nf(1).format(mainCable.lengthM)} · ${nf(1).format(mainCable.current)} / (${nf(1).format(mainCable.dropV)} V)</code> → rechnerisch ${nf(2).format(mainCable.byDrop)} mm², gewählt <strong>${nf(1).format(mainCable.mm2)} mm²</strong>`],
    ['Leitung (Belastbarkeit)', `Der Querschnitt muss die Sicherung tragen: ${nf(0).format(mainCable.fuseA)} A bei ${nf(0).format(mainCable.ampacityFactor * 100)} % Temperaturfaktor → ${nf(0).format(mainCable.ampacityA)} A dauerhaft`],
    ['Sicherung', `<code>1,25 × ${nf(1).format(inputCurrent.iAtEmpty)} A = ${nf(1).format(mainCable.fuseIdealA)} A</code> → genormt <strong>${nf(0).format(mainCable.fuseA)} A</strong>`],
    ['Verluste', `Leitung: ${nf(1).format(mainCable.dropV)} V Abfall, ${nf(1).format(mainCable.lossW)} W Wärme. Inverter: ${nf(0).format(inverter.acWatts / inverter.efficiency - inverter.acWatts)} W Verlustleistung bei Volllast`],
    ['Laufzeit', `<code>${nf(0).format(pack.usableWh)} Wh / (${nf(0).format(plan.input.loadW)} W / ${nf(2).format(inverter.efficiency)}) = ${nf(2).format(runtime.hours)} h</code>`],
    ['Laden', `<code>${nf(0).format(pack.wh)} Wh / (${nf(0).format(plan.input.chargeW)} W × 0,9) = ${nf(2).format(charge.hours)} h</code>${charge.cRate ? ` · Ladestrom ≈ ${nf(1).format(charge.cRate * plan.input.capacityAh)} A = ${nf(2).format(charge.cRate)} C` : ''}`],
  ];

  $('#math').innerHTML = `<table><tbody>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</tbody></table>`;
}

/* ─────────────────────────── Stückliste ─────────────────────────── */

function bomRows(plan) {
  const { pack, mainCable, chargerCable, dc12, inverter } = plan;
  const cells = pack.series;
  const rows = [
    { pos: 1, part: `LiFePO4-Zelle ${nf(1).format(3.2)} V / ${nf(0).format(pack.capacityAh)} Ah (z. B. EVE LF105, CALB)`, qty: `${cells} Stk`, price: 55 * cells, note: 'alle aus derselben Charge, Spannungen vor dem Verpacken prüfen' },
    { pos: 2, part: 'Zellverbinder / Busbars inkl. Schrauben', qty: `${cells - 1} + 2 Stk`, price: 40, note: '25 mm² Kupfer, Anzugsdrehmoment nach Zellhersteller' },
    { pos: 3, part: `BMS ${cells}S, ≥ ${nf(0).format(state.inputs.bmsA)} A, mit Balancer, NTC und Sensorleitung`, qty: '1 Stk', price: 85, note: 'B+/P+ gebrückt ist bei dieser Bauform normal' },
    { pos: 4, part: `Hauptsicherung ${nf(0).format(mainCable.fuseA)} A (ANL/Class-T) + Halter`, qty: '1 Satz', price: 14, note: 'so nah wie möglich an B+, max. 20 cm' },
    { pos: 5, part: 'Batterietrennschalter 12–48 V, ≥ 150 A', qty: '1 Stk', price: 25, note: 'muss DC-Lichtbögen aushalten, kein simpler KFZ-Schalter' },
    { pos: 6, part: 'Vorlade-Widerstand 6,8 Ω / 25 W + Taster (NO)', qty: '1 Satz', price: 9, note: 'schützt die Kondensatoren im Inverter beim Einschalten' },
    { pos: 7, part: `Leitung ${nf(1).format(mainCable.mm2)} mm², rot und schwarz`, qty: `${nf(1).format(mainCable.lengthM * 2 + 1)} m`, price: 18, note: 'feindrähtig, Silikon oder ölfest, 105 °C' },
    { pos: 8, part: `Ringösen ${mainCable.lug}, Schrumpfschlauch`, qty: '8 Stk', price: 12, note: 'verpresst, nicht gelötet — Löten bricht unter Vibration' },
    { pos: 9, part: `Inverter ${nf(0).format(inverter.acWatts)} W bidirektional (vorhanden)`, qty: '1 Stk', price: 0, flag: 'vorhanden', note: '36–50 V DC, 230 V AC, Laden 1500 W' },
    { pos: 10, part: 'FI-Schutzschalter 30 mA + Leitungsschutz 16 A, 2-polig', qty: '1 Satz', price: 45, note: 'Pflicht für 230-V-Ausgänge an mobilen Geräten' },
    { pos: 11, part: 'Einbausteckdose Schuko + CEE blau 16 A', qty: '2 Stk', price: 22, note: 'mit Klappdeckel und Zugentlastung' },
    { pos: 12, part: 'Leitung 3 × 2,5 mm² für 230 V', qty: '3 m', price: 9, note: 'flexibel, für 16 A ausgelegt' },
    { pos: 13, part: 'DC-DC-Wandler 48 V → 12 V, 20 A', qty: '1 Stk', price: 24, note: 'eigener Zweig, nicht hinter dem Inverter' },
    { pos: 14, part: `Sicherung ${nf(0).format(dc12.fuseA)} A + Halter für 12-V-Zweig`, qty: '1 Satz', price: 7, note: `${nf(1).format(dc12.mm2)} mm² Leitungsquerschnitt` },
    { pos: 15, part: 'USB-C-PD-Modul 100 W + 2× USB-A QC', qty: '1 Satz', price: 19, note: 'direkt an 12 V, eigene Sicherung' },
    { pos: 16, part: 'Lüfter 80 mm 12 V + Schutzgitter', qty: '2 Stk', price: 14, note: 'einer drückt unten, einer zieht oben ab' },
    { pos: 17, part: 'Alu-Gehäuse / Flightcase, ca. 30–40 l', qty: '1 Stk', price: 95, note: 'druckentlastet, spritzwassergeschützt, Tragegriff' },
    { pos: 18, part: 'Zugentlastungen, Kabelkanal, Klettband, Kabelbinder', qty: '1 Satz', price: 15, note: 'nichts darf an Lötstellen oder Zellpolen ziehen' },
    { pos: 19, part: 'Wärmeleitpaste, Isolierband, Schrauben, Sicherungslack', qty: '1 Satz', price: 14, note: 'Zellpole abdecken, bevor Werkzeug in die Nähe kommt' },
    { pos: 20, part: `Optional: 2× Ladegerät 500 W (${nf(0).format(chargerCable.fuseA)} A Sicherung)`, qty: '—', price: 0, flag: 'optional', note: 'nur wenn der Bordlader nicht genutzt wird — nie beides gleichzeitig' },
  ];
  return rows;
}

function renderBom(plan) {
  const rows = bomRows(plan);
  const total = rows.reduce((s, r) => s + r.price, 0);
  const caseRow = rows.find((r) => r.part.startsWith('Alu-Gehäuse'));
  const hardware = total - (caseRow ? caseRow.price : 0);

  $('#bom').innerHTML = `
    <thead><tr>
      <th>Pos</th><th>Bauteil</th><th>Menge</th><th class="num">Richtpreis</th><th>Hinweis</th>
    </tr></thead>
    <tbody>
      ${rows.map((r) => `<tr>
        <td class="pos">${r.pos}</td>
        <td>${r.part}${r.flag ? ` <span class="mini">${r.flag}</span>` : ''}</td>
        <td>${r.qty}</td>
        <td class="num">${r.price ? eur.format(r.price) : '—'}</td>
        <td class="hint">${r.note}</td>
      </tr>`).join('')}
    </tbody>`;

  $('#bom-sum').innerHTML = `Summe der zuzukaufenden Teile (ohne vorhandenen Inverter):
    <strong>${eur.format(total)}</strong>. Ohne Gehäuse: ${eur.format(hardware)}.
    Zellpreise schwanken stark — die Position 1 ist der größte Posten.`;
}

/* ─────────────────────────── Bauschritte ─────────────────────────── */

const STEPS = [
  {
    title: 'Zellen prüfen und sortieren',
    body: 'Alle 13 Zellen einzeln messen: <strong>3,25–3,35 V</strong> bei Anlieferung. Zellen mit Ausreißern aussortieren. Zellen mit gleicher Spannung nebeneinander setzen, die schwächste nicht an den Rand.',
    flag: 'Nie Zellen mit unterschiedlicher Chemie oder Kapazität mischen.',
  },
  {
    title: 'Pack aufbauen und verspannen',
    body: '13 Zellen in Reihe, Reihenfolge im Zickzack, damit die Verbinder kurz bleiben. Busbars mit dem vom Zellhersteller genannten Drehmoment anziehen (meist 4–6 Nm), keine Zahnscheiben. Zwischen die Zellen Isolierplatten legen und den Stapel verspannen — LiFePO4-Zellen „atmen“ beim Laden.',
    flag: 'Kurzschluss: Zellverbinder nie mit montiertem Werkzeug fallen lassen.',
  },
  {
    title: 'BMS-Sensorleitung in der richtigen Reihenfolge aufbauen',
    body: 'Stecker <strong>nicht</strong> am BMS anstecken. Einzelleitung 0 an B−, dann Zelle 1 bis 13 durchmessen und erst danach den Stecker aufs BMS setzen. Vor dem Aufstecken die Spannungen zwischen benachbarten Pins prüfen: jede Stufe muss etwa 3,2 V zeigen.',
    flag: 'Falsche Reihenfolge zerstört das Balancer-IC sofort.',
  },
  {
    title: 'B− und B+ am BMS anschließen',
    body: 'B− an den Minuspol des Packs (Zelle 1), B+ an den Pluspol (Zelle 13). Beide Leitungen mit Ringösen verpressen, Schrumpfschlauch über die Öse. Danach <strong>P+ gegen B+</strong> auf Durchgang messen — bei diesem BMS muss Durchgang vorhanden sein.',
  },
  {
    title: 'Hauptsicherung, Trennschalter und Vorladung setzen',
    body: 'F1 so nah wie möglich an B+, maximal 20 cm Leitung. Danach Trennschalter S1. Den Vorlade-Widerstand 6,8 Ω mit Taster parallel zu S1 legen. Alles auf einer Montageplatte festschrauben, Leitungslängen kurz halten.',
    flag: 'Ohne Vorladung zieht der Einschaltstrom > 200 A und verbrennt Schalterkontakte.',
  },
  {
    title: 'Inverter anschließen',
    body: 'XT90-Stecker des Inverters mit der Leitung verbinden — rot ist Plus. Vor dem Einstecken <strong>zweimal</strong> Polung prüfen. Kühlkörper und Lüfter müssen frei liegen, das Board nicht auf die Zellen legen.',
    flag: 'Verpolung am Inverter ist ein Totalschaden, kein Garantiefall.',
  },
  {
    title: 'Erste Einschaltung — der kritische Schritt',
    body: 'Trennschalter <strong>offen</strong> lassen. Taster 2–3 s halten, Spannung am Invertereingang messen (soll ≈ Packspannung), dann erst S1 schließen. BMS-LED beobachten. Erste Last: eine 100-W-Glühlampe oder ein Ladegerät, keine Heizung.',
    flag: 'Beim ersten Einschalten nicht daneben stehen, sondern Abstand halten und beobachten.',
  },
  {
    title: '12-V-Zweig aufbauen',
    body: 'DC-DC-Wandler über F2 (30 A) an den DC-Bus, Ausgang auf 13,8 V einstellen. USB-Modul und 12-V-Dose separat absichern. Der 12-V-Zweig darf <strong>nicht</strong> über den Inverter laufen — sonst wandelt er doppelt und verliert Wirkungsgrad.',
  },
  {
    title: '230-V-Seite verdrahten',
    body: 'Inverterausgang → FI 30 mA → LS 16 A → Steckdosen. Schutzleiter am Metallgehäuse anschließen, alle Leitungen mit Zugentlastung. Adernendhülsen verwenden und die Klemmstellen nachziehen.',
    flag: 'Ausschließlich spannungsfrei arbeiten und vor dem ersten Test von einer Elektrofachkraft prüfen lassen.',
  },
  {
    title: 'Kühlung und Gehäuse',
    body: 'Lüfter unten ansaugen, oben ausblasen lassen, Zellen nicht in den Luftstrom legen (sie mögen keine Zugluft). Temperaturfühler des BMS zwischen die Zellen klemmen. Gehäuse mit Druckausgleichselement versehen.',
  },
  {
    title: 'Funktionstest mit definierter Last',
    body: '2 h mit 500 W belasten (Heizlüfter auf niedriger Stufe), dabei alle 10 min die Zellspannungen prüfen. Die Zellen sollten nicht mehr als 0,05 V auseinanderlaufen. Anschließend Kapazität aus Ladezeit × Strom grob nachrechnen.',
  },
  {
    title: 'Beschriften und dokumentieren',
    body: 'Am Gehäuse: Spannung, Kapazität, Sicherungswert, Warnhinweise („230 V“, „nicht unter 0 °C laden“), Datum. Diese Seite ausdrucken und dazulegen.',
  },
  {
    title: 'Wiederkehrende Prüfung',
    body: 'Alle 6 Monate: Zellspannungen messen, Schrauben der Busbars nachziehen, Isolationswiderstand der 230-V-Seite prüfen, Lüfter reinigen. Auffällige Zelldrift heißt: Zelle tauschen, nicht „weiter benutzen“.',
  },
];

function readSteps() {
  try {
    return JSON.parse(localStorage.getItem(STORE_STEPS) || '{}');
  } catch {
    return {};
  }
}

function renderSteps() {
  const done = readSteps();
  $('#steps').innerHTML = STEPS.map((s, i) => `
    <li class="${done[i] ? 'done' : ''}" data-step="${i}">
      <label>
        <input type="checkbox" data-check="${i}" ${done[i] ? 'checked' : ''} />
        <span>${s.title}</span>
      </label>
      <div class="step-body">${s.body}${s.flag ? `<br /><span class="flag">${s.flag}</span>` : ''}</div>
    </li>`).join('');

  $('#steps').addEventListener('change', onStepChange);
  updateProgress();
}

function onStepChange(ev) {
  const box = ev.target.closest('input[data-check]');
  if (!box) return;
  const idx = box.dataset.check;
  const done = readSteps();
  if (box.checked) done[idx] = true;
  else delete done[idx];
  try {
    localStorage.setItem(STORE_STEPS, JSON.stringify(done));
  } catch { /* egal */ }
  box.closest('li').classList.toggle('done', box.checked);
  updateProgress();
}

function updateProgress() {
  const done = readSteps();
  const count = STEPS.filter((_, i) => done[i]).length;
  $('#progress-bar').style.width = `${(count / STEPS.length) * 100}%`;
  $('#progress-text').textContent = `${count} / ${STEPS.length}`;
}

/* ─────────────────────────── Export ─────────────────────────── */

function bomAsText(plan) {
  const rows = bomRows(plan);
  const lines = [
    `Stückliste Powerpack ${nf(0).format(plan.inverter.acWatts)} W`,
    `${plan.pack.series}S ${plan.pack.chemistryLabel} · ${nf(2).format(plan.pack.nominalV)} V · ${nf(0).format(plan.pack.wh)} Wh`,
    '',
    'Pos | Bauteil | Menge | Richtpreis | Hinweis',
    ...rows.map((r) => `${r.pos} | ${r.part} | ${r.qty} | ${r.price ? eur.format(r.price) : '-'} | ${r.note}`),
    '',
    `Hauptsicherung: ${nf(0).format(plan.mainCable.fuseA)} A · Leitung: ${nf(1).format(plan.mainCable.mm2)} mm²`,
  ];
  return lines.join('\n');
}

function downloadCsv(plan) {
  const rows = bomRows(plan);
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    ['Pos', 'Bauteil', 'Menge', 'Richtpreis EUR', 'Hinweis'].map(esc).join(';'),
    ...rows.map((r) => [r.pos, r.part, r.qty, r.price || '', r.note].map(esc).join(';')),
  ].join('\r\n');

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'powerpack-stueckliste.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ─────────────────────────── Render ─────────────────────────── */

function syncLabels() {
  for (const s of SLIDERS) {
    const el = $(`#${s.id}`);
    const out = $(`#${s.id}-out`);
    if (!el || !out) continue;
    const v = Number(el.value);
    out.textContent = s.map ? s.map(v) : `${nf(s.digits).format(v)}${s.suffix}`;
    el.setAttribute('aria-valuetext', out.textContent);
  }
}

function render() {
  state.plan = buildPlan(state.inputs);
  renderKpi(state.plan);
  renderIssues(state.plan);
  $('#diagram').innerHTML = diagram(state.plan);
  renderMath(state.plan);
  renderBom(state.plan);
}

function syncInputsToDom() {
  for (const key of Object.keys(DEFAULTS)) {
    const el = $(`#${key}`);
    if (!el) continue;
    el.value = state.inputs[key];
  }
  syncLabels();
}

function bindInputs() {
  for (const key of Object.keys(DEFAULTS)) {
    const el = $(`#${key}`);
    if (!el) continue;
    el.addEventListener('input', () => {
      state.inputs[key] = el.type === 'range' || el.tagName === 'SELECT'
        ? (el.tagName === 'SELECT' && isNaN(Number(el.value)) ? el.value : Number(el.value))
        : el.value;
      syncLabels();
      saveInputs();
      render();
    });
  }
}

function init() {
  syncInputsToDom();
  bindInputs();
  renderSteps();
  render();

  $('#reset').addEventListener('click', () => {
    state.inputs = { ...DEFAULTS };
    syncInputsToDom();
    saveInputs();
    render();
  });

  $('#print').addEventListener('click', () => window.print());

  $('#copy-bom').addEventListener('click', async (ev) => {
    const text = bomAsText(state.plan);
    const btn = ev.currentTarget;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Kopiert ✓';
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.append(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      btn.textContent = 'Kopiert ✓';
    }
    setTimeout(() => { btn.textContent = 'Als Text kopieren'; }, 1800);
  });

  $('#download-bom').addEventListener('click', () => downloadCsv(state.plan));

  $('#stamp').textContent = new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // Beim Drucken alle Details öffnen, damit der Schaltplan mit aufs Papier kommt.
  window.addEventListener('beforeprint', () => {
    $$('.detail-box').forEach((d) => { d.open = true; });
  });

  const stepsDone = Object.keys(readSteps()).length;
  if (stepsDone > 0) updateProgress();
}

document.addEventListener('DOMContentLoaded', init);

/* Für Tests im Node-Kontext bereitstellen (optional). */
export { bomRows, STEPS, DEFAULTS };
