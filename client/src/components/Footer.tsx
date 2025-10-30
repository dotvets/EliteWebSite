import { Link } from "wouter";
import { MapPin, Phone, Mail } from "lucide-react";
import logoImage from "@assets/Elite final logo_1761818487960.jpg";

export default function Footer() {
  const quickLinks = [
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Our Team", href: "/team" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Gray border - 10px thick */}
      <div className="w-full h-[10px] bg-[#9d9ea0]" data-testid="footer-top-border"></div>
      
      {/* White space above footer */}
      <div className="w-full h-16 bg-white" data-testid="footer-white-space"></div>
      
      {/* Footer */}
      <footer className="bg-gradient-to-b from-primary to-[#6650a0] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="mb-6">
                <img
                  src={logoImage}
                  alt="Elite Vet Logo"
                  className="h-20 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-white/90 text-sm leading-relaxed font-body">
                Elite Veterinary Clinic: Your Trusted Partner in Pet Care. Discover a
                new level of veterinary care. From routine check-ups to complex
                surgeries, our team is dedicated to providing exceptional service &
                ensuring your pet's well-being.
              </p>
            </div>

            <div>
              <h3 className="font-semibold font-heading text-lg mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span
                        className="text-white/80 hover:text-white transition-colors cursor-pointer font-body"
                        data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold font-heading text-lg mb-6">Contact Info</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-white/80 text-sm font-body">
                    Riyadh, Kingdom of Saudi Arabia
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span className="text-white/80 text-sm font-body">+966 XX XXX XXXX</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="text-white/80 text-sm font-body">info@elitevet.sa</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <p className="text-center text-white/70 text-sm font-body">
              © {new Date().getFullYear()} Elite Vet. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
