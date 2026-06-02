export interface ComponentNode {
  filePath: string;
  /** Relative path from project root, for display */
  displayPath: string;
  isClientBoundary: boolean;
  isClientGraph: boolean;
  /** Client-only signals found in the file */
  clientSignals: string[];
  /** Imports resolved to absolute paths */
  imports: string[];
  /** Estimated raw file size in bytes */
  sizeBytes: number;
}

export interface ImportGraph {
  nodes: Map<string, ComponentNode>;
  /** adjacency list: filePath → Set of imported filePaths */
  edges: Map<string, Set<string>>;
  /** reverse adjacency: filePath → Set of files that import it */
  reverseEdges: Map<string, Set<string>>;
}

export interface WhyTrace {
  /** The component being explained */
  filePath: string;
  /** Chain from boundary root → this file */
  chain: string[];
  /** The boundary root that dragged this file into the client graph */
  boundaryRoot: string;
}

export interface CreepCandidate {
  filePath: string;
  displayPath: string;
  /** Why we think it's accidental (no detected client signals) */
  reason: string;
  /** Estimated recoverable bytes if hoisted to server */
  recoverableBytes: number;
  whyTrace: WhyTrace;
}

export interface AnalysisResult {
  projectRoot: string;
  totalFiles: number;
  clientBoundaries: ComponentNode[];
  clientGraph: ComponentNode[];
  serverGraph: ComponentNode[];
  creepCandidates: CreepCandidate[];
  totalClientBytes: number;
  recoverableBytes: number;
  whyTraces: Map<string, WhyTrace>;
}

export interface CliOptions {
  dir: string;
  json: boolean;
  html: boolean;
  ci: boolean;
  budget?: number;
}
