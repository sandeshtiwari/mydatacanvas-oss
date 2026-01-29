#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import {
  buildCanvasPackFromPdf,
  buildCanvasPackFromEpub,
  buildCanvasPackFromText,
  askQuestion,
  generateSummaries,
  generateOutline,
  generateRunbook,
  generateFlowchart,
  generateTables,
  validatePack,
  diffPacks
} from "@mydatacanvas/canvas-core";
import type { CanvasPack } from "@mydatacanvas/canvas-schema";
import { validateCanvasPack } from "@mydatacanvas/canvas-schema";

const program = new Command();

program
  .name("canvas")
  .description("Canvas CLI for ingesting documents and generating citation-backed artifacts.")
  .version("0.1.0");

program
  .command("ingest")
  .argument("<file>", "PDF, EPUB, or text file")
  .option("--out <path>", "Output CanvasPack JSON", "pack.json")
  .action(async (file, options) => {
    const ext = path.extname(file).toLowerCase();
    let pack: CanvasPack;
    if (ext === ".pdf") {
      pack = await buildCanvasPackFromPdf(file);
    } else if (ext === ".epub") {
      pack = await buildCanvasPackFromEpub(file);
    } else {
      const content = await fs.promises.readFile(file, "utf-8");
      pack = await buildCanvasPackFromText(path.basename(file), content);
    }
    await fs.promises.writeFile(options.out, JSON.stringify(pack, null, 2), "utf-8");
    // eslint-disable-next-line no-console
    console.log(`Saved CanvasPack to ${options.out}`);
  });

program
  .command("summarize")
  .argument("<pack>", "CanvasPack JSON")
  .option("--out <path>", "Output path", "summaries.json")
  .action(async (packPath, options) => {
    const pack = loadPack(packPath);
    const summaries = generateSummaries(pack);
    await fs.promises.writeFile(options.out, renderSummaries(summaries), "utf-8");
    // eslint-disable-next-line no-console
    console.log(`Saved summaries to ${options.out}`);
  });

program
  .command("outline")
  .argument("<pack>", "CanvasPack JSON")
  .option("--out <path>", "Output path", "outline.json")
  .action(async (packPath, options) => {
    const pack = loadPack(packPath);
    const outline = generateOutline(pack);
    await fs.promises.writeFile(options.out, renderOutline(outline), "utf-8");
    // eslint-disable-next-line no-console
    console.log(`Saved outline to ${options.out}`);
  });

program
  .command("runbook")
  .argument("<pack>", "CanvasPack JSON")
  .option("--out <path>", "Output path", "runbook.json")
  .action(async (packPath, options) => {
    const pack = loadPack(packPath);
    const runbook = generateRunbook(pack);
    await fs.promises.writeFile(options.out, renderRunbook(runbook), "utf-8");
    // eslint-disable-next-line no-console
    console.log(`Saved runbook to ${options.out}`);
  });

program
  .command("flow")
  .argument("<pack>", "CanvasPack JSON")
  .option("--out <path>", "Output path", "flow.mmd")
  .action(async (packPath, options) => {
    const pack = loadPack(packPath);
    const flow = generateFlowchart(pack);
    await fs.promises.writeFile(options.out, flow.mermaid, "utf-8");
    // eslint-disable-next-line no-console
    console.log(`Saved flowchart to ${options.out}`);
  });

program
  .command("table")
  .argument("<pack>", "CanvasPack JSON")
  .option("--out <path>", "Output path", "tables.json")
  .action(async (packPath, options) => {
    const pack = loadPack(packPath);
    const tables = generateTables(pack);
    await fs.promises.writeFile(options.out, renderTables(tables), "utf-8");
    // eslint-disable-next-line no-console
    console.log(`Saved tables to ${options.out}`);
  });

program
  .command("ask")
  .argument("<pack>", "CanvasPack JSON")
  .argument("<question>", "Question to ask")
  .option("--out <path>", "Output path", "answer.json")
  .action(async (packPath, question, options) => {
    const pack = loadPack(packPath);
    const result = await askQuestion(pack, question);
    await fs.promises.writeFile(options.out, renderAnswer(result), "utf-8");
    // eslint-disable-next-line no-console
    console.log(`Saved answer to ${options.out}`);
  });

program
  .command("validate")
  .argument("<pack>", "CanvasPack JSON")
  .option("--fail-on <verdict>", "Fail if any claim matches verdict", "missing_citations")
  .option("--out <path>", "Output path", "validation.json")
  .action(async (packPath, options) => {
    const pack = loadPack(packPath);
    const report = validatePack(pack);
    await fs.promises.writeFile(options.out, JSON.stringify(report, null, 2), "utf-8");
    // eslint-disable-next-line no-console
    console.log(`Saved validation report to ${options.out}`);
    if (options.failOn === "error") {
      if (report.claims.length > 0) {
        process.exit(1);
      }
    } else if (report.claims.some((claim) => claim.verdict === options.failOn)) {
      process.exit(1);
    }
  });

program
  .command("diff")
  .argument("<oldPack>", "Old CanvasPack JSON")
  .argument("<newPack>", "New CanvasPack JSON")
  .option("--out <path>", "Output path", "diff.json")
  .action(async (oldPackPath, newPackPath, options) => {
    const oldPack = loadPack(oldPackPath);
    const newPack = loadPack(newPackPath);
    const diff = diffPacks(oldPack, newPack);
    await fs.promises.writeFile(options.out, renderDiff(diff), "utf-8");
    // eslint-disable-next-line no-console
    console.log(`Saved diff to ${options.out}`);
  });

program
  .command("view")
  .argument("<pack>", "CanvasPack JSON")
  .option("--port <port>", "Port", "4545")
  .action(async (packPath, options) => {
    const port = Number(options.port);
    const pack = loadPack(packPath);
    const viewerRoot = path.join(__dirname, "../../../canvas-viewer/public");
    const server = await startViewerServer(viewerRoot, pack);
    const url = `http://localhost:${port}`;
    server.listen(port, async () => {
      openUrl(url);
      // eslint-disable-next-line no-console
      console.log(`Viewer running at ${url}`);
    });
  });

program.parse(process.argv);

function loadPack(filePath: string): CanvasPack {
  const raw = fs.readFileSync(filePath, "utf-8");
  return validateCanvasPack(JSON.parse(raw));
}

function startViewerServer(rootDir: string, pack: CanvasPack) {
  const http = require("http");
  return http.createServer((req: { url?: string }, res: { writeHead: (status: number, headers: Record<string, string>) => void; end: (body?: string | Buffer) => void }) => {
    const url = req.url || "/";
    if (url === "/pack.json") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(pack));
      return;
    }
    const filePath = path.join(rootDir, url === "/" ? "index.html" : url);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const file = fs.readFileSync(filePath);
    const contentType = filePath.endsWith(".css")
      ? "text/css"
      : filePath.endsWith(".js")
        ? "text/javascript"
        : "text/html";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(file);
  });
}

function openUrl(url: string) {
  const platform = process.platform;
  const command = platform === "win32" ? "cmd" : platform === "darwin" ? "open" : "xdg-open";
  const args = platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { stdio: "ignore", detached: true });
  child.unref();
}

function renderOutline(outline: { nodes: { title: string }[] }): string {
  if (!outline.nodes.length) return "No outline nodes.";
  return outline.nodes.map((node) => `- ${node.title}`).join("\n");
}

function renderSummaries(summaries: { items: { text: string }[] }): string {
  if (!summaries.items.length) return "No summaries.";
  return summaries.items.map((item) => `- ${item.text}`).join("\n");
}

function renderRunbook(runbook: { steps: { title: string; instructions: string[] }[] }): string {
  if (!runbook.steps.length) return "No runbook steps.";
  return runbook.steps
    .map((step, index) => `${index + 1}. ${step.title}\n   ${step.instructions.join(" ")}`)
    .join("\n\n");
}

function renderTables(tables: { markdown?: string; tables: { title: string; rows: { cells: string[] }[] }[] }): string {
  if (tables.markdown) return tables.markdown;
  if (!tables.tables.length) return "No tables.";
  return tables.tables
    .map((table) => {
      const rows = table.rows.map((row) => `- ${row.cells.join(" | ")}`).join("\n");
      return `${table.title}\n${rows}`;
    })
    .join("\n\n");
}

function renderAnswer(result: { answer: string; citations: unknown[] }): string {
  return `${result.answer}\n\nCitations: ${result.citations.length}`;
}

function renderDiff(diff: { changed_sections: string[]; changed_chunks: string[]; impacted_artifacts: string[] }): string {
  return [
    `Changed sections: ${diff.changed_sections.length}`,
    `Changed chunks: ${diff.changed_chunks.length}`,
    `Impacted artifacts: ${diff.impacted_artifacts.join(", ") || "none"}`
  ].join("\n");
}
