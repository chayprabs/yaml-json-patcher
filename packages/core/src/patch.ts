import { applyPatch, compare, validate, type Operation } from "fast-json-patch";
import type { Doc, JsonPatchOperation, MergeResult, MergeStrategy } from "./types.js";
import { parse, serialize } from "./parse.js";
import * as jsonFmt from "./formats/json.js";
import * as yamlFmt from "./formats/yaml.js";
import * as tomlFmt from "./formats/toml.js";
import * as xmlFmt from "./formats/xml.js";

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function updateDocJson(doc: Doc, json: unknown): Doc {
  switch (doc.format) {
    case "json":
      return { ...doc, json, ast: jsonFmt.updateJsonAst(doc.ast as jsonFmt.JsonAst, json) };
    case "yaml":
      return { ...doc, json, ast: yamlFmt.updateYamlJson(doc.ast as yamlFmt.YamlAst, json) };
    case "toml":
      return { ...doc, json, ast: tomlFmt.updateTomlAst(doc.ast as tomlFmt.TomlAst, json as tomlFmt.TomlAst["value"]) };
    case "xml":
      return { ...doc, json, ast: xmlFmt.updateXmlAst(doc.ast as xmlFmt.XmlAst, json) };
  }
}

export function applyJsonPatch(doc: Doc, patch: JsonPatchOperation[]): Doc {
  const errors = validate(patch as Operation[], cloneJson(doc.json));
  if (errors) {
    throw new Error(errors.message ?? "Invalid JSON Patch");
  }
  const result = applyPatch(cloneJson(doc.json), patch as Operation[], true, false).newDocument;
  return updateDocJson(doc, result);
}

export function applyMergePatch(doc: Doc, patch: unknown): Doc {
  const base = cloneJson(doc.json) as Record<string, unknown>;
  if (patch === null) {
    return updateDocJson(doc, {});
  }
  if (typeof patch !== "object" || Array.isArray(patch)) {
    throw new Error("Merge patch must be an object or null");
  }
  const merged = mergeDeep(base, patch as Record<string, unknown>);
  return updateDocJson(doc, merged);
}

function mergeDeep(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...target };
  for (const [key, val] of Object.entries(source)) {
    if (val === null) {
      delete out[key];
    } else if (
      typeof val === "object" &&
      !Array.isArray(val) &&
      typeof out[key] === "object" &&
      out[key] !== null &&
      !Array.isArray(out[key])
    ) {
      out[key] = mergeDeep(out[key] as Record<string, unknown>, val as Record<string, unknown>);
    } else {
      out[key] = val;
    }
  }
  return out;
}

export function generatePatch(before: Doc, after: Doc): JsonPatchOperation[] {
  return compare(
    cloneJson(before.json) as object,
    cloneJson(after.json) as object,
  ) as JsonPatchOperation[];
}

export function mergeDocs(docs: Doc[], strategy: MergeStrategy): MergeResult {
  if (docs.length === 0) {
    return { ok: false, conflicts: [] };
  }
  const conflicts: MergeResult["conflicts"] = [];
  let merged = cloneJson(docs[0]!.json) as Record<string, unknown>;

  for (let i = 1; i < docs.length; i++) {
    const next = cloneJson(docs[i]!.json) as Record<string, unknown>;
    const result = mergeWithStrategy(merged, next, strategy, "", conflicts, i);
    merged = result;
  }

  const baseDoc = docs[0]!;
  return {
    ok: true,
    merged: updateDocJson(baseDoc, merged),
    conflicts,
  };
}

function mergeWithStrategy(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
  strategy: MergeStrategy,
  path: string,
  conflicts: MergeResult["conflicts"],
  overlayIndex: number,
): Record<string, unknown> {
  const out = { ...base };
  for (const [key, val] of Object.entries(overlay)) {
    const childPath = path ? `${path}.${key}` : key;
    if (!(key in out)) {
      out[key] = val;
      continue;
    }
    const existing = out[key];
    if (JSON.stringify(existing) === JSON.stringify(val)) continue;

    if (
      strategy === "deep" &&
      typeof existing === "object" &&
      existing !== null &&
      !Array.isArray(existing) &&
      typeof val === "object" &&
      val !== null &&
      !Array.isArray(val)
    ) {
      out[key] = mergeWithStrategy(
        existing as Record<string, unknown>,
        val as Record<string, unknown>,
        strategy,
        childPath,
        conflicts,
        overlayIndex,
      );
      continue;
    }

    conflicts.push({ path: childPath, values: [existing, val], pickedIndex: overlayIndex });
    out[key] = pickStrategyValue(existing, val, strategy);
  }
  return out;
}

function pickStrategyValue(existing: unknown, incoming: unknown, strategy: MergeStrategy): unknown {
  switch (strategy) {
    case "shallow":
    case "last-write-wins":
    case "deep":
      return incoming;
    case "list-append":
      if (Array.isArray(existing) && Array.isArray(incoming)) {
        return [...existing, ...incoming];
      }
      return incoming;
    case "list-replace":
      return incoming;
  }
}

export function applyConflictResolution(
  doc: Doc,
  conflicts: MergeResult["conflicts"],
  resolutions: Record<string, unknown>,
): Doc {
  const json = cloneJson(doc.json) as Record<string, unknown>;
  for (const conflict of conflicts) {
    const value = resolutions[conflict.path] ?? conflict.values[conflict.pickedIndex];
    setAtPath(json, conflict.path, value);
  }
  return updateDocJson(doc, json);
}

function setAtPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]!;
    if (typeof cur[p] !== "object" || cur[p] === null) {
      cur[p] = {};
    }
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]!] = value;
}

export { serialize, parse };
