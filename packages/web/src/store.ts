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
  resetAll: () => void;
}

const defaultState = {
  mode: "query" as Mode,
  engine: "jq" as Engine,
  format: "auto" as Format | "auto",
  source: "",
  mergeSources: ["", ""],
  expression: "",
  patchText: "[]",
  schemaText: "{}",
  diffAfter: "",
  mergeStrategy: "deep" as MergeStrategy,
  conflicts: [] as MergeConflict[],
  output: "",
  logs: [] as string[],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultState,
      setMode: (mode) =>
        set((s) => {
          if (mode === "merge") {
            const mergeSources = [...s.mergeSources];
            if (s.source.trim() && !mergeSources[0]?.trim()) {
              mergeSources[0] = s.source;
            }
            return { mode, mergeSources, conflicts: [] };
          }
          return { mode, conflicts: mode === s.mode ? s.conflicts : [] };
        }),
      setEngine: (engine) => set({ engine }),
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
      resetAll: () => set({ ...defaultState, logs: [] }),
    }),
    {
      name: "configshape-session",
      partialize: (s) => ({
        source: s.source,
        expression: s.expression,
        patchText: s.patchText,
        schemaText: s.schemaText,
        diffAfter: s.diffAfter,
        mergeSources: s.mergeSources,
        mergeStrategy: s.mergeStrategy,
        format: s.format,
        mode: s.mode,
        engine: s.engine,
      }),
    },
  ),
);
