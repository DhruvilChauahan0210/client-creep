import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type {
  ImportDeclaration,
  ExportAllDeclaration,
  ExportNamedDeclaration,
  Directive,
  ImportExpression,
} from "@babel/types";
import fs from "node:fs";

// babel/traverse ships as CJS with a default export; unwrap it in ESM context
const traverse = ((_traverse as unknown as { default: typeof _traverse }).default ?? _traverse);

// React hooks follow the use[A-Z] naming convention — match any of them, not just built-ins
const HOOK_PATTERN = /^use[A-Z]/;

// Non-hook browser globals that are definitive client signals
const BROWSER_GLOBALS = new Set([
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "navigator",
  "location",
  "history",
  "indexedDB",
  "crypto",
  "performance",
]);

// Known browser-only factory/constructor calls (not hooks, not globals)
const BROWSER_ONLY_CALLS = new Set([
  "createBrowserClient",       // @supabase/ssr
  "createClientComponentClient", // @supabase/auth-helpers-nextjs
  "createClient",              // generic pattern — detected by import source
  "IntersectionObserver",
  "ResizeObserver",
  "MutationObserver",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "matchMedia",
]);

// Known client-only package imports — importing these is itself a signal.
// Org-level prefixes (e.g. "@radix-ui/") match any sub-package.
const CLIENT_ONLY_PACKAGES = new Set([
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
  "react-quill",
]);

const EVENT_PROP_PATTERN = /^on[A-Z]/;

export interface ParseResult {
  hasUseClient: boolean;
  imports: string[];
  /** Sources from `export * from` / `export { } from` statements — used for barrel detection */
  reExportSources: string[];
  clientSignals: string[];
}

export function parseFile(filePath: string): ParseResult {
  let code: string;
  try {
    code = fs.readFileSync(filePath, "utf-8");
  } catch {
    return { hasUseClient: false, imports: [], reExportSources: [], clientSignals: [] };
  }

  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
      errorRecovery: true,
    });
  } catch {
    return { hasUseClient: false, imports: [], reExportSources: [], clientSignals: [] };
  }

  const imports: string[] = [];
  const reExportSources: string[] = [];
  const foundSignals = new Set<string>();

  // Check directives ("use client" / "use server")
  const hasUseClient = ast.program.directives.some(
    (d: Directive) => d.value.value === "use client"
  );

  traverse(ast, {
    ImportDeclaration(nodePath: NodePath<ImportDeclaration>) {
      const source = nodePath.node.source.value;
      imports.push(source);

      // Exact match, single-segment package match, or org-prefix match (e.g. "@radix-ui/")
      const isClientPkg =
        CLIENT_ONLY_PACKAGES.has(source) ||
        CLIENT_ONLY_PACKAGES.has(source.split("/").slice(0, source.startsWith("@") ? 2 : 1).join("/")) ||
        [...CLIENT_ONLY_PACKAGES].some((pkg) => pkg.endsWith("/") && source.startsWith(pkg));

      if (isClientPkg) {
        foundSignals.add(source);
      }
    },

    ExportAllDeclaration(nodePath: NodePath<ExportAllDeclaration>) {
      if (nodePath.node.source) {
        const src = nodePath.node.source.value;
        imports.push(src);
        reExportSources.push(src);
      }
    },

    ExportNamedDeclaration(nodePath: NodePath<ExportNamedDeclaration>) {
      if (nodePath.node.source) {
        const src = nodePath.node.source.value;
        imports.push(src);
        reExportSources.push(src);
      }
    },

    // Dynamic import() — add to import graph so propagation follows through lazy boundaries
    ImportExpression(nodePath: NodePath<ImportExpression>) {
      const src = nodePath.node.source;
      if (src.type === "StringLiteral") {
        imports.push(src.value);
      }
    },

    Identifier(nodePath) {
      const name = nodePath.node.name;
      const parent = nodePath.parent;
      const isImportSpecifier =
        parent.type === "ImportSpecifier" ||
        parent.type === "ImportDefaultSpecifier" ||
        parent.type === "ImportNamespaceSpecifier";

      if (isImportSpecifier) return;

      // Any use[A-Z]* call is a React hook — definitively client
      if (HOOK_PATTERN.test(name)) {
        // Must be called (CallExpression) or destructured (not just referenced as a value)
        if (
          parent.type === "CallExpression" ||
          parent.type === "VariableDeclarator" ||
          parent.type === "ArrayPattern" ||
          parent.type === "ObjectPattern"
        ) {
          foundSignals.add(name);
        }
      }

      // Browser globals
      if (BROWSER_GLOBALS.has(name)) {
        foundSignals.add(name);
      }

      // Browser-only constructor/factory calls
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

      // browser globals: window.xxx, document.xxx, etc.
      if (obj.type === "Identifier" && BROWSER_GLOBALS.has(obj.name)) {
        foundSignals.add(obj.name);
      }

      // React.useXxx(...) — namespaced hook call
      if (
        obj.type === "Identifier" &&
        obj.name === "React" &&
        prop.type === "Identifier" &&
        HOOK_PATTERN.test(prop.name)
      ) {
        foundSignals.add(`React.${prop.name}`);
      }
    },

    // next/dynamic with { ssr: false } is an explicit client signal
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;
      const args = nodePath.node.arguments;
      const isDynamic =
        (callee.type === "Identifier" && callee.name === "dynamic") ||
        (callee.type === "MemberExpression" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "dynamic");

      if (isDynamic && args.length >= 2) {
        const opts = args[1];
        if (opts?.type === "ObjectExpression") {
          const ssrProp = opts.properties.find(
            (p) =>
              p.type === "ObjectProperty" &&
              ((p.key.type === "Identifier" && p.key.name === "ssr") ||
                (p.key.type === "StringLiteral" && p.key.value === "ssr"))
          );
          if (
            ssrProp &&
            ssrProp.type === "ObjectProperty" &&
            ssrProp.value.type === "BooleanLiteral" &&
            ssrProp.value.value === false
          ) {
            foundSignals.add("dynamic(ssr:false)");
          }
        }
      }
    },
  });

  return {
    hasUseClient,
    imports,
    reExportSources,
    clientSignals: Array.from(foundSignals),
  };
}
