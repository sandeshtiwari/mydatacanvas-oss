import type { CanvasPack, QaItem } from "@mydatacanvas/canvas-schema";
import { makeCitationFromChunk } from "../citations";

export function generateQaSeeds(pack: CanvasPack): { items: QaItem[] } {
  const items: QaItem[] = [];

  if (pack.structure.sections) {
    for (const section of pack.structure.sections) {
      const chunk = pack.chunks.find((c) => c.loc.section_id === section.section_id);
      items.push({
        id: `qa_${section.section_id}`,
        question: `What does "${section.title}" cover?`,
        citations: chunk ? [makeCitationFromChunk(chunk)] : []
      });
    }
    return { items };
  }

  if (pack.structure.pages) {
    for (const page of pack.structure.pages) {
      const chunk = pack.chunks.find((c) => c.loc.kind === "pdf_page" && c.loc.page === page.page_number);
      items.push({
        id: `qa_page_${page.page_number}`,
        question: `What is discussed on page ${page.page_number}?`,
        citations: chunk ? [makeCitationFromChunk(chunk)] : []
      });
    }
  }

  return { items };
}
