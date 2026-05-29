/** Lazy-loaded jq-wasm engine wrapper */
import * as jqModule from "jq-wasm";

let jqReady: Promise<typeof jqModule> | null = null;

async function loadJq(): Promise<typeof jqModule> {
  if (!jqReady) {
    jqReady = Promise.resolve(jqModule);
  }
  return jqReady;
}

export async function runJq(json: unknown, filter: string): Promise<unknown> {
  const jq = await loadJq();
  return jq.json(json, filter);
}

export function resetJqCache(): void {
  jqReady = null;
}
