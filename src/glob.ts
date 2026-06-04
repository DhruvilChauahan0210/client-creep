import { glob } from "tinyglobby";
import path from "node:path";
import fs from "node:fs";

const SOURCE_EXTENSIONS = ["ts", "tsx", "js", "jsx", "mjs", "mts"];

const IGNORE_PATTERNS = [
  "**/node_modules/**",
  "**/.next/**",
  "**/.remix/**",
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

export type Framework = "nextjs" | "remix" | "vite-rsc" | "unknown";

export function detectFramework(dir: string): Framework {
  const exists = (f: string) => fs.existsSync(path.join(dir, f));

  if (exists("next.config.js") || exists("next.config.ts") || exists("next.config.mjs") || exists("next.config.cjs")) {
    return "nextjs";
  }

  // Remix v2+ uses vite.config with @remix-run/dev
  if (exists("vite.config.ts") || exists("vite.config.js") || exists("vite.config.mjs")) {
    try {
      const viteConfig = fs.readFileSync(
        path.join(dir, exists("vite.config.ts") ? "vite.config.ts" : exists("vite.config.js") ? "vite.config.js" : "vite.config.mjs"),
        "utf-8"
      );
      if (viteConfig.includes("@remix-run")) return "remix";
      if (viteConfig.includes("react-server") || viteConfig.includes("serverComponents")) return "vite-rsc";
    } catch { /* ignore */ }
  }

  if (exists("remix.config.js") || exists("remix.config.ts")) return "remix";

  return "unknown";
}

export function isNextProject(dir: string): boolean {
  return detectFramework(dir) === "nextjs";
}

export function resolveProjectRoot(dir: string): string {
  const resolved = path.resolve(dir);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Directory not found: ${resolved}`);
  }
  return resolved;
}
