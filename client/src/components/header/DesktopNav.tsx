import { Link, useLocation } from "wouter";

interface NavItem {
  label: string;
  href: string;
  onClick?: () => void;
  standalone?: boolean;
}

interface DesktopNavProps {
  items: NavItem[];
}

export function DesktopNav({ items }: DesktopNavProps) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location === href;
  };

  return (
    <nav className="hidden lg:flex items-center gap-8">
      {items.map((item, index) => {
        const active = isActive(item.href);
        const activeClasses = active ? "text-primary underline underline-offset-8 decoration-2" : "text-foreground hover:text-primary";
        const standaloneClasses = item.standalone ? "ml-8 pl-8 border-l border-muted-foreground/30" : "";
        
        if (item.standalone) {
          return (
            <span
              key={`standalone-${index}`}
              data-testid="link-nav-elite-onx"
              className={`text-primary font-semibold cursor-default ${standaloneClasses}`}
            >
              {item.label}
            </span>
          );
        }
        
        return item.onClick ? (
          <span
            key={item.href}
            data-testid={`link-nav-${item.href.replace('/', '').replace('#', '') || 'home'}`}
            className={`${activeClasses} transition-colors font-medium cursor-pointer`}
            onClick={item.onClick}
          >
            {item.label}
          </span>
        ) : (
          <Link key={item.href} href={item.href}>
            <span
              data-testid={`link-nav-${item.href.replace('/', '') || 'home'}`}
              className={`${activeClasses} transition-colors font-medium cursor-pointer`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
