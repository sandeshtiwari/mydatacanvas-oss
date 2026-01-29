#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

PATTERNS=(
  "from ['\"]@yourorg/"
  "from ['\"]@private/"
  "from ['\"]\.\./\.\./apps/"
  "from ['\"]\.\./\.\./backend"
  "from ['\"]\.\./\.\./frontend"
  "from ['\"]\.\./\.\./packages/"
)

# Check for @mydatacanvas/* imports that are NOT canvas-* packages.
if rg -n --glob '!**/node_modules/**' --glob '!**/dist/**' "from ['\"]@mydatacanvas/" packages | rg -v "@mydatacanvas/canvas-"; then
  echo "\nOSS import boundary violated: non-OSS @mydatacanvas/* import found" >&2
  exit 1
fi

for pattern in "${PATTERNS[@]}"; do
  if rg -n --glob '!**/node_modules/**' --glob '!**/dist/**' "$pattern" packages; then
    echo "\nOSS import boundary violated: $pattern" >&2
    exit 1
  fi
 done

exit 0
