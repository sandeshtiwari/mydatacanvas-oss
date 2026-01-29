import type { CanvasPack, ClaimValidationResult } from "@mydatacanvas/canvas-schema";

export type ValidationReport = {
  claims: ClaimValidationResult[];
  summary: {
    total: number;
    missing_citations: number;
  };
};

export function validatePack(pack: CanvasPack): ValidationReport {
  const claims: ClaimValidationResult[] = [];

  const checkCitations = (id: string, citations?: unknown[]) => {
    if (!citations || citations.length === 0) {
      claims.push({
        id,
        verdict: "missing_citations",
        message: "Missing citations."
      });
    }
  };

  pack.artifacts.summaries?.items.forEach((item) => checkCitations(item.id, item.citations));
  pack.artifacts.runbook?.steps.forEach((step) => checkCitations(step.id, step.citations));
  pack.artifacts.flowcharts?.nodes.forEach((node) => checkCitations(node.id, node.citations));
  pack.artifacts.tables?.tables.forEach((table) => {
    table.rows.forEach((row, index) => checkCitations(`${table.id}_row_${index}`, row.citations));
  });

  const missing = claims.filter((c) => c.verdict === "missing_citations").length;
  return {
    claims,
    summary: {
      total: claims.length,
      missing_citations: missing
    }
  };
}
