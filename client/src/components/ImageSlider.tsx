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
      {/* Image Container with Fixed Aspect Ratio */}
      <div className="relative w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full"
          >
            <img
              src={images[selectedIndex]}
              alt={`Slide ${selectedIndex + 1}`}
              className="w-full h-auto rounded-xl shadow-lg object-cover"
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>
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
