import { useCallback, useEffect, useRef } from "react";
import {
  applyPatchDocument,
  detectFormat,
  generatePatch,
  mergeDocs,
  parse,
  query,
  serialize,
  serializeTo,
  validateSyntax,
  validateWithSchema,
  type Format,
  type MergeConflict,
} from "@configshape/yaml-json-patcher";
import { useAppStore } from "../store";

const DEBOUNCE_MS = 150;
const WARN_BYTES = 10 * 1024 * 1024;
const MAX_BYTES = 50 * 1024 * 1024;

function inputBytes(...parts: string[]): number {
  return new TextEncoder().encode(parts.join("")).length;
}

function formatQueryOutput(value: unknown): string {
  if (value === undefined) return "null";
  return JSON.stringify(value, null, 2);
}

export function useEvaluate() {
  const state = useAppStore();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(async () => {
    const {
      source,
      mode,
      engine,
      format,
      expression,
      patchText,
      schemaText,
      diffAfter,
      mergeSources,
      mergeStrategy,
      setOutput,
      setConflicts,
      addLog,
      clearLogs,
    } = useAppStore.getState();

    clearLogs();

    const bytes =
      mode === "merge"
        ? Math.max(...mergeSources.map((s) => inputBytes(s)), inputBytes(source))
        : inputBytes(source);
    if (bytes > MAX_BYTES) {
      addLog(`Input exceeds 50 MB limit (${(bytes / 1024 / 1024).toFixed(1)} MB).`);
      setOutput("");
      return;
    }
    if (bytes > WARN_BYTES) {
      addLog(`Large input (${(bytes / 1024 / 1024).toFixed(1)} MB) — processing may be slow.`);
    }

    if (!source.trim() && mode !== "merge") {
      setOutput("");
      return;
    }

    try {
      const fmt = format === "auto" ? detectFormat(source) : (format as Format);

      if (mode === "query") {
        const path = window.location.pathname;
        if (path === "/json-to-yaml" && source.trim()) {
          const doc = parse(source, fmt);
          setOutput(serializeTo(doc, "yaml"));
          return;
        }
        if (path === "/yaml-to-json" && source.trim()) {
          const inputFmt = format === "auto" ? detectFormat(source) : fmt;
          const doc = parse(source, inputFmt === "yaml" ? "yaml" : inputFmt);
          setOutput(serializeTo(doc, "json"));
          return;
        }
        const doc = parse(source, fmt);
        const result = await query(doc, engine, expression);
        if (!result.ok) {
          addLog(result.errors?.[0]?.message ?? "Query failed");
          setOutput("");
          return;
        }
        if (result.value === null && expression.trim()) {
          addLog("Query returned no matches");
        }
        setOutput(formatQueryOutput(result.value));
        return;
      }

      if (mode === "patch") {
        const doc = parse(source, fmt);
        const patch = JSON.parse(patchText) as unknown;
        const patched = applyPatchDocument(doc, patch);
        setOutput(serialize(patched));
        return;
      }

      if (mode === "merge") {
        const docs = mergeSources.filter((s) => s.trim()).map((s) => parse(s, detectFormat(s)));
        if (docs.length < 2) {
          addLog("Merge requires at least two inputs");
          setOutput("");
          setConflicts([]);
          return;
        }
        const result = mergeDocs(docs, mergeStrategy);
        if (result.merged) {
          useAppStore.getState().setConflicts(result.conflicts);
          setOutput(serialize(result.merged));
          if (result.conflicts.length) {
            addLog(
              `${result.conflicts.length} conflict(s): ${result.conflicts.map((c: MergeConflict) => c.path).join(", ")}`,
            );
          }
        }
        return;
      }

      if (mode === "validate") {
        const syntaxErrors = validateSyntax(source, fmt);
        let doc;
        try {
          doc = parse(source, fmt);
        } catch {
          setOutput(syntaxErrors.map((e) => `L${e.line}:${e.column} ${e.message}`).join("\n") || "Invalid document");
          syntaxErrors.forEach((e) => addLog(e.message));
          return;
        }
        const schemaResult = validateWithSchema(doc, schemaText);
        const all = [...syntaxErrors, ...schemaResult.errors];
        if (all.length === 0) {
          setOutput("✓ Valid");
        } else {
          setOutput(all.map((e) => `L${e.line}:${e.column} ${e.message}`).join("\n"));
          all.forEach((e) => addLog(e.message));
        }
        return;
      }

      if (mode === "diff") {
        if (!diffAfter.trim()) {
          addLog('Paste an "after" document to generate a patch');
          setOutput("");
          return;
        }
        const beforeDoc = parse(source, fmt);
        const afterFmt = format === "auto" ? detectFormat(diffAfter) : fmt;
        const afterDoc = parse(diffAfter, afterFmt);
        const patch = generatePatch(beforeDoc, afterDoc);
        setOutput(JSON.stringify(patch, null, 2));
        return;
      }

      setOutput("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(msg);
      setOutput("");
    }
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void run(), DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [
    state.source,
    state.mode,
    state.engine,
    state.format,
    state.expression,
    state.patchText,
    state.schemaText,
    state.diffAfter,
    state.mergeSources,
    state.mergeStrategy,
    run,
  ]);

  return { run };
}
