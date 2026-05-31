import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse, query, type Doc, type Engine, type Format } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "fixtures");
const samples = join(__dirname, "../../web/public/samples");

function load(dir: string, name: string): string {
  return readFileSync(join(dir, name), "utf8");
}

const K8S_EXPR = ".spec.template.spec.containers[].image";
const K8S_JSONPATH = "$.spec.template.spec.containers[*].image";
const K8S_JMES = "spec.template.spec.containers[*].image";
const K8S_EXPECTED = ["nginx:1.25", "busybox:1.36"];

/** Sample loader expectations from packages/web/src/components/samples.ts */
const SAMPLE_CASES = [
  {
    key: "k8s",
    file: "k8s-deployment.yaml",
    format: "yaml" as Format,
    engine: "jq" as Engine,
    expression: ".spec.template.spec.containers[].image",
    expected: K8S_EXPECTED,
  },
  {
    key: "pkg",
    file: "package.json",
    format: "json" as Format,
    engine: "jsonpath" as Engine,
    expression: "$.scripts",
    expected: { build: "vite build" },
  },
  {
    key: "gha",
    file: "github-actions.yml",
    format: "yaml" as Format,
    engine: "jq" as Engine,
    expression: ".jobs",
    expectKeys: ["test"],
  },
  {
    key: "pyproject",
    file: "pyproject.toml",
    format: "toml" as Format,
    engine: "jsonpath" as Engine,
    expression: "$.project",
    expected: { name: "configshape", version: "0.1.0", description: "Query and patch configs" },
  },
  {
    key: "compose",
    file: "docker-compose.yml",
    format: "yaml" as Format,
    engine: "jsonpath" as Engine,
    expression: "$.services",
    expectKeys: ["web", "api"],
  },
  {
    key: "cargo",
    file: "Cargo.toml",
    format: "toml" as Format,
    engine: "jsonpath" as Engine,
    expression: "$.package",
    expected: { name: "demo-crate", version: "0.1.0", edition: "2021" },
  },
  {
    key: "atom",
    file: "atom-feed.xml",
    format: "xml" as Format,
    engine: "jsonpath" as Engine,
    expression: "$.feed.entry.title",
    expected: "Hello World",
  },
] as const;

const FORMAT_FIXTURES: { format: Format; file: string; dir: "fixtures" | "samples" }[] = [
  { format: "json", file: "package.json", dir: "fixtures" },
  { format: "yaml", file: "k8s-deployment.yaml", dir: "fixtures" },
  { format: "toml", file: "pyproject.toml", dir: "fixtures" },
  { format: "xml", file: "atom-feed.xml", dir: "fixtures" },
];

describe("query path verification", () => {
  describe("formats parse and empty expression returns full doc", () => {
    for (const { format, file, dir } of FORMAT_FIXTURES) {
      it(`${format} (${file})`, async () => {
        const base = dir === "fixtures" ? fixtures : samples;
        const doc = parse(load(base, file), format);
        const result = await query(doc, "jq", "");
        expect(result.ok).toBe(true);
        expect(result.value).toEqual(doc.json);
      });
    }
  });

  describe("k8s PRD expressions per engine", () => {
    const k8s = parse(load(fixtures, "k8s-deployment.yaml"), "yaml");
    const cases: { engine: Engine; expr: string }[] = [
      { engine: "jq", expr: K8S_EXPR },
      { engine: "jsonpath", expr: K8S_JSONPATH },
      { engine: "jmespath", expr: K8S_JMES },
      { engine: "yq", expr: K8S_EXPR },
    ];

    for (const { engine, expr } of cases) {
      it(`${engine}: ${expr}`, async () => {
        const result = await query(k8s, engine, expr);
        expect(result.ok).toBe(true);
        expect(result.value).toEqual(K8S_EXPECTED);
      }, 30000);
    }
  });

  describe("sample loader query expressions", () => {
    for (const sample of SAMPLE_CASES) {
      it(`${sample.key} (${sample.engine}: ${sample.expression})`, async () => {
        const doc = parse(load(samples, sample.file), sample.format);
        const result = await query(doc, sample.engine, sample.expression);
        expect(result.ok).toBe(true);
        if ("expected" in sample && sample.expected !== undefined) {
          expect(result.value).toEqual(sample.expected);
        }
        if ("expectKeys" in sample && sample.expectKeys) {
          expect(result.value).toBeTruthy();
          for (const key of sample.expectKeys) {
            expect(result.value).toHaveProperty(key);
          }
        }
      }, 30000);
    }
  });

  describe("invalid expressions handled gracefully", () => {
    const k8s = parse(load(fixtures, "k8s-deployment.yaml"), "yaml");
    const invalid: { engine: Engine; expr: string }[] = [
      { engine: "jq", expr: "(((((" },
      { engine: "jsonpath", expr: "$..[[[" },
      { engine: "jmespath", expr: "???invalid???" },
      { engine: "yq", expr: "(((((" },
    ];

    for (const { engine, expr } of invalid) {
      it(`${engine} rejects invalid expr`, async () => {
        const result = await query(k8s, engine, expr);
        expect(result.ok).toBe(false);
        expect(result.errors?.[0]?.message).toBeTruthy();
      }, 30000);
    }
  });
});
