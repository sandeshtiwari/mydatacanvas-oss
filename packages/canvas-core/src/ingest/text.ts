import { sha256 } from "../utils/hash";
import { extractLines, normalizeWhitespace } from "../utils/text";

export type TextIngestResult = {
  title: string;
  sha256: string;
  sections: { section_id: string; title: string; order: number; text: string }[];
};

export function ingestPlainText(content: string, title = "Untitled"): TextIngestResult {
  const lines = extractLines(content);
  const sections: { section_id: string; title: string; order: number; text: string }[] = [];
  let currentTitle = "Section 1";
  let currentLines: string[] = [];
  let order = 0;

  const flush = () => {
    if (!currentLines.length) return;
    sections.push({
      section_id: `section_${order + 1}`,
      title: currentTitle,
      order,
      text: normalizeWhitespace(currentLines.join("\n"))
    });
    order += 1;
    currentLines = [];
  };

  for (const line of lines) {
    if (line.startsWith("#") || /^[A-Z][A-Z\s\d]{4,}$/.test(line)) {
      flush();
      currentTitle = line.replace(/^#+\s*/, "").trim();
      continue;
    }
    currentLines.push(line);
  }

  flush();

  if (!sections.length) {
    sections.push({
      section_id: "section_1",
      title: "Section 1",
      order: 0,
      text: normalizeWhitespace(content)
    });
  }

  return {
    title,
    sha256: sha256(content),
    sections
  };
}
