import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { SectionHeader } from "./SectionHeader";
import { ContactForm } from "./ContactForm";
import { AnimatedContent } from "./AnimatedContent";

export default function ContactSection() {
  const { language } = useLanguage();
  const t = translations[language].contact;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-2xl mx-auto overflow-x-hidden">
        <SectionHeader 
          title={t.title} 
          description={t.description} 
          titleTestId="text-contact-title" 
        />

        <AnimatedContent
          variant="custom"
          customVariants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }
          }}
        >
          <ContactForm translations={t} />
        </AnimatedContent>
      </div>
    </section>
  );
}
