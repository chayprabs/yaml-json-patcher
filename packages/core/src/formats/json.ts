import type { ParseError } from "./types.js";

export interface JsonAst {
  kind: "json";
  source: string;
  value: unknown;
}

export function parseJson(input: string): { ast: JsonAst; json: unknown } {
  const value = JSON.parse(input);
  return {
    ast: { kind: "json", source: input, value },
    json: value,
  };
}

export function serializeJson(ast: JsonAst): string {
  if (ast.source.trim()) {
    try {
      const reparsed = JSON.parse(ast.source);
      if (JSON.stringify(reparsed) === JSON.stringify(ast.value)) {
        return ast.source;
      }
    } catch {
      // fall through
    }
  }
  return JSON.stringify(ast.value, null, 2) + "\n";
}

export function validateJson(input: string): ParseError[] {
  try {
    JSON.parse(input);
    return [];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const match = message.match(/position (\d+)/i);
    if (match) {
      const pos = Number(match[1]);
      const before = input.slice(0, pos);
      const line = before.split("\n").length;
      const column = before.length - before.lastIndexOf("\n");
      return [{ line, column, message }];
    }
    return [{ line: 1, column: 1, message }];
  }
}

export function updateJsonAst(ast: JsonAst, value: unknown): JsonAst {
  return { kind: "json", source: ast.source, value };
}
