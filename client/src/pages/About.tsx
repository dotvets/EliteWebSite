import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { CheckCircle2 } from "lucide-react";
import ContentWithMediaSection from "@/components/ContentWithMediaSection";
import PageLayout from "@/components/PageLayout";
import { AnimatedContent, fadeInUp } from "@/components/AnimatedContent";
import { FeatureCard } from "@/components/FeatureCard";
import { createAboutSections } from "@/data/aboutSections";

export default function About() {
  const { language } = useLanguage();
  const t = translations[language].about;
  const partners = translations[language].partners;

  const sections = createAboutSections(t, partners);

  return (
    <PageLayout dataTestId="page-about">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <AnimatedContent className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4 sm:mb-6 text-primary" data-testid="text-about-hero-title">
            {t.hero.title}
          </h1>
        </AnimatedContent>
      </section>

      {/* Mapped Sections with Side-by-Side Layout */}
      {sections.map(({ key, content, ...sectionProps }) => (
        <div key={key}>
          <ContentWithMediaSection {...sectionProps}>
            {content}
          </ContentWithMediaSection>
          {/* Why Choose Elite Vet Cards - Centered Below */}
          {key === "why-choose" && (
            <section className="bg-background pt-0 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8">
              <AnimatedContent variant="stagger" viewport="stagger" className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {t.whyChoose.points.map((point: any, index: number) => (
                    <motion.div key={index} variants={fadeInUp} className="h-full">
                      <FeatureCard
                        title={point.title}
                        description={point.description}
                        icon={CheckCircle2}
                        variant="compact"
                        testId={`card-why-choose-${index}`}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatedContent>
            </section>
          )}
        </div>
      ))}
    </PageLayout>
  );
}
