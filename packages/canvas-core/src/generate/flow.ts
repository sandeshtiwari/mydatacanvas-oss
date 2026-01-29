import type { CanvasPack, FlowchartNode } from "@mydatacanvas/canvas-schema";
import { makeCitationFromChunk } from "../citations";

export function generateFlowchart(pack: CanvasPack): { mermaid: string; nodes: FlowchartNode[] } {
  const nodes: FlowchartNode[] = [];
  const lines: string[] = ["graph TD"];

  if (pack.artifacts.runbook && pack.artifacts.runbook.steps.length) {
    const steps = pack.artifacts.runbook.steps;
    for (let i = 0; i < steps.length; i += 1) {
      const step = steps[i];
      const nodeId = `S${i + 1}`;
      nodes.push({
        id: nodeId,
        label: step.title,
        citations: step.citations
      });
      lines.push(`${nodeId}["${step.title.replace(/"/g, "'")}"]`);
      if (i < steps.length - 1) {
        const nextId = `S${i + 2}`;
        lines.push(`${nodeId} --> ${nextId}`);
      }
    }
    return { mermaid: lines.join("\n"), nodes };
  }

  if (pack.structure.sections) {
    for (const section of pack.structure.sections) {
      const nodeId = section.section_id.replace(/[^a-zA-Z0-9_]/g, "_");
      const chunk = pack.chunks.find((c) => c.loc.section_id === section.section_id);
      nodes.push({
        id: nodeId,
        label: section.title,
        citations: chunk ? [makeCitationFromChunk(chunk)] : []
      });
      lines.push(`${nodeId}["${section.title.replace(/"/g, "'")}"]`);
    }
    for (let i = 0; i < nodes.length - 1; i += 1) {
      lines.push(`${nodes[i].id} --> ${nodes[i + 1].id}`);
    }
    return { mermaid: lines.join("\n"), nodes };
  }

  return { mermaid: "graph TD\nA[No data]", nodes };
}
