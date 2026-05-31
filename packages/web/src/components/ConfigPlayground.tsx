import { useEffect, useState } from "react";
import { Copy, Download, Play, Share2, Trash2 } from "lucide-react";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { detectFormat } from "@configshape/yaml-json-patcher";
import { useEvaluate } from "../hooks/useEvaluate";
import { cn } from "../lib/utils";
import { useAppStore, type Mode } from "../store";
import { ConflictResolver } from "./ConflictResolver";
import { DiffViewer } from "./DiffViewer";
import { loadSample } from "./samples";

import TextAreaEditor from "./TextAreaEditor";

const MODES: { id: Mode; label: string }[] = [
  { id: "query", label: "Query" },
  { id: "patch", label: "Patch" },
  { id: "merge", label: "Merge" },
  { id: "validate", label: "Validate" },
  { id: "diff", label: "Diff" },
];

const ENGINES = ["jq", "jsonpath", "jmespath", "yq"] as const;
const FORMATS = ["auto", "json", "yaml", "toml", "xml"] as const;
const MERGE_STRATEGIES = ["deep", "shallow", "list-append", "list-replace", "last-write-wins"] as const;

const SAMPLE_OPTIONS = [
  { label: "Load sample…", value: "" },
  { label: "Kubernetes Deployment", value: "k8s" },
  { label: "package.json", value: "pkg" },
  { label: "Helm merge (base + prod)", value: "helm" },
  { label: "GitHub Actions", value: "gha" },
  { label: "pyproject.toml", value: "pyproject" },
  { label: "docker-compose.yml", value: "compose" },
  { label: "Cargo.toml", value: "cargo" },
  { label: "Atom feed (XML)", value: "atom" },
];

export function ConfigPlayground() {
  const store = useAppStore();
  const { run } = useEvaluate();
  const [showRestore, setShowRestore] = useState(false);
  const [sampleKey, setSampleKey] = useState("");
  const detected = store.source.trim() ? detectFormat(store.source) : "yaml";

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const data = JSON.parse(decompressFromEncodedURIComponent(hash) ?? "{}");
        if (data.source) store.setSource(data.source);
        if (data.expression) store.setExpression(data.expression);
        if (data.mode) store.setMode(data.mode);
        if (data.engine) store.setEngine(data.engine);
      } catch {
        /* ignore */
      }
    } else {
      const saved = localStorage.getItem("configshape-session");
      if (saved && !store.source) setShowRestore(true);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void run();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        localStorage.setItem("configshape-draft", store.source);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, store.source]);

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
    store.setConflicts([]);
    store.clearLogs();
  };

  const restoreSession = () => {
    const raw = localStorage.getItem("configshape-session");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.state?.source) store.setSource(data.state.source);
      } catch {
        /* ignore */
      }
    }
    setShowRestore(false);
  };

  const onSample = (key: string) => {
    setSampleKey("");
    if (!key) return;
    void loadSample(key, store);
  };

  const outputFormat = store.format === "auto" ? detected : store.format;

  return (
    <div className="flex flex-1 flex-col">
      {showRestore && (
        <div className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-center text-sm text-blue-900">
          Restore last session?{" "}
          <button type="button" className="font-medium underline" onClick={restoreSession}>
            Restore
          </button>{" "}
          <button type="button" className="text-blue-700 underline" onClick={() => setShowRestore(false)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 md:px-6">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => store.setMode(m.id)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition",
              store.mode === m.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            )}
          >
            {m.label}
          </button>
        ))}
        <select
          className="ml-auto rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
          value={sampleKey}
          onChange={(e) => onSample(e.target.value)}
          aria-label="Load sample file"
        >
          {SAMPLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={share}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Share link"
        >
          <Share2 size={18} />
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Clear stored data"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2 md:px-6">
        {store.mode === "query" &&
          ENGINES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => store.setEngine(e)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium capitalize",
                store.engine === e ? "bg-slate-800 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200",
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
              "rounded-md px-2.5 py-1 text-xs font-medium uppercase",
              store.format === f ? "bg-slate-800 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200",
            )}
          >
            {f}
          </button>
        ))}
        {store.mode === "merge" &&
          MERGE_STRATEGIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => store.setMergeStrategy(s)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs",
                store.mergeStrategy === s ? "bg-slate-800 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200",
              )}
            >
              {s}
            </button>
          ))}
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-slate-200">
        <section className="flex min-h-[280px] flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Input</span>
            <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-medium uppercase text-white">
              {store.format === "auto" ? detected : store.format}
            </span>
          </div>
          {store.mode === "merge" ? (
            <div className="grid flex-1 grid-rows-2 gap-px bg-slate-200">
              {store.mergeSources.map((src, i) => (
                <textarea
                  key={i}
                  className="min-h-[120px] resize-none border-0 bg-white p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-inset"
                  placeholder={`Config file ${i + 1}…`}
                  value={src}
                  onChange={(e) => {
                    const next = [...store.mergeSources];
                    next[i] = e.target.value;
                    store.setMergeSources(next);
                    if (i === 0) store.setSource(e.target.value);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="min-h-[280px] flex-1">
              <TextAreaEditor
                value={store.source}
                onChange={store.setSource}
                aria-label="Configuration input"
                placeholder="Paste YAML, JSON, TOML, or XML…"
              />
            </div>
          )}
        </section>

        <section className="flex min-h-[280px] flex-col">
          {store.mode === "query" && (
            <input
              className="border-b border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="jq / JSONPath / JMESPath expression…"
              value={store.expression}
              onChange={(e) => store.setExpression(e.target.value)}
            />
          )}
          {store.mode === "patch" && (
            <textarea
              className="min-h-20 border-b border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none"
              placeholder='JSON Patch [{"op":"replace",...}] or merge patch {"key":"value"}'
              value={store.patchText}
              onChange={(e) => store.setPatchText(e.target.value)}
            />
          )}
          {store.mode === "validate" && (
            <textarea
              className="min-h-20 border-b border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none"
              placeholder="JSON Schema (optional)…"
              value={store.schemaText}
              onChange={(e) => store.setSchemaText(e.target.value)}
            />
          )}
          {store.mode === "diff" && (
            <textarea
              className="min-h-20 border-b border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none"
              placeholder="After document (paste changed config)…"
              value={store.diffAfter}
              onChange={(e) => store.setDiffAfter(e.target.value)}
            />
          )}

          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <button
              type="button"
              onClick={() => void run()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Play size={16} fill="currentColor" />
              Run
            </button>
            <span className="text-xs text-slate-500">Ctrl+Enter</span>
            <div className="ml-auto flex gap-1">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                onClick={() => void navigator.clipboard.writeText(store.output)}
                aria-label="Copy output"
              >
                <Copy size={16} />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                onClick={() => {
                  const blob = new Blob([store.output], { type: "text/plain" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `output.${outputFormat}`;
                  a.click();
                }}
                aria-label="Download output"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Output</span>
          </div>
          <div className="min-h-[200px] flex-1">
            <TextAreaEditor
              value={store.output}
              onChange={() => {}}
              readOnly
              aria-label="Result output"
              placeholder="Results appear here after you run…"
            />
          </div>
        </section>
      </div>

      <ConflictResolver />

      {store.mode === "diff" && store.diffAfter.trim() && (
        <DiffViewer before={store.source} after={store.diffAfter} />
      )}

      {store.logs.length > 0 && (
        <div className="max-h-28 overflow-auto border-t border-red-100 bg-red-50 px-4 py-2 font-mono text-xs text-red-700">
          {store.logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
