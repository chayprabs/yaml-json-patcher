interface Props {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  "aria-label"?: string;
}

export default function TextAreaEditor({
  value,
  onChange,
  readOnly,
  placeholder,
  "aria-label": ariaLabel,
}: Props) {
  return (
    <textarea
      className="h-full min-h-[240px] w-full resize-none border-0 bg-white p-3 font-mono text-sm leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-inset disabled:bg-slate-50"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      aria-label={ariaLabel}
      spellCheck={false}
    />
  );
}
