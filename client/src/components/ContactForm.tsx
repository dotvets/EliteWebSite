import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ContactFormData = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

type ContactFormProps = {
  translations: {
    form: {
      name: string;
      namePlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      sending: string;
    };
    validation: {
      nameMin: string;
      phoneMin: string;
      emailInvalid: string;
      messageMin: string;
    };
    toast: {
      title: string;
      description: string;
      errorTitle: string;
      errorDescription: string;
    };
  };
};

const WEB3FORMS_ACCESS_KEY = "2eeabe96-20f3-4b1d-86e1-ee0a7a2e7784";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export function ContactForm({ translations: t }: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactSchema = useMemo(() => z.object({
    name: z.string().min(2, t.validation.nameMin),
    phone: z.string().min(8, t.validation.phoneMin),
    email: z.string().email(t.validation.emailInvalid),
    message: z.string().min(10, t.validation.messageMin),
  }), [t.validation]);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  useEffect(() => {
    form.clearErrors();
  }, [contactSchema, form]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("access_key", WEB3FORMS_ACCESS_KEY);
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      formData.append("message", data.message);
      const payload = { ...Object.fromEntries(formData.entries()), access_key: WEB3FORMS_ACCESS_KEY };

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
      console.error("Error in form submission:", error);
      toast({
        variant: "destructive",
        title: t.toast.errorTitle,
        description: t.toast.errorDescription,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t.form.name}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t.form.namePlaceholder}
                  data-testid="input-name"
                  {...field}
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
              <FormLabel className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t.form.phone}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t.form.phonePlaceholder}
                  data-testid="input-phone"
                  {...field}
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
              <FormLabel className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t.form.email}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t.form.emailPlaceholder}
                  data-testid="input-email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {t.form.message}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.form.messagePlaceholder}
                  rows={5}
                  data-testid="input-message"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          data-testid="button-submit"
        >
          {isSubmitting ? t.form.sending : t.form.submit}
        </Button>
      </form>
    </Form>
  );
}
