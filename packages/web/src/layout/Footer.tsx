import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-4 text-center text-sm text-slate-600 md:px-6">
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Legal">
        <Link to="/privacy" className="hover:text-slate-900 hover:underline">
          Privacy Policy
        </Link>
        <Link to="/terms" className="hover:text-slate-900 hover:underline">
          Terms &amp; Conditions
        </Link>
      </nav>
      <p className="mt-2 text-xs text-slate-500">
        © {new Date().getFullYear()} ConfigShape. MIT License.
      </p>
    </footer>
  );
}
