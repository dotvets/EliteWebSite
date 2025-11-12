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
import pawPrintPattern from "@assets/Paw Print Background Pattern_1762871879512.jpg";
import freepikPaw from "@assets/freepik__img1i-want-you-to-make-the-attached-image-more-bea__64912_1762857524224.png";
import petImage from "@assets/SL-011023-55240-04_1762871665658.jpg";
import clinicImage from "@assets/77afe717-52e7-4cfd-b4e7-6abfd4ad9720_1762874109941.jpg";

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

  return (
    <div className="min-h-screen" data-testid="page-about">
      <Header />
      <main className="pt-20 pb-[450px]">
      {/* Hero Section */}
      <AnimatedSection className="relative bg-primary text-white py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6" data-testid="text-about-hero-title">
            {t.hero.title}
          </h1>
        </div>
      </AnimatedSection>

      {/* Decorative Divider - Paw Pattern */}
      <figure className="w-full my-12 lg:my-20 opacity-20" data-testid="image-divider-hero">
        <img src={pawPrintPattern} alt="" aria-hidden="true" className="w-full h-32 object-cover" />
      </figure>

      {/* Who We Are Section */}
      <AnimatedSection className="py-20 px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-8 text-center" data-testid="text-who-we-are-title">
            {t.whoWeAre.title}
          </h2>
          <p className="text-lg text-foreground/80 leading-relaxed text-center max-w-4xl mx-auto" data-testid="text-who-we-are-description">
            {t.whoWeAre.description}
          </p>
        </div>
      </AnimatedSection>

      {/* Decorative Divider - Paw Right */}
      <figure className="flex justify-center lg:justify-end my-12 lg:my-20 px-6" data-testid="image-divider-who-we-are">
        <img 
          src={freepikPaw} 
          alt="" 
          aria-hidden="true" 
          className="w-40 sm:w-48 lg:max-w-sm h-40 lg:h-56 object-contain rounded-xl shadow-sm"
        />
      </figure>

      {/* Vision & Mission Section */}
      <AnimatedSection className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
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
        </div>
      </AnimatedSection>

      {/* Decorative Divider - Paw Left */}
      <figure className="flex justify-center lg:justify-start my-12 lg:my-20 px-6" data-testid="image-divider-vision-mission">
        <img 
          src={freepikPaw} 
          alt="" 
          aria-hidden="true" 
          className="w-40 sm:w-48 lg:max-w-sm h-40 lg:h-56 object-contain rounded-xl shadow-sm"
        />
      </figure>

      {/* Why Choose Us Section */}
      <AnimatedSection className="py-20 px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4 text-center" data-testid="text-why-choose-title">
            {t.whyChoose.title}
          </h2>
          <p className="text-xl font-semibold text-foreground mb-6 text-center" data-testid="text-why-choose-subtitle">
            {t.whyChoose.subtitle}
          </p>
          <p className="text-lg text-foreground/80 mb-8 text-center" data-testid="text-why-choose-description">
            {t.whyChoose.description}
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {t.whyChoose.points.map((point, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="hover-elevate" data-testid={`card-why-choose-${index}`}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <CardTitle className="text-xl font-heading mb-2" data-testid={`text-why-choose-point-title-${index}`}>
                          {point.title}
                        </CardTitle>
                        <p className="text-foreground/70" data-testid={`text-why-choose-point-description-${index}`}>
                          {point.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Decorative Divider - Pet Image Centered */}
      <figure className="flex justify-center my-12 lg:my-20 px-6" data-testid="image-divider-why-choose">
        <img 
          src={petImage} 
          alt="Elite Vet professional care" 
          className="w-full max-w-[320px] sm:max-w-[420px] lg:max-w-lg h-48 lg:h-64 object-cover rounded-xl shadow-sm"
        />
      </figure>

      {/* Corporate Social Responsibility Section */}
      <AnimatedSection className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-6 text-center" data-testid="text-csr-title">
            {t.csr.title}
          </h2>
          <p className="text-lg text-foreground/80 mb-8 text-center max-w-4xl mx-auto" data-testid="text-csr-description">
            {t.csr.description}
          </p>

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

          <p className="text-center text-foreground/80 italic" data-testid="text-csr-closing">
            {t.csr.closing}
          </p>
        </div>
      </AnimatedSection>

      {/* Decorative Divider - Pet Image Centered */}
      <figure className="flex justify-center my-12 lg:my-20 px-6" data-testid="image-divider-csr">
        <img 
          src={petImage} 
          alt="Elite Vet community care" 
          className="w-full max-w-[320px] sm:max-w-[420px] lg:max-w-lg h-48 lg:h-64 object-cover rounded-xl shadow-sm"
        />
      </figure>

      {/* Our Partners Section */}
      <AnimatedSection className="py-20 px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-12 text-center" data-testid="text-partners-title">
            {partners.title}
          </h2>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto"
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
      </AnimatedSection>

      {/* Decorative Divider - Clinic Image */}
      <figure className="flex justify-center my-12 lg:my-20 px-6" data-testid="image-divider-partners">
        <img 
          src={clinicImage} 
          alt="Elite Vet clinic facility" 
          className="w-full max-w-md h-40 lg:h-56 object-cover rounded-xl shadow-sm"
        />
      </figure>

      {/* Our Doctors Section */}
      <AnimatedSection className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-6 text-center" data-testid="text-doctors-title">
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
      </AnimatedSection>

      {/* Decorative Divider - Clinic Image */}
      <figure className="flex justify-center my-12 lg:my-20 px-6" data-testid="image-divider-doctors">
        <img 
          src={clinicImage} 
          alt="Elite Vet team" 
          className="w-full max-w-md h-40 lg:h-56 object-cover rounded-xl shadow-sm"
        />
      </figure>

      {/* Careers Section */}
      <AnimatedSection className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4 text-center" data-testid="text-careers-title">
            {t.careers.title}
          </h2>
          <h3 className="text-2xl font-semibold font-heading mb-6 text-center" data-testid="text-careers-subtitle">
            {t.careers.subtitle}
          </h3>
          <p className="text-lg text-foreground/80 mb-12 text-center" data-testid="text-careers-description">
            {t.careers.description}
          </p>

          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-xl font-semibold mb-4 text-primary" data-testid="text-form-personal-info">
                      {t.careers.form.personalInfo}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.careers.form.fullName}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t.careers.form.fullNamePlaceholder}
                                data-testid="input-fullname"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.careers.form.email}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder={t.careers.form.emailPlaceholder}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.careers.form.phone}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                placeholder={t.careers.form.phonePlaceholder}
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h4 className="text-xl font-semibold mb-4 text-primary" data-testid="text-form-professional-info">
                      {t.careers.form.professionalInfo}
                    </h4>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="resume"
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>{t.careers.form.resume}</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-4">
                                <Input
                                  {...field}
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => onChange(e.target.files)}
                                  data-testid="input-resume"
                                />
                                <Upload className="w-5 h-5 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="coverLetter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.careers.form.coverLetter}</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={t.careers.form.coverLetterPlaceholder}
                                rows={4}
                                data-testid="input-coverletter"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.careers.form.position}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={t.careers.form.positionPlaceholder}
                                  data-testid="input-position"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.careers.form.startDate}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="date"
                                  data-testid="input-startdate"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.careers.form.experience}</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={t.careers.form.experiencePlaceholder}
                                rows={3}
                                data-testid="input-experience"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.careers.form.certifications}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t.careers.form.certificationsPlaceholder}
                                data-testid="input-certifications"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.careers.form.education}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t.careers.form.educationPlaceholder}
                                data-testid="input-education"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.careers.form.interests}</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={t.careers.form.interestsPlaceholder}
                                rows={2}
                                data-testid="input-interests"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                    data-testid="button-submit-application"
                  >
                    {isSubmitting ? t.careers.form.submitting : t.careers.form.submit}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>
      </main>
      <Footer />
    </div>
  );
}
