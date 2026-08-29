import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import HeroVideo from "@/components/HeroVideo";
import OffersSection from "@/components/home/OffersSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ECGAnimation from "@/components/ECGAnimation";
import HeartbeatDivider from "@/components/HeartbeatDivider";
import PageLayout from "@/components/PageLayout";
import { createHomeSections } from "@/data/homeSections";
import { useHomeSectionsConfig, arrangeSections, useHomeTexts, applyTextOverrides } from "@/hooks/useHomeSections";

export default function Home() {
  const { language } = useLanguage();
  const homeTexts = useHomeTexts();
  const t = applyTextOverrides(translations[language], homeTexts, language);

  const cfg = useHomeSectionsConfig();
  const dbSections = [
    { key: "offers", className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-background", content: <OffersSection /> },
    { key: "testimonials", className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30", content: <TestimonialsSection /> },
  ];
  const sections = arrangeSections([...createHomeSections(t), ...dbSections], cfg);

  return (
    <PageLayout dataTestId="page-home">
      {!cfg.heroHidden && <HeroVideo />}
      <ECGAnimation />
      
      {/* Mapped Sections */}
      {sections.map(({ key, className, content }) => (
        <section key={key} className={className}>
          {content}
        </section>
      ))}
      
      <HeartbeatDivider />
    </PageLayout>
  );
}
