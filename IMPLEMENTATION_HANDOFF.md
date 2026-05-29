# Implementation Handoff - ConfigShape (yaml-json-patcher)

This is the tool-specific handoff distilled from the shared planning document for **ConfigShape**.
The product is a standalone public GitHub repository, not part of a shared platform suite.

## Product Context

- Repo: `yaml-json-patcher`
- PRD: `PRODUCT_REQUIREMENTS.md`
- Architecture: Pattern C+D - Browser-only (100% in browser; no upload)
- One-liner: Query and patch YAML, JSON, TOML and XML configs in your browser with jq, JSONPath, JMESPath and JSON Patch - comments, anchors, and key order preserved.

## Default Stack

- TypeScript 5.5+ where practical.
- pnpm workspaces.
- React 19 with shadcn/ui, Tailwind CSS 4, lucide-react, react-hook-form, zod, Zustand, and TanStack Query where applicable.
- Vitest for unit tests, Playwright for e2e, Storybook for component coverage.
- ESLint, Prettier, commitlint, Husky, lint-staged, EditorConfig, and strict TypeScript.
- Vite 6 with Web Workers for computation over 50ms.
- Use WASM tooling when needed: vite-plugin-wasm, top-level await, and single-file release builds.
- Client persistence uses IndexedDB/localforage with an explicit clear-history control.
- After initial page load, browser-only tools must avoid outbound network requests for user file processing.

## Architecture Pattern

Pattern C+D: browser-only static playground plus reusable npm core package. User files should remain in the browser after the initial app load.

## Repo Layout Template

```
<tool-repo>/
|-- packages/
|   |-- core/          Pure TypeScript/WASM logic, no DOM or React assumptions.
|   |-- web/           Vite + React static playground.
|   `-- cli/           Optional npx wrapper.
|-- .github/workflows/
|-- README.md
`-- LICENSE
```

## Shared UI Conventions

- Header: product name, GitHub link, theme toggle, and concise navigation relevant to this tool.
- Main surface: the playground workflow specified by the PRD, optimized for repeated technical use.
- File input: drag-and-drop, click-to-browse, paste when relevant, URL input only when the PRD allows it, validation, progress, cancel, and sample inputs.
- Result display: tabs for result, warnings/logs, raw JSON, downloads, and share/export when supported.
- Shared primitives to reuse when useful: FileDrop, ResultPane, SamplePicker, EngineSelector, DiffViewer, JsonTree, and SEO/FAQ content.

## Privacy And Security Defaults

- Keep user file processing local to the browser when the browser path is selected.
- Provide clear history/persistence controls for IndexedDB/localforage data.
- Do not add analytics that transmit file contents or filenames.
- Add security.txt, Dependabot, CodeQL, and no third-party tracking scripts.

## License And Monetization Defaults

- License default: MIT for browser-only core/web code.
- Free anonymous use should cover the primary playground workflow within PRD limits.
- Paid tiers, if implemented later, must not hide the basic tool behind a login wall.

## Deployment Defaults

- Web: static site build suitable for any static host.
- Release: npm package for core when useful, plus static build and single-file HTML artifact when practical.
- Self-host: unzip the release artifact and serve it, or open the single-file HTML when supported.

## CI/CD Template

- CI on push and PR: pnpm install --frozen-lockfile, lint, typecheck, unit tests, e2e tests, and build.
- Server-side or hybrid repos also build the worker container and run worker integration tests.
- Browser-only or browser-first repos enforce bundle budgets from the PRD.
- Releases are tagged vX.Y.Z and publish the relevant web, npm, and/or container artifacts.

## Verification Resilience Policy

Docker and self-host support remain required deliverables. Implement Dockerfiles, compose files, health checks, environment documentation, and CI/container build configuration so they are valid for a clean machine and CI runner.

During Codex `/goal` implementation, do not stop the goal solely because the local Docker host is unhealthy. Classify Docker daemon outages, image registry/network pull flakes, disk/permission/port conflicts, platform mismatches, and startup timeouts with no app stack trace after one retry as `VERIFY-DEFERRED`. Continue with non-Docker verification and record the exact command, error, and substitute evidence.

Do not defer code defects. Invalid Dockerfile or compose syntax, missing COPY sources, missing dependencies, app boot crashes, missing health endpoints, failing lint/typecheck/unit/build/e2e, and failing PRD acceptance behavior are implementation failures and must be fixed before claiming the code is ready.

When Docker execution is deferred, still run static and local checks where possible: `docker compose config`, Dockerfile/compose path and environment inspection, package install, lint, typecheck, tests, build, and direct web/worker startup outside Docker. The final QC note must list every passed check plus any `VERIFY-DEFERRED` Docker item with a rerun command for CI or a healthy Docker host.

## SEO And Launch Checklist

- GitHub repo name and description should mirror the PRD one-liner and high-intent search terms.
- README first 100 words should repeat the primary keywords naturally and explain the core workflow.
- Include screenshots, sample files, FAQ/schema content where relevant, sitemap/robots for hosted web builds, and no login wall for the playground.

## Definition Of Done

- Every functional requirement in the PRD passes.
- Core or worker test coverage is at least 80% line coverage, with UI snapshots/e2e for important workflows.
- Lighthouse is at least 95 in all four categories on the deployed playground or preview.
- README, LICENSE, CODE_OF_CONDUCT.md, CONTRIBUTING.md, SECURITY.md, CI, and release workflows exist.
- The local run path from the PRD works on a clean machine.
- Qualifying criteria for this tool pass end to end.

## Read Order

1. Read this file.
2. Read `PRODUCT_REQUIREMENTS.md` end to end.
3. Read `RELEASE_QUALIFICATION_CHECKLIST.md` end to end.
4. Use `CODEX_GOAL_PROMPT.md` only when starting a Codex `/goal` run for this repository.
