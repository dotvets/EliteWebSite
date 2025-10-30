import { Card } from "@/components/ui/card";
import { Stethoscope, Syringe, Heart, Scissors, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: Stethoscope,
    title: "Routine Check-ups",
    description: "Comprehensive health examinations for your pets",
  },
  {
    icon: Syringe,
    title: "Vaccinations",
    description: "Essential vaccines to protect your pet's health",
  },
  {
    icon: Heart,
    title: "Medical Care",
    description: "Advanced treatment for various health conditions",
  },
  {
    icon: Scissors,
    title: "Surgical Services",
    description: "Expert surgical procedures with modern equipment",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2
            className="text-3xl lg:text-4xl font-bold font-heading text-foreground mb-4"
            data-testid="text-services-title"
          >
            What we offer?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            As a leading Riyadh veterinary clinic, we offer a comprehensive range of
            veterinary services to keep your furry companions happy and healthy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: false, amount: 0.3 }}
            >
              <Card
                className="p-6 hover-elevate transition-all duration-300 hover:scale-105 h-full"
                data-testid={`card-service-${index}`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-heading text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <a
            href="/services"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            data-testid="link-services-more"
          >
            Read more
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
