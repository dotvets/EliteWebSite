import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import ContentWithMediaSection from "@/components/ContentWithMediaSection";
import PageLayout from "@/components/PageLayout";
import { HeroImage } from "@/components/hero-video/HeroImage";
import { createAboutSections } from "@/data/aboutSections";
import heroImage from "@assets/freepik__img1i-want-you-to-make-the-attached-image-more-bea__64912_1762857524224.png";

export default function About() {
  const { language } = useLanguage();
  const t = translations[language].about;
  const partners = translations[language].partners;

  const sections = createAboutSections(t, partners);

  return (
    <PageLayout dataTestId="page-about">
      <HeroImage 
        image={heroImage} 
        title={t.hero.title}
        alt={t.hero.title}
      />

      {sections.map(({ key, content, ...sectionProps }) => (
        <ContentWithMediaSection key={key} {...sectionProps}>
          {content}
        </ContentWithMediaSection>
      ))}
    </PageLayout>
  );
}
