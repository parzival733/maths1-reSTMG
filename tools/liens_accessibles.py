"""Noms accessibles uniques pour les liens génériques répétés (« Commencer la série »,
« Lire le cours », « Leçon », « Revoir la leçon associée »…), appliqués de façon
idempotente par finalize_site.py. Un texte masqué visuellement (classe sr-only)
complète le texte visible, qui reste inchangé à l'écran.
"""
from pathlib import Path
import html, re


def plain(fragment):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', fragment))).strip()


def hidden(text):
    return f'<span class="sr-only"> : {html.escape(text, quote=False)}</span>'


def lesson_title(root, page, href):
    target = (page.parent / href.split('#')[0]).resolve()
    if not target.is_file():
        return ''
    h1 = re.search(r'<h1[^>]*>([\s\S]*?)</h1>', target.read_text(encoding='utf-8'))
    return plain(h1.group(1)) if h1 else ''


def cards(text):
    """Cartes des catalogues : le lien se nomme par son action et le titre de la carte."""
    def card(match):
        tag, body = match.group(1), match.group(2)
        if 'aria-labelledby' in tag:
            return match.group(0)
        title = re.search(r'<h3[^>]*>([\s\S]*?)</h3>', body)
        action = re.search(r'<span class="read-link">([\s\S]*?)</span>', body)
        if not title or not action:
            return match.group(0)
        slug = re.search(r'href="([^"]+)"', tag).group(1).rsplit('/', 1)[-1].removesuffix('.html')
        label = re.sub(r'\s*→\s*$', '', action.group(1))
        new_action = (f'<span class="read-link" id="lien-{slug}">{label}{hidden(plain(title.group(1)))} '
                      '<span aria-hidden="true">→</span></span>')
        body = body.replace(action.group(0), new_action, 1)
        return tag[:-1] + f' aria-labelledby="lien-{slug}">' + body + '</a>'
    return re.sub(r'(<a class="lesson-card"[^>]*>)([\s\S]*?)</a>', card, text)


def coverage(text):
    """Carte de couverture : « Leçon », « Exercices », « Reprise ciblée » par notion."""
    def article(match):
        block = match.group(0)
        title = re.search(r'<h3>([\s\S]*?)</h3>', block)
        if not title or 'sr-only' in block:
            return block
        name = plain(title.group(1))
        return re.sub(r'(<a href="[^"]*">)(Leçon|Exercices|Reprise ciblée)</a>', lambda m: m.group(1) + m.group(2) + hidden(name) + '</a>', block)
    text = re.sub(r'<article class="evo-card">[\s\S]*?</article>', article, text)
    # « Texte officiel applicable » : un par cohorte, nommée par le titre qui précède.
    def official(match):
        return match.group(1) + match.group(2) + match.group(3) + match.group(4) + 'Texte officiel applicable' + hidden(plain(match.group(2))) + '</a>'
    return re.sub(r'(<h3>)([^<]+)(</h3><p>[^<]*)(<a href="[^"]+">)Texte officiel applicable</a>', official, text)


def by_target(root, page, text, label):
    """Liens dont le texte est identique : on ajoute le titre de la leçon visée."""
    def link(match):
        title = lesson_title(root, page, match.group(2))
        return match.group(1) + label + (hidden(title) if title else '') + '</a>'
    return re.sub(r'(<a href="([^"]+)">)' + re.escape(label) + '</a>', link, text)


def program_rows(text):
    """Programme de Terminale : « 6 exercices » nommé par la leçon de la même ligne."""
    return re.sub(r'(<td><a href="[^"]+">)([^<]+)(</a></td><td><a href="[^"]+">)(6 exercices)</a>',
                  lambda m: m.group(1) + m.group(2) + m.group(3) + m.group(4) + hidden(re.sub(r'^\d+ · ', '', m.group(2))) + '</a>', text)


def apply(root: Path):
    jobs = {
        'lecons.html': cards, 'exercices.html': cards, 'terminale/lecons.html': cards, 'terminale/exercices.html': cards,
        'couverture.html': coverage, 'terminale/programme.html': program_rows,
        'entrainement/problemes.html': lambda t, p=root / 'entrainement/problemes.html': by_target(root, p, t, 'Revoir la leçon associée'),
        'cours/python-tableur.html': lambda t, p=root / 'cours/python-tableur.html': by_target(root, p, t, 'cours mathématique sans programmation'),
    }
    for rel, job in jobs.items():
        path = root / rel
        text = path.read_text(encoding='utf-8')
        new = job(text)
        if new != text:
            path.write_text(new, encoding='utf-8')


if __name__ == '__main__':
    apply(Path(__file__).resolve().parents[1])
