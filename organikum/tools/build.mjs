// Build the book PDF from Typst sources.
// Usage: node tools/build.mjs [--out ausgabe/organikum-vorschau.pdf]

import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const OUT =
  outIdx >= 0 ? path.resolve(ROOT, args[outIdx + 1]) : path.join(ROOT, 'ausgabe', 'organikum-vorschau.pdf');
const MAIN = path.join(ROOT, 'vorlage', 'buch.typ');

fs.mkdirSync(path.dirname(OUT), { recursive: true });

const t0 = Date.now();

// Strukturformeln und Apparatezeichnungen bei Bedarf neu erzeugen
if (args.includes('--zeichnungen')) {
  const { execFileSync } = await import('node:child_process');
  execFileSync('python3', [path.join(ROOT, 'tools', 'strukturen.py')], { stdio: 'inherit' });
  execFileSync('python3', [path.join(ROOT, 'tools', 'apparate.py')], { stdio: 'inherit' });
}
const compiler = NodeCompiler.create({ workspace: ROOT });
const doc = compiler.compile({ mainFilePath: MAIN, root: ROOT });
if (doc.hasError()) {
  doc.printErrors();
  process.exit(1);
}
const diag = doc.takeDiagnostics();
if (diag && Object.keys(diag).length) console.error('Diagnostics:', diag);

const pdf = compiler.pdf({ mainFilePath: MAIN, root: ROOT });
fs.writeFileSync(OUT, pdf);
const pages = compiler.compile({ mainFilePath: MAIN, root: ROOT }).result?.numOfPages ?? 0;
const kb = (pdf.length / 1024).toFixed(0);
console.log(`${path.relative(ROOT, OUT)}: ${pages} Seiten, ${kb} kB, ${Date.now() - t0} ms`);
