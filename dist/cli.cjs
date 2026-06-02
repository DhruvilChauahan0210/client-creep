#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli.ts
var import_cac = require("cac");
var import_picocolors2 = __toESM(require("picocolors"), 1);

// src/glob.ts
var import_tinyglobby = require("tinyglobby");
var import_node_path = __toESM(require("path"), 1);
var import_node_fs = __toESM(require("fs"), 1);
var SOURCE_EXTENSIONS = ["ts", "tsx", "js", "jsx", "mjs", "mts"];
var IGNORE_PATTERNS = [
  "**/node_modules/**",
  "**/.next/**",
  "**/dist/**",
  "**/build/**",
  "**/.git/**",
  "**/*.test.*",
  "**/*.spec.*",
  "**/__tests__/**"
];
async function collectSourceFiles(projectRoot) {
  const patterns = SOURCE_EXTENSIONS.map((ext) => `**/*.${ext}`);
  const files = await (0, import_tinyglobby.glob)(patterns, {
    cwd: projectRoot,
    ignore: IGNORE_PATTERNS,
    absolute: true,
    followSymbolicLinks: false
  });
  return files.filter((f) => import_node_fs.default.existsSync(f));
}
function resolveProjectRoot(dir) {
  const resolved = import_node_path.default.resolve(dir);
  if (!import_node_fs.default.existsSync(resolved)) {
    throw new Error(`Directory not found: ${resolved}`);
  }
  return resolved;
}

// src/graph.ts
var import_node_path3 = __toESM(require("path"), 1);
var import_node_fs4 = __toESM(require("fs"), 1);

// src/parser.ts
var import_parser = require("@babel/parser");
var import_traverse = __toESM(require("@babel/traverse"), 1);
var import_node_fs2 = __toESM(require("fs"), 1);
var traverse = import_traverse.default.default ?? import_traverse.default;
var HOOK_PATTERN = /^use[A-Z]/;
var BROWSER_GLOBALS = /* @__PURE__ */ new Set([
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "navigator",
  "location",
  "history",
  "indexedDB",
  "crypto",
  "performance"
]);
var BROWSER_ONLY_CALLS = /* @__PURE__ */ new Set([
  "createBrowserClient",
  // @supabase/ssr
  "createClientComponentClient",
  // @supabase/auth-helpers-nextjs
  "createClient",
  // generic pattern — detected by import source
  "IntersectionObserver",
  "ResizeObserver",
  "MutationObserver",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "matchMedia"
]);
var CLIENT_ONLY_PACKAGES = /* @__PURE__ */ new Set([
  "framer-motion",
  "react-spring",
  "lottie-react",
  "react-confetti",
  "react-hot-toast",
  "sonner",
  // Apollo / GraphQL client — needs React context, browser fetch
  "@apollo/client",
  "@apollo/react-hooks",
  // Radix UI — all primitives are DOM-interactive client components
  "@radix-ui/",
  // React Three Fiber / 3D — WebGL, entirely client
  "@react-three/fiber",
  "@react-three/drei",
  // Drag and drop
  "@dnd-kit/core",
  "@dnd-kit/sortable",
  "react-beautiful-dnd",
  // Charts
  "recharts",
  "chart.js",
  "react-chartjs-2",
  // Rich text editors
  "slate",
  "slate-react",
  "@tiptap/react",
  "react-quill"
]);
var EVENT_PROP_PATTERN = /^on[A-Z]/;
function parseFile(filePath) {
  let code;
  try {
    code = import_node_fs2.default.readFileSync(filePath, "utf-8");
  } catch {
    return { hasUseClient: false, imports: [], clientSignals: [] };
  }
  let ast;
  try {
    ast = (0, import_parser.parse)(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
      errorRecovery: true
    });
  } catch {
    return { hasUseClient: false, imports: [], clientSignals: [] };
  }
  const imports = [];
  const foundSignals = /* @__PURE__ */ new Set();
  const hasUseClient = ast.program.directives.some(
    (d) => d.value.value === "use client"
  );
  traverse(ast, {
    ImportDeclaration(nodePath) {
      const source = nodePath.node.source.value;
      imports.push(source);
      const isClientPkg = CLIENT_ONLY_PACKAGES.has(source) || CLIENT_ONLY_PACKAGES.has(source.split("/").slice(0, source.startsWith("@") ? 2 : 1).join("/")) || [...CLIENT_ONLY_PACKAGES].some((pkg) => pkg.endsWith("/") && source.startsWith(pkg));
      if (isClientPkg) {
        foundSignals.add(source);
      }
    },
    ExportAllDeclaration(nodePath) {
      if (nodePath.node.source) {
        imports.push(nodePath.node.source.value);
      }
    },
    ExportNamedDeclaration(nodePath) {
      if (nodePath.node.source) {
        imports.push(nodePath.node.source.value);
      }
    },
    Identifier(nodePath) {
      const name = nodePath.node.name;
      const parent = nodePath.parent;
      const isImportSpecifier = parent.type === "ImportSpecifier" || parent.type === "ImportDefaultSpecifier" || parent.type === "ImportNamespaceSpecifier";
      if (isImportSpecifier) return;
      if (HOOK_PATTERN.test(name)) {
        if (parent.type === "CallExpression" || parent.type === "VariableDeclarator" || parent.type === "ArrayPattern" || parent.type === "ObjectPattern") {
          foundSignals.add(name);
        }
      }
      if (BROWSER_GLOBALS.has(name)) {
        foundSignals.add(name);
      }
      if (BROWSER_ONLY_CALLS.has(name) && parent.type === "CallExpression") {
        foundSignals.add(name);
      }
    },
    JSXAttribute(nodePath) {
      const name = nodePath.node.name;
      if (name.type === "JSXIdentifier" && EVENT_PROP_PATTERN.test(name.name)) {
        foundSignals.add(name.name);
      }
    },
    MemberExpression(nodePath) {
      const { object: obj, property: prop } = nodePath.node;
      if (obj.type === "Identifier" && BROWSER_GLOBALS.has(obj.name)) {
        foundSignals.add(obj.name);
      }
      if (obj.type === "Identifier" && obj.name === "React" && prop.type === "Identifier" && HOOK_PATTERN.test(prop.name)) {
        foundSignals.add(`React.${prop.name}`);
      }
    },
    // next/dynamic with { ssr: false } is an explicit client signal
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;
      const args = nodePath.node.arguments;
      const isDynamic = callee.type === "Identifier" && callee.name === "dynamic" || callee.type === "MemberExpression" && callee.property.type === "Identifier" && callee.property.name === "dynamic";
      if (isDynamic && args.length >= 2) {
        const opts = args[1];
        if (opts?.type === "ObjectExpression") {
          const ssrProp = opts.properties.find(
            (p) => p.type === "ObjectProperty" && (p.key.type === "Identifier" && p.key.name === "ssr" || p.key.type === "StringLiteral" && p.key.value === "ssr")
          );
          if (ssrProp && ssrProp.type === "ObjectProperty" && ssrProp.value.type === "BooleanLiteral" && ssrProp.value.value === false) {
            foundSignals.add("dynamic(ssr:false)");
          }
        }
      }
    }
  });
  return {
    hasUseClient,
    imports,
    clientSignals: Array.from(foundSignals)
  };
}

// src/resolver.ts
var import_node_path2 = __toESM(require("path"), 1);
var import_node_fs3 = __toESM(require("fs"), 1);
var import_get_tsconfig = require("get-tsconfig");
var EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"];
var _aliases = null;
function loadAliases(projectRoot) {
  if (_aliases) return _aliases;
  let options = {};
  try {
    const result = (0, import_get_tsconfig.getTsconfig)(projectRoot);
    options = result?.config?.compilerOptions ?? {};
  } catch {
    options = readTsconfigDirect(projectRoot);
  }
  const baseUrl = options.baseUrl ? import_node_path2.default.resolve(projectRoot, options.baseUrl) : projectRoot;
  const rawPaths = options.paths ?? {};
  const paths = {};
  for (const [key, vals] of Object.entries(rawPaths)) {
    paths[key] = vals.map(
      (v) => import_node_path2.default.resolve(baseUrl, v.replace(/\*$/, ""))
    );
  }
  _aliases = { baseUrl, paths };
  return _aliases;
}
function readTsconfigDirect(projectRoot) {
  const tsconfigPath = import_node_path2.default.join(projectRoot, "tsconfig.json");
  try {
    const raw = import_node_fs3.default.readFileSync(tsconfigPath, "utf-8");
    const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const parsed = JSON.parse(stripped);
    return parsed.compilerOptions ?? {};
  } catch {
    return {};
  }
}
function resetAliases() {
  _aliases = null;
}
function resolveWithExtensions(base) {
  if (import_node_fs3.default.existsSync(base) && import_node_fs3.default.statSync(base).isFile()) return base;
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (import_node_fs3.default.existsSync(candidate)) return candidate;
  }
  for (const ext of EXTENSIONS) {
    const candidate = import_node_path2.default.join(base, `index${ext}`);
    if (import_node_fs3.default.existsSync(candidate)) return candidate;
  }
  return null;
}
function resolveImport(importSource, importerDir, aliases) {
  if (!importSource.startsWith(".") && !importSource.startsWith("/")) {
    for (const [aliasKey, aliasPaths] of Object.entries(aliases.paths)) {
      const aliasPrefix = aliasKey.replace(/\*$/, "");
      if (importSource.startsWith(aliasPrefix)) {
        const suffix = importSource.slice(aliasPrefix.length);
        for (const aliasPath of aliasPaths) {
          const resolved = resolveWithExtensions(import_node_path2.default.join(aliasPath, suffix));
          if (resolved) return resolved;
        }
      }
    }
    return null;
  }
  const absolute = import_node_path2.default.resolve(importerDir, importSource);
  return resolveWithExtensions(absolute);
}

// src/graph.ts
function buildImportGraph(files, projectRoot) {
  const nodes = /* @__PURE__ */ new Map();
  const edges = /* @__PURE__ */ new Map();
  const reverseEdges = /* @__PURE__ */ new Map();
  const aliases = loadAliases(projectRoot);
  for (const filePath of files) {
    const { hasUseClient, imports, clientSignals } = parseFile(filePath);
    const sizeBytes = safeStatSize(filePath);
    nodes.set(filePath, {
      filePath,
      displayPath: import_node_path3.default.relative(projectRoot, filePath),
      isClientBoundary: hasUseClient,
      isClientGraph: hasUseClient,
      // will be updated in propagation
      clientSignals,
      imports: [],
      // resolved imports added below
      sizeBytes
    });
    edges.set(filePath, /* @__PURE__ */ new Set());
    reverseEdges.set(filePath, /* @__PURE__ */ new Set());
    nodes.get(filePath)._rawImports = imports;
  }
  for (const [filePath, node] of nodes) {
    const rawImports = node._rawImports;
    const importerDir = import_node_path3.default.dirname(filePath);
    const resolvedImports = [];
    for (const importSource of rawImports) {
      const resolved = resolveImport(importSource, importerDir, aliases);
      if (resolved && nodes.has(resolved)) {
        resolvedImports.push(resolved);
        edges.get(filePath).add(resolved);
        if (!reverseEdges.has(resolved)) reverseEdges.set(resolved, /* @__PURE__ */ new Set());
        reverseEdges.get(resolved).add(filePath);
      }
    }
    node.imports = resolvedImports;
    delete node._rawImports;
  }
  return { nodes, edges, reverseEdges };
}
function propagateClientGraph(graph) {
  const queue = [];
  for (const [filePath, node] of graph.nodes) {
    if (node.isClientBoundary) {
      queue.push(filePath);
    }
  }
  const visited = /* @__PURE__ */ new Set();
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    const node = graph.nodes.get(current);
    if (node) {
      node.isClientGraph = true;
    }
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
function safeStatSize(filePath) {
  try {
    return import_node_fs4.default.statSync(filePath).size;
  } catch {
    return 0;
  }
}

// src/analyze.ts
function computeWhyTraces(graph) {
  const traces = /* @__PURE__ */ new Map();
  for (const [filePath, node] of graph.nodes) {
    if (!node.isClientGraph) continue;
    if (node.isClientBoundary) {
      traces.set(filePath, {
        filePath,
        chain: [filePath],
        boundaryRoot: filePath
      });
      continue;
    }
    const chain = bfsToNearestBoundary(filePath, graph);
    if (chain) {
      traces.set(filePath, {
        filePath,
        chain,
        boundaryRoot: chain[0]
      });
    }
  }
  return traces;
}
function bfsToNearestBoundary(startFile, graph) {
  const visited = /* @__PURE__ */ new Set();
  const queue = [
    { file: startFile, path: [startFile] }
  ];
  while (queue.length > 0) {
    const { file, path: currentPath } = queue.shift();
    if (visited.has(file)) continue;
    visited.add(file);
    const node = graph.nodes.get(file);
    if (node?.isClientBoundary) {
      return [...currentPath].reverse();
    }
    const parents = graph.reverseEdges.get(file);
    if (parents) {
      for (const parent of parents) {
        if (!visited.has(parent)) {
          queue.push({ file: parent, path: [...currentPath, parent] });
        }
      }
    }
  }
  return null;
}
function detectCreepCandidates(graph, traces) {
  const candidates = [];
  for (const [filePath, node] of graph.nodes) {
    if (!node.isClientGraph || node.isClientBoundary) continue;
    if (node.clientSignals.length === 0) {
      const trace = traces.get(filePath);
      if (!trace) continue;
      candidates.push({
        filePath,
        displayPath: node.displayPath,
        reason: "No client-only signals detected (no hooks, event handlers, or browser APIs)",
        recoverableBytes: node.sizeBytes,
        whyTrace: trace
      });
    }
  }
  return candidates.sort((a, b) => b.recoverableBytes - a.recoverableBytes);
}
function buildAnalysisResult(graph, projectRoot) {
  const whyTraces = computeWhyTraces(graph);
  const creepCandidates = detectCreepCandidates(graph, whyTraces);
  const clientBoundaries = [];
  const clientGraph = [];
  const serverGraph = [];
  let totalClientBytes = 0;
  for (const node of graph.nodes.values()) {
    if (node.isClientBoundary) clientBoundaries.push(node);
    if (node.isClientGraph) {
      clientGraph.push(node);
      totalClientBytes += node.sizeBytes;
    } else {
      serverGraph.push(node);
    }
  }
  const recoverableBytes = creepCandidates.reduce(
    (sum, c) => sum + c.recoverableBytes,
    0
  );
  return {
    projectRoot,
    totalFiles: graph.nodes.size,
    clientBoundaries,
    clientGraph,
    serverGraph,
    creepCandidates,
    totalClientBytes,
    recoverableBytes,
    whyTraces
  };
}

// src/index.ts
async function analyze(dir = ".") {
  resetAliases();
  const projectRoot = resolveProjectRoot(dir);
  const files = await collectSourceFiles(projectRoot);
  const graph = buildImportGraph(files, projectRoot);
  propagateClientGraph(graph);
  return buildAnalysisResult(graph, projectRoot);
}

// src/render.ts
var import_picocolors = __toESM(require("picocolors"), 1);
var import_node_path4 = __toESM(require("path"), 1);
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function clientLabel(text) {
  return import_picocolors.default.bold(import_picocolors.default.yellow(text));
}
function serverLabel(text) {
  return import_picocolors.default.bold(import_picocolors.default.blue(text));
}
function dimPath(p) {
  const dir = import_node_path4.default.dirname(p);
  const base = import_node_path4.default.basename(p);
  return import_picocolors.default.dim(dir === "." ? "" : dir + "/") + base;
}
function renderChain(chain, projectRoot) {
  const lines = [];
  for (let i = 0; i < chain.length; i++) {
    const filePath = chain[i];
    const rel = import_node_path4.default.relative(projectRoot, filePath);
    const indent = "  ".repeat(i);
    const connector = i === 0 ? "" : `${indent}\u2514\u2500 `;
    const isRoot = i === 0;
    const label = isRoot ? `${connector}${import_picocolors.default.bold(import_picocolors.default.yellow("\u26A1"))} ${clientLabel(rel)} ${import_picocolors.default.dim("\u2190 use client")}` : `${connector}${dimPath(rel)}`;
    lines.push(label);
  }
  return lines.join("\n");
}
function renderTerminal(result) {
  const {
    projectRoot,
    totalFiles,
    clientBoundaries,
    clientGraph,
    creepCandidates,
    totalClientBytes,
    recoverableBytes,
    whyTraces
  } = result;
  const LINE = import_picocolors.default.dim("\u2500".repeat(60));
  console.log();
  console.log(LINE);
  console.log(
    import_picocolors.default.bold("  client-creep") + import_picocolors.default.dim("  Next.js client component analysis")
  );
  console.log(LINE);
  console.log();
  console.log(
    "  " + import_picocolors.default.bold("Project:") + " " + import_picocolors.default.dim(projectRoot)
  );
  console.log(
    "  " + import_picocolors.default.bold("Files scanned:") + " " + totalFiles
  );
  console.log(
    "  " + import_picocolors.default.bold("Client components:") + " " + clientLabel(`${clientGraph.length}`) + import_picocolors.default.dim(` (${clientBoundaries.length} boundaries)`)
  );
  console.log(
    "  " + import_picocolors.default.bold("Estimated client JS:") + " " + import_picocolors.default.bold(import_picocolors.default.yellow(formatBytes(totalClientBytes))) + import_picocolors.default.dim("  (estimate \u2014 raw source bytes)")
  );
  if (recoverableBytes > 0) {
    console.log(
      "  " + import_picocolors.default.bold("Potentially recoverable:") + " " + import_picocolors.default.bold(import_picocolors.default.green(formatBytes(recoverableBytes))) + import_picocolors.default.dim(`  (${creepCandidates.length} creep candidates)`)
    );
  }
  console.log();
  if (clientBoundaries.length === 0) {
    console.log(serverLabel("  \u2713 No client boundaries found."));
    console.log();
    return;
  }
  console.log(LINE);
  console.log(import_picocolors.default.bold("  Client Boundaries"));
  console.log(LINE);
  console.log();
  for (const boundary of clientBoundaries) {
    const signals = boundary.clientSignals.length > 0 ? import_picocolors.default.dim("  signals: ") + import_picocolors.default.cyan(boundary.clientSignals.slice(0, 4).join(", ")) : import_picocolors.default.dim("  ") + import_picocolors.default.red("no client signals detected") + import_picocolors.default.dim(" \u2190 possibly unnecessary");
    console.log(
      "  " + import_picocolors.default.yellow("\u26A1") + " " + import_picocolors.default.bold(boundary.displayPath) + signals
    );
    const pulled = clientGraph.filter(
      (n) => !n.isClientBoundary && whyTraces.get(n.filePath)?.boundaryRoot === boundary.filePath
    );
    if (pulled.length > 0) {
      const shown = pulled.slice(0, 3);
      for (const dep of shown) {
        console.log("     " + import_picocolors.default.dim("\u2514\u2500") + " " + import_picocolors.default.dim(dep.displayPath));
      }
      if (pulled.length > 3) {
        console.log("     " + import_picocolors.default.dim(`\u2514\u2500 \u2026 and ${pulled.length - 3} more`));
      }
    }
    console.log();
  }
  if (creepCandidates.length > 0) {
    console.log(LINE);
    console.log(
      import_picocolors.default.bold("  \u26A0  Accidental Client Creep") + import_picocolors.default.dim("  \u2014 components that may not need to be client")
    );
    console.log(LINE);
    console.log();
    const shown = creepCandidates.slice(0, 10);
    for (const candidate of shown) {
      console.log(
        "  " + import_picocolors.default.red("\u26A0") + " " + import_picocolors.default.bold(candidate.displayPath) + "  " + import_picocolors.default.dim(formatBytes(candidate.recoverableBytes)) + " potentially recoverable"
      );
      console.log(
        "    " + import_picocolors.default.dim(candidate.reason)
      );
      const trace = candidate.whyTrace;
      if (trace.chain.length > 1) {
        console.log("    " + import_picocolors.default.dim("Why client:"));
        console.log(
          renderChain(trace.chain, projectRoot).split("\n").map((l) => "    " + l).join("\n")
        );
      }
      console.log();
    }
    if (creepCandidates.length > 10) {
      console.log(
        import_picocolors.default.dim(`  \u2026 and ${creepCandidates.length - 10} more creep candidates. Use --json for full output.`)
      );
      console.log();
    }
  }
  const unnecessaryBoundaries = clientBoundaries.filter(
    (b) => b.clientSignals.length === 0
  );
  if (unnecessaryBoundaries.length > 0) {
    console.log(LINE);
    console.log(
      import_picocolors.default.bold("  \u2139  Possibly Unnecessary Boundaries") + import_picocolors.default.dim("  \u2014 'use client' with no detected client signals")
    );
    console.log(LINE);
    console.log();
    for (const b of unnecessaryBoundaries) {
      console.log(
        "  " + import_picocolors.default.yellow("?") + " " + import_picocolors.default.bold(b.displayPath) + import_picocolors.default.dim("  \u2014 review: no hooks, event handlers, or browser APIs found")
      );
    }
    console.log();
  }
  console.log(LINE);
  console.log(
    import_picocolors.default.dim(
      "  Sizes are estimates (raw source bytes). Run npx @next/bundle-analyzer for exact bundle impact."
    )
  );
  console.log(LINE);
  console.log();
}
function renderJson(result) {
  const output = {
    projectRoot: result.projectRoot,
    totalFiles: result.totalFiles,
    summary: {
      clientComponents: result.clientGraph.length,
      clientBoundaries: result.clientBoundaries.length,
      serverComponents: result.serverGraph.length,
      estimatedClientBytes: result.totalClientBytes,
      recoverableBytes: result.recoverableBytes,
      creepCandidates: result.creepCandidates.length
    },
    boundaries: result.clientBoundaries.map((b) => ({
      file: b.displayPath,
      signals: b.clientSignals,
      sizeBytes: b.sizeBytes
    })),
    creepCandidates: result.creepCandidates.map((c) => ({
      file: c.displayPath,
      reason: c.reason,
      recoverableBytes: c.recoverableBytes,
      whyChain: c.whyTrace.chain.map(
        (f) => import_node_path4.default.relative(result.projectRoot, f)
      )
    }))
  };
  console.log(JSON.stringify(output, null, 2));
}

// src/cli.ts
var cli = (0, import_cac.cac)("client-creep");
cli.command("[dir]", "Analyze a Next.js project for client component creep").option("--json", "Output results as JSON").option("--ci", "CI mode: exit 1 if client creep is detected").option("--budget <kb>", "Fail CI if estimated client JS exceeds this KB threshold").action(async (dir = ".", options) => {
  const targetDir = dir ?? ".";
  try {
    if (!options.json) {
      process.stdout.write(import_picocolors2.default.dim("  Scanning\u2026\r"));
    }
    const result = await analyze(targetDir);
    if (options.json) {
      renderJson(result);
    } else {
      renderTerminal(result);
    }
    if (options.ci || options.budget) {
      const budgetKb = options.budget ? Number(options.budget) : void 0;
      if (budgetKb !== void 0) {
        const actualKb = result.totalClientBytes / 1024;
        if (actualKb > budgetKb) {
          if (!options.json) {
            console.error(
              import_picocolors2.default.red(
                `  \u2717 Budget exceeded: ${actualKb.toFixed(1)} KB client JS > ${budgetKb} KB limit`
              )
            );
          }
          process.exit(1);
        }
      }
      if (options.ci && result.creepCandidates.length > 0) {
        if (!options.json) {
          console.error(
            import_picocolors2.default.red(
              `  \u2717 ${result.creepCandidates.length} accidental client creep candidates detected`
            )
          );
        }
        process.exit(1);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(import_picocolors2.default.red(`  Error: ${message}`));
    process.exit(1);
  }
});
cli.help();
cli.version("0.1.0");
cli.parse();
