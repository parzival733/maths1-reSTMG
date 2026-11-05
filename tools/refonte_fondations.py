"""Refonte graphique, fondations : remplace les couleurs écrites en dur et les tailles de
texte trop petites des feuilles de style par les jetons de assets/tokens.css.

    python3 tools/refonte_fondations.py          # applique, puis affiche le bilan
    python3 tools/refonte_fondations.py --bilan  # bilan seulement

Chaque couleur est classée par famille de teinte (neutre, apprendre, s'entraîner,
erreur, attention) et par luminosité, puis remplacée par le jeton du même rôle.
Les quatre couleurs de domaine des leçons (sarcelle, bleu, rose, violet) se fondent
ainsi dans le violet et le vert. Les textes de lecture passent à 14 px au moins, les
surtitres en capitales à 13 px ; les mini-textes de l'illustration de l'accueil restent
inchangés (ils font partie du dessin). Idempotent : une seconde exécution ne change rien.
"""
from pathlib import Path
import colorsys, re, sys

ROOT = Path(__file__).resolve().parents[1]
FILES = [p for p in sorted((ROOT / 'assets').glob('*.css')) if p.name != 'tokens.css']
# Illustration de l'accueil : ni ses couleurs ni ses mini-textes ne changent.
ART = re.compile(r'\.(hero-art|art-[\w-]+|graph-[\w-]+|status-label)\b')
CAPS = re.compile(r'eyebrow|kicker|course-code|guide-number|step-number|level-badge|subject-label|study-eyebrow|card-number|::before')

FAMILY_TOKENS = {
    'learn':    ['--color-learn-faint', '--color-learn-soft', '--color-learn-line', '--color-learn', '--color-learn-strong'],
    'practice': ['--color-practice-faint', '--color-practice-soft', '--color-practice-line', '--color-practice', '--color-practice-strong'],
    'danger':   ['--color-danger-soft', '--color-danger-soft', '--color-danger-line', '--color-danger', '--color-danger-strong'],
    'warning':  ['--color-warning-soft', '--color-warning-soft', '--color-warning-line', '--color-warning-line', '--color-warning'],
}


def rgb(hexa):
    h = hexa.lstrip('#')
    if len(h) in (3, 4):
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)), (int(h[6:8], 16) / 255 if len(h) == 8 else 1)


def family(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if s < 0.14 or max(r, g, b) - min(r, g, b) < 0.03:
        return 'neutral', l
    hue = h * 360
    if hue >= 345 or hue < 15:
        return 'danger', l
    if hue < 65:
        return 'warning', l
    if hue < 195:
        return 'practice', l
    return 'learn', l


def token_for(prop, hexa):
    (r, g, b), alpha = rgb(hexa)
    fam, l = family(r, g, b)
    if fam == 'neutral':
        if l >= 0.995:
            name = '--color-on-accent' if prop == 'color' else '--color-surface'
        elif l <= 0.02:
            name = '--color-text'
        elif l >= 0.965:
            name = '--color-bg'
        elif l >= 0.93:
            name = '--color-surface-sunken'
        elif l >= 0.80:
            name = '--color-line'
        elif l >= 0.55:
            name = '--color-text-muted' if prop == 'color' else '--color-line-strong'
        elif l >= 0.30:
            name = '--color-text-muted'
        else:
            name = '--color-text'
    else:
        steps = FAMILY_TOKENS[fam]
        index = 0 if l >= 0.965 else 1 if l >= 0.90 else 2 if l >= 0.62 else 3 if l >= 0.36 else 4
        if prop == 'color' and index < 3:   # un texte coloré reste lisible : jamais une teinte claire
            index = 3
        name = steps[index]
    value = f'var({name})'
    if alpha < 1:
        value = f'color-mix(in srgb, {value} {round(alpha * 100)}%, transparent)'
    return value


def replace_colors(css):
    def rule(match):
        selector, body = match.group(1), match.group(2)
        if ART.search(selector):
            return match.group(0)
        return selector + '{' + replace_declarations(body) + '}'
    return re.sub(r'([^{}]+)\{([^{}]*)\}', rule, css)


def replace_declarations(css):
    def declaration(match):
        prop, value = match.group(1), match.group(2)
        if prop.startswith('--'):   # anciennes variables : traitées plus bas
            return match.group(0)
        new = re.sub(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b', lambda m: token_for(prop, m.group(0)), value)
        if 'url(' not in new:   # mots-clés white et black : mêmes jetons que #fff et #000
            new = re.sub(r'(?<![\w-])(white|black)(?![\w-])', lambda m: token_for(prop, '#ffffff' if m.group(1) == 'white' else '#000000'), new)
        return f'{prop}:{new}' if match.group(0)[len(prop)] == ':' else f'{prop}: {new}'
    return re.sub(r'(?<![\w-])((?:background|border|outline|box-shadow|text-decoration|fill|stroke|caret)[a-z-]*|color)\s*:\s*([^;{}]*(?:#[0-9a-fA-F]{3,8}\b|(?<![\w-])(?:white|black)(?![\w-]))[^;{}]*)', declaration, css)


LEGACY = {  # anciennes variables, redirigées vers les jetons
    '--bg': 'var(--color-bg)', '--surface': 'var(--color-surface)', '--ink': 'var(--color-text)',
    '--muted': 'var(--color-text-muted)', '--line': 'var(--color-line)', '--purple': 'var(--color-learn)',
    '--purple-dark': 'var(--color-learn-strong)', '--purple-soft': 'var(--color-learn-soft)',
    '--green': 'var(--color-practice)', '--green-soft': 'var(--color-practice-soft)',
    '--learn-accent': 'var(--color-learn)', '--learn-accent-dark': 'var(--color-learn-strong)',
    '--learn-accent-soft': 'var(--color-learn-soft)', '--learn-bg': 'var(--color-bg)',
    '--learn-ink': 'var(--color-text)', '--learn-muted': 'var(--color-text-muted)',
    '--exercise': 'var(--color-practice)', '--exercise-dark': 'var(--color-practice-strong)',
    '--exercise-soft': 'var(--color-practice-soft)', '--exercise-line': 'var(--color-practice-line)',
    '--success': 'var(--color-success)', '--success-soft': 'var(--color-success-soft)',
    '--error': 'var(--color-danger)', '--error-soft': 'var(--color-danger-soft)',
    '--card-color': 'var(--color-learn)',   # une seule couleur pour les cartes de domaine
}


def replace_legacy(css):
    def one(match):
        name = match.group(1)
        return f'{name}: {LEGACY[name]}' if name in LEGACY else match.group(0)
    return re.sub(r'(--[a-z-]+)\s*:\s*#[0-9a-fA-F]{3,8}\b', one, css)


def replace_sizes(css):
    def rule(match):
        selector, body = match.group(1), match.group(2)
        if ART.search(selector):
            return match.group(0)
        def size(m):
            px = float(m.group(1))
            if px >= 14:
                return m.group(0)
            caps = 'uppercase' in body or CAPS.search(selector)
            return 'font-size: ' + ('var(--text-caps)' if caps and px <= 13 else 'var(--text-sm)')
        return selector + '{' + re.sub(r'font-size:\s*([\d.]+)px', size, body) + '}'
    return re.sub(r'([^{}]+)\{([^{}]*)\}', rule, css)


def hex_count(css):
    return len(set(h.lower() for h in re.findall(r'#[0-9a-fA-F]{3,8}\b', css)))


def main():
    before = {p.name: p.read_text(encoding='utf-8') for p in FILES}
    if '--bilan' not in sys.argv:
        for p in FILES:
            css = before[p.name]
            css = replace_sizes(replace_colors(replace_legacy(css)))
            if css != before[p.name]:
                p.write_text(css, encoding='utf-8')
    after = {p.name: p.read_text(encoding='utf-8') for p in FILES}
    distinct = set()
    for css in after.values():
        distinct |= set(h.lower() for h in re.findall(r'#[0-9a-fA-F]{3,8}\b', re.sub(r'/\*[\s\S]*?\*/', '', css)))
    small = sum(len([1 for v in re.findall(r'font-size:\s*([\d.]+)px', css) if float(v) < 14]) for css in after.values())
    print(f'Couleurs hexadécimales distinctes restantes : {len(distinct)} ; tailles < 14 px restantes : {small} (illustration de l\'accueil).')
    if distinct:
        print('  ', ' '.join(sorted(distinct)))


if __name__ == '__main__':
    main()
