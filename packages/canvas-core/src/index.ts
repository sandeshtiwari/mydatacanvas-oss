import type { CanvasPack } from "@mydatacanvas/canvas-schema";
import { ingestPdfFromBuffer, ingestPdfFromFile } from "./ingest/pdf";
import { ingestEpubFromFile } from "./ingest/epub";
import { ingestPlainText } from "./ingest/text";
import { buildChunks } from "./chunking/chunker";
import { generateOutline } from "./generate/outline";
import { generateSummaries } from "./generate/summaries";
import { generateRunbook } from "./generate/runbook";
import { generateFlowchart } from "./generate/flow";
import { generateTables } from "./generate/tables";
import { generateQaSeeds } from "./generate/qa";
import { validatePack } from "./validate/validate";

export {
  ingestPdfFromBuffer,
  ingestPdfFromFile,
  ingestEpubFromFile,
  ingestPlainText,
  buildChunks,
  generateOutline,
  generateSummaries,
  generateRunbook,
  generateFlowchart,
  generateTables,
  generateQaSeeds
};

export { askQuestion } from "./ask/ask";
export { retrieveTopChunks } from "./retrieval";
export { validatePack } from "./validate/validate";
export { diffPacks } from "./diff/diff";
export { extractExcerpt, normalizeCitation, makeCitationFromChunk } from "./citations";
export * from "./providers";

export function createBasePack(params: {
  sourceType: "pdf" | "epub" | "text";
  title: string;
  originalFilename: string;
  sha256: string;
  pages?: { page_number: number; text: string }[];
  sections?: { section_id: string; title: string; order: number; text: string }[];
}): CanvasPack {
  const pack: CanvasPack = {
    pack_version: "0.1.0",
    created_at: new Date().toISOString(),
    source: {
      type: params.sourceType,
      title: params.title,
      original_filename: params.originalFilename,
      sha256: params.sha256
    },
    structure: {
      pages: params.pages,
      sections: params.sections
    },
    chunks: [],
    artifacts: {
      outline: { nodes: [] },
      summaries: { items: [] },
      runbook: { steps: [] },
      flowcharts: { mermaid: "", nodes: [] },
      tables: { tables: [] },
      qa: { items: [] }
    },
    evidence_graph: {
      nodes: [],
      edges: []
    },
    validation: {
      claims: []
    },
    metadata: {
      generator_versions: {
        "canvas-core": "0.1.0"
      },
      config: {}
    }
  };

  return pack;
}

export async function buildCanvasPackFromPdf(filePath: string): Promise<CanvasPack> {
  const result = await ingestPdfFromFile(filePath);
  const pack = createBasePack({
    sourceType: "pdf",
    title: result.title,
    originalFilename: filePath.split(/[/\\\\]/).pop() || filePath,
    sha256: result.sha256,
    pages: result.pages
  });
  pack.chunks = buildChunks(pack);
  pack.artifacts.outline = generateOutline(pack);
  pack.artifacts.summaries = generateSummaries(pack);
  pack.artifacts.runbook = generateRunbook(pack);
  pack.artifacts.flowcharts = generateFlowchart(pack);
  pack.artifacts.tables = generateTables(pack);
  pack.artifacts.qa = generateQaSeeds(pack);
  const report = validatePack(pack);
  pack.validation = { claims: report.claims };
  return pack;
}

export async function buildCanvasPackFromEpub(filePath: string): Promise<CanvasPack> {
  const result = await ingestEpubFromFile(filePath);
  const pack = createBasePack({
    sourceType: "epub",
    title: result.title,
    originalFilename: filePath.split(/[/\\\\]/).pop() || filePath,
    sha256: result.sha256,
    sections: result.sections
  });
  if (result.author) {
    pack.source.author = result.author;
  }
  pack.chunks = buildChunks(pack);
  pack.artifacts.outline = generateOutline(pack);
  pack.artifacts.summaries = generateSummaries(pack);
  pack.artifacts.runbook = generateRunbook(pack);
  pack.artifacts.flowcharts = generateFlowchart(pack);
  pack.artifacts.tables = generateTables(pack);
  pack.artifacts.qa = generateQaSeeds(pack);
  const report = validatePack(pack);
  pack.validation = { claims: report.claims };
  return pack;
}

export async function buildCanvasPackFromText(title: string, content: string): Promise<CanvasPack> {
  const result = ingestPlainText(content, title);
  const pack = createBasePack({
    sourceType: "text",
    title: result.title,
    originalFilename: `${title}.txt`,
    sha256: result.sha256,
    sections: result.sections
  });
  pack.chunks = buildChunks(pack);
  pack.artifacts.outline = generateOutline(pack);
  pack.artifacts.summaries = generateSummaries(pack);
  pack.artifacts.runbook = generateRunbook(pack);
  pack.artifacts.flowcharts = generateFlowchart(pack);
  pack.artifacts.tables = generateTables(pack);
  pack.artifacts.qa = generateQaSeeds(pack);
  const report = validatePack(pack);
  pack.validation = { claims: report.claims };
  return pack;
}
