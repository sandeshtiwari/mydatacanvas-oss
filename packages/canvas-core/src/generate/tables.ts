import type { CanvasPack, Table } from "@mydatacanvas/canvas-schema";
import { makeCitationFromChunk } from "../citations";

export function generateTables(pack: CanvasPack): { tables: Table[]; markdown?: string; csv?: string } {
  const tables: Table[] = [];

  if (pack.structure.sections) {
    const rows = pack.structure.sections.map((section) => {
      const wordCount = section.text.split(/\s+/).filter(Boolean).length;
      const chunk = pack.chunks.find((c) => c.loc.section_id === section.section_id);
      return {
        cells: [section.title, `${wordCount} words`],
        citations: chunk ? [makeCitationFromChunk(chunk)] : []
      };
    });
    tables.push({
      id: "sections_table",
      title: "Sections overview",
      rows
    });
  } else if (pack.structure.pages) {
    const rows = pack.structure.pages.map((page) => {
      const chunk = pack.chunks.find((c) => c.loc.kind === "pdf_page" && c.loc.page === page.page_number);
      return {
        cells: [`Page ${page.page_number}`, `${page.text.length} chars`],
        citations: chunk ? [makeCitationFromChunk(chunk)] : []
      };
    });
    tables.push({
      id: "pages_table",
      title: "Pages overview",
      rows
    });
  }

  if (!tables.length) {
    return { tables };
  }

  const primary = tables[0];
  const markdownLines = [
    `| ${primary.rows.length ? primary.rows[0].cells.map((_, index) => `Col ${index + 1}`).join(" | ") : "Column"} |`,
    `| ${primary.rows.length ? primary.rows[0].cells.map(() => "---").join(" | ") : "---"} |`,
    ...primary.rows.map((row) => `| ${row.cells.join(" | ")} |`)
  ];

  const csvLines = primary.rows.map((row) => row.cells.map((cell) => `"${cell.replace(/\"/g, '""')}"`).join(","));

  return {
    tables,
    markdown: markdownLines.join("\n"),
    csv: csvLines.join("\n")
  };
}
