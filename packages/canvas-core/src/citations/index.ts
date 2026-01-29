import type { CanvasPack, CitationRef } from "@mydatacanvas/canvas-schema";

export function extractExcerpt(pack: CanvasPack, citation: CitationRef): string {
  if (citation.kind === "pdf_page" && pack.structure.pages) {
    const page = pack.structure.pages.find((p) => p.page_number === citation.page);
    if (!page) return "";
    return page.text.slice(citation.char_start, citation.char_end);
  }

  if (citation.kind === "epub_location" && pack.structure.sections) {
    const section = pack.structure.sections.find((s) => s.section_id === citation.section_id);
    if (!section) return "";
    return section.text.slice(citation.char_start, citation.char_end);
  }

  if (citation.kind === "text_location" && pack.structure.sections) {
    const section = pack.structure.sections[0];
    if (!section) return "";
    return section.text.slice(citation.char_start, citation.char_end);
  }

  return "";
}

export function normalizeCitation(pack: CanvasPack, citation: CitationRef): CitationRef {
  const excerpt = extractExcerpt(pack, citation);
  return {
    ...citation,
    excerpt: excerpt || citation.excerpt
  };
}

export function makeCitationFromChunk(chunk: { loc: CitationRef }): CitationRef {
  return { ...chunk.loc };
}
