import re, pathlib, pymupdf
d = pymupdf.open('ausgabe/organikum-vorschau.pdf')
# Registerseiten ausschließen: ihre Tabellenzellen erzeugen Zeilen, die wie
# Kapitelüberschriften aussehen (Selbstreferenz - z. B. ein falscher Verweis
# "C.8.3" würde sonst als existierend durchgehen).
seiten = [i for i in range(4, d.page_count)
          if 'Sachregister, Teil' not in d[i].get_text()]
txt = '\n'.join(d[i].get_text() for i in seiten)
heads = set(m.group(1) for m in re.finditer(r'^([A-H]\.\d+(?:\.\d+)?)\s+\S', txt, re.M))
# Vorschriften (VORSCHRIFT D.x.y) sind ebenfalls legitime Registerziele
heads |= set(m.group(1) for m in re.finditer(r'^VORSCHRIFT (D\.\d+\.\d+)\s+\S', txt, re.M))
reg = pathlib.Path('manuskript/h-anhang.typ').read_text()
pairs = re.findall(r'\[([^\]]+)\], \[([A-H]\.\d+(?:\.\d+)?)\]', reg)
bad = [(w,r) for w,r in pairs if r not in heads]
print(len(pairs), "Einträge;", len(bad), "fehlerhaft")
for w,r in bad: print("  ", w, "->", r)
