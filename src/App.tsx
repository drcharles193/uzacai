
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Trial from "./pages/Trial";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import DashIn from "./pages/DashIn";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ScheduleCalendar from "./components/schedule/ScheduleCalendar";
import ComingSoon from "./pages/ComingSoon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/trial" element={<Trial />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashin" element={<DashIn />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/schedule" element={<ScheduleCalendar />} />
          {/* Coming Soon pages */}
          <Route path="/users" element={<ComingSoon />} />
          <Route path="/analytics" element={<ComingSoon />} />
          <Route path="/content" element={<ComingSoon />} />
          <Route path="/inbox" element={<ComingSoon />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
