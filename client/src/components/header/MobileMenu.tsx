import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";
import { AnimatedPhoneNumber } from "./AnimatedPhoneNumber";

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function MobileMenu({ items, isOpen, onToggle, onClose }: MobileMenuProps) {
  return (
    <>
      <button
        className="lg:hidden p-2 -mr-2 hover-elevate active-elevate-2 rounded-md flex-shrink-0"
        onClick={onToggle}
        data-testid="button-mobile-menu"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="lg:hidden py-6 border-t">
          <nav className="flex flex-col gap-4">
            {items.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  data-testid={`link-mobile-${item.href.replace('/', '') || 'home'}`}
                  className="text-foreground hover:text-primary transition-colors font-medium py-2 cursor-pointer block"
                  onClick={onClose}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            <LanguageToggle 
              variant="outline" 
              className="w-full mt-2" 
              testId="button-mobile-language-toggle" 
            />
            <a href="tel:920011626" className="block">
              <Button
                data-testid="button-mobile-book"
                className="w-full font-mono text-lg"
                onClick={onClose}
              >
                <AnimatedPhoneNumber number="920011626" />
              </Button>
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
