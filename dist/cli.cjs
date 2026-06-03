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
var import_picocolors3 = __toESM(require("picocolors"), 1);
var import_node_path7 = __toESM(require("path"), 1);

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
var import_node_path4 = __toESM(require("path"), 1);
var import_node_fs5 = __toESM(require("fs"), 1);

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
    return { hasUseClient: false, imports: [], reExportSources: [], clientSignals: [] };
  }
  let ast;
  try {
    ast = (0, import_parser.parse)(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
      errorRecovery: true
    });
  } catch {
    return { hasUseClient: false, imports: [], reExportSources: [], clientSignals: [] };
  }
  const imports = [];
  const reExportSources = [];
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
        const src = nodePath.node.source.value;
        imports.push(src);
        reExportSources.push(src);
      }
    },
    ExportNamedDeclaration(nodePath) {
      if (nodePath.node.source) {
        const src = nodePath.node.source.value;
        imports.push(src);
        reExportSources.push(src);
      }
    },
    // Dynamic import() — add to import graph so propagation follows through lazy boundaries
    ImportExpression(nodePath) {
      const src = nodePath.node.source;
      if (src.type === "StringLiteral") {
        imports.push(src.value);
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
    reExportSources,
    clientSignals: Array.from(foundSignals)
  };
}

// src/resolver.ts
var import_node_path3 = __toESM(require("path"), 1);
var import_node_fs4 = __toESM(require("fs"), 1);
var import_get_tsconfig = require("get-tsconfig");

// src/monorepo.ts
var import_node_path2 = __toESM(require("path"), 1);
var import_node_fs3 = __toESM(require("fs"), 1);
var import_tinyglobby2 = require("tinyglobby");
var _workspaceCache = null;
function resetWorkspaceCache() {
  _workspaceCache = null;
}
function findMonorepoRoot(projectRoot) {
  let dir = projectRoot;
  const root = import_node_path2.default.parse(dir).root;
  while (dir !== root) {
    if (import_node_fs3.default.existsSync(import_node_path2.default.join(dir, "pnpm-workspace.yaml")) || import_node_fs3.default.existsSync(import_node_path2.default.join(dir, "turbo.json")) || hasWorkspacesField(import_node_path2.default.join(dir, "package.json"))) {
      if (dir !== projectRoot) return dir;
    }
    dir = import_node_path2.default.dirname(dir);
  }
  return null;
}
function hasWorkspacesField(pkgPath) {
  try {
    const pkg = JSON.parse(import_node_fs3.default.readFileSync(pkgPath, "utf-8"));
    return Array.isArray(pkg.workspaces) || typeof pkg.workspaces === "object";
  } catch {
    return false;
  }
}
function getWorkspacePatterns(monorepoRoot) {
  const pnpmWs = import_node_path2.default.join(monorepoRoot, "pnpm-workspace.yaml");
  if (import_node_fs3.default.existsSync(pnpmWs)) {
    const content = import_node_fs3.default.readFileSync(pnpmWs, "utf-8");
    const matches = content.match(/^\s*-\s*['"]?([^'"#\n]+?)['"]?\s*$/gm);
    if (matches) {
      return matches.map((m) => m.replace(/^\s*-\s*['"]?/, "").replace(/['"]?\s*$/, "").trim());
    }
  }
  const pkgPath = import_node_path2.default.join(monorepoRoot, "package.json");
  try {
    const pkg = JSON.parse(import_node_fs3.default.readFileSync(pkgPath, "utf-8"));
    const ws = pkg.workspaces;
    if (Array.isArray(ws)) return ws;
    if (Array.isArray(ws?.packages)) return ws.packages;
  } catch {
  }
  return ["packages/*", "apps/*"];
}
async function loadWorkspacePackages(monorepoRoot) {
  if (_workspaceCache) return _workspaceCache;
  const patterns = getWorkspacePatterns(monorepoRoot);
  const packageDirs = await (0, import_tinyglobby2.glob)(
    patterns.map((p) => `${p}/package.json`),
    { cwd: monorepoRoot, absolute: true }
  );
  const map = /* @__PURE__ */ new Map();
  for (const pkgJsonPath of packageDirs) {
    try {
      const pkg = JSON.parse(import_node_fs3.default.readFileSync(pkgJsonPath, "utf-8"));
      const pkgRoot = import_node_path2.default.dirname(pkgJsonPath);
      const name = pkg.name;
      if (!name) continue;
      const entry = resolvePackageEntry(pkgRoot, pkg);
      map.set(name, { name, root: pkgRoot, entry });
    } catch {
    }
  }
  _workspaceCache = map;
  return map;
}
function resolvePackageEntry(pkgRoot, pkg) {
  const candidates = [
    pkg.source,
    // unbundled source — best for monorepos
    pkg.module,
    pkg.main,
    "src/index.ts",
    "src/index.tsx",
    "index.ts",
    "index.tsx",
    "src/index.js",
    "index.js"
  ].filter(Boolean);
  for (const candidate of candidates) {
    const full = import_node_path2.default.resolve(pkgRoot, candidate);
    if (import_node_fs3.default.existsSync(full)) return full;
  }
  return null;
}
function resolveWorkspaceImport(importSource, packages) {
  const exact = packages.get(importSource);
  if (exact?.entry) return exact.entry;
  for (const [name, pkg] of packages) {
    if (importSource.startsWith(name + "/")) {
      const subPath = importSource.slice(name.length + 1);
      const resolved = resolveSubPath(pkg.root, subPath);
      if (resolved) return resolved;
    }
  }
  return null;
}
var EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
function resolveSubPath(pkgRoot, subPath) {
  const base = import_node_path2.default.join(pkgRoot, subPath);
  if (import_node_fs3.default.existsSync(base) && import_node_fs3.default.statSync(base).isFile()) return base;
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (import_node_fs3.default.existsSync(candidate)) return candidate;
  }
  const withSrc = import_node_path2.default.join(pkgRoot, "src", subPath);
  for (const ext of EXTENSIONS) {
    const candidate = withSrc + ext;
    if (import_node_fs3.default.existsSync(candidate)) return candidate;
  }
  return null;
}

// src/resolver.ts
var EXTENSIONS2 = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"];
var _aliases = null;
var _workspacePackages = /* @__PURE__ */ new Map();
function setWorkspacePackages(packages) {
  _workspacePackages = packages;
}
function loadAliases(projectRoot) {
  if (_aliases) return _aliases;
  let options = {};
  try {
    const result = (0, import_get_tsconfig.getTsconfig)(projectRoot);
    options = result?.config?.compilerOptions ?? {};
  } catch {
    options = readTsconfigDirect(projectRoot);
  }
  const baseUrl = options.baseUrl ? import_node_path3.default.resolve(projectRoot, options.baseUrl) : projectRoot;
  const rawPaths = options.paths ?? {};
  const paths = {};
  for (const [key, vals] of Object.entries(rawPaths)) {
    paths[key] = vals.map(
      (v) => import_node_path3.default.resolve(baseUrl, v.replace(/\*$/, ""))
    );
  }
  _aliases = { baseUrl, paths };
  return _aliases;
}
function readTsconfigDirect(projectRoot) {
  const tsconfigPath = import_node_path3.default.join(projectRoot, "tsconfig.json");
  try {
    const raw = import_node_fs4.default.readFileSync(tsconfigPath, "utf-8");
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
  if (import_node_fs4.default.existsSync(base) && import_node_fs4.default.statSync(base).isFile()) return base;
  for (const ext of EXTENSIONS2) {
    const candidate = base + ext;
    if (import_node_fs4.default.existsSync(candidate)) return candidate;
  }
  for (const ext of EXTENSIONS2) {
    const candidate = import_node_path3.default.join(base, `index${ext}`);
    if (import_node_fs4.default.existsSync(candidate)) return candidate;
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
          const resolved = resolveWithExtensions(import_node_path3.default.join(aliasPath, suffix));
          if (resolved) return resolved;
        }
      }
    }
    if (_workspacePackages.size > 0) {
      const wsResolved = resolveWorkspaceImport(importSource, _workspacePackages);
      if (wsResolved) return wsResolved;
    }
    return null;
  }
  const absolute = import_node_path3.default.resolve(importerDir, importSource);
  return resolveWithExtensions(absolute);
}

// src/graph.ts
function buildImportGraph(files, projectRoot) {
  const nodes = /* @__PURE__ */ new Map();
  const edges = /* @__PURE__ */ new Map();
  const reverseEdges = /* @__PURE__ */ new Map();
  const aliases = loadAliases(projectRoot);
  const rawImportsRecord = /* @__PURE__ */ new Map();
  const reExportSourcesMap = /* @__PURE__ */ new Map();
  for (const filePath of files) {
    const { hasUseClient, imports, reExportSources, clientSignals } = parseFile(filePath);
    const sizeBytes = safeStatSize(filePath);
    nodes.set(filePath, {
      filePath,
      displayPath: import_node_path4.default.relative(projectRoot, filePath),
      isClientBoundary: hasUseClient,
      isClientGraph: hasUseClient,
      clientSignals,
      imports: [],
      sizeBytes
    });
    edges.set(filePath, /* @__PURE__ */ new Set());
    reverseEdges.set(filePath, /* @__PURE__ */ new Set());
    rawImportsRecord.set(filePath, imports);
    reExportSourcesMap.set(filePath, new Set(reExportSources));
  }
  for (const [filePath, node] of nodes) {
    const rawImports = rawImportsRecord.get(filePath) ?? [];
    const importerDir = import_node_path4.default.dirname(filePath);
    const resolvedImports = [];
    for (const importSource of rawImports) {
      const resolved = resolveImport(importSource, importerDir, aliases);
      if (!resolved) continue;
      if (nodes.has(resolved)) {
        resolvedImports.push(resolved);
        edges.get(filePath).add(resolved);
        if (!reverseEdges.has(resolved)) reverseEdges.set(resolved, /* @__PURE__ */ new Set());
        reverseEdges.get(resolved).add(filePath);
        if (isBarrelFile(resolved, reExportSourcesMap, rawImportsRecord)) {
          const barrelExports = getBarrelExports(
            resolved,
            aliases,
            nodes,
            reExportSourcesMap,
            rawImportsRecord
          );
          for (const exported of barrelExports) {
            if (!edges.get(filePath).has(exported)) {
              edges.get(filePath).add(exported);
              if (!reverseEdges.has(exported)) reverseEdges.set(exported, /* @__PURE__ */ new Set());
              reverseEdges.get(exported).add(filePath);
            }
          }
        }
      }
    }
    node.imports = resolvedImports;
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
    return import_node_fs5.default.statSync(filePath).size;
  } catch {
    return 0;
  }
}
function isBarrelFile(filePath, reExportSourcesMap, rawImportsRecord) {
  const base = import_node_path4.default.basename(filePath, import_node_path4.default.extname(filePath));
  if (base === "index") return true;
  const reExports = reExportSourcesMap.get(filePath);
  if (!reExports || reExports.size === 0) return false;
  const rawImports = rawImportsRecord.get(filePath) ?? [];
  return rawImports.every((imp) => reExports.has(imp));
}
function getBarrelExports(barrelPath, aliases, nodes, reExportSourcesMap, rawImportsRecord, visited = /* @__PURE__ */ new Set()) {
  if (visited.has(barrelPath)) return [];
  visited.add(barrelPath);
  const reExports = reExportSourcesMap.get(barrelPath) ?? /* @__PURE__ */ new Set();
  const barrelDir = import_node_path4.default.dirname(barrelPath);
  const result = [];
  for (const importSource of reExports) {
    const resolved = resolveImport(importSource, barrelDir, aliases);
    if (!resolved || !nodes.has(resolved)) continue;
    result.push(resolved);
    if (isBarrelFile(resolved, reExportSourcesMap, rawImportsRecord)) {
      result.push(
        ...getBarrelExports(resolved, aliases, nodes, reExportSourcesMap, rawImportsRecord, visited)
      );
    }
  }
  return result;
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
  resetWorkspaceCache();
  const projectRoot = resolveProjectRoot(dir);
  const monorepoRoot = findMonorepoRoot(projectRoot);
  if (monorepoRoot) {
    const packages = await loadWorkspacePackages(monorepoRoot);
    setWorkspacePackages(packages);
  } else {
    setWorkspacePackages(/* @__PURE__ */ new Map());
  }
  const files = await collectSourceFiles(projectRoot);
  const graph = buildImportGraph(files, projectRoot);
  propagateClientGraph(graph);
  return buildAnalysisResult(graph, projectRoot);
}

// src/render.ts
var import_picocolors = __toESM(require("picocolors"), 1);
var import_node_path5 = __toESM(require("path"), 1);
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
  const dir = import_node_path5.default.dirname(p);
  const base = import_node_path5.default.basename(p);
  return import_picocolors.default.dim(dir === "." ? "" : dir + "/") + base;
}
function renderChain(chain, projectRoot) {
  const lines = [];
  for (let i = 0; i < chain.length; i++) {
    const filePath = chain[i];
    const rel = import_node_path5.default.relative(projectRoot, filePath);
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
        (f) => import_node_path5.default.relative(result.projectRoot, f)
      )
    }))
  };
  console.log(JSON.stringify(output, null, 2));
}

// src/render-html.ts
var import_node_fs6 = __toESM(require("fs"), 1);
var import_node_path6 = __toESM(require("path"), 1);
function formatBytes2(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function renderHtml(result, outputPath) {
  const html = buildHtml(result);
  import_node_fs6.default.writeFileSync(outputPath, html, "utf-8");
}
function buildHtml(result) {
  const nodes = [];
  const links = [];
  const nodeIndex = /* @__PURE__ */ new Map();
  const visibleFiles = /* @__PURE__ */ new Set();
  for (const n of result.clientGraph) visibleFiles.add(n.filePath);
  for (const b of result.clientBoundaries) {
    const node = result.clientGraph.find((n) => n.filePath === b.filePath);
    if (node) node.imports.forEach((i) => visibleFiles.add(i));
  }
  const isCreep = new Set(result.creepCandidates.map((c) => c.filePath));
  let idx = 0;
  for (const filePath of visibleFiles) {
    const node = result.clientGraph.find((n) => n.filePath === filePath) || result.serverGraph.find((n) => n.filePath === filePath);
    if (!node) continue;
    let type = "server";
    if (node.isClientBoundary) type = "boundary";
    else if (isCreep.has(filePath)) type = "creep";
    else if (node.isClientGraph) type = "client";
    const trace = result.whyTraces.get(filePath);
    nodes.push({
      id: idx,
      label: import_node_path6.default.basename(filePath),
      path: node.displayPath,
      type,
      size: node.sizeBytes,
      signals: node.clientSignals,
      whyChain: trace ? trace.chain.map((f) => import_node_path6.default.relative(result.projectRoot, f)) : []
    });
    nodeIndex.set(filePath, idx);
    idx++;
  }
  for (const [filePath, deps] of Object.entries(
    Object.fromEntries(
      [...visibleFiles].map((f) => {
        const node = result.clientGraph.find((n) => n.filePath === f) || result.serverGraph.find((n) => n.filePath === f);
        return [f, node?.imports ?? []];
      })
    )
  )) {
    const sourceIdx = nodeIndex.get(filePath);
    if (sourceIdx === void 0) continue;
    for (const dep of deps) {
      const targetIdx = nodeIndex.get(dep);
      if (targetIdx !== void 0) {
        links.push({ source: sourceIdx, target: targetIdx });
      }
    }
  }
  const data = JSON.stringify({ nodes, links });
  const summary = {
    totalFiles: result.totalFiles,
    clientComponents: result.clientGraph.length,
    clientBoundaries: result.clientBoundaries.length,
    serverComponents: result.serverGraph.length,
    estimatedClientJs: formatBytes2(result.totalClientBytes),
    recoverable: formatBytes2(result.recoverableBytes),
    creepCandidates: result.creepCandidates.length,
    projectRoot: result.projectRoot
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>client-creep \u2014 ${import_node_path6.default.basename(result.projectRoot)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #1e1e2e; --surface: #181825; --overlay: #313244;
    --text: #cdd6f4; --subtext: #a6adc8; --dim: #585b70;
    --amber: #f9e2af; --amber-dim: #f38ba820;
    --blue: #89b4fa; --blue-dim: #89b4fa20;
    --red: #f38ba8; --red-dim: #f38ba820;
    --green: #a6e3a1; --mauve: #cba6f7;
    --border: #313244;
  }
  body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

  /* Header */
  #header { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
  #header h1 { font-size: 15px; font-weight: 700; color: var(--amber); letter-spacing: -0.3px; }
  #header .project { font-size: 12px; color: var(--dim); }
  .stats { display: flex; gap: 16px; margin-left: auto; }
  .stat { text-align: center; }
  .stat .val { font-size: 18px; font-weight: 700; line-height: 1; }
  .stat .lbl { font-size: 10px; color: var(--subtext); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
  .stat.client .val { color: var(--amber); }
  .stat.server .val { color: var(--blue); }
  .stat.creep .val { color: var(--red); }
  .stat.recover .val { color: var(--green); }

  /* Legend */
  #legend { padding: 8px 20px; border-bottom: 1px solid var(--border); display: flex; gap: 16px; align-items: center; flex-shrink: 0; }
  #legend span { font-size: 11px; color: var(--subtext); }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 4px; vertical-align: middle; }
  .dot.boundary { background: var(--amber); }
  .dot.creep { background: var(--red); }
  .dot.client { background: #fab387; }
  .dot.server { background: var(--blue); }
  .filter-btn { background: var(--overlay); border: 1px solid var(--border); color: var(--subtext); padding: 3px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.15s; }
  .filter-btn:hover, .filter-btn.active { background: var(--amber); color: var(--bg); border-color: var(--amber); }
  #search { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 4px 10px; border-radius: 4px; font-size: 12px; width: 180px; margin-left: auto; outline: none; }
  #search:focus { border-color: var(--amber); }

  /* Main */
  #main { display: flex; flex: 1; overflow: hidden; }
  #graph-container { flex: 1; position: relative; overflow: hidden; }
  svg { width: 100%; height: 100%; }

  /* Sidebar */
  #sidebar { width: 300px; border-left: 1px solid var(--border); overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; }
  #sidebar.empty { display: flex; align-items: center; justify-content: center; color: var(--dim); font-size: 13px; }
  .detail-header { font-weight: 600; font-size: 13px; word-break: break-all; }
  .detail-path { font-size: 11px; color: var(--dim); margin-top: 2px; word-break: break-all; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; margin-top: 6px; }
  .badge.boundary { background: var(--amber-dim); color: var(--amber); }
  .badge.creep { background: var(--red-dim); color: var(--red); }
  .badge.client { background: #fab38720; color: #fab387; }
  .badge.server { background: var(--blue-dim); color: var(--blue); }
  .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--dim); margin-top: 8px; }
  .signal-tag { display: inline-block; background: var(--overlay); color: var(--subtext); padding: 2px 6px; border-radius: 3px; font-size: 11px; margin: 2px 2px 0 0; font-family: monospace; }
  .chain { font-size: 12px; line-height: 1.8; }
  .chain-item { color: var(--subtext); padding-left: 0; }
  .chain-item.boundary-node { color: var(--amber); font-weight: 600; }
  .chain-arrow { color: var(--dim); margin-right: 4px; }
  .no-node { color: var(--dim); font-size: 13px; text-align: center; margin-top: 40px; }

  /* D3 styles */
  .node circle { cursor: pointer; transition: r 0.1s; stroke-width: 1.5px; }
  .node circle.boundary { fill: var(--amber); stroke: #f9e2af80; }
  .node circle.creep { fill: var(--red); stroke: #f38ba880; }
  .node circle.client { fill: #fab387; stroke: #fab38780; }
  .node circle.server { fill: var(--blue); stroke: #89b4fa80; }
  .node circle:hover { stroke-width: 3px; }
  .node circle.selected { stroke-width: 3px; stroke: white; }
  .link { stroke: var(--dim); stroke-opacity: 0.4; stroke-width: 1; }
  .link.client-link { stroke: var(--amber); stroke-opacity: 0.2; }
  .node text { font-size: 9px; fill: var(--subtext); pointer-events: none; }

  /* Scrollbar */
  #sidebar::-webkit-scrollbar { width: 4px; }
  #sidebar::-webkit-scrollbar-track { background: transparent; }
  #sidebar::-webkit-scrollbar-thumb { background: var(--overlay); border-radius: 2px; }
</style>
</head>
<body>

<div id="header">
  <h1>\u26A1 client-creep</h1>
  <span class="project">${summary.projectRoot}</span>
  <div class="stats">
    <div class="stat client"><div class="val">${summary.clientComponents}</div><div class="lbl">client</div></div>
    <div class="stat"><div class="val" style="color:var(--mauve)">${summary.clientBoundaries}</div><div class="lbl">boundaries</div></div>
    <div class="stat server"><div class="val">${summary.serverComponents}</div><div class="lbl">server</div></div>
    <div class="stat creep"><div class="val">${summary.creepCandidates}</div><div class="lbl">creep</div></div>
    <div class="stat recover"><div class="val">${summary.recoverable}</div><div class="lbl">recoverable</div></div>
    <div class="stat"><div class="val" style="color:var(--amber)">${summary.estimatedClientJs}</div><div class="lbl">est. client JS</div></div>
  </div>
</div>

<div id="legend">
  <span><span class="dot boundary"></span>use client boundary</span>
  <span><span class="dot creep"></span>accidental creep</span>
  <span><span class="dot client"></span>client (transitive)</span>
  <span><span class="dot server"></span>server</span>
  <button class="filter-btn active" data-filter="all">All</button>
  <button class="filter-btn" data-filter="boundaries">Boundaries only</button>
  <button class="filter-btn" data-filter="creep">Creep only</button>
  <input id="search" type="text" placeholder="Search files\u2026">
</div>

<div id="main">
  <div id="graph-container">
    <svg id="graph"></svg>
  </div>
  <div id="sidebar">
    <div class="no-node">Click a node to inspect it</div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script>
const RAW = ${data};
const TYPES = { boundary: 0, creep: 1, client: 2, server: 3 };
let currentFilter = 'all';
let searchQuery = '';
let selectedId = null;

function getVisibleNodes() {
  return RAW.nodes.filter(n => {
    if (currentFilter === 'boundaries' && n.type !== 'boundary') return false;
    if (currentFilter === 'creep' && n.type !== 'creep') return false;
    if (searchQuery && !n.path.toLowerCase().includes(searchQuery)) return false;
    return true;
  });
}

function nodeRadius(n) {
  const base = n.type === 'boundary' ? 7 : n.type === 'creep' ? 6 : 4;
  return base + Math.min(Math.sqrt(n.size / 500), 5);
}

let simulation, svg, linkGroup, nodeGroup;

function render() {
  const visibleNodes = getVisibleNodes();
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleLinks = RAW.links.filter(l =>
    visibleIds.has(typeof l.source === 'object' ? l.source.id : l.source) &&
    visibleIds.has(typeof l.target === 'object' ? l.target.id : l.target)
  );

  const container = document.getElementById('graph-container');
  const W = container.clientWidth, H = container.clientHeight;

  d3.select('#graph').selectAll('*').remove();

  svg = d3.select('#graph')
    .attr('viewBox', [0, 0, W, H])
    .call(d3.zoom().scaleExtent([0.1, 4]).on('zoom', (e) => {
      g.attr('transform', e.transform);
    }));

  const g = svg.append('g');

  simulation = d3.forceSimulation(visibleNodes)
    .force('link', d3.forceLink(visibleLinks).id(d => d.id).distance(60).strength(0.3))
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 4));

  linkGroup = g.append('g')
    .selectAll('line')
    .data(visibleLinks)
    .join('line')
    .attr('class', l => {
      const src = typeof l.source === 'object' ? l.source : visibleNodes.find(n => n.id === l.source);
      return 'link' + (src && (src.type === 'boundary' || src.type === 'client') ? ' client-link' : '');
    });

  nodeGroup = g.append('g')
    .selectAll('g')
    .data(visibleNodes)
    .join('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    )
    .on('click', (e, d) => { e.stopPropagation(); selectNode(d); });

  nodeGroup.append('circle')
    .attr('r', d => nodeRadius(d))
    .attr('class', d => d.type + (d.id === selectedId ? ' selected' : ''));

  nodeGroup.append('text')
    .attr('dy', d => nodeRadius(d) + 10)
    .attr('text-anchor', 'middle')
    .text(d => d.label);

  simulation.on('tick', () => {
    linkGroup
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nodeGroup.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
  });

  svg.on('click', () => { selectedId = null; updateSidebar(null); });
}

function selectNode(d) {
  selectedId = d.id;
  d3.selectAll('.node circle').attr('class', n => n.type + (n.id === selectedId ? ' selected' : ''));
  updateSidebar(d);
}

function updateSidebar(node) {
  const sb = document.getElementById('sidebar');
  if (!node) {
    sb.innerHTML = '<div class="no-node">Click a node to inspect it</div>';
    return;
  }

  const badgeLabel = { boundary: '\u26A1 use client boundary', creep: '\u26A0 accidental creep', client: 'client (transitive)', server: 'server component' };
  const signalsHtml = node.signals.length
    ? node.signals.map(s => \`<span class="signal-tag">\${s}</span>\`).join('')
    : '<span style="color:var(--dim);font-size:12px">none detected</span>';

  const chainHtml = node.whyChain.length > 1
    ? node.whyChain.map((f, i) => {
        const isBoundary = i === 0;
        return \`<div class="chain-item \${isBoundary ? 'boundary-node' : ''}">
          \${i > 0 ? '<span class="chain-arrow">' + '  '.repeat(i) + '\u2514\u2500</span>' : '\u26A1'}
          \${f}
        </div>\`;
      }).join('')
    : '<span style="color:var(--dim);font-size:12px">this is the boundary root</span>';

  sb.innerHTML = \`
    <div>
      <div class="detail-header">\${node.label}</div>
      <div class="detail-path">\${node.path}</div>
      <span class="badge \${node.type}">\${badgeLabel[node.type]}</span>
    </div>
    <div>
      <div class="section-title">Client signals</div>
      <div style="margin-top:6px">\${signalsHtml}</div>
    </div>
    <div>
      <div class="section-title">Why client?</div>
      <div class="chain" style="margin-top:6px">\${chainHtml}</div>
    </div>
    <div>
      <div class="section-title">File size</div>
      <div style="margin-top:4px;font-size:12px;color:var(--subtext)">\${formatBytes(node.size)}</div>
    </div>
  \`;
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
  return (b/1024/1024).toFixed(2) + ' MB';
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// Search
document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase();
  render();
});

// Initial render
render();
window.addEventListener('resize', render);
</script>
</body>
</html>`;
}

// src/watch.ts
var import_node_fs7 = __toESM(require("fs"), 1);
var import_picocolors2 = __toESM(require("picocolors"), 1);
async function runWatch(targetDir) {
  let debounce = null;
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    process.stdout.write("\x1Bc");
    process.stdout.write(import_picocolors2.default.dim("  Scanning\u2026\r"));
    try {
      resetAliases();
      resetWorkspaceCache();
      const result = await analyze(targetDir);
      renderTerminal(result);
      console.log(import_picocolors2.default.dim("  Watching for changes\u2026 (Ctrl+C to stop)"));
    } catch (err) {
      console.error(import_picocolors2.default.red(`  Error: ${err instanceof Error ? err.message : String(err)}`));
    } finally {
      running = false;
    }
  };
  await run();
  const watcher = import_node_fs7.default.watch(
    targetDir,
    { recursive: true },
    (_event, filename) => {
      if (!filename) return;
      if (filename.includes("node_modules") || filename.includes(".next") || filename.includes("dist") || filename.includes(".git"))
        return;
      if (!/\.(tsx?|jsx?|mjs|mts)$/.test(filename)) return;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(run, 400);
    }
  );
  process.on("SIGINT", () => {
    watcher.close();
    console.log(import_picocolors2.default.dim("\n  Stopped watching."));
    process.exit(0);
  });
  await new Promise(() => {
  });
}

// src/cli.ts
var cli = (0, import_cac.cac)("client-creep");
cli.command("[dir]", "Analyze a Next.js project for client component creep").option("--dir <path>", "Path to the Next.js project (alias for positional arg)").option("--json", "Output results as JSON").option("--html [file]", "Write an interactive HTML report (default: client-creep-report.html)").option("--watch", "Watch for file changes and re-run analysis").option("--ci", "CI mode: exit 1 if client creep is detected").option("--budget <kb>", "Fail CI if estimated client JS exceeds this KB threshold").action(async (dir = ".", options) => {
  const targetDir = options.dir ?? dir ?? ".";
  if (options.watch) {
    await runWatch(import_node_path7.default.resolve(targetDir));
    return;
  }
  try {
    if (!options.json && !options.html) {
      process.stdout.write(import_picocolors3.default.dim("  Scanning\u2026\r"));
    }
    const result = await analyze(targetDir);
    if (options.html !== void 0 && options.html !== false) {
      const outFile = typeof options.html === "string" ? options.html : "client-creep-report.html";
      renderHtml(result, outFile);
      if (!options.json) {
        console.log(import_picocolors3.default.green(`  \u2713 HTML report written to ${outFile}`));
      }
    }
    if (options.json) {
      renderJson(result);
    } else if (!options.html) {
      renderTerminal(result);
    }
    if (options.ci || options.budget) {
      const budgetKb = options.budget ? Number(options.budget) : void 0;
      let failed = false;
      if (budgetKb !== void 0) {
        const actualKb = result.totalClientBytes / 1024;
        if (actualKb > budgetKb) {
          failed = true;
          if (!options.json) {
            console.error(import_picocolors3.default.red(`
  \u2717 client-creep: budget exceeded`));
            console.error(import_picocolors3.default.red(`    ${actualKb.toFixed(1)} KB client JS > ${budgetKb} KB limit`));
            console.error(import_picocolors3.default.dim(`    Run without --ci to see the full report and where to recover KB.`));
          }
        }
      }
      if (options.ci && result.creepCandidates.length > 0) {
        failed = true;
        if (!options.json) {
          console.error(import_picocolors3.default.red(`
  \u2717 client-creep: ${result.creepCandidates.length} accidental creep candidates found`));
          console.error(import_picocolors3.default.dim(`    ~${(result.recoverableBytes / 1024).toFixed(0)} KB potentially recoverable.`));
          console.error(import_picocolors3.default.dim(`    Run without --ci to see the full report.`));
        }
      }
      if (!failed && !options.json) {
        console.log(import_picocolors3.default.green(`  \u2713 client-creep: no issues found`));
      }
      if (failed) process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(import_picocolors3.default.red(`  Error: ${message}`));
    process.exit(1);
  }
});
cli.help();
cli.version("0.2.0");
cli.parse();
