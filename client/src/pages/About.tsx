import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import ContentWithMediaSection from "@/components/ContentWithMediaSection";
import PageLayout from "@/components/PageLayout";
import { AnimatedContent } from "@/components/AnimatedContent";
import { createAboutSections } from "@/data/aboutSections";
import heroImage from "@assets/freepik__img1i-want-you-to-make-the-attached-image-more-bea__64912_1762857524224.png";

export default function About() {
  const { language } = useLanguage();
  const t = translations[language].about;
  const partners = translations[language].partners;

  const sections = createAboutSections(t, partners);

  return (
    <PageLayout dataTestId="page-about">
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <AnimatedContent variant="fadeInUpSoft" className="text-center lg:text-start ltr:lg:text-left rtl:lg:text-right">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4 sm:mb-6 text-primary" data-testid="text-about-hero-title">
                {t.hero.title}
              </h1>
            </AnimatedContent>

            <AnimatedContent variant="zoomInSoft" className="overflow-hidden">
              <div className="overflow-hidden rounded-lg sm:rounded-xl shadow-lg">
                <img
                  src={heroImage}
                  alt={t.hero.title}
                  className="w-full h-auto object-cover aspect-[4/3]"
                  data-testid="img-about-hero"
                />
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {sections.map(({ key, content, ...sectionProps }) => (
        <ContentWithMediaSection key={key} {...sectionProps}>
          {content}
        </ContentWithMediaSection>
      ))}
    </PageLayout>
  );
}
