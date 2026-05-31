import { JSONPath } from "jsonpath-plus";
import * as jmespath from "@jmespath-community/jmespath";
import type { Doc, Engine, QueryResult } from "./types.js";

export async function query(doc: Doc, engine: Engine, expr: string): Promise<QueryResult> {
  if (!expr.trim()) {
    return { ok: true, value: doc.json };
  }
  try {
    switch (engine) {
      case "jq":
        return await queryJq(doc, expr);
      case "jsonpath":
        return queryJsonPath(doc, expr);
      case "jmespath":
        return queryJmesPath(doc, expr);
      case "yq":
        return await queryYq(doc, expr);
    }
  } catch (err) {
    return {
      ok: false,
      errors: [{ line: 1, column: 1, message: err instanceof Error ? err.message : String(err) }],
    };
  }
}

async function queryJq(doc: Doc, expr: string): Promise<QueryResult> {
  const { runJq } = await import("./engines/jq.js");
  const value = await runJq(doc.json, expr);
  return { ok: true, value };
}

function queryJsonPath(doc: Doc, expr: string): QueryResult {
  const trimmed = expr.trim();
  if (trimmed && !trimmed.startsWith("$") && !trimmed.startsWith("@")) {
    return {
      ok: false,
      errors: [
        {
          line: 1,
          column: 1,
          message: `JSONPath must start with $ or @ (e.g. $.field). Got: ${trimmed}`,
        },
      ],
    };
  }
  try {
    const value = JSONPath({
      path: expr,
      json: doc.json as string | number | boolean | object | null,
      wrap: false,
    });
    if (
      value === undefined &&
      trimmed &&
      (/\[\[\[/.test(trimmed) || /\.\.\[\[/.test(trimmed) || /\$[^'"\s]*\[[^\]'"]*\[[^\]'"]*\]/.test(trimmed))
    ) {
      return {
        ok: false,
        errors: [{ line: 1, column: 1, message: `Invalid JSONPath expression: ${trimmed}` }],
      };
    }
    return { ok: true, value: value === undefined ? null : value };
  } catch (err) {
    return {
      ok: false,
      errors: [{ line: 1, column: 1, message: err instanceof Error ? err.message : String(err) }],
    };
  }
}

function queryJmesPath(doc: Doc, expr: string): QueryResult {
  const value = jmespath.search(
    doc.json as Parameters<typeof jmespath.search>[0],
    expr,
  );
  return { ok: true, value };
}

async function queryYq(doc: Doc, expr: string): Promise<QueryResult> {
  const { runJq } = await import("./engines/jq.js");
  const value = await runJq(doc.json, expr);
  return { ok: true, value };
}
