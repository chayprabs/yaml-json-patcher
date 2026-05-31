import { TopBar } from "../layout/TopBar";
import { SeoBanner } from "../layout/SeoBanner";
import { Footer } from "../layout/Footer";
import { ConfigPlayground } from "../components/ConfigPlayground";

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopBar />
      <SeoBanner />
      <ConfigPlayground />
      <Footer />
    </div>
  );
}
