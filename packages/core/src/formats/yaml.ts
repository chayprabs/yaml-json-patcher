import { parseDocument, parseAllDocuments, Document } from "yaml";
import type { ParseError } from "../types.js";

export interface YamlAst {
  kind: "yaml";
  source: string;
  documents: Document[];
}

const PARSE_OPTS = { keepSourceTokens: true, strict: true } as const;

export function parseYaml(input: string): { ast: YamlAst; json: unknown } {
  const documents = parseAllDocuments(input, PARSE_OPTS);
  const json =
    documents.length === 1
      ? documents[0]!.toJSON()
      : documents.map((d) => d.toJSON());

  return {
    ast: { kind: "yaml", source: input, documents },
    json,
  };
}

export function serializeYaml(ast: YamlAst): string {
  // Preserve original source when available for lossless round-trip
  if (ast.source.trim()) {
    const roundTrip = ast.documents.map((d) => d.toString()).join("---\n");
    const normalized = ast.source.trimEnd();
    const serialized = roundTrip.trimEnd();
    if (normalized === serialized || ast.source === roundTrip) {
      return ast.source.endsWith("\n") ? ast.source : ast.source + "\n";
    }
  }
  const out = ast.documents.map((d) => d.toString()).join("---\n");
  return out.endsWith("\n") ? out : out + "\n";
}

export function validateYaml(input: string): ParseError[] {
  const bracketErr = findUnclosedBracketError(input);
  if (bracketErr) return [bracketErr];
  try {
    const docs = parseAllDocuments(input, PARSE_OPTS);
    for (const doc of docs) {
      if (doc.errors.length > 0) {
        return doc.errors.map((e) => yamlErrorToParseError(e));
      }
    }
    return [];
  } catch (err) {
    return [yamlErrorToParseError(err)];
  }
}

function findUnclosedBracketError(input: string): ParseError | null {
  const open = (input.match(/\[/g) ?? []).length;
  const close = (input.match(/\]/g) ?? []).length;
  if (open > close) {
    const line = input.slice(0, input.indexOf("[")).split("\n").length;
    return { line, column: 1, message: "Unclosed [ bracket in YAML" };
  }
  return null;
}

function yamlErrorToParseError(err: unknown): ParseError {
  const e = err as { linePos?: [{ line: number; col: number }]; message?: string };
  if (e.linePos?.[0]) {
    return {
      line: e.linePos[0].line + 1,
      column: e.linePos[0].col + 1,
      message: e.message ?? "YAML parse error",
    };
  }
  return { line: 1, column: 1, message: err instanceof Error ? err.message : String(err) };
}

export function updateYamlJson(ast: YamlAst, json: unknown): YamlAst {
  if (ast.documents.length === 1 && !Array.isArray(json)) {
    const doc = ast.documents[0]!;
    doc.contents = doc.createNode(json);
    return {
      kind: "yaml",
      source: doc.toString(),
      documents: [doc],
    };
  }
  const items = Array.isArray(json) ? json : [json];
  const documents = items.map((item, i) => {
    const doc = ast.documents[i] ?? new Document();
    doc.contents = doc.createNode(item);
    return doc;
  });
  const source = documents.map((d) => d.toString()).join("---\n") + "\n";
  return { kind: "yaml", source, documents };
}

export { Document };
