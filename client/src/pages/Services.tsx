import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Helper function to render service list
  const renderServiceList = (services: Array<{ title: string; description: string }>) => (
    <div className="space-y-4">
      {services.map((service, index) => (
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
  );

  // Helper function to render why choose bullet points
  const renderWhyChoose = (whyChoose: { title: string; points: Array<{ title: string; description: string }> }) => (
    <div className="mb-6">
      <h4 className="font-semibold text-foreground mb-4 font-heading">
        {whyChoose.title}
      </h4>
      <ul className="space-y-3">
        {whyChoose.points.map((point, index) => (
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
  );

  // Sections configuration array
  const sections = [
    {
      key: "medical-specialties",
      image: medicalSpecialtiesImg,
      imageAlt: "Medical specialties examination",
      imageTestId: "img-medical-specialties",
      reverse: false,
      className: "bg-background",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-medical-specialties-title">
            {t.medicalSpecialties.title}
          </h2>
          <h3 className="text-lg sm:text-xl font-semibold font-heading text-foreground" data-testid="text-medical-specialties-subtitle">
            {t.medicalSpecialties.subtitle}
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.medicalSpecialties.intro}
          </p>
          {renderServiceList(t.medicalSpecialties.services)}
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-medical-specialties-cta">
              {t.medicalSpecialties.cta}
            </Button>
          </Link>
        </motion.div>
      ),
    },
    {
      key: "hygiene-care",
      image: hygieneImg,
      imageAlt: "Pet grooming and hygiene care",
      imageTestId: "img-hygiene-care",
      reverse: true,
      className: "bg-muted/30",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-hygiene-care-title">
            {t.hygieneCare.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.hygieneCare.intro}
          </p>
          {renderWhyChoose(t.hygieneCare.whyChoose)}
          {renderServiceList(t.hygieneCare.services)}
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-hygiene-care-cta">
              {t.hygieneCare.cta}
            </Button>
          </Link>
        </motion.div>
      ),
    },
    {
      key: "diagnostic-tests",
      image: diagnosticImg,
      imageAlt: "Veterinary diagnostic testing",
      imageTestId: "img-diagnostic-tests",
      reverse: false,
      className: "bg-background",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-diagnostic-tests-title">
            {t.diagnosticTests.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.diagnosticTests.intro}
          </p>
          {renderWhyChoose(t.diagnosticTests.whyChoose)}
          {renderServiceList(t.diagnosticTests.services)}
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-diagnostic-tests-cta">
              {t.diagnosticTests.cta}
            </Button>
          </Link>
        </motion.div>
      ),
    },
    {
      key: "medical-surgeries",
      image: surgeryImg,
      imageAlt: "Veterinary surgical procedures",
      imageTestId: "img-medical-surgeries",
      reverse: true,
      className: "bg-muted/30",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-medical-surgeries-title">
            {t.medicalSurgeries.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.medicalSurgeries.intro}
          </p>
          {renderWhyChoose(t.medicalSurgeries.whyChoose)}
          {renderServiceList(t.medicalSurgeries.services)}
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-medical-surgeries-cta">
              {t.medicalSurgeries.cta}
            </Button>
          </Link>
        </motion.div>
      ),
    },
    {
      key: "dental-services",
      image: dentalImg,
      imageAlt: "Pet dental care services",
      imageTestId: "img-dental-services",
      reverse: false,
      className: "bg-background",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-dental-services-title">
            {t.dentalServices.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.dentalServices.intro}
          </p>
          {renderWhyChoose(t.dentalServices.whyChoose)}
          {renderServiceList(t.dentalServices.services)}
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-dental-services-cta">
              {t.dentalServices.cta}
            </Button>
          </Link>
        </motion.div>
      ),
    },
    {
      key: "vaccinations",
      image: vaccinationImg,
      imageAlt: "Pet vaccination services",
      imageTestId: "img-vaccinations",
      reverse: true,
      className: "bg-muted/30",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-vaccinations-title">
            {t.vaccinations.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.vaccinations.intro}
          </p>
          <p className="text-base text-muted-foreground font-body">
            {t.vaccinations.whyVaccinate}
          </p>
          {renderServiceList(t.vaccinations.services)}
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-vaccinations-cta">
              {t.vaccinations.cta}
            </Button>
          </Link>
        </motion.div>
      ),
    },
    {
      key: "pet-travel",
      image: travelImg,
      imageAlt: "Pet travel procedures",
      imageTestId: "img-pet-travel",
      reverse: false,
      className: "bg-background",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-pet-travel-title">
            {t.petTravel.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.petTravel.intro}
          </p>
          {renderServiceList(t.petTravel.services)}
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-pet-travel-cta">
              {t.petTravel.cta}
            </Button>
          </Link>
        </motion.div>
      ),
    },
    {
      key: "boarding",
      image: boardingImg,
      imageAlt: "Pet boarding services",
      imageTestId: "img-boarding",
      reverse: true,
      className: "bg-muted/30",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-boarding-title">
            {t.boarding.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.boarding.intro}
          </p>
          {renderServiceList(t.boarding.services)}
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-boarding-cta">
              {t.boarding.cta}
            </Button>
          </Link>
        </motion.div>
      ),
    },
    {
      key: "intensive-care",
      image: intensiveCareImg,
      imageAlt: "Intensive care services",
      imageTestId: "img-intensive-care",
      reverse: false,
      className: "bg-background",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-intensive-care-title">
            {t.intensiveCare.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.intensiveCare.intro}
          </p>
          {renderServiceList(t.intensiveCare.services)}
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-intensive-care-cta">
              {t.intensiveCare.cta}
            </Button>
          </Link>
        </motion.div>
      ),
    },
    {
      key: "emergency",
      image: emergencyImg,
      imageAlt: "Emergency veterinary services",
      imageTestId: "img-emergency",
      reverse: true,
      className: "bg-muted/30",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-emergency-title">
            {t.emergency.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.emergency.intro}
          </p>
          {renderServiceList(t.emergency.services)}
          <Button variant="destructive" className="mt-8" data-testid="button-emergency-cta">
            {t.emergency.cta}
          </Button>
        </motion.div>
      ),
    },
    {
      key: "home-care",
      image: homeCareImg,
      imageAlt: "Home care veterinary services",
      imageTestId: "img-home-care",
      reverse: false,
      className: "bg-background",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-start"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-home-care-title">
            {t.homeCare.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {t.homeCare.intro}
          </p>
          {renderServiceList(t.homeCare.services)}
          <Link href="/contact">
            <Button className="mt-8" data-testid="button-home-care-cta">
              {t.homeCare.cta}
            </Button>
          </Link>
        </motion.div>
      ),
    },
  ];

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
            {t.categories.map((category) => {
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

      {/* Service Detail Sections */}
      {sections.map(({ key, image, imageAlt, imageTestId, reverse, className, content }) => {
        const sectionProps = {
          image,
          imageAlt,
          imageTestId,
          reverse,
          className,
        };

        return (
          <div key={key} id={key}>
            <ContentWithMediaSection {...sectionProps}>
              {content}
            </ContentWithMediaSection>
          </div>
        );
      })}
    </PageLayout>
  );
}
