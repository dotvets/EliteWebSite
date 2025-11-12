import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Users, Target, Heart, Upload, Handshake } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContentWithMediaSection from "@/components/ContentWithMediaSection";
import clinicReception from "@assets/generated_images/Modern_veterinary_clinic_reception_f5464596.png";
import vetWithDog from "@assets/generated_images/Veterinarian_examining_happy_dog_46285143.png";
import vetTeam from "@assets/generated_images/Veterinary_team_collaboration_79d0e035.png";
import communityService from "@assets/generated_images/Veterinarian_community_service_animals_52a0c7de.png";
import partnership from "@assets/generated_images/Veterinary_partnership_handshake_meeting_3629c555.png";
import surgicalTeam from "@assets/generated_images/Veterinary_surgical_team_operation_82668a9f.png";
import careerDevelopment from "@assets/generated_images/Veterinarian_professional_development_learning_3d5bf9be.png";

// Animation variants for scroll animations
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Reusable animated section component
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

export default function About() {
  const { language } = useLanguage();
  const t = translations[language].about;
  const partners = translations[language].partners;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Career form validation schema
  const careerSchema = z.object({
    fullName: z.string().min(2, t.careers.validation.nameMin),
    email: z.string().email(t.careers.validation.emailInvalid),
    phone: z.string().min(8, t.careers.validation.phoneMin),
    resume: z.any().refine((files) => files?.length > 0, t.careers.validation.resumeRequired),
    coverLetter: z.string().optional(),
    position: z.string().min(1, t.careers.validation.positionRequired),
    startDate: z.string().min(1, t.careers.validation.startDateRequired),
    experience: z.string().min(1, t.careers.validation.experienceRequired),
    certifications: z.string().optional(),
    education: z.string().min(1, t.careers.validation.educationRequired),
    interests: z.string().optional(),
  });

  type CareerFormData = z.infer<typeof careerSchema>;

  const form = useForm<CareerFormData>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      coverLetter: "",
      position: "",
      startDate: "",
      experience: "",
      certifications: "",
      education: "",
      interests: "",
    },
  });

  const onSubmit = async (data: CareerFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Career application submitted:", data);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: t.careers.toast.title,
        description: t.careers.toast.description,
      });
      
      form.reset();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in career application:", error);
      setIsSubmitting(false);
    }
  };

  // Sections configuration array for side-by-side layout
  const sections = [
    {
      key: "who-we-are",
      image: clinicReception,
      imageAlt: "Elite Vet modern clinic reception",
      imageTestId: "img-clinic-reception",
      reverse: false,
      className: "bg-background",
      content: (
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary" data-testid="text-who-we-are-title">
            {t.whoWeAre.title}
          </h2>
          <p className="text-lg text-foreground/80 leading-relaxed" data-testid="text-who-we-are-description">
            {t.whoWeAre.description}
          </p>
        </motion.div>
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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <motion.div variants={fadeInUp}>
            <Card className="h-full hover-elevate" data-testid="card-vision">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl font-heading text-primary" data-testid="text-vision-title">
                    {t.vision.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 leading-relaxed" data-testid="text-vision-description">
                  {t.vision.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Card className="h-full hover-elevate" data-testid="card-mission">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-8 h-8 text-primary" />
                  <CardTitle className="text-2xl font-heading text-primary" data-testid="text-mission-title">
                    {t.mission.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 leading-relaxed" data-testid="text-mission-description">
                  {t.mission.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
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
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center lg:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4" data-testid="text-why-choose-title">
            {t.whyChoose.title}
          </h2>
          <p className="text-xl font-semibold text-foreground mb-6" data-testid="text-why-choose-subtitle">
            {t.whyChoose.subtitle}
          </p>
          <p className="text-lg text-foreground/80" data-testid="text-why-choose-description">
            {t.whyChoose.description}
          </p>
        </motion.div>
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
        <div className="space-y-8 text-center lg:text-left">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
            viewport={{ once: false, amount: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-6" data-testid="text-csr-title">
              {t.csr.title}
            </h2>
            <p className="text-lg text-foreground/80 mb-8" data-testid="text-csr-description">
              {t.csr.description}
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="space-y-6 mb-8"
          >
            {t.csr.initiatives.map((initiative, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="hover-elevate" data-testid={`card-csr-${index}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-semibold font-heading mb-2" data-testid={`text-csr-initiative-title-${index}`}>
                          {initiative.title}
                        </h3>
                        <p className="text-foreground/70 leading-relaxed" data-testid={`text-csr-initiative-description-${index}`}>
                          {initiative.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
        <div className="space-y-12 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary" data-testid="text-partners-title">
            {partners.title}
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-12"
          >
            {partners.items.map((partner, index) => (
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
          </motion.div>
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
        <div className="space-y-6 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-6" data-testid="text-doctors-title">
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
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInUp}
          viewport={{ once: false, amount: 0.3 }}
          className="space-y-6 text-center lg:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4" data-testid="text-careers-title">
            Careers
          </h2>
          <h3 className="text-2xl font-semibold font-heading mb-6" data-testid="text-careers-subtitle">
            Join Our Team
          </h3>
          <p className="text-lg text-foreground/80" data-testid="text-careers-description">
            As a leading pet clinic, we're always seeking compassionate and skilled individuals to join our dedicated team.
          </p>
        </motion.div>
      ),
    },
    {
      key: "careers-form",
      className: "bg-background",
      content: (
        <div className="space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold font-heading text-primary mb-4">
              Apply Now
            </h3>
            <p className="text-foreground/80 mb-8">
              Fill out the form below to submit your application
            </p>
          </motion.div>
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div>
                    <h4 className="text-xl font-semibold mb-4 text-primary" data-testid="text-form-personal-info">
                      {t.careers.form.personalInfo}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.careers.form.fullName}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.careers.form.fullName} {...field} data-testid="input-full-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.careers.form.email}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t.careers.form.email} {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.careers.form.phone}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.careers.form.phone} {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="resume" render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>{t.careers.form.resume}</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => onChange(e.target.files)} {...fieldProps} data-testid="input-resume" />
                              <Upload className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-4 text-primary" data-testid="text-form-position-info">
                      {t.careers.form.professionalInfo}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="position" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.careers.form.position}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.careers.form.position} {...field} data-testid="input-position" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="startDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.careers.form.startDate}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-start-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="experience" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>{t.careers.form.experience}</FormLabel>
                          <FormControl>
                            <Textarea placeholder={t.careers.form.experience} {...field} data-testid="textarea-experience" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-4 text-primary" data-testid="text-form-qualifications">
                      Qualifications
                    </h4>
                    <div className="space-y-6">
                      <FormField control={form.control} name="education" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.careers.form.education}</FormLabel>
                          <FormControl>
                            <Textarea placeholder={t.careers.form.education} {...field} data-testid="textarea-education" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="certifications" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.careers.form.certifications}</FormLabel>
                          <FormControl>
                            <Textarea placeholder={t.careers.form.certifications} {...field} data-testid="textarea-certifications" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="interests" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.careers.form.interests}</FormLabel>
                          <FormControl>
                            <Textarea placeholder={t.careers.form.interests} {...field} data-testid="textarea-interests" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="coverLetter" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.careers.form.coverLetter}</FormLabel>
                          <FormControl>
                            <Textarea placeholder={t.careers.form.coverLetter} rows={5} {...field} data-testid="textarea-cover-letter" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full" data-testid="button-submit-application">
                    {isSubmitting ? t.careers.form.submitting : t.careers.form.submit}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen" data-testid="page-about">
      <Header />
      <main className="pt-20">
      {/* Hero Section */}
      <AnimatedSection className="relative py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 text-primary" data-testid="text-about-hero-title">
            {t.hero.title}
          </h1>
        </div>
      </AnimatedSection>

      {/* Mapped Sections with Side-by-Side Layout */}
      {sections.map(({ key, content, ...sectionProps }) => (
        <ContentWithMediaSection key={key} {...sectionProps}>
          {content}
        </ContentWithMediaSection>
      ))}

      {/* Why Choose Elite Vet Cards - Centered Below */}
      <section className="bg-background pt-0 pb-20 px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {t.whyChoose.points.map((point, index) => (
              <motion.div key={index} variants={fadeInUp} className="h-full">
                <Card className="hover-elevate h-full flex flex-col" data-testid={`card-why-choose-${index}`}>
                  <CardHeader className="flex-1">
                    <div className="flex items-start gap-3 h-full">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1 overflow-hidden">
                        <CardTitle className="text-lg font-heading mb-2 leading-tight" data-testid={`text-why-choose-point-title-${index}`}>
                          {point.title}
                        </CardTitle>
                        <p className="text-sm text-foreground/70 leading-relaxed" data-testid={`text-why-choose-point-description-${index}`}>
                          {point.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
