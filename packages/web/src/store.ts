import type { Engine, Format, MergeStrategy } from "@configshape/yaml-json-patcher";
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
  mergeStrategy: MergeStrategy;
  output: string;
  logs: string[];
  theme: "light" | "dark";
  setMode: (mode: Mode) => void;
  setEngine: (engine: Engine) => void;
  setFormat: (format: Format | "auto") => void;
  setSource: (source: string) => void;
  setMergeSources: (sources: string[]) => void;
  setExpression: (expr: string) => void;
  setPatchText: (text: string) => void;
  setSchemaText: (text: string) => void;
  setMergeStrategy: (strategy: MergeStrategy) => void;
  setOutput: (output: string) => void;
  addLog: (msg: string) => void;
  clearLogs: () => void;
  toggleTheme: () => void;
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
      mergeStrategy: "deep",
      output: "",
      logs: [],
      theme: "dark",
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
      setMergeStrategy: (mergeStrategy) => set({ mergeStrategy }),
      setOutput: (output) => set({ output }),
      addLog: (msg) => set((s) => ({ logs: [...s.logs.slice(-50), msg] })),
      clearLogs: () => set({ logs: [] }),
      toggleTheme: () =>
        set((s) => {
          const theme = s.theme === "dark" ? "light" : "dark";
          document.documentElement.classList.toggle("dark", theme === "dark");
          return { theme };
        }),
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
