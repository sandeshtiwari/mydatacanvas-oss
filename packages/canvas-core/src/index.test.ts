import { describe, it, expect } from "vitest";
import { buildCanvasPackFromText } from "./index";

describe("buildCanvasPackFromText", () => {
  it("creates a pack with artifacts", async () => {
    const pack = await buildCanvasPackFromText("Sample", "Step one. Step two.");
    expect(pack.chunks.length).toBeGreaterThan(0);
    expect(pack.artifacts.summaries?.items.length).toBeGreaterThan(0);
    expect(pack.validation.claims.length).toBeGreaterThanOrEqual(0);
  });
});
