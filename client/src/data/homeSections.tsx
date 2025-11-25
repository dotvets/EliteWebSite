import { motion } from "framer-motion";
import { ArrowRight, Clock, Stethoscope as StethoscopeIcon, Wrench, Heart, Stethoscope, Syringe, Scissors } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedContent } from "@/components/AnimatedContent";
import { fadeInUp } from "@/animations";
import { SectionHeader } from "@/components/SectionHeader";
import { CountingNumber } from "@/components/CountingNumber";
import { BenefitCard } from "@/components/BenefitCard";
import { TeamMemberSlider } from "@/components/team-slider/TeamMemberSlider";
import { PartnerCard } from "@/components/PartnerCard";
import { ContactForm } from "@/components/ContactForm";
import introImage from "@assets/generated_images/Veterinarian_holding_small_dog_1111faba.png";
import vetsvanLogo from "@assets/Partners_vetsvan_1764085956349.png";
import wadiQortubaLogo from "@assets/Partners_wadi qourtobah_1764085956355.jpg";
import walaaaPlusLogo from "@assets/Partners_walaaa plus_1764085956356.png";
import wazenLogo from "@assets/Partners_wazen_1764085956358.jpg";

const serviceIcons = [Stethoscope, Syringe, Heart, Scissors];
const benefitIcons = [Clock, StethoscopeIcon, Wrench, Heart];

const partnerLogos = [
  { name: "VetsVan", image: vetsvanLogo, width: "w-56" },
  { name: "Wadi Qortuba", image: wadiQortubaLogo, width: "w-48" },
  { name: "Walaaa Plus", image: walaaaPlusLogo, width: "w-56" },
  { name: "Wazen", image: wazenLogo, width: "w-44" },
];

interface Translation {
  [key: string]: any;
}

export const createHomeSections = (t: Translation) => [
  {
    key: "intro",
    className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-background",
    content: (
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <AnimatedContent variant="slideRight">
            <img
              src={introImage}
              alt="Veterinarian with dog"
              className="rounded-xl shadow-lg w-full h-auto"
              data-testid="img-intro"
            />
          </AnimatedContent>
          <AnimatedContent variant="slideLeft">
            <h2
              className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-primary mb-4"
              data-testid="text-intro-title"
            >
              {t.intro.title}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6 font-heading">
              {t.intro.subtitle}
            </p>
            <p className="text-base text-foreground leading-relaxed mb-8">
              {t.intro.description}
            </p>
            <a
              href="/about"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              data-testid="link-read-more"
            >
              {t.intro.readMore}
              <ArrowRight className="w-4 h-4" />
            </a>
          </AnimatedContent>
        </div>
      </div>
    ),
  },
  {
    key: "services",
    className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30",
    content: (
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <AnimatedContent variant="fadeInUp" className="text-center mb-12">
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-foreground mb-4"
            data-testid="text-services-title"
          >
            {t.services.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.services.description}
          </p>
        </AnimatedContent>

        <AnimatedContent variant="staggerGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {t.services.items.map((service: any, index: number) => {
            const Icon = serviceIcons[index];
            return (
              <motion.div key={index} variants={fadeInUp}>
                <Card
                  className="p-6 hover-elevate transition-all duration-300 h-full"
                  data-testid={`card-service-${index}`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold font-heading text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </AnimatedContent>

        <AnimatedContent variant="fadeIn" className="text-center">
          <a
            href="/services"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            data-testid="link-services-more"
          >
            {t.services.readMore}
            <ArrowRight className="w-4 h-4" />
          </a>
        </AnimatedContent>
      </div>
    ),
  },
  {
    key: "why-choose",
    className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-background",
    content: (
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <div className="text-center mb-16">
          <SectionHeader title={t.whyChoose.title} titleTestId="text-why-title" className="mb-8 sm:mb-12" />

          <div className="mb-12">
            <p className="text-lg text-muted-foreground mb-8 font-body">
              {t.whyChoose.intro}
            </p>

            <AnimatedContent variant="staggerGrid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
              {t.whyChoose.statistics.map((stat: any, index: number) => (
                <motion.div key={index} variants={fadeInUp} className="text-center" data-testid={`stat-item-${index}`}>
                  <CountingNumber target={stat.number} duration={3} />
                  <p className="text-base text-muted-foreground mt-3 font-body">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </AnimatedContent>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {t.whyChoose.benefits.map((benefit: any, index: number) => (
            <BenefitCard
              key={index}
              icon={benefitIcons[index]}
              title={benefit.title}
              description={benefit.description}
              testId={`card-benefit-${index}`}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "team",
    className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30",
    content: (
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <SectionHeader 
          title={t.team.title} 
          description={t.team.description} 
          titleTestId="text-team-title" 
        />

        <AnimatedContent variant="fadeInUp" className="mt-8">
          <TeamMemberSlider members={t.team.members} />
        </AnimatedContent>
      </div>
    ),
  },
  {
    key: "partners",
    className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-background",
    content: (
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <SectionHeader title={t.partners.title} titleTestId="text-partners-title" />

        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 md:gap-16 mt-12">
          {partnerLogos.map((partner, index) => (
            <PartnerCard 
              key={index} 
              name={partner.name} 
              image={partner.image} 
              width={partner.width}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "contact",
    className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30",
    content: (
      <div className="max-w-2xl mx-auto overflow-x-hidden">
        <SectionHeader 
          title={t.contact.title} 
          description={t.contact.description} 
          titleTestId="text-contact-title" 
        />

        <AnimatedContent variant="fadeInUp">
          <ContactForm translations={t.contact} />
        </AnimatedContent>
      </div>
    ),
  },
];
