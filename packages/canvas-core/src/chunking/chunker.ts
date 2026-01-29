import { sha256 } from "../utils/hash";
import type { CanvasPack, Chunk, CitationRef } from "@mydatacanvas/canvas-schema";

type ChunkerOptions = {
  chunkSize?: number;
  overlap?: number;
};

function makeChunkId(docSha: string, loc: CitationRef, text: string): string {
  return sha256(`${docSha}:${loc.kind}:${loc.page ?? ""}:${loc.section_id ?? ""}:${loc.char_start}:${loc.char_end}:${text}`);
}

function chunkText(text: string, chunkSize: number, overlap: number): Array<{ start: number; end: number; text: string }> {
  const chunks: Array<{ start: number; end: number; text: string }> = [];
  let index = 0;
  while (index < text.length) {
    const end = Math.min(index + chunkSize, text.length);
    const slice = text.slice(index, end);
    chunks.push({ start: index, end, text: slice });
    if (end >= text.length) break;
    index = Math.max(0, end - overlap);
  }
  return chunks;
}

export function buildChunks(pack: CanvasPack, options: ChunkerOptions = {}): Chunk[] {
  const chunkSize = options.chunkSize ?? 1000;
  const overlap = options.overlap ?? 200;
  const chunks: Chunk[] = [];

  if (pack.source.type === "pdf" && pack.structure.pages) {
    for (const page of pack.structure.pages) {
      const pageChunks = chunkText(page.text, chunkSize, overlap);
      for (const chunk of pageChunks) {
        const loc: CitationRef = {
          doc_sha256: pack.source.sha256,
          kind: "pdf_page",
          page: page.page_number,
          char_start: chunk.start,
          char_end: chunk.end,
          excerpt: chunk.text.slice(0, 200),
          confidence: 1
        };
        chunks.push({
          chunk_id: makeChunkId(pack.source.sha256, loc, chunk.text),
          text: chunk.text,
          loc
        });
      }
    }
  }

  if (pack.source.type !== "pdf" && pack.structure.sections) {
    for (const section of pack.structure.sections) {
      const sectionChunks = chunkText(section.text, chunkSize, overlap);
      for (const chunk of sectionChunks) {
        const loc: CitationRef = {
          doc_sha256: pack.source.sha256,
          kind: pack.source.type === "epub" ? "epub_location" : "text_location",
          section_id: section.section_id,
          char_start: chunk.start,
          char_end: chunk.end,
          excerpt: chunk.text.slice(0, 200),
          confidence: 1
        };
        chunks.push({
          chunk_id: makeChunkId(pack.source.sha256, loc, chunk.text),
          text: chunk.text,
          loc
        });
      }
    }
  }

  return chunks;
}
