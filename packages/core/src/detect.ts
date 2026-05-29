import type { Format } from "./types.js";

export function detectFormat(input: string): Format {
  const trimmed = input.trim();
  if (!trimmed) return "json";

  if (trimmed.startsWith("{")) {
    return "json";
  }
  // TOML table headers like [project] vs JSON arrays
  if (trimmed.startsWith("[")) {
    if (/^\[[\w.-]+\]\s*(\n|$)/.test(trimmed)) {
      return "toml";
    }
    return "json";
  }
  if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) {
    return "xml";
  }
  if (/^\[[\w.-]+\]/.test(trimmed) || /^[\w.-]+\s*=/.test(trimmed)) {
    return "toml";
  }
  return "yaml";
}

export function normalizeFormat(format: string | undefined): Format | undefined {
  if (!format) return undefined;
  const lower = format.toLowerCase();
  if (lower === "json" || lower === "yaml" || lower === "toml" || lower === "xml") {
    return lower;
  }
  return undefined;
}
