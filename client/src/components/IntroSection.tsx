import { ArrowRight } from "lucide-react";
import introImage from "@assets/generated_images/Veterinarian_holding_small_dog_1111faba.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { AnimatedContent, VIEWPORT_CONFIG_DEFAULT } from "./AnimatedContent";
import { motion } from "framer-motion";

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } }
};

export default function IntroSection() {
  const { language } = useLanguage();
  const t = translations[language].intro;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimatedContent variant="custom" customVariants={slideInLeft} viewport={VIEWPORT_CONFIG_DEFAULT}>
            <img
              src={introImage}
              alt="Veterinarian with dog"
              className="rounded-xl shadow-lg w-full h-auto"
              data-testid="img-intro"
            />
          </AnimatedContent>
          <AnimatedContent variant="custom" customVariants={slideInRight} viewport={VIEWPORT_CONFIG_DEFAULT}>
            <h2
              className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-primary mb-4"
              data-testid="text-intro-title"
            >
              {t.title}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6 font-heading">
              {t.subtitle}
            </p>
            <p className="text-base text-foreground leading-relaxed mb-8">
              {t.description}
            </p>
            <a
              href="/about"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              data-testid="link-read-more"
            >
              {t.readMore}
              <ArrowRight className="w-4 h-4" />
            </a>
          </AnimatedContent>
        </div>
      </div>
    </section>
  );
}
