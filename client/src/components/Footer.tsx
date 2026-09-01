import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaSnapchat, FaXTwitter } from "react-icons/fa6";
import logoImage from "@assets/Elite final logo_1762859223489.jpg";
import { siteImage } from "@/lib/siteImages";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBootstrap, bsVal } from "@/hooks/useBootstrap";
import { translations } from "@/translations";

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language].footer;
  const bs = useBootstrap();
  const phone = bsVal(bs, "phone", language, "920011626");
  const whatsapp = bsVal(bs, "whatsapp", language, "966920011626");
  const email = bsVal(bs, "email", language, "info@elitevetksa.com");

  const socialLinks = [
    { 
      name: "WhatsApp", 
      icon: FaWhatsapp, 
      url: `https://wa.me/${whatsapp}`,
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
    <div>
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
              <div className="mb-6 bg-white rounded-lg p-4 inline-block">
                <img
                  src={siteImage("img.footer.logo", logoImage)}
                  alt="Elite Vet Logo"
                  className="h-20 w-auto"
                  data-testid="img-footer-logo"
                />
              </div>
              <p className="text-white/90 text-sm leading-relaxed font-body">
                {t.about}
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold font-heading text-lg mb-6">{t.contactInfo}</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <a 
                    href={`tel:${phone}`}
                    className="text-white/80 text-sm font-body hover:text-white transition-colors"
                    data-testid="link-call"
                  >
                    {t.call}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a 
                    href={`mailto:${email}`}
                    className="text-white/80 text-sm font-body hover:text-white transition-colors"
                    data-testid="link-email"
                  >
                    {email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-body">
                    <div className="text-white/90 font-medium mb-0.5">{t.riyadhBranch}</div>
                    <a 
                      href="https://maps.app.goo.gl/SPRXB5dCgho3d9qq9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white transition-colors"
                      data-testid="link-address"
                    >
                      Qurtubah gate, Al Thoumamah Rd, Qurtubah, Riyadh 13248
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-body">
                    <div className="text-white/90 font-medium mb-0.5">{t.jeddahBranch}</div>
                    <a 
                      href="/jeddah-vet-clinic.html"
                      className="text-white/80 hover:text-white transition-colors"
                      data-testid="link-address-jeddah"
                    >
                      Al Andalus Rd, Al Hamra, Jeddah 23323
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="font-semibold font-heading text-lg mb-6">{t.workingHours}</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-body">
                    <div className="text-white/90 font-medium">{t.hours}</div>
                    <div className="text-white/70 mt-1">{t.daily}</div>
                    <div className="text-white/90 font-medium mt-2">{t.hoursWeekend}</div>
                    <div className="text-white/70 mt-1">{t.daysWeekend}</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-body">
                    <div className="text-white/90 font-medium">{t.emergencyServices}</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Stay In Touch */}
            <div>
              <h3 className="font-semibold font-heading text-lg mb-6">{t.stayInTouch}</h3>
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
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs mb-4">
              <a href="/veterinary-clinic-riyadh.html" className="text-white/60 hover:text-white transition-colors">عيادة بيطرية في الرياض</a>
              <a href="/emergency-vet-riyadh-24.html" className="text-white/60 hover:text-white transition-colors">طوارئ بيطرية</a>
              <a href="/vet-hospital-qurtubah.html" className="text-white/60 hover:text-white transition-colors">مستشفى بيطري قرطبة</a>
              <a href="/cat-vaccination-riyadh.html" className="text-white/60 hover:text-white transition-colors">تطعيم القطط</a>
              <a href="/birds-reptiles-vet-riyadh.html" className="text-white/60 hover:text-white transition-colors">عيادة الطيور والزواحف</a>
              <a href="/jeddah-vet-clinic.html" className="text-white/60 hover:text-white transition-colors">جدة — قريباً</a>
              <a href="/blog/choose-vet-clinic-riyadh.html" className="text-white/60 hover:text-white transition-colors">المدونة</a>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <a href="/privacy.html" className="text-white/60 hover:text-white transition-colors">سياسة الخصوصية</a>
              <span className="text-white/40">|</span>
              <a href="/en.html" className="text-white/60 hover:text-white transition-colors">English</a>
            </div>
            <p className="text-center text-white/70 text-sm font-body mb-3">
              © {new Date().getFullYear()} {t.copyright}
            </p>
            <div className="text-center">
              <p className="text-white/60 text-xs font-body mb-1" data-testid="text-powered-by">
                {t.poweredBy}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs">
                <a 
                  href="tel:+966548336693"
                  className="text-white/60 hover:text-white transition-colors"
                  data-testid="link-dotvets-phone"
                >
                  {t.phone}
                </a>
                <span className="text-white/40">|</span>
                <a 
                  href="https://wa.me/966548336693"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1"
                  data-testid="link-dotvets-whatsapp"
                >
                  {t.whatsapp}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
