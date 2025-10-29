import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Team", href: "/team" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">EV</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-foreground">Elite Vet</span>
                <span className="text-xs text-muted-foreground">Veterinary Clinic</span>
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button data-testid="button-book-appointment" size="default">
              Book Appointment
            </Button>
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
                  <a
                    data-testid={`link-mobile-${item.label.toLowerCase()}`}
                    className="text-foreground hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
              <Button
                data-testid="button-mobile-book"
                className="w-full mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Book Appointment
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
