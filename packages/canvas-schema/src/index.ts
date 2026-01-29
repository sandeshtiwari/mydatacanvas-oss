import { z } from "zod";
import type { CanvasPack } from "./types";

const citationRefSchema = z.object({
  doc_sha256: z.string(),
  kind: z.enum(["pdf_page", "epub_location", "text_location"]),
  page: z.number().int().min(1).optional(),
  section_id: z.string().optional(),
  char_start: z.number().int().min(0),
  char_end: z.number().int().min(0),
  excerpt: z.string(),
  confidence: z.number().min(0).max(1)
});

const pageSchema = z.object({
  page_number: z.number().int().min(1),
  text: z.string()
});

const sectionSchema = z.object({
  section_id: z.string(),
  title: z.string(),
  order: z.number().int(),
  text: z.string()
});

const chunkSchema = z.object({
  chunk_id: z.string(),
  text: z.string(),
  loc: citationRefSchema
});

const outlineSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    citations: z.array(citationRefSchema)
  }))
});

const summariesSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    text: z.string(),
    citations: z.array(citationRefSchema)
  }))
});

const runbookSchema = z.object({
  steps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    instructions: z.array(z.string()),
    citations: z.array(citationRefSchema)
  }))
});

const flowchartsSchema = z.object({
  mermaid: z.string(),
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    citations: z.array(citationRefSchema)
  }))
});

const tablesSchema = z.object({
  markdown: z.string().optional(),
  csv: z.string().optional(),
  tables: z.array(z.object({
    id: z.string(),
    title: z.string(),
    rows: z.array(z.object({
      cells: z.array(z.string()),
      citations: z.array(citationRefSchema)
    }))
  }))
});

const qaSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    question: z.string(),
    citations: z.array(citationRefSchema)
  }))
});

const evidenceGraphSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    kind: z.string()
  })),
  edges: z.array(z.object({
    from: z.string(),
    to: z.string(),
    type: z.string()
  }))
});

const validationSchema = z.object({
  claims: z.array(z.object({
    id: z.string(),
    verdict: z.enum(["supported", "unsupported", "unclear", "missing_citations"]),
    message: z.string(),
    citations: z.array(citationRefSchema).optional()
  }))
});

const canvasPackSchema = z.object({
  pack_version: z.literal("0.1.0"),
  created_at: z.string(),
  source: z.object({
    type: z.enum(["pdf", "epub", "text"]),
    title: z.string(),
    original_filename: z.string(),
    sha256: z.string(),
    author: z.string().optional()
  }),
  structure: z.object({
    pages: z.array(pageSchema).optional(),
    sections: z.array(sectionSchema).optional()
  }),
  chunks: z.array(chunkSchema),
  artifacts: z.object({
    outline: outlineSchema.optional(),
    summaries: summariesSchema.optional(),
    runbook: runbookSchema.optional(),
    flowcharts: flowchartsSchema.optional(),
    tables: tablesSchema.optional(),
    qa: qaSchema.optional()
  }),
  evidence_graph: evidenceGraphSchema,
  validation: validationSchema,
  metadata: z.object({
    generator_versions: z.record(z.string()).optional(),
    provider: z.string().optional(),
    config: z.record(z.unknown()).optional()
  })
});

export const CanvasPackSchema = canvasPackSchema;

export function validateCanvasPack(obj: unknown): CanvasPack {
  return canvasPackSchema.parse(obj) as CanvasPack;
}

export type { CanvasPack };
export type {
  CitationRef,
  Chunk,
  Page,
  Section,
  OutlineNode,
  SummaryItem,
  RunbookStep,
  FlowchartNode,
  Table,
  QaItem,
  ClaimValidationResult
} from "./types";
