/** Unified diff between two serialized documents */
export function unifiedDiff(before: string, after: string, label = "config"): string {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const hunks: string[] = [`--- a/${label}`, `+++ b/${label}`];
  const maxLen = Math.max(beforeLines.length, afterLines.length);
  let i = 0;
  while (i < maxLen) {
    const b = beforeLines[i] ?? "";
    const a = afterLines[i] ?? "";
    if (b !== a) {
      const start = i;
      while (i < maxLen && (beforeLines[i] ?? "") !== (afterLines[i] ?? "")) i++;
      hunks.push(`@@ -${start + 1},${i - start} +${start + 1},${i - start} @@`);
      for (let j = start; j < i; j++) {
        if (beforeLines[j] !== undefined) hunks.push(`-${beforeLines[j]}`);
        if (afterLines[j] !== undefined) hunks.push(`+${afterLines[j]}`);
      }
    } else {
      i++;
    }
  }
  return hunks.join("\n");
}

export function sideBySideDiff(
  before: string,
  after: string,
): { line: number; before: string; after: string; changed: boolean }[] {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const maxLen = Math.max(beforeLines.length, afterLines.length);
  const rows: { line: number; before: string; after: string; changed: boolean }[] = [];
  for (let i = 0; i < maxLen; i++) {
    const b = beforeLines[i] ?? "";
    const a = afterLines[i] ?? "";
    rows.push({ line: i + 1, before: b, after: a, changed: b !== a });
  }
  return rows;
}
