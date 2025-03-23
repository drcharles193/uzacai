
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import DashIn from "./pages/DashIn";
import Trial from "./pages/Trial";
import Upgrade from "./pages/Upgrade";
import Settings from "./pages/Settings";
import ComingSoon from "./pages/ComingSoon";
import Auth from "./pages/Auth";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import LinkedInCallbackPage from "./pages/LinkedInCallbackPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashin" element={<DashIn />} />
        <Route path="/trial" element={<Trial />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/auth/linkedin/callback" element={<LinkedInCallbackPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
