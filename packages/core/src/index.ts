export type {
  Doc,
  Engine,
  Format,
  JsonPatchOperation,
  MergeConflict,
  MergeResult,
  MergeStrategy,
  ParseError,
  QueryResult,
} from "./types.js";

export { parse, serialize, validateSyntax, roundTrip, detectFormat, normalizeFormat } from "./parse.js";
export { query } from "./query.js";
export {
  applyJsonPatch,
  applyMergePatch,
  generatePatch,
  mergeDocs,
  applyConflictResolution,
} from "./patch.js";
