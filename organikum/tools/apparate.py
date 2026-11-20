#!/usr/bin/env python3
"""Zeichnungssatz für Laborapparaturen (SVG).

Schematische Strichzeichnungen im Stil eines Praktikumsbuchs: einheitliche
Strichstärke, keine Schattierungen außer hellen Flächen für Flüssigkeiten,
Bauteile mit Nummernmarkern (Legende steht in der Bildunterschrift).

Alle Maße in Millimetern.  Ausgabe: bilder/apparate/<name>.svg
"""

import math
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "bilder" / "apparate"

SW = 0.5          # Grundstrich
SW_FEIN = 0.25    # Hilfslinien, Schraffur
GLAS = "#000"
FUELL = "#e6e6e6"
WASSER = "#dedede"


class Z:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.t = []

    # ------------------------------------------------------------ Primitive
    def p(self, d, fill="none", sw=SW, dash=None, cap="round"):
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        self.t.append(
            f'<path d="{d}" fill="{fill}" stroke="{GLAS}" stroke-width="{sw}" '
            f'stroke-linejoin="round" stroke-linecap="{cap}"{extra}/>'
        )

    def l(self, x1, y1, x2, y2, sw=SW, dash=None):
        self.p(f"M {x1:.2f} {y1:.2f} L {x2:.2f} {y2:.2f}", sw=sw, dash=dash)

    def kreis(self, cx, cy, r, fill="none", sw=SW):
        self.t.append(
            f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{fill}" '
            f'stroke="{GLAS}" stroke-width="{sw}"/>'
        )

    def rechteck(self, x, y, w, h, fill="none", sw=SW):
        self.t.append(
            f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" '
            f'fill="{fill}" stroke="{GLAS}" stroke-width="{sw}"/>'
        )

    def schraffur(self, x, y, w, h, step=2.0, sw=SW_FEIN):
        d, yy, i = [], y, 0
        while yy < y + h:
            d.append(f"M {x + (i % 2) * step / 2:.2f} {yy:.2f} l {step * 0.5:.2f} -1.6")
            yy += 1.6
            i += 1
        self.p(" ".join(d), sw=sw)

    def schraffur_vert(self, x, y, w, h, step=1.6, sw=0.18):
        d, xx = [], x
        while xx < x + w:
            d.append(f"M {xx:.2f} {y:.2f} l 1.4 {h:.2f}")
            xx += step
        self.p(" ".join(d), sw=sw)

    def marker(self, cx, cy, n, r=2.4):
        self.kreis(cx, cy, r, fill="#ffffff", sw=0.4)
        self.t.append(
            f'<text x="{cx:.2f}" y="{cy + 1.05:.2f}" font-family="DejaVu Sans, sans-serif" '
            f'font-size="2.9" text-anchor="middle" fill="#000">{n}</text>'
        )

    def text(self, x, y, s, size=3.0, anchor="middle", weight="normal"):
        self.t.append(
            f'<text x="{x:.2f}" y="{y:.2f}" font-family="DejaVu Sans, sans-serif" '
            f'font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" fill="#000">{s}</text>'
        )

    # ------------------------------------------------------------- Rohr
    @staticmethod
    def _offset(pts, d):
        links, rechts = [], []
        for i in range(len(pts)):
            if i == 0:
                vx, vy = pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]
            elif i == len(pts) - 1:
                vx, vy = pts[-1][0] - pts[-2][0], pts[-1][1] - pts[-2][1]
            else:
                v1 = (pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
                v2 = (pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
                n1, n2 = (v1[1], -v1[0]), (v2[1], -v2[0])
                l1 = math.hypot(*n1) or 1
                l2 = math.hypot(*n2) or 1
                vx, vy = n1[0] / l1 + n2[0] / l2, n1[1] / l1 + n2[1] / l2
            ln = math.hypot(vx, vy) or 1
            ux, uy = vx / ln * d, vy / ln * d
            links.append((pts[i][0] + ux, pts[i][1] + uy))
            rechts.append((pts[i][0] - ux, pts[i][1] - uy))
        return links, rechts

    def rohr(self, pts, breite=6.0, sw=SW, enden=True):
        """Glasrohr als Linie mit dicker Kontur und weißem Kern: saubere Stoßstellen."""
        pts = [(float(x), float(y)) for x, y in pts]
        d = "M " + " L ".join(f"{x:.2f} {y:.2f}" for x, y in pts)
        self.p(d, sw=breite, cap="butt")
        self.t.append(
            f'<path d="{d}" fill="none" stroke="#ffffff" stroke-width="{max(breite - 1.1, 0.2):.2f}" '
            f'stroke-linejoin="round" stroke-linecap="butt"/>'
        )
        if enden:
            for (x, y) in (pts[0], pts[-1]):
                self.kreis(x, y, 0.0, fill="none", sw=0.0)

    # --------------------------------------------------------------- Gefäße
    def kolben(self, cx, cy, r, hals=10, hals_w=6.0, fuellung=0.45, mit_hals=True):
        # Kugel mit Flüssigkeit: Kreis füllen, oberen Teil mit weißem Rechteck
        # abdecken (exakt bis zur Oberkante), danach Kontur neu ziehen.
        self.kreis(cx, cy, r, fill=WASSER if fuellung else "#ffffff", sw=0.0)
        if fuellung:
            y = cy + r - 2 * r * fuellung
            self.rechteck(cx - r - 1, cy - r - 1, 2 * r + 2, y - (cy - r - 1), fill="#ffffff", sw=0.0)
            halb = math.sqrt(max(r * r - (y - cy) ** 2, 0.0))
            self.l(cx - halb, y, cx + halb, y, sw=0.45)
        self.kreis(cx, cy, r, fill="none", sw=SW)
        if mit_hals and hals:
            self.rohr([(cx, cy - r + 0.6), (cx, cy - r - hals)], breite=hals_w)

    def erlenmeyer(self, cx, cy, b=15, h=13, hals=6, fuellung=0.35):
        """Erlenmeyerkolben: Kegelstumpf mit Hals."""
        y0, y1 = cy - h / 2, cy + h / 2
        ha = 2.6
        koerper = (f"M {cx - b/2:.2f} {y1:.2f} L {cx - ha:.2f} {y0:.2f} "
                   f"L {cx - ha:.2f} {y0 - hals:.2f} M {cx + ha:.2f} {y0 - hals:.2f} "
                   f"L {cx + ha:.2f} {y0:.2f} L {cx + b/2:.2f} {y1:.2f}")
        self.p(koerper)
        self.l(cx - b / 2, y1, cx + b / 2, y1)
        self.l(cx - ha, y0 - hals, cx + ha, y0 - hals, sw=0.5)
        if fuellung:
            yy = y1 - h * fuellung
            ww = (b / 2 - ha) * (y1 - yy) / h + ha
            self.p(f"M {cx - ww:.2f} {yy:.2f} L {cx + ww:.2f} {yy:.2f} "
                   f"L {cx + b/2:.2f} {y1:.2f} L {cx - b/2:.2f} {y1:.2f} Z", fill=WASSER, sw=0.25)
            self.l(cx - ww, yy, cx + ww, yy, sw=0.35)

    def becherglas(self, cx, cy, b=13, h=11):
        self.p(f"M {cx - b/2:.2f} {cy - h/2:.2f} L {cx - b/2:.2f} {cy + h/2:.2f} "
               f"L {cx + b/2:.2f} {cy + h/2:.2f} L {cx + b/2:.2f} {cy - h/2:.2f}")
        self.l(cx - b / 2 - 1.4, cy - h / 2 - 0.4, cx - b / 2, cy - h / 2, sw=0.4)
        self.l(cx + b / 2, cy - h / 2, cx + b / 2 + 1.4, cy - h / 2 - 0.4, sw=0.4)

    def saugflasche(self, cx, cy, b=13, h=12):
        self.p(f"M {cx - b/2:.2f} {cy - h/2:.2f} L {cx - b/2:.2f} {cy + h/2 - 2:.2f} "
               f"Q {cx - b/2:.2f} {cy + h/2:.2f} {cx - b/2 + 2:.2f} {cy + h/2:.2f} "
               f"L {cx + b/2 - 2:.2f} {cy + h/2:.2f} Q {cx + b/2:.2f} {cy + h/2:.2f} "
               f"{cx + b/2:.2f} {cy + h/2 - 2:.2f} L {cx + b/2:.2f} {cy - h/2:.2f}")
        self.p(f"M {cx - b/2 + 1:.2f} {cy + h/2 - 3.2:.2f} L {cx + b/2 - 1:.2f} {cy + h/2 - 3.2:.2f} "
               f"L {cx + b/2 - 2.2:.2f} {cy + h/2:.2f} L {cx - b/2 + 2.2:.2f} {cy + h/2:.2f} Z",
               fill=WASSER, sw=0.3)
        self.l(cx - b / 2 + 1, cy + h / 2 - 3.2, cx + b / 2 - 1, cy + h / 2 - 3.2, sw=0.35)
        self.rohr([(cx - 2.4, cy - h / 2), (cx - 2.4, cy - h / 2 - 4), (cx + 2.4, cy - h / 2 - 4),
                   (cx + 2.4, cy - h / 2)], breite=1.8)
        self.rohr([(cx + b / 2 - 1.5, cy - 2), (cx + b / 2 + 3, cy - 2)], breite=1.6)

    # --------------------------------------------------------------- Kühler
    def liebig(self, x, y0, laenge=34, d=6.0, mantel=9.6, stutzen=9.0, oben=True, unten=True):
        # Mantel zuerst, Kühlrohr darüber, damit beide Konturen sichtbar bleiben
        if unten:
            self.rohr([(x - mantel / 2, y0 + laenge - 7), (x - mantel / 2 - stutzen, y0 + laenge - 7)],
                      breite=2.8)
        if oben:
            self.rohr([(x + mantel / 2, y0 + 7), (x + mantel / 2 + stutzen, y0 + 7)], breite=2.8)
        self.rohr([(x, y0 + 3.6), (x, y0 + laenge - 3.6)], breite=mantel)
        self.p(f"M {x - mantel/2 + 1.0:.2f} {y0 + 5.0:.2f} L {x + mantel/2 - 1.0:.2f} {y0 + 5.0:.2f} "
               f"L {x + mantel/2 - 1.0:.2f} {y0 + laenge - 5.0:.2f} L {x - mantel/2 + 1.0:.2f} {y0 + laenge - 5.0:.2f} Z",
               fill=WASSER, sw=0.0)
        self.p(f"M {x - mantel/2 + 1.0:.2f} {y0 + 5.0:.2f} L {x + mantel/2 - 1.0:.2f} {y0 + 5.0:.2f} "
               f"L {x + mantel/2 - 1.0:.2f} {y0 + laenge - 5.0:.2f} L {x - mantel/2 + 1.0:.2f} {y0 + laenge - 5.0:.2f} Z",
               sw=0.3)
        self.rohr([(x, y0), (x, y0 + laenge)], breite=d)

    def kugeln(self, x, y0, laenge=34, d=5.6, anzahl=5):
        self.rohr([(x, y0), (x, y0 + laenge)], breite=d, enden=False)
        step = (laenge - 5) / anzahl
        for i in range(anzahl):
            self.kreis(x, y0 + 2.5 + step * (i + 0.5), step * 0.62, fill="#ffffff", sw=0.45)
        self.rohr([(x, y0), (x, y0 + 1.2)], breite=d)
        self.rohr([(x, y0 + laenge - 1.2), (x, y0 + laenge)], breite=d)

    def schlange(self, x, y0, laenge=34, d=6.4):
        self.rohr([(x, y0), (x, y0 + laenge)], breite=d, enden=False)
        self.rohr([(x, y0 + 2.5), (x, y0 + laenge - 2.5)], breite=11.0)
        n = 11
        pts = []
        for i in range(n + 1):
            yy = y0 + 4.5 + (laenge - 9) * i / n
            pts.append((x + (3.6 if i % 2 == 0 else -3.6), yy))
        self.p("M " + " L ".join(f"{a:.2f} {b:.2f}" for a, b in pts), sw=0.35)

    def intensiv(self, x, y0, laenge=32, d=5.6):
        self.rohr([(x, y0), (x, y0 + laenge)], breite=d, enden=False)
        self.rohr([(x, y0 + 2.5), (x, y0 + laenge - 2.5)], breite=9.6)
        for i in range(8):
            yy = y0 + 5 + i * (laenge - 10) / 7
            self.l(x - 4.2, yy, x + 4.2, yy, sw=0.28)

    # ------------------------------------------------------------- Zubehör
    def tropftrichter(self, x, y0, laenge=20, d=7.4):
        self.p(f"M {x:.2f} {y0:.2f} C {x - d:.2f} {y0 + 5:.2f} {x - d:.2f} {y0 + 12:.2f} "
               f"{x - 1.5:.2f} {y0 + 15:.2f} L {x - 1.5:.2f} {y0 + laenge:.2f} "
               f"M {x + 1.5:.2f} {y0 + laenge:.2f} L {x + 1.5:.2f} {y0 + 15:.2f} "
               f"C {x + d:.2f} {y0 + 12:.2f} {x + d:.2f} {y0 + 5:.2f} {x:.2f} {y0:.2f}")
        self.l(x - d * 0.62, y0 + 2.6, x + d * 0.62, y0 + 2.6, sw=0.4)   # Schliff-Andeutung
        self.p(f"M {x - 2.6:.2f} {y0 + laenge:.2f} L {x + 2.6:.2f} {y0 + laenge:.2f} "
               f"L {x + 2.6:.2f} {y0 + laenge + 1.2:.2f} L {x - 2.6:.2f} {y0 + laenge + 1.2:.2f} Z",
               sw=0.45)
        self.l(x - 3.6, y0 + laenge + 2.6, x + 3.6, y0 + laenge + 2.6, sw=0.8)  # Hahn
        self.kreis(x, y0 + laenge + 2.6, 1.3, fill="#ffffff", sw=0.4)
        # Füllstand
        yy = y0 + 8.5
        hw = d * 0.62
        self.p(f"M {x - hw:.2f} {yy:.2f} Q {x:.2f} {yy + 1.6:.2f} {x + hw:.2f} {yy:.2f} "
               f"L {x + 1.4:.2f} {y0 + 14.2:.2f} L {x - 1.4:.2f} {y0 + 14.2:.2f} Z",
               fill=WASSER, sw=0.25)

    def thermometer(self, x, y0, laenge=22, d=3.2):
        self.rohr([(x, y0), (x, y0 + laenge)], breite=d)
        self.kreis(x, y0 + laenge, d * 0.62, fill="#ffffff", sw=0.4)
        self.l(x, y0 + 3, x, y0 + laenge - 1.5, sw=0.25)

    def bad(self, cx, cy, b=32, h=11, wellen=True):
        y0, y1 = cy - h / 2, cy + h / 2
        self.p(f"M {cx - b/2:.2f} {y0:.2f} L {cx - b/2 + 3.4:.2f} {y1:.2f} "
               f"L {cx + b/2 - 3.4:.2f} {y1:.2f} L {cx + b/2:.2f} {y0:.2f}", sw=0.45)
        self.l(cx - b / 2 + 1.0, y0 + 3.2, cx + b / 2 - 1.0, y0 + 3.2, sw=0.3)
        if wellen:
            x = cx - b / 2 + 7
            while x < cx + b / 2 - 7:
                self.p(f"M {x:.2f} {y1 - 2.0:.2f} q 1.5 -1.6 3.0 0 q 1.5 1.6 3.0 0", sw=0.25)
                x += 6.0

    def ruehrer(self, x, y_top, y_r, b=4.0):
        self.rohr([(x, y_top), (x, y_r - 1.6)], breite=b, sw=0.4)
        self.l(x - 4.6, y_r, x + 4.6, y_r, sw=1.0)
        self.l(x - 4.6, y_r - 1.5, x - 4.6, y_r + 1.5, sw=0.45)
        self.l(x + 4.6, y_r - 1.5, x + 4.6, y_r + 1.5, sw=0.45)

    def stopfen(self, x, y, b=7.0):

        self.p(f"M {x - b/2:.2f} {y:.2f} L {x - b/2 + 0.6:.2f} {y + 2.8:.2f} "
               f"L {x + b/2 - 0.6:.2f} {y + 2.8:.2f} L {x + b/2:.2f} {y:.2f} Z", fill="#ffffff")

    def klammer(self, x, y):
        self.l(x - 5, y, x + 5, y + 0.0, sw=1.4)

    # ------------------------------------------------------------- Ausgabe
    def svg(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}mm" height="{self.h}mm" '
                f'viewBox="0 0 {self.w} {self.h}">\n' + "\n".join(self.t) + "\n</svg>\n")

    def schreiben(self, name):
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / f"{name}.svg").write_text(self.svg(), encoding="utf-8")
        print(f"bilder/apparate/{name}.svg")


# ============================================================================
#  Apparaturen
#  Zeichenreihenfolge: erst alles oberhalb des Kolbens, zuletzt Bad und Kolben —
#  so verdecken die weißen Füllflächen die Stoßstellen der Rohre.
# ============================================================================

def rueckfluss():
    z = Z(40, 58)
    z.liebig(20, 6, laenge=27, d=5.4)
    z.bad(20, 52, 30, 10)
    z.kolben(20, 44, 8.5, hals=7, hals_w=5.4, fuellung=0.5)
    z.marker(4.5, 20, 1)
    z.marker(4.5, 44, 2)
    z.marker(33, 55.5, 3)
    z.schreiben("rueckfluss")


def rueckfluss_mit_trockenrohr():
    z = Z(44, 54)
    z.rohr([(18, 3.4), (18, 0.8)], breite=3.0)
    z.rohr([(18, 1.0), (26, 1.0), (26, 6)], breite=3.0)
    z.rechteck(23.6, 6, 4.8, 9)
    z.schraffur_vert(24.0, 6.6, 4.0, 7.8)
    z.liebig(18, 5, laenge=28, d=4.8, mantel=8.2)
    z.bad(18, 48, 26, 9)
    z.kolben(18, 41, 7.6, hals=7, hals_w=4.8, fuellung=0.5)
    z.marker(31, 10, 1)
    z.marker(31, 34, 2)
    z.schreiben("rueckfluss-trockenrohr")


def destillation():
    z = Z(78, 56)
    # Destillationskopf: Thermometer im Kopf, Seitenabgang zum Kühler
    z.thermometer(18, 20, laenge=9.5, d=2.6)
    z.stopfen(18, 18.0, 5.4)
    z.p("M 15.2 36.0 L 15.2 31.0 L 20.8 31.0 L 20.8 36.0", sw=0.5)
    z.rohr([(20.8, 33.2), (29, 32.4), (34, 26.0)], breite=3.8)
    z.rohr([(34, 26.0), (66, 26.0)], breite=4.2, enden=False)
    z.rohr([(35, 26.0), (64, 26.0)], breite=8.6)
    z.p("M 36.3 22.4 L 62.7 22.4 L 62.7 29.6 L 36.3 29.6 Z", fill=WASSER, sw=0.25)
    z.rohr([(35, 31.8), (35, 35.6)], breite=2.2)
    z.rohr([(64, 20.4), (64, 16.6)], breite=2.2)
    z.rohr([(66, 26.0), (69, 26.0), (69, 30)], breite=2.8)
    z.erlenmeyer(69, 35, 12, 8, 3, fuellung=0.4)
    z.bad(18, 50, 26, 9)
    z.kolben(18, 43, 8, hals=8, hals_w=5.0, fuellung=0.5)
    z.marker(6, 12, 1)
    z.marker(72, 12, 2)
    z.marker(74, 40, 3)
    z.marker(4, 50, 4)
    z.schreiben("destillation")


def vakuumdestillation():
    z = Z(72, 58)
    z.thermometer(16, 13, laenge=12, d=2.8)
    z.stopfen(16, 11.4, 5.0)
    z.p("M 13.2 30 L 13.2 24 L 18.8 24 L 18.8 30", sw=0.5)
    z.rohr([(18.8, 26), (28, 27.6), (30, 29.4)], breite=3.4)
    z.rohr([(30, 29.4), (44, 29.4)], breite=3.4, enden=False)
    z.rohr([(31, 29.4), (43, 29.4)], breite=7.6)
    z.p("M 32.4 26.2 L 41.6 26.2 L 41.6 32.6 L 32.4 32.6 Z", fill=WASSER, sw=0.25)
    z.rohr([(31, 34.2), (31, 37.4)], breite=2.0)
    z.rohr([(44, 29.4), (47, 29.4), (47, 34.4)], breite=2.6)
    z.saugflasche(47, 40, 12, 10)
    z.rohr([(53.6, 41), (57, 41)], breite=1.8)
    z.p("M 57 38.6 L 61 41 L 57 43.4 Z", fill="#ffffff", sw=0.4)
    z.text(64, 42, "Pumpe", size=2.6, anchor="start")
    z.bad(16, 52, 24, 9)
    z.kolben(16, 44, 8, hals=7, hals_w=5.0, fuellung=0.5)
    z.marker(6, 40, 1)
    z.marker(66, 22, 2)
    z.schreiben("vakuumdestillation")


def wasserdampf():
    z = Z(88, 58)
    # Dampfweg
    z.rohr([(15, 30), (34, 30)], breite=4.0)
    z.rohr([(34, 30), (34, 27.5), (40, 27.5)], breite=4.0)
    z.rohr([(40, 26.5), (40, 22), (52, 18)], breite=4.4)
    z.rohr([(52, 18), (78, 18)], breite=4.2, enden=False)
    z.rohr([(53, 18), (76, 18)], breite=8.2)
    z.p("M 54.3 14.6 L 74.7 14.6 L 74.7 21.4 L 54.3 21.4 Z", fill=WASSER, sw=0.25)
    z.rohr([(53, 23.4), (53, 27)], breite=2.2)
    z.rohr([(76, 12.6), (76, 9)], breite=2.2)
    z.rohr([(78, 18), (81, 18), (81, 24)], breite=2.8)
    z.erlenmeyer(81, 29, 11, 7, 3, fuellung=0.45)
    # Bäder und Kolben zuletzt
    z.bad(15, 50, 22, 9)
    z.kolben(15, 43.4, 7, hals=9, hals_w=4.6, fuellung=0.5)
    z.bad(40, 50, 22, 9)
    z.kolben(40, 43.4, 7, hals=8, hals_w=4.6, fuellung=0.45)
    z.marker(4, 47, 1)
    z.marker(47, 47, 2)
    z.marker(84, 7, 3)
    z.marker(84, 30, 4)
    z.schreiben("wasserdampfdestillation")


def kuehlerarten():
    z = Z(112, 44)
    xs = [14, 40, 66, 94]
    z.liebig(xs[0], 6, laenge=30, d=5.0, mantel=8.6, stutzen=9.0)
    z.kugeln(xs[1], 6, laenge=30, d=5.0, anzahl=5)
    z.schlange(xs[2], 6, laenge=30, d=5.6)
    z.intensiv(xs[3], 6, laenge=30, d=5.0)
    for x, lab in zip(xs, "abcd"):
        z.text(x, 41.5, lab, size=3.6)
    z.schreiben("kuehlerarten")


def soxhlet():
    z = Z(46, 62)
    z.rohr([(17, 24), (17, 18)], breite=4.4)
    z.liebig(17, 4, laenge=14, d=4.4, mantel=8.0, stutzen=7.0)
    z.rechteck(11.5, 24, 11, 12)
    z.l(11.5, 30, 22.5, 30, sw=0.3)
    z.p("M 12.9 30 L 12.9 32.4 L 21.1 32.4 L 21.1 30", fill="#efefef", sw=0.3)
    z.rohr([(20.4, 29), (20.4, 25.6), (19.0, 25.6), (19.0, 29)], breite=1.8)
    z.bad(17, 55, 24, 9)
    z.kolben(17, 49, 7, hals=8, hals_w=4.4, fuellung=0.5)
    z.marker(27, 30, 1)
    z.marker(3, 40, 2)
    z.schreiben("soxhlet")


def perforator():
    z = Z(42, 52)
    z.liebig(14, 2, laenge=9, d=4.0, mantel=7.4, stutzen=6.0, unten=False)
    z.rohr([(14, 11), (14, 18)], breite=4.2, enden=False)
    z.rechteck(9.4, 18, 9.2, 13)
    z.p("M 10.6 24.2 L 17.4 24.2 L 17.4 27.4 L 10.6 27.4 Z", fill="#efefef", sw=0.25)
    z.rohr([(18.6, 20.4), (24, 17), (24, 12), (14.6, 12)], breite=2.4)
    z.bad(14, 46, 20, 8)
    z.kolben(14, 40, 6.4, hals=7, hals_w=4.2, fuellung=0.5)
    z.marker(30, 22, 1)
    z.marker(30, 40, 2)
    z.schreiben("perforator")


def reaktionsapparatur():
    z = Z(62, 64)
    # Hälse zuerst (sie verschwinden unten im Kolben)
    z.rohr([(24.5, 41.6), (17, 32.4)], breite=4.6, enden=False)
    z.rohr([(37.5, 41.6), (45, 32.4)], breite=4.6, enden=False)
    z.rohr([(31, 38.0), (31, 33.0)], breite=5.6, enden=False)
    z.liebig(31, 8, laenge=24, d=5.6, mantel=9.0, stutzen=8.0)
    z.thermometer(45, 15, laenge=16.5, d=2.9)
    z.tropftrichter(17, 10, laenge=12, d=6.6)
    z.rohr([(17, 23.4), (17, 32.4)], breite=2.8)
    z.bad(31, 57, 38, 10)
    z.kolben(31, 47, 9.5, hals=0, hals_w=0, fuellung=0.5, mit_hals=False)
    z.ruehrer(31, 3, 49)
    z.marker(6, 20, 1)
    z.marker(56, 20, 2)
    z.marker(56, 51, 3)
    z.schreiben("reaktionsapparatur")


def scheidetrichter():
    z = Z(52, 52)
    z.p("M 20 6 L 20 13 C 10.5 17 10.5 29 19 34 C 22 36 26 36 29 34 "
        "C 37.5 29 37.5 17 28 13 L 28 6 Z", fill="#ffffff")
    z.l(20, 6, 28, 6, sw=0.5)
    # Füllung: unterer Teil + Grenzfläche
    z.p("M 12.9 25 L 35.1 25 L 29.6 33.4 L 18.4 33.4 Z", fill=WASSER, sw=0.0)
    z.l(12.8, 25, 35.2, 25, sw=0.45)
    z.rohr([(24, 34.6), (24, 39)], breite=3.2)
    z.kreis(24, 38, 1.4, fill="#ffffff", sw=0.4)
    z.l(20, 40.4, 28, 40.4, sw=0.9)
    z.rohr([(24, 41), (24, 44.4)], breite=2.6)
    z.becherglas(24, 48, 16, 6)
    z.marker(40, 18, 1)
    z.marker(40, 28, 2)
    z.marker(40, 38, 3)
    z.schreiben("scheidetrichter")


def chromatographiesaeule():
    z = Z(48, 58)
    z.rohr([(16, 14), (16, 44)], breite=7.0)
    z.rechteck(13.6, 19, 4.8, 24.4)
    for i in range(11):
        yy = 20.2 + i * 2.15
        z.l(13.9, yy, 18.1, yy, sw=0.18)
    z.p("M 13.6 19 L 18.4 19 L 18.4 21.0 L 13.6 21.0 Z", fill=WASSER, sw=0.3)
    z.rohr([(16, 44), (16, 47)], breite=2.6)
    z.kreis(16, 45.6, 1.3, fill="#ffffff", sw=0.35)
    z.erlenmeyer(16, 52, 12, 6.4, 2.6, fuellung=0.4)
    z.marker(27, 23, 1)
    z.marker(27, 40, 2)
    z.marker(27, 52, 3)
    z.schreiben("chromatographiesaeule")


def dc_platte():
    z = Z(58, 36)
    z.p("M 8 26 L 26 26 L 32 6 L 14 6 Z", fill="#fdfdfd")
    z.l(9.6, 24.4, 30.4, 24.4, sw=0.45)
    z.l(13.2, 8.6, 30.0, 8.6, sw=0.4, dash="1.2 1.0")
    for x in (12.4, 16.4, 20.4, 24.4):
        z.l(x, 24.4, x + 2.1, 9.0, sw=0.2)
        for k, t in enumerate((0.30, 0.62, 0.86)):
            yy = 24.4 - t * 15.4
            xx = x + (24.4 - yy) * 0.135
            z.kreis(xx, yy, 0.85 - k * 0.2, fill="#bfbfbf", sw=0.15)
    z.marker(37, 12, 1)
    z.marker(37, 22, 2)
    z.marker(37, 31, 3)
    z.schreiben("dc-platte")


def umkristallisieren():
    z = Z(62, 48)
    z.p("M 36 8 L 50 8 L 43 18 Z")
    z.p("M 37.2 9.4 L 48.8 9.4 L 43 17.2 Z", fill="#f2f2f2", sw=0.25)
    z.rohr([(43, 18), (43, 24)], breite=2.8)
    z.p("M 36 12 L 34 20", sw=0.3, dash="1.0 0.9")
    z.p("M 50 12 L 52 20", sw=0.3, dash="1.0 0.9")
    z.erlenmeyer(43, 34, 16, 11, 4, fuellung=0.35)
    z.erlenmeyer(15, 30, 18, 13, 7, fuellung=0.4)
    z.marker(8, 36, 1)
    z.marker(55, 6, 2)
    z.marker(55, 38, 3)
    z.schreiben("umkristallisieren")


def gaswaschflasche():
    z = Z(66, 44)
    z.rohr([(21.4, 8), (21.4, 16)], breite=2.0)
    z.rohr([(40, 8), (40, 24)], breite=5.4)
    z.rechteck(37.4, 10.6, 5.2, 11.2)
    z.schraffur_vert(37.8, 11.2, 4.4, 10.0)
    z.rohr([(40, 24), (40, 26), (26, 28)], breite=2.0)
    z.p("M 10 8 L 10 36 L 26 36 L 26 8 Z", fill="#ffffff")
    z.rohr([(14.6, 8), (14.6, 31)], breite=2.0)
    z.p("M 11.2 26 L 24.8 26 L 24.8 34.8 L 11.2 34.8 Z", fill=WASSER, sw=0.0)
    z.p("M 11.2 26 L 24.8 26 L 24.8 34.8 L 11.2 34.8 Z", sw=0.25)
    z.l(11.2, 26, 24.8, 26, sw=0.4)
    z.stopfen(18, 5.2, 9.0)
    z.marker(5, 20, 1)
    z.marker(48, 14, 2)
    z.schreiben("gaswaschflasche")


def main():
    for f in (
        rueckfluss,
        rueckfluss_mit_trockenrohr,
        destillation,
        vakuumdestillation,
        wasserdampf,
        kuehlerarten,
        soxhlet,
        perforator,
        reaktionsapparatur,
        scheidetrichter,
        chromatographiesaeule,
        dc_platte,
        umkristallisieren,
        gaswaschflasche,
    ):
        f()


if __name__ == "__main__":
    main()
