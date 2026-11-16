#!/usr/bin/env python3
"""Fichiers d'exercices par série, pour la 3e, la Seconde et la Terminale.

Les modèles d'un niveau sont écrits dans un seul fichier (assets/troisieme-exercices.js,
seconde-exercices.js, terminale-exercices.js), qui reste la source et le fichier des tests.
Une page de série n'a besoin que de ses propres modèles : cet outil extrait, pour chaque
série, assets/serie-<série>.js, qui garde les fonctions communes du niveau et les seuls
modèles, aides et figures de la série. Les pages chargent ce fichier.

    python3 tools/build_series.py           écrit les fichiers
    python3 tools/build_series.py --check   vérifie qu'ils sont à jour
"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
NIVEAUX = {'troisieme': 'troisieme-exercices.js', 'seconde': 'seconde-exercices.js', 'terminale': 'terminale-exercices.js'}
ENTREE = re.compile(r"^    '([\w-]+)': ")
ILLUSTRE = re.compile(r"^    V\.illustrate\('([\w-]+)', \[")
MOTEUR = ['figures.js', 'figures-statistiques.js', 'figures-geometrie.js']


def series(source):
    """Séries d'un niveau, dans l'ordre du tableau `models`."""
    lignes = source.split('\n')
    debut = lignes.index('  const models = {')
    fin = lignes.index('  };', debut)
    return [m.group(1) for m in map(ENTREE.match, lignes[debut:fin]) if m]


def extraire(source, serie, fichier):
    """Source du niveau réduite à une série : mêmes fonctions, un seul chapitre dans chaque tableau."""
    lignes, sortie, i = source.split('\n'), [], 0
    # En-tête du niveau remplacé par celui du fichier extrait.
    while not lignes[i].startswith('(() => {'):
        i += 1
    sortie.append(f'/* Série {serie} : extrait de assets/{fichier} par tools/build_series.py.\n'
                  '   Ne pas modifier ce fichier : corriger la source, puis relancer l\'outil. */')
    while i < len(lignes):
        ligne = lignes[i]
        if re.match(r'^  const (models|basics|FIGURES) = \{$', ligne):
            sortie.append(ligne); i += 1
            garder = True
            while lignes[i] != '  };':
                entree = ENTREE.match(lignes[i])
                if entree:
                    garder = entree.group(1) == serie
                if garder:
                    sortie.append(lignes[i])
                i += 1
            continue
        appel = ILLUSTRE.match(ligne)
        if appel:
            bloc = [ligne]
            while lignes[i] not in ('    ]);', '  ]);'):
                i += 1; bloc.append(lignes[i])
            if appel.group(1) == serie:
                sortie.extend(bloc)
            i += 1
            continue
        sortie.append(ligne); i += 1
    return '\n'.join(sortie)


def fichiers():
    """{nom du fichier: contenu} pour toutes les séries des trois niveaux."""
    out = {}
    for fichier in NIVEAUX.values():
        source = (ASSETS / fichier).read_text(encoding='utf-8')
        for serie in series(source):
            out[f'serie-{serie}.js'] = extraire(source, serie, fichier)
    return out


def besoins():
    """{série: fichiers du moteur de figures à charger}, d'après les figures que produisent ses modèles."""
    script = """const fs=require('fs'),vm=require('vm');const out={};
    for(const niveau of %s){const s={window:{},console};vm.createContext(s);
      for(const f of %s.concat(['exercices-variants.js',niveau,'terminale-figures.js']))vm.runInContext(fs.readFileSync('assets/'+f,'utf8'),s);
      const V=s.window.ExerciseVariants,T=s.window.TroisiemeExercises||s.window.SecondeExercises||s.window.TerminaleExercises;
      for(const slug of T.slugs){const types=new Set();
        for(let i=0;i<V.count(slug);i++)for(let seed=0;seed<=40;seed++){const e=seed?V.generate(slug,i,seed):V.original(slug,i);
          for(const d of [e.figure,e.figure_correction])if(d){types.add(d.type);if(d.type==='groupe')d.figures.forEach(x=>types.add(x.type));
            if(d.type==='statistiques'&&/circulaire|venn/.test(d.elements[0].t))types.add('figure');}}
        out[slug]=Array.from(types);}}
    process.stdout.write(JSON.stringify(out));""" % (json.dumps(list(NIVEAUX.values())), json.dumps(MOTEUR))
    types = json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT, text=True))
    out = {}
    for serie, vus in types.items():
        liste = ['figures.js'] if vus else []
        if set(vus) & {'statistiques', 'pascal', 'arbre'}:
            liste.append('figures-statistiques.js')
        if set(vus) & {'figure', 'droite_numerique', 'espace', 'programme_trace'}:
            liste.append('figures-geometrie.js')
        out[serie] = liste
    return out


def main():
    attendus = fichiers()
    if '--check' in sys.argv:
        ecarts = [nom for nom, contenu in attendus.items() if not (ASSETS / nom).is_file() or (ASSETS / nom).read_text(encoding='utf-8') != contenu]
        ecarts += [p.name for p in ASSETS.glob('serie-*.js') if p.name not in attendus]
        if ecarts:
            raise SystemExit('Fichiers de série à régénérer (python3 tools/build_series.py) : ' + ', '.join(sorted(ecarts)))
        print(f'SERIES OK : {len(attendus)} fichiers à jour.')
        return
    for ancien in ASSETS.glob('serie-*.js'):
        if ancien.name not in attendus:
            ancien.unlink()
    for nom, contenu in attendus.items():
        (ASSETS / nom).write_text(contenu, encoding='utf-8')
    print(f'SERIES OK : {len(attendus)} fichiers écrits dans assets/.')


if __name__ == '__main__':
    main()
