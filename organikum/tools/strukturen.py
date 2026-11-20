#!/usr/bin/env python3
"""Render skeletal structure formulas (SVG) from SMILES with RDKit.

Usage: python3 tools/strukturen.py
Reads:  data/strukturen.json  ->  {"name": {"smiles": "...", "w": 220, "label": "..."} }
Writes: bilder/strukturen/<name>.svg
"""

import json
import pathlib

from rdkit import Chem
from rdkit.Chem import rdDepictor
from rdkit.Chem.Draw import rdMolDraw2D

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "strukturen.json"
OUT = ROOT / "bilder" / "strukturen"


def render(name: str, smiles: str, width: int = 240, height: int = 170) -> None:
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"invalid SMILES for {name}: {smiles}")
    rdDepictor.Compute2DCoords(mol)
    drawer = rdMolDraw2D.MolDraw2DSVG(width, height)
    opts = drawer.drawOptions()
    opts.bondLineWidth = 2
    opts.minFontSize = 11
    opts.maxFontSize = 15
    opts.padding = 0.06
    opts.useBWAtomPalette()  # monochrome, print-friendly
    rdMolDraw2D.PrepareAndDrawMolecule(drawer, mol)
    drawer.FinishDrawing()
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / f"{name}.svg"
    target.write_text(drawer.GetDrawingText(), encoding="utf-8")
    print(f"{target.relative_to(ROOT)}  <- {smiles}")


def main() -> None:
    jobs = json.loads(SRC.read_text(encoding="utf-8"))
    for name, spec in jobs.items():
        render(name, spec["smiles"], spec.get("w", 240), spec.get("h", 170))


if __name__ == "__main__":
    main()
