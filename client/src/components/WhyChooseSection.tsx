import { Card } from "@/components/ui/card";
import { Clock, Stethoscope, Wrench, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

const benefitIcons = [Clock, Stethoscope, Wrench, Heart];

function CountingNumber({ target, duration = 3 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isInView) {
      setCount(0);
      
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const updateCount = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);
        
        const easeInOutCubic = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const currentCount = Math.floor(easeInOutCubic * target);
        
        setCount(currentCount);

        if (now < endTime) {
          animationRef.current = requestAnimationFrame(updateCount);
        } else {
          setCount(target);
        }
      };

      animationRef.current = requestAnimationFrame(updateCount);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isInView, target, duration]);

  return (
    <div ref={ref} className="text-4xl lg:text-5xl font-bold font-heading text-primary">
      {count.toLocaleString()}
    </div>
  );
}

export default function WhyChooseSection() {
  const { language } = useLanguage();
  const t = translations[language].whyChoose;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-foreground mb-8 sm:mb-12"
            data-testid="text-why-title"
          >
            {t.title}
          </h2>

          <div className="mb-12">
            <p className="text-lg text-muted-foreground mb-8 font-body">
              {t.intro}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
              {t.statistics.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  className="text-center"
                  data-testid={`stat-item-${index}`}
                >
                  <CountingNumber target={stat.number} duration={3} />
                  <p className="text-base text-muted-foreground mt-3 font-body">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {t.benefits.map((benefit, index) => {
            const Icon = benefitIcons[index];
            return (
              <Card
                key={index}
                className="p-6 text-center hover-elevate"
                data-testid={`card-benefit-${index}`}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground font-body">{benefit.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
