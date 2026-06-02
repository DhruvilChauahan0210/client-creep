import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyze } from "../index.js";
import type { AnalysisResult } from "../types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, "../../fixtures/next14-app");

let result: AnalysisResult;

beforeAll(async () => {
  result = await analyze(FIXTURE);
});

describe("fixture: next14-app", () => {
  it("scans all source files", () => {
    expect(result.totalFiles).toBeGreaterThan(0);
  });

  it("detects client boundaries", () => {
    const boundaryPaths = result.clientBoundaries.map((b) => b.displayPath);
    expect(boundaryPaths.some((p) => p.includes("ProductCard"))).toBe(true);
    expect(boundaryPaths.some((p) => p.includes("DashboardNav"))).toBe(true);
  });

  it("does not mark pure server components as client", () => {
    const serverPaths = result.serverGraph.map((n) => n.displayPath);
    expect(serverPaths.some((p) => p.includes("StaticBanner"))).toBe(true);
  });

  it("propagates client graph transitively", () => {
    const clientPaths = result.clientGraph.map((n) => n.displayPath);
    // Carousel has no "use client" but is imported by ProductCard
    expect(clientPaths.some((p) => p.includes("Carousel"))).toBe(true);
    // NavItem has no "use client" but is imported by DashboardNav
    expect(clientPaths.some((p) => p.includes("NavItem"))).toBe(true);
  });

  it("detects creep candidates (no client signals)", () => {
    const creepPaths = result.creepCandidates.map((c) => c.displayPath);
    expect(creepPaths.some((p) => p.includes("Carousel"))).toBe(true);
    expect(creepPaths.some((p) => p.includes("NavItem"))).toBe(true);
  });

  it("does not flag components with real client signals as creep", () => {
    const creepPaths = result.creepCandidates.map((c) => c.displayPath);
    // ProductCard has useState + onClick
    expect(creepPaths.some((p) => p.includes("ProductCard"))).toBe(false);
    // DashboardNav has useEffect
    expect(creepPaths.some((p) => p.includes("DashboardNav"))).toBe(false);
  });

  it("computes why traces for client graph nodes", () => {
    const carouselNode = result.clientGraph.find((n) =>
      n.displayPath.includes("Carousel")
    );
    expect(carouselNode).toBeDefined();

    const trace = result.whyTraces.get(carouselNode!.filePath);
    expect(trace).toBeDefined();
    expect(trace!.chain.length).toBeGreaterThan(1);
    // Boundary root should be ProductCard
    const boundaryRel = path.relative(FIXTURE, trace!.boundaryRoot);
    expect(boundaryRel).toContain("ProductCard");
  });

  it("reports total client bytes > 0", () => {
    expect(result.totalClientBytes).toBeGreaterThan(0);
  });
});
