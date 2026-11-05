"""Noms accessibles des liens : dans une même page, deux liens qui portent le même nom
(texte visible et texte masqué, aria-label ou aria-labelledby) mènent à la même page.

Ce test lit le HTML statique, donc la version sans JavaScript.
"""
from html.parser import HTMLParser
from pathlib import Path
import posixpath
import re

ROOT = Path(__file__).resolve().parent.parent
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


class Links(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.open, self.named, self.links, self.ids, self.link = [], [], [], {}, None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img' and self.link is not None and attrs.get('alt'):
            self.link['text'] += ' ' + attrs['alt']
        if tag in VOID:
            return
        self.open.append((tag, attrs.get('aria-hidden') == 'true' or 'hidden' in attrs))
        if attrs.get('id'):
            self.named.append([attrs['id'], tag, ''])
        if tag == 'a' and 'href' in attrs:
            self.link = {'href': attrs['href'], 'label': attrs.get('aria-label'),
                         'by': attrs.get('aria-labelledby'), 'text': ''}

    def handle_endtag(self, tag):
        for i in range(len(self.open) - 1, -1, -1):
            if self.open[i][0] == tag:
                del self.open[i:]
                break
        if self.named and self.named[-1][1] == tag:
            ident, _, text = self.named.pop()
            self.ids[ident] = text
            for parent in self.named:
                parent[2] += text
        if tag == 'a' and self.link is not None:
            self.links.append(self.link)
            self.link = None

    def handle_data(self, data):
        if any(hidden for _, hidden in self.open):
            return
        if self.link is not None:
            self.link['text'] += data
        if self.named:
            self.named[-1][2] += data


def target(page, href):
    path, _, fragment = href.partition('#')
    if href.startswith(('http:', 'https:', 'mailto:')):
        return path
    if not path:
        return page + '#' + fragment
    return posixpath.normpath(posixpath.join(posixpath.dirname(page), path)) + ('#' + fragment if fragment else '')


def main():
    problems, pages = [], 0
    for path in sorted(ROOT.rglob('*.html')):
        rel = path.relative_to(ROOT).as_posix()
        if any(part.startswith('.') or part == 'docs' for part in rel.split('/')):
            continue
        pages += 1
        parser = Links()
        parser.feed(path.read_text(encoding='utf-8'))
        names = {}
        for link in parser.links:
            if link['label']:
                name = link['label']
            elif link['by']:
                name = ' '.join(parser.ids.get(i, '') for i in link['by'].split())
            else:
                name = link['text']
            name = re.sub(r'\s+', ' ', name).strip().lower()
            if name:
                names.setdefault(name, set()).add(target(rel, link['href']))
        problems += [(rel, name, sorted(found)) for name, found in names.items() if len(found) > 1]
    assert not problems, problems[:10]
    print(f'NOMS DE LIENS OK : {pages} pages, aucun nom de lien partagé par deux destinations.')


if __name__ == '__main__':
    main()
