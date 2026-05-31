import { applyConflictResolution, detectFormat, parse, serialize } from "@configshape/yaml-json-patcher";
import { useAppStore } from "../store";

export function ConflictResolver() {
  const conflicts = useAppStore((s) => s.conflicts);
  const source = useAppStore((s) => s.source);
  const mergeStrategy = useAppStore((s) => s.mergeStrategy);
  const setOutput = useAppStore((s) => s.setOutput);
  const setConflicts = useAppStore((s) => s.setConflicts);

  if (conflicts.length === 0) return null;

  const resolve = (path: string, choice: "base" | "incoming" | number) => {
    const output = useAppStore.getState().output;
    const fmt = output.trim() ? detectFormat(output) : detectFormat(source);
    const base = parse(output.trim() || source, fmt);
    const resolutions: Record<string, unknown> = {};
    const conflict = conflicts.find((c) => c.path === path);
    if (!conflict) return;
    if (choice === "base") resolutions[path] = conflict.values[0];
    else if (choice === "incoming") {
      resolutions[path] = conflict.values[conflict.pickedIndex] ?? conflict.values[conflict.values.length - 1];
    } else {
      resolutions[path] = conflict.values[choice] ?? conflict.values[conflict.pickedIndex];
    }
    const merged = applyConflictResolution(base, [conflict], resolutions);
    setOutput(serialize(merged));
    setConflicts(conflicts.filter((c) => c.path !== path));
  };

  return (
    <div className="border-t border-amber-200 bg-amber-50 px-4 py-3">
      <p className="mb-2 text-sm font-medium text-amber-900">Merge conflicts — pick a value per path</p>
      <ul className="space-y-2">
        {conflicts.map((c) => (
          <li key={c.path} className="rounded-lg border border-amber-200 bg-white p-3 text-sm">
            <code className="font-mono text-xs text-slate-800">{c.path}</code>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                onClick={() => resolve(c.path, "base")}
              >
                Use base
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                onClick={() => resolve(c.path, "incoming")}
              >
                Use incoming
              </button>
            </div>
            <pre className="mt-2 max-h-24 overflow-auto rounded bg-slate-50 p-2 font-mono text-xs">
              {JSON.stringify(c.values, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-amber-800">Strategy: {mergeStrategy}</p>
    </div>
  );
}
