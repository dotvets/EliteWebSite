import { motion } from "framer-motion";
import { ArrowRight, Clock, Stethoscope as StethoscopeIcon, Wrench, Heart, Stethoscope, Syringe, Scissors } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedContent, VIEWPORT_CONFIG_DEFAULT } from "@/components/AnimatedContent";
import { SectionHeader } from "@/components/SectionHeader";
import { CountingNumber } from "@/components/CountingNumber";
import { BenefitCard } from "@/components/BenefitCard";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { PartnerCard } from "@/components/PartnerCard";
import { ContactForm } from "@/components/ContactForm";
import introImage from "@assets/generated_images/Veterinarian_holding_small_dog_1111faba.png";

const serviceIcons = [Stethoscope, Syringe, Heart, Scissors];
const benefitIcons = [Clock, StethoscopeIcon, Wrench, Heart];

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } }
};

interface Translation {
  [key: string]: any;
}

export const createHomeSections = (t: Translation) => [
  {
    key: "intro",
    className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8",
    content: (
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
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-foreground mb-4"
            data-testid="text-services-title"
          >
            {t.services.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.services.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {t.services.items.map((service: any, index: number) => {
            const Icon = serviceIcons[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: false, amount: 0.3 }}
              >
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
            {t.services.readMore}
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    ),
  },
  {
    key: "why-choose",
    className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8",
    content: (
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <div className="text-center mb-16">
          <SectionHeader title={t.whyChoose.title} titleTestId="text-why-title" className="mb-8 sm:mb-12" />

          <div className="mb-12">
            <p className="text-lg text-muted-foreground mb-8 font-body">
              {t.whyChoose.intro}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
              {t.whyChoose.statistics.map((stat: any, index: number) => (
                <AnimatedContent
                  key={index}
                  variant="custom"
                  customVariants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } }
                  }}
                  viewport={{ once: false, amount: 0.5 }}
                  className="text-center"
                >
                  <div data-testid={`stat-item-${index}`}>
                    <CountingNumber target={stat.number} duration={3} />
                    <p className="text-base text-muted-foreground mt-3 font-body">
                      {stat.label}
                    </p>
                  </div>
                </AnimatedContent>
              ))}
            </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {t.team.members.map((member: any, index: number) => (
            <AnimatedContent
              key={index}
              variant="custom"
              customVariants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: index * 0.1 } }
              }}
            >
              <TeamMemberCard
                name={member.name}
                role={member.role}
                initials={member.initials}
                testId={`card-team-${index}`}
              />
            </AnimatedContent>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "partners",
    className: "py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8",
    content: (
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <SectionHeader title={t.partners.title} titleTestId="text-partners-title" />

        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8">
          {t.partners.items.map((partner: string, index: number) => (
            <AnimatedContent
              key={index}
              variant="custom"
              customVariants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: index * 0.2 } }
              }}
            >
              <PartnerCard name={partner} />
            </AnimatedContent>
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

        <AnimatedContent
          variant="custom"
          customVariants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }
          }}
        >
          <ContactForm translations={t.contact} />
        </AnimatedContent>
      </div>
    ),
  },
];
