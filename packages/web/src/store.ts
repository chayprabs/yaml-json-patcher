import type { Engine, Format, MergeConflict, MergeStrategy } from "@configshape/yaml-json-patcher";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Mode = "query" | "patch" | "merge" | "validate" | "diff";

export interface AppState {
  mode: Mode;
  engine: Engine;
  format: Format | "auto";
  source: string;
  mergeSources: string[];
  expression: string;
  patchText: string;
  schemaText: string;
  diffAfter: string;
  mergeStrategy: MergeStrategy;
  conflicts: MergeConflict[];
  output: string;
  logs: string[];
  setMode: (mode: Mode) => void;
  setEngine: (engine: Engine) => void;
  setFormat: (format: Format | "auto") => void;
  setSource: (source: string) => void;
  setMergeSources: (sources: string[]) => void;
  setExpression: (expr: string) => void;
  setPatchText: (text: string) => void;
  setSchemaText: (text: string) => void;
  setDiffAfter: (text: string) => void;
  setMergeStrategy: (strategy: MergeStrategy) => void;
  setConflicts: (conflicts: MergeConflict[]) => void;
  setOutput: (output: string) => void;
  addLog: (msg: string) => void;
  clearLogs: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode: "query",
      engine: (localStorage.getItem("configshape-engine") as Engine) ?? "jq",
      format: "auto",
      source: "",
      mergeSources: ["", ""],
      expression: "",
      patchText: "[]",
      schemaText: "{}",
      diffAfter: "",
      mergeStrategy: "deep",
      conflicts: [],
      output: "",
      logs: [],
      setMode: (mode) => set({ mode }),
      setEngine: (engine) => {
        localStorage.setItem("configshape-engine", engine);
        set({ engine });
      },
      setFormat: (format) => set({ format }),
      setSource: (source) => set({ source }),
      setMergeSources: (mergeSources) => set({ mergeSources }),
      setExpression: (expression) => set({ expression }),
      setPatchText: (patchText) => set({ patchText }),
      setSchemaText: (schemaText) => set({ schemaText }),
      setDiffAfter: (diffAfter) => set({ diffAfter }),
      setMergeStrategy: (mergeStrategy) => set({ mergeStrategy }),
      setConflicts: (conflicts) => set({ conflicts }),
      setOutput: (output) => set({ output }),
      addLog: (msg) => set((s) => ({ logs: [...s.logs.slice(-50), msg] })),
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: "configshape-session",
      partialize: (s) => ({
        source: s.source,
        expression: s.expression,
        patchText: s.patchText,
        mode: s.mode,
        engine: s.engine,
      }),
    },
  ),
);
