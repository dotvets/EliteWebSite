import { Card } from "@/components/ui/card";
import { Clock, Stethoscope, Wrench, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const benefits = [
  {
    icon: Clock,
    title: "24/7 Emergency Care",
    description: "Round-the-clock emergency services for your pets",
  },
  {
    icon: Stethoscope,
    title: "Expert Veterinarians",
    description: "Highly qualified and experienced veterinary professionals",
  },
  {
    icon: Wrench,
    title: "Modern Equipment",
    description: "State-of-the-art diagnostic and treatment technology",
  },
  {
    icon: Heart,
    title: "Compassionate Care",
    description: "A dedicated team that loves and cares for animals",
  },
];

const statistics = [
  {
    number: 200000,
    label: "Pet cases examined",
  },
  {
    number: 1000,
    label: "CT Scan cases",
  },
  {
    number: 70000,
    label: "Lab tests and X-ray cases",
  },
];

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
    <div ref={ref} className="text-5xl lg:text-6xl font-bold font-heading text-primary">
      {count.toLocaleString()}
    </div>
  );
}

export default function WhyChooseSection() {
  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl lg:text-4xl font-bold font-heading text-foreground mb-12"
            data-testid="text-why-title"
          >
            Why choose us?
          </h2>

          <div className="mb-12">
            <p className="text-lg text-muted-foreground mb-8 font-body">
              As a trusted name in the Riyadh veterinary community since 2013, we've helped more than
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {statistics.map((stat, index) => (
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

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="p-6 text-center hover-elevate"
              data-testid={`card-benefit-${index}`}
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground font-body">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
