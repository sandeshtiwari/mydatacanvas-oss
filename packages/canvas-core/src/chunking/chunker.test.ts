import { describe, it, expect } from "vitest";
import { createBasePack } from "../index";
import { buildChunks } from "./chunker";

describe("buildChunks", () => {
  it("creates chunks for text pack", () => {
    const pack = createBasePack({
      sourceType: "text",
      title: "Test",
      originalFilename: "test.txt",
      sha256: "abc",
      sections: [
        {
          section_id: "section_1",
          title: "Section 1",
          order: 0,
          text: "Hello world. This is a test."
        }
      ]
    });
    const chunks = buildChunks(pack, { chunkSize: 10, overlap: 2 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].loc.kind).toBe("text_location");
  });
});
