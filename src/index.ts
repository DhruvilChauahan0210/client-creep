import { collectSourceFiles, resolveProjectRoot } from "./glob.js";
import { buildImportGraph, propagateClientGraph } from "./graph.js";
import { buildAnalysisResult } from "./analyze.js";
import { resetAliases } from "./resolver.js";
import type { AnalysisResult } from "./types.js";

export type { AnalysisResult, ComponentNode, CreepCandidate, WhyTrace, CliOptions } from "./types.js";

export async function analyze(dir: string = "."): Promise<AnalysisResult> {
  resetAliases();
  const projectRoot = resolveProjectRoot(dir);
  const files = await collectSourceFiles(projectRoot);
  const graph = buildImportGraph(files, projectRoot);
  propagateClientGraph(graph);
  return buildAnalysisResult(graph, projectRoot);
}
