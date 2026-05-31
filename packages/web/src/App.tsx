import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LegalPage } from "./pages/LegalPage";
import { SeoLandingPage } from "./pages/SeoLandingPage";
import { privacyPolicy, softwareLicense, termsAndConditions } from "./content/legal";

const SEO_SLUGS = [
  "jq-online",
  "yq-online",
  "jsonpath-online",
  "jmespath-online",
  "json-patch-online",
  "yaml-to-json",
  "json-to-yaml",
  "k8s-yaml-query",
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<LegalPage title="Privacy Policy" body={privacyPolicy} />} />
        <Route path="/terms" element={<LegalPage title="Terms & Conditions" body={termsAndConditions} />} />
        <Route path="/license" element={<LegalPage title="License" body={softwareLicense} />} />
        {SEO_SLUGS.map((slug) => (
          <Route key={slug} path={`/${slug}`} element={<SeoLandingPage />} />
        ))}
        <Route path="/:slug" element={<SeoLandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
