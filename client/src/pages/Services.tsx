import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import PageLayout from "@/components/PageLayout";
import { useExpandableCards } from "@/hooks/useExpandableCards";
import { createServicesSections } from "@/data/servicesSections";

export default function Services() {
  const { language } = useLanguage();
  const t = translations[language].servicesPage;
  const { expandedCards, toggleCard } = useExpandableCards();

  const sections = createServicesSections(t, expandedCards, toggleCard);

  return (
    <PageLayout dataTestId="page-services">
      {sections.map(({ key, content }) => (
        <div key={key}>
          {content}
        </div>
      ))}
    </PageLayout>
  );
}
