import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useSiteImageOverrides } from "@/lib/siteImages";
import AnimatedServicesBackground from "@/components/AnimatedServicesBackground";
import FloatingSocialMenu from "@/components/FloatingSocialMenu";
import FloatingAd from "@/components/FloatingAd";
import Header from "@/components/Header";
import { ScrollToTop } from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Blog from "@/pages/Blog";
import BookNow from "@/pages/BookNow";
import ContactUs from "@/pages/ContactUs";
import EliteOnyx from "@/pages/EliteOnyx";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import HubWidget from "@/components/hub/HubWidget";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/blog" component={Blog} />
      <Route path="/book-now" component={BookNow} />
      <Route path="/contact-us" component={ContactUs} />
      <Route path="/elite-onyx" component={EliteOnyx} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/hub/:brand" component={HubWidget} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Track SPA route changes as GA4 page views. Internal admin pages are excluded.
function AnalyticsPageView() {
  const [loc] = useLocation();

  useEffect(() => {
    if (loc.startsWith("/admin")) return;

    const gtag = (
      window as Window & { gtag?: (...args: unknown[]) => void }
    ).gtag;

    if (!gtag) return;

    gtag("event", "page_view", {
      page_path: loc,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [loc]);

  return null;
}

// Public-site chrome (header, social float, floating ad) — hidden on admin pages.
function SiteChrome() {
  const [loc] = useLocation();
  if (loc.startsWith("/admin")) return null;
  return (
    <>
      <Header />
      <FloatingSocialMenu />
      <FloatingAd />
    </>
  );
}

function App() {
  useSiteImageOverrides();
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <ScrollToTop />
          <AnalyticsPageView />
          <AnimatedServicesBackground />
          <SiteChrome />
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
