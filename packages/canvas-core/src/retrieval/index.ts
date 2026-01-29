import type { CanvasPack, Chunk } from "@mydatacanvas/canvas-schema";

export type RetrievalResult = {
  chunk: Chunk;
  score: number;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function retrieveTopChunks(pack: CanvasPack, query: string, topK = 5): RetrievalResult[] {
  const queryTokens = tokenize(query);
  const scores = pack.chunks.map((chunk) => {
    const tokens = tokenize(chunk.text);
    let score = 0;
    for (const token of queryTokens) {
      if (tokens.includes(token)) score += 1;
    }
    return { chunk, score };
  });
  return scores
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
