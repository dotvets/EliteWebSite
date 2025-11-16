import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { SectionHeader } from "./SectionHeader";
import { PartnerCard } from "./PartnerCard";
import { AnimatedContent } from "./AnimatedContent";

export default function PartnersSection() {
  const { language } = useLanguage();
  const t = translations[language].partners;

  const partners = ["Vest Van", "Elite Falcons"];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <SectionHeader title={t.title} titleTestId="text-partners-title" />

        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8">
          {partners.map((partner, index) => (
            <AnimatedContent
              key={index}
              variant="custom"
              customVariants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: index * 0.2 } }
              }}
            >
              <PartnerCard name={partner} />
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}
