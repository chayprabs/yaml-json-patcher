import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { Doc, ParseError } from "./types.js";

let ajvInstance: Ajv2020 | null = null;

function getAjv(): Ajv2020 {
  if (!ajvInstance) {
    ajvInstance = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

export interface SchemaValidationResult {
  ok: boolean;
  errors: ParseError[];
}

export function validateWithSchema(doc: Doc, schemaText: string): SchemaValidationResult {
  try {
    const schema = JSON.parse(schemaText) as object;
    const ajv = getAjv();
    const validate = ajv.compile(schema);
    const valid = validate(doc.json);
    if (valid) {
      return { ok: true, errors: [] };
    }
    const errors: ParseError[] = (validate.errors ?? []).map((e) => ({
      line: 1,
      column: 1,
      message: `${e.instancePath || "/"} ${e.message ?? "validation error"}`,
    }));
    return { ok: false, errors };
  } catch (err) {
    return {
      ok: false,
      errors: [{ line: 1, column: 1, message: err instanceof Error ? err.message : String(err) }],
    };
  }
}

export function resetAjvCache(): void {
  ajvInstance = null;
}
