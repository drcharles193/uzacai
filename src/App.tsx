
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Trial from "./pages/Trial";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        // First check localStorage for dev/testing purposes
        const userData = localStorage.getItem('socialAI_user');
        if (userData) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // Then check actual session
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      setIsAuthenticated(!!session);
      
      // If the user signs in, set isAuthenticated to true
      // Fixed the type comparison issue by using a more generic condition
      if (session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Check if user is logged in from localStorage or session
  const isLoggedIn = localStorage.getItem('socialAI_user') !== null || isAuthenticated;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              // If user is logged in, redirect to dashboard
              isLoggedIn ? <Navigate to="/dashboard" /> : <Index />
            } />
            <Route path="/trial" element={<Trial />} />
            <Route 
              path="/dashboard" 
              element={
                // User must be authenticated to access the dashboard
                isLoggedIn ? <Dashboard /> : <Navigate to="/auth" />
              } 
            />
            <Route path="/auth" element={
              // If already logged in, redirect to dashboard
              isLoggedIn ? <Navigate to="/dashboard" /> : <Auth />
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
