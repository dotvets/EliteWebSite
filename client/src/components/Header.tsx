import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import logoImage from "@assets/Elite final logo_1761818487960.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { motion } from "framer-motion";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = translations[language].header;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.services, href: "/services" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.bookNow, href: "/book-now" },
    { label: t.nav.contactUs, href: "/contact-us" },
    { label: t.nav.eliteOnyx, href: "/elite-onyx" },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center cursor-pointer">
              <img
                src={logoImage}
                alt="Elite Vet Logo"
                className="h-16 w-auto"
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  data-testid={`link-nav-${item.href.replace('/', '') || 'home'}`}
                  className="text-foreground hover:text-primary transition-colors font-medium cursor-pointer"
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={toggleLanguage}
              data-testid="button-language-toggle"
              className="gap-2"
            >
              <Globe className="w-5 h-5" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </Button>
            <a href="tel:920011626">
              <Button data-testid="button-book-appointment" size="default" className="font-mono text-lg">
                <span dir="ltr" className="flex gap-1">
                  {Array.from('920011626').map((digit, index) => (
                    <motion.span
                      key={index}
                      animate={{
                        scale: [1, 1.8, 1],
                      }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        delay: index * 0.15,
                        repeatDelay: 1.5,
                        ease: "easeInOut",
                      }}
                      className="inline-block"
                    >
                      {digit}
                    </motion.span>
                  ))}
                </span>
              </Button>
            </a>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-6 border-t">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    data-testid={`link-mobile-${item.href.replace('/', '') || 'home'}`}
                    className="text-foreground hover:text-primary transition-colors font-medium py-2 cursor-pointer block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={toggleLanguage}
                data-testid="button-mobile-language-toggle"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'en' ? 'العربية' : 'English'}
              </Button>
              <a href="tel:920011626" className="block">
                <Button
                  data-testid="button-mobile-book"
                  className="w-full font-mono text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span dir="ltr" className="flex gap-1">
                    {Array.from('920011626').map((digit, index) => (
                      <motion.span
                        key={index}
                        animate={{
                          scale: [1, 1.8, 1],
                        }}
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          delay: index * 0.15,
                          repeatDelay: 1.5,
                          ease: "easeInOut",
                        }}
                        className="inline-block"
                      >
                        {digit}
                      </motion.span>
                    ))}
                  </span>
                </Button>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
