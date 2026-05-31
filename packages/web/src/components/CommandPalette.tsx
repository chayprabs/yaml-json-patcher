import { useEffect } from "react";
import { useAppStore, type Mode } from "../store";
import type { Engine } from "@configshape/yaml-json-patcher";

const MODES: { id: Mode; label: string }[] = [
  { id: "query", label: "Query" },
  { id: "patch", label: "Patch" },
  { id: "merge", label: "Merge" },
  { id: "validate", label: "Validate" },
  { id: "diff", label: "Diff" },
];

const ENGINES: Engine[] = ["jq", "jsonpath", "jmespath", "yq"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const store = useAppStore();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-sm font-medium text-slate-800">Command palette</p>
        <p className="mb-2 text-xs text-slate-500">Mode</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className="rounded-md bg-slate-100 px-3 py-1 text-sm hover:bg-blue-600 hover:text-white"
              onClick={() => {
                store.setMode(m.id);
                onClose();
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mb-2 text-xs text-slate-500">Engine (query mode)</p>
        <div className="flex flex-wrap gap-2">
          {ENGINES.map((e) => (
            <button
              key={e}
              type="button"
              className="rounded-md bg-slate-100 px-3 py-1 text-sm capitalize hover:bg-blue-600 hover:text-white"
              onClick={() => {
                store.setMode("query");
                store.setEngine(e);
                onClose();
              }}
            >
              {e}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">Esc to close · Ctrl+K to open</p>
      </div>
    </div>
  );
}
