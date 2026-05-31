import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  applyConflictResolution,
  applyJsonPatch,
  applyMergePatch,
  generatePatch,
  mergeDocs,
  parse,
  serialize,
  validateSyntax,
  validateWithSchema,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "fixtures");
const samples = join(__dirname, "../../web/public/samples");

function load(name: string): string {
  return readFileSync(join(fixtures, name), "utf8");
}

function loadSample(name: string): string {
  return readFileSync(join(samples, name), "utf8");
}

describe("F3 patch and merge", () => {
  it("JSON Patch replaces scripts.build on package.json sample", () => {
    const doc = parse(loadSample("package.json"), "json");
    const patched = applyJsonPatch(doc, [
      { op: "replace", path: "/scripts/build", value: "tsc && vite build" },
    ]);
    expect((patched.json as { scripts: { build: string } }).scripts.build).toBe("tsc && vite build");
    expect((patched.json as { name: string }).name).toBe("test");
  });

  it("JSON Merge Patch deep-merges scripts on package.json sample", () => {
    const doc = parse(loadSample("package.json"), "json");
    const patched = applyMergePatch(doc, { scripts: { test: "vitest run" } });
    const scripts = (patched.json as { scripts: Record<string, string> }).scripts;
    expect(scripts.build).toBe("vite build");
    expect(scripts.test).toBe("vitest run");
  });

  it("generatePatch produces minimal patch between two JSON docs", () => {
    const before = parse(load("package.json"), "json");
    const after = applyJsonPatch(before, [
      { op: "replace", path: "/scripts/build", value: "tsc && vite build" },
      { op: "replace", path: "/version", value: "2.0.0" },
    ]);
    const patch = generatePatch(before, after);
    expect(patch.some((p) => p.path === "/scripts/build")).toBe(true);
    expect(patch.some((p) => p.path === "/version")).toBe(true);
    const roundTrip = applyJsonPatch(before, patch);
    expect(roundTrip.json).toEqual(after.json);
  });

  it("deep merge combines helm-values-base + helm-values-prod with expected conflicts", () => {
    const base = parse(loadSample("helm-values-base.yaml"), "yaml");
    const prod = parse(loadSample("helm-values-prod.yaml"), "yaml");
    const result = mergeDocs([base, prod], "deep");
    expect(result.ok).toBe(true);

    const merged = result.merged!.json as Record<string, unknown>;
    expect(merged.replicaCount).toBe(3);
    expect((merged.image as { repository: string }).repository).toBe("nginx");
    expect((merged.image as { tag: string }).tag).toBe("2.0");
    expect((merged.ingress as { enabled: boolean }).enabled).toBe(true);

    const paths = result.conflicts.map((c) => c.path).sort();
    expect(paths).toContain("image.tag");
    expect(paths).toContain("service.type");
    expect(paths).toContain("service.port");

    const out = serialize(result.merged!);
    expect(out).toContain("prod.example.com");
    expect(out).toContain("nginx");
  });

  it("applyConflictResolution restores base value at conflict path", () => {
    const base = parse(loadSample("helm-values-base.yaml"), "yaml");
    const prod = parse(loadSample("helm-values-prod.yaml"), "yaml");
    const result = mergeDocs([base, prod], "deep");
    const serviceTypeConflict = result.conflicts.find((c) => c.path === "service.type")!;
    const resolved = applyConflictResolution(result.merged!, [serviceTypeConflict], {
      "service.type": serviceTypeConflict.values[0],
    });
    expect((resolved.json as { service: { type: string } }).service.type).toBe("ClusterIP");
  });

  it("validateSyntax reports errors on malformed JSON", () => {
    const errors = validateSyntax('{"name": unclosed', "json");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]!.line).toBeGreaterThan(0);
    expect(errors[0]!.message.length).toBeGreaterThan(0);
  });

  it("validateSyntax reports unclosed brackets in YAML", () => {
    const errors = validateSyntax("replicaCount: [unclosed\n", "yaml");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]!.message).toMatch(/bracket/i);
  });

  it("validateSyntax reports malformed XML", () => {
    const errors = validateSyntax("<root><unclosed>", "xml");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("validateWithSchema accepts valid document against schema", () => {
    const doc = parse(loadSample("package.json"), "json");
    const schema = JSON.stringify({
      type: "object",
      required: ["name", "version", "scripts"],
      properties: {
        name: { type: "string" },
        version: { type: "string" },
        scripts: { type: "object" },
      },
    });
    const result = validateWithSchema(doc, schema);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validateWithSchema rejects invalid document against schema", () => {
    const doc = parse('{"name": 123}', "json");
    const schema = JSON.stringify({
      type: "object",
      required: ["name"],
      properties: { name: { type: "string" } },
    });
    const result = validateWithSchema(doc, schema);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]!.message).toMatch(/name|string/i);
  });

  it("validateWithSchema rejects malformed schema JSON", () => {
    const doc = parse(loadSample("package.json"), "json");
    const result = validateWithSchema(doc, "{ not valid json");
    expect(result.ok).toBe(false);
    expect(result.errors[0]!.message.length).toBeGreaterThan(0);
  });
});
