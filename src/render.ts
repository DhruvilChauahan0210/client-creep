import pc from "picocolors";
import path from "node:path";
import type { AnalysisResult, WhyTrace } from "./types.js";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function clientLabel(text: string): string {
  return pc.bold(pc.yellow(text));
}

function serverLabel(text: string): string {
  return pc.bold(pc.blue(text));
}

function dimPath(p: string): string {
  const dir = path.dirname(p);
  const base = path.basename(p);
  return pc.dim(dir === "." ? "" : dir + "/") + base;
}

function renderChain(chain: string[], projectRoot: string): string {
  const lines: string[] = [];
  for (let i = 0; i < chain.length; i++) {
    const filePath = chain[i];
    const rel = path.relative(projectRoot, filePath);
    const indent = "  ".repeat(i);
    const connector = i === 0 ? "" : `${indent}└─ `;
    const isRoot = i === 0;
    const label = isRoot
      ? `${connector}${pc.bold(pc.yellow("⚡"))} ${clientLabel(rel)} ${pc.dim("← use client")}`
      : `${connector}${dimPath(rel)}`;
    lines.push(label);
  }
  return lines.join("\n");
}

export function renderTerminal(result: AnalysisResult): void {
  const {
    projectRoot,
    totalFiles,
    clientBoundaries,
    clientGraph,
    creepCandidates,
    totalClientBytes,
    recoverableBytes,
    whyTraces,
  } = result;

  const LINE = pc.dim("─".repeat(60));

  console.log();
  console.log(LINE);
  console.log(
    pc.bold("  client-creep") +
    pc.dim("  Next.js client component analysis")
  );
  console.log(LINE);
  console.log();

  // Summary
  console.log(
    "  " + pc.bold("Project:") + " " + pc.dim(projectRoot)
  );
  console.log(
    "  " + pc.bold("Files scanned:") + " " + totalFiles
  );
  console.log(
    "  " +
    pc.bold("Client components:") +
    " " +
    clientLabel(`${clientGraph.length}`) +
    pc.dim(` (${clientBoundaries.length} boundaries)`)
  );
  console.log(
    "  " +
    pc.bold("Estimated client JS:") +
    " " +
    pc.bold(pc.yellow(formatBytes(totalClientBytes))) +
    pc.dim("  (estimate — raw source bytes)")
  );

  if (recoverableBytes > 0) {
    console.log(
      "  " +
      pc.bold("Potentially recoverable:") +
      " " +
      pc.bold(pc.green(formatBytes(recoverableBytes))) +
      pc.dim(`  (${creepCandidates.length} creep candidates)`)
    );
  }

  console.log();

  // Client boundaries
  if (clientBoundaries.length === 0) {
    console.log(serverLabel("  ✓ No client boundaries found."));
    console.log();
    return;
  }

  console.log(LINE);
  console.log(pc.bold("  Client Boundaries"));
  console.log(LINE);
  console.log();

  for (const boundary of clientBoundaries) {
    const signals = boundary.clientSignals.length > 0
      ? pc.dim("  signals: ") + pc.cyan(boundary.clientSignals.slice(0, 4).join(", "))
      : pc.dim("  ") + pc.red("no client signals detected") + pc.dim(" ← possibly unnecessary");

    console.log(
      "  " +
      pc.yellow("⚡") +
      " " +
      pc.bold(boundary.displayPath) +
      signals
    );

    // Show what this boundary pulls into client graph
    const pulled = clientGraph.filter(
      (n) => !n.isClientBoundary &&
        whyTraces.get(n.filePath)?.boundaryRoot === boundary.filePath
    );
    if (pulled.length > 0) {
      const shown = pulled.slice(0, 3);
      for (const dep of shown) {
        console.log("     " + pc.dim("└─") + " " + pc.dim(dep.displayPath));
      }
      if (pulled.length > 3) {
        console.log("     " + pc.dim(`└─ … and ${pulled.length - 3} more`));
      }
    }
    console.log();
  }

  // Creep candidates
  if (creepCandidates.length > 0) {
    console.log(LINE);
    console.log(
      pc.bold("  ⚠  Accidental Client Creep") +
      pc.dim("  — components that may not need to be client")
    );
    console.log(LINE);
    console.log();

    const shown = creepCandidates.slice(0, 10);
    for (const candidate of shown) {
      console.log(
        "  " +
        pc.red("⚠") +
        " " +
        pc.bold(candidate.displayPath) +
        "  " +
        pc.dim(formatBytes(candidate.recoverableBytes)) +
        " potentially recoverable"
      );
      console.log(
        "    " + pc.dim(candidate.reason)
      );

      // Show the why trace
      const trace = candidate.whyTrace;
      if (trace.chain.length > 1) {
        console.log("    " + pc.dim("Why client:"));
        console.log(
          renderChain(trace.chain, projectRoot)
            .split("\n")
            .map((l) => "    " + l)
            .join("\n")
        );
      }
      console.log();
    }

    if (creepCandidates.length > 10) {
      console.log(
        pc.dim(`  … and ${creepCandidates.length - 10} more creep candidates. Use --json for full output.`)
      );
      console.log();
    }
  }

  // Why traces for boundaries with no signals
  const unnecessaryBoundaries = clientBoundaries.filter(
    (b) => b.clientSignals.length === 0
  );
  if (unnecessaryBoundaries.length > 0) {
    console.log(LINE);
    console.log(
      pc.bold("  ℹ  Possibly Unnecessary Boundaries") +
      pc.dim("  — 'use client' with no detected client signals")
    );
    console.log(LINE);
    console.log();
    for (const b of unnecessaryBoundaries) {
      console.log(
        "  " +
        pc.yellow("?") +
        " " +
        pc.bold(b.displayPath) +
        pc.dim("  — review: no hooks, event handlers, or browser APIs found")
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

export function renderJson(result: AnalysisResult): void {
  const output = {
    projectRoot: result.projectRoot,
    totalFiles: result.totalFiles,
    summary: {
      clientComponents: result.clientGraph.length,
      clientBoundaries: result.clientBoundaries.length,
      serverComponents: result.serverGraph.length,
      estimatedClientBytes: result.totalClientBytes,
      recoverableBytes: result.recoverableBytes,
      creepCandidates: result.creepCandidates.length,
    },
    boundaries: result.clientBoundaries.map((b) => ({
      file: b.displayPath,
      signals: b.clientSignals,
      sizeBytes: b.sizeBytes,
    })),
    creepCandidates: result.creepCandidates.map((c) => ({
      file: c.displayPath,
      reason: c.reason,
      recoverableBytes: c.recoverableBytes,
      whyChain: c.whyTrace.chain.map((f) =>
        path.relative(result.projectRoot, f)
      ),
    })),
  };
  console.log(JSON.stringify(output, null, 2));
}
