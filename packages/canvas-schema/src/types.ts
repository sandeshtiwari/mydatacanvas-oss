export type SourceType = "pdf" | "epub" | "text";

export type CitationKind = "pdf_page" | "epub_location" | "text_location";

export type CitationRef = {
  doc_sha256: string;
  kind: CitationKind;
  page?: number;
  section_id?: string;
  char_start: number;
  char_end: number;
  excerpt: string;
  confidence: number;
};

export type Page = {
  page_number: number;
  text: string;
};

export type Section = {
  section_id: string;
  title: string;
  order: number;
  text: string;
};

export type Chunk = {
  chunk_id: string;
  text: string;
  loc: CitationRef;
};

export type OutlineNode = {
  id: string;
  title: string;
  citations: CitationRef[];
};

export type SummaryItem = {
  id: string;
  text: string;
  citations: CitationRef[];
};

export type RunbookStep = {
  id: string;
  title: string;
  instructions: string[];
  citations: CitationRef[];
};

export type FlowchartNode = {
  id: string;
  label: string;
  citations: CitationRef[];
};

export type TableRow = {
  cells: string[];
  citations: CitationRef[];
};

export type Table = {
  id: string;
  title: string;
  rows: TableRow[];
};

export type QaItem = {
  id: string;
  question: string;
  citations: CitationRef[];
};

export type EvidenceNode = {
  id: string;
  label: string;
  kind: string;
};

export type EvidenceEdge = {
  from: string;
  to: string;
  type: string;
};

export type ClaimValidationResult = {
  id: string;
  verdict: "supported" | "unsupported" | "unclear" | "missing_citations";
  message: string;
  citations?: CitationRef[];
};

export type CanvasPack = {
  pack_version: "0.1.0";
  created_at: string;
  source: {
    type: SourceType;
    title: string;
    original_filename: string;
    sha256: string;
    author?: string;
  };
  structure: {
    pages?: Page[];
    sections?: Section[];
  };
  chunks: Chunk[];
  artifacts: {
    outline?: { nodes: OutlineNode[] };
    summaries?: { items: SummaryItem[] };
    runbook?: { steps: RunbookStep[] };
    flowcharts?: { mermaid: string; nodes: FlowchartNode[] };
    tables?: { tables: Table[]; markdown?: string; csv?: string };
    qa?: { items: QaItem[] };
  };
  evidence_graph: {
    nodes: EvidenceNode[];
    edges: EvidenceEdge[];
  };
  validation: {
    claims: ClaimValidationResult[];
  };
  metadata: {
    generator_versions?: Record<string, string>;
    provider?: string;
    config?: Record<string, unknown>;
  };
};
