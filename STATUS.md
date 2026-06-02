# client-creep — Build Status
**Last updated:** 2026-06-02 · **Against:** PRD Draft v1

---

## TL;DR

Day 1 engine work is **complete and tested on real production apps**. The core pipeline (glob → parse → graph → propagate → trace → render) is fully working. Day 2 polish work (README, GIF, npm publish, `--html`) has **not started**.

---

## PRD Feature Checklist

### F1 — Zero-config project scan
| Item | Status | Notes |
|---|---|---|
| Auto-detect Next app (`next.config.*`) | ✅ Done | `glob.ts` — checks 4 config variants |
| `tsconfig.json` path alias resolution | ✅ Done | `resolver.ts` via `get-tsconfig` |
| Relative import resolution | ✅ Done | With extension + index fallback |
| `--dir <path>` flag | ⚠️ Partial | Positional arg `[dir]` works; named `--dir` not wired |
| `--json` flag | ✅ Done | `renderJson()` in `render.ts` |
| `--html` flag | ❌ Not started | v0.2 per PRD |
| `--ci` flag | ✅ Done | Exits 1 on creep candidates |
| `--budget <kb>` flag | ✅ Done | Exits 1 if client JS exceeds threshold |

### F2 — `"use client"` boundary detection
| Item | Status | Notes |
|---|---|---|
| Parse `.tsx/.jsx/.ts/.js` files via Babel AST | ✅ Done | `parser.ts` — error recovery enabled |
| Detect top-of-file `"use client"` directive | ✅ Done | Reads `ast.program.directives` |
| Build import graph (module → imports) | ✅ Done | `graph.ts` — directed adjacency + reverse edges |
| Transitive client propagation (BFS) | ✅ Done | `propagateClientGraph()` in `graph.ts` |
| Export re-export tracking | ✅ Done | `ExportAllDeclaration` + `ExportNamedDeclaration` |

### F3 — The "WHY" trace (signature feature)
| Item | Status | Notes |
|---|---|---|
| Shortest path from boundary to component | ✅ Done | BFS through reverse edges in `analyze.ts` |
| Rendered as indented tree in terminal | ✅ Done | `renderChain()` in `render.ts` |
| Shows client signals that justified boundary | ✅ Done | Displayed alongside boundary in output |
| Flags boundary as "possibly unnecessary" if no signals | ✅ Done | Separate section in terminal render |

### F4 — Accidental-creep detection
| Item | Status | Notes |
|---|---|---|
| Flag client nodes with no client-only signals | ✅ Done | `detectCreepCandidates()` in `analyze.ts` |
| Ranked by recoverable bytes (biggest wins first) | ✅ Done | Sorted descending in output |
| Conservative phrasing ("candidate / review") | ✅ Done | "No client-only signals detected" language |

### F5 — Cost estimation
| Item | Status | Notes |
|---|---|---|
| Per-file size via `fs.stat` | ✅ Done | `safeStatSize()` in `graph.ts` |
| Total client bytes across graph | ✅ Done | Summed in `buildAnalysisResult()` |
| Recoverable bytes from creep candidates | ✅ Done | Summed from `creepCandidates` |
| Clearly labeled as estimate | ✅ Done | Footer: "raw source bytes" disclaimer |
| node_modules package size lookup | ❌ Not done | PRD says v0.1 = file bytes only ✓ |

### F6 — Terminal output
| Item | Status | Notes |
|---|---|---|
| Amber (client) + blue (server) color language | ✅ Done | `picocolors` yellow/blue throughout |
| Summary header | ✅ Done | Files, components, KB, recoverable |
| Client boundaries section | ✅ Done | Signals shown, deps listed |
| Creep candidates section (ranked) | ✅ Done | Why trace + bytes per candidate |
| Unnecessary boundaries section | ✅ Done | "Possibly unnecessary" with evidence |
| "Looks good enough to post on X" | ✅ Done | Validated on SuperrLMS (534 files) |

---

## Signal Detection Accuracy

Validated against two real production apps (SuperrAdmin 312 files, SuperrLMS 534 files).

| Signal Type | Status | Details |
|---|---|---|
| Built-in React hooks (`useState`, `useEffect`, etc.) | ✅ | Via `use[A-Z]` pattern — catches ALL hooks, not just listed ones |
| Third-party hooks (`useMutation`, `useQuery`, etc.) | ✅ | Same `use[A-Z]` pattern — fixed during real-app test |
| `React.useXxx()` namespaced calls | ✅ | MemberExpression visitor — fixed during real-app test |
| Event handler props (`onClick`, `onChange`, etc.) | ✅ | JSXAttribute `on[A-Z]` pattern |
| Browser globals (`window`, `document`, `localStorage`, etc.) | ✅ | `BROWSER_GLOBALS` set |
| `dynamic({ssr: false})` | ✅ | CallExpression visitor — fixed during real-app test |
| Client-only packages (`@radix-ui/*`, `@apollo/client`, `sonner`, etc.) | ✅ | Org-prefix matching — fixed during real-app test |
| `createBrowserClient` (Supabase) | ✅ | `BROWSER_ONLY_CALLS` set |

**False positive reduction:** SuperrAdmin: 135 → 72 candidates (−47%) after parser fixes.

---

## Real-App Validation Results

| App | Files | Client | Boundaries | Est. Client JS | Recoverable | Creep |
|---|---|---|---|---|---|---|
| SuperrAdmin | 312 | 287 (92%) | 93 | ~1.4 MB | ~107 KB | 72 |
| SuperrLMS | 534 | 418 (78%) | 182 | ~2.3 MB | ~237 KB | 113 |

Scan time on SuperrLMS (534 files): **<2 seconds** ✅ (PRD target: <5s)

---

## Test Coverage

- **8 tests, all passing** (`vitest run`)
- Covers: file scanning, boundary detection, client graph propagation, creep candidates, why traces, server component exclusion, byte counting
- Fixture: `fixtures/next14-app` with intentional creep patterns (Carousel, NavItem)

---

## What's NOT Done (Gap vs PRD)

### Must-do before launch

| Item | PRD Ref | Priority |
|---|---|---|
| **README** — GIF above fold, comparison table, `npx` line, "Next 13–16" badge | §9, §12 Day 2 H9 | 🔴 Critical |
| **Record the launch GIF** (15s terminal demo on a real app) | §9.5 P3 | 🔴 Critical — "90% of potential growth" |
| **Publish to npm** (`npm publish`) | §12 Day 2 H10 | 🔴 Blocks `npx` usage |
| **`--dir <path>` named flag** (vs positional arg) | F1 | 🟡 Minor — positional arg works |

### v0.2 (post-launch, days 3–10)

| Item | PRD Ref |
|---|---|
| `--html` interactive D3 boundary graph | §6.2 |
| GitHub Action + PR comment bot | §6.2 |
| Barrel-file / re-export resolution | §6.2 |
| `--watch` mode | §6.2 |
| Monorepo workspace resolution | §6.2 |
| Dynamic `import()` handling | §6.2 |

### Known limitations (documented, not bugs)

| Limitation | Impact |
|---|---|
| Helpers calling `localStorage` through abstraction layers not detected | Some `session-manager.ts`-style files flagged as no-signal |
| Barrel files (`index.ts` re-exporting many modules) may miss some transitive edges | Minor under-count in large design systems |
| `node_modules` package size not included in estimates | Estimates are conservative (source bytes only) |

---

## Next Actions (ordered)

1. **README** — write it, get the comparison table in, copy-paste `npx` line
2. **Record the GIF** — run on a real recognizable OSS Next.js app (not your own private repos)
3. **`npm publish`** — flip the switch
4. **Launch posts** — X thread, r/nextjs, HN Show HN

---

## PRD Acceptance Criteria Check

> *"On a sample Next 14 app, `npx client-creep` runs in <5s, prints the summary + at least one correct "why" trace + one accidental-creep flag, and **looks good enough to post on X without editing.**"*

| Criterion | Status |
|---|---|
| Runs in <5s | ✅ <2s on 534 files |
| Correct "why" trace | ✅ Validated on fixture + 2 real apps |
| Accidental-creep flag | ✅ 72–113 candidates found on real apps |
| Looks good enough to post on X | ✅ Terminal output is screenshot-ready |
| Works via `npx` | ❌ Not published yet |
