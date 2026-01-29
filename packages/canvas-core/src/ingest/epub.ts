import path from "path";
import EPub from "epub2";
import { sha256 } from "../utils/hash";
import { normalizeWhitespace, stripHtml, titleFromFilename } from "../utils/text";
import fs from "fs";

export type EpubIngestResult = {
  title: string;
  author?: string;
  sha256: string;
  sections: { section_id: string; title: string; order: number; text: string }[];
};

function readChapter(epub: EPub, id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    epub.getChapter(id, (err, text) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(text);
    });
  });
}

export async function ingestEpubFromFile(filePath: string): Promise<EpubIngestResult> {
  const buffer = await fs.promises.readFile(filePath);
  const epub = new EPub(filePath);

  await new Promise<void>((resolve, reject) => {
    epub.on("end", () => resolve());
    epub.on("error", (err: Error) => reject(err));
    epub.parse();
  });

  const flow = epub.flow || [];
  const sections: { section_id: string; title: string; order: number; text: string }[] = [];

  for (let i = 0; i < flow.length; i += 1) {
    const chapter = flow[i];
    const raw = await readChapter(epub, chapter.id);
    const clean = normalizeWhitespace(stripHtml(raw));
    sections.push({
      section_id: chapter.id || `section_${i + 1}`,
      title: chapter.title || `Section ${i + 1}`,
      order: i,
      text: clean
    });
  }

  return {
    title: epub.metadata?.title || titleFromFilename(path.basename(filePath)),
    author: epub.metadata?.creator,
    sha256: sha256(buffer),
    sections
  };
}
