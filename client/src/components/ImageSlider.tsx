import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageSliderProps {
  images: string[];
  autoplayDelay?: number;
  className?: string;
}

export function ImageSlider({ images, autoplayDelay = 4000, className = "" }: ImageSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance the slider
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setSelectedIndex((current) => (current + 1) % images.length);
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [images.length, autoplayDelay, isPaused]);

  // Resume autoplay after manual interaction
  useEffect(() => {
    if (!isPaused) return;
    
    const resumeTimer = setTimeout(() => {
      setIsPaused(false);
    }, autoplayDelay * 2);

    return () => clearTimeout(resumeTimer);
  }, [isPaused, autoplayDelay]);

  const scrollTo = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsPaused(true);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Image Container with Enhanced Styling */}
      <div className="relative w-full bg-card rounded-2xl overflow-hidden shadow-2xl border border-border/50 p-2 sm:p-3">
        <div className="relative w-full overflow-hidden rounded-xl bg-muted/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full"
            >
              <img
                src={images[selectedIndex]}
                alt={`Slide ${selectedIndex + 1}`}
                className="w-full h-auto object-cover aspect-[4/3] sm:aspect-[16/10]"
                style={{
                  filter: 'brightness(1.05) contrast(1.1) saturate(1.15)',
                }}
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            data-testid={`button-slide-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
