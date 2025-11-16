import { AnimatedContent } from "@/components/AnimatedContent";
import { ServiceCard } from "@/data/servicesSections";

interface ServiceGroupProps {
  services: any[];
  expandedCards: Record<string, boolean>;
  toggleCard: (key: string) => void;
  t: any;
}

export default function ServiceGroup({
  services,
  expandedCards,
  toggleCard,
  t
}: ServiceGroupProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 mb-12">
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <AnimatedContent
          variant="stagger"
          viewport="stagger"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => (
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
  );
}
