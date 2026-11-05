"""Écrit dans le JSON des séries de Première les corrigés structurés calculés par
tools/original_corrections.js (Méthode → Calculs → Conclusion).

    python3 tools/apply_original_corrections.py

Seuls changent les corrigés, les valeurs données ajoutées aux trois énoncés qui
supposaient une calculatrice, et les entités HTML (&lt;, &gt;) qui s'affichaient
telles quelles dans trois libellés. Relancer ensuite tools/build_fallbacks.py.
"""
from pathlib import Path
import json, re, subprocess

ROOT = Path(__file__).resolve().parents[1]
BLOCK = re.compile(r'(<script type="application/json" id="exercise-data">)([\s\S]*?)(</script>)')


def main():
    data = json.loads(subprocess.check_output(['node', 'tools/original_corrections.js'], cwd=ROOT, text=True))
    changed = 0
    static = data.pop('fonctions')
    path = ROOT / 'exercices/fonctions.html'
    text = path.read_text(encoding='utf-8')
    blocks = iter(static)
    def correction(match):
        lines = next(blocks)['correction']
        body = ''.join(x if re.match(r'\s*<(div|table)\b', x) else '<p>' + x + '</p>' for x in lines)
        return match.group(1) + body + '</details>'
    new = re.sub(r'(<details class="check"><summary>Voir la correction détaillée</summary>)[\s\S]*?</details>', correction, text)
    assert next(blocks, None) is None
    if new != text:
        path.write_text(new, encoding='utf-8')
        changed += 1
    for slug, items in data.items():
        path = ROOT / 'exercices' / f'{slug}.html'
        text = path.read_text(encoding='utf-8')
        match = BLOCK.search(text)
        info = json.loads(match.group(2))
        for exercise, item in zip(info['exercises'], items, strict=True):
            exercise['correction'] = item['correction']
            if item['given'] and item['given'].strip() not in exercise['statement']:
                exercise['statement'] += item['given']
            for field in exercise['fields']:
                field['label'] = field['label'].replace('&lt;', '<').replace('&gt;', '>')
        raw = json.dumps(info, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
        new = text[:match.start(2)] + raw + text[match.end(2):]
        if new != text:
            path.write_text(new, encoding='utf-8')
            changed += 1
    print(f'CORRIGÉS D’ORIGINE OK : {sum(len(v) for v in data.values()) + len(static)} exercices, {changed} pages modifiées.')


if __name__ == '__main__':
    main()
