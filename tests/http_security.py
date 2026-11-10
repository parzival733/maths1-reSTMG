"""En-têtes réels de Pages pour les tests HTTP locaux du site."""
from http.server import SimpleHTTPRequestHandler
from pathlib import Path


class SecurityHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Pages envoie cet en-tête par défaut. Les directives « ! » doivent
        # bien le retirer, plutôt que de seulement ajouter d'autres en-têtes.
        headers = {'Access-Control-Allow-Origin': '*'}
        active = False
        for line in (Path(self.directory) / '_headers').read_text().splitlines():
            if not line.strip() or line.lstrip().startswith('#'):
                continue
            if not line.startswith((' ', '\t')):
                active = line.strip() == '/*'
            elif active:
                rule = line.strip()
                if rule.startswith('! '):
                    headers.pop(rule[2:], None)
                else:
                    name, value = rule.split(':', 1)
                    headers[name] = value.strip()
        for name, value in headers.items():
            self.send_header(name, value)
        super().end_headers()
