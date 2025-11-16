import { motion } from "framer-motion";
import { Target, Heart, Users, Handshake, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedContent } from "@/components/AnimatedContent";
import { fadeInUp } from "@/animations";
import { IconCard } from "@/components/IconCard";
import { FeatureCard } from "@/components/FeatureCard";
import { CareerForm } from "@/components/CareerForm";
import clinicReception from "@assets/freepik__clarify-attachment-photo-img1-increase-clarity-and__22061_1763027414442.png";
import vetWithDog from "@assets/Mission Section_1763032965994.png";
import vetTeam from "@assets/Why Choose Elite Vet Section_1763032965996.png";
import communityService from "@assets/generated_images/Veterinarian_community_service_animals_52a0c7de.png";
import partnership from "@assets/generated_images/Veterinary_partnership_handshake_meeting_3629c555.png";
import surgicalTeam from "@assets/generated_images/Veterinary_surgical_team_operation_82668a9f.png";
import careerDevelopment from "@assets/generated_images/Veterinarian_professional_development_learning_3d5bf9be.png";

interface Translation {
  [key: string]: any;
}

export const createAboutSections = (t: Translation, partners: Translation) => [
  {
    key: "who-we-are",
    image: clinicReception,
    imageAlt: "Elite Vet modern clinic reception",
    imageTestId: "img-clinic-reception",
    reverse: false,
    className: "bg-background",
    content: (
      <AnimatedContent className="space-y-6 text-center lg:text-start">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-who-we-are-title">
          {t.whoWeAre.title}
        </h2>
        <p className="text-lg text-foreground/80 leading-relaxed" data-testid="text-who-we-are-description">
          {t.whoWeAre.description}
        </p>
      </AnimatedContent>
    ),
  },
  {
    key: "vision-mission",
    image: vetWithDog,
    imageAlt: "Elite Vet caring for pets",
    imageTestId: "img-vet-with-dog",
    reverse: true,
    className: "bg-muted/30",
    content: (
      <AnimatedContent variant="staggerGrid" className="grid md:grid-cols-2 gap-8">
        <motion.div variants={fadeInUp}>
          <IconCard
            icon={Target}
            title={t.vision.title}
            description={t.vision.description}
            testId="card-vision"
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <IconCard
            icon={Heart}
            title={t.mission.title}
            description={t.mission.description}
            testId="card-mission"
          />
        </motion.div>
      </AnimatedContent>
    ),
  },
  {
    key: "why-choose",
    image: vetTeam,
    imageAlt: "Elite Vet professional team",
    imageTestId: "img-vet-team",
    reverse: false,
    className: "bg-background pb-8",
    content: (
      <AnimatedContent className="text-center lg:text-start">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-primary mb-4" data-testid="text-why-choose-title">
          {t.whyChoose.title}
        </h2>
        <p className="text-xl font-semibold text-foreground mb-6" data-testid="text-why-choose-subtitle">
          {t.whyChoose.subtitle}
        </p>
        <p className="text-lg text-foreground/80" data-testid="text-why-choose-description">
          {t.whyChoose.description}
        </p>
      </AnimatedContent>
    ),
  },
  {
    key: "why-choose-cards",
    className: "bg-background pt-0 pb-12 sm:pb-16 md:pb-20",
    content: (
      <AnimatedContent variant="staggerGrid" className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {t.whyChoose.points.map((point: any, index: number) => (
            <motion.div key={index} variants={fadeInUp} className="h-full">
              <FeatureCard
                title={point.title}
                description={point.description}
                icon={CheckCircle2}
                variant="compact"
                testId={`card-why-choose-${index}`}
              />
            </motion.div>
          ))}
        </div>
      </AnimatedContent>
    ),
  },
  {
    key: "csr",
    image: communityService,
    imageAlt: "Elite Vet community service",
    imageTestId: "img-community-service",
    reverse: true,
    className: "bg-muted/30",
    content: (
      <div className="space-y-8 text-center lg:text-start">
        <AnimatedContent>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-primary mb-6" data-testid="text-csr-title">
            {t.csr.title}
          </h2>
          <p className="text-lg text-foreground/80 mb-8" data-testid="text-csr-description">
            {t.csr.description}
          </p>
        </AnimatedContent>
        <AnimatedContent variant="staggerList" className="space-y-6 mb-8">
          {t.csr.initiatives.map((initiative: any, index: number) => (
            <motion.div key={index} variants={fadeInUp}>
              <FeatureCard
                title={initiative.title}
                description={initiative.description}
                testId={`card-csr-${index}`}
              />
            </motion.div>
          ))}
        </AnimatedContent>
        <p className="text-foreground/80 italic" data-testid="text-csr-closing">
          {t.csr.closing}
        </p>
      </div>
    ),
  },
  {
    key: "partners",
    image: partnership,
    imageAlt: "Elite Vet partnerships",
    imageTestId: "img-partnership",
    reverse: false,
    className: "bg-background",
    content: (
      <div className="space-y-12 text-center lg:text-start">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-primary" data-testid="text-partners-title">
          {partners.title}
        </h2>
        <AnimatedContent variant="staggerGrid" className="grid md:grid-cols-2 gap-12">
          {partners.items.map((partner: string, index: number) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="hover-elevate" data-testid={`card-partner-${index}`}>
                <CardContent className="pt-12 pb-12">
                  <div className="flex flex-col items-center gap-4">
                    <Handshake className="w-16 h-16 text-primary" />
                    <h3 className="text-2xl font-bold font-heading text-center" data-testid={`text-partner-name-${index}`}>
                      {partner}
                    </h3>
                    <p className="text-sm text-foreground/60 text-center italic">Logo coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatedContent>
      </div>
    ),
  },
  {
    key: "doctors",
    image: surgicalTeam,
    imageAlt: "Elite Vet surgical expertise",
    imageTestId: "img-surgical-team",
    reverse: true,
    className: "bg-muted/30",
    content: (
      <div className="space-y-6 text-center lg:text-start">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-primary mb-6" data-testid="text-doctors-title">
          {t.ourDoctors.title}
        </h2>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-lg text-foreground/80 leading-relaxed mb-4" data-testid="text-doctors-description">
              {t.ourDoctors.description}
            </p>
            <p className="text-lg text-foreground/80 leading-relaxed" data-testid="text-doctors-surgeons">
              {t.ourDoctors.surgeons}
            </p>
          </CardContent>
        </Card>
        <div className="text-center text-foreground/60">
          <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
          <p className="italic">Doctor profiles coming soon</p>
        </div>
      </div>
    ),
  },
  {
    key: "careers-intro",
    image: careerDevelopment,
    imageAlt: "Elite Vet career opportunities",
    imageTestId: "img-career-development",
    reverse: true,
    className: "bg-muted/30",
    content: (
      <AnimatedContent className="space-y-6 text-center lg:text-start">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-primary mb-4" data-testid="text-careers-title">
          {t.careers.title}
        </h2>
        <h3 className="text-2xl font-semibold font-heading mb-6" data-testid="text-careers-subtitle">
          {t.careers.subtitle}
        </h3>
        <p className="text-lg text-foreground/80" data-testid="text-careers-description">
          {t.careers.description}
        </p>
      </AnimatedContent>
    ),
  },
  {
    key: "careers-form",
    className: "bg-background",
    content: <CareerForm translations={t.careers} />,
  },
];
