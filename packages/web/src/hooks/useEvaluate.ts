import { useCallback, useEffect, useRef } from "react";
import {
  applyJsonPatch,
  applyMergePatch,
  detectFormat,
  generatePatch,
  mergeDocs,
  parse,
  query,
  serialize,
  validateSyntax,
  validateWithSchema,
  type Format,
  type MergeConflict,
} from "@configshape/yaml-json-patcher";
import { useAppStore } from "../store";

const DEBOUNCE_MS = 150;

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
      addLog,
      clearLogs,
    } = useAppStore.getState();

    clearLogs();
    if (!source.trim() && mode !== "merge") {
      setOutput("");
      return;
    }

    try {
      const fmt = format === "auto" ? detectFormat(source) : (format as Format);

      if (mode === "query") {
        const doc = parse(source, fmt);
        const result = await query(doc, engine, expression);
        if (!result.ok) {
          addLog(result.errors?.[0]?.message ?? "Query failed");
          setOutput("");
          return;
        }
        setOutput(JSON.stringify(result.value, null, 2));
        return;
      }

      if (mode === "patch") {
        const doc = parse(source, fmt);
        const patch = JSON.parse(patchText);
        const patched = Array.isArray(patch)
          ? applyJsonPatch(doc, patch)
          : applyMergePatch(doc, patch);
        setOutput(serialize(patched));
        return;
      }

      if (mode === "merge") {
        const docs = mergeSources.filter((s) => s.trim()).map((s) => parse(s, detectFormat(s)));
        if (docs.length < 2) {
          addLog("Merge requires at least two inputs");
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
        const doc = parse(source, fmt);
        const syntaxErrors = validateSyntax(source, fmt);
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
          addLog("Paste an “after” document to generate a patch");
          return;
        }
        const beforeDoc = parse(source, fmt);
        const afterDoc = parse(diffAfter, detectFormat(diffAfter));
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
