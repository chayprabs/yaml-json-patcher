import { XMLParser, XMLBuilder } from "fast-xml-parser";
import type { ParseError } from "../types.js";

export interface XmlAst {
  kind: "xml";
  source: string;
  value: unknown;
}

/** Preserve order/comments for round-trip serialization */
const PARSER_OPTS = {
  ignoreAttributes: false,
  preserveOrder: true,
  commentPropName: "#comment",
  trimValues: false,
} as const;

/** Plain object tree for query engines (JSONPath, jq, etc.) */
const PARSER_JSON_OPTS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: false,
} as const;

const BUILDER_OPTS = {
  ignoreAttributes: false,
  preserveOrder: true,
  commentPropName: "#comment",
  format: true,
  suppressEmptyNode: false,
} as const;

export function parseXml(input: string): { ast: XmlAst; json: unknown } {
  const parser = new XMLParser(PARSER_OPTS);
  const value = parser.parse(input);
  const jsonParser = new XMLParser(PARSER_JSON_OPTS);
  const json = jsonParser.parse(input);
  return {
    ast: { kind: "xml", source: input, value },
    json,
  };
}

export function serializeXml(ast: XmlAst): string {
  if (ast.source.trim()) {
    return ast.source.endsWith("\n") ? ast.source : ast.source + "\n";
  }
  const builder = new XMLBuilder(BUILDER_OPTS);
  const out = builder.build(ast.value);
  return typeof out === "string" ? (out.endsWith("\n") ? out : out + "\n") : String(out);
}

export function validateXml(input: string): ParseError[] {
  try {
    const parser = new XMLParser(PARSER_OPTS);
    parser.parse(input);
    return [];
  } catch (err) {
    return [{ line: 1, column: 1, message: err instanceof Error ? err.message : String(err) }];
  }
}

export function updateXmlAst(ast: XmlAst, json: unknown): XmlAst {
  return { kind: "xml", source: ast.source, value: plainToOrdered(json) };
}

function plainToOrdered(json: unknown): unknown {
  if (json === null || typeof json !== "object" || Array.isArray(json)) {
    return json;
  }
  const obj = json as Record<string, unknown>;
  const result: unknown[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (Array.isArray(val)) {
      for (const item of val) {
        result.push({ [key]: wrapLeaf(item) });
      }
    } else {
      result.push({ [key]: wrapLeaf(val) });
    }
  }
  return result;
}

function wrapLeaf(val: unknown): unknown {
  if (val !== null && typeof val === "object" && !Array.isArray(val)) {
    return plainToOrdered(val);
  }
  return val;
}
