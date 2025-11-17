import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { HeroOverlay } from "./HeroOverlay";
import { HeroContent } from "./HeroContent";
import heroVideo from "@assets/hero side video 1_1763369460755.mp4";

export default function HeroVideo() {
  const { language } = useLanguage();
  const t = translations[language].hero;
  
  const heroData = t.slides?.[0] || { 
    title: "Expert Veterinary Care, Tailored to Your Pet's Needs", 
    subtitle: "A Pioneering Veterinary Clinic, Providing Exceptional Care Every Step of the Way" 
  };
  const ctaText = t.cta || "Book an Appointment Now";

  return (
    <div className="relative min-h-[450px] h-[60vh] sm:h-[500px] md:h-[550px] lg:h-[700px] w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="video-hero-background"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      <HeroOverlay />
      
      <HeroContent
        title={heroData.title}
        subtitle={heroData.subtitle}
        ctaText={ctaText}
      />
    </div>
  );
}
