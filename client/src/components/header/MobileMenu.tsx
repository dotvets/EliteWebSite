import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";
import { AnimatedPhoneNumber } from "./AnimatedPhoneNumber";

interface NavItem {
  label: string;
  href: string;
  onClick?: () => void;
  standalone?: boolean;
}

interface MobileMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function MobileMenu({ items, isOpen, onToggle, onClose }: MobileMenuProps) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location === href;
  };

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
        <div className="lg:hidden fixed left-0 right-0 top-20 bg-background shadow-lg border-t z-[190] max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="flex flex-col gap-4 px-4 sm:px-6 py-6">
            {items.map((item, index) => {
              const active = isActive(item.href);
              const activeClasses = active ? "text-primary underline underline-offset-8 decoration-2" : "text-foreground hover:text-primary";
              
              if (item.standalone) {
                return (
                  <span
                    key={`standalone-${index}`}
                    data-testid="link-mobile-elite-onx"
                    className="text-primary font-semibold py-2 block mt-4 pt-4 border-t border-muted-foreground/30 cursor-default"
                  >
                    {item.label}
                  </span>
                );
              }
              
              return item.onClick ? (
                <span
                  key={item.href}
                  data-testid={`link-mobile-${item.href.replace('/', '').replace('#', '') || 'home'}`}
                  className={`${activeClasses} transition-colors font-medium py-2 cursor-pointer block`}
                  onClick={() => {
                    item.onClick?.();
                    onClose();
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link key={item.href} href={item.href}>
                  <span
                    data-testid={`link-mobile-${item.href.replace('/', '') || 'home'}`}
                    className={`${activeClasses} transition-colors font-medium py-2 cursor-pointer block`}
                    onClick={onClose}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
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
