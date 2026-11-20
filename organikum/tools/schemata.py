#!/usr/bin/env python3
"""Schemazeichnungen für Teil C (Energieprofile, Stereochemie, Orbitale).

Ausgabe: bilder/schemata/<name>.svg, Maße in Millimetern.
"""

import math
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "bilder" / "schemata"
SW = 0.5


class S:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.t = []

    def p(self, d, fill="none", sw=SW, dash=None):
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        self.t.append(f'<path d="{d}" fill="{fill}" stroke="#000" stroke-width="{sw}" '
                      f'stroke-linejoin="round" stroke-linecap="round"{extra}/>')

    def l(self, x1, y1, x2, y2, sw=SW, dash=None):
        self.p(f"M {x1:.2f} {y1:.2f} L {x2:.2f} {y2:.2f}", sw=sw, dash=dash)

    def kreis(self, cx, cy, r, fill="none", sw=SW):
        self.t.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{fill}" '
                      f'stroke="#000" stroke-width="{sw}"/>')

    def text(self, x, y, s, size=2.9, anchor="middle", style="", weight="normal"):
        # `&` und `<` maskieren, damit der SVG-Parser nicht stolpert
        sicheres = s.replace("&", "&amp;").replace("<", "&lt;")
        self.t.append(
            f'<text x="{x:.2f}" y="{y:.2f}" font-family="DejaVu Sans, sans-serif" '
            f'font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" '
            f'fill="#000">{sicheres}</text>'
        )

    def pfeil(self, x1, y1, x2, y2, sw=0.45):
        a = math.atan2(y2 - y1, x2 - x1)
        k = 1.6
        xa, ya = x2 - k * math.cos(a - 0.4), y2 - k * math.sin(a - 0.4)
        xb, yb = x2 - k * math.cos(a + 0.4), y2 - k * math.sin(a + 0.4)
        self.l(x1, y1, x2, y2, sw=sw)
        self.p(f"M {xa:.2f} {ya:.2f} L {x2:.2f} {y2:.2f} L {xb:.2f} {yb:.2f}", sw=sw)

    def svg(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}mm" height="{self.h}mm" '
                f'viewBox="0 0 {self.w} {self.h}">\n' + "\n".join(self.t) + "\n</svg>\n")

    def schreiben(self, name):
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / f"{name}.svg").write_text(self.svg(), encoding="utf-8")
        print(f"bilder/schemata/{name}.svg")


def energieprofil():
    """Zwei Reaktionswege: hohe Barriere (A) und niedrige Barriere (B)."""
    z = S(96, 58)
    z.pfeil(14, 46, 82, 46)
    z.pfeil(14, 46, 14, 9)
    z.text(48, 51.4, "Reaktionskoordinate", size=2.9)
    z.text(10.4, 9.6, "E", size=3.0, anchor="end")

    z.p("M 14 36 L 27 36 Q 33 36 37 17 Q 41 36 47 36 L 80 36", sw=0.6)
    z.p("M 14 36 L 27 36 Q 31.5 36 34 27 Q 36.5 36 41 36 L 80 36", sw=0.6, dash="1.7 1.2")
    z.l(37, 17, 37, 36, sw=0.22, dash="0.9 0.8")
    z.l(34, 27, 34, 36, sw=0.22, dash="0.9 0.8")

    z.text(37, 13.0, "Übergangszustand A", size=2.7)
    z.text(23, 32.6, "Edukte", size=2.7)
    z.text(64, 32.6, "Produkte", size=2.7)
    z.text(39.4, 22.6, "EA", size=2.6, anchor="start")
    z.text(30.4, 24.4, "B", size=2.7, anchor="end")
    z.l(52, 20.6, 58, 20.6, sw=0.55)
    z.text(59.4, 21.6, "Weg A: langsam", size=2.4, anchor="start")
    z.l(52, 24.2, 58, 24.2, sw=0.55, dash="1.7 1.2")
    z.text(59.4, 25.2, "Weg B: schnell", size=2.4, anchor="start")
    z.schreiben("energieprofil")


def energieprofil_sn1():
    """Zweistufige Reaktion: Carbeniumion als Zwischenstufe."""
    z = S(84, 54)
    z.pfeil(12, 44, 78, 44)
    z.pfeil(12, 44, 12, 9)
    z.text(10.4, 9.6, "E", size=3.0, anchor="end")
    z.text(45, 49.6, "Reaktionskoordinate", size=2.9)
    z.p("M 12 35 L 24 35 Q 28 35 30.5 15 Q 33 35 36 35 L 41 35 Q 44.5 35 46.5 26 "
        "Q 48.5 35 51 35 L 78 35", sw=0.6)
    z.l(30.5, 15, 30.5, 35, sw=0.22, dash="0.9 0.8")
    z.text(30.5, 11.4, "Carbeniumion", size=2.7)
    z.text(47, 21.8, "Nu-Angriff", size=2.5)
    z.text(18, 31.6, "R–X", size=2.8)
    z.text(64, 31.6, "Produkt", size=2.8)
    z.text(12.4, 27.0, "", size=2)
    z.l(12, 35, 78, 35, sw=0.18, dash="0.8 0.8")
    z.schreiben("energieprofil-sn1")


def sn2_stereo():
    """Walden-Umkehr: Rückseitenangriff führt zur Konfigurationsumkehr."""
    z = S(112, 48)

    def zentrum(cx, links, rechts, unten):
        z.kreis(cx, 24, 6.6)
        z.text(cx, 25.4, "C", size=3.4, weight="bold")
        z.l(cx, 17.4, cx, 12.0)
        z.l(cx, 30.6, cx, 36.0)
        z.text(cx, 39.4, unten, size=2.9)
        z.l(cx - 6.6, 24, cx - 12.4, 24)
        z.text(cx - 13.4, 22.0, links, size=2.7, anchor="end")
        z.l(cx + 6.6, 24, cx + 12.4, 24)
        z.text(cx + 13.4, 22.0, rechts, size=2.7, anchor="start")

    zentrum(22, "CH₃", "C₂H₅", "Cl")
    z.pfeil(22, 11.4, 22, 5.4)
    z.text(22, 4.4, "Nu⁻", size=2.9)

    z.pfeil(44, 24, 64, 24, sw=0.7)
    z.text(54, 20.4, "Sₙ2", size=2.7)

    zentrum(88, "C₂H₅", "CH₃", "Cl")
    z.pfeil(88, 11.4, 88, 5.4)
    z.text(88, 4.4, "Nu⁻", size=2.9)
    z.text(56, 45.0, "Rückseitenangriff — Konfiguration umgekehrt", size=2.7)
    z.schreiben("sn2-stereo")


def stereochemie_r_s():
    """R- und S-Konfiguration am Beispiel 2-Butanol (schematisch)."""
    z = S(112, 48)
    for cx, cfg, links, rechts in ((26, "R", "CH₃", "C₂H₅"), (80, "S", "C₂H₅", "CH₃")):
        z.kreis(cx, 24, 8.2)
        z.text(cx, 25.4, "C", size=3.6, weight="bold")
        # OH nach vorn (Keil), H nach hinten (Strich)
        z.p(f"M {cx-1.5:.2f} 15.8 L {cx+1.5:.2f} 15.8 L {cx:.2f} 8.6 Z", fill="#000")
        z.text(cx, 6.6, "OH", size=2.8)
        z.p(f"M {cx-1.2:.2f} 24.8 L {cx-5.6:.2f} 31.6 L {cx+1.2:.2f} 24.8 Z", fill="#000")
        z.text(cx - 7.0, 34.0, "H", size=2.8, anchor="end")
        z.l(cx - 8.2, 24.4, cx - 13.4, 24.4)
        z.text(cx - 14.6, 22.4, links, size=2.8, anchor="end")
        z.l(cx + 8.2, 24.4, cx + 13.4, 24.4)
        z.text(cx + 14.6, 22.4, rechts, size=2.8, anchor="start")
        z.text(cx, 45.0, f"({cfg})-2-Butanol", size=2.9)
    z.schreiben("stereo-r-s")


def hammett():
    """Hammett-Gerade: log k/k0 gegen σ mit ρ < 0."""
    z = S(70, 52)
    z.pfeil(20, 40, 62, 40)
    z.pfeil(28, 46, 28, 8)
    z.text(42, 44.6, "σ", size=2.9)
    z.text(28.6, 7.4, "log k/k₀", size=2.7, anchor="start")
    # Gerade: von (32,14) nach (56,36)
    x0, y0, x1, y1 = 31, 15, 56, 34
    z.l(x0, y0, x1, y1, sw=0.6)
    punkte = [(34.5, 17.6, "NO₂", "start"), (41, 22.4, "Cl", "start"),
              (46.5, 26.6, "H", "start"), (52.5, 31.0, "OCH₃", "end")]
    for x, y, lab, seite in punkte:
        z.kreis(x, y, 0.7, fill="#000")
        z.text(x + 2.4, y - 1.4, lab, size=2.4, anchor="start")
    z.text(52, 10.4, "ρ < 0", size=2.8, anchor="start")
    z.schreiben("hammett")


def orbital_overlap():
    """σ-Bindung und π-System im Vergleich."""
    z = S(78, 42)
    # σ-Bindung: zwei überlappende s-Orbitale
    z.p("M 8 20 q 5.5 -7.5 11 0 q -5.5 7.5 -11 0 Z", fill="#ededed")
    z.p("M 19 20 q 5.5 -7.5 11 0 q -5.5 7.5 -11 0 Z", fill="#ffffff")
    z.text(19, 7.0, "σ-Bindung", size=2.7)
    z.text(19, 33.2, "Überlappung auf der Achse", size=2.2)
    # π-System: drei p-Orbitale über und unter der Achse
    z.l(44, 20, 70, 20, sw=0.35, dash="1.0 0.9")
    for i, x in enumerate((48, 56, 64)):
        z.p(f"M {x-3.2:.2f} 19.4 q 3.2 -6.4 6.4 0 q -3.2 6.4 -6.4 0 Z")
        z.p(f"M {x-3.2:.2f} 20.6 q 3.2 6.4 6.4 0 q -3.2 -6.4 -6.4 0 Z")
        z.kreis(x, 20, 0.8, fill="#000")
    z.text(56, 7.0, "π-System (p-Orbitale)", size=2.7)
    z.text(56, 33.2, "ober- und unterhalb der Achse", size=2.2)

    z.schreiben("orbital-overlap")


def retrosynthese():
    z = S(108, 48)
    z.text(54, 6.4, "Retrosynthese: Zerlegung in verfügbare Bausteine", size=2.9)
    z.text(54, 15.0, "Zielmolekül", size=2.8)
    z.pfeil(54, 17.0, 54, 24.0)
    z.text(56.4, 21.0, "Dissoziation", size=2.4, anchor="start")
    z.l(54, 24.0, 30, 30.0, sw=0.45)
    z.l(54, 24.0, 78, 30.0, sw=0.45)
    z.text(30, 33.4, "Baustein 1", size=2.7)
    z.text(78, 33.4, "Baustein 2", size=2.7)
    z.pfeil(30, 35.4, 30, 41.0)
    z.pfeil(78, 35.4, 78, 41.0)
    z.text(30, 45.0, "Edukt A", size=2.7)
    z.text(78, 45.0, "Edukt B", size=2.7)
    z.schreiben("retrosynthese")


def walden_zyklus():
    """Vierfach koordinierter Übergangszustand mit Nu⁻ gegenüber X⁻."""
    z = S(60, 60)
    cx, cy = 30, 30
    # trigonale Ebene
    z.l(cx - 14, cy + 8, cx + 14, cy - 8, sw=0.4, dash="1.2 1.0")
    z.kreis(cx, cy, 4.6, fill="#f0f0f0")
    z.text(cx, cy + 1.3, "C", size=3.4, weight="bold")
    z.kreis(cx - 5, cy + 2.9, 2.0, fill="#fff")
    z.kreis(cx + 5, cy - 2.9, 2.0, fill="#fff")
    z.text(cx - 5, cy + 3.9, "R", size=2.3)
    z.text(cx + 5, cy - 1.9, "R", size=2.3)
    # axial: Nu und X, gestrichelt (partielle Bindungen)
    z.l(cx, cy - 4.6, cx, cy - 15.0, sw=0.45, dash="1.1 0.9")
    z.l(cx, cy + 4.6, cx, cy + 15.0, sw=0.45, dash="1.1 0.9")
    z.text(cx - 2.0, cy - 16.6, "Nu", size=2.9, anchor="end")
    z.text(cx + 2.0, cy + 18.0, "X", size=2.9, anchor="start")
    z.text(cx, cy + 22.6, "Übergangszustand: fünfach koordiniert, planar", size=2.5)
    z.text(cx, 8.0, "δ−", size=2.5, anchor="start")
    z.text(cx + 2.0, cy + 13.0, "δ−", size=2.5, anchor="start")
    z.schreiben("walden-zyklus")


def main():
    for f in (energieprofil, energieprofil_sn1, sn2_stereo, stereochemie_r_s,
              hammett, orbital_overlap, retrosynthese, walden_zyklus):
        f()


if __name__ == "__main__":
    main()
