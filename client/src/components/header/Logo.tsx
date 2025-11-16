import { Link } from "wouter";
import logoImage from "@assets/Elite final logo_1761818487960.jpg";

export function Logo() {
  return (
    <Link href="/" data-testid="link-home">
      <div className="flex items-center cursor-pointer">
        <img
          src={logoImage}
          alt="Elite Vet Logo"
          className="h-12 sm:h-14 md:h-16 w-auto"
        />
      </div>
    </Link>
  );
}
