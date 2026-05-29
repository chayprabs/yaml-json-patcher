import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  applyJsonPatch,
  applyMergePatch,
  generatePatch,
  mergeDocs,
  parse,
  serialize,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "fixtures");

function load(name: string): string {
  return readFileSync(join(fixtures, name), "utf8");
}

describe("F3 patch and merge", () => {
  it("JSON Patch replaces scripts.build", () => {
    const doc = parse(load("package.json"), "json");
    const patched = applyJsonPatch(doc, [
      { op: "replace", path: "/scripts/build", value: "vite build" },
    ]);
    expect((patched.json as { scripts: { build: string } }).scripts.build).toBe("vite build");
  });

  it("JSON Merge Patch produces equivalent result", () => {
    const doc = parse(load("package.json"), "json");
    const patched = applyMergePatch(doc, { scripts: { build: "vite build" } });
    expect((patched.json as { scripts: { build: string } }).scripts.build).toBe("vite build");
  });

  it("generates minimal patch between versions", () => {
    const before = parse(load("package.json"), "json");
    const after = applyJsonPatch(before, [
      { op: "replace", path: "/scripts/build", value: "tsc && vite build" },
    ]);
    const patch = generatePatch(before, after);
    expect(patch.some((p) => p.path === "/scripts/build")).toBe(true);
    expect(patch.length).toBeLessThanOrEqual(2);
  });

  it("deep merge combines helm values with conflicts", () => {
    const base = parse(
      `replicaCount: 1\nimage:\n  repository: nginx\n  tag: "1.0"\n`,
      "yaml",
    );
    const prod = parse(
      `replicaCount: 3\nimage:\n  tag: "2.0"\nservice:\n  type: ClusterIP\n`,
      "yaml",
    );
    const result = mergeDocs([base, prod], "deep");
    expect(result.ok).toBe(true);
    expect((result.merged!.json as { replicaCount: number }).replicaCount).toBe(3);
    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(serialize(result.merged!)).toContain("ClusterIP");
  });
});
