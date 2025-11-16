import { motion } from "framer-motion";
import { 
  Stethoscope, 
  Scissors, 
  FlaskConical, 
  Syringe,
  Pill,
  Heart,
  Plane,
  Home as HomeIcon,
  Activity,
  Ambulance,
  Phone,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedContent, fadeInUp } from "@/components/AnimatedContent";
import heroBackgroundImg from "@assets/freepik__img1-make-background-fully-white-remove-shadows-re__83842_1763051566185.png";
import medicalSpecialtiesImg from "@assets/stock_images/veterinarian_examini_bffcd340.jpg";
import surgeryImg from "@assets/stock_images/veterinary_surgery_o_7559b1f2.jpg";
import diagnosticImg from "@assets/stock_images/veterinary_diagnosti_473733b0.jpg";

interface Translation {
  [key: string]: any;
}

const serviceIcons: Record<string, React.ComponentType<any>> = {
  "medical-specialties": Stethoscope,
  "hygiene-care": Scissors,
  "diagnostic-tests": FlaskConical,
  "medical-surgeries": Activity,
  "dental-services": Syringe,
  "vaccinations": Pill,
  "pet-travel": Plane,
  "boarding": HomeIcon,
  "intensive-care": Heart,
  "emergency": Ambulance,
  "home-care": Phone,
};

const renderServiceList = (services: Array<{ title: string; description: string }>) => (
  <div className="space-y-3 mt-4">
    {services.map((service, index) => (
      <div key={index} className="pl-3">
        <h5 className="font-semibold text-foreground text-sm font-heading">
          {service.title}
        </h5>
        <p className="text-xs text-muted-foreground font-body mt-1">
          {service.description}
        </p>
      </div>
    ))}
  </div>
);

const renderWhyChoose = (whyChoose: { title: string; points: Array<{ title: string; description: string }> }) => (
  <div className="mt-4">
    <h5 className="font-semibold text-foreground text-sm mb-3 font-heading">
      {whyChoose.title}
    </h5>
    <ul className="space-y-2">
      {whyChoose.points.map((point, index) => (
        <li key={index} className="flex items-start gap-2 text-xs">
          <span className="text-primary mt-0.5">●</span>
          <div>
            <span className="font-semibold text-foreground">{point.title}:</span>{" "}
            <span className="text-muted-foreground font-body">{point.description}</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export const createServicesSections = (t: Translation) => {
  const serviceCards = [
    {
      key: "medical-specialties",
      icon: serviceIcons["medical-specialties"],
      title: t.medicalSpecialties.title,
      intro: t.medicalSpecialties.intro,
      hasSubtitle: true,
      subtitle: t.medicalSpecialties.subtitle,
      content: () => renderServiceList(t.medicalSpecialties.services),
    },
    {
      key: "hygiene-care",
      icon: serviceIcons["hygiene-care"],
      title: t.hygieneCare.title,
      intro: t.hygieneCare.intro,
      content: () => (
        <>
          {renderWhyChoose(t.hygieneCare.whyChoose)}
          {renderServiceList(t.hygieneCare.services)}
        </>
      ),
    },
    {
      key: "diagnostic-tests",
      icon: serviceIcons["diagnostic-tests"],
      title: t.diagnosticTests.title,
      intro: t.diagnosticTests.intro,
      content: () => (
        <>
          {renderWhyChoose(t.diagnosticTests.whyChoose)}
          {renderServiceList(t.diagnosticTests.services)}
        </>
      ),
    },
    {
      key: "medical-surgeries",
      icon: serviceIcons["medical-surgeries"],
      title: t.medicalSurgeries.title,
      intro: t.medicalSurgeries.intro,
      content: () => (
        <>
          {renderWhyChoose(t.medicalSurgeries.whyChoose)}
          {renderServiceList(t.medicalSurgeries.services)}
        </>
      ),
    },
    {
      key: "dental-services",
      icon: serviceIcons["dental-services"],
      title: t.dentalServices.title,
      intro: t.dentalServices.intro,
      content: () => (
        <>
          {renderWhyChoose(t.dentalServices.whyChoose)}
          {renderServiceList(t.dentalServices.services)}
        </>
      ),
    },
    {
      key: "vaccinations",
      icon: serviceIcons["vaccinations"],
      title: t.vaccinations.title,
      intro: t.vaccinations.intro,
      content: () => (
        <>
          <p className="text-sm text-muted-foreground font-body mt-4">
            {t.vaccinations.whyVaccinate}
          </p>
          {renderServiceList(t.vaccinations.services)}
        </>
      ),
    },
    {
      key: "pet-travel",
      icon: serviceIcons["pet-travel"],
      title: t.petTravel.title,
      intro: t.petTravel.intro,
      content: () => renderServiceList(t.petTravel.services),
    },
    {
      key: "boarding",
      icon: serviceIcons["boarding"],
      title: t.boarding.title,
      intro: t.boarding.intro,
      content: () => renderServiceList(t.boarding.services),
    },
    {
      key: "intensive-care",
      icon: serviceIcons["intensive-care"],
      title: t.intensiveCare.title,
      intro: t.intensiveCare.intro,
      content: () => renderServiceList(t.intensiveCare.services),
    },
    {
      key: "emergency",
      icon: serviceIcons["emergency"],
      title: t.emergency.title,
      intro: t.emergency.intro,
      isEmergency: true,
      content: () => renderServiceList(t.emergency.services),
    },
    {
      key: "home-care",
      icon: serviceIcons["home-care"],
      title: t.homeCare.title,
      intro: t.homeCare.intro,
      content: () => renderServiceList(t.homeCare.services),
    },
  ];

  const serviceGroups = [
    serviceCards.slice(0, 3),
    serviceCards.slice(3, 6),
    serviceCards.slice(6, 9),
    serviceCards.slice(9, 11),
  ];

  const imageSections = [
    {
      image: medicalSpecialtiesImg,
      imageAlt: "Elite Vet medical specialties",
      imageTestId: "img-section-medical",
      reverse: false,
      title: t.imageSections.medical.title,
      description: t.imageSections.medical.description,
    },
    {
      image: surgeryImg,
      imageAlt: "Surgical procedures at Elite Vet",
      imageTestId: "img-section-surgery",
      reverse: true,
      title: t.imageSections.surgery.title,
      description: t.imageSections.surgery.description,
    },
    {
      image: diagnosticImg,
      imageAlt: "Diagnostic services",
      imageTestId: "img-section-diagnostic",
      reverse: false,
      title: t.imageSections.emergency.title,
      description: t.imageSections.emergency.description,
    },
  ];

  return [
    {
      key: "hero",
      type: "hero" as const,
      component: (
        <section 
          className="relative py-20 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
          style={{
            backgroundImage: `url(${heroBackgroundImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="relative z-10 max-w-7xl mx-auto overflow-x-hidden">
            <AnimatedContent 
              variant="fadeInUp" 
              viewport="default"
              className="text-center max-w-4xl mx-auto"
            >
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-primary mb-6"
                data-testid="text-services-hero-title"
              >
                {t.hero.title}
              </h1>
              <p
                className="text-lg sm:text-xl text-foreground/80 font-body"
                data-testid="text-services-hero-description"
              >
                {t.hero.description}
              </p>
            </AnimatedContent>
          </div>
        </section>
      ),
    },
    {
      key: "service-groups",
      type: "service-groups" as const,
      serviceGroups,
      imageSections,
    },
  ];
};

interface ServiceCardProps {
  service: {
    key: string;
    icon: React.ComponentType<any>;
    title: string;
    intro: string;
    hasSubtitle?: boolean;
    subtitle?: string;
    content: () => JSX.Element;
    isEmergency?: boolean;
  };
  expandedCards: Record<string, boolean>;
  toggleCard: (key: string) => void;
  t: Translation;
}

export const ServiceCard = ({ service, expandedCards, toggleCard, t }: ServiceCardProps) => {
  const Icon = service.icon;
  const isExpanded = expandedCards[service.key];

  return (
    <motion.div variants={fadeInUp} className="flex">
      <Card 
        className="hover-elevate flex flex-col w-full min-h-[400px]" 
        data-testid={`card-service-${service.key}`}
      >
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-xl font-heading text-primary mb-1 leading-tight">
                {service.title}
              </CardTitle>
              {service.hasSubtitle && (
                <p className="text-xs sm:text-sm text-foreground/80 font-semibold font-heading">
                  {service.subtitle}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground font-body mb-4 line-clamp-3">
            {service.intro}
          </p>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {service.content()}
            </motion.div>
          )}

          <div className="flex flex-wrap gap-3 justify-center mt-auto pt-2">
            <Button
              variant={service.isEmergency ? "destructive" : "default"}
              size="sm"
              onClick={() => {}}
              data-testid={`button-book-${service.key}`}
            >
              {t.ui.bookNow}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleCard(service.key)}
              data-testid={`button-read-more-${service.key}`}
            >
              {isExpanded ? (
                <>
                  {t.ui.showLess} <ChevronUp className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  {t.ui.readMore} <ChevronDown className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
