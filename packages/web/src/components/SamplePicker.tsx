import { useAppStore } from "../store";

const SAMPLES = [
  { id: "k8s", file: "k8s-deployment.yaml", label: "K8s", expr: ".spec.template.spec.containers[].image", mode: "query" as const },
  { id: "helm-base", file: "helm-values-base.yaml", label: "Helm Base", mode: "merge" as const },
  { id: "helm-prod", file: "helm-values-prod.yaml", label: "Helm Prod", mode: "merge" as const },
  { id: "gha", file: "github-actions.yml", label: "GHA", expr: ".jobs", mode: "query" as const },
  { id: "pyproject", file: "pyproject.toml", label: "pyproject", mode: "query" as const },
  { id: "compose", file: "docker-compose.yml", label: "Compose", mode: "query" as const },
  { id: "pkg", file: "package.json", label: "package.json", expr: ".scripts", mode: "query" as const },
  { id: "cargo", file: "Cargo.toml", label: "Cargo", mode: "query" as const },
  { id: "atom", file: "atom-feed.xml", label: "Atom", mode: "query" as const },
];

export function SamplePicker() {
  const store = useAppStore();

  const loadSample = async (sample: (typeof SAMPLES)[0]) => {
    const res = await fetch(`/samples/${sample.file}`);
    const text = await res.text();
    if (sample.mode === "merge" && sample.id === "helm-base") {
      store.setMode("merge");
      const prod = await fetch("/samples/helm-values-prod.yaml").then((r) => r.text());
      store.setMergeSources([text, prod]);
      store.setSource(text);
    } else {
      store.setSource(text);
      if (sample.expr) store.setExpression(sample.expr);
      if (sample.mode) store.setMode(sample.mode);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto px-4 py-2">
      <span className="self-center text-xs text-[var(--muted)]">Samples:</span>
      {SAMPLES.filter((s) => s.id !== "helm-prod").map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => void loadSample(s)}
          className="rounded border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--border)]"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
