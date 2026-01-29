import type { CanvasPack } from "@mydatacanvas/canvas-schema";
import { sha256 } from "../utils/hash";

export type DiffResult = {
  changed_sections: string[];
  changed_chunks: string[];
  impacted_artifacts: string[];
};

function hashSectionText(text: string): string {
  return sha256(text);
}

export function diffPacks(oldPack: CanvasPack, newPack: CanvasPack): DiffResult {
  const changedSections: string[] = [];
  const changedChunks: string[] = [];
  const impactedArtifacts: Set<string> = new Set();

  if (oldPack.structure.sections && newPack.structure.sections) {
    const oldMap = new Map(oldPack.structure.sections.map((s) => [s.section_id, s]));
    for (const section of newPack.structure.sections) {
      const old = oldMap.get(section.section_id);
      if (!old || hashSectionText(old.text) !== hashSectionText(section.text)) {
        changedSections.push(section.section_id);
      }
    }
  }

  const oldChunkIds = new Set(oldPack.chunks.map((c) => c.chunk_id));
  for (const chunk of newPack.chunks) {
    if (!oldChunkIds.has(chunk.chunk_id)) {
      changedChunks.push(chunk.chunk_id);
    }
  }

  const markArtifact = (name: string, citations: { doc_sha256?: string }[]) => {
    if (citations.length) impactedArtifacts.add(name);
  };

  newPack.artifacts.summaries?.items.forEach((item) => markArtifact("summaries", item.citations));
  newPack.artifacts.runbook?.steps.forEach((step) => markArtifact("runbook", step.citations));
  newPack.artifacts.flowcharts?.nodes.forEach((node) => markArtifact("flowcharts", node.citations));
  newPack.artifacts.tables?.tables.forEach((table) => markArtifact("tables", table.rows.flatMap((row) => row.citations)));

  return {
    changed_sections: changedSections,
    changed_chunks: changedChunks,
    impacted_artifacts: Array.from(impactedArtifacts)
  };
}
