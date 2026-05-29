import TOML from "@iarna/toml";
import type { ParseError } from "../types.js";

export interface TomlAst {
  kind: "toml";
  source: string;
  value: TOML.JsonMap;
}

export function parseToml(input: string): { ast: TomlAst; json: unknown } {
  const value = TOML.parse(input) as TOML.JsonMap;
  return {
    ast: { kind: "toml", source: input, value },
    json: value,
  };
}

export function serializeToml(ast: TomlAst): string {
  if (ast.source.trim()) {
    try {
      const reparsed = TOML.parse(ast.source) as TOML.JsonMap;
      if (JSON.stringify(reparsed) === JSON.stringify(ast.value)) {
        return ast.source.endsWith("\n") ? ast.source : ast.source + "\n";
      }
    } catch {
      // fall through
    }
  }
  const out = TOML.stringify(ast.value);
  return out.endsWith("\n") ? out : out + "\n";
}

export function validateToml(input: string): ParseError[] {
  try {
    TOML.parse(input);
    return [];
  } catch (err) {
    const e = err as { line?: number; col?: number; message?: string };
    return [
      {
        line: e.line ?? 1,
        column: e.col ?? 1,
        message: e.message ?? "TOML parse error",
      },
    ];
  }
}

export function updateTomlAst(ast: TomlAst, value: TOML.JsonMap): TomlAst {
  return { kind: "toml", source: ast.source, value };
}
