import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import HeroVideo from "@/components/HeroVideo";
import ECGAnimation from "@/components/ECGAnimation";
import HeartbeatDivider from "@/components/HeartbeatDivider";
import PageLayout from "@/components/PageLayout";
import { createHomeSections } from "@/data/homeSections";

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  const sections = createHomeSections(t);

  return (
    <PageLayout dataTestId="page-home">
      <HeroVideo />
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
