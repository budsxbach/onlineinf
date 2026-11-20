import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import fs from 'node:fs';
const c = NodeCompiler.create({ workspace: process.cwd() });
const d = c.compile({ mainFilePath: 'entwurf/_a.typ', root: process.cwd() });
d.printErrors();
fs.writeFileSync('/tmp/_a.pdf', c.pdf({ mainFilePath: 'entwurf/_a.typ', root: process.cwd() }));
