import { lazy, Suspense, useEffect, useState } from "react";
import {
  Copy,
  Download,
  Github,
  Moon,
  Share2,
  Sun,
  Trash2,
} from "lucide-react";
import { detectFormat } from "@configshape/yaml-json-patcher";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { useEvaluate } from "./hooks/useEvaluate";
import { cn } from "./lib/utils";
import { useAppStore, type Mode } from "./store";
import { SamplePicker } from "./components/SamplePicker";

const MonacoEditor = lazy(() => import("./components/MonacoEditor"));

const MODES: { id: Mode; label: string }[] = [
  { id: "query", label: "Query" },
  { id: "patch", label: "Patch" },
  { id: "merge", label: "Merge" },
  { id: "validate", label: "Validate" },
  { id: "diff", label: "Diff" },
];

const ENGINES = ["jq", "jsonpath", "jmespath", "yq"] as const;
const FORMATS = ["auto", "json", "yaml", "toml", "xml"] as const;

export default function App() {
  const store = useAppStore();
  useEvaluate();
  const [showRestore, setShowRestore] = useState(false);
  const detected = store.source.trim() ? detectFormat(store.source) : "yaml";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", store.theme === "dark");
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const data = JSON.parse(decompressFromEncodedURIComponent(hash) ?? "{}");
        if (data.source) store.setSource(data.source);
        if (data.expression) store.setExpression(data.expression);
        if (data.mode) store.setMode(data.mode);
        if (data.engine) store.setEngine(data.engine);
      } catch {
        // ignore bad hash
      }
    } else {
      const saved = localStorage.getItem("configshape-session");
      if (saved && store.source) setShowRestore(true);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        localStorage.setItem("configshape-draft", store.source);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store.source]);

  const share = () => {
    const payload = compressToEncodedURIComponent(
      JSON.stringify({
        source: store.source,
        expression: store.expression,
        mode: store.mode,
        engine: store.engine,
      }),
    );
    window.location.hash = payload;
    void navigator.clipboard.writeText(window.location.href);
  };

  const clearAll = () => {
    localStorage.clear();
    store.setSource("");
    store.setOutput("");
    store.clearLogs();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3">
        <h1 className="text-lg font-semibold">ConfigShape</h1>
        <span className="text-sm text-[var(--muted)]">browser-only config playground</span>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/chayprabs/yaml-json-patcher"
            target="_blank"
            rel="noreferrer"
            className="rounded p-2 hover:bg-[var(--border)]"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <button type="button" onClick={share} className="rounded p-2 hover:bg-[var(--border)]" aria-label="Share">
            <Share2 size={18} />
          </button>
          <button type="button" onClick={store.toggleTheme} className="rounded p-2 hover:bg-[var(--border)]" aria-label="Toggle theme">
            {store.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" onClick={clearAll} className="rounded p-2 hover:bg-[var(--border)]" aria-label="Clear all data">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {showRestore && (
        <div className="border-b border-[var(--border)] bg-[var(--accent)]/10 px-4 py-2 text-sm">
          Restore last session?{" "}
          <button type="button" className="underline" onClick={() => setShowRestore(false)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] px-4 py-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => store.setMode(m.id)}
            className={cn(
              "rounded px-3 py-1 text-sm",
              store.mode === m.id ? "bg-[var(--accent)] text-white" : "bg-[var(--border)]",
            )}
          >
            {m.label}
          </button>
        ))}
        {store.mode === "query" &&
          ENGINES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => store.setEngine(e)}
              className={cn(
                "rounded px-3 py-1 text-sm capitalize",
                store.engine === e ? "bg-[var(--accent)] text-white" : "bg-[var(--border)]",
              )}
            >
              {e}
            </button>
          ))}
        {FORMATS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => store.setFormat(f)}
            className={cn(
              "rounded px-3 py-1 text-sm uppercase",
              store.format === f ? "bg-[var(--accent)] text-white" : "bg-[var(--border)]",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <main className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
        <section className="relative flex min-h-[40vh] flex-col border-r border-[var(--border)]">
          <div className="absolute right-2 top-2 z-10 rounded bg-[var(--accent)] px-2 py-0.5 text-xs uppercase text-white">
            {store.format === "auto" ? detected : store.format}
          </div>
          <Suspense fallback={<div className="p-4">Loading editor…</div>}>
            <MonacoEditor
              value={store.source}
              onChange={store.setSource}
              language={store.format === "auto" ? detected : store.format}
            />
          </Suspense>
        </section>

        <section className="flex min-h-[40vh] flex-col">
          {store.mode === "query" && (
            <input
              className="border-b border-[var(--border)] bg-[var(--panel)] px-3 py-2 font-mono text-sm outline-none"
              placeholder="Expression…"
              value={store.expression}
              onChange={(e) => store.setExpression(e.target.value)}
            />
          )}
          {store.mode === "patch" && (
            <textarea
              className="min-h-24 border-b border-[var(--border)] bg-[var(--panel)] px-3 py-2 font-mono text-sm outline-none"
              placeholder="JSON Patch or Merge Patch…"
              value={store.patchText}
              onChange={(e) => store.setPatchText(e.target.value)}
            />
          )}
          {store.mode === "validate" && (
            <textarea
              className="min-h-24 border-b border-[var(--border)] bg-[var(--panel)] px-3 py-2 font-mono text-sm outline-none"
              placeholder="JSON Schema…"
              value={store.schemaText}
              onChange={(e) => store.setSchemaText(e.target.value)}
            />
          )}
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-2 py-1">
            <button
              type="button"
              className="rounded p-1 hover:bg-[var(--border)]"
              onClick={() => void navigator.clipboard.writeText(store.output)}
              aria-label="Copy output"
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              className="rounded p-1 hover:bg-[var(--border)]"
              onClick={() => {
                const blob = new Blob([store.output], { type: "text/plain" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `output.${detected}`;
                a.click();
              }}
              aria-label="Download output"
            >
              <Download size={16} />
            </button>
          </div>
          <Suspense fallback={<div className="p-4">Loading editor…</div>}>
            <MonacoEditor value={store.output} onChange={() => {}} readOnly language="json" />
          </Suspense>
        </section>
      </main>

      <footer className="border-t border-[var(--border)]">
        <SamplePicker />
        {store.logs.length > 0 && (
          <div className="max-h-24 overflow-auto px-4 py-2 font-mono text-xs text-red-500">
            {store.logs.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}
