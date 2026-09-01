import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useSiteImageOverrides } from "@/lib/siteImages";
import AnimatedServicesBackground from "@/components/AnimatedServicesBackground";
import FloatingSocialMenu from "@/components/FloatingSocialMenu";
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
      <Route component={NotFound} />
    </Switch>
  );
}

// Public-site chrome (header, social float) — hidden on admin pages.
function SiteChrome() {
  const [loc] = useLocation();
  if (loc.startsWith("/admin")) return null;
  return (
    <>
      <Header />
      <FloatingSocialMenu />
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
