import type { CanvasPack, OutlineNode } from "@mydatacanvas/canvas-schema";
import { makeCitationFromChunk } from "../citations";

export function generateOutline(pack: CanvasPack): { nodes: OutlineNode[] } {
  const nodes: OutlineNode[] = [];

  if (pack.source.type === "pdf" && pack.structure.pages) {
    for (const page of pack.structure.pages) {
      const chunk = pack.chunks.find((c) => c.loc.kind === "pdf_page" && c.loc.page === page.page_number);
      nodes.push({
        id: `page_${page.page_number}`,
        title: `Page ${page.page_number}`,
        citations: chunk ? [makeCitationFromChunk(chunk)] : []
      });
    }
    return { nodes };
  }

  if (pack.structure.sections) {
    for (const section of pack.structure.sections) {
      const chunk = pack.chunks.find((c) => c.loc.section_id === section.section_id);
      nodes.push({
        id: section.section_id,
        title: section.title || "Section",
        citations: chunk ? [makeCitationFromChunk(chunk)] : []
      });
    }
  }

  return { nodes };
}
