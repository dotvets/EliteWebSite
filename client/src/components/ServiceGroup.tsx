import { motion } from "framer-motion";
import { AnimatedContent } from "@/components/AnimatedContent";
import { fadeInUp } from "@/animations";
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
    <div className="px-4 sm:px-6 lg:px-8 mb-12">
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <AnimatedContent
          variant="staggerGrid"
          viewport="stagger"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => (
            <motion.div key={service.key} variants={fadeInUp}>
              <ServiceCard
                service={service}
                expandedCards={expandedCards}
                toggleCard={toggleCard}
                t={t}
              />
            </motion.div>
          ))}
        </AnimatedContent>
      </div>
    </div>
  );
}
