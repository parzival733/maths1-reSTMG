"""Écriture des formules : aucun exposant perdu ni notation ambiguë dans le texte visible
des pages, les attributs lus par les aides et les données JSON des exercices.

Les exposants s'écrivent avec <sup> ou en caractères Unicode (2⁻², 1,2ⁿ). Ce test
refuse notamment « log(Ax) = x log(A) », « xa = b », « 10k+1 », « 2^n » hors code et
les puissances écrites en toutes lettres (« 10 puissance −3 »).
"""
from pathlib import Path
import html, re

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    'log(Ax) = x log(A)': re.compile(r'log\(\s*[A-Za-z0-9,]+\s*[a-z]\s*\)\s*=\s*[a-z]\s*log'),
    'xa = b': re.compile(r'(?<![\w^)])x[a-z]\s*=\s*[a-z]\b'),
    '10k+1': re.compile(r'(?<![\w^(])10[a-z]\s*[+−-]\s*1\b'),
    'accent circonflexe ^': re.compile(r'\^'),
    'puissance en toutes lettres': re.compile(r'\d\s+puissance\s+[−-]?\d'),
}
SKIP = re.compile(r'<script(?![^>]*application/json)[\s\S]*?</script>|<style[\s\S]*?</style>|<code>[\s\S]*?</code>|<pre[\s\S]*?</pre>|<svg[\s\S]*?</svg>')


def visible(source):
    """Texte lu par l'élève : <sup> devient (exposant) pour ne pas créer de faux positifs."""
    text = SKIP.sub(' ', source)
    text = re.sub(r'<sup>(.*?)</sup>', r'⁽\1⁾', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    return html.unescape(text.replace('\\u003c', '<'))


def main():
    problems, pages = [], 0
    for path in sorted(ROOT.rglob('*.html')):
        rel = path.relative_to(ROOT)
        if any(part.startswith('.') or part in ('docs', 'public') for part in rel.parts):
            continue
        pages += 1
        source = path.read_text(encoding='utf-8')
        attributes = ' '.join(html.unescape(v) for v in re.findall(r'data-(?:hint|explanation|expect)="([^"]*)"', source))
        data = ' '.join(re.findall(r'<script type="application/json"[^>]*>([\s\S]*?)</script>', source))
        for where, text in (('texte', visible(source)), ('attributs', attributes), ('données', visible(data.replace('\\u003c', '<')))):
            for name, pattern in PATTERNS.items():
                for match in pattern.finditer(text):
                    problems.append(f'{rel} ({where}) : {name} → « {text[max(0, match.start() - 30):match.end() + 20].strip()} »')
    assert not problems, '\n'.join(problems[:40])
    print(f'NOTATION OK: {pages} pages, aucun exposant perdu ni notation ambiguë ({len(PATTERNS)} motifs).')


if __name__ == '__main__':
    main()
