#!/usr/bin/env python3
"""Synchronisiert PLAN.md §3a mit dem aktuellen Build.
Zahlen: Seiten aus PDF, Wörter aus stats.mjs, Tabellen/Abbildungen aus
PDF-Caption-Zeilen, Vorschriften aus den Quelltexten.
"""
import re, subprocess, sys, pathlib
import pymupdf

ROOT = pathlib.Path(__file__).resolve().parent.parent
PDF = ROOT / 'ausgabe' / 'organikum-vorschau.pdf'
PLAN = ROOT / 'PLAN.md'

doc = pymupdf.open(PDF)
pages = len(doc)

tabs = abbs = 0
for pg in doc:
    if pg.number <= 3:
        continue
    t = pg.get_text()
    tabs += len(re.findall(r'^Tab\. [A-H]\.\d+', t, re.M))
    abbs += len(re.findall(r'^Abb\. [A-H]\.\d+', t, re.M))

out = subprocess.run(['node', str(ROOT / 'tools' / 'stats.mjs')],
                     capture_output=True, text=True, cwd=ROOT).stdout
m = re.search(r'Summe\s+(\d+)', out)
words = int(m.group(1)) if m else 0

vorschr = 0
for f in sorted((ROOT / 'manuskript').glob('*.typ')):
    vorschr += f.read_text().count('#vorschrift(')

# Teilstarts im PDF finden
starts = {}
for pat in [r'^E\.1 ', r'^F\.1 ', r'^G\.1 ', r'^H\.1 ']:
    for pg in doc:
        if pg.number > 3 and re.search(pat, pg.get_text(), re.M):
            starts[pat[0]] = pg.number + 1
            break

s = PLAN.read_text()
n = 0


def rep(pat, repl):
    global s, n
    s2 = re.sub(pat, repl, s, count=1, flags=re.M)
    if s2 != s:
        n += 1
        s = s2


# "Aktuell gesetzt"-Absatz
rep(r'\*\*\d+ Seiten\*\* Buchformat \(168 × 240 mm\), [\d ]+ Wörter,',
    f'**{pages} Seiten** Buchformat (168 × 240 mm), {words:,} Wörter,'.replace(',', ' '))
rep(r'\d+ Abbildungen, \d+ Tabellen, \d+ Vorschriften\.',
    f'{abbs} Abbildungen, {tabs} Tabellen, {vorschr} Vorschriften.')

# Teilzeilen
if all(k in starts for k in 'EFGH'):
    e, f_, g, h = starts['E'], starts['F'], starts['G'], starts['H']
    rep(r'\| D\.1–D\.9, S\. \d+–\d+, \d+ Vorschriften \|',
        f'| D.1–D.9, S. 49–{e-1}, {vorschr} Vorschriften |')
    rep(r'\| E\.1–E\.2, S\. \d+–\d+ \|', f'| E.1–E.2, S. {e}–{f_-1} |')
    rep(r'\| F\.1–F\.2, S\. \d+–\d+ \|', f'| F.1–F.2, S. {f_}–{g-1} |')
    rep(r'\| G\.1–G\.3, S\. \d+–\d+ \|', f'| G.1–G.3, S. {g}–{h-1} |')
    reg = len(re.findall(r'^\[[^\]]+\], \[[^\]]+\],$', (ROOT / 'manuskript' / 'h-anhang.typ').read_text(), re.M))
    rep(r'\| H\.1–H\.4, S\. \d+–\d+, Register \d+ Stichwörter \|',
        f'| H.1–H.4, S. {h}–{pages}, Register {reg} Stichwörter |')

PLAN.write_text(s)
print(f'PLAN: {pages} S., {words} W., {abbs} Abb., {tabs} Tab., {vorschr} Vorschr., {n} Zeilen aktualisiert')
