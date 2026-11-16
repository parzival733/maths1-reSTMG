"""Materialize the existing initial exercises as HTML for reading without JavaScript.
This does not create new mathematical models and is not needed to serve the site.
"""
from pathlib import Path
from html import escape
import json, re, subprocess
ROOT=Path(__file__).resolve().parents[1]

def main():
    script="""const fs=require('fs'),vm=require('vm');const s={window:{},console};vm.createContext(s);
    for(const f of ['figures.js','figures-statistiques.js','figures-geometrie.js','exercices-variants.js','terminale-exercices.js','terminale-figures.js'])vm.runInContext(fs.readFileSync('assets/'+f,'utf8'),s);
    const fig=(d,id)=>d?s.window.Figures.html(d,{classe:'exercise-figure',id}):'';
    const out={};for(const slug of s.window.TerminaleExercises.slugs)out[slug]=Array.from({length:6},(_,i)=>{const e=s.window.ExerciseVariants.original(slug,i);return Object.assign({},e,{figure:fig(e.figure,'lecture-enonce-'+(i+1)),figure_correction:fig(e.figure_correction,'lecture-corrige-'+(i+1))});});
    process.stdout.write(JSON.stringify(out));"""
    terminal=json.loads(subprocess.check_output(['node','-e',script],cwd=ROOT,text=True))
    college=json.loads(subprocess.check_output(['node','-e',script.replace('terminale-exercices.js','troisieme-exercices.js').replace('TerminaleExercises','TroisiemeExercises')],cwd=ROOT,text=True))
    lycee=json.loads(subprocess.check_output(['node','-e',script.replace('terminale-exercices.js','seconde-exercices.js').replace('TerminaleExercises','SecondeExercises')],cwd=ROOT,text=True))
    # Première : les énoncés viennent du JSON de chaque page ; les figures de la variante 1 sont calculées par les modèles.
    premiere=json.loads(subprocess.check_output(['node','-e',"""const fs=require('fs'),vm=require('vm');const s={window:{},console};vm.createContext(s);
    for(const f of ['figures.js','figures-statistiques.js','exercices-variants.js','variants-fonctions.js','variants-suites.js','variants-analyse.js','variants-probabilites.js','variants-reperes.js','variants-donnees.js'])vm.runInContext(fs.readFileSync('assets/'+f,'utf8'),s);
    const V=s.window.ExerciseVariants,fig=(d,id)=>d?s.window.Figures.html(d,{classe:'exercise-figure',id}):'';
    const out={};for(const slug of V.slugs())out[slug]=Array.from({length:V.count(slug)},(_,i)=>{const e=V.original(slug,i);return {figure:fig(e.figure,'lecture-enonce-'+(i+1)),figure_correction:fig(e.figure_correction,'lecture-corrige-'+(i+1))};});
    process.stdout.write(JSON.stringify(out));"""],cwd=ROOT,text=True))
    for path in [*sorted((ROOT/'exercices').glob('*.html')),*sorted((ROOT/'terminale/exercices').glob('*.html')),*sorted((ROOT/'troisieme/exercices').glob('*.html')),*sorted((ROOT/'seconde/exercices').glob('*.html'))]:
        if path.name=='fonctions.html':continue # Cette page contient déjà sa version de lecture.
        text=path.read_text();match=re.search(r'<script type="application/json" id="exercise-data">(.*?)</script>',text,re.S)
        if not match:continue
        exercises=terminal[path.stem] if path.stem.startswith('t-') else college[path.stem] if path.stem.startswith('3-') else lycee[path.stem] if path.stem.startswith('2-') else [dict(ex,**figures) for ex,figures in zip(json.loads(match[1])['exercises'],premiere[path.stem])]
        blocks=['<noscript data-offline-series><style>#exercise-mounted{display:none}</style><section class="offline-series"><h2>Exercices : version de lecture</h2><p>Travaille sur une feuille. Les variantes et la v\u00e9rification automatique n\u00e9cessitent JavaScript ; les \u00e9nonc\u00e9s initiaux sont reproduits sans modification math\u00e9matique.</p>']
        for i,ex in enumerate(exercises,1):
            blocks.append('<section class="exam-block"><h3>'+str(i)+'. '+escape(ex['title'])+'</h3><p>'+ex['statement']+'</p>'+ex.get('figure',''))
            blocks.append('<ol>'+''.join('<li>'+t+'</li>' for t in ex.get('tasks',[]))+'</ol>')
            blocks.append('<p>R\u00e9ponses demand\u00e9es : '+ ' ; '.join(escape(f['label']) for f in ex['fields'])+'.</p>')
            blocks.append('<details class="offline-solution"><summary>Voir le corrig\u00e9</summary>'+''.join(x if re.match(r'\s*<(div|table)\b',x) else '<p>'+x+'</p>' for x in ex['correction'])+ex.get('figure_correction','')+'</details></section>')
        blocks.append('<p><a href="../cours/'+path.stem+'.html">Revoir la lecon</a></p></section></noscript>')
        text=re.sub(r'<noscript data-offline-series>[\s\S]*?</noscript>','',text)
        # Une seule version de lecture sans JavaScript par série.
        text=re.sub(r'<noscript>[\s\S]*?</noscript>',''.join(blocks),text,count=1)
        if 'data-offline-series' not in text:text=text.replace('</main>',''.join(blocks)+'</main>')
        text=text.replace(' aria-busy="true"','')
        path.write_text(text)
    print('FALLBACKS OK: 56 series materialized from existing exercise data.')
if __name__=='__main__':main()
