import path from "node:path";
import fs from "node:fs";
import { glob } from "tinyglobby";

export interface WorkspacePackage {
  name: string;
  root: string;
  /** Resolved entry point (main/module field or src/index.*) */
  entry: string | null;
}

let _workspaceCache: Map<string, WorkspacePackage> | null = null;

export function resetWorkspaceCache() {
  _workspaceCache = null;
}

/** Walk up from projectRoot to find the monorepo root, if any. */
export function findMonorepoRoot(projectRoot: string): string | null {
  let dir = projectRoot;
  const root = path.parse(dir).root;

  while (dir !== root) {
    if (
      fs.existsSync(path.join(dir, "pnpm-workspace.yaml")) ||
      fs.existsSync(path.join(dir, "turbo.json")) ||
      hasWorkspacesField(path.join(dir, "package.json"))
    ) {
      // Confirm it's not the project itself
      if (dir !== projectRoot) return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function hasWorkspacesField(pkgPath: string): boolean {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return Array.isArray(pkg.workspaces) || typeof pkg.workspaces === "object";
  } catch {
    return false;
  }
}

function getWorkspacePatterns(monorepoRoot: string): string[] {
  // pnpm-workspace.yaml
  const pnpmWs = path.join(monorepoRoot, "pnpm-workspace.yaml");
  if (fs.existsSync(pnpmWs)) {
    const content = fs.readFileSync(pnpmWs, "utf-8");
    const matches = content.match(/^\s*-\s*['"]?([^'"#\n]+?)['"]?\s*$/gm);
    if (matches) {
      return matches.map((m) => m.replace(/^\s*-\s*['"]?/, "").replace(/['"]?\s*$/, "").trim());
    }
  }

  // package.json workspaces
  const pkgPath = path.join(monorepoRoot, "package.json");
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const ws = pkg.workspaces;
    if (Array.isArray(ws)) return ws;
    if (Array.isArray(ws?.packages)) return ws.packages;
  } catch {}

  return ["packages/*", "apps/*"];
}

export async function loadWorkspacePackages(
  monorepoRoot: string
): Promise<Map<string, WorkspacePackage>> {
  if (_workspaceCache) return _workspaceCache;

  const patterns = getWorkspacePatterns(monorepoRoot);
  const packageDirs = await glob(
    patterns.map((p) => `${p}/package.json`),
    { cwd: monorepoRoot, absolute: true }
  );

  const map = new Map<string, WorkspacePackage>();

  for (const pkgJsonPath of packageDirs) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
      const pkgRoot = path.dirname(pkgJsonPath);
      const name: string = pkg.name;
      if (!name) continue;

      const entry = resolvePackageEntry(pkgRoot, pkg);
      map.set(name, { name, root: pkgRoot, entry });
    } catch {}
  }

  _workspaceCache = map;
  return map;
}

function resolvePackageEntry(
  pkgRoot: string,
  pkg: Record<string, unknown>
): string | null {
  const candidates = [
    pkg.source,         // unbundled source — best for monorepos
    pkg.module,
    pkg.main,
    "src/index.ts",
    "src/index.tsx",
    "index.ts",
    "index.tsx",
    "src/index.js",
    "index.js",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const full = path.resolve(pkgRoot, candidate);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

/** Resolve a bare workspace import like `@acme/ui` or `@acme/ui/button`. */
export function resolveWorkspaceImport(
  importSource: string,
  packages: Map<string, WorkspacePackage>
): string | null {
  // Exact package name match
  const exact = packages.get(importSource);
  if (exact?.entry) return exact.entry;

  // Sub-path import: `@acme/ui/button` → find longest matching package name
  for (const [name, pkg] of packages) {
    if (importSource.startsWith(name + "/")) {
      const subPath = importSource.slice(name.length + 1);
      const resolved = resolveSubPath(pkg.root, subPath);
      if (resolved) return resolved;
    }
  }

  return null;
}

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"];

function resolveSubPath(pkgRoot: string, subPath: string): string | null {
  const base = path.join(pkgRoot, subPath);

  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;

  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate)) return candidate;
  }

  // Try src/ prefix
  const withSrc = path.join(pkgRoot, "src", subPath);
  for (const ext of EXTENSIONS) {
    const candidate = withSrc + ext;
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}
