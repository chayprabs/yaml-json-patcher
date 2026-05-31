import { Github } from "lucide-react";

const GITHUB = "https://github.com/chayprabs/yaml-json-patcher";
const TWITTER = "https://x.com/chayprabs";
const WEBSITE = "https://www.chaitanyaprabuddha.com";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
      <h1 className="m-0 text-lg font-semibold tracking-tight">
        <a href="/" className="text-slate-900 no-underline hover:text-blue-600">
          ConfigShape
        </a>
      </h1>
      <nav className="flex items-center gap-1 sm:gap-2" aria-label="External links">
        <a
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="View source on GitHub"
        >
          <Github size={20} />
        </a>
        <a
          href={TWITTER}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Follow on X"
        >
          <XIcon className="h-5 w-5" />
        </a>
        <a
          href={WEBSITE}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Personal website"
        >
          <GlobeIcon className="h-5 w-5" />
        </a>
      </nav>
    </header>
  );
}
