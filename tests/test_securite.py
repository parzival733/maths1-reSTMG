"""La publication ne doit contenir que les ressources destinées au navigateur."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('build_public', ROOT / 'tools/build_public.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class PublicationSecurity(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.original = build.ROOT, build.OUT
        self.addCleanup(self.restore)
        build.ROOT = Path(self.temp.name)
        build.OUT = build.ROOT / 'public'
        for name in build.ROOT_FILES:
            self.write(name, '')
        self.write('index.html', '<script src="assets/app.js" defer></script>')
        self.write('assets/app.js', '"use strict";')

    def restore(self):
        build.ROOT, build.OUT = self.original

    def write(self, name, text):
        path = build.ROOT / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
        return path

    def test_only_public_files_and_font_licenses(self):
        for name in ('README.md', 'tools/build.py', 'tests/test.py', '.env',
                     '.github/workflows/test.yml', 'donnees/private.json',
                     'assets/fonts/LISEZMOI.md'):
            self.write(name, 'interne')
        for name in build.FONT_LICENSES:
            self.write('assets/fonts/' + name, 'licence')
        self.write('donnees/table.csv', 'annee,nombre\n2023,678')
        self.write('index.html', '<script src="assets/app.js" defer></script>'
                               '<a href="donnees/table.csv">Données</a>')
        build.main()
        actual = {p.relative_to(build.OUT).as_posix()
                  for p in build.OUT.rglob('*') if p.is_file()}
        expected = set(build.ROOT_FILES) | {'index.html', 'assets/app.js', 'donnees/table.csv'}
        expected |= {'assets/fonts/' + name for name in build.FONT_LICENSES}
        self.assertEqual(actual, expected)

    def test_sensitive_asset_or_source_map_stops_build(self):
        for name in ('assets/.env', 'assets/.cache/code.js', 'assets/config.json',
                     'assets/app.js.map', 'assets/archive.zip', 'assets/build.py'):
            with self.subTest(name=name):
                path = self.write(name, 'interne')
                with self.assertRaises(ValueError):
                    build.main()
                path.unlink()
                if path.parent.name == '.cache':
                    path.parent.rmdir()

    def test_symlink_file_and_folder_stop_build(self):
        for directory in (False, True):
            with self.subTest(directory=directory):
                target = build.ROOT / ('internal' if directory else 'private.js')
                if directory:
                    target.mkdir()
                    (target / 'file.js').write_text('interne')
                else:
                    target.write_text('interne')
                link = build.ROOT / 'assets' / ('linked' if directory else 'linked.js')
                link.symlink_to(target, target_is_directory=directory)
                with self.assertRaises(ValueError):
                    build.main()
                link.unlink()

    def test_link_to_internal_data_stops_build(self):
        self.write('donnees/private.json', '{"interne":true}')
        self.write('index.html', '<a href="donnees/private.json">Interne</a>')
        with self.assertRaises(ValueError):
            build.main()

    def test_public_source_path_cannot_escape_repository(self):
        for name in ('../private.js', '/tmp/private.js'):
            with self.subTest(name=name), self.assertRaises(ValueError):
                build.check_source(name)


class SecurityHeaders(unittest.TestCase):
    def test_browser_protections(self):
        content = (ROOT / '_headers').read_text(encoding='utf-8').split('/404')[0]
        headers = dict(line.strip().split(': ', 1) for line in content.splitlines()[1:] if line.strip())
        self.assertEqual(headers['X-Content-Type-Options'], 'nosniff')
        self.assertEqual(headers['X-Frame-Options'], 'DENY')
        self.assertEqual(headers['Cross-Origin-Opener-Policy'], 'same-origin')
        self.assertEqual(headers['Cross-Origin-Resource-Policy'], 'same-origin')
        self.assertEqual(headers['Strict-Transport-Security'], 'max-age=31536000')
        csp = dict(part.strip().split(' ', 1) for part in headers['Content-Security-Policy'].split(';'))
        for name in ('script-src', 'connect-src', 'form-action'):
            self.assertEqual(csp[name], "'self'")
        for name in ('object-src', 'base-uri', 'frame-ancestors', 'frame-src', 'worker-src'):
            self.assertEqual(csp[name], "'none'")


if __name__ == '__main__':
    unittest.main()
