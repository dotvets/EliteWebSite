import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Partner {
  name: string;
  image: string;
  width: string;
}

interface PartnerCarouselProps {
  partners: Partner[];
}

export function PartnerCarousel({ partners }: PartnerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % partners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [partners.length]);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + partners.length) % partners.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % partners.length);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="relative h-40 sm:h-48 md:h-56 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img
              src={partners[activeIndex].image}
              alt={partners[activeIndex].name}
              className={`${partners[activeIndex].width} h-auto object-contain`}
              data-testid={`img-partner-active-${partners[activeIndex].name.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center items-center gap-3 sm:gap-4 mt-8">
        <Button
          size="icon"
          variant="ghost"
          onClick={goToPrevious}
          className="rounded-full"
          data-testid="button-partner-prev"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex gap-3 sm:gap-4">
          {partners.map((partner, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === activeIndex ? "opacity-100 scale-100" : "opacity-40 scale-90 hover:opacity-60"
              }`}
              data-testid={`button-partner-indicator-${index}`}
            >
              <img
                src={partner.image}
                alt={partner.name}
                className="w-16 sm:w-20 h-auto object-contain"
              />
            </button>
          ))}
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={goToNext}
          className="rounded-full"
          data-testid="button-partner-next"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
