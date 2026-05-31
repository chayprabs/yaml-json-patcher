# Release Qualification Checklist - ConfigShape (yaml-json-patcher)

# Standalone Tool Portfolio - Qualifying Criteria (30 Tools)

> **Purpose.** This document is the release gate for every Standalone Tool Portfolio
> tool. For each of the 30 tools there is one self-contained section
> below. Copy that single section into an AI verification agent's
> context window, give it the repo URL and the hosted URL, and tell it
> to work through the checklist. When every box passes, the tool has
> officially qualified as a working v1.
>
> Run this file repeatedly. Every release of every tool should re-pass
> its own section before going live.

---

## How to use this document

### As a human reviewer

1. Pick a tool to verify.
2. Copy that tool's entire section into a fresh working doc.
3. Tick boxes as you (or your agent) verify each item.
4. Required artefacts to start: repo URL, hosted URL, optional credentials.

### As an AI verification agent (the intended primary user)

The end user will paste one tool's full section into your context. You
will also receive:

- The repo URL (`https://github.com/chayprabs/yaml-json-patcher`).
- The hosted URL (your static deployment, e.g. Cloudflare Pages).
- The relevant product requirements file path (`prds/N_<tool>.md`).
- The universal context file (`IMPLEMENTATION_HANDOFF.md`).

Your environment must have:

```
node >= 22       pnpm >= 9         docker >= 24
curl             jq                git
gh               openssl           dig
playwright OR puppeteer            lighthouse-cli
```

Work through every checkbox in order. For each item:

1. **If the check passes**, tick the box and record the evidence
   (command + output, screenshot, or selector + DOM snapshot).
2. **If the check fails**, do not tick. Record the failure mode with
   reproducible evidence.
3. **If the check is ambiguous** (e.g. requires credentials you don't
   have), mark `BLOCKED` and explain.
4. **If a Docker/local-runtime check fails for a host/environment reason only**, mark `VERIFY-DEFERRED` instead of `FAILED` or `BLOCKED`. This applies to Docker daemon unavailable, registry/network pull flakes, disk/permission/port conflicts, platform mismatch, or non-deterministic startup timeouts with no app stack trace after one retry. It does not apply to code defects such as invalid Dockerfile/compose syntax, missing dependencies/files, app boot crashes, missing health endpoints, or failing product behavior.
5. For `VERIFY-DEFERRED`, continue through the remaining non-Docker checks and record substitute evidence: `docker compose config` if available, static Dockerfile/compose inspection, install/lint/typecheck/test/build results, and local web/worker run evidence where possible.

A `VERIFY-DEFERRED` item must not stop a Codex implementation `/goal`. Public release qualification remains strict: deferred Docker/runtime checks must be rerun in CI or on a healthy Docker host before claiming final `QUALIFIED`.

At the end produce a structured report:

```
Tool: <name>
Total checks: <N>
Passed: <P>
Failed: <F> (list each with evidence)
Blocked: <B> (list each with reason)
Verify-deferred: <D> (list each host/runtime check with rerun command)
Verdict: QUALIFIED | NOT QUALIFIED | VERIFY-DEFERRED
```

If verdict = QUALIFIED, post a comment on the release PR with the body
`Qualifying-Criteria-PASS: <tool>@<sha>` and a link to your report.

If verdict = NOT QUALIFIED because of product or code failures, open a
GitHub issue per failed check with label `qualifying-failure`, assign to
the tool owner, and **block the release** until all are resolved.

If only `VERIFY-DEFERRED` host/runtime items remain, open a verification
follow-up instead of a code-failure issue. Do not block Codex
implementation progress, but do not claim final release `QUALIFIED` until
those checks pass in CI or on a healthy Docker host.

### Universal assumptions (true for every tool)

These hold across the org. If any are not true for a specific tool,
that tool's section will say so explicitly.

- The repo follows one of two templates documented in
  `IMPLEMENTATION_HANDOFF.md` Section 4.
- **Pattern 1 (server-side)** tools: `apps/web/` + `apps/worker/` + `docker-compose.yml`.
- **Pattern C+D (browser-only)** tools: `packages/core/` + `packages/web/` (+ optional `packages/cli/`).
- Hosted convention: static site per tool (e.g. `configshape.example.com`); API subdomain only for server-side tools.
- Org-wide required files: `LICENSE`, `README.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`.

### Section structure - every tool has these 13 categories

| # | Category | Goal |
|---|---|---|
| .0 | Inputs the agent needs | What you receive before starting |
| .1 | Repo structure | Files/folders/config exist |
| .2 | Build & install | pnpm install / typecheck / lint / test / build |
| .3 | Local run | docker-compose / vite dev / health check |
| .4 | Functional (per PRD F-requirements) | Each F1.x, F2.x, ... verified |
| .5 | UI / UX | Header, drops, states, keyboard, mobile, dark mode |
| .6 | Non-functional (perf & budgets) | Lighthouse, p95 latency, bundle size |
| .7 | Privacy & security | CSP, retention, logs, CSP, secrets, redaction |
| .8 | Testing | Coverage, e2e, fixtures, snapshots |
| .9 | Deployment | Hosted URL works, TLS, releases, registries |
| .10 | Docs | README, license, links, screenshots |
| .11 | SEO / discovery | Description, topics, sub-routes, schema |
| .12 | Acceptance fixtures (PRD Section 20) | The must-pass canned scenarios |
| .13 | Final verdict | Block on product/code failures; defer proven host-only runtime glitches |

---

<!-- BEGIN_SECTIONS -->


---

## 2. ConfigShape (`yaml-json-patcher`)

### 2.0 Inputs the agent needs

- [ ] Repo cloned.
- [ ] Product requirements opened: `PRODUCT_REQUIREMENTS.md`.
- [ ] `IMPLEMENTATION_HANDOFF.md` opened.
- [ ] Hosted URL returns 200 (your deployment).
- [ ] Sample files present in `packages/web/public/samples/`.
- [ ] Pattern: **C+D (browser-only)** - no worker, no docker.

### 2.1 Repo structure

- [ ] `packages/core/` with `src/`, `tests/`, `package.json` named `@<npm-scope>/yaml-json-patcher`.
- [ ] `packages/web/` with `src/`, `public/samples/`, `vite.config.ts`.
- [ ] `packages/cli/` exists (optional but recommended).
- [ ] `.github/workflows/release-npm.yml`, `release-web.yml`, `release-singlefile.yml`.
- [ ] `LICENSE` is **MIT** (browser-only default).
- [ ] All org-wide files present.
- [ ] `vite.config.ts` declares: `vite-plugin-wasm`, `vite-plugin-top-level-await`, `vite-plugin-pwa`, `vite-plugin-singlefile` (release-only).
- [ ] GitHub topics include >=10 of: `yaml`, `json`, `toml`, `xml`, `jq`, `yq`, `jsonpath`, `jmespath`, `json-patch`, `json-merge-patch`, `config`, `kubernetes-yaml`, `yaml-editor`, `json-editor`, `online-tool`, `browser-only`, `wasm`.

### 2.2 Build & install

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm -F core size-limit          # enforces bundle budget
```

- [ ] All commands exit 0.
- [ ] Coverage on `packages/core/` >= 90 %.
- [ ] Bundle-size budget: core <= 90 KB gz; +JSONPath <= 110 KB; +JMESPath <= 130 KB; +ajv <= 60 KB extra; jq-wasm lazy chunk <= 800 KB gz.
- [ ] Single-file HTML build <= 2 MB total when produced.

### 2.3 Local run

```bash
pnpm --filter web dev
```

- [ ] Vite serves on `http://localhost:5173`.
- [ ] No console errors on first paint.
- [ ] PWA manifest served at `/manifest.webmanifest`.
- [ ] Service worker registers (DevTools -> Application -> Service Workers).

### 2.4 Functional - Format round-trip (PRD F1)

For each format below, paste sample and round-trip parse->serialize, then assert byte-identical output (or semantically equivalent with comments preserved).

- [ ] **F1 JSON** - `package.json` round-trips byte-identical (after format normalisation).
- [ ] **F1 YAML** - `k8s-deployment.yaml` round-trips lossless: comments retained, anchors preserved, key order preserved.
- [ ] **F1 YAML multi-doc** - `multi-doc.yaml` (`---` separated) splits into N docs and each round-trips lossless.
- [ ] **F1 TOML** - `pyproject.toml` round-trips lossless.
- [ ] **F1 XML** - `atom-feed.xml` round-trips with order preserved.
- [ ] Format auto-detect correct on all samples; manual override works.

### 2.5 Functional - Query engines (PRD F2)

For each engine, run the canned expression and assert the expected output:

- [ ] **F2.1 jq** - On `k8s-deployment.yaml` (YAML->JSON), expression `.spec.template.spec.containers[].image` returns the image array.
- [ ] **F2.2 JSONPath** - Same input, `$.spec.template.spec.containers[*].image` returns equivalent array.
- [ ] **F2.3 JMESPath** - `spec.template.spec.containers[*].image` returns equivalent.
- [ ] **F2.4 yq** - `.spec.template.spec.containers[].image` runs against YAML AST and returns same set.
- [ ] **F2.5** Engine selector persists default in localStorage across reloads.
- [ ] **F2.6** As-you-type evaluation debounces at ~150 ms.
- [ ] jq-wasm chunk is fetched only when user first selects jq engine (verify in Network tab).

### 2.6 Functional - Patch & merge (PRD F3)

- [ ] **F3.1 JSON Patch** - Apply patch `[{"op":"replace","path":"/scripts/build","value":"vite build"}]` to `package.json`; result has the new value.
- [ ] **F3.2 JSON Merge Patch** - Apply `{"scripts":{"build":"vite build"}}` produces equivalent result.
- [ ] **F3.3 Patch generator** - Given two versions of `package.json`, generated patch is minimal (no redundant ops).
- [ ] **F3.4 Multi-file merge** - Drop `helm-values-base.yaml` + `helm-values-prod.yaml`, `deep` strategy; output contains both keys; conflicts highlighted.
- [ ] **F3.5** Conflict resolver UI shows side-by-side selector per conflicting path.

### 2.7 Functional - Validation (PRD F4)

- [ ] **F4.1** Pasting malformed YAML produces line/column error markers in Monaco gutter.
- [ ] **F4.2** Pasting a JSON Schema (in schema pane) validates left-pane doc; ajv errors render as markers.

### 2.8 Functional - Diff view (PRD F5)

- [ ] **F5.1** Unified-diff and side-by-side toggleable.
- [ ] **F5.2** "Copy as diff" copies a unified-diff string to clipboard.
- [ ] **F5.2** "Download .patch" produces a file with the diff content.

### 2.9 Functional - Share & persist (PRD F6)

- [ ] **F6.1** Reloading the share URL restores both inputs and the expression.
- [ ] **F6.2** URL hash is lz-string-compressed (verify hash length).
- [ ] **F6.3** Refresh while editing prompts "Restore last session?".

### 2.10 Functional - Sample loader (PRD F7)

- [ ] Eight samples present and load on click: Kubernetes Deployment, Helm values base/prod, GitHub Actions, `pyproject.toml`, `docker-compose.yml`, `package.json`, `Cargo.toml`, `atom-feed.xml`.

### 2.11 UI / UX

- [ ] Three-pane layout: source, toolbar+output, drawer.
- [ ] Toolbar mode buttons: Query / Patch / Merge / Validate / Diff.
- [ ] Format badge in editor corner shows detected format.
- [ ] Monaco line/col status bar visible.
- [ ] Keyboard: Cmd/Ctrl+Enter runs; Cmd/Ctrl+S saves; Cmd/Ctrl+K opens command palette.
- [ ] Mobile (375 px) stacks vertically; CodeMirror Lite swaps in for Monaco.
- [ ] Dark mode toggle persists.

### 2.12 Non-functional / performance

- [ ] Lighthouse on hosted URL >= 95 in all four categories.
- [ ] Time-to-first-result <= 200 ms after typing pause for input <= 1 MB.
- [ ] Memory <= 200 MB tab on 1 MB input (Chrome Task Manager).

### 2.13 Privacy & security

- [ ] **Verifiable in-browser claim**: open Network tab, load page, perform query/patch/merge/validate, then disconnect network -> operations still work.
- [ ] After first page load, Network tab shows ZERO outbound requests during ops.
- [ ] CSP: `default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'`.
- [ ] No third-party analytics scripts in page source.
- [ ] localStorage scoped per origin; "Clear all" button works.
- [ ] HTTPS cert valid; expiry > 30 days.

### 2.14 Testing

- [ ] Vitest unit tests on parse/serialize round-trips snapshot 100+ fixtures.
- [ ] Property-based fast-check tests on query engines.
- [ ] Playwright e2e per sample (load -> run sample expression -> assert output).
- [ ] Visual snapshot tests for key UI states.
- [ ] No flaky tests in last 10 CI runs (check via `gh run list`).

### 2.15 Deployment

- [ ] Hosted URL returns 200.
- [ ] npm package `@<npm-scope>/yaml-json-patcher` exists at latest tag; `npm view @<npm-scope>/yaml-json-patcher version` returns expected.
- [ ] Single-file HTML attached to latest GitHub release; downloads cleanly; opens from `file://` works.
- [ ] PWA installable from Chrome address bar (verify "Install" prompt available).

### 2.16 Docs

- [ ] README first 100 words include "yaml", "json", "toml", "xml", "jq", "browser".
- [ ] README "Try it online" link works.
- [ ] README "Self-host" section: shows `npx serve dist/` and single-file HTML path.
- [ ] README has screenshot.
- [ ] LICENSE = MIT.

### 2.17 SEO / discovery

- [ ] Sub-routes return 200 with correct h1: `/jq-online`, `/yq-online`, `/jsonpath-online`, `/jmespath-online`, `/json-patch-online`, `/yaml-to-json`, `/json-to-yaml`, `/k8s-yaml-query`.
- [ ] JSON-LD FAQ schema present.
- [ ] OG image present.

### 2.18 Acceptance fixtures (PRD Section 20)

- [ ] **A1.** Every sample loads + runs sample expression with expected output.
- [ ] **A2.** Comments and key order preserved on round-trip for all 4 formats.
- [ ] **A3.** Bundle-size budgets met (size-limit CI passes).
- [ ] **A4.** Dev-tools Network tab empty after first paint during operations.
- [ ] **A5.** PWA installable and works offline (toggle DevTools "Offline" -> operations still work).

### 2.19 Final verdict

- [ ] All boxes ticked -> **TOOL 2 (ConfigShape) QUALIFIES**.
- [ ] Failures -> follow `qualifying-failure` issue flow.

---

## B. Standard structured report format

```
Tool: <name>
Section: <N>.<title>
Repo: <github-url>@<sha>
Hosted: <hosted-url>
Run at: <ISO timestamp>
Verifier: <agent-id>

Counts:
  Total checks: <T>
  Passed: <P>
  Failed: <F>
  Blocked: <B>
  Verify-deferred: <D>
Failures:
  - 1.4.F1-RAR: curl returned 500 (logs attached)
  - 1.14: Lighthouse Performance 88 < 95

Blocked:
  - 1.20.A3: requires diff fixture not present in repo

Verify-deferred:
  - 1.3: Docker daemon unavailable; rerun `docker compose up` in CI or on a healthy Docker host.

Verdict: NOT QUALIFIED
Action: open issues for code/product failures; rerun VERIFY-DEFERRED items in CI or on a healthy Docker host before final release.
```

## C. Re-running this document

This file is **idempotent and re-runnable**. Run the relevant section on
every release of a tool. Track section results in a tools-status
spreadsheet or dashboard with one row per tool and one column per
section release. The first all-green row across all 30 tools = the
portfolio's GA milestone.
