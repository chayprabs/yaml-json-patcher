export type Format = "json" | "yaml" | "toml" | "xml";
export type Engine = "jq" | "jsonpath" | "jmespath" | "yq";
export type MergeStrategy =
  | "deep"
  | "shallow"
  | "list-append"
  | "list-replace"
  | "last-write-wins";

export interface Doc {
  format: Format;
  /** Format-specific AST preserving comments, order, anchors */
  ast: unknown;
  /** JSON projection for query engines */
  json: unknown;
}

export interface ParseError {
  line: number;
  column: number;
  message: string;
}

export interface QueryResult {
  ok: boolean;
  value?: unknown;
  errors?: ParseError[];
}

export interface MergeConflict {
  path: string;
  values: unknown[];
  pickedIndex: number;
}

export interface MergeResult {
  ok: boolean;
  merged?: Doc;
  conflicts: MergeConflict[];
}

export interface JsonPatchOperation {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  path: string;
  value?: unknown;
  from?: string;
}
