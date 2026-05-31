interface SeoBannerProps {
  title?: string;
  subtitle?: string;
}

const DEFAULT_TITLE =
  "Query and patch YAML, JSON, TOML and XML in your browser";
const DEFAULT_SUBTITLE =
  "Run jq, JSONPath, JMESPath, JSON Patch and merges locally — your config never leaves this tab.";

export function SeoBanner({ title = DEFAULT_TITLE, subtitle = DEFAULT_SUBTITLE }: SeoBannerProps) {
  return (
    <section
      className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-center md:px-6"
      aria-label="Product summary"
    >
      <p className="text-sm font-medium text-slate-800 md:text-base">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600 md:text-sm">{subtitle}</p>
    </section>
  );
}
