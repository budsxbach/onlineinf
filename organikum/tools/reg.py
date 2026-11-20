import pathlib, re
p = pathlib.Path('manuskript/h-anhang.typ'); s = p.read_text()
start = s.index("== Sachregister")
sec = s[start:]
pairs = re.findall(r'\[([^\]]+)\], \[([A-H]\.\d+(?:\.\d+)?)\]', sec)
d = {}
for w, r in pairs:
    d.setdefault(w, r)
items = sorted(d.items(), key=lambda t: t[0].lower().replace("ä","a").replace("ö","o").replace("ü","u"))
n=len(items); half=(n+1)//2
def block(part,title):
    body=[]
    for i in range(0,len(part),2):
        a=part[i]; b=part[i+1] if i+1<len(part) else ("","")
        body.append(f"    [{a[0]}], [{a[1]}], [{b[0]}], [{b[1]}],")
    return f"""#figure(
  table(
    columns: (1fr, auto, 1fr, auto),
    inset: (x: 5pt, y: 2.6pt),
    align: (left, right, left, right),
    stroke: (x, y) => if y == 0 {{ (bottom: 0.8pt) }} else {{ (top: 0.25pt + luma(175)) }},
    table.header([*Stichwort*], [*Kap.*], [*Stichwort*], [*Kap.*]),
{chr(10).join(body)}
  ),
  caption: [{title}],
)
"""
neu = """== Sachregister

Die Zahlen bezeichnen das Kapitel, in dem das Stichwort ausführlich behandelt
wird. Verwandte Stichwörter stehen jeweils im Text des angegebenen Kapitels.

""" + block(items[:half], "Sachregister, Teil 1: A–K.") + "\n#pagebreak(weak: true)\n\n" + block(items[half:], "Sachregister, Teil 2: L–Z.")
p.write_text(s[:start] + neu)
print(n)
