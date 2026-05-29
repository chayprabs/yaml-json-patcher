import Editor from "@monaco-editor/react";
import { useAppStore } from "../store";

interface Props {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  language?: string;
}

export default function MonacoEditor({ value, onChange, readOnly, language = "yaml" }: Props) {
  const theme = useAppStore((s) => s.theme);
  const langMap: Record<string, string> = {
    json: "json",
    yaml: "yaml",
    toml: "ini",
    xml: "xml",
  };

  return (
    <Editor
      height="100%"
      language={langMap[language] ?? language}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      theme={theme === "dark" ? "vs-dark" : "light"}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
      loading={<div className="p-4 text-sm text-[var(--muted)]">Loading Monaco…</div>}
    />
  );
}
