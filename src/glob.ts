import { glob } from "tinyglobby";
import path from "node:path";
import fs from "node:fs";

const SOURCE_EXTENSIONS = ["ts", "tsx", "js", "jsx", "mjs", "mts"];

const IGNORE_PATTERNS = [
  "**/node_modules/**",
  "**/.next/**",
  "**/dist/**",
  "**/build/**",
  "**/.git/**",
  "**/*.test.*",
  "**/*.spec.*",
  "**/__tests__/**",
];

export async function collectSourceFiles(projectRoot: string): Promise<string[]> {
  const patterns = SOURCE_EXTENSIONS.map((ext) => `**/*.${ext}`);

  const files = await glob(patterns, {
    cwd: projectRoot,
    ignore: IGNORE_PATTERNS,
    absolute: true,
    followSymbolicLinks: false,
  });

  return files.filter((f) => fs.existsSync(f));
}

export function isNextProject(dir: string): boolean {
  const markers = [
    path.join(dir, "next.config.js"),
    path.join(dir, "next.config.ts"),
    path.join(dir, "next.config.mjs"),
    path.join(dir, "next.config.cjs"),
  ];
  return markers.some((m) => fs.existsSync(m));
}

export function resolveProjectRoot(dir: string): string {
  const resolved = path.resolve(dir);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Directory not found: ${resolved}`);
  }
  return resolved;
}
