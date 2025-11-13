import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import introImage from "@assets/generated_images/Veterinarian_holding_small_dog_1111faba.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

export default function IntroSection() {
  const { language } = useLanguage();
  const t = translations[language].intro;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <img
              src={introImage}
              alt="Veterinarian with dog"
              className="rounded-xl shadow-lg w-full h-auto"
              data-testid="img-intro"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false, amount: 0.3 }}
          >
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
