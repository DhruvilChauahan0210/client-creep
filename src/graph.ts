import path from "node:path";
import fs from "node:fs";
import type { ComponentNode, ImportGraph } from "./types.js";
import { parseFile } from "./parser.js";
import { resolveImport, loadAliases, type TsPathAliases } from "./resolver.js";

export function buildImportGraph(
  files: string[],
  projectRoot: string
): ImportGraph {
  const nodes = new Map<string, ComponentNode>();
  const edges = new Map<string, Set<string>>();
  const reverseEdges = new Map<string, Set<string>>();
  const aliases = loadAliases(projectRoot);

  // Per-file raw imports (before resolution) and re-export sources — used for barrel detection
  const rawImportsRecord = new Map<string, string[]>();
  const reExportSourcesMap = new Map<string, Set<string>>();

  // First pass: parse all files
  for (const filePath of files) {
    const { hasUseClient, imports, reExportSources, clientSignals } = parseFile(filePath);
    const sizeBytes = safeStatSize(filePath);

    nodes.set(filePath, {
      filePath,
      displayPath: path.relative(projectRoot, filePath),
      isClientBoundary: hasUseClient,
      isClientGraph: hasUseClient,
      clientSignals,
      imports: [],
      sizeBytes,
    });

    edges.set(filePath, new Set());
    reverseEdges.set(filePath, new Set());
    rawImportsRecord.set(filePath, imports);
    reExportSourcesMap.set(filePath, new Set(reExportSources));
  }

  // Second pass: resolve imports and build edges
  for (const [filePath, node] of nodes) {
    const rawImports = rawImportsRecord.get(filePath) ?? [];
    const importerDir = path.dirname(filePath);
    const resolvedImports: string[] = [];

    for (const importSource of rawImports) {
      const resolved = resolveImport(importSource, importerDir, aliases);
      if (!resolved) continue;

      if (nodes.has(resolved)) {
        resolvedImports.push(resolved);
        edges.get(filePath)!.add(resolved);
        if (!reverseEdges.has(resolved)) reverseEdges.set(resolved, new Set());
        reverseEdges.get(resolved)!.add(filePath);

        // If the resolved file is a barrel, also wire direct edges to everything
        // it re-exports so client propagation follows through barrel chains
        if (isBarrelFile(resolved, reExportSourcesMap, rawImportsRecord)) {
          const barrelExports = getBarrelExports(
            resolved,
            aliases,
            nodes,
            reExportSourcesMap,
            rawImportsRecord
          );
          for (const exported of barrelExports) {
            if (!edges.get(filePath)!.has(exported)) {
              edges.get(filePath)!.add(exported);
              if (!reverseEdges.has(exported)) reverseEdges.set(exported, new Set());
              reverseEdges.get(exported)!.add(filePath);
            }
          }
        }
      }
    }

    node.imports = resolvedImports;
  }

  return { nodes, edges, reverseEdges };
}

export function propagateClientGraph(graph: ImportGraph): void {
  // BFS from all client boundary roots
  const queue: string[] = [];

  for (const [filePath, node] of graph.nodes) {
    if (node.isClientBoundary) {
      queue.push(filePath);
    }
  }

  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const node = graph.nodes.get(current);
    if (node) {
      node.isClientGraph = true;
    }

    // Propagate to all files this node imports
    const imported = graph.edges.get(current);
    if (imported) {
      for (const dep of imported) {
        if (!visited.has(dep)) {
          queue.push(dep);
        }
      }
    }
  }
}

function safeStatSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

/**
 * A barrel is a file whose purpose is to re-export from other modules.
 * Criteria: named `index.*`, OR has re-export sources but no own (non-re-export) imports.
 */
function isBarrelFile(
  filePath: string,
  reExportSourcesMap: Map<string, Set<string>>,
  rawImportsRecord: Map<string, string[]>
): boolean {
  const base = path.basename(filePath, path.extname(filePath));
  if (base === "index") return true;

  const reExports = reExportSourcesMap.get(filePath);
  if (!reExports || reExports.size === 0) return false;

  // Pure barrel: every import in the file is a re-export source
  const rawImports = rawImportsRecord.get(filePath) ?? [];
  return rawImports.every((imp) => reExports.has(imp));
}

/**
 * Returns all files transitively re-exported by a barrel, recursing through
 * nested barrels with cycle protection.
 */
function getBarrelExports(
  barrelPath: string,
  aliases: TsPathAliases,
  nodes: Map<string, ComponentNode>,
  reExportSourcesMap: Map<string, Set<string>>,
  rawImportsRecord: Map<string, string[]>,
  visited = new Set<string>()
): string[] {
  if (visited.has(barrelPath)) return [];
  visited.add(barrelPath);

  const reExports = reExportSourcesMap.get(barrelPath) ?? new Set<string>();
  const barrelDir = path.dirname(barrelPath);
  const result: string[] = [];

  for (const importSource of reExports) {
    const resolved = resolveImport(importSource, barrelDir, aliases);
    if (!resolved || !nodes.has(resolved)) continue;
    result.push(resolved);
    // Recurse if the re-exported file is itself a barrel
    if (isBarrelFile(resolved, reExportSourcesMap, rawImportsRecord)) {
      result.push(
        ...getBarrelExports(resolved, aliases, nodes, reExportSourcesMap, rawImportsRecord, visited)
      );
    }
  }

  return result;
}
