#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import {
  applyPatchDocument,
  detectFormat,
  parse,
  query,
  serialize,
  serializeTo,
} from "@configshape/yaml-json-patcher";

function usage(): never {
  console.error(`ConfigShape CLI

Usage:
  configshape query <file> --engine jq --expr '.path'
  configshape patch <file> --patch '<json>' [-o out.yaml]
  configshape convert <file> --to yaml|json|toml|xml [-o out]

Options:
  --engine   jq | jsonpath | jmespath | yq (default: jq)
  --expr     query expression
  --patch    JSON Patch array, single op, or merge patch object
  --to       output format for convert
  -o, --out  write result to file instead of stdout
`);
  process.exit(1);
  throw new Error("unreachable");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const cmd = args[0];
  if (!cmd || cmd === "--help" || cmd === "-h") usage();

  const file = args[1];
  if (!file) usage();

  const getFlag = (name: string): string | undefined => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const input = readFileSync(file, "utf8");
  const fmt = detectFormat(input);
  const doc = parse(input, fmt);
  const outPath = getFlag("-o") ?? getFlag("--out");

  const write = (text: string) => {
    if (outPath) writeFileSync(outPath, text);
    else process.stdout.write(text);
  };

  if (cmd === "query") {
    const engine = (getFlag("--engine") ?? "jq") as "jq" | "jsonpath" | "jmespath" | "yq";
    const expr = getFlag("--expr") ?? ".";
    const result = await query(doc, engine, expr);
    if (!result.ok) {
      console.error(result.errors?.[0]?.message ?? "Query failed");
      process.exit(1);
    }
    write(JSON.stringify(result.value, null, 2) + "\n");
    return;
  }

  if (cmd === "patch") {
    const patchRaw = getFlag("--patch");
    if (!patchRaw) usage();
    const patch = JSON.parse(patchRaw) as unknown;
    const patched = applyPatchDocument(doc, patch);
    write(serialize(patched));
    return;
  }

  if (cmd === "convert") {
    const to = getFlag("--to") as "json" | "yaml" | "toml" | "xml" | undefined;
    if (!to) usage();
    write(serializeTo(doc, to));
    return;
  }

  usage();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
