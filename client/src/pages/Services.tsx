import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Stethoscope, 
  Scissors, 
  FlaskConical, 
  Syringe,
  Pill,
  Heart,
  Plane,
  Home,
  Activity,
  Phone,
  Ambulance,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import ContentWithMediaSection from "@/components/ContentWithMediaSection";
import PageLayout from "@/components/PageLayout";
import heroBackgroundImg from "@assets/freepik__img1-make-the-background-fully-white-remove-all-wa__83840_1763049774720.png";
import medicalSpecialtiesImg from "@assets/stock_images/veterinarian_examini_bffcd340.jpg";
import surgeryImg from "@assets/stock_images/veterinary_surgery_o_7559b1f2.jpg";
import diagnosticImg from "@assets/stock_images/veterinary_diagnosti_473733b0.jpg";
import emergencyImg from "@assets/stock_images/emergency_veterinary_541ad7b5.jpg";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Service category icons mapping
const categoryIcons: Record<string, React.ComponentType<any>> = {
  "medical-specialties": Stethoscope,
  "hygiene-care": Scissors,
  "diagnostic-tests": FlaskConical,
  "medical-surgeries": Activity,
  "dental-services": Syringe,
  "vaccinations": Pill,
  "pet-travel": Plane,
  "boarding": Home,
  "intensive-care": Heart,
  "emergency": Ambulance,
  "home-care": Phone,
};

export default function Services() {
  const { language } = useLanguage();
  const t = translations[language].servicesPage;
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (key: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper function to render service list
  const renderServiceList = (services: Array<{ title: string; description: string }>) => (
    <div className="space-y-3 mt-4">
      {services.map((service, index) => (
        <div key={index} className="border-l-4 border-l-primary pl-3">
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

  // Helper function to render why choose bullet points
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

  // Service cards configuration
  const serviceCards = [
    {
      key: "medical-specialties",
      icon: Stethoscope,
      title: t.medicalSpecialties.title,
      intro: t.medicalSpecialties.intro,
      hasSubtitle: true,
      subtitle: t.medicalSpecialties.subtitle,
      content: () => renderServiceList(t.medicalSpecialties.services),
    },
    {
      key: "hygiene-care",
      icon: Scissors,
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
      icon: FlaskConical,
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
      icon: Activity,
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
      icon: Syringe,
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
      icon: Pill,
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
      icon: Plane,
      title: t.petTravel.title,
      intro: t.petTravel.intro,
      content: () => renderServiceList(t.petTravel.services),
    },
    {
      key: "boarding",
      icon: Home,
      title: t.boarding.title,
      intro: t.boarding.intro,
      content: () => renderServiceList(t.boarding.services),
    },
    {
      key: "intensive-care",
      icon: Heart,
      title: t.intensiveCare.title,
      intro: t.intensiveCare.intro,
      content: () => renderServiceList(t.intensiveCare.services),
    },
    {
      key: "emergency",
      icon: Ambulance,
      title: t.emergency.title,
      intro: t.emergency.intro,
      isEmergency: true,
      content: () => renderServiceList(t.emergency.services),
    },
    {
      key: "home-care",
      icon: Phone,
      title: t.homeCare.title,
      intro: t.homeCare.intro,
      content: () => renderServiceList(t.homeCare.services),
    },
  ];

  // Group services into chunks of 3
  const serviceGroups = [
    serviceCards.slice(0, 3),  // Group 1: indices 0-2
    serviceCards.slice(3, 6),  // Group 2: indices 3-5
    serviceCards.slice(6, 9),  // Group 3: indices 6-8
    serviceCards.slice(9, 11), // Group 4: indices 9-10
  ];

  // Image sections to place between groups
  const imageSections = [
    {
      image: medicalSpecialtiesImg,
      imageAlt: "Elite Vet medical specialties",
      imageTestId: "img-section-medical",
      reverse: false,
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-4 text-center lg:text-start"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-primary">
            Advanced Medical Care
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            Our state-of-the-art facilities and experienced veterinary team provide comprehensive medical care for all your pet's needs. From routine check-ups to specialized treatments, we're here to ensure your pet's health and happiness.
          </p>
        </motion.div>
      ),
    },
    {
      image: surgeryImg,
      imageAlt: "Surgical procedures at Elite Vet",
      imageTestId: "img-section-surgery",
      reverse: true,
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-4 text-center lg:text-start"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-primary">
            Expert Surgical Services
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            With cutting-edge surgical equipment and highly trained surgeons, we perform a wide range of procedures with precision and care. Your pet's safety and comfort are our top priorities throughout the entire surgical process.
          </p>
        </motion.div>
      ),
    },
    {
      image: diagnosticImg,
      imageAlt: "Diagnostic services",
      imageTestId: "img-section-diagnostic",
      reverse: false,
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-4 text-center lg:text-start"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-primary">
            24/7 Emergency & Care
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            Emergencies don't wait for business hours. Our round-the-clock emergency services ensure your pet receives immediate care when they need it most. Whether at our clinic or in the comfort of your home, we're always ready to help.
          </p>
        </motion.div>
      ),
    },
  ];

  return (
    <PageLayout>
      {/* Hero Section with Background Image */}
      <section 
        className="relative py-20 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: `url(${heroBackgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />
        
        <div className="relative z-10 max-w-7xl mx-auto overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white mb-6 drop-shadow-lg"
              data-testid="text-services-hero-title"
            >
              {t.hero.title}
            </h1>
            <p
              className="text-lg sm:text-xl text-white/90 font-body drop-shadow-md"
              data-testid="text-services-hero-description"
            >
              {t.hero.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Groups with Image Sections Between */}
      <div className="py-12 sm:py-16 md:py-20">
        {serviceGroups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`}>
            {/* Service Cards Grid */}
            <section className="px-4 sm:px-6 lg:px-8 mb-12">
              <div className="max-w-7xl mx-auto overflow-x-hidden">
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {group.map((service) => {
                    const Icon = service.icon;
                    const isExpanded = expandedCards[service.key];

                    return (
                      <motion.div key={service.key} variants={fadeInUp} className="flex">
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

                            {/* Expandable Content */}
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

                            {/* Action Buttons - pushed to bottom */}
                            <div className="flex flex-wrap gap-3 mt-auto pt-4">
                              <Button
                                variant={service.isEmergency ? "destructive" : "default"}
                                size="sm"
                                onClick={() => {}}
                                data-testid={`button-book-${service.key}`}
                              >
                                Book Now
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleCard(service.key)}
                                data-testid={`button-read-more-${service.key}`}
                              >
                                {isExpanded ? (
                                  <>
                                    Show Less <ChevronUp className="ml-2 w-4 h-4" />
                                  </>
                                ) : (
                                  <>
                                    Read More <ChevronDown className="ml-2 w-4 h-4" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </section>

            {/* Image Section Between Groups (except after last group) */}
            {groupIndex < serviceGroups.length - 1 && imageSections[groupIndex] && (
              <div className="mb-12">
                <ContentWithMediaSection
                  image={imageSections[groupIndex].image}
                  imageAlt={imageSections[groupIndex].imageAlt}
                  imageTestId={imageSections[groupIndex].imageTestId}
                  reverse={imageSections[groupIndex].reverse}
                  className="bg-muted/30"
                >
                  {imageSections[groupIndex].content}
                </ContentWithMediaSection>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
