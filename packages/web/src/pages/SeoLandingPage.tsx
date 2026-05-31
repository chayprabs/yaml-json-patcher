import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TopBar } from "../layout/TopBar";
import { SeoBanner } from "../layout/SeoBanner";
import { Footer } from "../layout/Footer";
import { ConfigPlayground } from "../components/ConfigPlayground";
import { useAppStore } from "../store";
import type { Engine, Mode } from "../components/seoConfig";

const SEO_ROUTES: Record<
  string,
  { h1: string; subtitle: string; mode?: Mode; engine?: Engine; expression?: string }
> = {
  "jq-online": {
    h1: "jq online — run jq on YAML and JSON in your browser",
    subtitle: "Paste a config, pick jq, and evaluate filters locally with WASM. Nothing is uploaded.",
    mode: "query",
    engine: "jq",
    expression: ".",
  },
  "yq-online": {
    h1: "yq-style queries on YAML configs",
    subtitle: "Query Kubernetes and Helm YAML with yq-style expressions, processed entirely client-side.",
    mode: "query",
    engine: "yq",
    expression: ".metadata",
  },
  "jsonpath-online": {
    h1: "JSONPath online for configs",
    subtitle: "Evaluate JSONPath against JSON or YAML-derived JSON without leaving your browser.",
    mode: "query",
    engine: "jsonpath",
    expression: "$",
  },
  "jmespath-online": {
    h1: "JMESPath online playground",
    subtitle: "Project and filter configuration data with JMESPath locally.",
    mode: "query",
    engine: "jmespath",
    expression: "@",
  },
  "json-patch-online": {
    h1: "JSON Patch (RFC 6902) online",
    subtitle: "Apply and test JSON Patch operations on package.json, K8s manifests, and more.",
    mode: "patch",
    expression: '[{"op":"replace","path":"/name","value":"example"}]',
  },
  "yaml-to-json": {
    h1: "YAML to JSON converter",
    subtitle: "Paste YAML on the left and serialize to JSON — comments preserved where possible.",
    mode: "query",
    engine: "jq",
    expression: ".",
  },
  "json-to-yaml": {
    h1: "JSON to YAML converter",
    subtitle: "Round-trip JSON through the core serializer to YAML output.",
    mode: "query",
    engine: "jq",
    expression: ".",
  },
  "k8s-yaml-query": {
    h1: "Kubernetes YAML query tool",
    subtitle: "Extract images, labels, and paths from Deployment manifests with jq or JSONPath.",
    mode: "query",
    engine: "jq",
    expression: ".spec.template.spec.containers[].image",
  },
};

export function SeoLandingPage() {
  const slug = useLocation().pathname.replace(/^\//, "").split("/")[0] ?? "";
  const meta = slug ? SEO_ROUTES[slug] : undefined;
  const setMode = useAppStore((s) => s.setMode);
  const setEngine = useAppStore((s) => s.setEngine);
  const setExpression = useAppStore((s) => s.setExpression);
  const setPatchText = useAppStore((s) => s.setPatchText);

  useEffect(() => {
    if (!meta) return;
    if (meta.mode) setMode(meta.mode);
    if (meta.engine) setEngine(meta.engine);
    if (meta.mode === "patch" && meta.expression) setPatchText(meta.expression);
    else if (meta.expression) setExpression(meta.expression);
    document.title = `${meta.h1} | ConfigShape`;
  }, [meta, setMode, setEngine, setExpression, setPatchText]);

  if (!meta) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <TopBar />
        <main className="flex flex-1 items-center justify-center p-8 text-slate-600">Page not found.</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopBar />
      <SeoBanner title={meta.h1} subtitle={meta.subtitle} />
      <ConfigPlayground />
      <Footer />
    </div>
  );
}
