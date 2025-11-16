import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import ContentWithMediaSection from "@/components/ContentWithMediaSection";
import PageLayout from "@/components/PageLayout";
import { AnimatedContent } from "@/components/AnimatedContent";
import { createAboutSections } from "@/data/aboutSections";

export default function About() {
  const { language } = useLanguage();
  const t = translations[language].about;
  const partners = translations[language].partners;

  const sections = createAboutSections(t, partners);

  return (
    <PageLayout dataTestId="page-about">
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <AnimatedContent className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4 sm:mb-6 text-primary" data-testid="text-about-hero-title">
            {t.hero.title}
          </h1>
        </AnimatedContent>
      </section>

      {sections.map(({ key, content, ...sectionProps }) => (
        <ContentWithMediaSection key={key} {...sectionProps}>
          {content}
        </ContentWithMediaSection>
      ))}
    </PageLayout>
  );
}
