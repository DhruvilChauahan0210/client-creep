import type { AnalysisResult } from "./types.js";
import path from "node:path";

export interface PushOptions {
  token: string;
  /** Dashboard base URL — defaults to the hosted dashboard */
  dashboardUrl?: string;
  /** Override repo owner (defaults to git remote origin owner) */
  owner?: string;
  /** Override repo name (defaults to git remote origin name or directory name) */
  repo?: string;
}

export interface PushResult {
  ok: boolean;
  analysisId?: string;
  dashboardUrl?: string;
  error?: string;
}

/** Attempt to read owner/name from `git remote get-url origin` */
async function detectRepoFromGit(projectRoot: string): Promise<{ owner: string; name: string } | null> {
  try {
    const { execa } = await import("execa");
    const { stdout } = await execa("git", ["remote", "get-url", "origin"], { cwd: projectRoot });
    const url = stdout.trim();

    // SSH: git@github.com:owner/repo.git
    const sshMatch = url.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
    if (sshMatch) return { owner: sshMatch[1], name: sshMatch[2] };

    // HTTPS: https://github.com/owner/repo.git
    const httpsMatch = url.match(/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
    if (httpsMatch) return { owner: httpsMatch[1], name: httpsMatch[2] };
  } catch {}
  return null;
}

export async function pushToDashboard(
  result: AnalysisResult,
  options: PushOptions,
  scanDurationMs?: number
): Promise<PushResult> {
  const dashboardUrl = (options.dashboardUrl ?? "https://client-creep-dashboard.vercel.app").replace(/\/$/, "");

  // Resolve owner/name
  let owner = options.owner;
  let repoName = options.repo;

  if (!owner || !repoName) {
    const detected = await detectRepoFromGit(result.projectRoot);
    if (detected) {
      owner = owner ?? detected.owner;
      repoName = repoName ?? detected.name;
    } else {
      // Fall back to directory name
      owner = owner ?? "unknown";
      repoName = repoName ?? path.basename(result.projectRoot);
    }
  }

  const payload = {
    token: options.token,
    owner,
    name: repoName,
    totalFiles: result.totalFiles,
    summary: {
      clientComponents: result.clientGraph.length,
      clientBoundaries: result.clientBoundaries.length,
      creepCandidates: result.creepCandidates.length,
      estimatedClientBytes: result.totalClientBytes,
      recoverableBytes: result.recoverableBytes,
    },
    scanDurationMs: scanDurationMs ?? null,
    engineVersion: "client-creep@0.3.0",
    // Include full JSON payload for the detail view
    payload: {
      projectRoot: result.projectRoot,
      totalFiles: result.totalFiles,
      creepCandidates: result.creepCandidates.map(c => ({
        file: c.displayPath,
        recoverableKb: c.recoverableBytes / 1024,
        chain: c.whyTrace.chain
          .map(f => result.clientGraph.find(n => n.filePath === f)?.displayPath ?? f)
          .join(" → "),
        signals: c.whyTrace.chain.length,
      })),
      boundaries: result.clientBoundaries.map(b => ({
        file: b.displayPath,
        signals: b.clientSignals.length,
        kb: b.sizeBytes / 1024,
      })),
    },
  };

  try {
    const response = await fetch(`${dashboardUrl}/api/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json() as Record<string, unknown>;

    if (!response.ok) {
      return { ok: false, error: (json.error as string) ?? `HTTP ${response.status}` };
    }

    return {
      ok: true,
      analysisId: json.analysisId as string,
      dashboardUrl: json.dashboard as string,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Network error: ${message}` };
  }
}
