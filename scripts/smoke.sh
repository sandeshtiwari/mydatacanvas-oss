#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TMPDIR="$(mktemp -d 2>/dev/null || mktemp -d -t canvaspack)"
cleanup() {
  rm -rf "$TMPDIR"
}
trap cleanup EXIT

CLI="node packages/canvas-cli/dist/index.js"

echo "Using temp dir: $TMPDIR"

$CLI ingest examples/sample.pdf --out "$TMPDIR/pdf.pack.json"
$CLI ingest examples/sample.epub --out "$TMPDIR/epub.pack.json"
$CLI ingest examples/sample.txt --out "$TMPDIR/txt.pack.json"

$CLI outline "$TMPDIR/epub.pack.json" --out "$TMPDIR/outline.md"
$CLI summarize "$TMPDIR/epub.pack.json" --out "$TMPDIR/summaries.md"
$CLI runbook "$TMPDIR/epub.pack.json" --out "$TMPDIR/runbook.md"
$CLI flow "$TMPDIR/epub.pack.json" --out "$TMPDIR/flow.mmd"
$CLI table "$TMPDIR/epub.pack.json" --out "$TMPDIR/tables.md"

$CLI ask "$TMPDIR/epub.pack.json" "What is this book about?" --out "$TMPDIR/answer.md"
$CLI validate "$TMPDIR/epub.pack.json" --fail-on error --out "$TMPDIR/validation.json"
$CLI diff "$TMPDIR/epub.pack.json" "$TMPDIR/txt.pack.json" --out "$TMPDIR/diff.md"

for file in outline.md summaries.md runbook.md flow.mmd tables.md answer.md diff.md; do
  if [[ ! -s "$TMPDIR/$file" ]]; then
    echo "Missing or empty output: $file" >&2
    exit 1
  fi
done

echo "Smoke test outputs generated in $TMPDIR"
