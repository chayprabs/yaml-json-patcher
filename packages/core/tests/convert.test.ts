import { describe, expect, it } from "vitest";
import { parse, serializeTo } from "../src/index.js";

describe("serializeTo", () => {
  it("converts JSON to YAML", () => {
    const doc = parse('{"hello":"world","n":1}', "json");
    const yaml = serializeTo(doc, "yaml");
    expect(yaml).toContain("hello: world");
    expect(yaml).toContain("n: 1");
  });

  it("converts YAML to JSON", () => {
    const doc = parse("key: value\n", "yaml");
    const json = serializeTo(doc, "json");
    expect(json).toContain('"key"');
    expect(json).toContain("value");
  });
});
