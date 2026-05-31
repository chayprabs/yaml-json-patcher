import { useState } from "react";
import { unifiedDiff, sideBySideDiff } from "@configshape/yaml-json-patcher";

type DiffRow = ReturnType<typeof sideBySideDiff>[number];
import { cn } from "../lib/utils";

interface Props {
  before: string;
  after: string;
}

export function DiffViewer({ before, after }: Props) {
  const [mode, setMode] = useState<"unified" | "side">("unified");
  const unified = unifiedDiff(before, after);
  const side = sideBySideDiff(before, after);

  const copyDiff = () => void navigator.clipboard.writeText(unified);
  const downloadPatch = () => {
    const blob = new Blob([unified], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "changes.patch";
    a.click();
  };

  return (
    <div className="flex flex-col border-t border-[var(--border)]">
      <div className="flex gap-2 px-2 py-1">
        <button type="button" className={cn("rounded px-2 py-0.5 text-xs", mode === "unified" && "bg-[var(--accent)] text-white")} onClick={() => setMode("unified")}>Unified</button>
        <button type="button" className={cn("rounded px-2 py-0.5 text-xs", mode === "side" && "bg-[var(--accent)] text-white")} onClick={() => setMode("side")}>Side-by-side</button>
        <button type="button" className="rounded px-2 py-0.5 text-xs" onClick={copyDiff}>Copy as diff</button>
        <button type="button" className="rounded px-2 py-0.5 text-xs" onClick={downloadPatch}>Download .patch</button>
      </div>
      {mode === "unified" ? (
        <pre className="max-h-48 overflow-auto p-2 font-mono text-xs">{unified}</pre>
      ) : (
        <div className="grid max-h-48 grid-cols-2 overflow-auto font-mono text-xs">
          {side.map((row: DiffRow) => (
            <div key={row.line} className={cn("contents", row.changed && "bg-yellow-500/10")}>
              <span className="border-r border-[var(--border)] px-2 py-0.5">{row.before}</span>
              <span className="px-2 py-0.5">{row.after}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
