"""Compare le rendu à un commit de référence avec le même navigateur.

Les images restent dans .qa-visual/, hors du site publié. Un changement voulu
doit préciser le commit de référence et les éléments concernés dans
tests/visual-changes.json. Les captures brutes sont conservées ; une normalisation
explicite peut retirer les seules commandes remplacées avant comparaison du reste.
"""
import base64
import functools
from html import escape
from http.server import ThreadingHTTPServer
import io
import json
import os
from pathlib import Path
import re
import subprocess
import tarfile
import tempfile
import threading
from playwright.sync_api import sync_playwright
from http_security import SecurityHandler

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.qa-visual'
PAGES = ['index.html', 'lecons.html', 'cours/fonctions.html', 'exercices/suites.html', 'exercices/fonctions.html',
         'terminale/exercices/t-inverse.html', 'annexes/calcul-rapide.html',
         'sujets.html', 'revisions.html', '404.html']
FIXED = """() => {
  const NativeDate = Date, now = NativeDate.parse('2026-11-10T12:00:00Z');
  function FixedDate(...args) { return new.target ? new NativeDate(...(args.length ? args : [now])) : new NativeDate(now).toString(); }
  Object.setPrototypeOf(FixedDate, NativeDate); FixedDate.prototype = NativeDate.prototype; FixedDate.now = () => now; window.Date = FixedDate;
  let seed = 123456789;
  Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}"""
COMPARE = """async ({before, after, regions}) => {
  const images = await Promise.all([before, after].map(data => new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = reject;
    image.src = 'data:image/png;base64,' + data;
  })));
  if (images[0].width !== images[1].width || images[0].height !== images[1].height)
    return {sameSize: false, unexpectedPixels: -1, expectedPixels: 0};
  const canvas = document.createElement('canvas'); canvas.width = images[0].width; canvas.height = images[0].height;
  const ctx = canvas.getContext('2d', {willReadFrequently: true}), pixels = images.map(image => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0); return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  });
  let unexpected = 0, expected = 0, maxDelta = 0;
  for (let i = 0; i < pixels[0].length; i += 4) {
    const delta = Math.max(...[0,1,2].map(c => Math.abs(pixels[0][i+c] - pixels[1][i+c])));
    maxDelta = Math.max(maxDelta, delta);
    if (delta <= 1) continue; // Variation d'anticrénelage d'un seul niveau sur 255.
    const x = (i/4) % canvas.width, y = Math.floor(i/4/canvas.width);
    if (regions.some(r => x >= r.x+1 && x < r.x+r.width-1 && y >= r.y+1 && y < r.y+r.height-1)) expected++;
    else unexpected++;
  }
  return {sameSize: true, unexpectedPixels: unexpected, expectedPixels: expected, maxDelta};
}"""
NORMALIZE_SYMBOLS = """() => {
  // Changement volontaire des commandes, pas du contenu de la fiche.
  document.querySelectorAll('.answer-sign,.answer-decimal,.answer-symbols-toggle,.answer-symbols-panel').forEach(e=>e.remove());
  document.querySelectorAll('.answer-input').forEach(e=>e.replaceWith(...e.childNodes));
  document.querySelectorAll('.answer-tools').forEach(e=>e.replaceWith(...e.childNodes));
}"""
NORMALIZE_ANSWER_LAYOUT = """() => {
  // La mise en page des réponses est volontairement refaite : comparer leurs textes
  // et le reste de la page dans une géométrie commune, en conservant les captures brutes.
  const set=(e,styles)=>Object.entries(styles).forEach(([k,v])=>e.style.setProperty(k,v));
  document.querySelectorAll('.exercise-form').forEach(form=>{
    const heading=form.querySelector(':scope > h3');
    if(heading)set(heading,{'display':'flex','align-items':'center','min-height':'44px','margin':'0 0 16px','font-family':'var(--font-sans)','font-size':'var(--text-base)','font-weight':'700','line-height':'1.5'});
    form.querySelectorAll('.answer-grid').forEach(e=>set(e,{'display':'grid','grid-template-columns':'minmax(0,1fr)','gap':'16px'}));
    form.querySelectorAll('.answer-row').forEach(e=>set(e,{'display':'grid','grid-template-columns':'minmax(0,1fr)','gap':'8px','margin':'0','padding':'0','align-items':'start'}));
    form.querySelectorAll(':scope > :is(.answer-grid,.answer-row) + :is(.answer-grid,.answer-row)').forEach(e=>set(e,{'margin-top':'16px'}));
    form.querySelectorAll('.answer-row > span:first-child').forEach(e=>set(e,{'display':'block','line-height':'1.5'}));
    form.querySelectorAll('.answer-row > span:first-child > label').forEach(e=>set(e,{'display':'inline','font':'inherit','margin':'0','padding':'0'}));
    form.querySelectorAll('.answer-row input,.answer-row select').forEach(e=>set(e,{'display':'block','width':'100%','min-width':'0','height':'48px','min-height':'48px','padding':'10px 12px','margin':'0','box-sizing':'border-box','border-width':'2px','font-size':'16px','line-height':'1.5','box-shadow':'none'}));
    form.querySelectorAll('.exercise-actions').forEach(e=>set(e,{'margin-top':'24px','gap':'12px'}));
    form.querySelectorAll('.exercise-feedback').forEach(e=>{set(e,{'margin-top':'16px'});if(!e.textContent.trim())set(e,{'display':'none'});});
    form.querySelectorAll('.check').forEach(e=>set(e,{'margin-top':'24px'}));
  });
}"""


class Quiet(SecurityHandler):
    def log_message(self, *args):
        pass


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT).decode().strip()


def baseline():
    ref = os.environ.get('VISUAL_BASE_SHA')
    if not ref:
        ref = git('rev-parse', 'HEAD' if git('status', '--porcelain') else 'HEAD^')
    if not re.fullmatch(r'[a-f0-9]{40}', ref):
        raise ValueError('VISUAL_BASE_SHA doit être un SHA Git complet.')
    git('cat-file', '-e', ref + '^{commit}')
    return ref


def regions(page, selector):
    if not selector:
        return []
    return page.locator(selector).evaluate_all("""xs => xs.map(e => {
      const r=e.getBoundingClientRect(), s=getComputedStyle(e), p=getComputedStyle(e,'::placeholder');
      return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,
        style:[s.color,s.backgroundColor,s.borderColor,s.borderRadius,s.fontFamily,s.fontSize,s.padding,p.color,p.fontSize]};
    }).filter(r => r.width && r.height)""")


def main():
    ref = baseline()
    approved = json.loads((ROOT / 'tests/visual-changes.json').read_text())
    allowed = approved['allowed'] if approved['base_sha'] == ref else {}
    OUT.mkdir(exist_ok=True)
    rows, servers = [], []
    with tempfile.TemporaryDirectory(prefix='stmg-visual-') as temp:
        previous = Path(temp)
        archive = subprocess.check_output(['git', 'archive', ref], cwd=ROOT)
        with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
            tar.extractall(previous, filter='data')
        for root in [previous, ROOT]:
            subprocess.run([os.sys.executable, str(root / 'tools/build_public.py')], check=True, stdout=subprocess.DEVNULL)
            server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(root / 'public')))
            threading.Thread(target=server.serve_forever, daemon=True).start()
            servers.append(server)
        try:
            with sync_playwright() as w:
                options = {'executable_path': os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']} if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') else {}
                browser = w.chromium.launch(**options)
                comparator = browser.new_page()
                modes = [(width, theme, True) for width in [390, 1440] for theme in ['light', 'dark']]
                modes += [(390, 'light', False)]
                for width, theme, js in modes:
                    pages = PAGES if js else ['index.html', 'cours/fonctions.html', 'terminale/exercices/t-inverse.html']
                    contexts = [browser.new_context(viewport={'width': width, 'height': 900}, color_scheme=theme,
                                java_script_enabled=js, locale='fr-FR', timezone_id='UTC') for _ in servers]
                    for context in contexts:
                        context.add_init_script(FIXED)
                    tabs = [context.new_page() for context in contexts]
                    for name in pages:
                        policy = allowed.get(name, {})
                        selector = policy.get('selector') if policy.get('reason') else None
                        normalized = js and policy.get('normalization') in ('answer-symbols','answer-layout') and bool(policy.get('reason'))
                        captures, areas, filenames = [], [], []
                        for phase, (tab, server) in enumerate(zip(tabs, servers)):
                            tab.goto(f'http://127.0.0.1:{server.server_port}/' + name, wait_until='load')
                            tab.evaluate('document.fonts.ready')
                            tab.evaluate('async()=>{await Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))}')
                            areas.append(regions(tab, selector))
                            image = tab.screenshot(full_page=True, animations='disabled')
                            filename = '-'.join([str(width), theme, 'js' if js else 'sans-js', name.replace('/', '_'), str(phase)]) + '.png'
                            (OUT / filename).write_bytes(image)
                            if normalized:
                                tab.evaluate(NORMALIZE_SYMBOLS)
                                if policy.get('normalization') == 'answer-layout':tab.evaluate(NORMALIZE_ANSWER_LAYOUT)
                                image = tab.screenshot(full_page=True, animations='disabled')
                                (OUT / filename.replace('.png', '-comparaison.png')).write_bytes(image)
                            captures.append(base64.b64encode(image).decode())
                            filenames.append(filename)
                        geometry = areas[0] == areas[1]
                        diff = comparator.evaluate(COMPARE, {'before': captures[0], 'after': captures[1], 'regions': areas[1] if geometry else []})
                        # Refonte déclarée d'une page entière, pour ce seul commit de référence : les captures
                        # avant/après sont conservées pour la revue humaine, sans comparaison au pixel.
                        redesign = policy.get('normalization') == 'page-redesign' and bool(policy.get('reason'))
                        ok = redesign or (geometry and diff['sameSize'] and diff['unexpectedPixels'] == 0)
                        rows.append({'page': name, 'width': width, 'theme': theme, 'javascript': js,
                                     'ok': ok, 'geometryUnchanged': None if normalized else geometry,
                                     'normalizedComponent': policy.get('normalization') if normalized else None, 'expectedChange': policy.get('reason'),
                                     'reviewedRedesign': redesign,
                                     'images': filenames, **diff})
                    for context in contexts:
                        context.close()
                    print(f'VISUEL : {width}px, {theme}, JS={js}, {len(rows)} comparaisons.', flush=True)
                browser.close()
        finally:
            for server in servers:
                server.shutdown()
                server.server_close()
    report = {'base': ref, 'tolerance': '1 niveau RGB sur 255', 'comparisons': rows}
    (OUT / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    cards = ''.join('<details><summary>' + escape(f"{r['page']} · {r['width']}px · {r['theme']} · " + ('OK' if r['ok'] else 'À vérifier'))
                    + '</summary><p>' + escape(r.get('expectedChange') or 'Aucun changement visuel attendu.') + '</p><div>'
                    + ''.join('<a href="' + escape(f) + '"><img alt="' + label + '" src="' + escape(f) + '"></a>'
                              for f, label in zip(r['images'], ['Avant', 'Après'])) + '</div></details>' for r in rows)
    (OUT / 'rapport.html').write_text('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Comparaisons visuelles</title>'
                                    '<style>body{font:16px system-ui;max-width:1400px;margin:30px auto;padding:20px}details{margin:18px 0}details div{display:flex;gap:20px}a{width:50%}img{width:100%}</style>'
                                    '<h1>Comparaisons visuelles avant et après</h1><p>Base : ' + ref + '</p>' + cards + '</html>')
    failed = [row for row in rows if not row['ok']]
    if failed:
        raise SystemExit('Changements visuels non prévus : ' + ', '.join(row['page'] for row in failed))
    print(f'VISUEL OK : {len(rows)} comparaisons, dont {sum(bool(r["normalizedComponent"]) for r in rows)} avec normalisation déclarée de la zone de réponses ; captures brutes conservées.', flush=True)


if __name__ == '__main__':
    main()
