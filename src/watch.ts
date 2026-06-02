import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { analyze } from "./index.js";
import { renderTerminal } from "./render.js";
import { resetAliases } from "./resolver.js";
import { resetWorkspaceCache } from "./monorepo.js";

export async function runWatch(targetDir: string): Promise<void> {
  let debounce: ReturnType<typeof setTimeout> | null = null;
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    process.stdout.write("\x1Bc"); // clear terminal
    process.stdout.write(pc.dim("  Scanning…\r"));
    try {
      resetAliases();
      resetWorkspaceCache();
      const result = await analyze(targetDir);
      renderTerminal(result);
      console.log(pc.dim("  Watching for changes… (Ctrl+C to stop)"));
    } catch (err) {
      console.error(pc.red(`  Error: ${err instanceof Error ? err.message : String(err)}`));
    } finally {
      running = false;
    }
  };

  // Initial run
  await run();

  const watcher = fs.watch(
    targetDir,
    { recursive: true },
    (_event, filename) => {
      if (!filename) return;
      // Skip irrelevant paths
      if (
        filename.includes("node_modules") ||
        filename.includes(".next") ||
        filename.includes("dist") ||
        filename.includes(".git")
      )
        return;
      if (!/\.(tsx?|jsx?|mjs|mts)$/.test(filename)) return;

      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(run, 400);
    }
  );

  process.on("SIGINT", () => {
    watcher.close();
    console.log(pc.dim("\n  Stopped watching."));
    process.exit(0);
  });

  // Keep process alive
  await new Promise(() => {});
}
