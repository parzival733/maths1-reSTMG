"""Liste, puis met à jour après relecture, les empreintes du contenu protégé.

    python3 tools/update_fingerprints.py           # liste les entrées modifiées
    python3 tools/update_fingerprints.py --write   # réécrit les empreintes

Les deux manifestes (tests/interface-content.json et tests/evolution-mathematics.json)
gardent leur format et leurs entrées ; seules les valeurs sha256 changent. Chaque mise à
jour doit être justifiée dans docs/audit-et-arbitrages.md.
"""
from pathlib import Path
import hashlib, json, re, sys

ROOT = Path(__file__).resolve().parents[1]


def interface_digest(path, data):
    text = (ROOT / path).read_text()
    part = re.search(r'<main\b[\s\S]*?</main>', text).group() if data['part'] == 'main' else text
    return hashlib.sha256(part.encode()).hexdigest()


def evolution_digest(path, data):
    if data['kind'] == 'exercise-json':
        text = (ROOT / path).read_text()
        obj = json.loads(re.search(r'<script type="application/json" id="exercise-data">([\s\S]*?)</script>', text)[1])
        items = [{k: v for k, v in e.items() if k in {'statement', 'tasks', 'fields', 'correction'}} for e in obj['exercises']]
        content = json.dumps(items, sort_keys=True, ensure_ascii=True).encode()
    else:
        content = (ROOT / path).read_bytes()
    return hashlib.sha256(content).hexdigest()


def main():
    write = '--write' in sys.argv
    changed = []
    for manifest, digest in [('tests/interface-content.json', interface_digest), ('tests/evolution-mathematics.json', evolution_digest)]:
        data = json.loads((ROOT / manifest).read_text())
        for path, entry in data.items():
            value = digest(path, entry)
            if value != entry['sha256']:
                changed.append(f'{manifest}: {path}')
                entry['sha256'] = value
        if write:
            (ROOT / manifest).write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print('\n'.join(changed) if changed else 'Aucune empreinte modifiée.')
    if write:
        print(f'{len(changed)} empreinte(s) mise(s) à jour.')


if __name__ == '__main__':
    main()
