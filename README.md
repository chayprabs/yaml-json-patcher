# ConfigShape

Query and patch **YAML**, **JSON**, **TOML**, and **XML** configs in your browser with **jq**, JSONPath, JMESPath, and JSON Patch — comments, anchors, and key order preserved where possible. Everything runs locally; **your files never leave your device**.

## Try it online

Deploy the static build to any host, or run locally:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Self-host

```bash
pnpm install
pnpm build
npx serve packages/web/dist
```

For a single-file offline build:

```bash
pnpm build:singlefile
# artifact: packages/web/dist/index.html
```

## Features

| Area | Support |
|------|---------|
| Formats | JSON, YAML (multi-doc), TOML, XML |
| Query | jq (WASM, lazy-loaded), JSONPath, JMESPath, yq-style |
| Patch | JSON Patch (RFC 6902), JSON Merge Patch (RFC 7396) |
| Merge | Deep / shallow / list strategies with conflict UI |
| Validate | Syntax errors + optional JSON Schema (ajv) |
| Diff | Unified and side-by-side diff, copy/download `.patch` |
| Privacy | No upload; processing in-browser after load |
| PWA | Installable, works offline after first visit |

## Verify privacy (no upload)

1. Open DevTools → **Network**.
2. Load the app and run a query or patch.
3. Confirm **no outbound requests** carry your pasted config (only static assets on first load).

## Monorepo layout

```
packages/core/   @configshape/yaml-json-patcher — parsers, engines, patch/merge
packages/web/    Vite + React playground
```

## Development

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## SEO routes

`/jq-online`, `/yq-online`, `/jsonpath-online`, `/jmespath-online`, `/json-patch-online`, `/yaml-to-json`, `/json-to-yaml`, `/k8s-yaml-query`

## License

MIT — see [LICENSE](LICENSE).
