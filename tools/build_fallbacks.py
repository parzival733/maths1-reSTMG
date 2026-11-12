"""Materialize the existing initial exercises as HTML for reading without JavaScript.
This does not create new mathematical models and is not needed to serve the site.
"""
from pathlib import Path
from html import escape
import json, re, subprocess
ROOT=Path(__file__).resolve().parents[1]

def main():
    script="""const fs=require('fs'),vm=require('vm');const s={window:{},console};vm.createContext(s);
    for(const f of ['exercices-variants.js','terminale-exercices.js'])vm.runInContext(fs.readFileSync('assets/'+f,'utf8'),s);
    const out={};for(const slug of s.window.TerminaleExercises.slugs)out[slug]=Array.from({length:6},(_,i)=>s.window.ExerciseVariants.original(slug,i));
    process.stdout.write(JSON.stringify(out));"""
    terminal=json.loads(subprocess.check_output(['node','-e',script],cwd=ROOT,text=True))
    college=json.loads(subprocess.check_output(['node','-e',script.replace('terminale-exercices.js','troisieme-exercices.js').replace('TerminaleExercises','TroisiemeExercises')],cwd=ROOT,text=True))
    for path in [*sorted((ROOT/'exercices').glob('*.html')),*sorted((ROOT/'terminale/exercices').glob('*.html')),*sorted((ROOT/'troisieme/exercices').glob('*.html'))]:
        if path.name=='fonctions.html':continue # Cette page contient déjà sa version de lecture.
        text=path.read_text();match=re.search(r'<script type="application/json" id="exercise-data">(.*?)</script>',text,re.S)
        if not match:continue
        exercises=terminal[path.stem] if path.stem.startswith('t-') else college[path.stem] if path.stem.startswith('3-') else json.loads(match[1])['exercises']
        blocks=['<noscript data-offline-series><style>#exercise-mounted{display:none}</style><section class="offline-series"><h2>Exercices : version de lecture</h2><p>Travaille sur une feuille. Les variantes et la v\u00e9rification automatique n\u00e9cessitent JavaScript ; les \u00e9nonc\u00e9s initiaux sont reproduits sans modification math\u00e9matique.</p>']
        for i,ex in enumerate(exercises,1):
            blocks.append('<section class="exam-block"><h3>'+str(i)+'. '+escape(ex['title'])+'</h3><p>'+ex['statement']+'</p>')
            blocks.append('<ol>'+''.join('<li>'+t+'</li>' for t in ex.get('tasks',[]))+'</ol>')
            blocks.append('<p>R\u00e9ponses demand\u00e9es : '+ ' ; '.join(escape(f['label']) for f in ex['fields'])+'.</p>')
            blocks.append('<details class="offline-solution"><summary>Voir le corrig\u00e9</summary>'+''.join(x if re.match(r'\s*<(div|table)\b',x) else '<p>'+x+'</p>' for x in ex['correction'])+'</details></section>')
        blocks.append('<p><a href="../cours/'+path.stem+'.html">Revoir la lecon</a></p></section></noscript>')
        text=re.sub(r'<noscript data-offline-series>[\s\S]*?</noscript>','',text)
        # Une seule version de lecture sans JavaScript par série.
        text=re.sub(r'<noscript>[\s\S]*?</noscript>',''.join(blocks),text,count=1)
        if 'data-offline-series' not in text:text=text.replace('</main>',''.join(blocks)+'</main>')
        text=text.replace(' aria-busy="true"','')
        path.write_text(text)
    print('FALLBACKS OK: 40 series materialized from existing exercise data.')
if __name__=='__main__':main()
