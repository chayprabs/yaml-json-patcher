/**
 * Traces web UI logic paths (useEvaluate patch routing, ConflictResolver) without a browser.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  applyConflictResolution,
  applyPatchDocument,
  detectFormat,
  generatePatch,
  mergeDocs,
  parse,
  serialize,
  unifiedDiff,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samples = join(__dirname, "../../web/public/samples");

function evaluatePatch(source: string, patchText: string, format = "auto") {
  const fmt = format === "auto" ? detectFormat(source) : format;
  const doc = parse(source, fmt as "json");
  const patch = JSON.parse(patchText);
  return applyPatchDocument(doc, patch);
}

function conflictResolve(
  output: string,
  source: string,
  conflicts: ReturnType<typeof mergeDocs>["conflicts"],
  path: string,
  choice: "base" | "incoming",
) {
  const fmt = output.trim() ? detectFormat(output) : detectFormat(source);
  const base = parse(output.trim() || source, fmt);
  const conflict = conflicts.find((c) => c.path === path);
  if (!conflict) return null;
  const resolutions: Record<string, unknown> = {};
  if (choice === "base") resolutions[path] = conflict.values[0];
  else {
    resolutions[path] = conflict.values[conflict.pickedIndex] ?? conflict.values[conflict.values.length - 1];
  }
  return serialize(applyConflictResolution(base, [conflict], resolutions));
}

describe("web UI trace — patch mode", () => {
  const pkg = readFileSync(join(samples, "package.json"), "utf8");

  it("array patch text routes to JSON Patch", () => {
    const out = evaluatePatch(
      pkg,
      '[{"op":"replace","path":"/scripts/build","value":"webpack"}]',
    );
    expect((out.json as { scripts: { build: string } }).scripts.build).toBe("webpack");
  });

  it("object patch text routes to merge patch", () => {
    const out = evaluatePatch(pkg, '{"scripts":{"build":"webpack"}}');
    expect((out.json as { scripts: { build: string } }).scripts.build).toBe("webpack");
  });

  it("single JSON Patch operation object routes to JSON Patch", () => {
    const out = evaluatePatch(pkg, '{"op":"replace","path":"/scripts/build","value":"webpack"}');
    expect((out.json as { scripts: { build: string } }).scripts.build).toBe("webpack");
  });

  it("null patch text throws instead of wiping document", () => {
    expect(() => evaluatePatch(pkg, "null")).toThrow(/null/i);
  });
});

describe("web UI trace — conflict resolution", () => {
  const baseYaml = readFileSync(join(samples, "helm-values-base.yaml"), "utf8");
  const prodYaml = readFileSync(join(samples, "helm-values-prod.yaml"), "utf8");

  it("resolving one conflict preserves other merged fields", () => {
    const result = mergeDocs(
      [parse(baseYaml, "yaml"), parse(prodYaml, "yaml")],
      "deep",
    );
    const mergedOut = serialize(result.merged!);
    const resolved = conflictResolve(mergedOut, baseYaml, result.conflicts, "service.type", "base");
    expect(resolved).toContain("ClusterIP");
    expect(resolved).toContain("tag: \"2.0\"");
    expect(resolved).toContain("prod.example.com");
  });

  it("deep merge applies prod replicaCount in merged output", () => {
    const result = mergeDocs(
      [parse(baseYaml, "yaml"), parse(prodYaml, "yaml")],
      "deep",
    );
    expect((result.merged!.json as { replicaCount: number }).replicaCount).toBe(3);
  });
});

describe("web UI trace — diff mode", () => {
  it("generatePatch uses parsed JSON, ignoring formatting differences in source text", () => {
    const before = parse('{"a":1,"b":2}', "json");
    const after = parse('{\n  "a": 1,\n  "b": 3\n}\n', "json");
    const patch = generatePatch(before, after);
    expect(patch).toEqual([{ op: "replace", path: "/b", value: 3 }]);
  });

  it("unifiedDiff uses LCS and shows inserted line", () => {
    const before = "a\nb\nc";
    const after = "a\nX\nb\nc";
    const diff = unifiedDiff(before, after);
    expect(diff).toContain("+X");
    expect(diff).not.toMatch(/^-b$/m);
  });

  it("unifiedDiff hunk header uses correct line numbers for insertions", () => {
    const diff = unifiedDiff("a", "a\nb");
    expect(diff).toContain("@@ -1,0 +2,1 @@");
  });
});
