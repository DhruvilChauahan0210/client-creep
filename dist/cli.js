#!/usr/bin/env node
import {
  analyze
} from "./chunk-NSQ2DRK5.js";

// src/cli.ts
import { cac } from "cac";
import pc2 from "picocolors";

// src/render.ts
import pc from "picocolors";
import path from "path";
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function clientLabel(text) {
  return pc.bold(pc.yellow(text));
}
function serverLabel(text) {
  return pc.bold(pc.blue(text));
}
function dimPath(p) {
  const dir = path.dirname(p);
  const base = path.basename(p);
  return pc.dim(dir === "." ? "" : dir + "/") + base;
}
function renderChain(chain, projectRoot) {
  const lines = [];
  for (let i = 0; i < chain.length; i++) {
    const filePath = chain[i];
    const rel = path.relative(projectRoot, filePath);
    const indent = "  ".repeat(i);
    const connector = i === 0 ? "" : `${indent}\u2514\u2500 `;
    const isRoot = i === 0;
    const label = isRoot ? `${connector}${pc.bold(pc.yellow("\u26A1"))} ${clientLabel(rel)} ${pc.dim("\u2190 use client")}` : `${connector}${dimPath(rel)}`;
    lines.push(label);
  }
  return lines.join("\n");
}
function renderTerminal(result) {
  const {
    projectRoot,
    totalFiles,
    clientBoundaries,
    clientGraph,
    creepCandidates,
    totalClientBytes,
    recoverableBytes,
    whyTraces
  } = result;
  const LINE = pc.dim("\u2500".repeat(60));
  console.log();
  console.log(LINE);
  console.log(
    pc.bold("  client-creep") + pc.dim("  Next.js client component analysis")
  );
  console.log(LINE);
  console.log();
  console.log(
    "  " + pc.bold("Project:") + " " + pc.dim(projectRoot)
  );
  console.log(
    "  " + pc.bold("Files scanned:") + " " + totalFiles
  );
  console.log(
    "  " + pc.bold("Client components:") + " " + clientLabel(`${clientGraph.length}`) + pc.dim(` (${clientBoundaries.length} boundaries)`)
  );
  console.log(
    "  " + pc.bold("Estimated client JS:") + " " + pc.bold(pc.yellow(formatBytes(totalClientBytes))) + pc.dim("  (estimate \u2014 raw source bytes)")
  );
  if (recoverableBytes > 0) {
    console.log(
      "  " + pc.bold("Potentially recoverable:") + " " + pc.bold(pc.green(formatBytes(recoverableBytes))) + pc.dim(`  (${creepCandidates.length} creep candidates)`)
    );
  }
  console.log();
  if (clientBoundaries.length === 0) {
    console.log(serverLabel("  \u2713 No client boundaries found."));
    console.log();
    return;
  }
  console.log(LINE);
  console.log(pc.bold("  Client Boundaries"));
  console.log(LINE);
  console.log();
  for (const boundary of clientBoundaries) {
    const signals = boundary.clientSignals.length > 0 ? pc.dim("  signals: ") + pc.cyan(boundary.clientSignals.slice(0, 4).join(", ")) : pc.dim("  ") + pc.red("no client signals detected") + pc.dim(" \u2190 possibly unnecessary");
    console.log(
      "  " + pc.yellow("\u26A1") + " " + pc.bold(boundary.displayPath) + signals
    );
    const pulled = clientGraph.filter(
      (n) => !n.isClientBoundary && whyTraces.get(n.filePath)?.boundaryRoot === boundary.filePath
    );
    if (pulled.length > 0) {
      const shown = pulled.slice(0, 3);
      for (const dep of shown) {
        console.log("     " + pc.dim("\u2514\u2500") + " " + pc.dim(dep.displayPath));
      }
      if (pulled.length > 3) {
        console.log("     " + pc.dim(`\u2514\u2500 \u2026 and ${pulled.length - 3} more`));
      }
    }
    console.log();
  }
  if (creepCandidates.length > 0) {
    console.log(LINE);
    console.log(
      pc.bold("  \u26A0  Accidental Client Creep") + pc.dim("  \u2014 components that may not need to be client")
    );
    console.log(LINE);
    console.log();
    const shown = creepCandidates.slice(0, 10);
    for (const candidate of shown) {
      console.log(
        "  " + pc.red("\u26A0") + " " + pc.bold(candidate.displayPath) + "  " + pc.dim(formatBytes(candidate.recoverableBytes)) + " potentially recoverable"
      );
      console.log(
        "    " + pc.dim(candidate.reason)
      );
      const trace = candidate.whyTrace;
      if (trace.chain.length > 1) {
        console.log("    " + pc.dim("Why client:"));
        console.log(
          renderChain(trace.chain, projectRoot).split("\n").map((l) => "    " + l).join("\n")
        );
      }
      console.log();
    }
    if (creepCandidates.length > 10) {
      console.log(
        pc.dim(`  \u2026 and ${creepCandidates.length - 10} more creep candidates. Use --json for full output.`)
      );
      console.log();
    }
  }
  const unnecessaryBoundaries = clientBoundaries.filter(
    (b) => b.clientSignals.length === 0
  );
  if (unnecessaryBoundaries.length > 0) {
    console.log(LINE);
    console.log(
      pc.bold("  \u2139  Possibly Unnecessary Boundaries") + pc.dim("  \u2014 'use client' with no detected client signals")
    );
    console.log(LINE);
    console.log();
    for (const b of unnecessaryBoundaries) {
      console.log(
        "  " + pc.yellow("?") + " " + pc.bold(b.displayPath) + pc.dim("  \u2014 review: no hooks, event handlers, or browser APIs found")
      );
    }
    console.log();
  }
  console.log(LINE);
  console.log(
    pc.dim(
      "  Sizes are estimates (raw source bytes). Run npx @next/bundle-analyzer for exact bundle impact."
    )
  );
  console.log(LINE);
  console.log();
}
function renderJson(result) {
  const output = {
    projectRoot: result.projectRoot,
    totalFiles: result.totalFiles,
    summary: {
      clientComponents: result.clientGraph.length,
      clientBoundaries: result.clientBoundaries.length,
      serverComponents: result.serverGraph.length,
      estimatedClientBytes: result.totalClientBytes,
      recoverableBytes: result.recoverableBytes,
      creepCandidates: result.creepCandidates.length
    },
    boundaries: result.clientBoundaries.map((b) => ({
      file: b.displayPath,
      signals: b.clientSignals,
      sizeBytes: b.sizeBytes
    })),
    creepCandidates: result.creepCandidates.map((c) => ({
      file: c.displayPath,
      reason: c.reason,
      recoverableBytes: c.recoverableBytes,
      whyChain: c.whyTrace.chain.map(
        (f) => path.relative(result.projectRoot, f)
      )
    }))
  };
  console.log(JSON.stringify(output, null, 2));
}

// src/cli.ts
var cli = cac("client-creep");
cli.command("[dir]", "Analyze a Next.js project for client component creep").option("--dir <path>", "Path to the Next.js project (alias for positional arg)").option("--json", "Output results as JSON").option("--ci", "CI mode: exit 1 if client creep is detected").option("--budget <kb>", "Fail CI if estimated client JS exceeds this KB threshold").action(async (dir = ".", options) => {
  const targetDir = options.dir ?? dir ?? ".";
  try {
    if (!options.json) {
      process.stdout.write(pc2.dim("  Scanning\u2026\r"));
    }
    const result = await analyze(targetDir);
    if (options.json) {
      renderJson(result);
    } else {
      renderTerminal(result);
    }
    if (options.ci || options.budget) {
      const budgetKb = options.budget ? Number(options.budget) : void 0;
      let failed = false;
      if (budgetKb !== void 0) {
        const actualKb = result.totalClientBytes / 1024;
        if (actualKb > budgetKb) {
          failed = true;
          if (!options.json) {
            console.error(pc2.red(`
  \u2717 client-creep: budget exceeded`));
            console.error(pc2.red(`    ${actualKb.toFixed(1)} KB client JS > ${budgetKb} KB limit`));
            console.error(pc2.dim(`    Run without --ci to see the full report and where to recover KB.`));
          }
        }
      }
      if (options.ci && result.creepCandidates.length > 0) {
        failed = true;
        if (!options.json) {
          console.error(pc2.red(`
  \u2717 client-creep: ${result.creepCandidates.length} accidental creep candidates found`));
          console.error(pc2.dim(`    ~${(result.recoverableBytes / 1024).toFixed(0)} KB potentially recoverable.`));
          console.error(pc2.dim(`    Run without --ci to see the full report.`));
        }
      }
      if (!failed && !options.json) {
        console.log(pc2.green(`  \u2713 client-creep: no issues found`));
      }
      if (failed) process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(pc2.red(`  Error: ${message}`));
    process.exit(1);
  }
});
cli.help();
cli.version("0.1.0");
cli.parse();
