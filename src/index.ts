import { collectSourceFiles, resolveProjectRoot, detectFramework } from "./glob.js";
import { buildImportGraph, propagateClientGraph } from "./graph.js";
import { buildAnalysisResult } from "./analyze.js";
import { resetAliases } from "./resolver.js";
import { findMonorepoRoot, loadWorkspacePackages, resetWorkspaceCache } from "./monorepo.js";
import { setWorkspacePackages } from "./resolver.js";
import type { AnalysisResult } from "./types.js";

export type { AnalysisResult, ComponentNode, CreepCandidate, WhyTrace, CliOptions } from "./types.js";

export async function analyze(dir: string = "."): Promise<AnalysisResult> {
  resetAliases();
  resetWorkspaceCache();
  const projectRoot = resolveProjectRoot(dir);

  // Monorepo: detect workspace root and load packages for cross-package resolution
  const monorepoRoot = findMonorepoRoot(projectRoot);
  if (monorepoRoot) {
    const packages = await loadWorkspacePackages(monorepoRoot);
    setWorkspacePackages(packages);
  } else {
    setWorkspacePackages(new Map());
  }

  const framework = detectFramework(projectRoot);
  const files = await collectSourceFiles(projectRoot);
  const graph = buildImportGraph(files, projectRoot);
  propagateClientGraph(graph);
  return buildAnalysisResult(graph, projectRoot, framework);
}
