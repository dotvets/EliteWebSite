import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { useHeroSlider } from "./useHeroSlider";
import { SlideItem } from "./SlideItem";
import { SliderNavigation } from "./SliderNavigation";
import { SliderIndicators } from "./SliderIndicators";

import heroImage1 from "@assets/generated_images/Veterinarian_examining_golden_retriever_66fcde95.png";
import heroImage2 from "@assets/freepik__img1i-want-you-to-make-the-attached-image-more-bea__64912_1762857524224.png";
import heroImage3 from "@assets/generated_images/Happy_pet_owner_with_cat_0ee67349.png";

const images = [heroImage1, heroImage2, heroImage3];

export default function HeroSlider() {
  const { language } = useLanguage();
  const t = translations[language].hero;
  
  const { emblaRef, selectedIndex, scrollPrev, scrollNext, scrollTo } = useHeroSlider({ language });

  const slides = t.slides.map((slide, index) => ({
    ...slide,
    image: images[index % images.length]
  }));

  return (
    <div className="relative min-h-[450px] h-[60vh] sm:h-[500px] md:h-[550px] lg:h-[700px] w-full" key={language}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <SlideItem
              key={index}
              image={slide.image}
              title={slide.title}
              subtitle={slide.subtitle}
              ctaText={t.cta}
              index={index}
            />
          ))}
        </div>
      </div>

      <SliderNavigation onPrev={scrollPrev} onNext={scrollNext} />
      
      <SliderIndicators 
        count={slides.length} 
        selectedIndex={selectedIndex} 
        onSelect={scrollTo} 
      />
    </div>
  );
}
