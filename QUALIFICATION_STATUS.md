# ConfigShape — Qualification Status

Last verified against `RELEASE_QUALIFICATION_CHECKLIST.md` Section 2.

## Automated (CI on every push to `main`)

- pnpm install, typecheck, lint (ESLint), unit tests, coverage >= 90% (core)
- size-limit bundle budget (core)
- production build + CLI build
- Playwright e2e (home, samples, engines, modes, convert, legal, SEO)

## Implemented in repo

| Area | Status |
|------|--------|
| F1 formats + round-trip | Unit tests |
| F2 query engines | Unit + e2e |
| F3 patch / merge / diff | Unit + e2e |
| F4 validate + JSON Schema | Unit + e2e |
| F5 diff viewer | UI + core |
| F6 share / persist | lz-string hash + zustand persist |
| F7 eight samples | public/samples + e2e |
| PWA + CSP | vite-plugin-pwa + headers |
| SEO routes + JSON-LD + OG image | App routes + index.html |
| security.txt | public/.well-known/security.txt |
| CLI package | packages/cli |
| CodeQL | .github/workflows/codeql.yml |
| Release workflows | npm, web, singlefile |

## Requires hosted deployment (manual)

- Lighthouse >= 95 on production URL
- HTTPS certificate check
- npm publish at tag `v*`
- PWA install prompt on hosted origin

## PRD deviations (documented)

- Editor: textarea-based (not Monaco) for reliability, smaller bundle, and e2e stability
- Command palette replaces full three-pane Monaco layout; product remains single-page playground
