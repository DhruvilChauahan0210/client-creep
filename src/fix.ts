import fs from "node:fs";
import type { CreepCandidate } from "./types.js";

export interface FixResult {
  fixed: string[];
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

function removeUseClientDirective(content: string): string {
  // Remove "use client" / 'use client' with optional semicolon at start of file
  return content.replace(/^["']use client["'];?\r?\n/, "");
}
