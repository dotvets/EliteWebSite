import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AnimatedServicesBackground from "@/components/AnimatedServicesBackground";
import BackgroundMusic from "@/components/BackgroundMusic";
import FloatingSocialMenu from "@/components/FloatingSocialMenu";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Blog from "@/pages/Blog";
import BookNow from "@/pages/BookNow";
import ContactUs from "@/pages/ContactUs";
import EliteOnyx from "@/pages/EliteOnyx";
import NotFound from "@/pages/not-found";

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <AnimatedServicesBackground />
          <Header />
          <BackgroundMusic />
          <FloatingSocialMenu />
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
