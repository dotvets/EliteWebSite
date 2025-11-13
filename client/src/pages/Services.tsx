import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
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
  Ambulance
} from "lucide-react";
import ContentWithMediaSection from "@/components/ContentWithMediaSection";
import PageLayout from "@/components/PageLayout";
import medicalSpecialtiesImg from "@assets/stock_images/veterinarian_examini_bffcd340.jpg";
import hygieneImg from "@assets/stock_images/pet_grooming_dog_bat_77573a81.jpg";
import diagnosticImg from "@assets/stock_images/veterinary_diagnosti_473733b0.jpg";
import surgeryImg from "@assets/stock_images/veterinary_surgery_o_7559b1f2.jpg";
import dentalImg from "@assets/stock_images/pet_dental_care_vete_6168a09a.jpg";
import vaccinationImg from "@assets/stock_images/veterinarian_giving__66cd457f.jpg";
import travelImg from "@assets/stock_images/pet_travel_carrier_a_376c48b3.jpg";
import boardingImg from "@assets/stock_images/pet_boarding_kennel__17ee1fe9.jpg";
import intensiveCareImg from "@assets/stock_images/veterinary_intensive_87e36231.jpg";
import emergencyImg from "@assets/stock_images/emergency_veterinary_541ad7b5.jpg";
import homeCareImg from "@assets/stock_images/veterinarian_home_vi_415d8662.jpg";

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

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Services() {
  const { language } = useLanguage();
  const t = translations[language].servicesPage;

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-primary mb-6"
              data-testid="text-services-hero-title"
            >
              {t.hero.title}
            </h1>
            <p
              className="text-lg sm:text-xl text-muted-foreground font-body"
              data-testid="text-services-hero-description"
            >
              {t.hero.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto overflow-x-hidden">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {t.categories.map((category, index) => {
              const Icon = categoryIcons[category.id];
              return (
                <motion.div key={category.id} variants={fadeInUp}>
                  <Card
                    className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full"
                    onClick={() => scrollToSection(category.id)}
                    data-testid={`card-service-${category.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {Icon && <Icon className="w-6 h-6 text-primary" />}
                        </div>
                        <CardTitle className="text-lg font-heading text-foreground">
                          {category.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Medical Specialties Section */}
      <div id="medical-specialties">
        <ContentWithMediaSection
          title={t.medicalSpecialties.title}
          subtitle={t.medicalSpecialties.subtitle}
          image={medicalSpecialtiesImg}
          imagePosition="right"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.medicalSpecialties.intro}
          </p>
          <div className="space-y-4">
            {t.medicalSpecialties.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-medical-specialties-cta">
              {t.medicalSpecialties.cta}
            </Button>
          </Link>
        </ContentWithMediaSection>
      </div>

      {/* Hygiene & Appearance Care Section */}
      <div id="hygiene-care">
        <ContentWithMediaSection
          title={t.hygieneCare.title}
          image={hygieneImg}
          imagePosition="left"
          className="bg-muted/30"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.hygieneCare.intro}
          </p>
          
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-4 font-heading">
              {t.hygieneCare.whyChoose.title}
            </h4>
            <ul className="space-y-3">
              {t.hygieneCare.whyChoose.points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <div>
                    <span className="font-semibold text-foreground">{point.title}:</span>{" "}
                    <span className="text-muted-foreground font-body">{point.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {t.hygieneCare.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-hygiene-care-cta">
              {t.hygieneCare.cta}
            </Button>
          </Link>
        </ContentWithMediaSection>
      </div>

      {/* Diagnostic Tests Section */}
      <div id="diagnostic-tests">
        <ContentWithMediaSection
          title={t.diagnosticTests.title}
          image={diagnosticImg}
          imagePosition="right"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.diagnosticTests.intro}
          </p>
          
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-4 font-heading">
              {t.diagnosticTests.whyChoose.title}
            </h4>
            <ul className="space-y-3">
              {t.diagnosticTests.whyChoose.points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <div>
                    <span className="font-semibold text-foreground">{point.title}:</span>{" "}
                    <span className="text-muted-foreground font-body">{point.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {t.diagnosticTests.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-diagnostic-tests-cta">
              {t.diagnosticTests.cta}
            </Button>
          </Link>
        </ContentWithMediaSection>
      </div>

      {/* Medical Surgeries Section */}
      <div id="medical-surgeries">
        <ContentWithMediaSection
          title={t.medicalSurgeries.title}
          image={surgeryImg}
          imagePosition="left"
          className="bg-muted/30"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.medicalSurgeries.intro}
          </p>
          
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-4 font-heading">
              {t.medicalSurgeries.whyChoose.title}
            </h4>
            <ul className="space-y-3">
              {t.medicalSurgeries.whyChoose.points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <div>
                    <span className="font-semibold text-foreground">{point.title}:</span>{" "}
                    <span className="text-muted-foreground font-body">{point.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {t.medicalSurgeries.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-medical-surgeries-cta">
              {t.medicalSurgeries.cta}
            </Button>
          </Link>
        </ContentWithMediaSection>
      </div>

      {/* Dental Services Section */}
      <div id="dental-services">
        <ContentWithMediaSection
          title={t.dentalServices.title}
          image={dentalImg}
          imagePosition="right"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.dentalServices.intro}
          </p>
          
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-4 font-heading">
              {t.dentalServices.whyChoose.title}
            </h4>
            <ul className="space-y-3">
              {t.dentalServices.whyChoose.points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">●</span>
                  <div>
                    <span className="font-semibold text-foreground">{point.title}:</span>{" "}
                    <span className="text-muted-foreground font-body">{point.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {t.dentalServices.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-dental-services-cta">
              {t.dentalServices.cta}
            </Button>
          </Link>
        </ContentWithMediaSection>
      </div>

      {/* Vaccinations Section */}
      <div id="vaccinations">
        <ContentWithMediaSection
          title={t.vaccinations.title}
          image={vaccinationImg}
          imagePosition="left"
          className="bg-muted/30"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.vaccinations.intro}
          </p>
          <p className="text-base text-muted-foreground mb-6 font-body">
            {t.vaccinations.whyVaccinate}
          </p>
          <div className="space-y-4">
            {t.vaccinations.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-vaccinations-cta">
              {t.vaccinations.cta}
            </Button>
          </Link>
        </ContentWithMediaSection>
      </div>

      {/* Pet Travel Section */}
      <div id="pet-travel">
        <ContentWithMediaSection
          title={t.petTravel.title}
          image={travelImg}
          imagePosition="right"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.petTravel.intro}
          </p>
          <div className="space-y-4">
            {t.petTravel.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-pet-travel-cta">
              {t.petTravel.cta}
            </Button>
          </Link>
        </ContentWithMediaSection>
      </div>

      {/* Boarding Services Section */}
      <div id="boarding">
        <ContentWithMediaSection
          title={t.boarding.title}
          image={boardingImg}
          imagePosition="left"
          className="bg-muted/30"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.boarding.intro}
          </p>
          <div className="space-y-4">
            {t.boarding.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-boarding-cta">
              {t.boarding.cta}
            </Button>
          </Link>
        </ContentWithMediaSection>
      </div>

      {/* Intensive Care Section */}
      <div id="intensive-care">
        <ContentWithMediaSection
          title={t.intensiveCare.title}
          image={intensiveCareImg}
          imagePosition="right"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.intensiveCare.intro}
          </p>
          <div className="space-y-4">
            {t.intensiveCare.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-intensive-care-cta">
              {t.intensiveCare.cta}
            </Button>
          </Link>
        </ContentWithMediaSection>
      </div>

      {/* Emergency Services Section */}
      <div id="emergency">
        <ContentWithMediaSection
          title={t.emergency.title}
          image={emergencyImg}
          imagePosition="left"
          className="bg-muted/30"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.emergency.intro}
          </p>
          <div className="space-y-4">
            {t.emergency.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Button variant="destructive" className="mt-8" data-testid="button-emergency-cta">
            {t.emergency.cta}
          </Button>
        </ContentWithMediaSection>
      </div>

      {/* Home Care Services Section */}
      <div id="home-care">
        <ContentWithMediaSection
          title={t.homeCare.title}
          image={homeCareImg}
          imagePosition="right"
        >
          <p className="text-base sm:text-lg text-muted-foreground mb-6 font-body">
            {t.homeCare.intro}
          </p>
          <div className="space-y-4">
            {t.homeCare.services.map((service, index) => (
              <div key={index} className="border-l-4 border-l-primary pl-4">
                <h4 className="font-semibold text-foreground mb-2 font-heading">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-home-care-cta">
              {t.homeCare.cta}
            </Button>
          </Link>
        </ContentWithMediaSection>
      </div>
    </PageLayout>
  );
}
