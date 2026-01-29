import type { CanvasPack, SummaryItem } from "@mydatacanvas/canvas-schema";
import { splitSentences } from "../utils/text";
import { makeCitationFromChunk } from "../citations";

export function generateSummaries(pack: CanvasPack): { items: SummaryItem[] } {
  const items: SummaryItem[] = [];

  if (pack.source.type === "pdf" && pack.structure.pages) {
    for (const page of pack.structure.pages) {
      const sentences = splitSentences(page.text);
      if (!sentences.length) continue;
      const chunk = pack.chunks.find((c) => c.loc.kind === "pdf_page" && c.loc.page === page.page_number);
      items.push({
        id: `summary_page_${page.page_number}`,
        text: sentences[0],
        citations: chunk ? [makeCitationFromChunk(chunk)] : []
      });
    }
    return { items };
  }

  if (pack.structure.sections) {
    for (const section of pack.structure.sections) {
      const sentences = splitSentences(section.text);
      if (!sentences.length) continue;
      const chunk = pack.chunks.find((c) => c.loc.section_id === section.section_id);
      items.push({
        id: `summary_${section.section_id}`,
        text: sentences[0],
        citations: chunk ? [makeCitationFromChunk(chunk)] : []
      });
    }
  }

  return { items };
}
