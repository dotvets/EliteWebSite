import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { AnimatedContent } from "./AnimatedContent";

interface CareerFormTranslations {
  applyTitle: string;
  applyDescription?: string;
  form: {
    personalInfo: string;
    fullName: string;
    email: string;
    phone: string;
    resume: string;
    professionalInfo: string;
    position: string;
    startDate: string;
    experience: string;
    education: string;
    certifications: string;
    interests: string;
    coverLetter: string;
    submit: string;
    submitting: string;
  };
  validation: {
    nameMin: string;
    emailInvalid: string;
    phoneMin: string;
    resumeRequired: string;
    positionRequired: string;
    startDateRequired: string;
    experienceRequired: string;
    educationRequired: string;
  };
  toast: {
    title: string;
    description: string;
  };
  qualificationsTitle?: string;
}

interface CareerFormProps {
  translations: CareerFormTranslations;
}

export function CareerForm({ translations: t }: CareerFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const careerSchema = z.object({
    fullName: z.string().min(2, t.validation.nameMin),
    email: z.string().email(t.validation.emailInvalid),
    phone: z.string().min(8, t.validation.phoneMin),
    resume: z.any().refine((files) => files?.length > 0, t.validation.resumeRequired),
    coverLetter: z.string().optional(),
    position: z.string().min(1, t.validation.positionRequired),
    startDate: z.string().min(1, t.validation.startDateRequired),
    experience: z.string().min(1, t.validation.experienceRequired),
    certifications: z.string().optional(),
    education: z.string().min(1, t.validation.educationRequired),
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
        title: t.toast.title,
        description: t.toast.description,
      });
      
      form.reset();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in career application:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <AnimatedContent className="text-center">
        <h3 className="text-2xl font-bold font-heading text-primary mb-4">
          {t.applyTitle}
        </h3>
        {t.applyDescription && (
          <p className="text-foreground/80 mb-8">
            {t.applyDescription}
          </p>
        )}
      </AnimatedContent>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <h4 className="text-xl font-semibold mb-4 text-primary" data-testid="text-form-personal-info">
                  {t.form.personalInfo}
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.fullName}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.form.fullName} {...field} data-testid="input-full-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.email}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t.form.email} {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.phone}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.form.phone} {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="resume" render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>{t.form.resume}</FormLabel>
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
                  {t.form.professionalInfo}
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="position" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.position}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.form.position} {...field} data-testid="input-position" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.startDate}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="experience" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t.form.experience}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t.form.experience} {...field} data-testid="textarea-experience" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <div>
                {t.qualificationsTitle && (
                  <h4 className="text-xl font-semibold mb-4 text-primary" data-testid="text-form-qualifications">
                    {t.qualificationsTitle}
                  </h4>
                )}
                <div className="space-y-6">
                  <FormField control={form.control} name="education" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.education}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t.form.education} {...field} data-testid="textarea-education" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="certifications" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.certifications}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t.form.certifications} {...field} data-testid="textarea-certifications" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="interests" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.interests}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t.form.interests} {...field} data-testid="textarea-interests" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="coverLetter" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.coverLetter}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t.form.coverLetter} rows={5} {...field} data-testid="textarea-cover-letter" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full" data-testid="button-submit-application">
                {isSubmitting ? t.form.submitting : t.form.submit}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
