import path from "node:path";
import fs from "node:fs";
import { getTsconfig } from "get-tsconfig";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"];

interface TsPathAliases {
  baseUrl: string;
  paths: Record<string, string[]>;
}

let _aliases: TsPathAliases | null = null;

export function loadAliases(projectRoot: string): TsPathAliases {
  if (_aliases) return _aliases;

  let options: Record<string, unknown> = {};
  try {
    const result = getTsconfig(projectRoot);
    options = (result?.config?.compilerOptions as Record<string, unknown>) ?? {};
  } catch {
    // Monorepos with shared tsconfig packages that aren't installed will throw.
    // Fall back to reading the tsconfig directly without following extends.
    options = readTsconfigDirect(projectRoot);
  }

  const baseUrl = options.baseUrl
    ? path.resolve(projectRoot, options.baseUrl as string)
    : projectRoot;
  const rawPaths = (options.paths as Record<string, string[]> | undefined) ?? {};

  const paths: Record<string, string[]> = {};
  for (const [key, vals] of Object.entries(rawPaths)) {
    paths[key] = (vals as string[]).map((v) =>
      path.resolve(baseUrl, v.replace(/\*$/, ""))
    );
  }

  _aliases = { baseUrl, paths };
  return _aliases;
}

function readTsconfigDirect(projectRoot: string): Record<string, unknown> {
  const tsconfigPath = path.join(projectRoot, "tsconfig.json");
  try {
    const raw = fs.readFileSync(tsconfigPath, "utf-8");
    // Strip comments (tsconfig allows them)
    const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const parsed = JSON.parse(stripped);
    return (parsed.compilerOptions as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

export function resetAliases() {
  _aliases = null;
}

function resolveWithExtensions(base: string): string | null {
  // Direct hit
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;

  // Try adding extensions
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate)) return candidate;
  }

  // Try index file
  for (const ext of EXTENSIONS) {
    const candidate = path.join(base, `index${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

export function resolveImport(
  importSource: string,
  importerDir: string,
  aliases: TsPathAliases
): string | null {
  // Skip bare node_modules specifiers
  if (!importSource.startsWith(".") && !importSource.startsWith("/")) {
    // Check tsconfig path aliases
    for (const [aliasKey, aliasPaths] of Object.entries(aliases.paths)) {
      const aliasPrefix = aliasKey.replace(/\*$/, "");
      if (importSource.startsWith(aliasPrefix)) {
        const suffix = importSource.slice(aliasPrefix.length);
        for (const aliasPath of aliasPaths) {
          const resolved = resolveWithExtensions(path.join(aliasPath, suffix));
          if (resolved) return resolved;
        }
      }
    }
    return null; // external package
  }

  const absolute = path.resolve(importerDir, importSource);
  return resolveWithExtensions(absolute);
}
