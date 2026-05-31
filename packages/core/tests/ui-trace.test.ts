/**
 * Traces web UI logic paths (useEvaluate patch routing, ConflictResolver) without a browser.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  applyConflictResolution,
  applyJsonPatch,
  applyMergePatch,
  detectFormat,
  generatePatch,
  mergeDocs,
  parse,
  serialize,
  unifiedDiff,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samples = join(__dirname, "../../web/public/samples");

/** Mirrors useEvaluate patch mode: Array.isArray → JSON Patch vs merge patch */
function evaluatePatch(source: string, patchText: string, format = "auto") {
  const fmt = format === "auto" ? detectFormat(source) : format;
  const doc = parse(source, fmt as "json");
  const patch = JSON.parse(patchText);
  return Array.isArray(patch) ? applyJsonPatch(doc, patch) : applyMergePatch(doc, patch);
}

/** Mirrors ConflictResolver.resolve() */
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
  else resolutions[path] = conflict.values[1];
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

  it("BUG: single JSON Patch operation object is misrouted to merge patch (corrupts doc)", () => {
    const patchText = '{"op":"replace","path":"/scripts/build","value":"webpack"}';
    const out = evaluatePatch(pkg, patchText);
    expect((out.json as Record<string, unknown>).op).toBe("replace");
    expect((out.json as { scripts: { build: string } }).scripts.build).toBe("vite build");
  });

  it("BUG: null patch text wipes document via merge patch", () => {
    const out = evaluatePatch(pkg, "null");
    expect(out.json).toEqual({});
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
    expect(resolved).toContain("type: ClusterIP");
    expect(resolved).toContain("tag: \"2.0\"");
    expect(resolved).toContain("prod.example.com");
  });

  it("BUG: deep merge reports scalar overlay differences as conflicts even after auto-resolve", () => {
    const result = mergeDocs(
      [parse(baseYaml, "yaml"), parse(prodYaml, "yaml")],
      "deep",
    );
    const replicaConflict = result.conflicts.find((c) => c.path === "replicaCount");
    expect(replicaConflict).toBeDefined();
    expect((result.merged!.json as { replicaCount: number }).replicaCount).toBe(3);
  });

  it("BUG: empty output falls back to source (base only), losing merge result", () => {
    const result = mergeDocs(
      [parse(baseYaml, "yaml"), parse(prodYaml, "yaml")],
      "deep",
    );
    const resolved = conflictResolve("", baseYaml, result.conflicts, "service.type", "incoming");
    expect(resolved).not.toContain("prod.example.com");
    expect(resolved).not.toContain("replicaCount: 3");
  });
});

describe("web UI trace — diff mode", () => {
  it("generatePatch uses parsed JSON, ignoring formatting differences in source text", () => {
    const before = parse('{"a":1,"b":2}', "json");
    const after = parse('{\n  "a": 1,\n  "b": 3\n}', "json");
    const patch = generatePatch(before, after);
    expect(patch).toEqual([{ op: "replace", path: "/b", value: 3 }]);
  });

  it("BUG: diff mode uses source format for before but detectFormat for after", () => {
    const yamlBefore = "count: 1\n";
    const jsonAfter = '{"count": 2}';
    const fmt = "yaml" as const;
    const beforeDoc = parse(yamlBefore, fmt);
    const afterDoc = parse(jsonAfter, detectFormat(jsonAfter));
    expect(beforeDoc.format).toBe("yaml");
    expect(afterDoc.format).toBe("json");
    const patch = generatePatch(beforeDoc, afterDoc);
    expect(patch).toEqual([{ op: "replace", path: "/count", value: 2 }]);
  });

  it("BUG: unifiedDiff misaligns when lines are inserted (index-by-index, not LCS)", () => {
    const before = "a\nb\nc";
    const after = "a\nX\nb\nc";
    const diff = unifiedDiff(before, after);
    expect(diff).toContain("-b");
    expect(diff).toContain("+X");
    expect(diff).toContain("-c");
    expect(diff).toContain("+b");
  });

  it("BUG: DiffViewer text diff disagrees with generatePatch for same semantic change", () => {
    const beforeText = '{"a":1,"b":2}';
    const afterText = '{\n  "a": 1,\n  "b": 3\n}';
    const patch = generatePatch(parse(beforeText, "json"), parse(afterText, "json"));
    const textDiff = unifiedDiff(beforeText, afterText);
    expect(patch).toHaveLength(1);
    expect(textDiff.split("\n").filter((l) => l.startsWith("+") || l.startsWith("-")).length).toBeGreaterThan(2);
  });
});
