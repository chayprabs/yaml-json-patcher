# Codex Goal Prompt - ConfigShape (yaml-json-patcher)

This file contains the standalone Codex `/goal` prompt for this repository.

## 2. ConfigShape (`yaml-json-patcher`) - Pattern C+D

~~~
You are building **ConfigShape** as a standalone open-source tool.

Repo: `yaml-json-patcher` - Pattern: **Pattern C+D (browser-only)** - License: **MIT**.

What it does: a browser playground for querying and patching YAML, JSON, TOML and XML configs with jq, JSONPath, JMESPath and JSON Patch - comments, anchors and key order preserved. 100% in-browser; the file never leaves the user's device.

**Required reading (BEFORE writing any code; read each fully):**
1. `IMPLEMENTATION_HANDOFF.md` - universal context, default tech stack, repo template, shared UI conventions, license/CI/deployment defaults.
2. `PRODUCT_REQUIREMENTS.md` - full product requirements document. Section 5 F-requirements are HARD; Section 20 acceptance criteria are your DoD.
3. `RELEASE_QUALIFICATION_CHECKLIST.md` **Section 2** - the release gate. Every code/product checkbox must pass. Host-only Docker/runtime glitches may be `VERIFY-DEFERRED` under the resilience policy below.

**Verification resilience policy (do not stop `/goal` on environment flakes):**
- Docker support is still required: write Dockerfiles, compose files, health checks, and docs as if they will run in CI and on a clean machine.
- Treat code-caused failures as blocking: invalid Dockerfile/compose syntax, missing files, repo dependency/install errors, app boot crashes, missing health endpoints, failing lint/typecheck/unit/build/e2e, or failing PRD behavior. Fix these before completing.
- Treat host-caused Docker failures as `VERIFY-DEFERRED`, not `/goal` blockers: Docker daemon unavailable, registry/network pull flake, disk/permission/port conflict, platform mismatch, or timeout with no app stack trace after one retry. Record the command, error, and the static checks used instead, then continue.
- When Docker execution is deferred, still run what you can: `docker compose config` when available, package install, lint, typecheck, tests, build, local web/worker run without Docker, and static inspection of Dockerfile COPY paths/env/health checks.
- Finish with a QC note listing passed checks, fixed code defects, and any `VERIFY-DEFERRED` Docker evidence. Do not mark the Codex `/goal` blocked solely because the host Docker runtime glitched.

**Tool-specific stack:**
- Vite 6 + React 19 + TS + Tailwind 4 + shadcn/ui + Monaco.
- `jq-wasm` (lazy-loaded), `yaml` (CST mode for comment preservation), `@iarna/toml`, `fast-xml-parser`, `ajv` + `ajv-formats`.
- `vite-plugin-pwa` (offline + installable) + `vite-plugin-singlefile` for release artifact.
- Tree-shakable ESM exports from `packages/core` published to npm as `@<npm-scope>/yaml-json-patcher`.

**Workflow:**
- Branch: `cursor/config-shape-build`. Stay on it. Push on every commit.
- Use Pattern-C+D repo layout from AGENT_HANDOFF Section 4 (`packages/core` + `packages/web` + optional `packages/cli`).
- Use shared UI components - do NOT re-implement.

**COMMIT CADENCE - STRICT, NON-NEGOTIABLE:**
Run `git commit && git push` every 5-6 minutes. No exceptions.
- Conventional messages (`feat:` `fix:` `test:` `chore:` `docs:` `refactor:` `ci:`).
- One sentence describing the change.
- Stale at 6 minutes -> `chore: wip <area>` and continue.
- Target: 30+ commits per tool.
Examples:
  feat(core): parse YAML preserving comments via CST mode
  test(core): jq-wasm lazy-load behavior
  chore(ci): size-limit budget for core+jq chunks

**Build order (PRD F-requirements):**
F1 format round-trip -> F2 query engines (jq, JSONPath, JMESPath, yq) -> F3 patch+merge -> F4 validation -> F5 diff view -> F6 share/persist -> F7 samples.

After each F: tests -> run -> commit -> push. After every section ships: re-walk QUALIFYING_CRITERIA Section 2; tick boxes; commit progress.

**Verification phase (mandatory):**
Run every check in `RELEASE_QUALIFICATION_CHECKLIST.md` Section 2:
- Lighthouse >=95 across all four categories.
- Bundle budgets: core <=90 KB gz; +JSONPath <=110 KB; +JMESPath <=130 KB; +ajv +60 KB; jq-wasm lazy chunk <=800 KB gz.
- Single-file HTML build <=2 MB.
- Verifiable in-browser claim: open Network tab, load page, perform query/patch/merge -> disconnect network -> operations still succeed.
- Acceptance Section 2.18: A1-A5 pass exactly.
- Produce QC Appendix B report.
- Any code/product failure -> fix, commit, push, re-verify. Host-only Docker/runtime glitches -> record `VERIFY-DEFERRED` evidence and continue.

**Done = code/product QUALIFIED on QUALIFYING_CRITERIA Section 2 with no unresolved code/product failures.** If Docker/runtime is `VERIFY-DEFERRED`, include the rerun evidence in the PR and do not claim final public release `QUALIFIED` until it passes. Open PR titled `ConfigShape: v1 build (QC Section 2 qualified)`.
~~~

---
