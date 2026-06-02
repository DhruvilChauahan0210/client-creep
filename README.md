# client-creep

**The CLI that tells you _why_ your Next.js components are client components — and what they cost you.**

```bash
npx client-creep
```

> _"You have client creep. Here's the cure."_

![client-creep demo](https://raw.githubusercontent.com/DhruvilChauahan0210/client-creep/main/demo.gif)

---

## The problem

React Server Components split your app into server and client — but the boundary **spreads silently**. You added `"use client"` to one file months ago. Now half your tree is client and you have no idea which import dragged it there.

Three questions no existing tool answers together:

1. **Why is this a client component?** — which `"use client"` file pulled it in, and through which import chain?
2. **Did it need to be?** — or is it client purely by accident, with zero hooks or browser APIs?
3. **What is it costing you?** — how much JS is this boundary shipping to the browser?

`client-creep` answers all three. One command. Zero setup. Any Next.js version.

---

## Demo

Running on a real 534-file Next.js app:

```
────────────────────────────────────────────────────────────
  client-creep  Next.js client component analysis
────────────────────────────────────────────────────────────

  Project:              /your-next-app
  Files scanned:        534
  Client components:    418  (182 boundaries)
  Estimated client JS:  2.29 MB  (estimate — raw source bytes)
  Potentially recoverable:  237.4 KB  (113 creep candidates)

────────────────────────────────────────────────────────────
  Client Boundaries
────────────────────────────────────────────────────────────

  ⚡ src/app/home/Home.tsx  signals: useRouter, useState, useEffect, useUser
     └─ src/hooks/use-classrooms.ts
     └─ src/hooks/use-people.ts
     └─ src/hooks/use-user.ts
     └─ … and 7 more

  ⚡ src/context/file-explorer-context.tsx  signals: useState, useCallback, useContext
     └─ src/lib/graphql/files/types/types.ts

────────────────────────────────────────────────────────────
  ⚠  Accidental Client Creep  — components that may not need to be client
────────────────────────────────────────────────────────────

  ⚠ src/app/chat-insights/components/EmptyStates.tsx  19.7 KB potentially recoverable
    No client-only signals detected (no hooks, event handlers, or browser APIs)
    Why client:
    ⚡ src/app/chat-insights/page.tsx ← use client
      └─ src/app/chat-insights/components/index.ts
           └─ src/app/chat-insights/components/EmptyStates.tsx

  ⚠ src/design-system/foundations/typography.ts  5.7 KB potentially recoverable
    No client-only signals detected (no hooks, event handlers, or browser APIs)
    Why client:
    ⚡ src/app/gradebook/page.tsx ← use client
      └─ src/design-system/foundations/typography.ts
```

---

## Install

No install needed for one-shot use:

```bash
npx client-creep
```

Or install globally:

```bash
npm install -g client-creep
client-creep
```

**Requirements:** Node ≥ 18. Works on **Next.js 13, 14, 15, and 16**.

---

## Usage

```bash
# Scan the current directory
npx client-creep

# Scan a specific project
npx client-creep ./path/to/next-app

# JSON output (for scripts, CI, tooling)
npx client-creep --json

# CI mode — exits 1 if any accidental creep is detected
npx client-creep --ci

# Fail CI if estimated client JS exceeds a size budget
npx client-creep --budget 500   # fail if > 500 KB
```

### Flags

| Flag | Description |
|---|---|
| `[dir]` | Path to the Next.js project (default: `.`) |
| `--json` | Output results as JSON |
| `--ci` | Exit code 1 if creep candidates are found |
| `--budget <kb>` | Exit code 1 if estimated client JS exceeds this KB |

---

## What it detects

**Client boundary roots** — files with a `"use client"` directive, showing:
- Which client-only signals justified the boundary (`useState`, `useEffect`, `onClick`, `window`, `@apollo/client`, `@radix-ui/*`, etc.)
- Which files were pulled into the client graph as a result

**Accidental creep candidates** — files that are in the client graph but have _no client-only signals_ of their own. These are candidates to hoist back to server components (or pass as `children` props).

**The "why" trace** — for every accidental creep candidate, the exact import chain from the `"use client"` boundary to that file. No more guessing.

**Size estimates** — total estimated client JS and how much is potentially recoverable. Labeled as estimates (raw source bytes — run `@next/bundle-analyzer` for exact bundle impact).

---

## CI usage

Add to your GitHub Actions workflow:

```yaml
- name: Check for client creep
  run: npx client-creep --ci --budget 1000
```

Exits 1 if:
- `--ci`: any accidental creep candidates are detected
- `--budget <kb>`: estimated client JS exceeds the threshold

Use `--json` to pipe results into other tools:

```bash
npx client-creep --json | jq '.summary'
```

---

## How it works

`client-creep` is a **static analyzer** — it reads your source files directly, no app running required.

1. Globs all `.ts/.tsx/.js/.jsx` files (respects `.next/`, `node_modules/`, `dist/` ignores)
2. Parses each file with a Babel AST — detects `"use client"` directives and extracts imports
3. Resolves imports to absolute paths, including `tsconfig.json` path aliases (`@/*`, etc.)
4. Builds a directed import graph and propagates the client boundary via BFS
5. For each client node, computes the shortest import path back to its `"use client"` root
6. Flags nodes with no detected client signals as accidental creep candidates
7. Renders the terminal report (or JSON)

**Client signal detection covers:** React hooks (`useState`, `useEffect`, and any `use[A-Z]*` hook — including third-party like `useMutation`, `useQuery`), event handler props (`onClick`, `onChange`, etc.), browser globals (`window`, `document`, `localStorage`, etc.), `dynamic({ssr: false})`, and known client-only packages (`@radix-ui/*`, `@apollo/client`, `framer-motion`, `sonner`, and more).

---

## vs. the alternatives

| | [rsc-boundary](https://github.com/foxted/rsc-boundary) | [next-component-analyzer](https://github.com/cinfinit/next-component-analyzer) | **client-creep** |
|---|---|---|---|
| How to use | Add provider + run app | `npx` | **`npx` — one shot, zero setup** |
| Next.js versions | **16+ only** | any | **13 / 14 / 15 / 16** |
| "Where is the boundary?" | ✅ live overlay | ❌ | ✅ |
| "Why is this client?" | ❌ | ❌ | ✅ **full import chain trace** |
| "Did it need to be?" | ❌ | partial | ✅ **accidental creep detection** |
| "What does it cost?" | ❌ | ❌ | ✅ **estimated KB per boundary** |
| CI / exit codes | ❌ | weak | ✅ `--ci` + `--budget` |
| Works without running the app | ❌ | ✅ | ✅ |

`rsc-boundary` has a beautiful live overlay — if you're on Next 16 and want to see boundaries paint on your running page, it's great. `client-creep` is for when you want to understand _why_ the boundary is there and what it's costing you, in one command, on any Next version.

---

## Limitations (v0.1)

- **Static analysis approximates the real bundler graph.** Dynamic `import()`, conditional `"use client"`, and tree-shaking aren't modeled. Treat size numbers as estimates.
- **Barrel files** (`index.ts` re-exporting many modules) may miss some transitive edges.
- **Monorepo workspace imports** are not resolved (v0.2).
- Signals called through abstraction layers (e.g. a helper that internally calls `localStorage`) won't be detected without following the full call graph.

---

## Roadmap

**v0.2 (coming soon)**
- `--html` — interactive boundary graph (D3 force graph, shareable)
- GitHub Action with PR comment ("client creep +40KB in this PR")
- Barrel file + monorepo resolution
- `--watch` mode

**v0.3+**
- ESLint plugin (`eslint-plugin-client-creep`) for inline editor warnings
- Hosted dashboard — track creep trend over time per repo

---

## License

MIT
