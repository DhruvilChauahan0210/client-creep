#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  analyze: () => analyze
});
module.exports = __toCommonJS(src_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  analyze
});
