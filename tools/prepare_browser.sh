#!/bin/sh
set -eu
python3 -m pip install --quiet --retries 2 --timeout 30 playwright==1.55.0
BROWSER="$(command -v google-chrome || command -v chromium || true)"
if [ -z "$BROWSER" ]; then
  echo 'No installed Chrome/Chromium; installing the pinned headless browser.'
  python3 -m playwright install chromium --only-shell
else
  export PLAYWRIGHT_CHROMIUM_EXECUTABLE="$BROWSER"
  if [ -n "${GITHUB_ENV:-}" ]; then printf 'PLAYWRIGHT_CHROMIUM_EXECUTABLE=%s\n' "$BROWSER" >> "$GITHUB_ENV"; fi
fi
python3 - <<'PYTEST'
import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    exe=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE')
    b=p.chromium.launch(**({'executable_path':exe} if exe else {}))
    print('Browser ready:',b.version)
    b.close()
PYTEST
