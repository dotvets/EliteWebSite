import { Link } from "wouter";

interface NavItem {
  label: string;
  href: string;
}

interface DesktopNavProps {
  items: NavItem[];
}

export function DesktopNav({ items }: DesktopNavProps) {
  return (
    <nav className="hidden lg:flex items-center gap-8">
      {items.map((item) => (
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
  );
}
