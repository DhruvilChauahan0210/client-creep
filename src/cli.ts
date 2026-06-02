import { cac } from "cac";
import pc from "picocolors";
import { analyze } from "./index.js";
import { renderTerminal, renderJson } from "./render.js";

const cli = cac("client-creep");

cli
  .command("[dir]", "Analyze a Next.js project for client component creep")
  .option("--dir <path>", "Path to the Next.js project (alias for positional arg)")
  .option("--json", "Output results as JSON")
  .option("--ci", "CI mode: exit 1 if client creep is detected")
  .option("--budget <kb>", "Fail CI if estimated client JS exceeds this KB threshold")
  .action(async (dir: string = ".", options: { dir?: string; json?: boolean; ci?: boolean; budget?: string }) => {
    const targetDir = options.dir ?? dir ?? ".";

    try {
      if (!options.json) {
        process.stdout.write(pc.dim("  Scanning…\r"));
      }

      const result = await analyze(targetDir);

      if (options.json) {
        renderJson(result);
      } else {
        renderTerminal(result);
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
cli.version("0.1.0");
cli.parse();
