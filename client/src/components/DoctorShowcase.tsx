import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Doctor {
  name: string;
  initials: string;
  image: string;
}

interface DoctorShowcaseProps {
  doctors: Doctor[];
  autoplayDelay?: number;
  className?: string;
}

export function DoctorShowcase({ doctors, autoplayDelay = 5000, className = "" }: DoctorShowcaseProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance the showcase
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setSelectedIndex((current) => (current + 1) % doctors.length);
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [doctors.length, autoplayDelay, isPaused]);

  // Resume autoplay after manual interaction
  useEffect(() => {
    if (!isPaused) return;
    
    const resumeTimer = setTimeout(() => {
      setIsPaused(false);
    }, autoplayDelay * 2);

    return () => clearTimeout(resumeTimer);
  }, [isPaused, autoplayDelay]);

  const goToNext = useCallback(() => {
    setSelectedIndex((current) => (current + 1) % doctors.length);
    setIsPaused(true);
  }, [doctors.length]);

  const goToPrevious = useCallback(() => {
    setSelectedIndex((current) => (current - 1 + doctors.length) % doctors.length);
    setIsPaused(true);
  }, [doctors.length]);

  const goToSlide = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsPaused(true);
  }, []);

  const currentDoctor = doctors[selectedIndex];

  return (
    <div className={`relative ${className}`}>
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Doctor Info - Left Side */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${selectedIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-start"
          >
            <h3 className="text-3xl sm:text-4xl font-bold font-heading text-primary mb-4" data-testid={`text-doctor-name-${selectedIndex}`}>
              {currentDoctor.name}
            </h3>
            
            {/* Navigation Arrows */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-8">
              <button
                onClick={goToPrevious}
                className="p-2 rounded-full bg-muted hover-elevate active-elevate-2 transition-all"
                aria-label="Previous doctor"
                data-testid="button-previous-doctor"
              >
                <ChevronLeft className="w-6 h-6 text-primary" />
              </button>
              <button
                onClick={goToNext}
                className="p-2 rounded-full bg-muted hover-elevate active-elevate-2 transition-all"
                aria-label="Next doctor"
                data-testid="button-next-doctor"
              >
                <ChevronRight className="w-6 h-6 text-primary" />
              </button>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center lg:justify-start gap-2 mt-6">
              {doctors.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === selectedIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to doctor ${index + 1}`}
                  data-testid={`button-doctor-${index}`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Doctor Image - Right Side */}
        <div className="relative w-full">
          <div className="relative w-full bg-card rounded-2xl overflow-hidden shadow-2xl border border-border/50 p-2 sm:p-3">
            <div className="relative w-full overflow-hidden rounded-xl bg-muted/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`image-${selectedIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full"
                >
                  <img
                    src={currentDoctor.image}
                    alt={currentDoctor.name}
                    className="w-full h-auto object-contain"
                    loading="eager"
                    data-testid={`img-doctor-${selectedIndex}`}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
