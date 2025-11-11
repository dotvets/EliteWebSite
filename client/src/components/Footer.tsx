import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaSnapchat, FaXTwitter } from "react-icons/fa6";
import logoImage from "@assets/Elite final logo_1762859223489.jpg";

export default function Footer() {
  const socialLinks = [
    { 
      name: "WhatsApp", 
      icon: FaWhatsapp, 
      url: "https://wa.me/920011626",
      testId: "link-whatsapp"
    },
    { 
      name: "Facebook", 
      icon: FaFacebook, 
      url: "https://www.facebook.com/EliteVetKsa/",
      testId: "link-facebook"
    },
    { 
      name: "Instagram", 
      icon: FaInstagram, 
      url: "https://www.instagram.com/elitevetksa/",
      testId: "link-instagram"
    },
    { 
      name: "TikTok", 
      icon: FaTiktok, 
      url: "https://www.tiktok.com/@elitevetksa?_t=8bOy5ryM69C&_r=1",
      testId: "link-tiktok"
    },
    { 
      name: "Snapchat", 
      icon: FaSnapchat, 
      url: "https://www.snapchat.com/add/elitevetksa?share_id=M0YyOUQzQ0ItMEU4NS00NkU0LTkwMDctNkU2RTMxQjBFQUYz&locale=en_SA%40calendar%3Dgregorian&sid=5891bfd442be4a65b62ef788639e0287",
      testId: "link-snapchat"
    },
    { 
      name: "X", 
      icon: FaXTwitter, 
      url: "https://x.com/EliteVetKsa",
      testId: "link-x"
    },
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Logo Section */}
            <div>
              <div className="mb-6 bg-white/95 rounded-lg p-4 inline-block">
                <img
                  src={logoImage}
                  alt="Elite Vet Logo"
                  className="h-20 w-auto"
                  data-testid="img-footer-logo"
                />
              </div>
              <p className="text-white/90 text-sm leading-relaxed font-body">
                Elite Veterinary Clinic: Your Trusted Partner in Pet Care. Providing exceptional service & ensuring your pet's well-being.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold font-heading text-lg mb-6">Contact Info</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <a 
                    href="tel:920011626"
                    className="text-white/80 text-sm font-body hover:text-white transition-colors"
                    data-testid="link-call"
                  >
                    Call: 920011626
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <a 
                    href="tel:920011626"
                    className="text-white/80 text-sm font-body hover:text-white transition-colors"
                    data-testid="link-emergency"
                  >
                    Emergency: 920011626
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a 
                    href="mailto:info@ellitevetksa.com"
                    className="text-white/80 text-sm font-body hover:text-white transition-colors"
                    data-testid="link-email"
                  >
                    info@ellitevetksa.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Qurtubah+gate+Al+Thoumamah+Rd+Qurtubah+Riyadh+13248"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 text-sm font-body hover:text-white transition-colors"
                    data-testid="link-address"
                  >
                    Qurtubah gate, Al Thoumamah Rd, Qurtubah, Riyadh 13248
                  </a>
                </li>
              </ul>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="font-semibold font-heading text-lg mb-6">Working Hours</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-body">
                    <div className="text-white/90 font-medium">09:00 AM - 10:00 PM</div>
                    <div className="text-white/70 mt-1">Daily</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-body">
                    <div className="text-white/90 font-medium">24/7 Emergency Services</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Stay In Touch */}
            <div>
              <h3 className="font-semibold font-heading text-lg mb-6">Stay In Touch</h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                      aria-label={social.name}
                      data-testid={social.testId}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </a>
                  );
                })}
              </div>
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
