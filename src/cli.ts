import { cac } from "cac";
import pc from "picocolors";
import { analyze } from "./index.js";
import { renderTerminal, renderJson } from "./render.js";

const cli = cac("client-creep");

cli
  .command("[dir]", "Analyze a Next.js project for client component creep")
  .option("--json", "Output results as JSON")
  .option("--ci", "CI mode: exit 1 if client creep is detected")
  .option("--budget <kb>", "Fail CI if estimated client JS exceeds this KB threshold")
  .action(async (dir: string = ".", options: { json?: boolean; ci?: boolean; budget?: string }) => {
    const targetDir = dir ?? ".";

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

        if (budgetKb !== undefined) {
          const actualKb = result.totalClientBytes / 1024;
          if (actualKb > budgetKb) {
            if (!options.json) {
              console.error(
                pc.red(
                  `  ✗ Budget exceeded: ${actualKb.toFixed(1)} KB client JS > ${budgetKb} KB limit`
                )
              );
            }
            process.exit(1);
          }
        }

        if (options.ci && result.creepCandidates.length > 0) {
          if (!options.json) {
            console.error(
              pc.red(
                `  ✗ ${result.creepCandidates.length} accidental client creep candidates detected`
              )
            );
          }
          process.exit(1);
        }
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
