import { describe, it, expect } from "vitest";
import { validateCanvasPack } from "./index";

describe("validateCanvasPack", () => {
  it("accepts a minimal valid pack", () => {
    const pack = validateCanvasPack({
      pack_version: "0.1.0",
      created_at: new Date().toISOString(),
      source: {
        type: "text",
        title: "Sample",
        original_filename: "sample.txt",
        sha256: "abc"
      },
      structure: {
        sections: [
          {
            section_id: "sec_1",
            title: "Section 1",
            order: 0,
            text: "Hello world."
          }
        ]
      },
      chunks: [
        {
          chunk_id: "chunk_1",
          text: "Hello world.",
          loc: {
            doc_sha256: "abc",
            kind: "text_location",
            char_start: 0,
            char_end: 12,
            excerpt: "Hello world.",
            confidence: 1
          }
        }
      ],
      artifacts: {
        outline: { nodes: [] },
        summaries: { items: [] },
        runbook: { steps: [] },
        flowcharts: { mermaid: "graph TD", nodes: [] },
        tables: { tables: [] }
      },
      evidence_graph: {
        nodes: [],
        edges: []
      },
      validation: {
        claims: []
      },
      metadata: {}
    });

    expect(pack.pack_version).toBe("0.1.0");
  });

  it("rejects missing required fields", () => {
    expect(() => validateCanvasPack({})).toThrow();
  });
});
