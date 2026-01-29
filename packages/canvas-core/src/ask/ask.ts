import type { CanvasPack, CitationRef } from "@mydatacanvas/canvas-schema";
import type { LLMProvider } from "../providers/types";
import { retrieveTopChunks } from "../retrieval";
import { makeCitationFromChunk } from "../citations";

export type AskResult = {
  answer: string;
  citations: CitationRef[];
  used_chunks: string[];
};

export async function askQuestion(
  pack: CanvasPack,
  question: string,
  provider?: LLMProvider
): Promise<AskResult> {
  const top = retrieveTopChunks(pack, question, 5);
  const citations = top.map((item) => makeCitationFromChunk(item.chunk));
  const context = top.map((item) => item.chunk.text).join("\n\n");
  const usedChunks = top.map((item) => item.chunk.chunk_id);

  if (provider) {
    const prompt = `Answer the question using ONLY the context. Include a short answer.\n\nQuestion: ${question}\n\nContext:\n${context}`;
    const completion = await provider.complete(prompt);
    return { answer: completion.text.trim(), citations, used_chunks: usedChunks };
  }

  const fallback = context.split("\n").slice(0, 2).join(" ").slice(0, 400);
  return {
    answer: fallback ? `${fallback}` : "No relevant context found.",
    citations,
    used_chunks: usedChunks
  };
}
