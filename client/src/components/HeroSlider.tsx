import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import heroImage1 from "@assets/generated_images/Veterinarian_examining_golden_retriever_66fcde95.png";
import heroImage2 from "@assets/freepik__img1i-want-you-to-make-the-attached-image-more-bea__64912_1762857524224.png";
import heroImage3 from "@assets/generated_images/Happy_pet_owner_with_cat_0ee67349.png";

const slides = [
  {
    image: heroImage1,
    title: "Expert Veterinary Care, Tailored to Your Pet's Needs",
    subtitle: "A Pioneering Veterinary Clinic, Providing Exceptional Care Every Step of the Way",
  },
  {
    image: heroImage2,
    title: "State-of-the-Art Facilities",
    subtitle: "Modern Equipment and Technology for Accurate Diagnosis and Treatment",
  },
  {
    image: heroImage3,
    title: "Happy Pets, Happy Owners",
    subtitle: "Trusted by Pet Owners Across Riyadh Since 2013",
  },
];

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative h-[600px] lg:h-[700px] w-full overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="max-w-4xl mx-auto px-6 text-center">
                  <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-6"
                    data-testid={`text-hero-title-${index}`}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className="text-lg md:text-xl text-white/95 mb-8"
                    data-testid={`text-hero-subtitle-${index}`}
                  >
                    {slide.subtitle}
                  </p>
                  <Button
                    size="lg"
                    className="bg-primary/20 backdrop-blur-md border-2 border-white/30 text-white hover:bg-primary/30"
                    data-testid="button-hero-cta"
                  >
                    Book an Appointment Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
        data-testid="button-slider-prev"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
        data-testid="button-slider-next"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === selectedIndex
                ? "bg-primary w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            data-testid={`button-indicator-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
