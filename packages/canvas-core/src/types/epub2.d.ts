declare module "epub2" {
  type Chapter = {
    id: string;
    href: string;
    title?: string;
    order?: number;
  };

  class EPub {
    constructor(path: string);
    metadata?: { title?: string; creator?: string };
    flow: Chapter[];
    parse(): void;
    on(event: "end", cb: () => void): void;
    on(event: "error", cb: (err: Error) => void): void;
    getChapter(id: string, cb: (err: Error | null, text: string) => void): void;
  }

  export = EPub;
}
