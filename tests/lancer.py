#!/usr/bin/env python3
"""Lance les tests mathématiques et structurels, plusieurs à la fois.

    python3 tests/lancer.py            tous les tests, sur tous les cœurs
    python3 tests/lancer.py -j 1       un test à la fois
    python3 tests/lancer.py seconde    seulement les tests dont le nom contient « seconde »

Les tests dans le navigateur (tests/browser_*.py et quelques autres) ne sont pas lancés ici :
voir .github/workflows/verification.yml.
"""
import os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Les plus longs d'abord, pour que les cœurs restent occupés jusqu'au bout.
TESTS = [
    'node tests/test_troisieme.js', 'node tests/test_seconde.js', 'node tests/test_variants.js', 'node tests/test_terminale.js',
    'python3 tests/validate_site.py', 'python3 tests/test_notation.py', 'python3 tests/test_typographie.py', 'python3 tests/test_noms_liens.py',
    'node tests/test_safari.js', 'node tests/test_answer_formats.js', 'node tests/test_rangs.js', 'node tests/test_graphiques.js',
    'node tests/test_figures.js', 'python3 tests/test_figures.py', 'python3 tests/test_terminale.py', 'python3 tests/test_troisieme.py',
    'python3 tests/test_seconde.py', 'python3 tools/build_series.py --check', 'node tests/test_series.js',
    'node tests/test_calcul_rapide.js', 'python3 tests/test_calcul_rapide.py', 'node tests/test_countdown.js', 'node tests/test_acquis.js',
    'node tests/test_parcours.js', 'node tests/test_domaines.js', 'python3 tests/test_evolution.py', 'node tests/test_cloture.js',
    'python3 tests/test_cloture.py', 'python3 tests/test_securite.py',
]


def lancer(commande):
    debut = time.time()
    r = subprocess.run(commande.split(), cwd=ROOT, capture_output=True, text=True)
    return commande, r.returncode, time.time() - debut, (r.stdout + r.stderr).strip()


def main():
    args = sys.argv[1:]
    coeurs = os.cpu_count() or 2
    if '-j' in args:
        i = args.index('-j'); coeurs = int(args[i + 1]); del args[i:i + 2]
    tests = [t for t in TESTS if not args or any(a in t for a in args)]
    syntaxe = [] if args else sorted((ROOT / 'assets').glob('*.js'))
    echecs = []
    for fichier in syntaxe:
        if subprocess.run(['node', '--check', str(fichier)], capture_output=True).returncode:
            echecs.append('node --check ' + fichier.name)
    debut = time.time()
    with ThreadPoolExecutor(max_workers=max(1, coeurs)) as pool:
        for commande, code, duree, sortie in pool.map(lancer, tests):
            print(f"{'OK   ' if code == 0 else 'ÉCHEC'} {duree:5.0f} s  {commande}", flush=True)
            if code:
                echecs.append(commande)
                print(sortie[-4000:], flush=True)
            elif sortie:
                print('      ' + sortie.splitlines()[-1][:200], flush=True)
    print(f'{len(tests)} tests en {time.time() - debut:.0f} s sur {coeurs} cœur(s) ; échecs : {echecs or "aucun"}', flush=True)
    sys.exit(bool(echecs))


if __name__ == '__main__':
    main()
