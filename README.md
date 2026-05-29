# ConfigShape

Query and patch **YAML**, **JSON**, **TOML** and **XML** configs in your browser with **jq**, JSONPath, JMESPath and JSON Patch — comments, anchors, and key order preserved. Everything runs locally; **the file never leaves your device**.

## Try it online

Open the hosted playground or run locally:

```bash
pnpm install
pnpm dev
```

## Self-host

```bash
pnpm --filter web build
npx serve packages/web/dist
```

Or open the single-file HTML release artifact from GitHub Releases.

## Features

- Four formats with comment-preserving round-trip
- jq (WASM), JSONPath, JMESPath, yq-style queries
- JSON Patch and Merge Patch
- Multi-file merge with conflict highlighting
- JSON Schema validation
- Offline PWA — zero network requests after load

## License

MIT
