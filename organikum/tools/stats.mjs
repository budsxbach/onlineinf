// Erhebt Kennzahlen über das Manuskript: Wörter, Vorschriften, Abbildungen,
// Tabellen und die Seitenzahl des gesetzten PDFs.
// Usage: node tools/stats.mjs

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const MAN = path.join(ROOT, 'manuskript');

const files = fs.readdirSync(MAN).filter((f) => f.endsWith('.typ')).sort();
let totalWords = 0;
const rows = [];

for (const file of files) {
  const text = fs.readFileSync(path.join(MAN, file), 'utf8');
  const ohneKommentare = text.replace(/\/\/.*$/gm, '');
  const woerter = ohneKommentare.split(/\s+/).filter(Boolean).length;
  const vorschriften = (text.match(/#vorschrift\(/g) ?? []).length;
  const abbildungen = (text.match(/image\(/g) ?? []).length;
  const tabellen = (text.match(/kind: table|table\(/g) ?? []).length;
  totalWords += woerter;
  rows.push({ datei: file, woerter, vorschriften, abbildungen, tabellen });
}

const pdf = path.join(ROOT, 'ausgabe', 'organikum-vorschau.pdf');
let pdfSeiten = null;
if (fs.existsSync(pdf)) {
  const buf = fs.readFileSync(pdf, 'latin1');
  const treffer = buf.match(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/);
  if (treffer) pdfSeiten = Number(treffer[1]);
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('Datei', 44) + pad('Wörter', 9) + pad('Vorschr.', 10) + pad('Abb.', 7) + 'Tab.');
for (const r of rows) {
  console.log(pad(r.datei, 44) + pad(r.woerter, 9) + pad(r.vorschriften, 10) + pad(r.abbildungen, 7) + r.tabellen);
}
console.log('-'.repeat(76));
console.log(pad('Summe', 44) + pad(totalWords, 9));

// Grobe Reichweite: bei 9,8 pt und diesem Satzspiegel passen etwa 480 Wörter
// auf eine Textseite; Vorschriften und Tabellen brauchen mehr Platz.
const seiten = Math.round(totalWords / 480);
console.log(`\nTextmenge entspricht ca. ${seiten} reinen Textseiten.`);
if (pdfSeiten !== null) console.log(`Gesetztes PDF: ${pdfSeiten} Seiten (Buchformat, inkl. Titelei).`);
console.log(`Ziel: 793 Seiten. Noch offen: ca. ${793 - (pdfSeiten ?? seiten)} Seiten.`);
