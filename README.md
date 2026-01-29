# MyDataCanvas OSS

MyDataCanvas OSS turns long documents into a portable **CanvasPack** with citations and visual artifacts (outline, summaries, flowcharts, runbooks, tables).

Supported inputs:
- **PDF** → page-level citations
- **EPUB** → chapter/location citations
- **Text** → character-range citations

> **No DRM removal.** Only DRM‑free PDFs/EPUBs and user‑provided text are supported.

## Quickstart

```bash
cd oss
npm ci
npm run build
npm run test
```

### CLI

```bash
node packages/canvas-cli/dist/index.js ingest examples/sample.epub --out /tmp/book.pack.json
node packages/canvas-cli/dist/index.js runbook /tmp/book.pack.json --out /tmp/runbook.md
node packages/canvas-cli/dist/index.js view /tmp/book.pack.json
```

Sample files:
- `oss/examples/sample.pdf`
- `oss/examples/sample.epub`
- `oss/examples/sample.txt`

`canvas view` starts a local viewer (no auth) that lets you click citations to see excerpts.

### Expected outputs

You’ll get:
- `*.pack.json` CanvasPack with pages/sections, chunks, artifacts, citations
- Markdown artifacts (runbook, outline, tables)
- Mermaid flowchart (`.mmd`)

## Packages

- `@mydatacanvas/canvas-schema` — CanvasPack JSON schema + runtime validator
- `@mydatacanvas/canvas-core` — ingestion, chunking, citations, generators
- `@mydatacanvas/canvas-cli` — CLI wrapper
- `@mydatacanvas/canvas-viewer` — minimal local viewer

## License

Apache-2.0. See `LICENSE`.
