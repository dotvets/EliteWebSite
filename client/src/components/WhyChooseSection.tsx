import { Card } from "@/components/ui/card";
import { User, Cpu, Heart, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: User,
    title: "Personalized Care",
    description: "Tailored treatment plans for each pet",
  },
  {
    icon: Cpu,
    title: "Latest Technology",
    description: "Cutting-edge equipment for accurate diagnosis",
  },
  {
    icon: Heart,
    title: "Compassionate Staff",
    description: "A dedicated team that loves animals",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl lg:text-4xl font-bold font-heading text-foreground mb-6"
            data-testid="text-why-title"
          >
            Why choose us?
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            As a trusted name in the Riyadh veterinary community since 2013, we've
            helped more than
          </p>
          <div
            className="text-5xl lg:text-6xl font-bold font-heading text-primary mb-8"
            data-testid="text-pets-count"
          >
            200,000,000
          </div>
          <p className="text-lg text-muted-foreground">pets through:</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="p-8 text-center hover-elevate"
              data-testid={`card-benefit-${index}`}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/about"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            data-testid="link-why-more"
          >
            Read More
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
