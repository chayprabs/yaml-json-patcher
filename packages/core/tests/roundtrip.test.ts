import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { detectFormat, parse, roundTrip, serialize } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "fixtures");

function load(name: string): string {
  return readFileSync(join(fixtures, name), "utf8");
}

describe("detectFormat", () => {
  it("detects JSON", () => {
    expect(detectFormat('{"a":1}')).toBe("json");
  });
  it("detects YAML", () => {
    expect(detectFormat("key: value\n")).toBe("yaml");
  });
  it("detects TOML", () => {
    expect(detectFormat('[project]\nname = "x"\n')).toBe("toml");
  });
  it("detects XML", () => {
    expect(detectFormat("<?xml version='1.0'?><root/>")).toBe("xml");
  });
});

describe("F1 round-trip", () => {
  it("JSON package.json round-trips byte-identical", () => {
    const input = load("package.json");
    expect(roundTrip(input, "json")).toBe(input);
  });

  it("YAML k8s-deployment preserves comments and structure", () => {
    const input = load("k8s-deployment.yaml");
    const output = roundTrip(input, "yaml");
    expect(output).toContain("# Kubernetes Deployment sample");
    expect(output).toContain("nginx:1.25");
    expect(output.trimEnd()).toBe(input.trimEnd());
  });

  it("YAML multi-doc splits and round-trips", () => {
    const input = load("multi-doc.yaml");
    const doc = parse(input, "yaml");
    expect(Array.isArray(doc.json)).toBe(true);
    expect((doc.json as unknown[]).length).toBe(2);
    const output = serialize(doc);
    expect(output).toContain("config-a");
    expect(output).toContain("config-b");
  });

  it("TOML pyproject.toml round-trips lossless", () => {
    const input = load("pyproject.toml");
    const output = roundTrip(input, "toml");
    expect(output.trimEnd()).toBe(input.trimEnd());
  });

  it("XML atom-feed round-trips with order preserved", () => {
    const input = load("atom-feed.xml");
    const output = roundTrip(input, "xml");
    expect(output.trimEnd()).toBe(input.trimEnd());
  });
});
