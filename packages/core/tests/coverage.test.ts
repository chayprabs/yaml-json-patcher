import { describe, expect, it } from "vitest";
import {
  applyPatchDocument,
  detectFormat,
  normalizeFormat,
  parse,
  query,
  serialize,
  serializeTo,
  sideBySideDiff,
  unifiedDiff,
  validateSyntax,
  validateWithSchema,
} from "../src/index.js";
import { resetAjvCache } from "../src/validate.js";
import { updateYamlJson, validateYaml } from "../src/formats/yaml.js";
import { updateTomlAst } from "../src/formats/toml.js";
import { updateXmlAst, validateXml } from "../src/formats/xml.js";
import { updateJsonAst } from "../src/formats/json.js";

describe("detectFormat and normalizeFormat", () => {
  it("treats empty input as json", () => {
    expect(detectFormat("   ")).toBe("json");
  });

  it("distinguishes JSON array from TOML table header", () => {
    expect(detectFormat("[1, 2, 3]")).toBe("json");
    expect(detectFormat("[project]\nname = 'x'\n")).toBe("toml");
  });

  it("detects TOML key=value lines", () => {
    expect(detectFormat('name = "app"\n')).toBe("toml");
  });

  it("normalizes known formats and rejects unknown", () => {
    expect(normalizeFormat("YAML")).toBe("yaml");
    expect(normalizeFormat("unknown")).toBeUndefined();
  });
});

describe("diff utilities", () => {
  it("builds unified diff hunks for line changes", () => {
    const diff = unifiedDiff("line1\nline2\nline3", "line1\nchanged\nline3", "cfg");
    expect(diff).toContain("--- a/cfg");
    expect(diff).toContain("-line2");
    expect(diff).toContain("+changed");
  });

  it("handles insert-only and delete-only hunks", () => {
    const insert = unifiedDiff("a", "a\nb", "x");
    expect(insert).toMatch(/\+/);
    const del = unifiedDiff("a\nb", "a", "x");
    expect(del).toMatch(/-/);
  });

  it("sideBySideDiff marks changed rows", () => {
    const rows = sideBySideDiff("keep\nold", "keep\nnew");
    expect(rows.some((r) => r.changed)).toBe(true);
    expect(rows.some((r) => !r.changed)).toBe(true);
  });
});

describe("format validation and serializers", () => {
  it("reports YAML bracket and syntax errors", () => {
    expect(validateYaml("key: [\n").length).toBeGreaterThan(0);
    expect(validateSyntax("bad: [unclosed", "yaml").length).toBeGreaterThan(0);
  });

  it("reports TOML syntax errors", () => {
    const errs = validateSyntax("[broken\n", "toml");
    expect(errs.length).toBeGreaterThan(0);
  });

  it("reports XML validation errors", () => {
    expect(validateXml("<root><unclosed></root>").length).toBeGreaterThan(0);
    expect(validateSyntax("not xml at all <", "xml").length).toBeGreaterThan(0);
  });

  it("reports JSON errors with line/column when possible", () => {
    const errs = validateSyntax('{"a":}', "json");
    expect(errs[0]?.message).toBeTruthy();
  });

  it("serializes JSON from modified ast when source diverges", () => {
    const doc = parse('{"a":1}', "json");
    const ast = updateJsonAst(doc.ast as import("../src/formats/json.js").JsonAst, { a: 2 });
    const out = serialize({ ...doc, ast });
    expect(out).toContain('"a": 2');
  });

  it("serializes TOML via stringify when value changed", () => {
    const doc = parse('title = "old"\n', "toml");
    const ast = updateTomlAst(doc.ast as import("../src/formats/toml.js").TomlAst, {
      title: "new",
    });
    const out = serialize({ ...doc, ast });
    expect(out).toContain('title = "new"');
  });

  it("rebuilds XML when source empty", () => {
    const doc = parse("<root><item>x</item></root>", "xml");
    const ast = updateXmlAst(
      { kind: "xml", source: "", value: doc.ast },
      { root: { item: "y" } },
    );
    const out = serialize({ ...doc, ast });
    expect(out).toContain("item");
  });

  it("updates multi-document YAML", () => {
    const doc = parse("---\na: 1\n---\nb: 2\n", "yaml");
    const ast = updateYamlJson(doc.ast as import("../src/formats/yaml.js").YamlAst, [
      { a: 9 },
      { b: 8 },
    ]);
    const out = serialize({ ...doc, ast });
    expect(out).toContain("a: 9");
    expect(out).toContain("b: 8");
  });
});

describe("serializeTo cross-format", () => {
  const jsonDoc = parse('{"k":"v","n":1}', "json");

  it("converts JSON to all target formats", () => {
    expect(serializeTo(jsonDoc, "yaml")).toContain("k:");
    expect(serializeTo(jsonDoc, "toml")).toContain("k");
    expect(serializeTo(jsonDoc, "xml")).toContain("root");
  });

  it("round-trips same-format via ast serializers", () => {
    const yamlDoc = parse("list:\n  - one\n  - two\n", "yaml");
    expect(serializeTo(yamlDoc, "yaml")).toContain("list:");
    const tomlDoc = parse('x = 1\n', "toml");
    expect(serializeTo(tomlDoc, "toml")).toContain("x");
    const xmlDoc = parse("<r><t/></r>", "xml");
    expect(serializeTo(xmlDoc, "xml")).toContain("<");
  });
});

describe("query error paths", () => {
  it("returns document for empty expression", async () => {
    const doc = parse('{"x":1}', "json");
    const r = await query(doc, "jq", "  ");
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ x: 1 });
  });

  it("rejects invalid JSONPath prefix", async () => {
    const doc = parse('{"x":1}', "json");
    const r = await query(doc, "jsonpath", "x");
    expect(r.ok).toBe(false);
    expect(r.errors?.[0]?.message).toContain("$");
  });

  it("rejects JSONPath that throws at runtime", async () => {
    const doc = parse('{"a":1}', "json");
    const r = await query(doc, "jsonpath", "$..[[");
    expect(r.ok).toBe(false);
  });
});

describe("patch and schema", () => {
  it("throws on null patch", () => {
    const doc = parse("{}", "json");
    expect(() => applyPatchDocument(doc, null)).toThrow();
  });

  it("validates with schema and reports failures", () => {
    const doc = parse('{"name":"x","age":1}', "json");
    const ok = validateWithSchema(
      doc,
      JSON.stringify({
        type: "object",
        required: ["name"],
        properties: { name: { type: "string" }, age: { type: "number" } },
      }),
    );
    expect(ok.ok).toBe(true);

    const bad = validateWithSchema(
      doc,
      JSON.stringify({
        type: "object",
        properties: { age: { type: "string" } },
      }),
    );
    expect(bad.ok).toBe(false);
    expect(bad.errors.length).toBeGreaterThan(0);
  });

  it("handles invalid schema JSON", () => {
    const doc = parse("{}", "json");
    const r = validateWithSchema(doc, "not json");
    expect(r.ok).toBe(false);
  });

  it("resetAjvCache allows re-init", () => {
    resetAjvCache();
    const doc = parse("{}", "json");
    expect(validateWithSchema(doc, '{"type":"object"}').ok).toBe(true);
  });
});
