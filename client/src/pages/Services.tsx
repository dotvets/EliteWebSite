import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { AnimatedContent } from "@/components/AnimatedContent";
import ContentWithMediaSection from "@/components/ContentWithMediaSection";
import PageLayout from "@/components/PageLayout";
import { createServicesSections, ServiceCard } from "@/data/servicesSections";

export default function Services() {
  const { language } = useLanguage();
  const t = translations[language].servicesPage;
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (key: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const sections = createServicesSections(t);

  return (
    <PageLayout>
      {sections.map((section) => {
        if (section.type === "hero") {
          return <div key={section.key}>{section.component}</div>;
        }

        if (section.type === "service-groups") {
          return (
            <div key={section.key} className="py-12 sm:py-16 md:py-20">
              {section.serviceGroups.map((group: any[], groupIndex: number) => (
                <div key={`group-${groupIndex}`}>
                  <section className="px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="max-w-7xl mx-auto overflow-x-hidden">
                      <AnimatedContent
                        variant="stagger"
                        viewport="stagger"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      >
                        {group.map((service) => (
                          <ServiceCard
                            key={service.key}
                            service={service}
                            expandedCards={expandedCards}
                            toggleCard={toggleCard}
                            t={t}
                          />
                        ))}
                      </AnimatedContent>
                    </div>
                  </section>

                  {groupIndex < section.serviceGroups.length - 1 && section.imageSections[groupIndex] && (
                    <div className="mb-12">
                      <ContentWithMediaSection
                        image={section.imageSections[groupIndex].image}
                        imageAlt={section.imageSections[groupIndex].imageAlt}
                        imageTestId={section.imageSections[groupIndex].imageTestId}
                        reverse={section.imageSections[groupIndex].reverse}
                        className="bg-muted/30"
                      >
                        <AnimatedContent className="space-y-4 text-center lg:text-start">
                          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-primary">
                            {section.imageSections[groupIndex].title}
                          </h2>
                          <p className="text-base sm:text-lg text-muted-foreground font-body">
                            {section.imageSections[groupIndex].description}
                          </p>
                        </AnimatedContent>
                      </ContentWithMediaSection>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }

        return null;
      })}
    </PageLayout>
  );
}
