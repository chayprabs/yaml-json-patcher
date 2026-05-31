import type { AppState } from "../store";

function loadQuerySample(store: AppState, setup: () => void | Promise<void>) {
  store.setMergeSources(["", ""]);
  store.setConflicts([]);
  void Promise.resolve(setup());
}

export async function loadSample(key: string, store: AppState) {
  const fetchText = (file: string) => fetch(`/samples/${file}`).then((r) => r.text());

  switch (key) {
    case "k8s": {
      loadQuerySample(store, async () => {
        const text = await fetchText("k8s-deployment.yaml");
        store.setSource(text);
        store.setMode("query");
        store.setExpression(".spec.template.spec.containers[].image");
        store.setEngine("jq");
      });
      break;
    }
    case "pkg": {
      loadQuerySample(store, async () => {
        const text = await fetchText("package.json");
        store.setSource(text);
        store.setMode("query");
        store.setExpression("$.scripts");
        store.setEngine("jsonpath");
      });
      break;
    }
    case "helm": {
      const base = await fetchText("helm-values-base.yaml");
      const prod = await fetchText("helm-values-prod.yaml");
      store.setMode("merge");
      store.setMergeSources([base, prod]);
      store.setSource(base);
      break;
    }
    case "gha": {
      loadQuerySample(store, async () => {
        store.setSource(await fetchText("github-actions.yml"));
        store.setMode("query");
        store.setExpression(".jobs");
        store.setEngine("jq");
      });
      break;
    }
    case "pyproject": {
      loadQuerySample(store, async () => {
        store.setSource(await fetchText("pyproject.toml"));
        store.setMode("query");
        store.setExpression("$.project");
        store.setEngine("jsonpath");
      });
      break;
    }
    case "compose": {
      loadQuerySample(store, async () => {
        store.setSource(await fetchText("docker-compose.yml"));
        store.setMode("query");
        store.setExpression("$.services");
        store.setEngine("jsonpath");
      });
      break;
    }
    case "cargo": {
      loadQuerySample(store, async () => {
        store.setSource(await fetchText("Cargo.toml"));
        store.setMode("query");
        store.setExpression("$.package");
        store.setEngine("jsonpath");
      });
      break;
    }
    case "atom": {
      loadQuerySample(store, async () => {
        store.setSource(await fetchText("atom-feed.xml"));
        store.setMode("query");
        store.setExpression("$.feed.entry.title");
        store.setEngine("jsonpath");
      });
      break;
    }
  }
}
