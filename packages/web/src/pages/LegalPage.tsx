import { Link } from "react-router-dom";
import { TopBar } from "../layout/TopBar";
import { Footer } from "../layout/Footer";

interface LegalPageProps {
  title: string;
  body: string;
}

export function LegalPage({ title, body }: LegalPageProps) {
  const sections = body.split("\n## ").map((chunk, i) => {
    const text = i === 0 ? chunk.replace(/^#\s+[^\n]+\n+/, "") : chunk;
    const [heading, ...rest] = text.split("\n");
    return { heading: i === 0 ? null : heading, content: rest.join("\n").trim() };
  });

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <TopBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Back to ConfigShape
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
        <div className="prose prose-slate mt-6 max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          {sections.map((s, idx) => (
            <section key={idx}>
              {s.heading && <h2 className="mb-2 text-lg font-medium text-slate-900">{s.heading}</h2>}
              {s.content.split("\n\n").map((para, pidx) => (
                <p key={pidx} className="mb-3 whitespace-pre-wrap">
                  {para.replace(/\*\*([^*]+)\*\*/g, "$1")}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
