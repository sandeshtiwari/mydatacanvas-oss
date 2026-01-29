import fs from "fs";
import path from "path";
import { sha256 } from "../utils/hash";
import { normalizeWhitespace, titleFromFilename } from "../utils/text";

async function loadPdfJs() {
  // pdfjs-dist v4 ships ESM modules
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  return pdfjs;
}

export type PdfIngestResult = {
  title: string;
  sha256: string;
  pages: { page_number: number; text: string }[];
};

export async function ingestPdfFromBuffer(
  buffer: Buffer,
  filename = "document.pdf"
): Promise<PdfIngestResult> {
  const pdfjs = await loadPdfJs();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfjsDistPath = require.resolve("pdfjs-dist/package.json");
  const standardFontDataUrl = path.join(path.dirname(pdfjsDistPath), "standard_fonts/");
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data, disableWorker: true, standardFontDataUrl } as any);
  const pdf = await loadingTask.promise;
  const pages: { page_number: number; text: string }[] = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = (content.items as Array<{ str?: string }>)
      .map((item) => item.str || "")
      .join(" ");
    pages.push({
      page_number: i,
      text: normalizeWhitespace(text)
    });
  }

  return {
    title: titleFromFilename(path.basename(filename)),
    sha256: sha256(buffer),
    pages
  };
}

export async function ingestPdfFromFile(filePath: string): Promise<PdfIngestResult> {
  const buffer = await fs.promises.readFile(filePath);
  return ingestPdfFromBuffer(buffer, path.basename(filePath));
}
