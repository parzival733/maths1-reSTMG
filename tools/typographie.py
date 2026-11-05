"""Typographie française du texte visible, appliquée de façon idempotente par
finalize_site.py : apostrophe typographique, espaces insécables avant : ; ! ?, dans
les guillemets « » et entre un nombre et son unité.

Le code (script, style, pre, code, textarea, svg), les listes déroulantes (select) et
les attributs techniques ne sont jamais modifiés. Les mêmes règles sont appliquées au
texte produit par JavaScript par assets/typographie.js.
"""
from pathlib import Path
import json, re

NBSP, NNBSP = ' ', ' '
LETTER = 'A-Za-zÀ-ÖØ-öø-ÿŒœ'
UNITS = r'(?:€|%|km/h|m/s|kWh|km|cm|mm|kg|min|h|L|°C|ans?|mois)'
RULES = [
    (re.compile(rf"(?<=[{LETTER}])'(?=[{LETTER}])"), '’'),
    (re.compile('(?:(?<=\\S)|^)[  ](?=:(?:\\s|$))'), NBSP),
    (re.compile('(?:(?<=\\S)|^)[  ](?=[;!?](?:\\s|$|[»)]))'), NNBSP),
    (re.compile('«[   ]?'), '«' + NBSP),
    (re.compile('[   ]?»'), NBSP + '»'),
    (re.compile(rf'(?<=\d) (?={UNITS}(?![{LETTER}\d/]))'), NBSP),
]
SKIP = {'script', 'style', 'pre', 'code', 'textarea', 'svg', 'select', 'math'}
USER_ATTRIBUTES = re.compile(r'\b(aria-label|title|alt|placeholder|data-hint|data-explanation)="([^"]*)"')
META = re.compile(r'(<meta (?:name="description"|property="og:description"|property="og:title") content=")([^"]*)(")')
TOKENS = re.compile(r'(<!--[\s\S]*?-->|<[^>]+>)')
EXERCISE_DATA = re.compile(r'(<script type="application/json" id="exercise-data">)([\s\S]*?)(</script>)')


def fix_text(text):
    for pattern, replacement in RULES:
        text = pattern.sub(replacement, text)
    return text


def fix_html(source):
    """Applique les règles au texte hors balises, sans entrer dans les zones de code."""
    out, skipping = [], []
    for token in TOKENS.split(source):
        if not token:
            continue
        if token.startswith('<'):
            tag = re.match(r'</?\s*([a-zA-Z][\w-]*)', token)
            name = tag.group(1).lower() if tag else ''
            if token.startswith('</'):
                if skipping and skipping[-1] == name:
                    skipping.pop()
            elif name in SKIP and not token.endswith('/>'):
                skipping.append(name)
            if not skipping and not token.startswith('<!--'):
                token = USER_ATTRIBUTES.sub(lambda m: f'{m.group(1)}="{fix_text(m.group(2))}"', token)
            out.append(token)
        else:
            out.append(token if skipping else fix_text(token))
    return ''.join(out)


def fix_exercises(raw):
    """Données JSON des séries : textes affichés seulement, jamais réponses ni options."""
    if not raw.strip():
        return raw
    data = json.loads(raw)
    for exercise in data.get('exercises', []):
        for key in ('title', 'statement', 'hint'):
            if isinstance(exercise.get(key), str):
                exercise[key] = fix_html(exercise[key])
        for key in ('tasks', 'correction'):
            if isinstance(exercise.get(key), list):
                exercise[key] = [fix_html(x) for x in exercise[key]]
        for field in exercise.get('fields', []):
            field['label'] = fix_text(field['label'])
    return json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')


def fix_page(text):
    opening = re.search(r'<body\b[^>]*>', text)
    cut = opening.end() if opening else len(text)
    head, body = text[:cut], text[cut:]
    head = re.sub(r'(<title>)([\s\S]*?)(</title>)', lambda m: m.group(1) + fix_text(m.group(2)) + m.group(3), head, count=1)
    head = META.sub(lambda m: m.group(1) + fix_text(m.group(2)) + m.group(3), head)
    if not opening:
        return head
    parts, last = [], 0
    for match in EXERCISE_DATA.finditer(body):
        parts.append(fix_html(body[last:match.start()]))
        parts.append(match.group(1) + fix_exercises(match.group(2)) + match.group(3))
        last = match.end()
    parts.append(fix_html(body[last:]))
    return head + ''.join(parts)


def apply(root: Path):
    for path in sorted(root.rglob('*.html')):
        if any(part.startswith('.') or part == 'docs' for part in path.relative_to(root).parts):
            continue
        text = path.read_text(encoding='utf-8')
        new = fix_page(text)
        if new != text:
            path.write_text(new, encoding='utf-8')


if __name__ == '__main__':
    apply(Path(__file__).resolve().parents[1])
