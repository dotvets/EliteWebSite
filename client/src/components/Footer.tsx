import { Link } from "wouter";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const quickLinks = [
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Our Team", href: "/team" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="bg-gradient-to-b from-[#7960a7] to-[#6650a0] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center">
                <span className="text-primary font-bold text-xl">EV</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg">Elite Vet</span>
                <span className="text-sm text-white/80">Veterinary Clinic</span>
              </div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              Elite Veterinary Clinic: Your Trusted Partner in Pet Care. Discover a
              new level of veterinary care. From routine check-ups to complex
              surgeries, our team is dedicated to providing exceptional service &
              ensuring your pet's well-being.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <a
                      className="text-white/80 hover:text-white transition-colors"
                      data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">
                  Riyadh, Kingdom of Saudi Arabia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="text-white/80 text-sm">+966 XX XXX XXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span className="text-white/80 text-sm">info@elitevet.sa</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <p className="text-center text-white/70 text-sm">
            © {new Date().getFullYear()} Elite Vet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
