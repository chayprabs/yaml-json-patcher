import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse, query } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, "fixtures");

function load(name: string): string {
  return readFileSync(join(fixtures, name), "utf8");
}

describe("F2 query engines", () => {
  const k8s = parse(load("k8s-deployment.yaml"), "yaml");
  const expr = ".spec.template.spec.containers[].image";
  const jsonPathExpr = "$.spec.template.spec.containers[*].image";
  const jmesExpr = "spec.template.spec.containers[*].image";

  it("jq returns container images", async () => {
    const result = await query(k8s, "jq", expr);
    expect(result.ok).toBe(true);
    expect(result.value).toEqual(["nginx:1.25", "busybox:1.36"]);
  }, 30000);

  it("JSONPath returns equivalent array", () => {
    const result = query(k8s, "jsonpath", jsonPathExpr);
    return result.then((r) => {
      expect(r.ok).toBe(true);
      expect(r.value).toEqual(["nginx:1.25", "busybox:1.36"]);
    });
  });

  it("JMESPath returns equivalent array", () => {
    const result = query(k8s, "jmespath", jmesExpr);
    return result.then((r) => {
      expect(r.ok).toBe(true);
      expect(r.value).toEqual(["nginx:1.25", "busybox:1.36"]);
    });
  });

  it("yq-style returns same set", async () => {
    const result = await query(k8s, "yq", expr);
    expect(result.ok).toBe(true);
    expect(result.value).toEqual(["nginx:1.25", "busybox:1.36"]);
  }, 30000);
});
