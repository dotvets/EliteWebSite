import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { useScrollHeader } from "./header/useScrollHeader";
import { Logo } from "./header/Logo";
import { DesktopNav } from "./header/DesktopNav";
import { LanguageToggle } from "./header/LanguageToggle";
import { AnimatedPhoneNumber } from "./header/AnimatedPhoneNumber";
import { MobileMenu } from "./header/MobileMenu";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isScrolled = useScrollHeader();
  const { language } = useLanguage();
  const t = translations[language].header;

  const scrollToFooter = () => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.services, href: "/services" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.bookNow, href: "/book-now" },
    { label: t.nav.contactUs, href: "#footer", onClick: scrollToFooter },
    { label: t.nav.eliteOnyx, href: "/elite-onyx" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          <Logo />

          <DesktopNav items={navItems} />

          <div className="hidden lg:flex items-center gap-4">
            <LanguageToggle />
            <a href="tel:920011626">
              <Button data-testid="button-book-appointment" size="default" className="font-mono text-lg">
                <AnimatedPhoneNumber number="920011626" />
              </Button>
            </a>
          </div>

          <MobileMenu
            items={navItems}
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
