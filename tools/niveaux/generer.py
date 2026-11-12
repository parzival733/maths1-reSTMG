"""Régénère les pages de 3e et de Seconde à partir des leçons de ce dossier, puis
normalise le site. Usage : python3 tools/niveaux/generer.py"""
import subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
for script in ['troisieme.py', 'seconde.py']:
    subprocess.run([sys.executable, str(HERE / script)], check=True, cwd=ROOT)
for tool in ['build_fallbacks.py', 'finalize_site.py']:
    subprocess.run([sys.executable, str(ROOT / 'tools' / tool)], check=True, cwd=ROOT)
