import fs from "node:fs";
import path from "node:path";
import type { CreepCandidate, ComponentNode, AnalysisResult } from "./types.js";
import { parseFile } from "./parser.js";
import { loadAliases, resolveImport } from "./resolver.js";

export interface FixResult {
  fixed: string[];
  skipped: string[];
}

export interface BarrelFixResult {
  barrelsFixed: string[];
  componentsAdded: string[];
  skipped: string[];
}

export function applyFix(candidates: CreepCandidate[]): FixResult {
  const fixed: string[] = [];
  const skipped: string[] = [];

  for (const candidate of candidates) {
    try {
      const original = fs.readFileSync(candidate.filePath, "utf-8");
      const patched = removeUseClientDirective(original);
      if (patched === original) {
        skipped.push(candidate.filePath);
      } else {
        fs.writeFileSync(candidate.filePath, patched, "utf-8");
        fixed.push(candidate.filePath);
      }
    } catch {
      skipped.push(candidate.filePath);
    }
  }

  return { fixed, skipped };
}

export function fixBarrels(result: AnalysisResult): BarrelFixResult {
  const barrelsFixed: string[] = [];
  const componentsAdded: string[] = [];
  const skipped: string[] = [];

  // Build a fast lookup: filePath → node with client signals
  const nodeByPath = new Map<string, ComponentNode>();
  for (const node of [...result.clientBoundaries, ...result.clientGraph]) {
    nodeByPath.set(node.filePath, node);
  }

  const aliases = loadAliases(result.projectRoot);

  for (const boundary of result.clientBoundaries) {
    const base = path.basename(boundary.filePath, path.extname(boundary.filePath));
    if (base !== "index") continue;

    // Re-parse to get re-export sources
    const parsed = parseFile(boundary.filePath);
    if (!parsed.hasUseClient || parsed.reExportSources.length === 0) continue;

    const barrelDir = path.dirname(boundary.filePath);
    const toAddUseClient: string[] = [];

    for (const src of parsed.reExportSources) {
      const resolved = resolveImport(src, barrelDir, aliases);
      if (!resolved) continue;

      const node = nodeByPath.get(resolved);
      // Only add "use client" if the re-exported file has actual client signals
      if (node && node.clientSignals.length > 0) {
        toAddUseClient.push(resolved);
      }
    }

    // If no re-exported component needs "use client", nothing to do
    if (toAddUseClient.length === 0) {
      skipped.push(boundary.filePath);
      continue;
    }

    // Add "use client" to each component that needs it
    let anyAdded = false;
    for (const filePath of toAddUseClient) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        if (/^["']use client["']/.test(content)) continue; // already has it
        fs.writeFileSync(filePath, `"use client";\n${content}`, "utf-8");
        componentsAdded.push(filePath);
        anyAdded = true;
      } catch {
        skipped.push(filePath);
      }
    }

    // Remove "use client" from the barrel
    if (anyAdded) {
      try {
        const original = fs.readFileSync(boundary.filePath, "utf-8");
        const patched = removeUseClientDirective(original);
        if (patched !== original) {
          fs.writeFileSync(boundary.filePath, patched, "utf-8");
          barrelsFixed.push(boundary.filePath);
        }
      } catch {
        skipped.push(boundary.filePath);
      }
    }
  }

  return { barrelsFixed, componentsAdded, skipped };
}

function removeUseClientDirective(content: string): string {
  return content.replace(/^["']use client["'];?\r?\n/, "");
}
