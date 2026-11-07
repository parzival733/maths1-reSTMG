"""Typographie française du texte visible : apostrophe ’, espaces insécables avant
: ; ! ?, dans les guillemets « » et entre un nombre et son unité.

Contrôle indépendant de tools/typographie.py : il relit le texte visible des pages
(hors code, listes déroulantes et scripts), les attributs lus par l'élève et les
données JSON des séries. Le texte produit par JavaScript est contrôlé dans
tests/browser_smoke.py.
"""
from pathlib import Path
import html, json, re

ROOT = Path(__file__).resolve().parents[1]
NB, NNB = chr(160), chr(8239)
CHECKS = {
    'apostrophe droite': re.compile(r"[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]"),
    'espace normale avant : ; ! ?': re.compile(r'\S [:;!?](?:\s|$)'),
    'guillemet ouvrant sans insécable': re.compile('«(?!' + NB + ')'),
    'guillemet fermant sans insécable': re.compile('(?<!' + NB + ')»'),
    'nombre et unité séparés par une espace normale': re.compile(r'\d (?:€|%|km/h|km|kg|min|h|°C)(?![A-Za-zÀ-ÿ\d/])'),
}
SKIP = re.compile(r'<(script|style|pre|code|textarea|svg|select)\b[\s\S]*?</\1>')


def visible(source):
    text = SKIP.sub(' ', source)
    attributes = ' '.join(re.findall(r'\b(?:aria-label|title|alt|placeholder|data-hint|data-explanation)="([^"]*)"', text))
    text = re.sub(r'<[^>]+>', ' ', text)
    return html.unescape(text + ' ' + attributes)


def main():
    problems, pages = [], 0
    for path in sorted(ROOT.rglob('*.html')):
        rel = path.relative_to(ROOT)
        if any(part.startswith('.') or part in ('docs', 'public') for part in rel.parts):
            continue
        pages += 1
        source = path.read_text(encoding='utf-8')
        body = source[source.index('<body'):] if '<body' in source else source
        texts = [visible(body)]
        for raw in re.findall(r'<script type="application/json" id="exercise-data">([\s\S]*?)</script>', source):
            if not raw.strip():
                continue
            for exercise in json.loads(raw)['exercises']:
                parts = [exercise.get('statement', ''), *exercise.get('tasks', []), *exercise.get('correction', [])]
                texts.append(visible(' '.join(parts)) + ' ' + ' '.join(f['label'] for f in exercise['fields']))
        for meta in re.findall(r'<meta (?:name="description"|property="og:description") content="([^"]*)"', source):
            texts.append(html.unescape(meta))
        for text in texts:
            for name, pattern in CHECKS.items():
                for match in pattern.finditer(text):
                    problems.append(f'{rel} : {name} → « {text[max(0, match.start() - 25):match.end() + 15].strip()} »')
    assert not problems, '\n'.join(problems[:30]) + f'\n… {len(problems)} anomalies'
    print(f'TYPOGRAPHIE OK: {pages} pages, apostrophes, espaces insécables (: ; ! ?, « », unités).')


if __name__ == '__main__':
    main()
