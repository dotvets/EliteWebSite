import { Clock, Stethoscope, Wrench, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { SectionHeader } from "./SectionHeader";
import { CountingNumber } from "./CountingNumber";
import { BenefitCard } from "./BenefitCard";
import { AnimatedContent } from "./AnimatedContent";

const benefitIcons = [Clock, Stethoscope, Wrench, Heart];

export default function WhyChooseSection() {
  const { language } = useLanguage();
  const t = translations[language].whyChoose;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <div className="text-center mb-16">
          <SectionHeader title={t.title} titleTestId="text-why-title" className="mb-8 sm:mb-12" />

          <div className="mb-12">
            <p className="text-lg text-muted-foreground mb-8 font-body">
              {t.intro}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
              {t.statistics.map((stat, index) => (
                <AnimatedContent
                  key={index}
                  variant="custom"
                  customVariants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } }
                  }}
                  viewport={{ once: false, amount: 0.5 }}
                  className="text-center"
                >
                  <div data-testid={`stat-item-${index}`}>
                    <CountingNumber target={stat.number} duration={3} />
                    <p className="text-base text-muted-foreground mt-3 font-body">
                      {stat.label}
                    </p>
                  </div>
                </AnimatedContent>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {t.benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefitIcons[index]}
              title={benefit.title}
              description={benefit.description}
              testId={`card-benefit-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
