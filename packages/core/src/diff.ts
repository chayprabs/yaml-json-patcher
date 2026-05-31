/** Unified diff between two serialized documents (line-based LCS) */
export function unifiedDiff(before: string, after: string, label = "config"): string {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const ops = diffLines(beforeLines, afterLines);
  const hunks: string[] = [`--- a/${label}`, `+++ b/${label}`];
  let i = 0;
  while (i < ops.length) {
    if (ops[i]!.type === "equal") {
      i++;
      continue;
    }
    const start = i;
    const chunk: typeof ops = [];
    while (i < ops.length && ops[i]!.type !== "equal") {
      chunk.push(ops[i]!);
      i++;
    }
    const oldCount = chunk.filter((c) => c.type === "remove").length;
    const newCount = chunk.filter((c) => c.type === "add").length;
    const linesBeforeOld = countLinesBefore(ops, start, "before");
    const linesBeforeNew = countLinesBefore(ops, start, "after");
    const oldStartLine =
      oldCount === 0
        ? Math.max(linesBeforeOld, 1)
        : (chunk.find((c) => c.type === "remove")!.oldIndex ?? 0) + 1;
    const newStartLine =
      newCount === 0
        ? Math.max(linesBeforeNew, 1)
        : (chunk.find((c) => c.type === "add")!.newIndex ?? 0) + 1;
    hunks.push(`@@ -${oldStartLine},${oldCount} +${newStartLine},${newCount} @@`);
    for (const c of chunk) {
      if (c.type === "remove") hunks.push(`-${c.line}`);
      if (c.type === "add") hunks.push(`+${c.line}`);
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
  const ops = diffLines(beforeLines, afterLines);
  const rows: { line: number; before: string; after: string; changed: boolean }[] = [];
  let lineNo = 1;
  for (const op of ops) {
    if (op.type === "equal") {
      rows.push({ line: lineNo++, before: op.line, after: op.line, changed: false });
    } else if (op.type === "remove") {
      rows.push({ line: lineNo++, before: op.line, after: "", changed: true });
    } else {
      rows.push({ line: lineNo++, before: "", after: op.line, changed: true });
    }
  }
  return rows;
}

type DiffOp =
  | { type: "equal"; line: string }
  | { type: "remove"; line: string; oldIndex: number }
  | { type: "add"; line: string; newIndex: number };

function countLinesBefore(ops: DiffOp[], index: number, side: "before" | "after"): number {
  let beforeLines = 0;
  let afterLines = 0;
  for (let k = 0; k < index; k++) {
    const op = ops[k]!;
    if (op.type === "equal") {
      beforeLines++;
      afterLines++;
    } else if (op.type === "remove") {
      beforeLines++;
    } else {
      afterLines++;
    }
  }
  return side === "before" ? beforeLines : afterLines;
}

function diffLines(before: string[], after: string[]): DiffOp[] {
  const n = before.length;
  const m = after.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] =
        before[i] === after[j]
          ? dp[i + 1]![j + 1]! + 1
          : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (before[i] === after[j]) {
      ops.push({ type: "equal", line: before[i]! });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      ops.push({ type: "remove", line: before[i]!, oldIndex: i });
      i++;
    } else {
      ops.push({ type: "add", line: after[j]!, newIndex: j });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: "remove", line: before[i]!, oldIndex: i });
    i++;
  }
  while (j < m) {
    ops.push({ type: "add", line: after[j]!, newIndex: j });
    j++;
  }
  return ops;
}
