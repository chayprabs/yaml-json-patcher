# ConfigShape

Query and patch **YAML**, **JSON**, **TOML**, and **XML** configs in your browser with **jq**, JSONPath, JMESPath, and JSON Patch — comments, anchors, and key order preserved where possible. Everything runs locally; **your files never leave your device**.

[![CI](https://github.com/chayprabs/yaml-json-patcher/actions/workflows/ci.yml/badge.svg)](https://github.com/chayprabs/yaml-json-patcher/actions/workflows/ci.yml)

![ConfigShape playground](packages/web/public/og-image.svg)

## Try it

**Live:** deploy `packages/web/dist` to any static host (Cloudflare Pages, GitHub Pages, `npx serve`).

**Local dev:**

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173

## Self-host

```bash
pnpm install
pnpm build
npx serve packages/web/dist -l 5173
```

**Single-file offline build** (one HTML file, no server required for assets):

```bash
pnpm build:singlefile
# Open packages/web/dist/index.html in a browser
```

## Features

| Area | Support |
|------|---------|
| Formats | JSON, YAML (multi-doc), TOML, XML |
| Query | jq (WASM, lazy-loaded), JSONPath, JMESPath, yq-style |
| Patch | JSON Patch (RFC 6902), JSON Merge Patch (RFC 7396), single-op objects |
| Merge | Deep / shallow / list strategies with conflict resolver |
| Validate | Syntax checks + optional JSON Schema (ajv) |
| Diff | Unified / side-by-side text diff; generate JSON Patch |
| Convert | `/yaml-to-json`, `/json-to-yaml` SEO routes |
| Share | lz-string compressed URL hash |
| PWA | Installable; works offline after first visit |
| CLI | `configshape query`, `patch`, `convert` |

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Enter | Run |
| Ctrl+K | Command palette (mode / engine) |

## Privacy

1. Open DevTools → **Network**
2. Load the app and run a query or patch
3. Confirm **no outbound requests** carry your config (static assets only on first load)

Security contact: [.well-known/security.txt](packages/web/public/.well-known/security.txt)

## Monorepo

```
packages/core/   @configshape/yaml-json-patcher — parsers, engines, patch/merge
packages/web/    Vite + React playground (PWA)
packages/cli/    Terminal wrapper (optional)
```

## Development

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:coverage   # core >= 90% line coverage
pnpm test:e2e
pnpm build
```

## npm packages

- `@configshape/yaml-json-patcher` — tree-shakable core library
- `@configshape/cli` — `npx configshape query file.yaml --engine jq --expr '.x'`

## SEO routes

`/jq-online` · `/yq-online` · `/jsonpath-online` · `/jmespath-online` · `/json-patch-online` · `/yaml-to-json` · `/json-to-yaml` · `/k8s-yaml-query`

## Topics

`yaml` `json` `toml` `xml` `jq` `yq` `jsonpath` `jmespath` `json-patch` `kubernetes-yaml` `browser-only` `wasm` `online-tool`

## License & legal

- **Software:** [MIT License](LICENSE) — Copyright (c) 2026 Chaitanya Prabuddha
- **Third-party notices:** [NOTICE.md](NOTICE.md)
- **Disclaimer:** [DISCLAIMER.md](DISCLAIMER.md)
- **In the web app:** [Privacy Policy](/privacy), [Terms & Conditions](/terms), [License](/license) (paths on deployed site)

Use of the hosted tool is subject to the Terms and Privacy Policy. No warranty is provided; see DISCLAIMER.md.
