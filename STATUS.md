# client-creep — Ecosystem Status
**Last updated:** 2026-06-04 · **Session:** Day 2

---

## TL;DR

The full ecosystem is built and working locally end-to-end. CLI pushes real data to the dashboard via Supabase. ESLint plugin is published. VS Code extension is built but blocked on Marketplace auth. Dashboard needs Vercel deploy tomorrow.

---

## Ecosystem Overview

| Repo | Version | npm/pub Status | Notes |
|---|---|---|---|
| `client-creep` (CLI) | **v0.2.3** | ✅ Published | `--push` flag live on npm |
| `eslint-plugin-client-creep` | v0.1.0 | ✅ Published | Both rules working |
| `client-creep-vscode` | v0.1.0 | ❌ Blocked | VS Code Marketplace auth (no card) |
| `client-creep-dashboard` | — | ⚠️ Needs Vercel deploy | Working locally, pushed to GitHub |

---

## 1. client-creep CLI — v0.2.3

### What shipped today
| Feature | Status |
|---|---|
| `--push` flag — push analysis to dashboard | ✅ Done |
| `--token <token>` — Supabase access token | ✅ Done |
| `--dashboard <url>` — custom dashboard URL | ✅ Done |
| `--owner` / `--repo` — override git-detected repo | ✅ Done |
| Auto-detect owner/name from `git remote` (SSH + HTTPS) | ✅ Done |
| Barrel-file resolution (recursive, non-index barrels) | ✅ Done |
| Dynamic `import()` tracking | ✅ Done |
| PR comment bot in GitHub Action | ✅ Done |
| `action.yml` — `push`, `token`, `dashboard` inputs added | ✅ Done |
| Version synced: `cli.ts`, `push.ts`, `Nav.tsx`, `Footer.tsx` | ✅ Done |

### What's pending
| Item | Priority |
|---|---|
| ~~`npm publish` (v0.2.3 with `--push`)~~ | ✅ Done |
| Add `--push` to README usage table | 🟡 Soon |
| Add `--push` to marketing website | 🟢 Future |

---

## 2. eslint-plugin-client-creep — v0.1.0

### What shipped
| Feature | Status |
|---|---|
| `no-unnecessary-use-client` rule — per-file, zero setup | ✅ Published |
| `no-client-creep` rule — uses full graph via cache/auto-run | ✅ Published |
| Flat config (`recommended`) + legacy config (`recommended-legacy`) | ✅ Published |
| 7 tests passing | ✅ Done |
| `demo.gif` recorded | ✅ Done |

### What's pending
| Item | Priority |
|---|---|
| Nothing blocking | — |

---

## 3. client-creep-vscode — v0.1.0

### What shipped
| Feature | Status |
|---|---|
| Diagnostic warnings for unnecessary `"use client"` | ✅ Built |
| Diagnostic warnings for accidental creep candidates | ✅ Built |
| Status bar: `⚡ N issues` / `✓ client-creep` | ✅ Built |
| Re-run on save, debounced 600ms | ✅ Built |
| `client-creep: Run Analysis` command | ✅ Built |
| `client-creep: Clear Diagnostics` command | ✅ Built |
| Pushed to GitHub | ✅ Done |

### What's pending
| Item | Priority | Blocker |
|---|---|---|
| **Publish to VS Code Marketplace** | 🔴 Blocked | Microsoft Azure DevOps asks for card even on free tier |
| Record demo GIF/video | 🟡 After publish | — |

---

## 4. client-creep-dashboard

### What shipped
| Feature | Status |
|---|---|
| Landing page — "Terminal Luxury" design, Catppuccin Mocha | ✅ Done |
| GitHub OAuth via Supabase — login working | ✅ Done |
| Dashboard — repo list, stat cards, sparklines | ✅ Done |
| Repo detail — trend chart (Recharts), creep table, boundaries table | ✅ Done |
| Settings — token copy, CLI command pre-filled, GitHub Action YAML | ✅ Done |
| `/api/push` endpoint — receives CLI pushes, writes to Supabase | ✅ Done |
| Supabase schema — `profiles`, `repos`, `analyses`, RLS, triggers | ✅ Done |
| Real data flow tested: dub repo pushed → dashboard shows data | ✅ Verified |
| Pushed to GitHub (private repo) | ✅ Done |

### What's pending
| Item | Priority | Notes |
|---|---|---|
| **Deploy to Vercel** | 🔴 Do tomorrow | Set 3 env vars in Vercel dashboard |
| Update GitHub App Homepage URL to Vercel URL after deploy | 🟡 After deploy | Currently set to GitHub profile URL |
| Update Supabase Site URL to Vercel URL | 🟡 After deploy | Currently `http://localhost:3000` |
| Add `--push` section to dashboard landing page | 🟢 Future | Show the CLI command on the homepage |
| Pro/team tier — hosted trend history, org-wide view | 🟢 Future | Monetization layer |

---

## Vercel Deploy Checklist (tomorrow)

1. Go to [vercel.com](https://vercel.com) → New Project → import `client-creep-dashboard`
2. Add env vars:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://nnqdatrimyeqztilunrk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
   NEXT_PUBLIC_SITE_URL=https://<your-vercel-url>.vercel.app
   ```
3. Deploy
4. Supabase → Authentication → URL Configuration → update **Site URL** to Vercel URL
5. Supabase → Authentication → URL Configuration → add Vercel URL to **Redirect URLs**:
   ```
   https://<your-vercel-url>.vercel.app/auth/callback
   ```
6. `npm publish` for client-creep v0.2.3

---

## npm Publish — ✅ Done (2026-06-04)

`client-creep@0.2.3` is live on npm with `--push`, `--token`, `--dashboard` flags.

---

## Verified Data Flow (tested 2026-06-04)

```
cd /tmp/dub/apps/web
node /Users/dhruvil/Desktop/client-creep/dist/cli.js \
  --push --token <token> --dashboard http://localhost:3000

→ Scanned 500+ files in dub monorepo
→ POST /api/push → 200 OK
→ Dashboard shows dub repo card with real stats ✅
```

---

## v0.3+ Roadmap (future sessions)

| Item | Notes |
|---|---|
| Hosted Pro dashboard — trend history, org view, alerts | Monetization |
| VS Code Marketplace publish | Blocked on Microsoft auth |
| Add `--push` to marketing site | When v0.2.3 is on npm |
| Vite/Remix RSC adapters | Expand beyond Next.js |
| `eslint-plugin-client-creep` v0.2 — `--fix` support | Auto-remove unnecessary boundaries |
