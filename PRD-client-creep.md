# PRD — `client-creep`
### The CLI that tells you *why* your Next.js components are client components — and what they cost you

**Status:** Draft v1 · **Owner:** Dhruvil · **Target build window:** 2 days · **Last updated:** 2026-06-02

> **One-liner:** `npx client-creep` statically analyzes any Next.js App Router project and tells you, for every client component, **why it's client**, **whether it needed to be**, and **how much JavaScript it ships** — on every Next version, with zero setup.

---

## 0. How to read this doc

This is the single source of truth for the 2-day build. Every decision below is made to **out-position the incumbent on axes they cannot quickly copy**. When in doubt during the build, the rule is: **ship the thing that makes the launch GIF more shocking, and cut everything else to v0.2.**

The doc is brutally honest on purpose — including where we are *weaker* than competitors and where we could fail. Read §4 (Competitive Analysis) and §11 (Risks) before writing a line of code.

---

## 1. The problem (why this exists)

React Server Components split every component into **server** or **client**, and the boundary is **invisible at runtime and untraceable in code**. The pain every Next.js dev feels:

1. **"Why is this a client component?"** — You added `"use client"` to one file six months ago. Now half your tree is client and you have no idea which import dragged it there. The boundary spreads silently. **This spread is the "client creep."**
2. **"Did this even need to be client?"** — Tons of components are client *by accident* — pulled in by a parent, or marked `"use client"` for one `onClick` that could have been hoisted. Each one ships unnecessary JS.
3. **"What is this costing me?"** — Every client component and its entire import subtree lands in the browser bundle. Nobody can see the size of a given boundary without diffing a full bundle analyzer.

Existing tools either (a) only *paint* the boundary without explaining it, (b) only run on the newest Next version, or (c) are abandoned. **No tool answers "why" + "should it be" + "what it costs" in one command, on any Next version.** That's the gap.

---

## 2. Vision & positioning

**Vision:** Become the default, install-free health check every Next.js developer runs on their app — the `npx` command that ships in every "Next.js performance" blog post and CI pipeline.

**Category we are creating/naming:** **"Client creep"** — the silent spread of client-component boundaries that bloat bundles. We name the disease; we sell the cure. Owning the vocabulary = owning the market.

**Positioning statement:**
> For Next.js developers who can't tell why their bundles are bloated, `client-creep` is a zero-setup CLI that traces every client-component boundary to its root cause and quantifies the cost — unlike `rsc-boundary`, which only paints boundaries on the newest Next version, or bundle analyzers, which show bytes without explaining the RSC cause.

**What we are NOT (scope discipline):**
- ❌ Not a runtime browser overlay (that's foxted's turf — we deliberately pick a *different surface*).
- ❌ Not a generic bundle analyzer (`@next/bundle-analyzer` exists; we explain the *RSC cause*, not raw bytes).
- ❌ Not an ESLint plugin (v2 maybe; CLI first for the viral `npx` moment).

---

## 3. Target users

| Persona | Pain | What they want from us |
|---|---|---|
| **Perf-conscious Next dev** (primary) | "My First Load JS is 400KB and I don't know why." | One command that names the culprits and the fix. |
| **Team lead / reviewer** | "Juniors slap `'use client'` everywhere." | A CI check that fails the PR when client creep grows. |
| **Content creator / educator** | Needs a crisp visual to explain RSC. | A beautiful, screenshot-able report. |
| **Open-source maintainer** | Wants their lib to be server-friendly. | Proof their package isn't forcing client boundaries. |

The primary persona drives the MVP. The CI persona drives retention/recurring downloads (your 10k target). The creator persona drives virality.

---

## 4. Competitive analysis (honest, detailed)

### 4.1 The landscape map

There are **two surfaces** for this problem: **runtime overlay** (paint the boundary on the live page) and **static analysis** (read the code/import graph). Plus browser/editor incumbents.

| Tool | Surface | Stars | npm/mo | Status | Next versions |
|---|---|---|---|---|---|
| **[foxted/rsc-boundary](https://github.com/foxted/rsc-boundary)** | Runtime overlay | **93** | ~3,478 (legacy pkg, now deprecated) | 🟢 Alive, active, the leader | **16+ / React 19+ only** |
| [mimifuwacc/rsc-boundary-marker](https://github.com/mimifuwacc/rsc-boundary-marker) | Lib | 29 | negligible | 🔴 Stale since Oct 2025 | — |
| [iekolvakh/rsc-boundary-marker](https://github.com/iekolvakh/rsc-boundary-marker) | Lib | 0 | negligible | 🟡 Fresh, no traction | — |
| **[cinfinit/next-component-analyzer](https://github.com/cinfinit/next-component-analyzer)** | **Static CLI** | low | **~57** | 🔴 Near-dead, v0.1.x, solo | any |
| [makotot VS Code ext](https://marketplace.visualstudio.com/items?itemName=makotot.vscode-nextjs-component-boundary-visualizer) | Editor | — | — | 🟡 Editor-only surface | — |
| [RSC Devtools (Chrome ext)](https://chrome-stats.com/d/jcejahepddjnppkhomnidalpnnnemomn) | Browser ext | — | — | 🟡 Network/streaming focus | — |
| **`client-creep` (us)** | **Static CLI** | 0 → goal 100+ | 0 → goal 10k | 🚀 Building | **13/14/15/16, any** |

### 4.2 Primary competitor — `foxted/rsc-boundary` (deep dive)

**What it is:** A dev-only runtime overlay. You wrap your root layout in `<RscBoundaryProvider>`; it paints **orange dashed outlines** on client-component roots and **blue** on server regions, with labels + a panel. Packages: `@rsc-boundary/core`, `@rsc-boundary/next`, `@rsc-boundary/start`. Homepage: rsc-boundary.valentinprugnaud.dev.

**Honest strengths (do NOT underestimate these):**
- ✅ **First-mover with real momentum** — 93 stars in ~2 months, active commits, a polished docs site, a backing blog post that ranks. They have narrative gravity.
- ✅ **Genuinely beautiful live demo** — seeing boundaries light up on your actual running page is visceral and immediately understandable.
- ✅ **Zero production overhead** (provider no-ops in prod) — clean story.
- ✅ **Multi-framework** — Next *and* TanStack Start.
- ✅ **Maintainer is a known web-dev blogger** (Valentin Prugnaud) — distribution advantage.

**Honest weaknesses (our wedge):**
- 🔴 **Next 16+ / React 19+ ONLY.** The majority of production Next apps are still on 13/14/15. A huge chunk of the market *literally cannot install it.* ← our #1 wedge.
- 🔴 **Detection isn't actually solved.** Their own open issue: *"Help wanted: accurate zero-setup Server Component detection without RscServerBoundaryMarker."* Runtime fiber detection of server regions is hard and they admit it leans on a marker. This is a 2-month-unsolved problem — we should NOT try to beat them at it; we sidestep it.
- 🔴 **Purely descriptive.** It shows the boundary. It does **not** tell you *why* a component is client, whether it *needed* to be, or what it *costs*. No insight, no action.
- 🔴 **Requires app setup** (wrap layout, run the app, click around). Not a one-shot command. No CI story.
- 🔴 **Solo project** — 0 forks, 1 watcher. Beatable on execution and breadth.

**What we steal / respect:** their visual polish bar and their clear color language (client vs server). Our output must look *at least* as good in a screenshot.

### 4.3 Secondary competitor — `cinfinit/next-component-analyzer`

**What it is:** AST-based CLI that classifies components and *suggests* whether each should be server or client based on detected hooks/browser APIs/events.

**Honest assessment:**
- ✅ Same surface as us (static CLI), AST-based (no naive string matching), CI-friendly. Validates our approach is sound.
- 🔴 **57 downloads/month, v0.1.x, near-dead, solo, no traction.** Essentially uncontested ground.
- 🔴 **Only classifies/suggests** ("this should be a client component"). Does **not** trace the *transitive import chain* that forced a component client, does **not** show **cost/bundle impact**, does **not** detect **creep across the tree**. It answers a smaller question.

**Verdict:** This is the closest direct competitor by surface, but it's a sleeping target. We must be **categorically more useful** (why + cost + creep, not just classification) AND **dramatically better presented** so the comparison is obvious at a glance.

### 4.4 Adjacent / non-competitors (know them so we position cleanly)

- **`@next/bundle-analyzer`** — shows raw bundle bytes via treemap. Powerful but **doesn't explain the RSC cause** and is heavy to set up. We complement it: we say *why* a module is in the client bundle.
- **Chrome DevTools / Edge 3D view / Chrome extensions** — runtime, per-developer, don't trace RSC import causes. Different surface.
- **VS Code boundary extension** — editor-only, per-developer install, no CI, no cost analysis.

### 4.5 The strategic conclusion

- The **runtime-overlay** surface is **taken and alive** (foxted). Fighting there = fighting their hard-won detection engine + their momentum. **Avoid.**
- The **static-CLI** surface is **wide open** (only a near-dead 57-dl/mo tool). **Take it.**
- Our durable moat = **(1) version-agnostic reach, (2) the "why" import-chain trace, (3) cost quantification, (4) CI integration** — none of which the runtime overlay can easily add (it can't see the import graph, and it's locked to Next 16).

---

## 5. Differentiation strategy — "one step further" on every axis

The user's mandate: *always one step ahead of the competitor.* Here is the explicit feature-by-feature ladder.

| Axis | foxted/rsc-boundary | next-component-analyzer | **`client-creep` (one step further)** |
|---|---|---|---|
| **Install friction** | Add provider + run app + click | `npx` | **`npx client-creep` — one shot, zero config, zero app run** |
| **Next version reach** | 16+ only | any | **13/14/15/16 — explicitly market "works where rsc-boundary can't"** |
| **Core question answered** | "Where is the boundary?" | "Should this be client?" | **"WHY is this client, did it need to be, and what does it cost?"** |
| **Root-cause trace** | ❌ | ❌ | ✅ **full transitive import chain to the culprit** |
| **Accidental-creep detection** | ❌ | partial (per-file) | ✅ **flags client subtrees that could be hoisted to server** |
| **Cost / bundle impact** | ❌ | ❌ | ✅ **estimated client JS per boundary + total** |
| **CI / PR gating** | ❌ | weak | ✅ **`--ci` exit codes + `--budget` thresholds + JSON output** |
| **Shareable artifact** | live overlay (needs running app) | plain text | ✅ **gorgeous terminal report + optional standalone HTML graph** |
| **Framework** | Next + TanStack Start | Next | Next first; **architecture leaves room for Vite/Remix RSC later** |

**The rule for the build:** for any feature both competitors have, we must do it *and* add the dimension they lack (the "why" or the "cost"). We never ship a strict subset of a competitor.

---

## 6. Product scope

### 6.1 MVP (v0.1.0) — ships in the 2-day window. THIS is what we build.

The MVP must produce a **launch-GIF-worthy** single command. Everything here is load-bearing for the demo.

**F1 — Zero-config project scan**
- `npx client-creep` auto-detects the Next app (looks for `app/` dir, `next.config.*`, `tsconfig.json`).
- Reads `tsconfig.json` `paths` for alias resolution. Supports relative + alias imports.
- Flags: `--dir <path>`, `--json`, `--html`, `--ci`, `--budget <kb>`.

**F2 — `"use client"` boundary detection (static)**
- Parse every `.tsx/.jsx/.ts/.js` file (AST via `oxc-parser` for speed, fallback `@babel/parser`).
- Identify files with a top-of-file `"use client"` directive → these are **client boundary roots**.
- Build the **import graph** (module → imports).
- Propagate: every module transitively imported by a client module is **in the client graph**. Everything else is server.

**F3 — The "WHY" trace (our signature feature)**
- For each client component, compute and print the **shortest import path from a `"use client"` boundary to it**, e.g.:
  ```
  ProductPage (server)
   └─ ⚡ ProductCard  "use client"  ← boundary starts here
        └─ Carousel
             └─ framer-motion   (+58 KB)   ← the real weight
  ```
- For a file that *is* the boundary, show **what client-only feature justified it** (detected `useState/useEffect/onClick/window/...`) — or flag it as **possibly unnecessary** if none found.

**F4 — Accidental-creep detection**
- Flag client components that use **no client-only features** and are only client because a parent is — i.e., candidates to hoist back to server (or pass as `children`).
- Output a ranked "creep report": biggest wins first (most KB recoverable).

**F5 — Cost estimation**
- Per boundary and total: count client modules + sum file sizes and resolved `node_modules` package sizes as a **proxy** for client JS.
- Clearly labeled as an **estimate** (honesty — see §11). Headline number: *"~340 KB of client JS, ~120 KB potentially recoverable."*

**F6 — Beautiful terminal output**
- Color-coded (client = orange/amber, server = blue — deliberately echo the category's color language so it reads as "the serious tool").
- Summary header → ranked creep findings → tree traces. Must look stunning in a screenshot/GIF.

**Acceptance criteria for MVP:** On a sample Next 14 app, `npx client-creep` runs in <5s, prints the summary + at least one correct "why" trace + one accidental-creep flag, and **looks good enough to post on X without editing.**

### 6.2 v0.2 (fast-follow, post-launch, days 3–10)

- `--html` interactive boundary graph (the shareable web artifact; D3/force graph).
- `--ci` hardening + GitHub Action + PR comment bot ("client creep +40KB in this PR").
- Barrel-file / re-export resolution, monorepo support, dynamic `import()` handling.
- `--watch` mode.

### 6.3 Future / moat-deepening (v0.3+)

- ESLint plugin (`eslint-plugin-client-creep`) for inline editor warnings.
- Hosted dashboard (creep trend over time per repo) → **the monetization wedge** (Pro/team tier, GitHub Sponsors).
- Vite/Remix/TanStack RSC adapters → take foxted's multi-framework advantage away.
- VS Code extension reusing the engine → take the editor surface too.

---

## 7. Technical architecture

**Stack:** TypeScript, Node ≥18, published as ESM+CJS. Zero heavy runtime deps for install speed (critical for `npx` UX).

### 7.1 Locked tech stack (build-ready)

| Concern | Choice | Why |
|---|---|---|
| **Language** | TypeScript (strict) | Type safety on the import graph; expected by the audience |
| **Runtime** | Node ≥18 | Native fetch/glob-free baseline; broad support |
| **Package manager** | **npm** | Universal default, zero setup friction, matches the `npx` install story we ship |
| **Bundler / build** | `tsup` (esbuild) | Dual ESM+CJS, near-zero config, fast — ship in minutes |
| **AST parser** | **`@babel/parser` + `@babel/traverse`** (primary) | Battle-tested TSX/JSX handling; won't burn a half-day on edge cases. `oxc-parser` is a **v0.2 perf upgrade**, not a day-1 risk |
| **Directive + signal detection** | babel AST walk | Detect top-of-file `"use client"`, and client-only signals (`useState/useEffect/useRef/...`, `on*` event props, `window/document/localStorage`) |
| **File globbing** | `tinyglobby` | Tiny, fast, modern; respects ignore patterns |
| **tsconfig alias resolution** | `get-tsconfig` (privatenumber) | Clean `paths`/`baseUrl` parsing; the safe path for R2 |
| **CLI arg parsing** | `cac` | ~tiny, ergonomic flags/help; keeps `npx` install light |
| **Terminal styling** | `picocolors` | Tiniest color lib; the amber(client)/blue(server) language |
| **Tree rendering** | custom renderer (archy-style) | Full control over the hero "why" trace output for the GIF |
| **Size estimate** | Node `fs` + `zlib` (gzip) | File bytes + gzipped estimate of the client graph; labeled estimate (R1) |
| **Testing** | `vitest` | Fast, TS-native; run against the fixture app |
| **Sample/fixture** | tiny Next 14 app in `fixtures/` + one real OSS Next app for the GIF | Tests use the fixture; the demo uses a real app for credibility |

**Runtime-dependency budget:** keep it lean — `@babel/parser`, `@babel/traverse`, `tinyglobby`, `get-tsconfig`, `cac`, `picocolors`. Everything else is a devDependency. A heavy `npx` download hurts adoption.

**v0.2 stack additions (deferred):** `oxc-parser` (speed), D3 or `vis-network` (`--html` graph), `@actions/core` (GitHub Action).

**Core pipeline:**
```
1. Resolve project root + tsconfig paths
2. Glob source files (app/, src/, components/ ...; respect .gitignore)
3. Parse each file → AST  (oxc-parser; @babel/parser fallback)
   → detect "use client" directive
   → extract imports (static import + re-exports)
   → detect client-only signals (hooks, event props, browser globals)
4. Resolve imports → absolute module ids (relative + tsconfig alias)
5. Build import graph (directed)
6. Mark client boundary roots; BFS/DFS propagate client graph
7. For each client node: compute shortest path from a boundary (the "why")
8. Flag accidental creep (in client graph, no client signals)
9. Estimate size (fs.stat on files + node_modules package size lookup)
10. Render: terminal (default) | JSON (--json) | HTML (--html)
```

**Key technical decisions (and the honest reasoning):**
- **Static, not runtime.** Deterministic, version-agnostic, no React-19 dependency, sidesteps foxted's unsolved fiber problem. Trade-off: it's an *approximation* of the real bundler graph (see §11).
- **`oxc-parser`** for speed (Rust-based, fast on large repos) — keeps `npx` snappy, which matters for the demo and adoption.
- **Single package, CLI-first.** No provider, no config file required. The whole pitch is "one command."

**What we explicitly defer (don't gold-plate in 2 days):** dynamic imports, conditional `"use client"`, monorepo workspace resolution, non-standard aliasing. These are documented limitations, not bugs.

---

## 8. Naming & branding

**Name: `client-creep` ✅ LOCKED** — verified available on npm 2026-06-02 (all fallbacks also free).
- Names the *problem* → we own the category vocabulary (the user's "create a new market" goal).
- Memorable, slightly alarming, great for a headline: *"You have client creep. Here's the cure."*
- npm: `client-creep` · CLI: `npx client-creep` · GitHub: `client-creep`.

**Alternatives (fallback if npm name taken):** `rsc-doctor`, `why-client`, `useclient-doctor`, `creepscan`.
> **Action item Day 1, hour 1:** verify `client-creep` is free on npm; if taken, fall back to `rsc-doctor`.

**Visual identity:** amber (client/danger) + blue (server/safe). A creeping-vine or spreading-stain motif for the logo. README hero = the terminal GIF.

---

## 9. Go-to-market & launch (this is how we hit 100★ / 10k dl)

**The asset that does the work:** a **15-second terminal GIF** — `npx client-creep` → dramatic summary ("⚠️ 23 client components shipping 340KB, ~120KB recoverable") → scroll through "why" traces. Actionable + shocking = shareable.

**Launch sequence (Day 2 evening → Day 3):**
1. **README** with the GIF above the fold, the comparison table from §5 (this *is* persuasion), copy-paste `npx` line, "works on Next 13–16" badge.
2. **X/Twitter** thread: "Your Next.js app has client creep. I built a free tool to find it. 🧵" + GIF. Tag the RSC discourse.
3. **Reddit:** r/nextjs, r/reactjs, r/webdev.
4. **Hacker News** "Show HN: client-creep – find out why your Next.js components are client components".
5. **dev.to / Hashnode** post: "Why is everything a client component? I traced it." (SEO long tail.)
6. **PRs to `awesome-nextjs` / `awesome-react`.**
7. **Reply-guy** under every rsc-boundary mention / RSC bundle-size thread with "if you're not on Next 16 yet, client-creep works today" — *positioning against the incumbent, honestly.*

**The honest competitive hook (use everywhere):** *"rsc-boundary shows you the boundary on Next 16. client-creep tells you why it's there and what it costs — on any Next version, in one command."* We never trash them; we out-scope them.

**Recurring-downloads engine (for 10k):** the GitHub Action + CI usage means every push re-runs it → downloads compound. Ship the Action in v0.2 within the launch week.

---

## 9.5 Build-in-public posting strategy (X/Twitter)

> **Core principle:** The launch GIF is the growth *lever*. Build-in-public posts are *warm-up reps* — they pre-seed a tiny audience and let us rehearse the hook, but they do **not** drive most of the growth. **Never let posting eat build time** (this is R6 applied to tweets: if a post takes >10 min to make, skip it and code).

### Honest expectation (read before posting)

- **Growth is spike-then-tail, not a steady climb.** If the launch lands (good GIF + right hook + HN/X repost): ~200–800 stars in 3–5 days, then it flattens. If it doesn't catch (the median outcome for a cold account): ~20–60 stars from network + subreddits. This is the base rate, not failure.
- **The 10k downloads come from *adoption* (CI/Action usage), not the launch** — they lag 1–3 weeks. Stars = vanity; recurring CI downloads = the real engine.
- **Distribution > code.** The biggest variable is whether a big account reposts the demo. We can't control that — we control the *hook* and *visual* that raise the odds.
- **For a cold account, "Day 1: set up the repo 🧵" posts get ~0 engagement.** The algorithm rewards a stop-the-scroll hook, not effort. So we post only the *independently interesting* moments below — not every step.

### The 4 posts (engineer each to stand alone)

| # | When | Post (hook, not a status update) | Cost | Goal |
|---|---|---|---|---|
| **P1 — Problem teaser** | Day 1 start | *"Do you actually know **why** a given component in your Next app is a client component? I just realized I don't — and I think it's costing me ~300KB. Building something to find out. 👀"* (plants the term **"client creep"**) | 1 screenshot | Start a conversation, seed the category word |
| **P2 — "It works" moment** | Mid Day 2 | First real terminal trace run on a **real recognizable OSS Next repo** — raw is fine. *"wait… THIS is why half the tree is client?"* | screenshot of output | Curiosity proof; rehearse the hook |
| **P3 — Launch (the lever)** | Day 2 eve / Day 3 | The polished **15-sec terminal GIF**: `npx client-creep` → shocking summary ("⚠️ 23 client components, 340KB, ~120KB recoverable") → scroll the "why" traces. Thread with the §5 comparison + "works on Next 13–16, where rsc-boundary can't." | the GIF (put 90% of effort here) | **This is 90% of potential growth** |
| **P4 — Retro / post-mortem** | Day 3–4 | *"I built & shipped `client-creep` in 2 days — here's what I learned + the numbers (stars, downloads, what flopped)."* | writeup + metrics | Recycle attention onto the repo; build-in-public crowd loves a clean retro |

### Rules

- **P3 is sacred.** If time is tight, cut P1/P2/P4 before touching P3's polish.
- The GIF must run on a **real, recognizable** Next app — credibility beats a synthetic fixture.
- Cross-post the launch beyond X: HN "Show HN", r/nextjs, r/reactjs, r/webdev (see §9), `awesome-nextjs` PR.
- **Reply-guy honestly**, never trash foxted: under RSC/bundle-size threads → *"if you're not on Next 16 yet, client-creep works today and tells you the *why*."*
- Always include the one-shot install line `npx client-creep` in every post — frictionless trial is the conversion.

---

## 10. Success metrics

| Metric | 48h (launch) | 2 weeks | Honest reality check |
|---|---|---|---|
| GitHub stars | **100** | 500+ | Very achievable with a strong GIF + HN/Reddit hit |
| npm downloads | 500–2k | **10k** | 10k in 48h is unrealistic *organically*; 10k cumulative in ~2 weeks (with CI usage) is the real target. Don't chase bot inflation. |
| HN front page | nice-to-have | — | Single biggest lever if it lands |
| GitHub Sponsors | — | first $ | Only after dashboard/Pro story (v0.3) |

> **Honesty flag for the founder:** Stars are the *48-hour* metric. Downloads are the *2-week* metric and depend on CI/Action adoption. Setting "10k downloads in 2 days" as the bar will read as failure even on a successful launch — recalibrate to "10k in 2 weeks."

---

## 11. Risks & mitigations (read this twice)

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Static analysis ≠ real bundler graph** (dynamic imports, conditional client, tree-shaking). Cost numbers are approximate; a wrong number kills credibility. | High | High | Label all sizes **"estimate"**. Be conservative. Show the *trace* (always correct) as the hero, with size as secondary. Document method openly. |
| R2 | **Import-graph resolution is the hard 20%** (aliases, barrels, monorepos) and can eat the whole 2 days. | High | High | MVP scopes to relative + tsconfig alias in single app. Barrels/monorepo = documented v0.2 limitation. **Timebox resolver to ½ day; if over, ship narrower.** |
| R3 | **foxted ships a CLI / static mode** and erases our wedge. | Medium | High | Move fast; own the "why + cost + version-agnostic + CI" combo and the *category name*. Their hard asset is the overlay; pivoting to static is real work for them. |
| R4 | **Launch flops** (no HN/X traction). | Medium | Medium | Multiple shots (3–5 distinct findings/angles in the GIF); reply-guy strategy; the comparison table does cold-traffic persuasion. |
| R5 | **npm name taken.** | Low | Low | Verify hour 1; `rsc-doctor` fallback ready. |
| R6 | **Scope creep on our side** (ironic). HTML graph / watch / ESLint tempt us in the 2-day window. | High | Medium | §6.1 is a hard line. Everything else is v0.2. The GIF needs the *terminal*, not the HTML graph. |
| R7 | **"Accidental client" false positives** annoy users (we say hoist it, but it genuinely needs client). | Medium | Medium | Conservative heuristics; phrase as "candidate / review", not "wrong". Show the evidence (no client signals found). |

---

## 12. The 2-day build timeline

**Day 1 — Engine (correctness first)**
- H1: Verify npm name. Scaffold TS package, CLI entry, sample Next 14 fixture app.
- H2–4: File glob + AST parse + `"use client"` detection + import extraction.
- H5–7: Import resolver (relative + tsconfig alias). **Timeboxed.**
- H8–10: Import graph + client-graph propagation + the **"why" shortest-path trace** (the signature feature — must work).

**Day 2 — Insight + polish (virality second)**
- H1–2: Client-only signal detection → accidental-creep flagging.
- H3–4: Size estimation (files + node_modules proxy).
- H5–7: **Beautiful terminal renderer** (the screenshot must be stunning). `--json`.
- H8: Test on 2–3 real open-source Next apps; fix glaring inaccuracies.
- H9: README + record the GIF.
- H10: Publish to npm, push to GitHub, queue launch posts.

**Cut-if-behind order:** size estimation → accidental-creep → (never cut) the "why" trace + pretty output.

---

## 13. Open questions (decide before/early in build)

1. ~~**Name**~~ — ✅ DECIDED: `client-creep` (verified free on npm 2026-06-02).
2. ~~**Parser**~~ — ✅ DECIDED: `@babel/parser` primary (reliable in the 2-day window); `oxc-parser` is a v0.2 perf upgrade.
3. **Sample app** — build a tiny fixture, or analyze a real OSS Next app for the demo? *(Recommend: real OSS app for credibility in the GIF + a fixture for tests.)*
4. **Size source of truth** — file bytes vs gzipped estimate vs node_modules size. *(Recommend: raw file bytes for v0.1, labeled estimate.)*

---

## 14. Appendix — competitor links (verified 2026-06-02)

- foxted/rsc-boundary — https://github.com/foxted/rsc-boundary · site: https://rsc-boundary.valentinprugnaud.dev (93★, Next 16+/React 19+, runtime overlay, ~3.5k legacy dl/mo)
- next-component-analyzer — https://github.com/cinfinit/next-component-analyzer (static CLI, ~57 dl/mo, near-dead)
- mimifuwacc/rsc-boundary-marker — https://github.com/mimifuwacc/rsc-boundary-marker (29★, stale)
- iekolvakh/rsc-boundary-marker — https://github.com/iekolvakh/rsc-boundary-marker (0★)
- VS Code ext — https://marketplace.visualstudio.com/items?itemName=makotot.vscode-nextjs-component-boundary-visualizer
- RSC Devtools (Chrome) — https://chrome-stats.com/d/jcejahepddjnppkhomnidalpnnnemomn
- `@next/bundle-analyzer` (adjacent) — https://www.npmjs.com/package/@next/bundle-analyzer
