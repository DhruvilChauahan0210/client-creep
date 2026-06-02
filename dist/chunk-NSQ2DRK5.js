#!/usr/bin/env node

// src/glob.ts
import { glob } from "tinyglobby";
import path from "path";
import fs from "fs";
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
  const files = await glob(patterns, {
    cwd: projectRoot,
    ignore: IGNORE_PATTERNS,
    absolute: true,
    followSymbolicLinks: false
  });
  return files.filter((f) => fs.existsSync(f));
}
function resolveProjectRoot(dir) {
  const resolved = path.resolve(dir);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Directory not found: ${resolved}`);
  }
  return resolved;
}

// src/graph.ts
import path3 from "path";
import fs4 from "fs";

// src/parser.ts
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import fs2 from "fs";
var traverse = _traverse.default ?? _traverse;
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
    code = fs2.readFileSync(filePath, "utf-8");
  } catch {
    return { hasUseClient: false, imports: [], clientSignals: [] };
  }
  let ast;
  try {
    ast = parse(code, {
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
import path2 from "path";
import fs3 from "fs";
import { getTsconfig } from "get-tsconfig";
var EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"];
var _aliases = null;
function loadAliases(projectRoot) {
  if (_aliases) return _aliases;
  let options = {};
  try {
    const result = getTsconfig(projectRoot);
    options = result?.config?.compilerOptions ?? {};
  } catch {
    options = readTsconfigDirect(projectRoot);
  }
  const baseUrl = options.baseUrl ? path2.resolve(projectRoot, options.baseUrl) : projectRoot;
  const rawPaths = options.paths ?? {};
  const paths = {};
  for (const [key, vals] of Object.entries(rawPaths)) {
    paths[key] = vals.map(
      (v) => path2.resolve(baseUrl, v.replace(/\*$/, ""))
    );
  }
  _aliases = { baseUrl, paths };
  return _aliases;
}
function readTsconfigDirect(projectRoot) {
  const tsconfigPath = path2.join(projectRoot, "tsconfig.json");
  try {
    const raw = fs3.readFileSync(tsconfigPath, "utf-8");
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
  if (fs3.existsSync(base) && fs3.statSync(base).isFile()) return base;
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (fs3.existsSync(candidate)) return candidate;
  }
  for (const ext of EXTENSIONS) {
    const candidate = path2.join(base, `index${ext}`);
    if (fs3.existsSync(candidate)) return candidate;
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
          const resolved = resolveWithExtensions(path2.join(aliasPath, suffix));
          if (resolved) return resolved;
        }
      }
    }
    return null;
  }
  const absolute = path2.resolve(importerDir, importSource);
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
      displayPath: path3.relative(projectRoot, filePath),
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
    const importerDir = path3.dirname(filePath);
    const resolvedImports = [];
    for (const importSource of rawImports) {
      const resolved = resolveImport(importSource, importerDir, aliases);
      if (!resolved) continue;
      if (nodes.has(resolved)) {
        resolvedImports.push(resolved);
        edges.get(filePath).add(resolved);
        if (!reverseEdges.has(resolved)) reverseEdges.set(resolved, /* @__PURE__ */ new Set());
        reverseEdges.get(resolved).add(filePath);
        if (isBarrelFile(resolved)) {
          const barrelExports = getBarrelExports(resolved, aliases, nodes);
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
    return fs4.statSync(filePath).size;
  } catch {
    return 0;
  }
}
function isBarrelFile(filePath) {
  const base = path3.basename(filePath, path3.extname(filePath));
  return base === "index";
}
function getBarrelExports(barrelPath, aliases, nodes) {
  const { imports } = parseFile(barrelPath);
  const barrelDir = path3.dirname(barrelPath);
  const result = [];
  for (const importSource of imports) {
    const resolved = resolveImport(importSource, barrelDir, aliases);
    if (resolved && nodes.has(resolved)) {
      result.push(resolved);
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
  const projectRoot = resolveProjectRoot(dir);
  const files = await collectSourceFiles(projectRoot);
  const graph = buildImportGraph(files, projectRoot);
  propagateClientGraph(graph);
  return buildAnalysisResult(graph, projectRoot);
}

export {
  analyze
};
