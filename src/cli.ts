import { cac } from "cac";
import pc from "picocolors";
import path from "node:path";
import { analyze } from "./index.js";
import { renderTerminal, renderJson } from "./render.js";
import { renderHtml } from "./render-html.js";
import { runWatch } from "./watch.js";
import { pushToDashboard } from "./push.js";

const cli = cac("client-creep");

cli
  .command("[dir]", "Analyze a Next.js project for client component creep")
  .option("--dir <path>",       "Path to the Next.js project (alias for positional arg)")
  .option("--json",             "Output results as JSON")
  .option("--html [file]",      "Write an interactive HTML report (default: client-creep-report.html)")
  .option("--watch",            "Watch for file changes and re-run analysis")
  .option("--ci",               "CI mode: exit 1 if client creep is detected")
  .option("--budget <kb>",      "Fail CI if estimated client JS exceeds this KB threshold")
  .option("--push",             "Push results to the client-creep dashboard")
  .option("--token <token>",    "Supabase access token for --push (get from dashboard → Settings)")
  .option("--dashboard <url>",  "Dashboard URL (default: https://client-creep-dashboard.vercel.app)")
  .option("--owner <owner>",    "Repo owner override for --push (default: auto-detected from git remote)")
  .option("--repo <name>",      "Repo name override for --push (default: auto-detected from git remote)")
  .action(async (
    dir: string = ".",
    options: {
      dir?: string;
      json?: boolean;
      html?: boolean | string;
      watch?: boolean;
      ci?: boolean;
      budget?: string;
      push?: boolean;
      token?: string;
      dashboard?: string;
      owner?: string;
      repo?: string;
    }
  ) => {
    const targetDir = options.dir ?? dir ?? ".";

    // Watch mode — hand off entirely
    if (options.watch) {
      await runWatch(path.resolve(targetDir));
      return;
    }

    // Validate --push requires --token
    if (options.push && !options.token) {
      console.error(pc.red("  Error: --push requires --token"));
      console.error(pc.dim("  Get your token from the dashboard → Settings → Access Token"));
      console.error(pc.dim("  Usage: npx client-creep --push --token <your-token>"));
      process.exit(1);
    }

    try {
      const showSpinner = !options.json && !options.html;
      if (showSpinner) {
        process.stdout.write(pc.dim("  Scanning…\r"));
      }

      const scanStart = Date.now();
      const result = await analyze(targetDir);
      const scanDurationMs = Date.now() - scanStart;

      // HTML report
      if (options.html !== undefined && options.html !== false) {
        const outFile = typeof options.html === "string"
          ? options.html
          : "client-creep-report.html";
        renderHtml(result, outFile);
        if (!options.json) {
          console.log(pc.green(`  ✓ HTML report written to ${outFile}`));
        }
      }

      // Terminal or JSON output
      if (options.json) {
        renderJson(result);
      } else if (!options.html) {
        renderTerminal(result);
      }

      // Push to dashboard
      if (options.push && options.token) {
        if (!options.json) {
          process.stdout.write(pc.dim("  Pushing to dashboard…\r"));
        }

        const pushResult = await pushToDashboard(
          result,
          {
            token:        options.token,
            dashboardUrl: options.dashboard,
            owner:        options.owner,
            repo:         options.repo,
          },
          scanDurationMs
        );

        if (!options.json) {
          if (pushResult.ok) {
            console.log(pc.green(`  ✓ Pushed to dashboard`));
            if (pushResult.dashboardUrl) {
              console.log(pc.dim(`    ${pushResult.dashboardUrl}`));
            }
          } else {
            console.error(pc.red(`  ✗ Push failed: ${pushResult.error}`));
          }
        }
      }

      // CI exit code logic
      if (options.ci || options.budget) {
        const budgetKb = options.budget ? Number(options.budget) : undefined;
        let failed = false;

        if (budgetKb !== undefined) {
          const actualKb = result.totalClientBytes / 1024;
          if (actualKb > budgetKb) {
            failed = true;
            if (!options.json) {
              console.error(pc.red(`\n  ✗ client-creep: budget exceeded`));
              console.error(pc.red(`    ${actualKb.toFixed(1)} KB client JS > ${budgetKb} KB limit`));
              console.error(pc.dim(`    Run without --ci to see the full report and where to recover KB.`));
            }
          }
        }

        if (options.ci && result.creepCandidates.length > 0) {
          failed = true;
          if (!options.json) {
            console.error(pc.red(`\n  ✗ client-creep: ${result.creepCandidates.length} accidental creep candidates found`));
            console.error(pc.dim(`    ~${(result.recoverableBytes / 1024).toFixed(0)} KB potentially recoverable.`));
            console.error(pc.dim(`    Run without --ci to see the full report.`));
          }
        }

        if (!failed && !options.json) {
          console.log(pc.green(`  ✓ client-creep: no issues found`));
        }

        if (failed) process.exit(1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`  Error: ${message}`));
      process.exit(1);
    }
  });

cli.help();
cli.version("0.2.1");
cli.parse();
