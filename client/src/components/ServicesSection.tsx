import { Card } from "@/components/ui/card";
import { Stethoscope, Syringe, Heart, Scissors, ArrowRight } from "lucide-react";

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
    <section className="py-20 px-6 lg:px-8 bg-[#7dbfb8]/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl lg:text-4xl font-semibold text-foreground mb-4"
            data-testid="text-services-title"
          >
            What we offer?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            As a leading Riyadh veterinary clinic, we offer a comprehensive range of
            veterinary services to keep your furry companions happy and healthy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-6 hover-elevate transition-all duration-300 hover:scale-105"
              data-testid={`card-service-${index}`}
            >
              <div className="w-12 h-12 rounded-full bg-[#53a4d8]/10 flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-[#53a4d8]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm">{service.description}</p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/services"
            className="inline-flex items-center gap-2 text-[#53a4d8] hover:text-[#53a4d8]/80 font-medium transition-colors"
            data-testid="link-services-more"
          >
            Read more
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
