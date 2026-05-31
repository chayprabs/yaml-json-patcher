# Product Requirements 02 - ConfigShape (`yaml-json-patcher`)

## 0. Meta

| Field | Value |
|---|---|
| Tool ID | `config-shape` |
| Repo name | `yaml-json-patcher` |
| Architecture pattern | **Pattern C+D - Browser-only** (100% in browser; no upload) |
| Core language | TypeScript; WASM modules: `jq-wasm`, `js-yaml` (pure JS), `@iarna/toml`, `fast-xml-parser`. |
| PRD version | 1.0.0 |
| Read first | [`IMPLEMENTATION_HANDOFF.md`](IMPLEMENTATION_HANDOFF.md) |

---

## 1. Product overview

**One-liner.** Query and patch YAML, JSON, TOML and XML configs in your
browser with jq, JSONPath, JMESPath and JSON Patch - comments,
anchors, and key order preserved.

**Problem.** Editing structured configs (Kubernetes manifests, GitHub
Actions, `pyproject.toml`, `docker-compose.yml`) by hand is risky:
formats are picky about whitespace and order, comments get lost when
navely round-tripping, and trying to script-patch with `sed` is
fragile. Online jq/JSONPath testers don't handle YAML or TOML;
yq/yaml-cli tools require local install.

**Solution.** A two-pane browser playground where the user pastes any
config, runs jq / JSONPath / JMESPath / yq queries, applies JSON
Patch operations, or merges multiple configs - and gets back the
result with comments and structure preserved. Everything runs in
the browser via WASM; **the file never leaves the user's device**.

**Strategic fit.** Highest-value browser-only utility. Privacy claim
("never leaves your browser") is verifiable in dev tools and is a
strong differentiator vs JSON Editor Online and stedolan.github.io/jq.

---

## 2. Goals & non-goals

### Goals

- G1. Support 4 formats (JSON, YAML, TOML, XML) with comment + key-order preservation where possible.
- G2. Support 4 query engines (jq, JSONPath, JMESPath, yq-style).
- G3. Support JSON Patch (RFC 6902) and JSON Merge Patch (RFC 7396).
- G4. Support multi-file merge with conflict highlighting.
- G5. 100% in-browser: zero network requests after page load.
- G6. Bundle size <= 2 MB gzipped initial JS + WASM.
- G7. Time-to-first-result <= 200 ms after typing pause for inputs <= 1 MB.

### Non-goals

- NG1. Server-side processing (no upload, ever).
- NG2. Schema-aware validation beyond JSON Schema (no Kubernetes-specific or other domain schemas in v1).
- NG3. Full XML XPath/XSLT - only basic JSONPath-equivalent traversal of XML-to-JSON tree.
- NG4. Editing very large files (>50 MB) - out of scope; will surface a warning.

---

## 3. Target users & personas

### Primary - DevOps engineer "Daria"

- Edits Kubernetes YAML and Helm values regularly.
- Wants to extract a field across multi-doc YAML streams without `grep`.
- Cares deeply about comments and key order being preserved.

### Primary - Backend engineer "Bence"

- Writes JSON Patch operations and tests them against sample configs.
- Wants jq for JSON and an equivalent ergonomics for YAML.

### Secondary - Tech writer / SRE who needs to merge configs across environments.

### Anti-personas

- Users wanting visual JSON-tree editing only (covered by JSON Editor Online; not our market).

---

## 4. User stories & scenarios

- U1. Daria pastes a multi-doc Kubernetes YAML and runs `.metadata.labels.app` across all docs.
- U2. Bence drafts a JSON Patch and immediately sees the patched result with diff highlighting.
- U3. Daria merges two `values.yaml` files with deep-merge strategy and sees conflicts inline.
- U4. Bence drops a JSON Schema and gets validation errors with line/column markers.
- U5. Daria converts YAML -> JSON for paste into a tool that only accepts JSON.
- U6. Bence shares a snippet URL with a colleague.

### Scenario A - YAML query

Daria pastes a 200-line Kubernetes manifest. Selects engine = `yq`,
expression = `.spec.template.spec.containers[].image`. Right pane
updates in real time as she types. Output is a JSON array of image
strings, with copy-to-clipboard.

### Scenario B - JSON Patch with diff

Bence pastes a `package.json`. Switches to patch mode. Writes:
```json
[{"op":"replace","path":"/scripts/build","value":"vite build"}]
```
The bottom panel shows a unified diff. He clicks "Apply" and the
left pane updates. Comments in the file are preserved.

### Scenario C - Merge conflict

Daria pastes `base.yaml` and `prod.yaml` into merge mode. The merge
view shows each conflicting path with a "use base / use prod / custom"
selector. Output downloads as `merged.yaml` with comments retained.

---

## 5. Functional requirements

### F1. Format support & round-tripping

| Format | Parse | Serialize | Comments preserved | Key order preserved |
|---|---|---|---|---|
| JSON | native | native | n/a | Y |
| YAML | `yaml` (eemeli-aro) | `yaml` | Y | Y |
| TOML | `@iarna/toml` | `@iarna/toml` | Y | Y |
| XML | `fast-xml-parser` | `fast-xml-parser` | Y (best-effort) | Y |

- F1.1 Format auto-detect; manual override available.
- F1.2 Multi-doc YAML (`---` separated) supported with per-doc query.
- F1.3 YAML anchors and aliases preserved on round-trip.

### F2. Query engines

- F2.1 **jq** - via `jq-wasm` (gojq compiled to WASM); supports full jq syntax.
- F2.2 **JSONPath** - via `jsonpath-plus`.
- F2.3 **JMESPath** - via `@jmespath-community/jmespath`.
- F2.4 **yq-style** - superset of jq that operates on YAML AST; for v1 implement as YAML->JSON->jq->serialize-back.
- F2.5 Engine selector with persistent default (localStorage).
- F2.6 As-you-type evaluation with 150 ms debounce.

### F3. Patch & merge

- F3.1 JSON Patch (RFC 6902) editor and apply.
- F3.2 JSON Merge Patch (RFC 7396) editor and apply.
- F3.3 Patch generator: given before/after, output a minimal JSON Patch.
- F3.4 Multi-file merge with strategies: `deep`, `shallow`, `list-append`, `list-replace`, `last-write-wins`.
- F3.5 Merge conflict UI shows per-path conflicts with side-by-side selector.

### F4. Validation

- F4.1 Format-syntax validation with line/column error markers in Monaco editor.
- F4.2 JSON Schema validation (paste schema in side panel) using `ajv`.

### F5. Diff view

- F5.1 Unified diff and side-by-side diff toggleable.
- F5.2 Copy-as-diff and download-as-`.patch`.

### F6. Share & persist

- F6.1 Shareable URLs encode inputs in URL hash (no server storage).
- F6.2 Compress with `lz-string` to keep URLs short.
- F6.3 Auto-save drafts to localStorage; "Restore last session" prompt.

### F7. Sample loader

- F7.1 Curated gallery: Kubernetes Deployment, Helm values, GitHub Actions, `pyproject.toml`, `docker-compose.yml`, `package.json`, `Cargo.toml`, atom-feed XML.

---

## 6. Non-functional requirements

- NFR1. Initial gzipped JS+WASM <= 2 MB. Code-split jq-wasm so it loads lazily when engine = jq.
- NFR2. Lighthouse >= 95.
- NFR3. Works offline after first load (PWA).
- NFR4. **Verifiably zero network requests** after initial load. Dev-tools Network tab is empty.
- NFR5. Memory usage <= 200 MB browser tab on 1 MB input.
- NFR6. WCAG 2.2 AA, including high-contrast Monaco theme.

---

## 7. Architecture

### Pattern

Pattern C+D - Browser-only with PWA.

### System

```
+---------------------------------------------------------+
| Browser                                                 |
| +-------------+  +---------------------------------+    |
| |  Vite SPA   |-|  @<npm-scope>/yaml-json-patcher |    |
| |  React +    |  |  (core)                          |    |
| |  Monaco     |  |   jq-wasm (lazy)                |    |
| |             |  |   yaml/toml/xml parsers (JS)    |    |
| |             |  |   ajv (JSON Schema)             |    |
| +-------------+  +---------------------------------+    |
+---------------------------------------------------------+
```

### Tech stack

- Build: Vite 6 + React 19 + TS + Tailwind 4 + shadcn/ui.
- Editor: Monaco (loaded lazily).
- jq: `jq-wasm` (gojq compiled to WASM).
- YAML: `yaml` (eemeli-aro, comment-preserving CST mode).
- TOML: `@iarna/toml`.
- XML: `fast-xml-parser`.
- JSON Schema: `ajv` + `ajv-formats`.
- PWA: `vite-plugin-pwa`.
- Singlefile build: `vite-plugin-singlefile` (release artifact).

### Repo layout

Standard browser-only template (AGENT_HANDOFF Section 4).

`packages/core/` exports:
- `parse(input: string, format?: Format): Doc`
- `serialize(doc: Doc, format: Format): string`
- `query(doc: Doc, engine: Engine, expr: string): unknown`
- `applyJsonPatch(doc: Doc, patch: Operation[]): Doc`
- `applyMergePatch(doc: Doc, patch: unknown): Doc`
- `generatePatch(before: Doc, after: Doc): Operation[]`
- `mergeDocs(docs: Doc[], strategy: MergeStrategy): MergeResult`

`packages/web/` is the playground.

---

## 8. Data model

```ts
export type Format = "json" | "yaml" | "toml" | "xml";
export type Engine = "jq" | "jsonpath" | "jmespath" | "yq";
export type MergeStrategy = "deep" | "shallow" | "list-append" | "list-replace" | "last-write-wins";

export interface Doc {
  format: Format;
  // Format-specific AST (preserves comments, order, anchors)
  ast: unknown;
  // Convenience JSON projection for engines that don't see AST
  json: unknown;
}

export interface QueryResult {
  ok: boolean;
  value?: unknown;
  errors?: { line: number; column: number; message: string }[];
}

export interface MergeResult {
  ok: boolean;
  merged?: Doc;
  conflicts: { path: string; values: unknown[]; pickedIndex: number }[];
}
```

---

## 9. UI / UX

### Page: `/`

Three-pane layout:

- **Left pane (source):** Monaco editor with format badge in corner, line/col status bar, error markers.
- **Top center toolbar:** mode selector (Query / Patch / Merge / Validate / Diff), engine selector, format selector, share button, theme toggle.
- **Right pane (output):** Monaco read-only view with format-appropriate highlighting, copy/download buttons.
- **Bottom drawer:** logs, warnings, schema validator output, expandable.

### Modes

- **Query mode** - expression input bar across the top of right pane; output below.
- **Patch mode** - patch JSON editor docked between left and right; result in right pane; diff drawer at bottom.
- **Merge mode** - N-tab input on left (one tab per file); strategy selector; output on right; conflict resolver pane appears when conflicts exist.
- **Validate mode** - schema editor docked; ajv errors render as Monaco markers on left.
- **Diff mode** - left pane splits into Before / After; right pane shows generated patch.

### Sample picker

Sticky bottom strip with sample icons; click to load both input(s) and expression.

### Keyboard shortcuts

- `Cmd/Ctrl+Enter` - run query.
- `Cmd/Ctrl+S` - save to localStorage.
- `Cmd/Ctrl+K` - open command palette (mode/engine switch).

### Mobile

Stacks vertically. Output pane below source. Monaco swapped for CodeMirror Lite on viewports < 640px.

---

## 10. Library surface (`packages/core`)

Tree-shakable ESM exports. Each engine lazy-loaded:

```ts
import { parse, serialize } from "@<npm-scope>/yaml-json-patcher";
const lazyJq = () => import("@<npm-scope>/yaml-json-patcher/jq");
```

Bundle-size targets (gzipped):

- Core (parse/serialize/jsonpatch): <= 90 KB.
- + JSONPath: <= 110 KB.
- + JMESPath: <= 130 KB.
- + jq-wasm (lazy): + 800 KB.
- + ajv (validate): + 60 KB.

Public API documented with TSDoc; auto-generate docs site on release.

---

## 11. Sample data

Stored in `packages/web/public/samples/`:

1. `k8s-deployment.yaml` with comments.
2. `helm-values-base.yaml` and `helm-values-prod.yaml` for merge demo.
3. `github-actions.yml`.
4. `pyproject.toml`.
5. `docker-compose.yml`.
6. `package.json`.
7. `Cargo.toml`.
8. `atom-feed.xml`.

Each sample shipped with a recommended sample expression and mode.

---

## 12. Privacy & security

- Network panel shows zero requests after load. README documents the verification steps.
- No analytics that send input contents; only anonymous page views.
- localStorage scoped to the origin; "Clear all" button in settings.
- `Content-Security-Policy` strict: `default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'none';` (connect-src none after load if achievable; otherwise `self` for SW updates).

---

## 13. Testing

- Vitest unit tests for parse/serialize round-trips on 100+ fixtures (snapshot tests).
- Property-based tests with `fast-check` for query engines (random JSON -> expr -> assert idempotence where applicable).
- Playwright e2e: load each sample, run sample expression, assert output.
- Visual snapshot tests (Playwright) for key UI states.
- Coverage target: core >= 90%, web >= 70%.

---

## 14. Deployment

- Hosted: static deploy (e.g. Cloudflare Pages, GitHub Pages).
- npm: `@<npm-scope>/yaml-json-patcher` published on tagged release.
- Single-file HTML release artifact attached to GitHub release.

Self-host: download release ZIP, `npx serve .` or open the single HTML file.

---

## 15. CI/CD

Per AGENT_HANDOFF Section 9. Browser-specific:

- Bundle-size budget enforced via `size-limit`.
- npm package built via `tsup`.
- Visual snapshot tests in Playwright.

---

## 16. SEO

- Description: "Query and patch YAML, JSON, TOML and XML configs in your browser with jq, JSONPath, JMESPath and JSON Patch - comments preserved."
- Topics: `yaml`, `json`, `toml`, `xml`, `jq`, `yq`, `jsonpath`, `jmespath`, `json-patch`, `json-merge-patch`, `config`, `kubernetes-yaml`, `yaml-editor`, `json-editor`, `online-tool`, `browser-only`, `wasm`.
- Sub-routes: `/jq-online`, `/yq-online`, `/jsonpath-online`, `/jmespath-online`, `/json-patch-online`, `/yaml-to-json`, `/json-to-yaml`, `/k8s-yaml-query`.

---

## 17. License & monetization

- Core: **MIT**.
- Free everywhere. Optional Pro for team workspace + saved snippet sync.

---

## 18. Launch

### MVP

- JSON + YAML + JSON Patch + jq + JSONPath.
- 3 sample files.
- PWA install.

### Beta

- TOML + XML.
- JMESPath + yq engines.
- Merge mode.
- Schema validation.

### GA

- Single-file HTML release.
- npm package published.

---

## 19. Success metrics

- NSM: queries-evaluated per week.
- Leading: npm downloads of `@<npm-scope>/yaml-json-patcher`.
- Quality: % of input documents that round-trip lossless.

---

## 20. Acceptance

- A1. Every sample loads + runs sample expression with expected output.
- A2. Comments and key order preserved on round-trip for each format.
- A3. Bundle-size budgets met.
- A4. Dev-tools Network tab empty after first paint.
- A5. PWA installable and works offline.

---

## 21. Risks

| Risk | Mitigation |
|---|---|
| jq-wasm bundle too large | Lazy-load on engine selection; preview only when user opens. |
| YAML comment preservation imperfect for some edge cases | Use `yaml` CST mode; ship round-trip fuzz fixtures. |
| Browser memory cap on big inputs | Warn at 10 MB; refuse at 50 MB with clear message. |

---

## 22. Future roadmap

- Pyodide-based yq for richer features.
- Diff against a JSON Schema.
- VS Code extension reusing core.
- CLI release (`npx @<npm-scope>/yaml-json-patcher`).

---

## 23. Glossary

- **CST** - Concrete Syntax Tree, preserves comments and whitespace.
- **Merge Patch** - RFC 7396, simpler than JSON Patch.
- **Round-trip lossless** - parse -> serialize yields byte-identical (or semantically-equivalent) output.
