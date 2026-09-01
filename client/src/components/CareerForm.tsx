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
    errorTitle: string;
    errorDescription: string;
  };
  qualificationsTitle?: string;
}

const WEB3FORMS_ACCESS_KEY = "69bdf1b9-18fe-4870-bf80-a2e98a17ad5f";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

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

      // collect every form field via FormData, then convert to a plain JSON object
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("position", data.position);
      formData.append("startDate", data.startDate);
      formData.append("experience", data.experience);
      formData.append("education", data.education);
      formData.append("certifications", data.certifications || "");
      formData.append("interests", data.interests || "");
      formData.append("coverLetter", data.coverLetter || "");
      const payload: Record<string, any> = Object.fromEntries(formData.entries());

      // keep the CV in the payload: base64 data URL (JSON-safe), with the original filename
      const resumeFile = (data.resume as FileList | undefined)?.[0];
      if (resumeFile) {
        payload.resume_filename = resumeFile.name;
        if (resumeFile.size <= 3_000_000) {
          payload.resume = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("read_failed"));
            reader.readAsDataURL(resumeFile);
          });
        } else {
          payload.resume = `(file too large to attach: ${resumeFile.name})`;
        }
      }

      payload.access_key = WEB3FORMS_ACCESS_KEY;

      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: t.toast.title,
          description: t.toast.description,
        });
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: t.toast.errorTitle,
          description: t.toast.errorDescription,
        });
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in career application:", error);
      toast({
        variant: "destructive",
        title: t.toast.errorTitle,
        description: t.toast.errorDescription,
      });
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
