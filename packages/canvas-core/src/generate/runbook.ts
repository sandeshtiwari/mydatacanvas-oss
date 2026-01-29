import type { CanvasPack, RunbookStep } from "@mydatacanvas/canvas-schema";
import { extractLines, splitSentences } from "../utils/text";
import { makeCitationFromChunk } from "../citations";

const BULLET_REGEX = /^(\d+[\.)]|[-*•])\s+/;

function titleFromSentence(sentence: string): string {
  const words = sentence.split(/\s+/).slice(0, 6).join(" ");
  return words.length > 3 ? words : `Step ${sentence.slice(0, 12)}`;
}

export function generateRunbook(pack: CanvasPack): { steps: RunbookStep[] } {
  const steps: RunbookStep[] = [];
  const candidateTexts: Array<{ text: string; chunkId: string }> = [];

  for (const chunk of pack.chunks) {
    candidateTexts.push({ text: chunk.text, chunkId: chunk.chunk_id });
  }

  for (const candidate of candidateTexts) {
    const lines = extractLines(candidate.text);
    for (const line of lines) {
      if (BULLET_REGEX.test(line)) {
        const cleaned = line.replace(BULLET_REGEX, "").trim();
        if (!cleaned) continue;
        const chunk = pack.chunks.find((c) => c.chunk_id === candidate.chunkId);
        steps.push({
          id: `step_${steps.length + 1}`,
          title: titleFromSentence(cleaned),
          instructions: [cleaned],
          citations: chunk ? [makeCitationFromChunk(chunk)] : []
        });
      }
    }
    if (steps.length >= 12) break;
  }

  if (!steps.length) {
    for (const candidate of candidateTexts) {
      const sentences = splitSentences(candidate.text);
      for (const sentence of sentences) {
        const chunk = pack.chunks.find((c) => c.chunk_id === candidate.chunkId);
        steps.push({
          id: `step_${steps.length + 1}`,
          title: titleFromSentence(sentence),
          instructions: [sentence],
          citations: chunk ? [makeCitationFromChunk(chunk)] : []
        });
        if (steps.length >= 10) break;
      }
      if (steps.length >= 10) break;
    }
  }

  return { steps };
}
